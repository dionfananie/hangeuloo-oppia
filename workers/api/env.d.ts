// env.d.ts — Tambahan binding utk worker Hangeuloo (D1 DB + secret Google).
// Secrets (wrangler secret put) tidak muncul di worker-configuration.d.ts,
// jadi dideklarasikan agar typechecker tahu.
declare global {
	interface Env {
		DB: D1Database;
		AI: any; // Workers AI binding (Binding "AI")
		GOOGLE_CLIENT_ID?: string;
		GOOGLE_CLIENT_SECRET?: string;
		GOOGLE_REDIRECT_URI?: string;
		SESSION_SECRET?: string; // legacy — disimpan utk kompatibilitas bila perlu
		LEARNING_PATH_ROLLOUT_PERCENT?: string; // 0–100, kontrol penugasan cohort learning path
	}
}

export {};
