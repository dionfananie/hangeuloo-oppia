import { redirect } from "react-router";
import type { Route } from "./+types/lesson-practice";
import { getAuthUser } from "~/lib/auth.server";
import { getLessonExperience } from "~/lib/lesson-experience.server";
import { getPracticeQuestions, submitPractice, type PracticeSubmission } from "~/lib/lesson-practice.server";
import { buildSeoMeta } from "~/lib/seo";
import { useLoaderData } from "react-router";
import LessonPractice from "~/pages/lessons/LessonPractice";

export function meta({ data }: Route.MetaArgs) {
	return buildSeoMeta({
		title: data ? `${data.practice.node.title} | Hangeuloo` : "Practice | Hangeuloo",
		index: false,
	});
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const experience = await getLessonExperience(context.cloudflare.env.DB, user.sub);
	const practice = await getPracticeQuestions(
		context.cloudflare.env.DB,
		user.sub,
		experience,
		String(params.practiceNodeId),
	);
	return { user, practice };
}

export async function action({ request, params, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");
	if (intent !== "submit-practice") return { ok: false, error: "Unknown action." };
	const idempotencyKey = String(form.get("idempotencyKey") ?? "").slice(0, 100);
	if (!idempotencyKey) return { ok: false, error: "Missing submission key." };
	let answers: PracticeSubmission[] = [];
	try {
		const parsed = JSON.parse(String(form.get("answers") ?? "[]"));
		if (!Array.isArray(parsed)) throw new Error();
		answers = parsed
			.filter(
				(answer): answer is PracticeSubmission =>
					typeof answer?.itemId === "string" && typeof answer?.answerId === "string",
			)
			.slice(0, 50);
	} catch {
		return { ok: false, error: "Your answers were not valid." };
	}
	const experience = await getLessonExperience(context.cloudflare.env.DB, user.sub);
	const result = await submitPractice(
		context.cloudflare.env.DB,
		user.sub,
		experience,
		String(params.practiceNodeId),
		idempotencyKey,
		answers,
	);
	return { ok: true, ...result };
}

export default function LessonPracticeRoute() {
	const data = useLoaderData<Route.ComponentProps["loaderData"]>();
	return <LessonPractice practice={data.practice} />;
}
