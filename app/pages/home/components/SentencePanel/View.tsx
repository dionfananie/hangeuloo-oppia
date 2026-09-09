import Icon from "../Icon";
import type { SentenceExercise } from "~/lib/learning.server";
import type { SubmitSession } from "../../types";
import useSentencePanel from "./hook";

function SentencePanel({ exercise, submit }: { exercise: SentenceExercise; submit: SubmitSession }) {
	const { sentence, result, correct, appendToken, removeToken, checkAnswer } = useSentencePanel(exercise);
	return <div className="practice-content"><span className="modal-kicker">SENTENCE BUILDER</span><div className="modal-progress"><span style={{ width: "100%" }} /></div><h2 id="modal-title">Build the sentence</h2><p className="exercise-prompt">{exercise.prompt}</p><div className="sentence-slots">{sentence.length ? sentence.map((word, index) => <button key={`${word}-${index}`} onClick={() => !result && removeToken(index)}>{word}</button>) : <span>Tap words in the correct order</span>}</div><div className="word-choices">{exercise.tokens.map((word) => <button key={word} disabled={sentence.includes(word) || Boolean(result)} onClick={() => appendToken(word)}>{word}</button>)}</div>{result ? <div className={result === "correct" ? "success-feedback" : "success-feedback gentle-error"}><span><Icon name={result === "correct" ? "check" : "heart"} size={24} /></span><div><strong>{result === "correct" ? "정답이에요!" : "Almost there"}</strong><p><b>{exercise.answer}</b><br />{exercise.grammarNote}</p></div><button onClick={() => submit({ gameType: "sentence", correctCount: correct ? 1 : 0, totalCount: 1 })}>Save result</button></div> : <button className="check-button" disabled={sentence.length !== exercise.tokens.length} onClick={checkAnswer}>Check answer</button>}</div>;
}

export default SentencePanel;
