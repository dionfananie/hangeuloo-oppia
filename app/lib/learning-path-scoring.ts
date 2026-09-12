// learning-path-scoring.ts — pure, dependency-free check scoring rules.
// Kept separate from D1 so it can be unit-tested with node:test.

export type CheckChoice = {
	id: string;
	label: string;
};

export type CheckQuestion = {
	id: string;
	category: string;
	prompt: string;
	choices: CheckChoice[];
	answer: string;
	explanation: string;
};

export type CheckSubmission = {
	itemId: string;
	answerId: string;
};

export type CategoryScore = {
	category: string;
	correct: number;
	total: number;
};

export type CheckItemResult = {
	itemId: string;
	correct: boolean;
	correctAnswer: string;
	explanation: string;
};

export type CheckScore = {
	correctCount: number;
	totalCount: number;
	score: number;
	passed: boolean;
	categories: CategoryScore[];
	results: CheckItemResult[];
};

export const PASS_THRESHOLD_PERCENT = 80;

export function normalizeKorean(text: string): string {
	return text.normalize("NFC").trim();
}

export function scoreCheck(questions: CheckQuestion[], submissions: CheckSubmission[]): CheckScore {
	const answerMap = new Map(submissions.map((submission) => [submission.itemId, submission.answerId]));
	let correctCount = 0;
	const byCategory = new Map<string, { correct: number; total: number }>();
	const results: CheckItemResult[] = questions.map((question) => {
		const chosen = answerMap.get(question.id);
		const isCorrect = Boolean(chosen) && chosen === question.answer;
		if (isCorrect) correctCount += 1;
		const bucket = byCategory.get(question.category) ?? { correct: 0, total: 0 };
		bucket.total += 1;
		if (isCorrect) bucket.correct += 1;
		byCategory.set(question.category, bucket);
		return {
			itemId: question.id,
			correct: isCorrect,
			correctAnswer: question.answer,
			explanation: question.explanation,
		};
	});
	const totalCount = questions.length;
	const score = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
	const categories: CategoryScore[] = [...byCategory.entries()].map(([category, value]) => ({
		category,
		correct: value.correct,
		total: value.total,
	}));
	const everyCategoryHasCorrect = categories.every((category) => category.correct >= 1);
	const passed = score >= PASS_THRESHOLD_PERCENT && everyCategoryHasCorrect;
	return { correctCount, totalCount, score, passed, categories, results };
}
