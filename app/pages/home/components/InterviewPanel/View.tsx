import Icon from "../Icon";
import EmptyPractice from "../EmptyPractice";
import type { InterviewScenario } from "~/lib/interview.server";
import type { SpeakFn } from "../../types";
import useInterviewPanel from "./hook";

function InterviewPanel({
	scenarios,
	recording,
	setRecording,
	speak,
	done,
}: {
	scenarios: InterviewScenario[];
	recording: boolean;
	setRecording: (v: boolean) => void;
	speak: SpeakFn;
	done: () => void;
}) {
	const {
		stage,
		setStage,
		scenario,
		scenarioId,
		setScenarioId,
		answer,
		setAnswer,
		micNote,
		audioUrl,
		speed,
		setSpeed,
		transcriptFetcher,
		feedbackFetcher,
		startVoice,
		stopVoice,
		transcribe,
		requestFeedback,
	} = useInterviewPanel({ scenarios, recording, setRecording, done });
	const feedback = feedbackFetcher.data?.feedback;

	if (!scenario) return <EmptyPractice />;

	return (
		<div className="interview-content">
			<span className="modal-kicker">AI INTERVIEW · LEVEL {scenario.level}</span>
			<h2 id="modal-title">{scenario.title}</h2>
			<p className="interview-subtitle">{scenario.titleKo} · friendly, low-pressure coaching</p>
			{stage === "ready" && (
				<div className="scenario-picker">
					{scenarios.map((item) => (
						<button
							className={item.id === scenario.id ? "active" : ""}
							key={item.id}
							onClick={() => setScenarioId(item.id)}
						>
							<small>LEVEL {item.level}</small>
							<strong>{item.title}</strong>
							<span>{item.titleKo}</span>
						</button>
					))}
				</div>
			)}
			<div className="interviewer">
				<span className="ai-face">
					ㅎ<i />
				</span>
				<div>
					<small>HANA · AI COACH</small>
					<p>“{scenario.questionKo}”</p>
					<span>{scenario.question}</span>
				</div>
				<button onClick={() => speak(scenario.questionKo, speed)} aria-label="Play question">
					<Icon name="play" size={18} />
				</button>
			</div>
			<div className="speed-row interview-speed">
				{[0.75, 1, 1.25].map((value) => (
					<button className={speed === value ? "active" : ""} key={value} onClick={() => setSpeed(value)}>
						{value}x
					</button>
				))}
			</div>
			{stage === "ready" && (
				<div className="interview-actions">
					<p>{scenario.guidance}</p>
					<button className="record-button" onClick={startVoice}>
						<Icon name="mic" size={23} /> Start speaking
					</button>
					<button className="type-answer" onClick={() => setStage("answer")}>
						Type my answer instead
					</button>
				</div>
			)}
			{stage === "answer" && (
				<div className="recording-panel">
					<div className={recording ? "recording-icon active" : "recording-icon"}>
						<Icon name="mic" size={28} />
					</div>
					<strong>{recording ? "듣고 있어요..." : "Your answer"}</strong>
					{micNote && <p className="mic-note">{micNote}</p>}
					<div className="waveform">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => (
							<i key={number} style={{ height: `${10 + (number % 5) * 7}px` }} />
						))}
					</div>
					{recording && (
						<button className="stop-recording" onClick={stopVoice}>
							Stop recording
						</button>
					)}
					{audioUrl && (
						<div className="audio-review">
							<audio src={audioUrl} controls />
							<button onClick={transcribe} disabled={transcriptFetcher.state !== "idle"}>
								{transcriptFetcher.state === "idle" ? "Transcribe Korean" : "Transcribing..."}
							</button>
						</div>
					)}
					<textarea
						value={answer}
						onChange={(event) => setAnswer(event.target.value)}
						placeholder="한국어로 대답해 보세요..."
						aria-label="Your Korean answer"
					/>
					<button
						className="check-button"
						disabled={!answer.trim() || feedbackFetcher.state !== "idle" || recording}
						onClick={requestFeedback}
					>
						{feedbackFetcher.state === "idle" ? (
							<>
								Get AI feedback <Icon name="sparkles" size={17} />
							</>
						) : (
							"Hana is reviewing your answer..."
						)}
					</button>
					{feedbackFetcher.data?.error && (
						<div className="ai-error" role="alert">
							{feedbackFetcher.data.error}
						</div>
					)}
				</div>
			)}
			{stage === "feedback" && feedback && (
				<div className="feedback-panel structured-feedback">
					<div className="score-ring">
						<strong>{feedback.overallScore}</strong>
						<small>Overall</small>
					</div>
					<div className="feedback-copy">
						<strong>Your personal feedback</strong>
						<p>
							<b>Correction:</b> {feedback.correctedAnswer}
						</p>
						<p>
							<b>Natural answer:</b> {feedback.naturalAnswer}
						</p>
						<div>
							<span>
								Grammar <b>{feedback.grammarScore}</b>
							</span>
							<span>
								Content <b>{feedback.contentScore}</b>
							</span>
							<span>
								Fluency <b>{feedback.fluencyScore}</b>
							</span>
						</div>
						{feedback.mistakes.length > 0 && (
							<p>
								<b>Notice:</b> {feedback.mistakes.join(" · ")}
							</p>
						)}
						{feedback.recommendedWords.length > 0 && (
							<p>
								<b>Try these:</b> {feedback.recommendedWords.join(", ")}
							</p>
						)}
						<p>
							<b>Next:</b> {feedback.nextPractice}
						</p>
					</div>
					<button className="check-button" onClick={done}>
						Finish practice · +35 XP
					</button>
				</div>
			)}
		</div>
	);
}

export default InterviewPanel;
