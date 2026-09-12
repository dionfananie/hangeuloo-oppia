import type { Route } from "./+types/home";
import { redirect } from "react-router";
import { authEnv, getAuthUser, isGoogleConfigured } from "~/lib/auth.server";
import { completeSession, ensureUser, getDashboard, saveProfile } from "~/lib/learning.server";
import { generateFeedback, saveInterview, transcribeKorean } from "~/lib/interview.server";
import { getLessonCatalog, getPracticeUnlocks } from "~/lib/lessons.server";
import { assignExperience, getLessonExperience } from "~/lib/lesson-experience.server";
import { getPathSummary } from "~/lib/learning-path.server";
import { parseRolloutPercent } from "~/lib/learning-path-rollout";
import { buildSeoMeta } from "~/lib/seo";

export { default } from "~/pages/home";

export function meta({}: Route.MetaArgs) {
	return buildSeoMeta({
		title: "Hangeuloo — Learn Korean, one happy step at a time",
		description:
			"Learn Korean with short daily lessons, playful vocabulary and listening practice, spaced repetition, and friendly AI interview coaching.",
		path: "/",
	});
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = authEnv(context.cloudflare.env);
	const url = new URL(request.url);
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (user) await ensureUser(context.cloudflare.env.DB, user);
	const experience = user ? await getLessonExperience(context.cloudflare.env.DB, user.sub) : null;
	const [dashboard, lessonCatalog, practiceUnlocks, pathSummary] = user
		? experience?.variant === "learning_path"
			? await Promise.all([
					getDashboard(context.cloudflare.env.DB, user.sub),
					null,
					[],
					getPathSummary(context.cloudflare.env.DB, user.sub, experience),
				])
			: await Promise.all([
					getDashboard(context.cloudflare.env.DB, user.sub),
					getLessonCatalog(context.cloudflare.env.DB, user.sub),
					getPracticeUnlocks(context.cloudflare.env.DB, user.sub),
					null,
				])
		: [null, null, [], null];
	return {
		user,
		dashboard,
		lessonCatalog,
		practiceUnlocks,
		pathSummary,
		googleConfigured: isGoogleConfigured(env),
		authError: url.searchParams.get("authError"),
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");
	if (intent === "onboarding") {
		const guideLanguage = form.get("guideLanguage") === "id" ? "id" : "en";
		const goal = String(form.get("goal"));
		const level = Number(form.get("level"));
		const dailyTarget = Number(form.get("dailyTarget"));
		const interests = form.getAll("interests").map(String).slice(0, 6);
		if (
			!["conversation", "job", "topik", "travel"].includes(goal) ||
			![0, 1, 2].includes(level) ||
			![5, 10, 15, 20].includes(dailyTarget)
		) {
			return { ok: false, error: "Please complete every onboarding step." };
		}
		await saveProfile(context.cloudflare.env.DB, user.sub, {
			guideLanguage,
			goal: goal as "conversation" | "job" | "topik" | "travel",
			level,
			dailyTarget,
			interests,
		});
		const rolloutPercent = parseRolloutPercent(context.cloudflare.env.LEARNING_PATH_ROLLOUT_PERCENT);
		await assignExperience(context.cloudflare.env.DB, user.sub, level, rolloutPercent);
		return redirect("/");
	}
	if (intent === "transcribe") {
		const audio = form.get("audio");
		if (!(audio instanceof File)) return { ok: false, error: "No recording was attached." };
		try {
			const transcript = await transcribeKorean(context.cloudflare.env.AI, audio);
			return { ok: true, transcript };
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error ? error.message : "Transcription failed. You can type your answer instead.",
			};
		}
	}
	if (intent === "interview-feedback") {
		const scenarioId = Number(form.get("scenarioId"));
		const answer = String(form.get("answer") ?? "")
			.trim()
			.slice(0, 2000);
		const answerMode = form.get("answerMode") === "voice" ? "voice" : "typed";
		const duration = Math.max(0, Math.min(900, Number(form.get("duration")) || 0));
		const idempotencyKey = String(form.get("idempotencyKey") ?? "").slice(0, 100);
		const dashboard = await getDashboard(context.cloudflare.env.DB, user.sub);
		const scenario = dashboard.interviewScenarios.find((item) => item.id === scenarioId);
		if (!scenario || answer.length < 2 || !idempotencyKey)
			return { ok: false, error: "Choose a scenario and add your Korean answer." };
		try {
			const feedback = await generateFeedback(context.cloudflare.env.AI, {
				scenario,
				answer,
				language: dashboard.profile!.guideLanguage,
			});
			const sessionId = await saveInterview(context.cloudflare.env.DB, {
				userId: user.sub,
				scenario,
				answer,
				answerMode,
				duration,
				idempotencyKey,
				feedback,
			});
			return { ok: true, feedback, sessionId };
		} catch {
			return {
				ok: false,
				error: "AI coaching is temporarily unavailable. Your answer is still here, so you can retry.",
			};
		}
	}
	if (intent === "complete-session") {
		const gameType = String(form.get("gameType"));
		const totalCount = Number(form.get("totalCount"));
		const correctCount = Number(form.get("correctCount"));
		const level = Number(form.get("level"));
		if (
			!["vocabulary", "sentence", "listening", "review"].includes(gameType) ||
			!Number.isInteger(totalCount) ||
			totalCount < 1 ||
			totalCount > 20 ||
			!Number.isInteger(correctCount)
		) {
			return { ok: false, error: "That practice result was not valid." };
		}
		let results: Array<{ id: number; correct: boolean; confidence?: "again" | "hard" | "good" }> = [];
		try {
			results = JSON.parse(String(form.get("results") ?? "[]"));
			if (!Array.isArray(results) || results.length > 20) throw new Error();
			results = results.filter(
				(result) => Number.isInteger(result.id) && typeof result.correct === "boolean",
			);
		} catch {
			return { ok: false, error: "That review result was not valid." };
		}
		const dashboard = await getDashboard(context.cloudflare.env.DB, user.sub);
		const unlocks = await getPracticeUnlocks(context.cloudflare.env.DB, user.sub);
		if (!unlocks.includes(gameType))
			return { ok: false, error: "Complete the related lesson to unlock this practice." };
		const xp = await completeSession(context.cloudflare.env.DB, user.sub, {
			gameType: gameType as "vocabulary" | "sentence" | "listening" | "review",
			level: dashboard.profile?.level ?? 0,
			correctCount,
			totalCount,
			results,
		});
		return { ok: true, xp };
	}
	return { ok: false, error: "Unknown action." };
}
