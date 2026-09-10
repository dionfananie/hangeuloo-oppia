import { redirect } from "react-router";
import type { Route } from "./+types/lesson";
import { getAuthUser } from "~/lib/auth.server";
import { completeLesson, getLessonDetail, recordLessonEvent, viewLessonItem } from "~/lib/lessons.server";

export { default } from "~/pages/lessons/LessonDetail";

export function meta({ data }: Route.MetaArgs) {
	return [{ title: data ? `${data.lesson.title} | Hangeuloo Lessons` : "Lesson | Hangeuloo" }];
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const lesson = await getLessonDetail(context.cloudflare.env.DB, user.sub, String(params.lessonId));
	return { user, lesson };
}

export async function action({ request, params, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const lessonId = String(params.lessonId);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");
	if (intent === "view-item") {
		const itemIndex = Number(form.get("itemIndex"));
		if (!Number.isFinite(itemIndex) || !Number.isInteger(itemIndex)) return { ok: false, error: "Invalid lesson item." };
		const savedIndex = await viewLessonItem(context.cloudflare.env.DB, user.sub, lessonId, itemIndex);
		if (savedIndex === 0) await recordLessonEvent(context.cloudflare.env.DB, user.sub, lessonId, "lesson_opened");
		await recordLessonEvent(context.cloudflare.env.DB, user.sub, lessonId, "item_viewed", String(form.get("itemId") ?? "") || undefined);
		return { ok: true, currentItemIndex: savedIndex };
	}
	if (intent === "complete-lesson") {
		const result = await completeLesson(context.cloudflare.env.DB, user.sub, lessonId, Number(form.get("lastItemIndex")));
		return { ok: true, completed: true, ...result };
	}
	if (intent === "lesson-event") {
		await recordLessonEvent(context.cloudflare.env.DB, user.sub, lessonId, String(form.get("eventType")), String(form.get("itemId") ?? "") || undefined, String(form.get("value") ?? "") || undefined);
		return { ok: true };
	}
	return { ok: false, error: "Unknown lesson action." };
}
