import { useState } from "react";
import type { VocabularyItem } from "~/lib/learning.server";

export default function useMatchingPanel(items: VocabularyItem[]) {
	const [left, setLeft] = useState<number | null>(null);
	const [matched, setMatched] = useState<number[]>([]);
	const [mistakes, setMistakes] = useState<number[]>([]);
	const [message, setMessage] = useState("Choose a Korean word, then its meaning.");
	const meanings = [...items].sort((a, b) => ((a.id * 11) % 17) - ((b.id * 11) % 17));

	function chooseMeaning(id: number) {
		if (left === null || matched.includes(id)) return;
		if (left === id) {
			setMatched((current) => [...current, id]);
			setMessage("정답이에요! Keep the combo going.");
		} else {
			setMistakes((current) => [...new Set([...current, left, id])]);
			setMessage("Not quite. Both words will enter your review schedule.");
		}
		setLeft(null);
	}

	return { left, setLeft, matched, mistakes, message, meanings, chooseMeaning };
}
