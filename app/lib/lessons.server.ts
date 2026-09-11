import type { GuideLanguage } from "./learning.server";

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";
export type LessonPracticeType = "vocabulary" | "sentence" | "listening";

export type LessonSummary = {
	id: string;
	level: number;
	title: string;
	description: string;
	estimatedMinutes: number;
	practiceType: LessonPracticeType;
	xpReward: number;
	itemCount: number;
	currentItemIndex: number;
	progress: number;
	status: LessonStatus;
};

export type LessonLevelSummary = {
	level: number;
	name: string;
	description: string;
	lessonCount: number;
	itemCount: number;
	estimatedMinutes: number;
	completedCount: number;
	progress: number;
	locked: boolean;
	lessons: LessonSummary[];
};

export type LessonCatalog = {
	guideLanguage: GuideLanguage;
	currentLevel: number;
	levels: LessonLevelSummary[];
	continueLesson: LessonSummary | null;
	completedLessons: number;
	totalLessons: number;
};

export type LessonItem = {
	id: string;
	type: "character" | "word" | "sentence";
	koreanText: string;
	romanization: string;
	translation: string;
	pronunciation: string;
	explanation: string;
	exampleKo: string;
	example: string;
	audioUrl: string | null;
};

export type LessonDetail = LessonSummary & {
	items: LessonItem[];
	nextLessonId: string | null;
};

type LessonRow = Record<string, unknown> & {
	id: string;
	level: number;
	lesson_order: number;
	item_count: number;
	status: "in_progress" | "completed" | null;
	current_item_index: number | null;
};

const levelCopy = {
	id: [
		["Hangul Starter", "Kenali huruf dan baca blok Hangul dasar."],
		["First Korean", "Gunakan salam dan kalimat sopan sehari-hari."],
		["Daily Korean", "Pahami percakapan singkat tentang aktivitas harian."],
	],
	en: [
		["Hangul Starter", "Recognize letters and read basic Hangul blocks."],
		["First Korean", "Use greetings and polite everyday sentences."],
		["Daily Korean", "Understand short conversations about daily life."],
	],
} as const;

function localized(row: Record<string, unknown>, field: string, language: GuideLanguage) {
	return String(row[`${field}_${language}`]);
}

export function deriveLessonStatus(
	storedStatus: "in_progress" | "completed" | null,
	unlocked: boolean,
): LessonStatus {
	return storedStatus === "completed"
		? "completed"
		: storedStatus === "in_progress"
			? "in_progress"
			: unlocked
				? "available"
				: "locked";
}

export function calculateLessonProgress(status: LessonStatus, currentItemIndex: number, itemCount: number) {
	if (status === "completed") return 100;
	if (status !== "in_progress" || itemCount < 1) return 0;
	return Math.round(((Math.min(Math.max(0, currentItemIndex), itemCount - 1) + 1) / itemCount) * 100);
}

export function levelAfterCompletion(currentLevel: number, completedLevel: number, isLastLesson: boolean) {
	return isLastLesson && currentLevel === completedLevel ? Math.min(2, currentLevel + 1) : currentLevel;
}

async function getProfile(db: D1Database, userId: string) {
	return db
		.prepare("SELECT guide_language, level FROM learning_profiles WHERE user_id = ?")
		.bind(userId)
		.first<{ guide_language: GuideLanguage; level: number }>();
}

function mapSummary(row: LessonRow, language: GuideLanguage, unlocked: boolean): LessonSummary {
	const itemCount = Number(row.item_count);
	const currentItemIndex = Math.min(
		Math.max(0, Number(row.current_item_index ?? 0)),
		Math.max(0, itemCount - 1),
	);
	const status = deriveLessonStatus(row.status, unlocked);
	return {
		id: String(row.id),
		level: Number(row.level),
		title: localized(row, "title", language),
		description: localized(row, "description", language),
		estimatedMinutes: Number(row.estimated_minutes),
		practiceType: row.practice_type as LessonPracticeType,
		xpReward: Number(row.xp_reward),
		itemCount,
		currentItemIndex,
		progress: calculateLessonProgress(status, currentItemIndex, itemCount),
		status,
	};
}

