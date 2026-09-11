import { useState } from "react";
import type { VocabularyItem } from "~/lib/learning.server";

export default function useReviewPanel(item: VocabularyItem, choices: VocabularyItem[]) {
	const [selected, setSelected] = useState<number | null>(null);
	const options = [item, ...choices.filter((choice) => choice.id !== item.id).slice(0, 3)].sort(
		(a, b) => ((a.id * 7) % 13) - ((b.id * 7) % 13),
	);
	const correct = selected === item.id;
	return { selected, setSelected, options, correct };
}
