import { useState } from "react";
import type { SentenceExercise } from "~/lib/learning.server";

export default function useSentencePanel(exercise: SentenceExercise) {
	const [sentence, setSentence] = useState<string[]>([]);
	const [result, setResult] = useState<"correct" | "wrong" | null>(null);
	const correct = sentence.join(" ") === exercise.answer;

	function appendToken(word: string) {
		setSentence([...sentence, word]);
	}

	function removeToken(index: number) {
		setSentence(sentence.filter((_, position) => position !== index));
	}

	function checkAnswer() {
		setResult(correct ? "correct" : "wrong");
	}

	return { sentence, result, correct, appendToken, removeToken, checkAnswer };
}
