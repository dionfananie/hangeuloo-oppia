import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { InterviewScenario, InterviewFeedback } from "~/lib/interview.server";

type InterviewPanelOptions = {
	scenarios: InterviewScenario[];
	recording: boolean;
	setRecording: (value: boolean) => void;
	done: () => void;
};

export default function useInterviewPanel({ scenarios, recording, setRecording, done }: InterviewPanelOptions) {
	const [stage, setStage] = useState<"ready" | "answer" | "feedback">("ready");
	const [scenarioId, setScenarioId] = useState(scenarios.at(-1)?.id ?? 0);
	const [answer, setAnswer] = useState("");
	const [micNote, setMicNote] = useState("");
	const [audioUrl, setAudioUrl] = useState("");
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [duration, setDuration] = useState(0);
	const [speed, setSpeed] = useState(1);
	const streamRef = useRef<MediaStream | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const startedAtRef = useRef(0);
	const idempotencyKey = useRef(crypto.randomUUID());
	const transcriptFetcher = useFetcher<{ ok: boolean; transcript?: { text: string; duration: number }; error?: string }>();
	const feedbackFetcher = useFetcher<{ ok: boolean; feedback?: InterviewFeedback; error?: string }>();
	const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];

	useEffect(() => () => {
		streamRef.current?.getTracks().forEach((track) => track.stop());
		if (audioUrl) URL.revokeObjectURL(audioUrl);
	}, [audioUrl]);
	useEffect(() => {
		if (transcriptFetcher.data?.transcript) {
			setAnswer(transcriptFetcher.data.transcript.text);
			setDuration(transcriptFetcher.data.transcript.duration || duration);
			setMicNote("Korean transcript ready. Edit it before asking for feedback.");
		} else if (transcriptFetcher.data?.error) setMicNote(transcriptFetcher.data.error);
	}, [transcriptFetcher.data]);
	useEffect(() => {
		if (feedbackFetcher.data?.feedback) setStage("feedback");
	}, [feedbackFetcher.data]);

	async function startVoice() {
		setStage("answer");
		if (!navigator.mediaDevices?.getUserMedia) { setMicNote("Microphone unavailable. Type your answer below."); return; }
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			chunksRef.current = [];
			const recorder = new MediaRecorder(stream);
			recorderRef.current = recorder;
			recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
				if (audioUrl) URL.revokeObjectURL(audioUrl);
				setAudioBlob(blob);
				setAudioUrl(URL.createObjectURL(blob));
				setDuration(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
				setMicNote("Recording preserved in this browser. Play it back or transcribe it.");
			};
			startedAtRef.current = Date.now();
			recorder.start(250);
			setRecording(true);
			setMicNote("Recording in your browser");
		} catch { setMicNote("Microphone permission was not granted. Typing still works."); }
	}

	function stopVoice() {
		if (recorderRef.current?.state === "recording") recorderRef.current.stop();
		streamRef.current?.getTracks().forEach((track) => track.stop());
		setRecording(false);
	}

	function transcribe() {
		if (!audioBlob) return;
		const form = new FormData();
		form.set("intent", "transcribe");
		form.set("audio", new File([audioBlob], "answer.webm", { type: audioBlob.type }));
		transcriptFetcher.submit(form, { method: "post", encType: "multipart/form-data" });
	}

	function requestFeedback() {
		if (!scenario) return;
		feedbackFetcher.submit({ intent: "interview-feedback", scenarioId: String(scenario.id), answer, answerMode: audioBlob ? "voice" : "typed", duration: String(duration), idempotencyKey: idempotencyKey.current }, { method: "post" });
	}

	return { stage, setStage, scenario, scenarioId, setScenarioId, answer, setAnswer, micNote, audioUrl, duration, speed, setSpeed, recording, transcriptFetcher, feedbackFetcher, startVoice, stopVoice, transcribe, requestFeedback, done };
}
