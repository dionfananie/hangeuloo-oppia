import { redirect } from "react-router";
import type { Route } from "./+types/practice";
import { getAuthUser } from "~/lib/auth.server";
import { completeSession, getDashboard, getPracticeSummary } from "~/lib/learning.server";
import { getPracticeUnlocks } from "~/lib/lessons.server";
import PracticeHome from "~/pages/practice";
import { buildSeoMeta } from "~/lib/seo";

export { PracticeHome as default };

export function meta() {
	return buildSeoMeta({
		title: "Practice | Hangeuloo",
		description: "Practice Korean vocabulary and build lasting recall.",
		index: false,
	});
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const [summary, unlocks] = await Promise.all([
		getPracticeSummary(context.cloudflare.env.DB, user.sub),
		getPracticeUnlocks(context.cloudflare.env.DB, user.sub),
	]);
	return { summary, unlocks };
}

export async function action({ request, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	if (form.get("intent") !== "complete-session") return { ok: false, error: "Unknown practice action." };
	const gameType = String(form.get("gameType"));
	const totalCount = Number(form.get("totalCount"));
	let results: Array<{ id: number; correct: boolean; confidence?: "again" | "hard" | "good" }> = [];
	try {
		results = JSON.parse(String(form.get("results") ?? "[]"));
	} catch {
		return { ok: false, error: "That practice result was not valid." };
	}
	if (
		!results.every((result) => Number.isInteger(result.id) && typeof result.correct === "boolean") ||
		totalCount < 1 ||
		totalCount > 10
	)
		return { ok: false, error: "That practice result was not valid." };
	const dashboard = await getDashboard(context.cloudflare.env.DB, user.sub);
	const xp = await completeSession(context.cloudflare.env.DB, user.sub, {
		gameType: gameType as "vocabulary" | "sentence" | "listening" | "review",
		level: dashboard.profile?.level ?? 0,
		correctCount: results.filter((result) => result.correct).length,
		totalCount,
		results,
	});
	return { ok: true, xp };
}
