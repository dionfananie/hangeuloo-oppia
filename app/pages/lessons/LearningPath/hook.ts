import { useLoaderData } from "react-router";
import type { Route } from "../../../routes/+types/lessons";

export default function useLearningPath() {
	const data = useLoaderData<Route.ComponentProps["loaderData"]>();
	if (data.experience !== "learning_path") throw new Error("Expected a learning path experience");
	return {
		user: data.user,
		path: data.path,
		isId: data.path.guideLanguage === "id",
	};
}
