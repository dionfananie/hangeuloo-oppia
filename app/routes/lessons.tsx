import { redirect } from "react-router";
import type { Route } from "./+types/lessons";
import { getAuthUser } from "~/lib/auth.server";
import { getLessonCatalog } from "~/lib/lessons.server";

export { default } from "~/pages/lessons/LessonsHome";

export function meta() {
	return [
		{ title: "Lessons | Hangeuloo" },
		{ name: "description", content: "Learn Hangul, Korean words, and useful sentences one happy step at a time." },
	];
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) return redirect("/");
	const catalog = await getLessonCatalog(context.cloudflare.env.DB, user.sub);
	if (!catalog) return redirect("/");
	return { user, catalog };
}
