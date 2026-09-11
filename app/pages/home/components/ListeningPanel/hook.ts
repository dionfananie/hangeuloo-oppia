import { useState } from "react";
import type { ListeningExercise } from "~/lib/learning.server";
import { normalizeKorean } from "../../helpers";

export default function useListeningPanel(exercise: ListeningExercise) {
	const [answer, setAnswer] = useState("");
	const [speed, setSpeed] = useState(1);
	const [showHelp, setShowHelp] = useState(false);
	const [result, setResult] = useState<"correct" | "wrong" | null>(null);
	const correct = normalizeKorean(answer) === normalizeKorean(exercise.answer);

	function checkAnswer() {
		setResult(correct ? "correct" : "wrong");
	}

	return {
		answer,
		setAnswer,
		speed,
		setSpeed,
		showHelp,
		setShowHelp,
		result,
		correct,
		checkAnswer,
	};
}
