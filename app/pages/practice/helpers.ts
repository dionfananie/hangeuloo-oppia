import type { VocabularyItem } from "~/lib/learning.server";
import type { PracticeAnswer, PracticeMode, PracticeModeDetails } from "./types";

export const practiceModes: PracticeModeDetails[] = [
	{
		id: "korean-to-meaning",
		title: "Korean to meaning",
		description: "Read a Korean word and choose its meaning.",
		icon: "message",
		color: "purple",
	},
	{
		id: "meaning-to-korean",
		title: "Meaning to Korean",
		description: "Turn a familiar meaning into Korean.",
		icon: "book",
		color: "blue",
	},
	{
		id: "image-guess",
		title: "Image guessing",
		description: "Recognize the word from a visual clue.",
		icon: "sparkles",
		color: "mint",
	},
	{
		id: "match",
		title: "Match pairs",
		description: "Connect Korean words with their meanings.",
		icon: "game",
		color: "coral",
	},
];

export const practiceModeLabels: Record<PracticeMode, string> = Object.fromEntries(
	practiceModes.map(({ id, title }) => [id, title]),
) as Record<PracticeMode, string>;

export function isPracticeMode(value: string): value is PracticeMode {
	return value in practiceModeLabels;
}

export function getAnswerValue(item: VocabularyItem, mode: PracticeMode) {
	return mode === "meaning-to-korean" || mode === "image-guess" ? item.korean : item.meaning;
}

export function getPracticeChoices(item: VocabularyItem, words: VocabularyItem[]) {
	return [item, ...words.filter((word) => word.id !== item.id).slice(0, 3)].sort(() => Math.random() - 0.5);
}

export function getCompletionResults(answers: PracticeAnswer[], answer: PracticeAnswer) {
	return [...answers, answer];
}
