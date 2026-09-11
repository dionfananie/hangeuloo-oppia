import { Link } from "react-router";
import type { Route } from "../../../routes/+types/lesson";
import Icon from "~/pages/home/components/Icon";
import useLessonPlayer from "./useLessonPlayer";
import useLessonDetail from "./hook";

const practiceRoutes = { vocabulary: "vocab", sentence: "sentence", listening: "listen" };

export default function LessonDetail() {
	const { lesson } = useLessonDetail();
	return <LessonPlayer key={lesson.id} lesson={lesson} />;
}

function LessonPlayer({ lesson }: { lesson: Route.ComponentProps["loaderData"]["lesson"] }) {
	const player = useLessonPlayer(lesson);
	const completed = player.completion;
	if (completed)
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
						<Icon name="star" size={43} />
						<span>
							<Icon name="check" size={20} />
						</span>
					</div>
					<span className="lessons-kicker">LESSON COMPLETE</span>
					<h1>잘했어요!</h1>
					<p>
						You finished <strong>{lesson.title}</strong>. Your new Korean is ready to practice.
					</p>
					<div className="completion-stats">
						<article>
							<span>
								<Icon name="book" size={21} />
							</span>
							<strong>{lesson.itemCount}</strong>
							<small>items learned</small>
						</article>
						<article>
							<span>
								<Icon name="bolt" size={21} />
							</span>
							<strong>+{completed.xp ?? 0}</strong>
							<small>XP earned</small>
						</article>
						<article>
							<span>
								<Icon name="brain" size={21} />
							</span>
							<strong>{completed.vocabularyAdded ?? 0}</strong>
							<small>words for review</small>
						</article>
					</div>
					<div className="completion-actions">
						<Link
							className="lesson-primary-link"
							to={
								completed.practiceType === "vocabulary"
									? "/practice/vocabulary"
									: `/practice/${practiceRoutes[completed.practiceType ?? lesson.practiceType]}`
							}
							onClick={() =>
								navigator.sendBeacon?.(
									`/lessons/${lesson.id}`,
									new URLSearchParams({ intent: "lesson-event", eventType: "practice_clicked" }),
								)
							}
						>
							<span>
								<Icon name="game" size={18} />
							</span>
							Practice now
							<Icon name="arrow" size={17} />
						</Link>
						{completed.nextLessonId ? (
							<Link className="lesson-secondary-link" to={`/lessons/${completed.nextLessonId}`}>
								Continue next lesson <Icon name="arrow" size={17} />
							</Link>
						) : (
							<Link className="lesson-secondary-link" to="/lessons">
								Back to learning path <Icon name="arrow" size={17} />
							</Link>
						)}
					</div>
				</section>
			</main>
		);

	const progress = ((player.index + 1) / lesson.items.length) * 100;
	return (
		<main className="lesson-player-shell">
			<header className="lesson-player-header">
				<Link className="lesson-exit" to={`/lessons/levels/${lesson.level}`} aria-label="Exit lesson">
					<Icon name="close" size={20} />
				</Link>
				<div
					className="lesson-player-progress"
					role="progressbar"
					aria-label="Lesson progress"
					aria-valuenow={Math.round(progress)}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<span style={{ width: `${progress}%` }} />
				</div>
				<strong>
					{player.index + 1}
					<small> / {lesson.items.length}</small>
				</strong>
			</header>
			<section className="lesson-player-content fade-in">
				<div className="lesson-card-heading">
					<span className={`lesson-type type-${player.item.type}`}>{player.item.type}</span>
					<span>{lesson.title}</span>
					{lesson.status === "completed" && (
						<b>
							<Icon name="check" size={12} /> completed
						</b>
					)}
				</div>
				<article className={`learning-card ${player.item.type}`}>
					<div className="learning-card-focus">
						<span className="focus-glow" aria-hidden="true" />
						<div className="lesson-korean" lang="ko">
							{player.item.koreanText}
						</div>
						<div className="lesson-romanization">{player.item.romanization}</div>
					</div>
					<div className="lesson-audio-controls">
						<button
							className={`lesson-play ${player.audioState === "playing" ? "is-playing" : ""}`}
							onClick={() => player.play()}
							disabled={player.audioState === "loading"}
						>
							<span>
								{player.audioState === "loading" ? (
									<i className="audio-loader" />
								) : (
									<Icon name={player.audioState === "playing" ? "headphones" : "play"} size={23} />
								)}
							</span>
							{player.audioState === "playing"
								? "Pause"
								: player.audioState === "paused"
									? "Resume"
									: "Play audio"}
						</button>
						<button className="lesson-replay" onClick={player.replay} aria-label="Replay audio">
							<Icon name="headphones" size={18} /> Replay
						</button>
						<div className="lesson-speeds" role="group" aria-label="Audio speed">
							{[0.75, 1, 1.25].map((speed) => (
								<button
									className={player.speed === speed ? "active" : ""}
									aria-pressed={player.speed === speed}
									onClick={() => player.changeSpeed(speed)}
									key={speed}
								>
									{speed}x
								</button>
							))}
						</div>
					</div>
					{player.audioState === "error" && (
						<div className="lesson-audio-error" role="alert">
							<span>
								<Icon name="headphones" size={17} />
							</span>
							<p>
								<strong>Audio could not play.</strong> Use the reading guide: {player.item.romanization}
							</p>
							<button onClick={() => player.play()}>Retry</button>
						</div>
					)}
					<div className="lesson-card-details">
						<section>
							<span className="detail-label">PRONUNCIATION</span>
							<p>{player.item.pronunciation}</p>
						</section>
						<section className="translation-section">
							<span className="detail-label">MEANING</span>
							{player.showTranslation ? (
								<div className="translation-answer fade-in">
									<strong>{player.item.translation}</strong>
									<Icon name="check" size={17} />
								</div>
							) : (
								<button onClick={player.revealTranslation}>
									<Icon name="sparkles" size={16} /> Reveal meaning
								</button>
							)}
						</section>
						<section className="example-section">
							<span className="detail-label">IN CONTEXT</span>
							<strong lang="ko">{player.item.exampleKo}</strong>
							<small>{player.item.example}</small>
						</section>
						<section className="explanation-section">
							<button
								aria-expanded={player.showExplanation}
								onClick={() => player.setShowExplanation(!player.showExplanation)}
							>
								<span>
									<Icon name="book" size={17} /> Why does this work?
								</span>
								<Icon name="arrow" size={16} />
							</button>
							{player.showExplanation && <p className="fade-in">{player.item.explanation}</p>}
						</section>
					</div>
				</article>
				<footer className="lesson-player-actions">
					<button
						className="lesson-back-button"
						onClick={() => player.goTo(player.index - 1)}
						disabled={player.index === 0}
					>
						<Icon name="arrow" size={18} /> Back
					</button>
					{player.index === lesson.items.length - 1 ? (
						<button
							className="lesson-next-button finish"
							onClick={player.complete}
							disabled={player.completing || player.viewing}
						>
							{player.completing || player.viewing ? "Saving…" : "Complete lesson"}
							<Icon name="check" size={18} />
						</button>
					) : (
						<button
							className="lesson-next-button"
							onClick={() => player.goTo(player.index + 1)}
							disabled={player.viewing}
						>
							Next <Icon name="arrow" size={18} />
						</button>
					)}
				</footer>
			</section>
		</main>
	);
}