export async function getLessonCatalog(db: D1Database, userId: string): Promise<LessonCatalog | null> {
	const profile = await getProfile(db, userId);
	if (!profile) return null;
	const result = await db
		.prepare(
			`SELECT l.*,
		(SELECT COUNT(*) FROM lesson_items li WHERE li.lesson_id = l.id) item_count,
		p.status, p.current_item_index
		FROM lessons l LEFT JOIN user_lesson_progress p ON p.lesson_id = l.id AND p.user_id = ?
		ORDER BY l.level, l.lesson_order`,
		)
		.bind(userId)
		.all<LessonRow>();
	const completed = new Set(result.results.filter((row) => row.status === "completed").map((row) => row.id));
	const summaries = result.results.map((row) => {
		const previous = result.results.find(
			(candidate) => candidate.level === row.level && candidate.lesson_order === row.lesson_order - 1,
		);
		const unlocked = row.level <= profile.level && (!previous || completed.has(previous.id));
		return mapSummary(row, profile.guide_language, unlocked);
	});
	const levels = [0, 1, 2].map((level): LessonLevelSummary => {
		const lessons = summaries.filter((lesson) => lesson.level === level);
		const completedCount = lessons.filter((lesson) => lesson.status === "completed").length;
		const copy = levelCopy[profile.guide_language][level];
		return {
			level,
			name: copy[0],
			description: copy[1],
			lessonCount: lessons.length,
			itemCount: lessons.reduce((total, lesson) => total + lesson.itemCount, 0),
			estimatedMinutes: lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0),
			completedCount,
			progress: lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0,
			locked: level > profile.level,
			lessons,
		};
	});
	const currentLevelLessons = summaries.filter((lesson) => lesson.level === profile.level);
	const continueLesson =
		currentLevelLessons.find((lesson) => lesson.status === "in_progress") ??
		currentLevelLessons.find((lesson) => lesson.status === "available") ??
		summaries.find((lesson) => lesson.status === "in_progress" || lesson.status === "available") ??
		summaries.find((lesson) => lesson.status === "completed") ??
		null;
	return {
		guideLanguage: profile.guide_language,
		currentLevel: profile.level,
		levels,
		continueLesson,
		completedLessons: summaries.filter((lesson) => lesson.status === "completed").length,
		totalLessons: summaries.length,
	};
}

async function getAccessibleLessonRow(db: D1Database, userId: string, lessonId: string) {
	const row = await db
		.prepare(
			`SELECT l.*,
		(SELECT COUNT(*) FROM lesson_items li WHERE li.lesson_id = l.id) item_count,
		p.status, p.current_item_index,
		lp.level profile_level, lp.guide_language,
		(SELECT COUNT(*) FROM lessons previous
			WHERE previous.level = l.level AND previous.lesson_order < l.lesson_order
			AND NOT EXISTS (SELECT 1 FROM user_lesson_progress done WHERE done.user_id = ? AND done.lesson_id = previous.id AND done.status = 'completed')) incomplete_prerequisites
		FROM lessons l JOIN learning_profiles lp ON lp.user_id = ?
		LEFT JOIN user_lesson_progress p ON p.lesson_id = l.id AND p.user_id = ?
		WHERE l.id = ?`,
		)
		.bind(userId, userId, userId, lessonId)
		.first<
			LessonRow & {
				profile_level: number;
				guide_language: GuideLanguage;
				incomplete_prerequisites: number;
			}
		>();
	if (!row) throw new Response("Lesson not found", { status: 404 });
	if (row.level > row.profile_level || Number(row.incomplete_prerequisites) > 0)
		throw new Response("Complete the previous lesson first", { status: 403 });
	return row;
}

