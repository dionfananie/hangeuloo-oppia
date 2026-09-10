import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { LearningProfile } from "~/lib/learning.server";
import type { SubmitSession } from "./types";

export default function useHomeView(profile: LearningProfile | null, practiceUnlocks: string[]) {
	const [active, setActive] = useState("home");
	const [modal, setModal] = useState<string | null>(null);
	const [recording, setRecording] = useState(false);
	const [toast, setToast] = useState("");
	const progressFetcher = useFetcher<{ ok: boolean; xp?: number; error?: string }>();

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(""), 2400);
		return () => clearTimeout(timer);
	}, [toast]);
	useEffect(() => {
		if (!progressFetcher.data) return;
		if (progressFetcher.data.ok) {
			setToast(`Practice saved · +${progressFetcher.data.xp ?? 0} XP`);
			closeModal();
		} else if (progressFetcher.data.error) setToast(progressFetcher.data.error);
	}, [progressFetcher.data]);
	useEffect(() => {
		const practice = new URLSearchParams(window.location.search).get("practice");
		if (["vocab", "sentence", "listen", "review"].includes(practice ?? "")) {
			const practiceTypeById: Record<string, string> = { vocab: "vocabulary", listen: "listening", sentence: "sentence", review: "review" };
			if (practice && practiceUnlocks.includes(practiceTypeById[practice])) {
				setActive("practice");
				setModal(practice);
			} else setToast("Complete the related lesson to unlock this practice");
			window.history.replaceState({}, "", "/");
		}
	}, [practiceUnlocks]);

	function speak(text = "오늘 무엇을 했어요?", rate = 0.82) {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.cancel();
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = "ko-KR";
			utterance.rate = rate;
			window.speechSynthesis.speak(utterance);
			setToast("Playing Korean audio");
		} else setToast("Audio isn't available in this browser");
	}

	function openActivity(id: string) {
		setRecording(false);
		setModal(id);
	}

	function closeModal() {
		setRecording(false);
		if (typeof window !== "undefined") window.speechSynthesis?.cancel();
		setModal(null);
	}

	const submitSession: SubmitSession = (result) => {
		progressFetcher.submit({ intent: "complete-session", level: String(profile?.level ?? 0), gameType: result.gameType, correctCount: String(result.correctCount), totalCount: String(result.totalCount), results: JSON.stringify(result.results ?? []) }, { method: "post" });
	};

	return { active, setActive, modal, recording, setRecording, toast, speak, openActivity, closeModal, submitSession };
}
