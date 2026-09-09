import { redirect } from "react-router";
import type { Route } from "./+types/auth.google";
import { authEnv, createStateCookie, isGoogleConfigured } from "../lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = authEnv(context.cloudflare.env);
	if (!isGoogleConfigured(env)) return redirect("/?authError=not-configured");
	const url = new URL(request.url);
	const mode = url.searchParams.get("mode") === "signup" ? "signup" : "login";
	const { state, header } = await createStateCookie(request, env.SESSION_SECRET!, mode);
	const callback = `${url.origin}/auth/google/callback`;
	const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	authorize.searchParams.set("client_id", env.GOOGLE_CLIENT_ID!);
	authorize.searchParams.set("redirect_uri", callback);
	authorize.searchParams.set("response_type", "code");
	authorize.searchParams.set("scope", "openid email profile");
	authorize.searchParams.set("state", state);
	authorize.searchParams.set("prompt", "select_account");
	return redirect(authorize.toString(), { headers: { "Set-Cookie": header } });
}

export default function GoogleAuthRedirect() { return null; }
