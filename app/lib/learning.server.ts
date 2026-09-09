import type { AuthUser } from "./auth.server";
import type { InterviewScenario } from "./interview.server";

export type GuideLanguage = "id" | "en";

export type LearningProfile = {
	guideLanguage: GuideLanguage;
	goal: "conversation" | "job" | "topik" | "travel";
	level: number;
	interests: string[];
	dailyTarget: number;
};

export type VocabularyItem = {
	id: number;
	korean: string;
	romanization: string;
	meaning: string;
	topic: string;
	formality: string;
	exampleKo: string;
	example: string;
	memoryState?: string;
};

export type SentenceExercise = {
	id: number;
	prompt: string;
	tokens: string[];
	answer: string;
	grammarNote: string;
};

export type ListeningExercise = {
	id: number;
	mode: "dictation" | "fill_blank";
	audioText: string;
	prompt: string;
	answer: string;
	translation: string;
	note: string;
};

export type DashboardData = {
	profile: LearningProfile | null;
	stats: {
		totalXp: number;
		todayXp: number;
		todayActivities: number;
		streak: number;
		dueCount: number;
		masteredCount: number;
		practicedCount: number;
		totalVocabulary: number;
		weeklyXp: number;
		weekdays: boolean[];
	};
	vocabulary: VocabularyItem[];
	review: VocabularyItem[];
	sentence: SentenceExercise | null;
	listening: ListeningExercise | null;
	interviewScenarios: InterviewScenario[];
};

type ProfileRow = {
	guide_language: GuideLanguage;
	goal: LearningProfile["goal"];
	level: number;
	interests: string;
	daily_target: number;
};

function dateKey(date = new Date()) {
	return date.toISOString().slice(0, 10);
}

function daysAgo(days: number) {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() - days);
	return dateKey(date);
}

export async function ensureUser(db: D1Database, user: AuthUser) {
	await db.prepare(`INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name,
		picture = excluded.picture, updated_at = CURRENT_TIMESTAMP`)
		.bind(user.sub, user.email, user.name, user.picture ?? null).run();
}

export async function saveProfile(db: D1Database, userId: string, profile: LearningProfile) {
	await db.prepare(`INSERT INTO learning_profiles
		(user_id, guide_language, goal, level, interests, daily_target)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET guide_language = excluded.guide_language,
		goal = excluded.goal, level = excluded.level, interests = excluded.interests,
		daily_target = excluded.daily_target, updated_at = CURRENT_TIMESTAMP`)
		.bind(userId, profile.guideLanguage, profile.goal, profile.level, JSON.stringify(profile.interests), profile.dailyTarget).run();
}

function mapVocabulary(row: Record<string, unknown>, language: GuideLanguage): VocabularyItem {
	return {
		id: Number(row.id),
		korean: String(row.korean),
		romanization: String(row.romanization),
		meaning: String(row[language === "id" ? "meaning_id" : "meaning_en"]),
		topic: String(row.topic),
		formality: String(row.formality),
		exampleKo: String(row.example_ko),
		example: String(row[language === "id" ? "example_id" : "example_en"]),
		memoryState: row.memory_state ? String(row.memory_state) : undefined,
	};
}

