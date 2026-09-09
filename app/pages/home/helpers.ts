import type { IconName } from "~/pages/home/components/Icon";

export const nav: Array<{ id: string; label: string; icon: IconName }> = [
	{ id: "home", label: "Home", icon: "home" },
	{ id: "learn", label: "Learn", icon: "map" },
	{ id: "practice", label: "Practice", icon: "game" },
	{ id: "interview", label: "AI Interview", icon: "mic" },
	{ id: "progress", label: "Progress", icon: "chart" },
];

export const activities: Array<{ id: string; icon: IconName; title: string; copy: string; meta: string; color: string; xp: string }> = [
	{ id: "vocab", icon: "book", title: "Vocabulary", copy: "Match Korean words", meta: "10 words", color: "purple", xp: "+20 XP" },
	{ id: "listen", icon: "headphones", title: "Listening", copy: "Hear & understand", meta: "5 exercises", color: "blue", xp: "+15 XP" },
	{ id: "sentence", icon: "message", title: "Sentences", copy: "Build correct sentences", meta: "7 sentences", color: "coral", xp: "+20 XP" },
	{ id: "review", icon: "brain", title: "Memory Review", copy: "Strengthen your recall", meta: "8 words due", color: "mint", xp: "+15 XP" },
];

export const weekdays = [
	{ day: "M", done: true }, { day: "T", done: true }, { day: "W", done: true },
	{ day: "T", done: true }, { day: "F", done: false, today: true },
	{ day: "S", done: false }, { day: "S", done: false },
];

export const levelNames = ["Hangul Starter", "First Korean", "Daily Korean"];
export const levelDescriptions = ["Read Hangul and use essential greetings", "Build simple, polite everyday sentences", "Talk about routines, plans, and past experiences"];

export function getInitials(name: string) {
	return name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function getTodayLabel(guideLanguage: string) {
	return new Intl.DateTimeFormat(guideLanguage === "id" ? "id-ID" : "en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
}

export function getTodayWeekdayIndex() {
	return (new Date().getDay() + 6) % 7;
}

export function normalizeKorean(value: string) {
	return value.normalize("NFC").replace(/[\s.,!?]/g, "");
}
