import { redirect } from "react-router";
import type { Route } from "./+types/auth.logout";
import { clearAuthCookies, destroySession } from "../lib/auth.server";

export async function action({ request, context }: Route.ActionArgs) {
	await destroySession(request, context.cloudflare.env.DB);
	return redirect("/", { headers: clearAuthCookies(request).map(value => ["Set-Cookie", value]) });
}

export async function loader({ request }: Route.LoaderArgs) {
	throw new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}

export default function Logout() { return null; }
