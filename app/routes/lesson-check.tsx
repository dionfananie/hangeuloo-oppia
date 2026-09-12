import { redirect } from "react-router";
import type { Route } from "./+types/lesson-check";
import { getAuthUser } from "~/lib/auth.server";
import { getLessonExperience } from "~/lib/lesson-experience.server";
import { getCheckQuestions, submitCheck, type CheckSubmission } from "~/lib/lesson-checks.server";
import { buildSeoMeta } from "~/lib/seo";
import { useLoaderData } from "react-router";
import LessonCheck from "~/pages/lessons/LessonCheck";

export function meta({ data }: Route.MetaArgs) {
	return buildSeoMeta({
		title: data ? `${data.check.node.title} | Hangeuloo` : "Check | Hangeuloo",
		index: false,
	});
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const experience = await getLessonExperience(context.cloudflare.env.DB, user.sub);
	const check = await getCheckQuestions(
		context.cloudflare.env.DB,
		user.sub,
		experience,
		String(params.checkNodeId),
	);
	return { user, check };
}

export async function action({ request, params, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");
	if (intent !== "submit-check") return { ok: false, error: "Unknown action." };
	const idempotencyKey = String(form.get("idempotencyKey") ?? "").slice(0, 100);
	if (!idempotencyKey) return { ok: false, error: "Missing submission key." };
	let answers: CheckSubmission[] = [];
	try {
		const parsed = JSON.parse(String(form.get("answers") ?? "[]"));
		if (!Array.isArray(parsed)) throw new Error();
		answers = parsed
			.filter(
				(answer): answer is CheckSubmission =>
					typeof answer?.itemId === "string" && typeof answer?.answerId === "string",
			)
			.slice(0, 50);
	} catch {
		return { ok: false, error: "Your answers were not valid." };
	}
	const experience = await getLessonExperience(context.cloudflare.env.DB, user.sub);
	const result = await submitCheck(
		context.cloudflare.env.DB,
		user.sub,
		experience,
		String(params.checkNodeId),
		idempotencyKey,
		answers,
	);
	return { ok: true, ...result };
}

export default function LessonCheckRoute() {
	const data = useLoaderData<Route.ComponentProps["loaderData"]>();
	return <LessonCheck check={data.check} />;
}
