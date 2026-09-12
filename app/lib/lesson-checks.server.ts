import type { GuideLanguage } from "./learning.server";
import { authorizePathNode } from "./learning-path.server";
import { findRemediationCandidates } from "./learning-path-graph";
import {
	scoreCheck,
	type CheckChoice,
	type CheckQuestion,
	type CheckSubmission,
} from "./learning-path-scoring";
import { recordActivity } from "./learning-activity.server";
import type { LessonExperience } from "./lesson-experience.server";

export type { CheckSubmission };

export type PublicCheckQuestion = {
	id: string;
	category: string;
	prompt: string;
	choices: CheckChoice[];
};

export type CheckResultPayload = {
	node: { id: string; title: string; description: string };
	questions: PublicCheckQuestion[];
};

export type CheckSubmissionResult = {
	node: { id: string; title: string };
	correctCount: number;
	totalCount: number;
	score: number;
	passed: boolean;
	replay: boolean;
	results: Array<{ itemId: string; correct: boolean; correctAnswer: string; explanation: string }>;
	remediationNodeIds: string[];
};

type CheckItemRow = {
	id: string;
	category: string;
	prompt_id: string;
	prompt_en: string;
	choices: string;
	answer: string;
	explanation_id: string;
	explanation_en: string;
	item_order: number;
};

function localized(row: Record<string, unknown>, field: string, language: GuideLanguage): string {
	return String(row[`${field}_${language}`]);
}

async function loadCheckQuestions(
	db: D1Database,
	nodeId: string,
	language: GuideLanguage,
): Promise<CheckQuestion[]> {
	const items = await db
		.prepare("SELECT * FROM curriculum_check_items WHERE check_node_id = ? ORDER BY item_order")
		.bind(nodeId)
		.all<CheckItemRow>();
	return items.results.map((row) => ({
		id: row.id,
		category: row.category,
		prompt: localized(row, "prompt", language),
		choices: JSON.parse(row.choices) as CheckChoice[],
		answer: row.answer,
		explanation: localized(row, "explanation", language),
	}));
}

function dedupeSubmissions(submissions: CheckSubmission[]): CheckSubmission[] {
	const map = new Map<string, string>();
	for (const submission of submissions) map.set(submission.itemId, submission.answerId);
	return [...map.entries()].map(([itemId, answerId]) => ({ itemId, answerId }));
}

export async function getCheckQuestions(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
): Promise<CheckResultPayload> {
	const { node, language } = await authorizePathNode(db, userId, experience, nodeId, ["check"]);
	const questions = await loadCheckQuestions(db, nodeId, language);
	return {
		node: {
			id: node.id,
			title: localized(node, "title", language),
			description: localized(node, "description", language),
		},
		questions: questions.map((question) => ({
			id: question.id,
			category: question.category,
			prompt: question.prompt,
			choices: question.choices,
		})),
	};
}

export async function submitCheck(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
	idempotencyKey: string,
	submissions: CheckSubmission[],
): Promise<CheckSubmissionResult> {
	const { node, graph, language } = await authorizePathNode(db, userId, experience, nodeId, ["check"]);
	const questions = await loadCheckQuestions(db, nodeId, language);
	const remediationNodeIds = findRemediationCandidates(nodeId, graph.state);
	const buildResult = (scored: ReturnType<typeof scoreCheck>, replay: boolean): CheckSubmissionResult => ({
		node: { id: node.id, title: localized(node, "title", language) },
		correctCount: scored.correctCount,
		totalCount: scored.totalCount,
		score: scored.score,
		passed: scored.passed,
		replay,
		results: scored.results,
		remediationNodeIds: scored.passed ? [] : remediationNodeIds,
	});

	const existing = await db
		.prepare(
			"SELECT submitted_answers, passed, correct_count, total_count, score FROM user_curriculum_check_attempts WHERE user_id = ? AND check_node_id = ? AND idempotency_key = ?",
		)
		.bind(userId, nodeId, idempotencyKey)
		.first<{
			submitted_answers: string;
			passed: number;
			correct_count: number;
			total_count: number;
			score: number;
		}>();
	if (existing) {
		const stored = JSON.parse(existing.submitted_answers) as CheckSubmission[];
		const replayScore = scoreCheck(questions, stored);
		if (Number(existing.passed) === 1) {
			await recordActivity(db, userId, {
				sourceType: "check",
				sourceId: nodeId,
				xp: Number(node.xp_reward),
				correctCount: Number(existing.correct_count),
				totalCount: Number(existing.total_count),
			});
		}
		return buildResult(replayScore, true);
	}

	const normalized = dedupeSubmissions(submissions);
	const scored = scoreCheck(questions, normalized);
	try {
		await db
			.prepare(
				`INSERT INTO user_curriculum_check_attempts
				(id, idempotency_key, user_id, check_node_id, submitted_answers, correct_count, total_count, score, passed)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				crypto.randomUUID(),
				idempotencyKey,
				userId,
				nodeId,
				JSON.stringify(normalized),
				scored.correctCount,
				scored.totalCount,
				scored.score,
				scored.passed ? 1 : 0,
			)
			.run();
	} catch {
		const raced = await db
			.prepare(
				"SELECT submitted_answers FROM user_curriculum_check_attempts WHERE user_id = ? AND check_node_id = ? AND idempotency_key = ?",
			)
			.bind(userId, nodeId, idempotencyKey)
			.first<{ submitted_answers: string }>();
		if (raced) {
			const stored = JSON.parse(raced.submitted_answers) as CheckSubmission[];
			return buildResult(scoreCheck(questions, stored), true);
		}
		throw new Response("Could not record your attempt", { status: 500 });
	}
	if (scored.passed) {
		await recordActivity(db, userId, {
			sourceType: "check",
			sourceId: nodeId,
			xp: Number(node.xp_reward),
			correctCount: scored.correctCount,
			totalCount: scored.totalCount,
		});
	}
	return buildResult(scored, false);
}
