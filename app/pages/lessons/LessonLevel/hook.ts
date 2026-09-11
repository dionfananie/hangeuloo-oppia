import { useLoaderData } from "react-router";
import type { Route } from "../../../routes/+types/lesson-level";

export default function useLessonLevel() {
	const { user, catalog, level } = useLoaderData<Route.ComponentProps["loaderData"]>();

	return {
		user,
		catalog,
		level,
		isId: catalog.guideLanguage === "id",
	};
}
