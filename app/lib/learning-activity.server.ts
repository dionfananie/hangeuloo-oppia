// learning-activity.server.ts — exactly-once rewards and vocabulary enrollment for the
// learning path. The learning_activity_ledger primary key guarantees a source node is
// rewarded only once; the AFTER INSERT trigger keeps daily_progress in sync.

export type ActivitySourceType = "lesson" | "check" | "practice";

export async function recordActivity(
	db: D1Database,
	userId: string,
	options: {
		sourceType: ActivitySourceType;
		sourceId: string;
		xp: number;
		correctCount?: number;
		totalCount?: number;
	},
): Promise<boolean> {
	const result = await db
		.prepare(
			`INSERT INTO learning_activity_ledger
			(user_id, source_type, source_id, xp, correct_count, total_count, activity_date)
			VALUES (?, ?, ?, ?, ?, ?, date('now'))
			ON CONFLICT(user_id, source_type, source_id) DO NOTHING`,
		)
		.bind(
			userId,
			options.sourceType,
			options.sourceId,
			Math.max(0, options.xp),
			options.correctCount ?? 0,
			options.totalCount ?? 0,
		)
		.run();
	return Number(result.meta.changes) > 0;
}

export async function enrollVocabulary(
	db: D1Database,
	userId: string,
	vocabularyIds: number[],
): Promise<number> {
	const uniqueIds = [...new Set(vocabularyIds)];
	if (uniqueIds.length === 0) return 0;
	const statements = uniqueIds.map((id) =>
		db
			.prepare(
				`INSERT OR IGNORE INTO user_vocabulary_progress
				(user_id, vocabulary_id, memory_state, interval_index, due_at, attempts, correct_count)
				VALUES (?, ?, 'new', 0, CURRENT_TIMESTAMP, 0, 0)`,
			)
			.bind(userId, id),
	);
	await db.batch(statements);
	return uniqueIds.length;
}
