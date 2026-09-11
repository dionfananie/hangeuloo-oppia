// auth.server.ts — Pembaca sesi utk SSR loader (worker auth compatible).
// OAuth & pembuatan sesi dilakukan oleh Worker (/api/auth/*); file ini hanya
// dipakai halaman untuk mengetahui user pada saat SSR: membaca cookie
// `hangeuloo_session` (token) & memvalidasi ke tabel `sessions` + users.

import type { AuthUser } from "./auth.server.types";

export type { AuthUser };

const SESSION_COOKIE = "hangeuloo_session";

function parseCookie(header: string, name: string): string | null {
	for (const part of header.split(";")) {
		const idx = part.indexOf("=");
		if (idx === -1) continue;
		const key = part.slice(0, idx).trim();
		if (key === name) return decodeURIComponent(part.slice(idx + 1).trim());
	}
	return null;
}

export type AuthEnv = {
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
};
export function authEnv(env: unknown): AuthEnv {
	return env as AuthEnv;
}
export function isGoogleConfigured(env: AuthEnv) {
	return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

/** baca user dari sesi (worker atau SSR). */
export async function getAuthUser(request: Request, db: D1Database): Promise<AuthUser | null> {
	const token = parseCookie(request.headers.get("Cookie") ?? "", SESSION_COOKIE);
	if (!token) return null;
	const row = await db
		.prepare(
			`SELECT u.id, u.email, u.name, u.picture, s.expires_at
			 FROM sessions s JOIN users u ON u.id = s.user_id
			 WHERE s.token = ?`,
		)
		.bind(token)
		.first<{
			id: string;
			email: string;
			name: string;
			picture: string | null;
			expires_at: number;
		}>();
	if (!row) return null;
	if (row.expires_at <= Math.floor(Date.now() / 1000)) {
		await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
		return null;
	}
	return {
		sub: row.id,
		email: row.email,
		name: row.name,
		picture: row.picture ?? undefined,
		exp: row.expires_at * 1000,
	};
}

/** Hapus sesi dr request. */
export async function destroySession(request: Request, db: D1Database) {
	const token = parseCookie(request.headers.get("Cookie") ?? "", SESSION_COOKIE);
	if (token) await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
}

export function clearAuthCookies(_request: Request) {
	return [`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`];
}
