import { useRef, useState } from "react";
import { Link, useFetcher } from "react-router";
import Icon from "~/pages/home/components/Icon";
import type { PracticePayload, PracticeResult } from "~/lib/lesson-practice.server";
import "../quiz-shared.css";

export default function LessonPractice({ practice }: { practice: PracticePayload }) {
	const [selected, setSelected] = useState<Record<string, string>>({});
	const [idempotencyKey] = useState(() => crypto.randomUUID());
	const fetcher = useFetcher<{ ok: boolean } & PracticeResult>();
	const result = fetcher.data?.ok ? (fetcher.data as PracticeResult) : null;
	const answerCount = Object.keys(selected).length;
	const allAnswered = answerCount === practice.questions.length;
	const submitted = fetcher.state !== "idle";

	if (result) {
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
					<div className="completion-orb">
						<Icon name="game" size={43} />
						<span>
							<Icon name="check" size={20} />
						</span>
					</div>
					<span className="lessons-kicker">PRACTICE COMPLETE</span>
					<h1>잘했어요!</h1>
					<p>
						{result.correctCount} / {result.totalCount} correct.
					</p>
					<div className="completion-actions">
						<Link className="lesson-primary-link" to="/lessons">
							<span>
								<Icon name="arrow" size={18} />
							</span>
							Continue your path
							<Icon name="arrow" size={17} />
						</Link>
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className="lesson-player-shell">
			<header className="lesson-player-header">
				<Link className="lesson-exit" to="/lessons" aria-label="Exit practice">
					<Icon name="close" size={20} />
				</Link>
				<div
					className="lesson-player-progress"
					role="progressbar"
					aria-label="Practice progress"
					aria-valuenow={answerCount}
					aria-valuemin={0}
					aria-valuemax={practice.questions.length}
				>
					<span style={{ width: `${(answerCount / Math.max(1, practice.questions.length)) * 100}%` }} />
				</div>
				<strong>
					{answerCount}
					<small> / {practice.questions.length}</small>
				</strong>
			</header>
			<section className="lesson-player-content fade-in">
				<div className="lesson-card-heading">
					<span className="lesson-type type-word">practice</span>
					<span>{practice.node.title}</span>
				</div>
				<p className="check-description">{practice.node.description}</p>
				<div className="check-question-list">
					{practice.questions.map((question, index) => (
						<fieldset className="check-question" key={question.id}>
							<legend>
								<span>{index + 1}.</span> <span lang="ko">{question.korean}</span>
								<small> {question.romanization}</small>
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
							const answers = practice.questions.map((question) => ({
								itemId: question.id,
								answerId: selected[question.id] ?? "",
							}));
							fetcher.submit(
								{ intent: "submit-practice", idempotencyKey, answers: JSON.stringify(answers) },
								{ method: "post" },
							);
						}}
					>
						{submitted ? "Saving…" : "Finish practice"}
						<Icon name="check" size={18} />
					</button>
				</footer>
			</section>
		</main>
	);
}
