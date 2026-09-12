import { useLoaderData } from "react-router";
import type { Route } from "../../../routes/+types/lesson";

export default function usePathLesson() {
	const data = useLoaderData<Route.ComponentProps["loaderData"]>();
	if (data.experience !== "learning_path") throw new Error("Expected a learning path lesson");
	return { lesson: data.lesson };
}
