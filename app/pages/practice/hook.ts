import { useMemo, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import type { Route } from "../../routes/+types/practice-vocabulary";
import { getAnswerValue, getPracticeChoices, getCompletionResults, isPracticeMode } from "./helpers";
import type { PracticeAnswer, PracticeMode } from "./types";

export default function useVocabularyPractice() {
	const { words, mode: initialMode } = useLoaderData<Route.ComponentProps["loaderData"]>();
	const mode: PracticeMode = isPracticeMode(initialMode) ? initialMode : "korean-to-meaning";
	const [index, setIndex] = useState(0);
	const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const fetcher = useFetcher<{ ok: boolean; xp?: number; error?: string }>();
	const item = words[index];
	const choices = useMemo(() => (item ? getPracticeChoices(item, words) : []), [item, words]);

	function answer(value: string, correct: boolean) {
		if (!item || selected) return;
		setSelected(value);
		setAnswers((current) => getCompletionResults(current, { id: item.id, correct }));
	}

	function next() {
		if (!item || !selected) return;
		const currentAnswer = answers.at(-1);
		if (!currentAnswer) return;
		if (index + 1 >= words.length) {
			setDone(true);
			fetcher.submit(
				{
					intent: "complete-session",
					results: JSON.stringify(answers),
					totalCount: String(words.length),
					gameType: "vocabulary",
				},
				{ method: "post" },
			);
			return;
		}
		setIndex((current) => current + 1);
		setSelected(null);
	}

	return {
		words,
		mode,
		index,
		answers,
		selected,
		done,
		fetcher,
		item,
		choices,
		answer,
		next,
		getAnswerValue,
	};
}
