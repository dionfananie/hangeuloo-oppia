export type AuthUser = {
	sub: string;
	email: string;
	name: string;
	picture?: string;
	exp: number;
};

type AuthEnv = {
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	SESSION_SECRET?: string;
};

const SESSION_COOKIE = "hangeuloo_session";
const OAUTH_COOKIE = "hangeuloo_oauth";
const encoder = new TextEncoder();

function base64url(input: Uint8Array | string) {
	const bytes = typeof input === "string" ? encoder.encode(input) : input;
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function decodeBase64url(value: string) {
	const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
	const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
	return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
}

function parseCookies(request: Request) {
	return Object.fromEntries((request.headers.get("Cookie") ?? "").split(";").filter(Boolean).map((part) => {
		const [key, ...rest] = part.trim().split("=");
		return [key, decodeURIComponent(rest.join("="))];
	}));
}

async function hmac(value: string, secret: string) {
	const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
	return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function sessionHash(token: string) {
	return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(token))));
}

async function safeEqualSignature(value: string, signature: string, secret: string) {
	try {
		const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
		return crypto.subtle.verify("HMAC", key, decodeBase64url(signature), encoder.encode(value));
	} catch {
		return false;
	}
}

function cookie(name: string, value: string, request: Request, maxAge: number) {
	const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
	return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function authEnv(env: unknown): AuthEnv {
	return env as AuthEnv;
}

export function isGoogleConfigured(env: AuthEnv) {
	return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.SESSION_SECRET);
}

export async function createStateCookie(request: Request, secret: string, mode: "login" | "signup") {
	const state = base64url(crypto.getRandomValues(new Uint8Array(24)));
	const payload = base64url(JSON.stringify({ state, mode, exp: Date.now() + 10 * 60_000 }));
	const signature = base64url(await hmac(payload, secret));
	return { state, header: cookie(OAUTH_COOKIE, `${payload}.${signature}`, request, 600) };
}

export async function verifyState(request: Request, state: string, secret: string) {
	const raw = parseCookies(request)[OAUTH_COOKIE];
	if (!raw) return null;
	const [payload, signature] = raw.split(".");
	if (!payload || !signature || !(await safeEqualSignature(payload, signature, secret))) return null;
	try {
		const data = JSON.parse(new TextDecoder().decode(decodeBase64url(payload))) as { state: string; mode: "login" | "signup"; exp: number };
		return data.state === state && data.exp > Date.now() ? data : null;
	} catch {
		return null;
	}
}

export async function createSessionCookie(request: Request, userId: string, db: D1Database) {
	const token = base64url(crypto.getRandomValues(new Uint8Array(32)));
	const maxAge = 30 * 24 * 60 * 60;
	await db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
		.bind(await sessionHash(token), userId, Math.floor(Date.now() / 1000) + maxAge).run();
	return cookie(SESSION_COOKIE, token, request, maxAge);
}

export async function getAuthUser(request: Request, db: D1Database): Promise<AuthUser | null> {
	const token = parseCookies(request)[SESSION_COOKIE];
	if (!token) return null;
	const tokenHash = await sessionHash(token);
	const row = await db.prepare(`SELECT s.expires_at, u.id, u.email, u.name, u.picture
		FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`)
		.bind(tokenHash).first<{ expires_at: number; id: string; email: string; name: string; picture: string | null }>();
	if (!row) return null;
	if (row.expires_at <= Math.floor(Date.now() / 1000)) {
		await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
		return null;
	}
	return { sub: row.id, email: row.email, name: row.name, picture: row.picture ?? undefined, exp: row.expires_at * 1000 };
}

export async function destroySession(request: Request, db: D1Database) {
	const token = parseCookies(request)[SESSION_COOKIE];
	if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sessionHash(token)).run();
}

export function clearAuthCookies(request: Request) {
	return [cookie(SESSION_COOKIE, "", request, 0), cookie(OAUTH_COOKIE, "", request, 0)];
}
