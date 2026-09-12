import type { GuideLanguage } from "./learning.server";
import { authorizePathNode } from "./learning-path.server";
import { recordActivity } from "./learning-activity.server";
import type { LessonExperience } from "./lesson-experience.server";

export type PracticeChoice = { id: string; label: string };

export type PracticeQuestion = {
	id: string;
	korean: string;
	romanization: string;
	choices: PracticeChoice[];
};

export type PracticePayload = {
	node: { id: string; title: string; description: string };
	questions: PracticeQuestion[];
};

export type PracticeSubmission = {
	itemId: string;
	answerId: string;
};

export type PracticeResult = {
	node: { id: string; title: string };
	correctCount: number;
	totalCount: number;
	completed: boolean;
	replay: boolean;
};

type ResolvedPracticeItem = {
	id: string;
	korean: string;
	romanization: string;
	meaning: string;
};

function localized(row: Record<string, unknown>, field: string, language: GuideLanguage): string {
	return String(row[`${field}_${language}`]);
}

async function resolvePracticeItems(
	db: D1Database,
	nodeId: string,
	language: GuideLanguage,
): Promise<ResolvedPracticeItem[]> {
	const rows = await db
		.prepare(
			"SELECT id, exercise_kind, source_type, source_ref FROM curriculum_practice_items WHERE practice_node_id = ? ORDER BY item_order",
		)
		.bind(nodeId)
		.all<{ id: string; exercise_kind: string; source_type: string; source_ref: string }>();
	const resolved: ResolvedPracticeItem[] = [];
	const nodeRefs = rows.results.filter((row) => row.source_type === "node_item").map((row) => row.source_ref);
	const vocabRefs = rows.results
		.filter((row) => row.source_type === "vocabulary")
		.map((row) => row.source_ref);
	if (nodeRefs.length) {
		const items = await db
			.prepare(
				`SELECT ni.id, ni.korean_text, ni.romanization, ni.translation_id, ni.translation_en
				FROM curriculum_node_items ni WHERE ni.id IN (${nodeRefs.map(() => "?").join(",")})`,
			)
			.bind(...nodeRefs)
			.all<{
				id: string;
				korean_text: string;
				romanization: string;
				translation_id: string;
				translation_en: string;
			}>();
		const byId = new Map(items.results.map((item) => [item.id, item]));
		for (const row of rows.results.filter((candidate) => candidate.source_type === "node_item")) {
			const item = byId.get(row.source_ref);
			if (item)
				resolved.push({
					id: row.id,
					korean: item.korean_text,
					romanization: item.romanization,
					meaning: localized(item, "translation", language),
				});
		}
	}
	if (vocabRefs.length) {
		const items = await db
			.prepare(
				`SELECT id, korean, romanization, meaning_id, meaning_en
				FROM vocabulary_items WHERE id IN (${vocabRefs.map(() => "?").join(",")})`,
			)
			.bind(...vocabRefs)
			.all<{ id: number; korean: string; romanization: string; meaning_id: string; meaning_en: string }>();
		const byId = new Map(items.results.map((item) => [String(item.id), item]));
		for (const row of rows.results.filter((candidate) => candidate.source_type === "vocabulary")) {
			const item = byId.get(row.source_ref);
			if (item)
				resolved.push({
					id: row.id,
					korean: item.korean,
					romanization: item.romanization,
					meaning: localized(item, "meaning", language),
				});
		}
	}
	return resolved;
}

function buildChoices(items: ResolvedPracticeItem[]): PracticeChoice[] {
	const choices = [...new Set(items.map((item) => item.meaning))].map((meaning) => ({
		id: meaning,
		label: meaning,
	}));
	return choices.sort((left, right) => left.label.localeCompare(right.label));
}

export async function getPracticeQuestions(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
): Promise<PracticePayload> {
	const { node, language } = await authorizePathNode(db, userId, experience, nodeId, ["practice"]);
	const items = await resolvePracticeItems(db, nodeId, language);
	const choices = buildChoices(items);
	return {
		node: {
			id: node.id,
			title: localized(node, "title", language),
			description: localized(node, "description", language),
		},
		questions: items.map((item) => ({
			id: item.id,
			korean: item.korean,
			romanization: item.romanization,
			choices,
		})),
	};
}

export async function submitPractice(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
	idempotencyKey: string,
	submissions: PracticeSubmission[],
): Promise<PracticeResult> {
	const { node, language } = await authorizePathNode(db, userId, experience, nodeId, ["practice"]);
	const items = await resolvePracticeItems(db, nodeId, language);
	const meaningById = new Map(items.map((item) => [item.id, item.meaning]));
	const answerMap = new Map(submissions.map((submission) => [submission.itemId, submission.answerId]));
	let correctCount = 0;
	for (const item of items) {
		if (answerMap.get(item.id) === item.meaning) correctCount += 1;
	}
	const totalCount = items.length;
	const existing = await db
		.prepare(
			"SELECT id FROM user_curriculum_practice_attempts WHERE user_id = ? AND practice_node_id = ? AND idempotency_key = ?",
		)
		.bind(userId, nodeId, idempotencyKey)
		.first<{ id: string }>();
	if (!existing) {
		await db
			.prepare(
				`INSERT INTO user_curriculum_practice_attempts
				(id, idempotency_key, user_id, practice_node_id, submitted_answers, correct_count, total_count, completed)
				VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
			)
			.bind(
				crypto.randomUUID(),
				idempotencyKey,
				userId,
				nodeId,
				JSON.stringify(submissions),
				correctCount,
				totalCount,
			)
			.run();
		await db
			.prepare(
				`INSERT INTO user_curriculum_node_progress (user_id, node_id, status, current_item_index)
				VALUES (?, ?, 'completed', 0)
				ON CONFLICT(user_id, node_id) DO UPDATE SET status = 'completed', completed_at = CURRENT_TIMESTAMP`,
			)
			.bind(userId, nodeId)
			.run();
		await recordActivity(db, userId, {
			sourceType: "practice",
			sourceId: nodeId,
			xp: Number(node.xp_reward),
			correctCount,
			totalCount,
		});
	}
	void meaningById;
	return {
		node: { id: node.id, title: localized(node, "title", language) },
		correctCount,
		totalCount,
		completed: true,
		replay: Boolean(existing),
	};
}
