import assert from "node:assert/strict";
import test from "node:test";
import {
	normalizeKorean,
	scoreCheck,
	type CheckQuestion,
} from "../../app/lib/learning-path-scoring.ts";

function question(partial: Partial<CheckQuestion> & Pick<CheckQuestion, "id" | "category" | "answer">): CheckQuestion {
	return {
		prompt: partial.id,
		choices: [
			{ id: "a", label: "A" },
			{ id: "b", label: "B" },
		],
		explanation: "because",
		...partial,
	};
}

test("all correct answers produce a perfect passing score", () => {
	const result = scoreCheck(
		[
			question({ id: "q1", category: "recognition", answer: "a" }),
			question({ id: "q2", category: "recognition", answer: "b" }),
			question({ id: "q3", category: "sound", answer: "a" }),
			question({ id: "q4", category: "sound", answer: "b" }),
		],
		[
			{ itemId: "q1", answerId: "a" },
			{ itemId: "q2", answerId: "b" },
			{ itemId: "q3", answerId: "a" },
			{ itemId: "q4", answerId: "b" },
		],
	);
	assert.equal(result.score, 100);
	assert.equal(result.correctCount, 4);
	assert.equal(result.passed, true);
});

test("an unanswered item is marked incorrect", () => {
	const result = scoreCheck([question({ id: "q1", category: "recognition", answer: "a" })], []);
	assert.equal(result.correctCount, 0);
	assert.equal(result.score, 0);
	assert.equal(result.passed, false);
});

test("one miss in five items yields 80% and passes when every category has a correct", () => {
	const questions = [
		question({ id: "q1", category: "a", answer: "a" }),
		question({ id: "q2", category: "a", answer: "a" }),
		question({ id: "q3", category: "a", answer: "a" }),
		question({ id: "q4", category: "b", answer: "a" }),
		question({ id: "q5", category: "b", answer: "a" }),
	];
	const result = scoreCheck(
		questions,
		[
			{ itemId: "q1", answerId: "a" },
			{ itemId: "q2", answerId: "a" },
			{ itemId: "q3", answerId: "a" },
			{ itemId: "q4", answerId: "a" },
			{ itemId: "q5", answerId: "b" },
		],
	);
	assert.equal(result.score, 80);
	assert.equal(result.passed, true);
});

test("80% with an entire missed category still fails", () => {
	const questions = [
		question({ id: "q1", category: "a", answer: "a" }),
		question({ id: "q2", category: "a", answer: "a" }),
		question({ id: "q3", category: "a", answer: "a" }),
		question({ id: "q4", category: "a", answer: "a" }),
		question({ id: "q5", category: "b", answer: "a" }),
	];
	const result = scoreCheck(
		questions,
		[
			{ itemId: "q1", answerId: "a" },
			{ itemId: "q2", answerId: "a" },
			{ itemId: "q3", answerId: "a" },
			{ itemId: "q4", answerId: "a" },
			{ itemId: "q5", answerId: "b" },
		],
	);
	assert.equal(result.score, 80);
	assert.equal(result.passed, false);
});

test("normalizeKorean collapses composed and decomposed forms", () => {
	const decomposed = "안녕".normalize("NFD");
	assert.equal(normalizeKorean(decomposed), "안녕");
	assert.equal(normalizeKorean("  안녕  "), "안녕");
});
