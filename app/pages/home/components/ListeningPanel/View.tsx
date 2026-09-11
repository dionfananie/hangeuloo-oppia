import Icon from "../Icon";
import type { ListeningExercise } from "~/lib/learning.server";
import type { SubmitSession, SpeakFn } from "../../types";
import useListeningPanel from "./hook";

function ListeningPanel({
	exercise,
	submit,
	speak,
}: {
	exercise: ListeningExercise;
	submit: SubmitSession;
	speak: SpeakFn;
}) {
	const { answer, setAnswer, speed, setSpeed, showHelp, setShowHelp, result, correct, checkAnswer } =
		useListeningPanel(exercise);
	return (
		<div className="practice-content">
			<span className="modal-kicker">
				LISTENING · {exercise.mode === "dictation" ? "DICTATION" : "FILL IN THE BLANK"}
			</span>
			<div className="modal-progress">
				<span style={{ width: "100%" }} />
			</div>
			<h2 id="modal-title">Listen and type</h2>
			<button className="listen-button" onClick={() => speak(exercise.audioText, speed)}>
				<Icon name="play" size={24} />
			</button>
			<div className="speed-row">
				{[0.75, 1, 1.25].map((value) => (
					<button className={speed === value ? "active" : ""} key={value} onClick={() => setSpeed(value)}>
						{value}x
					</button>
				))}
			</div>
			<p className="exercise-prompt">{exercise.prompt}</p>
			<textarea
				className="listen-input"
				value={answer}
				onChange={(event) => setAnswer(event.target.value)}
				placeholder="한글로 입력하세요"
				disabled={Boolean(result)}
			/>
			{!result && (
				<button className="hint-button" onClick={() => setShowHelp(true)}>
					Show translation hint
				</button>
			)}
			{showHelp && <p className="translation-hint">{exercise.translation}</p>}
			{result ? (
				<div className={result === "correct" ? "success-feedback" : "success-feedback gentle-error"}>
					<span>
						<Icon name={result === "correct" ? "check" : "heart"} size={24} />
					</span>
					<div>
						<strong>{result === "correct" ? "잘 들었어요!" : "Listen once more next time"}</strong>
						<p>
							<b>{exercise.audioText}</b>
							<br />
							{exercise.note}
						</p>
					</div>
					<button
						onClick={() => submit({ gameType: "listening", correctCount: correct ? 1 : 0, totalCount: 1 })}
					>
						Save result
					</button>
				</div>
			) : (
				<button className="check-button" disabled={!answer.trim()} onClick={checkAnswer}>
					Check answer
				</button>
			)}
		</div>
	);
}

export default ListeningPanel;
