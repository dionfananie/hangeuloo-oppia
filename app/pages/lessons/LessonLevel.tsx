import { Link, useLoaderData } from "react-router";
import type { Route } from "../../routes/+types/lesson-level";
import Icon from "~/pages/home/components/Icon";
import LessonsLayout from "./LessonsLayout";

const practiceLabels = { vocabulary: "Vocabulary", sentence: "Sentence builder", listening: "Listening" };

export default function LessonLevel() {
	const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
	const { user, catalog, level } = loaderData;
	const isId = catalog.guideLanguage === "id";
	return <LessonsLayout user={user}>
		<div className="lesson-breadcrumb"><Link to="/lessons"><Icon name="arrow" size={15} /> {isId ? "Semua level" : "All levels"}</Link></div>
		<section className="level-hero fade-in">
			<div className="level-hero-number"><small>LEVEL</small><strong>{level.level}</strong></div>
			<div><span className="lessons-kicker">{level.progress === 100 ? (isId ? "LEVEL SELESAI" : "LEVEL COMPLETE") : (isId ? "LEVEL AKTIF" : "ACTIVE LEVEL")}</span><h1>{level.name}</h1><p>{level.description}</p><div className="continue-meta"><span><Icon name="book" size={15} /> {level.itemCount} {isId ? "materi" : "items"}</span><span><Icon name="clock" size={15} /> {level.estimatedMinutes} min</span><span><Icon name="check" size={15} /> {level.completedCount}/{level.lessonCount} lessons</span></div></div>
			<div className="level-hero-progress"><strong>{level.progress}%</strong><small>{isId ? "progres level" : "level progress"}</small><div><span style={{ width: `${level.progress}%` }} /></div></div>
		</section>

		<section className="level-lessons fade-in delay-1">
			<div className="lessons-section-heading"><div><span className="lessons-kicker">{isId ? "URUTAN LESSON" : "LESSON ORDER"}</span><h2>{isId ? "Bangun fondasi langkah demi langkah" : "Build your foundation step by step"}</h2></div></div>
			<div className="lesson-list">{level.lessons.map((lesson, index) => {
				const locked = lesson.status === "locked";
				const content = <><span className={`lesson-step ${lesson.status}`}>{lesson.status === "completed" ? <Icon name="check" size={20} /> : locked ? <Icon name="lock" size={18} /> : index + 1}</span><div className="lesson-list-copy"><div><span>{isId ? `LESSON ${index + 1}` : `LESSON ${index + 1}`}</span>{lesson.status === "in_progress" && <b>{isId ? "SEDANG DIPELAJARI" : "IN PROGRESS"}</b>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="lesson-list-meta"><span><Icon name="book" size={13} /> {lesson.itemCount} {isId ? "materi" : "items"}</span><span><Icon name="clock" size={13} /> {lesson.estimatedMinutes} min</span><span><Icon name="game" size={13} /> {practiceLabels[lesson.practiceType]}</span></div>{lesson.progress > 0 && lesson.progress < 100 && <div className="lesson-list-progress"><span style={{ width: `${lesson.progress}%` }} /></div>}</div><span className="lesson-reward"><Icon name="bolt" size={14} /> +{lesson.xpReward} XP</span><span className="lesson-open"><Icon name="arrow" size={18} /></span></>;
				return locked ? <article className="lesson-list-card locked" key={lesson.id}>{content}<small className="lesson-lock-note">{isId ? "Selesaikan lesson sebelumnya" : "Complete the previous lesson"}</small></article> : <Link className="lesson-list-card" to={`/lessons/${lesson.id}`} key={lesson.id}>{content}</Link>;
			})}</div>
		</section>
	</LessonsLayout>;
}
