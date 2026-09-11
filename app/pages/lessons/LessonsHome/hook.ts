import { useLoaderData } from "react-router";
import type { Route } from "../../../routes/+types/lessons";

export default function useLessonsHome() {
	const { user, catalog } = useLoaderData<Route.ComponentProps["loaderData"]>();

	return {
		user,
		catalog,
		isId: catalog.guideLanguage === "id",
	};
}
