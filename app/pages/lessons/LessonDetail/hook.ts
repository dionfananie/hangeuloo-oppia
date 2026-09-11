import { useLoaderData } from "react-router";
import type { Route } from "../../../routes/+types/lesson";

export default function useLessonDetail() {
	return useLoaderData<Route.ComponentProps["loaderData"]>();
}