export async function getDashboard(db: D1Database, userId: string): Promise<DashboardData> {
	const profileRow = await db.prepare("SELECT * FROM learning_profiles WHERE user_id = ?").bind(userId).first<ProfileRow>();
	if (!profileRow) {
		return {
			profile: null,
			stats: { totalXp: 0, todayXp: 0, todayActivities: 0, streak: 0, dueCount: 0, masteredCount: 0, practicedCount: 0, totalVocabulary: 0, weeklyXp: 0, weekdays: Array(7).fill(false) },
			vocabulary: [], review: [], sentence: null, listening: null, interviewScenarios: [],
		};
	}
	const profile: LearningProfile = {
		guideLanguage: profileRow.guide_language,
		goal: profileRow.goal,
		level: profileRow.level,
		interests: JSON.parse(profileRow.interests) as string[],
		dailyTarget: profileRow.daily_target,
	};
	const language = profile.guideLanguage;
	const [totals, today, due, vocab, review, sentenceRow, listeningRow, recentDays] = await Promise.all([
		db.prepare("SELECT COALESCE(SUM(xp), 0) total_xp, COALESCE(SUM(CASE WHEN activity_date >= ? THEN xp ELSE 0 END), 0) weekly_xp FROM daily_progress WHERE user_id = ?").bind(daysAgo(6), userId).first<{ total_xp: number; weekly_xp: number }>(),
		db.prepare("SELECT xp, activities_completed FROM daily_progress WHERE user_id = ? AND activity_date = ?").bind(userId, dateKey()).first<{ xp: number; activities_completed: number }>(),
		db.prepare(`SELECT SUM(CASE WHEN due_at <= CURRENT_TIMESTAMP THEN 1 ELSE 0 END) due_count,
		SUM(CASE WHEN memory_state = 'mastered' THEN 1 ELSE 0 END) mastered_count,
		COUNT(*) practiced_count FROM user_vocabulary_progress WHERE user_id = ?`).bind(userId).first<{ due_count: number; mastered_count: number; practiced_count: number }>(),
		db.prepare("SELECT * FROM vocabulary_items WHERE level <= ? ORDER BY ((id * 17) % 37) LIMIT 10").bind(profile.level).all<Record<string, unknown>>(),
		db.prepare(`SELECT v.*, p.memory_state FROM user_vocabulary_progress p JOIN vocabulary_items v ON v.id = p.vocabulary_id
			WHERE p.user_id = ? AND p.due_at <= CURRENT_TIMESTAMP ORDER BY p.due_at LIMIT 10`).bind(userId).all<Record<string, unknown>>(),
		db.prepare("SELECT * FROM sentence_exercises WHERE level <= ? ORDER BY id DESC LIMIT 1").bind(profile.level).first<Record<string, unknown>>(),
		db.prepare("SELECT * FROM listening_exercises WHERE level <= ? ORDER BY id DESC LIMIT 1").bind(profile.level).first<Record<string, unknown>>(),
		db.prepare("SELECT activity_date FROM daily_progress WHERE user_id = ? AND activity_date >= ? AND activities_completed > 0").bind(userId, daysAgo(30)).all<{ activity_date: string }>(),
	]);
	const activeDates = new Set(recentDays.results.map((row) => row.activity_date));
	let streak = 0;
	for (let offset = activeDates.has(dateKey()) ? 0 : 1; offset < 31 && activeDates.has(daysAgo(offset)); offset++) streak++;
	const weekStart = new Date();
	const mondayOffset = (weekStart.getUTCDay() + 6) % 7;
	weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);
	const weekdays = Array.from({ length: 7 }, (_, index) => {
		const day = new Date(weekStart);
		day.setUTCDate(weekStart.getUTCDate() + index);
		return activeDates.has(dateKey(day));
	});
	const totalVocabulary = await db.prepare("SELECT COUNT(*) count FROM vocabulary_items WHERE level <= ?").bind(profile.level).first<{ count: number }>();
	const scenarios = await db.prepare("SELECT * FROM interview_scenarios WHERE level <= ? ORDER BY level").bind(profile.level).all<Record<string, unknown>>();
	return {
		profile,
		stats: {
			totalXp: Number(totals?.total_xp ?? 0), weeklyXp: Number(totals?.weekly_xp ?? 0),
			todayXp: Number(today?.xp ?? 0), todayActivities: Number(today?.activities_completed ?? 0), streak,
			dueCount: Number(due?.due_count ?? 0), masteredCount: Number(due?.mastered_count ?? 0),
			practicedCount: Number(due?.practiced_count ?? 0), totalVocabulary: Number(totalVocabulary?.count ?? 0), weekdays,
		},
		vocabulary: vocab.results.map((row) => mapVocabulary(row, language)),
		review: review.results.map((row) => mapVocabulary(row, language)),
		sentence: sentenceRow ? {
			id: Number(sentenceRow.id),
			prompt: String(sentenceRow[language === "id" ? "prompt_id" : "prompt_en"]),
			tokens: JSON.parse(String(sentenceRow.tokens)) as string[],
			answer: String(sentenceRow.answer),
			grammarNote: String(sentenceRow[language === "id" ? "grammar_note_id" : "grammar_note_en"]),
		} : null,
		listening: listeningRow ? {
			id: Number(listeningRow.id), mode: listeningRow.mode as "dictation" | "fill_blank",
			audioText: String(listeningRow.audio_text), prompt: String(listeningRow.prompt), answer: String(listeningRow.answer),
			translation: String(listeningRow[language === "id" ? "translation_id" : "translation_en"]), note: String(listeningRow.note),
		} : null,
		interviewScenarios: scenarios.results.map((row) => ({
			id: Number(row.id), title: String(row.title), titleKo: String(row.title_ko), level: Number(row.level), questionKo: String(row.question_ko),
			question: String(row[language === "id" ? "question_id" : "question_en"]), guidance: String(row[language === "id" ? "guidance_id" : "guidance_en"]),
		})),
	};
}