export async function getLessonDetail(
	db: D1Database,
	userId: string,
	lessonId: string,
): Promise<LessonDetail> {
	const lesson = await getAccessibleLessonRow(db, userId, lessonId);
	const [itemsResult, nextLesson] = await Promise.all([
		db
			.prepare("SELECT * FROM lesson_items WHERE lesson_id = ? ORDER BY item_order")
			.bind(lessonId)
			.all<Record<string, unknown>>(),
		db
			.prepare("SELECT id FROM lessons WHERE level = ? AND lesson_order > ? ORDER BY lesson_order LIMIT 1")
			.bind(lesson.level, lesson.lesson_order)
			.first<{ id: string }>(),
	]);
	const language = lesson.guide_language;
	return {
		...mapSummary(lesson, language, true),
		items: itemsResult.results.map((item) => {
			return {
				id: String(item.id),
				type: item.type as LessonItem["type"],
				koreanText: String(item.korean_text),
				romanization: String(item.romanization),
				translation: localized(item, "translation", language),
				pronunciation: localized(item, "pronunciation", language),
				explanation: localized(item, "explanation", language),
				exampleKo: String(item.example_ko),
				example: localized(item, "example", language),
				audioUrl: item.audio_url ? String(item.audio_url) : null,
			};
		}),
		nextLessonId: nextLesson?.id ?? null,
	};
}

export async function viewLessonItem(db: D1Database, userId: string, lessonId: string, itemIndex: number) {
	const lesson = await getAccessibleLessonRow(db, userId, lessonId);
	if (!Number.isFinite(itemIndex) || !Number.isInteger(itemIndex))
		throw new Response("Invalid lesson item", { status: 400 });
	const safeIndex = itemIndex;
	if (safeIndex < 0 || safeIndex >= Number(lesson.item_count))
		throw new Response("Invalid lesson item", { status: 400 });
	const furthestAllowed =
		lesson.status === "completed"
			? Number(lesson.item_count) - 1
			: lesson.status === "in_progress"
				? Number(lesson.current_item_index) + 1
				: 0;
	if (safeIndex > furthestAllowed) throw new Response("Complete lesson items in order", { status: 400 });
	await db
		.prepare(
			`INSERT INTO user_lesson_progress (user_id, lesson_id, status, current_item_index)
		VALUES (?, ?, 'in_progress', ?) ON CONFLICT(user_id, lesson_id) DO UPDATE SET
		current_item_index = MAX(current_item_index, excluded.current_item_index),
		last_accessed_at = CURRENT_TIMESTAMP`,
		)
		.bind(userId, lessonId, safeIndex)
		.run();
	return safeIndex;
}

const lessonEventTypes = new Set([
	"lesson_opened",
	"item_viewed",
	"audio_played",
	"audio_replayed",
	"audio_error",
	"speed_changed",
	"translation_revealed",
	"lesson_completed",
	"practice_clicked",
]);

export async function recordLessonEvent(
	db: D1Database,
	userId: string,
	lessonId: string,
	eventType: string,
	itemId?: string,
	value?: string,
) {
	if (!lessonEventTypes.has(eventType)) return;
	await getAccessibleLessonRow(db, userId, lessonId);
	const validItem = itemId
		? await db
				.prepare("SELECT id FROM lesson_items WHERE id = ? AND lesson_id = ?")
				.bind(itemId, lessonId)
				.first<{ id: string }>()
		: null;
	await db
		.prepare(
			"INSERT INTO lesson_events (id, user_id, lesson_id, lesson_item_id, event_type, event_value) VALUES (?, ?, ?, ?, ?, ?)",
		)
		.bind(
			crypto.randomUUID(),
			userId,
			lessonId,
			validItem?.id ?? null,
			eventType,
			value?.slice(0, 100) ?? null,
		)
		.run();
}

