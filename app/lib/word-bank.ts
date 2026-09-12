import words from "../../public/500words.json" with { type: "json" };

export type WordBankEntry = {
	id: number;
	category: string;
	en: string;
	ko: string;
	image?: string;
};

const wordBank = words as WordBankEntry[];

// The bundled word bank and the D1 `vocabulary_items` table are two different
// identity spaces that historically reused the same numeric IDs. Offsetting
// word-bank IDs keeps submissions unambiguous so a word-bank result can never
// update spaced-repetition progress for an unrelated D1 vocabulary record.
export const WORD_BANK_ID_OFFSET = 10000;

export function toWordBankId(rawId: number) {
	return rawId + WORD_BANK_ID_OFFSET;
}

export function hasWordBankId(id: number) {
	if (id < WORD_BANK_ID_OFFSET) return false;
	return wordBank.some((word) => word.id === id - WORD_BANK_ID_OFFSET);
}

export function getRandomWordBank(count: number, seed = Math.random()) {
	const pool = [...wordBank];
	let state = Math.floor(seed * 2_147_483_647) || 1;
	const random = () => {
		state = (state * 16_807) % 2_147_483_647;
		return (state - 1) / 2_147_483_646;
	};

	for (let index = pool.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1));
		[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
	}
	return pool.slice(0, Math.min(count, pool.length));
}

export function getWordBankItem(id: number) {
	return wordBank.find((word) => word.id === id);
}

export function getWordBankForLesson(lessonId: string, count: number) {
	let hash = 0;
	for (const character of lessonId) hash = (hash * 31 + character.charCodeAt(0)) | 0;
	return getRandomWordBank(count, Math.abs(hash) / 2_147_483_647);
}
