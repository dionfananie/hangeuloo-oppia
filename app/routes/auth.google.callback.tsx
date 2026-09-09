import { redirect } from "react-router";
import type { Route } from "./+types/auth.google.callback";
import { authEnv, clearAuthCookies, createSessionCookie, isGoogleConfigured, verifyState } from "../lib/auth.server";
import { ensureUser } from "../lib/learning.server";

type GoogleUser = { sub: string; email: string; email_verified?: boolean; name?: string; picture?: string };

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = authEnv(context.cloudflare.env);
	const url = new URL(request.url);
	if (!isGoogleConfigured(env)) return redirect("/?authError=not-configured");
	if (url.searchParams.get("error")) return redirect("/?authError=cancelled");
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	if (!code || !state || !(await verifyState(request, state, env.SESSION_SECRET!))) return redirect("/?authError=invalid-state", { headers: clearAuthCookies(request).map(value => ["Set-Cookie", value]) });
	try {
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, redirect_uri: `${url.origin}/auth/google/callback`, grant_type: "authorization_code" }),
		});
		if (!tokenResponse.ok) throw new Error("Token exchange failed");
		const tokens = await tokenResponse.json() as { access_token: string };
		const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
		if (!profileResponse.ok) throw new Error("Profile request failed");
		const profile = await profileResponse.json() as GoogleUser;
		if (!profile.email || profile.email_verified === false) throw new Error("Verified email required");
		const user = { sub: profile.sub, email: profile.email, name: profile.name || profile.email.split("@")[0], picture: profile.picture };
		await ensureUser(context.cloudflare.env.DB, { ...user, exp: Date.now() + 7 * 24 * 60 * 60_000 });
		const session = await createSessionCookie(request, user.sub, context.cloudflare.env.DB);
		const headers = new Headers();
		headers.append("Set-Cookie", session);
		headers.append("Set-Cookie", clearAuthCookies(request)[1]);
		return redirect("/", { headers });
	} catch {
		return redirect("/?authError=google-failed", { headers: clearAuthCookies(request).map(value => ["Set-Cookie", value]) });
	}
}

export default function GoogleAuthCallback() { return null; }
