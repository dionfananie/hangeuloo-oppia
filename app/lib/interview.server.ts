import type { GuideLanguage } from "./learning.server";

export type InterviewScenario = {
	id: number;
	title: string;
	titleKo: string;
	level: number;
	questionKo: string;
	question: string;
	guidance: string;
};

export type InterviewFeedback = {
	overallScore: number;
	fluencyScore: number;
	grammarScore: number;
	contentScore: number;
	correctedAnswer: string;
	naturalAnswer: string;
	mistakes: string[];
	recommendedWords: string[];
	nextPractice: string;
};

const feedbackSchema = {
	type: "object",
	additionalProperties: false,
	required: ["overallScore", "fluencyScore", "grammarScore", "contentScore", "correctedAnswer", "naturalAnswer", "mistakes", "recommendedWords", "nextPractice"],
	properties: {
		overallScore: { type: "integer", minimum: 0, maximum: 100 },
		fluencyScore: { type: "integer", minimum: 0, maximum: 100 },
		grammarScore: { type: "integer", minimum: 0, maximum: 100 },
		contentScore: { type: "integer", minimum: 0, maximum: 100 },
		correctedAnswer: { type: "string" },
		naturalAnswer: { type: "string" },
		mistakes: { type: "array", items: { type: "string" }, maxItems: 4 },
		recommendedWords: { type: "array", items: { type: "string" }, maxItems: 5 },
		nextPractice: { type: "string" },
	},
};

function validateFeedback(value: unknown): InterviewFeedback {
	if (!value || typeof value !== "object") throw new Error("AI returned invalid feedback");
	const data = value as Record<string, unknown>;
	const scores = [data.overallScore, data.fluencyScore, data.grammarScore, data.contentScore];
	if (scores.some((score) => !Number.isInteger(score) || Number(score) < 0 || Number(score) > 100)) throw new Error("AI returned invalid scores");
	if (![data.correctedAnswer, data.naturalAnswer, data.nextPractice].every((text) => typeof text === "string" && text.length > 0)) throw new Error("AI returned incomplete feedback");
	if (![data.mistakes, data.recommendedWords].every((list) => Array.isArray(list) && list.every((item) => typeof item === "string"))) throw new Error("AI returned invalid recommendations");
	return data as InterviewFeedback;
}

export async function generateFeedback(ai: Ai, input: { scenario: InterviewScenario; answer: string; language: GuideLanguage }) {
	const guidanceLanguage = input.language === "id" ? "Bahasa Indonesia" : "English";
	const output = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
		messages: [
			{ role: "system", content: `You are Hangeuloo, a kind Korean tutor. Evaluate learner Korean conservatively for CEFR pre-A1 to A2. Explain feedback in ${guidanceLanguage}. Never claim precise pronunciation assessment. Return only the requested JSON.` },
			{ role: "user", content: `Level: ${input.scenario.level}\nQuestion: ${input.scenario.questionKo}\nLearner answer: ${input.answer}\nScore grammar, content relevance, and text-based fluency. Correct errors, provide a natural Korean version, list concise mistakes and useful Korean words, then give one concrete next practice action.` },
		],
		response_format: { type: "json_schema", json_schema: feedbackSchema },
		max_tokens: 700,
		temperature: 0.2,
	});
	if (typeof output === "string" || !("response" in output)) throw new Error("AI feedback was unavailable");
	return validateFeedback(JSON.parse(output.response));
}

export async function transcribeKorean(ai: Ai, audio: File) {
	if (!audio.size || audio.size > 10 * 1024 * 1024) throw new Error("Recording must be under 10 MB");
	const bytes = new Uint8Array(await audio.arrayBuffer());
	let binary = "";
	for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
	const output = await ai.run("@cf/openai/whisper-large-v3-turbo", {
		audio: btoa(binary), language: "ko", task: "transcribe", vad_filter: true,
		initial_prompt: "한국어 학습자의 짧은 인터뷰 답변입니다.",
	});
	if (!output.text?.trim()) throw new Error("No Korean speech was detected");
	return { text: output.text.trim(), duration: Math.round(output.transcription_info?.duration ?? 0) };
}

export async function saveInterview(db: D1Database, options: { userId: string; scenario: InterviewScenario; answer: string; answerMode: "voice" | "typed"; duration: number; idempotencyKey: string; feedback: InterviewFeedback }) {
	const existing = await db.prepare("SELECT id FROM interview_sessions WHERE idempotency_key = ? AND user_id = ?").bind(options.idempotencyKey, options.userId).first<{ id: string }>();
	if (existing) return existing.id;
	const sessionId = crypto.randomUUID();
	await db.batch([
		db.prepare("INSERT INTO interview_sessions (id, idempotency_key, user_id, scenario_id, answer_mode, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)").bind(sessionId, options.idempotencyKey, options.userId, options.scenario.id, options.answerMode, options.duration),
		db.prepare("INSERT INTO interview_turns (id, session_id, question_ko, answer_text) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), sessionId, options.scenario.questionKo, options.answer),
		db.prepare(`INSERT INTO ai_feedback (id, session_id, model, overall_score, fluency_score, grammar_score, content_score, corrected_answer, natural_answer, mistakes, recommended_words, next_practice)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), sessionId, "@cf/meta/llama-3.3-70b-instruct-fp8-fast", options.feedback.overallScore, options.feedback.fluencyScore, options.feedback.grammarScore, options.feedback.contentScore, options.feedback.correctedAnswer, options.feedback.naturalAnswer, JSON.stringify(options.feedback.mistakes), JSON.stringify(options.feedback.recommendedWords), options.feedback.nextPractice),
		db.prepare(`INSERT INTO daily_progress (user_id, activity_date, xp, activities_completed, correct_answers, total_answers)
			VALUES (?, ?, 35, 1, 1, 1) ON CONFLICT(user_id, activity_date) DO UPDATE SET xp = xp + 35,
			activities_completed = activities_completed + 1, correct_answers = correct_answers + 1, total_answers = total_answers + 1`).bind(options.userId, new Date().toISOString().slice(0, 10)),
	]);
	return sessionId;
}
