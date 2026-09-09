export type PracticeResult = {
	id: number;
	correct: boolean;
	confidence?: "again" | "hard" | "good";
};

export type SubmitSession = (result: {
	gameType: string;
	correctCount: number;
	totalCount: number;
	results?: PracticeResult[];
}) => void;

export type SpeakFn = (text?: string, rate?: number) => void;
