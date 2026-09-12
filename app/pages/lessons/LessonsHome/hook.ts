import { useLoaderData } from "react-router";
import type { Route } from "../../../routes/+types/lessons";

export default function useLessonsHome() {
	const data = useLoaderData<Route.ComponentProps["loaderData"]>();
	if (data.experience !== "legacy") throw new Error("Expected a legacy lesson catalog");
	const { user, catalog } = data;
	return {
		user,
		catalog,
		isId: catalog.guideLanguage === "id",
	};
}
