import type { IconName } from "../home/components/Icon/types";

export type PracticeMode = "korean-to-meaning" | "meaning-to-korean" | "image-guess" | "match";

export type PracticeModeDetails = {
	id: PracticeMode;
	title: string;
	description: string;
	icon: IconName;
	color: string;
};

export type PracticeAnswer = {
	id: number;
	correct: boolean;
};