export async function completeLesson(
	db: D1Database,
	userId: string,
	lessonId: string,
	lastItemIndex: number,
) {
	const lesson = await getAccessibleLessonRow(db, userId, lessonId);
	if (
		!Number.isFinite(lastItemIndex) ||
		!Number.isInteger(lastItemIndex) ||
		lastItemIndex !== Number(lesson.item_count) - 1
	)
		throw new Response("Finish every item before completing this lesson", { status: 400 });
	if (lesson.status === "completed") {
		return {
			xp: 0,
			vocabularyAdded: 0,
			nextLessonId: await getNextLessonId(db, lesson),
			practiceType: lesson.practice_type as LessonPracticeType,
		};
	}
	if (lesson.status !== "in_progress" || Number(lesson.current_item_index) < Number(lesson.item_count) - 1)
		throw new Response("Finish every item before completing this lesson", { status: 400 });
	const completion = await db
		.prepare(
			`UPDATE user_lesson_progress SET status = 'completed', completed_at = CURRENT_TIMESTAMP,
		last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND lesson_id = ? AND status = 'in_progress' AND current_item_index >= ?`,
		)
		.bind(userId, lessonId, Number(lesson.item_count) - 1)
		.run();
	if (Number(completion.meta.changes) === 0) {
		return {
			xp: 0,
			vocabularyAdded: 0,
			nextLessonId: await getNextLessonId(db, lesson),
			practiceType: lesson.practice_type as LessonPracticeType,
		};
	}
	const [vocabulary, nextInLevel] = await Promise.all([
		db
			.prepare(
				`SELECT DISTINCT li.vocabulary_id id FROM lesson_items li
			LEFT JOIN user_vocabulary_progress p ON p.user_id = ? AND p.vocabulary_id = li.vocabulary_id
			WHERE li.lesson_id = ? AND li.vocabulary_id IS NOT NULL AND p.vocabulary_id IS NULL`,
			)
			.bind(userId, lessonId)
			.all<{ id: number }>(),
		db
			.prepare("SELECT id FROM lessons WHERE level = ? AND lesson_order > ? ORDER BY lesson_order LIMIT 1")
			.bind(lesson.level, lesson.lesson_order)
			.first<{ id: string }>(),
	]);
	const nextProfileLevel = levelAfterCompletion(
		Number(lesson.profile_level),
		Number(lesson.level),
		!nextInLevel,
	);
	const xp = Number(lesson.xp_reward);
	const statements = [
		db
			.prepare("INSERT OR IGNORE INTO practice_unlocks (user_id, lesson_id, practice_type) VALUES (?, ?, ?)")
			.bind(userId, lessonId, lesson.practice_type),
		db
			.prepare(
				`INSERT INTO daily_progress (user_id, activity_date, xp, activities_completed, correct_answers, total_answers)
			VALUES (?, date('now'), ?, 1, 0, 0) ON CONFLICT(user_id, activity_date) DO UPDATE SET
			xp = xp + excluded.xp, activities_completed = activities_completed + 1`,
			)
			.bind(userId, xp),
		db
			.prepare(
				"INSERT INTO lesson_events (id, user_id, lesson_id, event_type) VALUES (?, ?, ?, 'lesson_completed')",
			)
			.bind(crypto.randomUUID(), userId, lessonId),
	];
	if (nextProfileLevel > Number(lesson.profile_level)) {
		statements.push(
			db
				.prepare(
					"UPDATE learning_profiles SET level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND level = ?",
				)
				.bind(nextProfileLevel, userId, lesson.profile_level),
		);
	}
	for (const item of vocabulary.results) {
		statements.push(
			db
				.prepare(
					`INSERT OR IGNORE INTO user_vocabulary_progress
			(user_id, vocabulary_id, memory_state, interval_index, due_at, attempts, correct_count)
			VALUES (?, ?, 'new', 0, CURRENT_TIMESTAMP, 0, 0)`,
				)
				.bind(userId, item.id),
		);
	}
	if (vocabulary.results.length) {
		statements.push(
			db
				.prepare(
					"INSERT OR IGNORE INTO practice_unlocks (user_id, lesson_id, practice_type) VALUES (?, ?, 'review')",
				)
				.bind(userId, lessonId),
		);
	}
	await db.batch(statements);
	lesson.profile_level = nextProfileLevel;
	return {
		xp,
		vocabularyAdded: vocabulary.results.length,
		nextLessonId: await getNextLessonId(db, lesson),
		practiceType: lesson.practice_type as LessonPracticeType,
	};
}

async function getNextLessonId(db: D1Database, lesson: LessonRow & { profile_level: number }) {
	const next = await db
		.prepare(
			`SELECT id FROM lessons WHERE
		(level = ? AND lesson_order > ?) OR (level > ? AND level <= ?)
		ORDER BY level, lesson_order LIMIT 1`,
		)
		.bind(lesson.level, lesson.lesson_order, lesson.level, lesson.profile_level)
		.first<{ id: string }>();
	return next?.id ?? null;
}

export async function getPracticeUnlocks(db: D1Database, userId: string) {
	const result = await db
		.prepare("SELECT DISTINCT practice_type FROM practice_unlocks WHERE user_id = ?")
		.bind(userId)
		.all<{ practice_type: string }>();
	return result.results.map((row) => row.practice_type);
}
