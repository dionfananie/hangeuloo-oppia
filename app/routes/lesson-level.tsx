import { redirect } from "react-router";
import type { Route } from "./+types/lesson-level";
import { getAuthUser } from "~/lib/auth.server";
import { getLessonCatalog } from "~/lib/lessons.server";
import { getLessonExperience } from "~/lib/lesson-experience.server";
import { buildSeoMeta } from "~/lib/seo";

export { default } from "~/pages/lessons/LessonLevel";

export function meta({ data }: Route.MetaArgs) {
	return buildSeoMeta({
		title: data ? `${data.level.name} | Hangeuloo Lessons` : "Level | Hangeuloo Lessons",
		description: data?.level.description,
		index: false,
	});
}

export async function loader({ request, params, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const experience = await getLessonExperience(context.cloudflare.env.DB, user.sub);
	if (experience.variant === "learning_path") return redirect("/lessons");
	const levelNumber = Number(params.level);
	const catalog = await getLessonCatalog(context.cloudflare.env.DB, user.sub);
	const level = catalog?.levels.find((item) => item.level === levelNumber);
	if (!catalog || !level || !Number.isInteger(levelNumber))
		throw new Response("Level not found", { status: 404 });
	if (level.locked)
		throw new Response("This level is not available for your current learning path", {
			status: 403,
		});
	return { user, catalog, level };
}
