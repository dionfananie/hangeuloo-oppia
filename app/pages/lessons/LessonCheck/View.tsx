import { useRef, useState } from "react";
import { Link, useFetcher } from "react-router";
import Icon from "~/pages/home/components/Icon";
import type { CheckResultPayload, CheckSubmissionResult } from "~/lib/lesson-checks.server";
import "../quiz-shared.css";

export default function LessonCheck({ check }: { check: CheckResultPayload }) {
	const [selected, setSelected] = useState<Record<string, string>>({});
	const [idempotencyKey] = useState(() => crypto.randomUUID());
	const fetcher = useFetcher<{ ok: boolean } & CheckSubmissionResult>();
	const result = fetcher.data?.ok ? (fetcher.data as CheckSubmissionResult) : null;
	const answerCount = Object.keys(selected).length;
	const allAnswered = answerCount === check.questions.length;
	const submitted = fetcher.state !== "idle";

	if (result) {
		return (
			<CheckResultView
				check={check}
				result={result}
				retry={() => fetcher.load(`/lessons/checks/${check.node.id}`)}
			/>
		);
	}

	return (
		<main className="lesson-player-shell">
			<header className="lesson-player-header">
				<Link className="lesson-exit" to="/lessons" aria-label="Exit check">
					<Icon name="close" size={20} />
				</Link>
				<div
					className="lesson-player-progress"
					role="progressbar"
					aria-label="Check progress"
					aria-valuenow={answerCount}
					aria-valuemin={0}
					aria-valuemax={check.questions.length}
				>
					<span style={{ width: `${(answerCount / Math.max(1, check.questions.length)) * 100}%` }} />
				</div>
				<strong>
					{answerCount}
					<small> / {check.questions.length}</small>
				</strong>
			</header>
			<section className="lesson-player-content fade-in">
				<div className="lesson-card-heading">
					<span className="lesson-type type-word">check</span>
					<span>{check.node.title}</span>
				</div>
				<p className="check-description">{check.node.description}</p>
				<div className="check-question-list">
					{check.questions.map((question, index) => (
						<fieldset className="check-question" key={question.id}>
							<legend>
								<span>{index + 1}.</span> {question.prompt}
							</legend>
							<div className="check-choices">
								{question.choices.map((choice) => (
									<button
										type="button"
										key={choice.id}
										className={selected[question.id] === choice.id ? "is-selected" : ""}
										aria-pressed={selected[question.id] === choice.id}
										onClick={() => setSelected((current) => ({ ...current, [question.id]: choice.id }))}
									>
										{choice.label}
									</button>
								))}
							</div>
						</fieldset>
					))}
				</div>
				<footer className="lesson-player-actions">
					<Link className="lesson-back-button" to="/lessons">
						<Icon name="arrow" size={18} /> Path
					</Link>
					<button
						className="lesson-next-button finish"
						disabled={!allAnswered || submitted}
						onClick={() => {
							const answers = check.questions.map((question) => ({
								itemId: question.id,
								answerId: selected[question.id] ?? "",
							}));
							fetcher.submit(
								{ intent: "submit-check", idempotencyKey, answers: JSON.stringify(answers) },
								{ method: "post" },
							);
						}}
					>
						{submitted ? "Checking…" : "Submit answers"}
						<Icon name="check" size={18} />
					</button>
				</footer>
			</section>
		</main>
	);
}

function CheckResultView({
	check,
	result,
	retry,
}: {
	check: CheckResultPayload;
	result: CheckSubmissionResult;
	retry: () => void;
}) {
	const remediation = result.remediationNodeIds[0];
	return (
		<main className="lesson-player-shell lesson-complete-shell">
			<div className="completion-confetti" aria-hidden="true">
				<i />
				<i />
				<i />
				<i />
				<i />
				<i />
			</div>
			<Link className="lesson-player-brand" to="/lessons">
				<span className="brand-mark">
					<span>ㅎ</span>
				</span>
				<strong>Hangeuloo</strong>
			</Link>
			<section className="lesson-completion fade-in">
				<div className={`completion-orb ${result.passed ? "" : "is-failed"}`}>
					<Icon name={result.passed ? "star" : "refresh"} size={43} />
					<span>
						<Icon name={result.passed ? "check" : "close"} size={20} />
					</span>
				</div>
				<span className="lessons-kicker">{result.passed ? "CHECK PASSED" : "KEEP GOING"}</span>
				<h1>{result.passed ? "잘했어요!" : "Almost there!"}</h1>
				<p>
					{result.correctCount} / {result.totalCount} correct ({result.score}%)
				</p>
				<div className="check-results">
					{result.results.map((item) => (
						<div className={`check-result-row ${item.correct ? "is-correct" : "is-wrong"}`} key={item.itemId}>
							<span>
								<Icon name={item.correct ? "check" : "close"} size={15} />
							</span>
							<p>{item.explanation}</p>
						</div>
					))}
				</div>
				<div className="completion-actions">
					{result.passed ? (
						<Link className="lesson-primary-link" to="/lessons">
							<span>
								<Icon name="arrow" size={18} />
							</span>
							Continue your path
							<Icon name="arrow" size={17} />
						</Link>
					) : (
						<>
							{remediation && (
								<Link className="lesson-primary-link" to={`/lessons/${remediation}`}>
									<span>
										<Icon name="book" size={18} />
									</span>
									Review what you missed
									<Icon name="arrow" size={17} />
								</Link>
							)}
							<button className="lesson-secondary-link" onClick={retry}>
								Try again <Icon name="refresh" size={17} />
							</button>
						</>
					)}
				</div>
			</section>
		</main>
	);
}
