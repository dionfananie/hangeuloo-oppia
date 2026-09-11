import { Link } from "react-router";
import Icon from "../../home/components/Icon";
import useVocabularyPractice from "../hook";
import { practiceModeLabels } from "../helpers";

function CompletionView({
	correctCount,
	wordCount,
	xp,
	error,
}: {
	correctCount: number;
	wordCount: number;
	xp: number;
	error?: string;
}) {
	return (
		<main className="lesson-player-shell lesson-complete-shell">
			<section className="lesson-completion">
				<div className="completion-orb">
					<Icon name="star" size={43} />
				</div>
				<span className="lessons-kicker">PRACTICE COMPLETE</span>
				<h1>잘했어요!</h1>
				<p>{error ?? `You finished this vocabulary round and earned ${xp} XP.`}</p>
				<div className="completion-stats">
					<article>
						<strong>{correctCount}</strong>
						<small>correct</small>
					</article>
					<article>
						<strong>{wordCount}</strong>
						<small>words</small>
					</article>
					<article>
						<strong>+{xp}</strong>
						<small>XP earned</small>
					</article>
				</div>
				<div className="completion-actions">
					<Link className="lesson-primary-link" to="/practice/vocabulary">
						Practice again <Icon name="arrow" size={17} />
					</Link>
					<Link className="lesson-secondary-link" to="/practice">
						Back to practice <Icon name="arrow" size={17} />
					</Link>
				</div>
			</section>
		</main>
	);
}

export default function VocabularyPractice() {
	const practice = useVocabularyPractice();
	if (!practice.item || !practice.words.length) {
		return (
			<main className="lesson-player-shell lesson-complete-shell">
				<section className="lesson-completion">
					<h1>No words ready yet</h1>
					<p>Complete a lesson to unlock vocabulary practice.</p>
					<Link className="lesson-primary-link" to="/lessons">
						Back to lessons <Icon name="arrow" size={17} />
					</Link>
				</section>
			</main>
		);
	}
	if (practice.done) {
		return (
			<CompletionView
				correctCount={practice.answers.filter(({ correct }) => correct).length}
				wordCount={practice.words.length}
				xp={practice.fetcher.data?.xp ?? 0}
				error={practice.fetcher.data?.error}
			/>
		);
	}
	const { item, choices, mode, selected, index, words } = practice;
	const isCorrect = practice.answers.at(-1)?.correct;
	const answer = (value: string) => practice.answer(value, value === practice.getAnswerValue(item, mode));
	const answerText = mode === "meaning-to-korean" || mode === "image-guess" ? item.korean : item.meaning;

	return (
		<main className="lesson-player-shell">
			<header className="lesson-player-header">
				<Link className="lesson-exit" to="/practice" aria-label="Exit practice">
					<Icon name="close" size={20} />
				</Link>
				<div className="lesson-player-progress">
					<span style={{ width: `${((index + 1) / words.length) * 100}%` }} />
				</div>
				<strong>
					{index + 1}
					<small> / {words.length}</small>
				</strong>
			</header>
			<section className="lesson-player-content fade-in">
				<div className="lesson-card-heading">
					<span className="lesson-type type-word">VOCABULARY</span>
					<span>{practiceModeLabels[mode]}</span>
				</div>
				<article className="learning-card">
					<div className="learning-card-focus">
						{mode === "image-guess" && item.imageUrl ? (
							<img className="practice-word-image" src={item.imageUrl} alt={item.imageAlt ?? item.korean} />
						) : (
							<>
								<span className="focus-glow" />
								<div className="lesson-korean" lang="ko">
									{mode === "meaning-to-korean" ? item.meaning : item.korean}
								</div>
								<div className="lesson-romanization">
									{mode === "meaning-to-korean" ? "Choose the Korean word" : item.romanization}
								</div>
							</>
						)}
					</div>
					<div className="practice-answer-area">
						<p className="practice-question">
							{mode === "meaning-to-korean"
								? "Which Korean word matches this meaning?"
								: mode === "image-guess"
									? "What is this in Korean?"
									: "What does this word mean?"}
						</p>
						<div className="practice-answer-grid">
							{choices.map((choice) => {
								const value = practice.getAnswerValue(choice, mode);
								const correct = choice.id === item.id;
								return (
									<button
										key={choice.id}
										className={
											selected === value
												? `practice-answer ${correct ? "correct" : "wrong"}`
												: "practice-answer"
										}
										disabled={Boolean(selected)}
										onClick={() => answer(value)}
									>
										{value}
									</button>
								);
							})}
						</div>
						{selected && (
							<div className={`practice-feedback ${isCorrect ? "correct" : "wrong"}`}>
								<strong>{isCorrect ? "정답이에요!" : `The answer is ${answerText}.`}</strong>
								<p>
									{item.exampleKo}
									<br />
									{item.example}
								</p>
								<button className="lesson-next-button" onClick={practice.next}>
									{index + 1 === words.length ? "Finish round" : "Next"} <Icon name="arrow" size={17} />
								</button>
							</div>
						)}
					</div>
					<div className="lesson-card-details">
						<section>
							<span className="detail-label">WORD</span>
							<p lang="ko">
								<strong>{item.korean}</strong> · {item.romanization}
							</p>
						</section>
						<section>
							<span className="detail-label">MEANING</span>
							<p>{item.meaning}</p>
						</section>
					</div>
				</article>
			</section>
		</main>
	);
}
