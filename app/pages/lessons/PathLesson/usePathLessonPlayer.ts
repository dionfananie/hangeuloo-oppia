import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { PathLessonDetail } from "~/lib/learning-path.server";

export type CompletionData = {
	ok: boolean;
	completed?: boolean;
	xp?: number;
	vocabularyAdded?: number;
	nextHref?: string | null;
	nextTitle?: string | null;
	practiceHref?: string | null;
	practiceTitle?: string | null;
	error?: string;
};

export default function usePathLessonPlayer(lesson: PathLessonDetail) {
	const initialIndex = lesson.status === "in_progress" ? lesson.currentItemIndex : 0;
	const [index, setIndex] = useState(initialIndex);
	const [speed, setSpeed] = useState(1);
	const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "paused" | "error">("idle");
	const [showTranslation, setShowTranslation] = useState(false);
	const [showExplanation, setShowExplanation] = useState(false);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const viewFetcher = useFetcher();
	const completionFetcher = useFetcher<CompletionData>();
	const item = lesson.items[index];

	function stopAudio() {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}
		if (typeof window !== "undefined") window.speechSynthesis?.cancel();
		utteranceRef.current = null;
		setAudioState("idle");
	}

	useEffect(() => {
		viewFetcher.submit(
			{ intent: "view-item", itemIndex: String(index), itemId: item.id },
			{ method: "post" },
		);
		setShowTranslation(false);
		setShowExplanation(false);
		return () => {
			if (audioRef.current) audioRef.current.pause();
			if (typeof window !== "undefined") window.speechSynthesis?.cancel();
		};
	}, [index, item.id]);

	function play(replay = false, force = false) {
		if (!force && audioState === "playing") {
			if (audioRef.current) audioRef.current.pause();
			else window.speechSynthesis.pause();
			setAudioState("paused");
			return;
		}
		if (!force && audioState === "paused") {
			if (audioRef.current) void audioRef.current.play();
			else window.speechSynthesis.resume();
			setAudioState("playing");
			return;
		}
		setAudioState("loading");
		if (item.audioUrl) {
			const audio = new Audio(item.audioUrl);
			audioRef.current = audio;
			audio.playbackRate = speed;
			audio.onplaying = () => setAudioState("playing");
			audio.onended = () => setAudioState("idle");
			audio.onerror = () => setAudioState("error");
			void audio.play().catch(() => setAudioState("error"));
			return;
		}
		if (!("speechSynthesis" in window)) {
			setAudioState("error");
			return;
		}
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(item.koreanText);
		utteranceRef.current = utterance;
		utterance.lang = "ko-KR";
		utterance.rate = speed;
		utterance.onstart = () => setAudioState("playing");
		utterance.onend = () => setAudioState("idle");
		utterance.onerror = (event) => {
			if (event.error === "canceled" || event.error === "interrupted") return;
			setAudioState("error");
		};
		window.speechSynthesis.speak(utterance);
	}

	function replay() {
		stopAudio();
		window.setTimeout(() => play(true, true), 0);
	}

	function changeSpeed(nextSpeed: number) {
		stopAudio();
		setSpeed(nextSpeed);
	}

	function goTo(nextIndex: number) {
		stopAudio();
		setIndex(Math.max(0, Math.min(lesson.items.length - 1, nextIndex)));
	}

	function complete() {
		stopAudio();
		completionFetcher.submit({ intent: "complete-lesson", lastItemIndex: String(index) }, { method: "post" });
	}

	return {
		index,
		item,
		speed,
		audioState,
		showTranslation,
		showExplanation,
		setShowTranslation,
		setShowExplanation,
		play,
		replay,
		changeSpeed,
		goTo,
		complete,
		completion: completionFetcher.data?.completed ? completionFetcher.data : null,
		completing: completionFetcher.state !== "idle",
		viewing: viewFetcher.state !== "idle",
	};
}
