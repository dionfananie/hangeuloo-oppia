import { redirect } from "react-router";
import type { Route } from "./+types/lessons";
import { getAuthUser } from "~/lib/auth.server";
import { getLessonCatalog } from "~/lib/lessons.server";
import { getLearningPathCatalog } from "~/lib/learning-path.server";
import { getLessonExperience, selectCurriculumBranch } from "~/lib/lesson-experience.server";
import { authorizeBranchChoice } from "~/lib/learning-path.server";
import { buildSeoMeta } from "~/lib/seo";
import { useLoaderData } from "react-router";
import LessonsHome from "~/pages/lessons/LessonsHome";
import LearningPath from "~/pages/lessons/LearningPath";

export function meta() {
	return buildSeoMeta({
		title: "Learning Path | Hangeuloo",
		description: "Learn Hangul, Korean words, and useful sentences one happy step at a time.",
		path: "/lessons",
		index: false,
	});
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const experience = await getLessonExperience(context.cloudflare.env.DB, user.sub);
	if (experience.variant === "learning_path") {
		const path = await getLearningPathCatalog(context.cloudflare.env.DB, user.sub, experience);
		if (!path) return redirect("/");
		return { user, experience: "learning_path" as const, path };
	}
	const catalog = await getLessonCatalog(context.cloudflare.env.DB, user.sub);
	if (!catalog) return redirect("/");
	return { user, experience: "legacy" as const, catalog };
}

export async function action({ request, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");
	if (intent === "select-branch") {
		const branchId = String(form.get("branchId") ?? "");
		if (!branchId) return { ok: false, error: "Choose a branch to continue." };
		await authorizeBranchChoice(
			context.cloudflare.env.DB,
			user.sub,
			await getLessonExperience(context.cloudflare.env.DB, user.sub),
		);
		await selectCurriculumBranch(context.cloudflare.env.DB, user.sub, branchId);
		return redirect("/lessons");
	}
	return { ok: false, error: "Unknown action." };
}

export default function LessonsRoute() {
	const data = useLoaderData<Route.ComponentProps["loaderData"]>();
	return data.experience === "learning_path" ? <LearningPath /> : <LessonsHome />;
}
