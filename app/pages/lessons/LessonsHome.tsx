import { Link, useLoaderData } from "react-router";
import type { Route } from "../../routes/+types/lessons";
import Icon from "~/pages/home/components/Icon";
import LessonsLayout from "./LessonsLayout";

const futureLevels = ["Conversation Builder", "Interview Korean", "Professional Korean", "Advanced Korean"];

export default function LessonsHome() {
	const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
	const { user, catalog } = loaderData;
	const isId = catalog.guideLanguage === "id";
	const currentLevel = catalog.levels[catalog.currentLevel];
	return <LessonsLayout user={user}>
		<section className="lessons-welcome fade-in">
			<div>
				<span className="lessons-kicker"><Icon name="sparkles" size={14} /> {isId ? "JALUR BELAJARMU" : "YOUR LEARNING PATH"}</span>
				<h1>{isId ? "Belajar dulu, latihan berikutnya." : "Learn first, practice next."}</h1>
				<p>{isId ? "Kenali bentuk, dengarkan bunyinya, lalu gunakan Bahasa Korea dengan percaya diri." : "See the shape, hear the sound, then use Korean with confidence."}</p>
			</div>
			<div className="lessons-total-progress" aria-label={`${catalog.completedLessons} of ${catalog.totalLessons} lessons completed`}>
				<div className="lesson-ring" style={{ "--lesson-progress": `${catalog.completedLessons / catalog.totalLessons * 100}%` } as React.CSSProperties}><strong>{catalog.completedLessons}</strong><small>/{catalog.totalLessons}</small></div>
				<span><strong>{isId ? "Lesson selesai" : "Lessons complete"}</strong><small>{isId ? "Terus bertumbuh setiap hari" : "Keep growing every day"}</small></span>
			</div>
		</section>

		{catalog.continueLesson && <section className="lessons-continue fade-in delay-1">
			<div className="continue-art" aria-hidden="true"><span>한</span><i>ㄱ</i><b>ㅏ</b></div>
			<div className="lessons-continue-copy">
				<span className="lessons-kicker">{catalog.continueLesson.status === "in_progress" ? (isId ? "LANJUTKAN LESSON" : "CONTINUE LESSON") : (isId ? "LANGKAH BERIKUTNYA" : "YOUR NEXT STEP")}</span>
				<h2>{catalog.continueLesson.title}</h2>
				<p>{catalog.continueLesson.description}</p>
				<div className="continue-meta"><span><Icon name="book" size={15} /> {catalog.continueLesson.itemCount} {isId ? "materi" : "items"}</span><span><Icon name="clock" size={15} /> {catalog.continueLesson.estimatedMinutes} min</span><span><Icon name="bolt" size={15} /> +{catalog.continueLesson.xpReward} XP</span></div>
				<div className="lesson-inline-progress" role="progressbar" aria-label="Lesson progress" aria-valuenow={catalog.continueLesson.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${catalog.continueLesson.progress}%` }} /></div>
			</div>
			<Link className="lesson-primary-link" to={`/lessons/${catalog.continueLesson.id}`}><span><Icon name="play" size={18} /></span>{catalog.continueLesson.status === "in_progress" ? (isId ? "Lanjutkan" : "Continue") : (isId ? "Mulai lesson" : "Start lesson")}<Icon name="arrow" size={17} /></Link>
		</section>}

		<section className="lessons-section fade-in delay-2">
			<div className="lessons-section-heading"><div><span className="lessons-kicker">LEVEL 0–2</span><h2>{isId ? "Pilih level" : "Choose a level"}</h2></div><p>{isId ? "Selesaikan lesson berurutan untuk membuka latihan." : "Complete lessons in order to unlock practice."}</p></div>
			<div className="lessons-level-grid">
				{catalog.levels.map((level) => {
					const content = <><div className="lessons-level-top"><span className="lessons-level-number">{level.level}</span><span className={`level-status ${level.locked ? "locked" : level.progress === 100 ? "complete" : ""}`}>{level.locked ? <><Icon name="lock" size={12} /> {isId ? "TERKUNCI" : "LOCKED"}</> : level.progress === 100 ? <><Icon name="check" size={12} /> {isId ? "SELESAI" : "COMPLETE"}</> : level.level === catalog.currentLevel ? (isId ? "LEVEL SAAT INI" : "CURRENT LEVEL") : (isId ? "TERSEDIA" : "AVAILABLE")}</span></div><h3>{level.name}</h3><p>{level.description}</p><div className="level-facts"><span>{level.lessonCount} lessons</span><i /><span>{level.itemCount} {isId ? "materi" : "items"}</span><i /><span>{level.estimatedMinutes} min</span></div><div className="level-progress-row"><div><span style={{ width: `${level.progress}%` }} /></div><strong>{level.progress}%</strong></div></>;
					return level.locked ? <article className="lessons-level-card is-locked" key={level.level}>{content}</article> : <Link className={`lessons-level-card ${level.level === catalog.currentLevel ? "is-current" : ""}`} to={`/lessons/levels/${level.level}`} key={level.level}>{content}<span className="level-card-arrow"><Icon name="arrow" size={18} /></span></Link>;
				})}
			</div>
		</section>

		<section className="coming-levels fade-in delay-3">
			<div><span className="lessons-kicker">{isId ? "SEGERA HADIR" : "COMING SOON"}</span><h2>{isId ? "Perjalananmu masih panjang" : "More milestones ahead"}</h2></div>
			<div className="coming-level-row">{futureLevels.map((name, index) => <article key={name}><span><Icon name="lock" size={14} /> LEVEL {index + 3}</span><strong>{name}</strong></article>)}</div>
		</section>
	</LessonsLayout>;
}
