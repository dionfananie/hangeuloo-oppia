import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("lessons", "routes/lessons.tsx"),
	route("lessons/checks/:checkNodeId", "routes/lesson-check.tsx"),
	route("lessons/practice/:practiceNodeId", "routes/lesson-practice.tsx"),
	route("lessons/levels/:level", "routes/lesson-level.tsx"),
	route("lessons/:lessonId", "routes/lesson.tsx"),
	route("practice", "routes/practice.tsx"),
	route("practice/vocabulary/:mode?", "routes/practice-vocabulary.tsx"),
	route("practice/sentence", "routes/practice-sentence.tsx"),
	route("practice/listening", "routes/practice-listening.tsx"),
	route("practice/review", "routes/practice-review.tsx"),
] satisfies RouteConfig;
