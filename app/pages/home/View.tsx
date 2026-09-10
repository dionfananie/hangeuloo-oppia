import type { Route } from "../../routes/+types/home";
import { Link, useLoaderData } from "react-router";
import Icon from "./components/Icon";
import AuthScreen from "./components/AuthScreen";
import Onboarding from "./components/Onboarding";
import LevelCatalog from "./components/LevelCatalog";
import PracticeLibrary from "./components/PracticeLibrary";
import ProgressView from "./components/ProgressView";
import PracticePanel from "./components/PracticePanel";
import InterviewPanel from "./components/InterviewPanel";
import useHomeView from "./hook";
import { nav, activities, weekdays, levelNames, levelDescriptions, getInitials, getTodayLabel, getTodayWeekdayIndex } from "./helpers";


export default function Home() {
	const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
	const { user, dashboard, lessonCatalog, practiceUnlocks, googleConfigured, authError } = loaderData;
	const { active, setActive, modal, recording, setRecording, toast, speak, openActivity, closeModal, submitSession } = useHomeView(dashboard?.profile ?? null, practiceUnlocks);
	if (!user) return <AuthScreen googleConfigured={googleConfigured} authError={authError} />;
	if (!dashboard?.profile) return <Onboarding userName={user.name} />;

	const { profile, stats } = dashboard;
	const firstName = user.name.split(" ")[0];
	const initials = getInitials(user.name);
	const dailyActivities = Math.max(1, Math.ceil(profile.dailyTarget / 5));
	const todayLabel = getTodayLabel(profile.guideLanguage);
	const todayWeekdayIndex = getTodayWeekdayIndex();
	const practiceTypeById: Record<string, string> = { vocab: "vocabulary", listen: "listening", sentence: "sentence", review: "review" };
	const suggestedPractice = stats.dueCount ? "review" : "vocab";
	const suggestedUnlocked = practiceUnlocks.includes(practiceTypeById[suggestedPractice]);
	const continueLesson = lessonCatalog?.continueLesson;

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<a className="brand" href="#top" onClick={() => setActive("home")}>
					<span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span>
					<span className="brand-name">Hangeuloo</span>
				</a>
				<nav className="main-nav" aria-label="Main navigation">
					{nav.map((item) => item.id === "learn" ? <Link key={item.id} className="nav-item" to="/lessons"><Icon name={item.icon} /><span>{item.label}</span></Link> : <button key={item.id} className={active === item.id ? "nav-item active" : "nav-item"} onClick={() => { setActive(item.id); if (item.id === "interview") setModal("interview"); }}><Icon name={item.icon} /><span>{item.label}</span>{item.id === "interview" && <span className="new-badge">NEW</span>}</button>)}
				</nav>
				<div className="sidebar-bottom">
					<div className="mini-streak"><span className="mini-fire"><Icon name="flame" size={18} /></span><span><strong>{stats.streak} day streak!</strong><small>Keep it going!</small></span></div>
					<form className="profile-form" method="post" action="/api/auth/logout"><button className="profile-row" type="submit" title="Sign out">{user.picture ? <img className="avatar avatar-image" src={user.picture} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{initials}<span className="online-dot" /></span>}<span><strong>{user.name}</strong><small>Level {profile.level} · Sign out</small></span><Icon name="arrow" size={16} /></button></form>
				</div>
			</aside>

			<main className="main" id="top">
				<header className="mobile-header"><a className="brand compact" href="#top"><span className="brand-mark"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a><form method="post" action="/api/auth/logout"><button className="mobile-avatar" type="submit" title="Sign out">{user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" /> : initials}</button></form></header>
				<div className="page-wrap">
					<section className="welcome-row fade-in">
						<div><p className="eyebrow">{todayLabel}</p><h1>안녕하세요, {firstName}! <span className="wave">👋</span></h1><p>Ready for another happy step in Korean?</p></div>
						<div className="top-stats"><div><span className="stat-icon fire"><Icon name="flame" size={19} /></span><span><strong>{stats.streak}</strong><small>day streak</small></span></div><i /><div><span className="stat-icon energy"><Icon name="bolt" size={19} /></span><span><strong>{stats.totalXp}</strong><small>total XP</small></span></div><button className="heart-button" aria-label="Review words due"><Icon name="brain" size={19} /><strong>{stats.dueCount}</strong></button></div>
					</section>

					{active === "learn" ? <LevelCatalog currentLevel={profile.level} /> : active === "practice" ? <PracticeLibrary dashboard={dashboard} openActivity={openActivity} practiceUnlocks={practiceUnlocks} /> : active === "progress" ? <ProgressView dashboard={dashboard} /> : <>
						<section className="hero-card fade-in delay-1">
							<div className="hero-content"><span className="today-pill"><Icon name="sparkles" size={15} /> TODAY'S MISSION</span><h2>Every word brings you closer.</h2><p>Complete your daily practice and keep your streak shining!</p><div className="mission-progress"><div className="progress-label"><span>Daily goal</span><strong>{Math.min(stats.todayActivities, dailyActivities)} of {dailyActivities} activities</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, stats.todayActivities / dailyActivities * 100)}%` }} /></div></div><div className="hero-actions"><button className="primary-cta" onClick={() => suggestedUnlocked ? openActivity(suggestedPractice) : window.location.assign("/lessons")}><span className="play-circle"><Icon name={suggestedUnlocked ? "play" : "book"} size={17} /></span>{suggestedUnlocked ? "Start today's practice" : "Learn before you practice"}<Icon name="arrow" size={18} /></button><Link className="lessons-cta" to="/lessons"><Icon name="book" size={16} /> Browse lessons</Link></div></div>
							<div className="hero-visual" aria-hidden="true">
								<div className="sparkle s1">✦</div>
								<div className="sparkle s2">✦</div>
								<div className="mascot-shadow" /><img className="mascot" src="/hangeuloo-icon-white-small.png" alt="" /><div className="speech-bubble">화이팅!<small>You got this!</small></div></div>
						</section>

						<section className="section-block fade-in delay-2">
							<div className="section-heading"><div><h2>Today's practice</h2><p>Small steps, big progress!</p></div><button onClick={() => setActive("practice")}>View all <Icon name="arrow" size={15} /></button></div>
							<div className="activity-grid">
								{activities.map((item) => { const unlocked = practiceUnlocks.includes(practiceTypeById[item.id]); return <button key={item.id} className={`activity-card ${unlocked ? "" : "practice-locked"}`} onClick={() => unlocked ? openActivity(item.id) : window.location.assign("/lessons")}><span className={`activity-icon ${item.color}`}><Icon name={unlocked ? item.icon : "lock"} size={25} /></span><span className="activity-text"><strong>{item.title}</strong><small>{unlocked ? item.copy : "Finish a lesson to unlock"}</small><span><Icon name={unlocked ? "clock" : "book"} size={13} />{unlocked ? (item.id === "review" ? `${stats.dueCount} words due` : item.meta) : "Learn first"}</span></span>{unlocked && <span className="card-reward">{item.xp}</span>}<span className="go-arrow"><Icon name={unlocked ? "arrow" : "lock"} size={17} /></span></button>; })}
							</div>
						</section>

						<div className="lower-grid fade-in delay-3">
							<section className="continue-card">
								<div className="continue-top"><div><span className="section-kicker">CONTINUE LEARNING</span><h2>Level {profile.level} · {levelNames[profile.level]}</h2><p>{levelDescriptions[profile.level]}</p></div><span className="level-orb"><span>{profile.level}</span><small>LEVEL</small></span></div>
								{continueLesson ? <div className="lesson-progress"><div className="circle-progress"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16" /><circle className="fill" cx="21" cy="21" r="16" style={{ strokeDashoffset: 100 - continueLesson.progress }} /></svg><span>{continueLesson.progress}%</span></div><div><strong>{continueLesson.title}</strong><small>{continueLesson.itemCount} items · {continueLesson.estimatedMinutes} min</small></div><Link to={`/lessons/${continueLesson.id}`}><Icon name="play" size={15} /> Continue</Link></div> : <div className="lesson-progress"><div><strong>Learning path ready</strong><small>Start your first structured lesson.</small></div><Link to="/lessons"><Icon name="play" size={15} /> Explore</Link></div>}
							</section>
							<section className="week-card"><div className="week-top"><div><h2>This week</h2><p>{stats.weekdays.filter(Boolean).length} active days</p></div><div className="week-xp"><Icon name="bolt" size={15} /><strong>{stats.weeklyXp}</strong> XP</div></div><div className="weekdays">{weekdays.map((item, i) => <div key={i}><span className={stats.weekdays[i] ? "day done" : i === todayWeekdayIndex ? "day today" : "day"}>{stats.weekdays[i] ? <Icon name="check" size={14} /> : i === todayWeekdayIndex ? <span /> : ""}</span><small>{item.day}</small></div>)}</div><div className="weekly-note"><Icon name="star" size={17} /><span><strong>{stats.todayXp} XP today.</strong> Each completed round builds durable progress.</span></div></section>
						</div>

						<section className="interview-banner fade-in delay-3">
							<span className="ai-orb"><Icon name="mic" size={28} /><i /></span><div><span className="section-kicker">AI INTERVIEW PRACTICE</span><h2>Build confidence, one answer at a time.</h2><p>Practice real Korean conversations with friendly, actionable feedback.</p></div><button onClick={() => setModal("interview")}>Try AI interview <Icon name="arrow" size={17} /></button><span className="banner-hangul" aria-hidden="true">말</span>
						</section>
					</>}
				</div>
			</main>

			<nav className="mobile-nav" aria-label="Mobile navigation">{nav.slice(0, 5).map((item) => item.id === "learn" ? <Link key={item.id} to="/lessons"><Icon name={item.icon} /><span>{item.label}</span></Link> : <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); if (item.id === "interview") setModal("interview"); }}><Icon name={item.icon} /><span>{item.id === "interview" ? "Interview" : item.label}</span></button>)}</nav>

			{modal && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }} onKeyDown={(e) => { if (e.key === "Escape") closeModal(); }}>
				<div className="practice-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
					<button className="modal-close" onClick={closeModal} aria-label="Close"><Icon name="close" /></button>
					{modal === "interview" ? <InterviewPanel scenarios={dashboard.interviewScenarios} recording={recording} setRecording={setRecording} speak={speak} done={() => { setToast("Interview saved · +35 XP"); closeModal(); }} /> : <PracticePanel type={modal} dashboard={dashboard} submit={submitSession} speak={speak} />}
				</div>
			</div>}
			{toast && <div className="toast"><Icon name="sparkles" size={18} />{toast}</div>}
		</div>
	);
}
