import assert from "node:assert/strict";
import test from "node:test";
import { getAnswerValue, getCompletionResults, isPracticeMode } from "../app/pages/practice/helpers.ts";
import type { VocabularyItem } from "../app/lib/learning.server.ts";

const word: VocabularyItem = {
	id: 1,
	korean: "학교",
	romanization: "hakgyo",
	meaning: "school",
	topic: "places",
	formality: "neutral",
	exampleKo: "학교에 가요.",
	example: "I go to school.",
};

test("practice modes reject unknown route values", () => {
	assert.equal(isPracticeMode("image-guess"), true);
	assert.equal(isPracticeMode("unknown"), false);
});

test("answer values follow the selected practice mode", () => {
	assert.equal(getAnswerValue(word, "korean-to-meaning"), "school");
	assert.equal(getAnswerValue(word, "meaning-to-korean"), "학교");
});

test("completion results include the latest answer", () => {
	const results = getCompletionResults([{ id: 2, correct: false }], { id: 1, correct: true });
	assert.deepEqual(results, [
		{ id: 2, correct: false },
		{ id: 1, correct: true },
	]);
});
