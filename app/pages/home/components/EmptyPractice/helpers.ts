import type { EmptyPracticeContent } from "./types";

export function getEmptyPracticeContent(review: boolean): EmptyPracticeContent {
	if (review) {
		return {
			icon: "check",
			title: "Review queue cleared!",
			description: "You have reviewed everything due today. Try vocabulary matching next.",
		};
	}

	return {
		icon: "book",
		title: "Practice is loading",
		description: "No exercises are available for this level yet.",
	};
}
