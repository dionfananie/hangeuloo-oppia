// api/auth.ts — Worker OAuth + session, mirip Tolk (zero-hono fetch router).
// Endpoint:
//   GET  /api/auth/google           → redirect ke consent Google (returnTo)
//   GET  /api/auth/google/callback  → tukar code, upsert user, set cookie, redirect
//   GET  /api/auth/me               → user saat ini atau null
//   POST /api/auth/logout           → hapus sesi & cookie
// Sesi memakai cookie HttpOnly + tabel `sessions` (lihat workers/lib/session.ts).

import {
	createSession,
	getSessionUser,
	destroySession,
	setSessionCookie,
	clearSessionCookie,
} from "../lib/session";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_SCOPE = "openid email profile";

const json = (data: unknown, status = 200): Response =>
	new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json" },
	});

async function genState(): Promise<string> {
	const arr = new Uint8Array(24);
	crypto.getRandomValues(arr);
	return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Akses terbatas yang dipakai handler. */
type EnvLike = {
	DB: D1Database;
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GOOGLE_REDIRECT_URI?: string;
};

async function googleRedirect(env: EnvLike, baseUrl: URL): Promise<Response> {
	const { GOOGLE_CLIENT_ID: id, GOOGLE_REDIRECT_URI: redirect } = env;
	if (!id || !redirect) return json({ error: "Google sign-in is not configured" }, 500);
	const returnTo = baseUrl.searchParams.get("returnTo") || "/";
	const state = `r=${encodeURIComponent(returnTo)}.${await genState()}`;
	const sp = new URLSearchParams({
		client_id: id,
		redirect_uri: redirect,
		response_type: "code",
		scope: GOOGLE_SCOPE,
		access_type: "online",
		state,
		prompt: "select_account",
	});
	return Response.redirect(`${GOOGLE_AUTH_URL}?${sp.toString()}`);
}

async function googleCallback(env: EnvLike, url: URL, request: Request): Promise<Response> {
	const db = env.DB;
	const { GOOGLE_CLIENT_ID: ci, GOOGLE_CLIENT_SECRET: cs, GOOGLE_REDIRECT_URI: redirect } = env;
	const sp = url.searchParams;
	if (sp.get("error")) return json({ error: `Google sign-in was cancelled: ${sp.get("error")}` }, 400);
	const code = sp.get("code");
	const stateRaw = sp.get("state") || "";
	if (!code) return json({ error: "Missing authorization code" }, 400);
	if (!ci || !cs) return json({ error: "Google sign-in is not configured" }, 500);

	const res = await fetch(GOOGLE_TOKEN_URL, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: ci,
			client_secret: cs,
			redirect_uri: redirect || "",
			grant_type: "authorization_code",
		}),
	});
	let tokenJson: { access_token?: string; error?: string } = {};
	try {
		tokenJson = (await res.json()) as typeof tokenJson;
	} catch {
		return json({ error: `Could not parse the Google token response (HTTP ${res.status})` }, 500);
	}
	if (!tokenJson.access_token || tokenJson.error) {
		return json({ error: `Could not get a Google token: ${tokenJson.error || res.status}` }, 400);
	}

	const profileRes = await fetch(GOOGLE_USERINFO_URL, {
		headers: { authorization: `Bearer ${tokenJson.access_token}` },
	});
	if (!profileRes.ok) return json({ error: `Could not fetch the Google profile (HTTP ${profileRes.status})` }, 400);
	const g = (await profileRes.json()) as {
		sub?: string;
		email?: string;
		email_verified?: boolean;
		name?: string;
		picture?: string;
	};
	if (!g.sub || !g.email) return json({ error: "Google did not return an email" }, 400);
	if (g.email_verified === false) return json({ error: "Google email is not verified" }, 400);

	const id = g.sub;
	const email = g.email.toLowerCase().trim();
	const name = g.name || email.split("@")[0];
	const picture = g.picture || "";

	const existing = await db
		.prepare(`SELECT id FROM users WHERE id = ?`)
		.bind(id)
		.first<{ id: string }>();
	if (existing) {
		await db
			.prepare(`UPDATE users SET email = ?, name = ?, picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
			.bind(email, name, picture, id)
			.run();
	} else {
		await db
			.prepare(`INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)`)
			.bind(id, email, name, picture)
			.run();
	}

	const { token, expiresMs } = await createSession(db, id);

	let returnTo = "/";
	if (stateRaw.startsWith("r=")) {
		try {
			const decoded = decodeURIComponent(stateRaw.slice(2).split(".")[0]);
			if (decoded.startsWith("/")) returnTo = decoded;
		} catch {
			/* ignore */
		}
	}
	const res2 = new Response(null, { status: 302, headers: { location: new URL(returnTo, url).toString() } });
	setSessionCookie(res2.headers, token, expiresMs);
	return res2;
}

async function me(env: EnvLike, request: Request): Promise<Response> {
	const db = env.DB;
	const userId = await getSessionUser(db, request);
	if (!userId) return json({ user: null });
	try {
		const user = await db
			.prepare(`SELECT id, email, name, picture FROM users WHERE id = ?`)
			.bind(userId)
			.first();
		return json({ user: user || null });
	} catch {
		return json({ user: null });
	}
}

async function logout(env: EnvLike, request: Request): Promise<Response> {
	await destroySession(env.DB, request);
	// Redirect (303) utk form submit full-page → kembali ke home setelah logout.
	const res = new Response(null, { status: 303, headers: { location: "/" } });
	clearSessionCookie(res.headers);
	return res;
}

/** Handler /api/auth/*. Mengembalikan Response atau null bila path tak dikenali. */
export async function handleAuth(request: Request, env: unknown): Promise<Response | null> {
	const url = new URL(request.url);
	const pathname = url.pathname;
	if (!pathname.startsWith("/api/auth")) return null;
	const env2 = env as EnvLike;

	if (pathname === "/api/auth/google" && request.method === "GET") {
		return googleRedirect(env2, url);
	}
	if (pathname === "/api/auth/google/callback" && request.method === "GET") {
		return googleCallback(env2, url, request);
	}
	if (pathname === "/api/auth/me" && request.method === "GET") {
		return me(env2, request);
	}
	if (pathname === "/api/auth/logout" && request.method === "POST") {
		return logout(env2, request);
	}
	if (pathname.startsWith("/api/auth")) {
		return new Response("Not Found", { status: 404 });
	}
	return null;
}
