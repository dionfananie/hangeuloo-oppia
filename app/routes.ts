import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("lessons", "routes/lessons.tsx"),
	route("lessons/levels/:level", "routes/lesson-level.tsx"),
	route("lessons/:lessonId", "routes/lesson.tsx"),
] satisfies RouteConfig;
