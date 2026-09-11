import { redirect } from "react-router";
import type { Route } from "./+types/practice-vocabulary";
import { getAuthUser } from "~/lib/auth.server";
import { getRandomVocabularyItems, getPracticeSummary } from "~/lib/learning.server";
import { getPracticeUnlocks } from "~/lib/lessons.server";
import VocabularyPractice from "~/pages/practice/VocabularyPractice";
import { buildSeoMeta } from "~/lib/seo";

export { VocabularyPractice as default };
export function meta() {
	return buildSeoMeta({
		title: "Vocabulary Practice | Hangeuloo",
		description: "Practice Korean vocabulary with quick, focused exercises.",
		index: false,
	});
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const summary = await getPracticeSummary(context.cloudflare.env.DB, user.sub);
	const words = await getRandomVocabularyItems(context.cloudflare.env.DB, user.sub, summary.level, 6);
	return {
		summary,
		words,
		unlocks: await getPracticeUnlocks(context.cloudflare.env.DB, user.sub),
		mode: params.mode ?? "korean-to-meaning",
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	let results: Array<{ id: number; correct: boolean }> = [];
	try {
		results = JSON.parse(String(form.get("results") ?? "[]"));
	} catch {
		return { ok: false, error: "That practice result was not valid." };
	}
	if (
		form.get("intent") !== "complete-session" ||
		!results.length ||
		!results.every((result) => Number.isInteger(result.id) && typeof result.correct === "boolean")
	)
		return { ok: false, error: "That practice result was not valid." };
	const dashboard = await import("~/lib/learning.server").then(({ getDashboard }) =>
		getDashboard(context.cloudflare.env.DB, user.sub),
	);
	const xp = await import("~/lib/learning.server").then(({ completeSession }) =>
		completeSession(context.cloudflare.env.DB, user.sub, {
			gameType: "vocabulary",
			level: dashboard.profile?.level ?? 0,
			correctCount: results.filter((result) => result.correct).length,
			totalCount: results.length,
			results,
		}),
	);
	return { ok: true, xp };
}