const intervals = [1, 3, 7, 14, 30];

function dueDate(days: number) {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().replace("T", " ").slice(0, 19);
}

export async function completeSession(db: D1Database, userId: string, options: {
	gameType: "vocabulary" | "sentence" | "listening" | "review";
	level: number;
	correctCount: number;
	totalCount: number;
	results?: Array<{ id: number; correct: boolean; confidence?: "again" | "hard" | "good" }>;
}) {
	const uniqueResults = [...new Map((options.results ?? []).map((result) => [result.id, result])).values()];
	const validatedResults: typeof uniqueResults = [];
	for (const result of uniqueResults) {
		const allowed = await db.prepare("SELECT id FROM vocabulary_items WHERE id = ? AND level <= ?").bind(result.id, options.level).first();
		if (allowed) validatedResults.push(result);
	}
	const reportedCorrect = options.gameType === "vocabulary" || options.gameType === "review"
		? validatedResults.filter((result) => result.correct).length
		: options.correctCount;
	const correctCount = Math.max(0, Math.min(options.totalCount, reportedCorrect));
	const xp = correctCount * (options.gameType === "review" ? 3 : 2) + (correctCount === options.totalCount ? 5 : 0);
	const statements = [
		db.prepare("INSERT INTO game_sessions (id, user_id, game_type, level, correct_count, total_count, xp_earned) VALUES (?, ?, ?, ?, ?, ?, ?)")
			.bind(crypto.randomUUID(), userId, options.gameType, options.level, correctCount, options.totalCount, xp),
		db.prepare(`INSERT INTO daily_progress (user_id, activity_date, xp, activities_completed, correct_answers, total_answers)
			VALUES (?, ?, ?, 1, ?, ?) ON CONFLICT(user_id, activity_date) DO UPDATE SET xp = xp + excluded.xp,
			activities_completed = activities_completed + 1, correct_answers = correct_answers + excluded.correct_answers,
			total_answers = total_answers + excluded.total_answers`).bind(userId, dateKey(), xp, correctCount, options.totalCount),
	];
	for (const result of validatedResults) {
		const existing = await db.prepare("SELECT interval_index FROM user_vocabulary_progress WHERE user_id = ? AND vocabulary_id = ?").bind(userId, result.id).first<{ interval_index: number }>();
		const previous = Number(existing?.interval_index ?? 0);
		const nextIndex = !result.correct || result.confidence === "again" ? 0 : result.confidence === "hard" ? previous : Math.min(4, previous + 1);
		const state = !result.correct || result.confidence === "again" ? "learning" : nextIndex >= 4 ? "mastered" : nextIndex >= 2 ? "review_soon" : "learning";
		statements.push(db.prepare(`INSERT INTO user_vocabulary_progress
			(user_id, vocabulary_id, memory_state, interval_index, due_at, attempts, correct_count)
			VALUES (?, ?, ?, ?, ?, 1, ?) ON CONFLICT(user_id, vocabulary_id) DO UPDATE SET
			memory_state = excluded.memory_state, interval_index = excluded.interval_index, due_at = excluded.due_at,
			attempts = attempts + 1, correct_count = correct_count + excluded.correct_count, updated_at = CURRENT_TIMESTAMP`)
			.bind(userId, result.id, state, nextIndex, dueDate(intervals[nextIndex]), result.correct ? 1 : 0));
	}
	await db.batch(statements);
	return xp;
}
