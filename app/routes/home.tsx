import { useEffect, useRef, useState } from "react";
import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/home";
import { authEnv, getAuthUser, isGoogleConfigured } from "../lib/auth.server";
import { completeSession, ensureUser, getDashboard, saveProfile } from "../lib/learning.server";
import type { DashboardData, ListeningExercise, SentenceExercise, VocabularyItem } from "../lib/learning.server";
import { generateFeedback, saveInterview, transcribeKorean } from "../lib/interview.server";
import type { InterviewFeedback, InterviewScenario } from "../lib/interview.server";

type IconName =
	| "home" | "map" | "game" | "mic" | "chart" | "flame" | "bolt"
	| "book" | "headphones" | "message" | "brain" | "play" | "arrow"
	| "check" | "lock" | "star" | "heart" | "clock" | "sparkles" | "close";

const paths: Record<IconName, React.ReactNode> = {
	home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
	map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></>,
	game: <><path d="M8 12h.01M16 12h.01M12 8v8M8 12h8"/><path d="M7 6h10a5 5 0 0 1 4.6 7l-1.2 2.8a3 3 0 0 1-4.7 1.1L13.8 15h-3.6l-1.9 1.9a3 3 0 0 1-4.7-1.1L2.4 13A5 5 0 0 1 7 6Z"/></>,
	mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></>,
	chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
	flame: <path d="M12 22c4 0 7-3 7-7 0-5-3-7-2-11-4 2-7 5-7 9-1-2-2-3-4-4-1 2-1 4-1 6 0 4 3 7 7 7Z"/>,
	bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7Z"/>,
	book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
	headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h4v7H6a2 2 0 0 1-2-2ZM20 14h-4v7h2a2 2 0 0 0 2-2Z"/></>,
	message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>,
	brain: <><path d="M9.5 4A3.5 3.5 0 0 0 6 7.5v.7a4 4 0 0 0-2 6.8 3.5 3.5 0 0 0 5.5 4.1M14.5 4A3.5 3.5 0 0 1 18 7.5v.7a4 4 0 0 1 2 6.8 3.5 3.5 0 0 1-5.5 4.1"/><path d="M12 3v18M8 9h4M12 15h4"/></>,
	play: <path d="m9 6 9 6-9 6Z"/>, arrow: <path d="m9 18 6-6-6-6"/>,
	check: <path d="m5 12 4 4L19 6"/>, lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
	star: <path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17.3l-6.3 3.2L7 13.7 2 8.9 9 8Z"/>,
	heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
	clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
	sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z"/><path d="m5 15 .8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8Z"/></>,
	close: <><path d="m6 6 12 12M18 6 6 18"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
	return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const nav = [
	{ id: "home", label: "Home", icon: "home" as IconName },
	{ id: "learn", label: "Learn", icon: "map" as IconName },
	{ id: "practice", label: "Practice", icon: "game" as IconName },
	{ id: "interview", label: "AI Interview", icon: "mic" as IconName },
	{ id: "progress", label: "Progress", icon: "chart" as IconName },
];

const weekdays = [
	{ day: "M", done: true }, { day: "T", done: true }, { day: "W", done: true },
	{ day: "T", done: true }, { day: "F", done: false, today: true },
	{ day: "S", done: false }, { day: "S", done: false },
];

const activities = [
	{ id: "vocab", icon: "book" as IconName, title: "Vocabulary", copy: "Match Korean words", meta: "10 words", color: "purple", xp: "+20 XP" },
	{ id: "listen", icon: "headphones" as IconName, title: "Listening", copy: "Hear & understand", meta: "5 exercises", color: "blue", xp: "+15 XP" },
	{ id: "sentence", icon: "message" as IconName, title: "Sentences", copy: "Build correct sentences", meta: "7 sentences", color: "coral", xp: "+20 XP" },
	{ id: "review", icon: "brain" as IconName, title: "Memory Review", copy: "Strengthen your recall", meta: "8 words due", color: "mint", xp: "+15 XP" },
];

const levelNames = ["Hangul Starter", "First Korean", "Daily Korean"];
const levelDescriptions = ["Read Hangul and use essential greetings", "Build simple, polite everyday sentences", "Talk about routines, plans, and past experiences"];

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Hangeuloo — Learn Korean, one happy step at a time" },
		{ name: "description", content: "Cheerful Korean practice with bite-sized lessons and AI interview coaching." },
	];
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = authEnv(context.cloudflare.env);
	const url = new URL(request.url);
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (user) await ensureUser(context.cloudflare.env.DB, user);
	return {
		user,
		dashboard: user ? await getDashboard(context.cloudflare.env.DB, user.sub) : null,
		googleConfigured: isGoogleConfigured(env),
		authError: url.searchParams.get("authError"),
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const user = await getAuthUser(request, context.cloudflare.env.DB);
	if (!user) throw new Response("Unauthorized", { status: 401 });
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");
	if (intent === "onboarding") {
		const guideLanguage = form.get("guideLanguage") === "id" ? "id" : "en";
		const goal = String(form.get("goal"));
		const level = Number(form.get("level"));
		const dailyTarget = Number(form.get("dailyTarget"));
		const interests = form.getAll("interests").map(String).slice(0, 6);
		if (!["conversation", "job", "topik", "travel"].includes(goal) || ![0, 1, 2].includes(level) || ![5, 10, 15, 20].includes(dailyTarget)) {
			return { ok: false, error: "Please complete every onboarding step." };
		}
		await saveProfile(context.cloudflare.env.DB, user.sub, { guideLanguage, goal: goal as "conversation" | "job" | "topik" | "travel", level, dailyTarget, interests });
		return redirect("/");
	}
	if (intent === "transcribe") {
		const audio = form.get("audio");
		if (!(audio instanceof File)) return { ok: false, error: "No recording was attached." };
		try {
			const transcript = await transcribeKorean(context.cloudflare.env.AI, audio);
			return { ok: true, transcript };
		} catch (error) {
			return { ok: false, error: error instanceof Error ? error.message : "Transcription failed. You can type your answer instead." };
		}
	}
	if (intent === "interview-feedback") {
		const scenarioId = Number(form.get("scenarioId"));
		const answer = String(form.get("answer") ?? "").trim().slice(0, 2000);
		const answerMode = form.get("answerMode") === "voice" ? "voice" : "typed";
		const duration = Math.max(0, Math.min(900, Number(form.get("duration")) || 0));
		const idempotencyKey = String(form.get("idempotencyKey") ?? "").slice(0, 100);
		const dashboard = await getDashboard(context.cloudflare.env.DB, user.sub);
		const scenario = dashboard.interviewScenarios.find((item) => item.id === scenarioId);
		if (!scenario || answer.length < 2 || !idempotencyKey) return { ok: false, error: "Choose a scenario and add your Korean answer." };
		try {
			const feedback = await generateFeedback(context.cloudflare.env.AI, { scenario, answer, language: dashboard.profile!.guideLanguage });
			const sessionId = await saveInterview(context.cloudflare.env.DB, { userId: user.sub, scenario, answer, answerMode, duration, idempotencyKey, feedback });
			return { ok: true, feedback, sessionId };
		} catch {
			return { ok: false, error: "AI coaching is temporarily unavailable. Your answer is still here, so you can retry." };
		}
	}
	if (intent === "complete-session") {
		const gameType = String(form.get("gameType"));
		const totalCount = Number(form.get("totalCount"));
		const correctCount = Number(form.get("correctCount"));
		const level = Number(form.get("level"));
		if (!["vocabulary", "sentence", "listening", "review"].includes(gameType) || !Number.isInteger(totalCount) || totalCount < 1 || totalCount > 20 || !Number.isInteger(correctCount)) {
			return { ok: false, error: "That practice result was not valid." };
		}
		let results: Array<{ id: number; correct: boolean; confidence?: "again" | "hard" | "good" }> = [];
		try {
			results = JSON.parse(String(form.get("results") ?? "[]"));
			if (!Array.isArray(results) || results.length > 20) throw new Error();
			results = results.filter((result) => Number.isInteger(result.id) && typeof result.correct === "boolean");
		} catch {
			return { ok: false, error: "That review result was not valid." };
		}
		const xp = await completeSession(context.cloudflare.env.DB, user.sub, { gameType: gameType as "vocabulary" | "sentence" | "listening" | "review", level: Math.max(0, Math.min(2, level)), correctCount, totalCount, results });
		return { ok: true, xp };
	}
	return { ok: false, error: "Unknown action." };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { user, dashboard, googleConfigured, authError } = loaderData;
	const [active, setActive] = useState("home");
	const [modal, setModal] = useState<string | null>(null);
	const [recording, setRecording] = useState(false);
	const [toast, setToast] = useState("");
	const progressFetcher = useFetcher<{ ok: boolean; xp?: number; error?: string }>();

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(""), 2400);
		return () => clearTimeout(timer);
	}, [toast]);
	useEffect(() => {
		if (!progressFetcher.data) return;
		if (progressFetcher.data.ok) {
			setToast(`Practice saved · +${progressFetcher.data.xp ?? 0} XP`);
			closeModal();
		} else if (progressFetcher.data.error) setToast(progressFetcher.data.error);
	}, [progressFetcher.data]);

	if (!user) return <AuthScreen googleConfigured={googleConfigured} authError={authError} />;
	if (!dashboard?.profile) return <Onboarding userName={user.name} />;
	const firstName = user.name.split(" ")[0];
	const initials = user.name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
	const { profile, stats } = dashboard;
	const dailyActivities = Math.max(1, Math.ceil(profile.dailyTarget / 5));
	const todayLabel = new Intl.DateTimeFormat(profile.guideLanguage === "id" ? "id-ID" : "en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
	const todayWeekdayIndex = (new Date().getDay() + 6) % 7;

	function speak(text = "오늘 무엇을 했어요?", rate = 0.82) {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.cancel();
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = "ko-KR";
			utterance.rate = rate;
			window.speechSynthesis.speak(utterance);
			setToast("Playing Korean audio");
		} else setToast("Audio isn't available in this browser");
	}

	function openActivity(id: string) {
		setRecording(false);
		setModal(id);
	}

	function closeModal() {
		setRecording(false);
		if (typeof window !== "undefined") window.speechSynthesis?.cancel();
		setModal(null);
	}

	function submitSession(result: { gameType: string; correctCount: number; totalCount: number; results?: Array<{ id: number; correct: boolean; confidence?: "again" | "hard" | "good" }> }) {
		progressFetcher.submit({ intent: "complete-session", level: String(profile.level), gameType: result.gameType, correctCount: String(result.correctCount), totalCount: String(result.totalCount), results: JSON.stringify(result.results ?? []) }, { method: "post" });
	}

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<a className="brand" href="#top" onClick={() => setActive("home")}>
					<span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span>
					<span className="brand-name">Hangeuloo</span>
				</a>
				<nav className="main-nav" aria-label="Main navigation">
					{nav.map((item) => <button key={item.id} className={active === item.id ? "nav-item active" : "nav-item"} onClick={() => { setActive(item.id); if (item.id === "interview") setModal("interview"); }}><Icon name={item.icon}/><span>{item.label}</span>{item.id === "interview" && <span className="new-badge">NEW</span>}</button>)}
				</nav>
				<div className="sidebar-bottom">
					<div className="mini-streak"><span className="mini-fire"><Icon name="flame" size={18}/></span><span><strong>{stats.streak} day streak!</strong><small>Keep it going!</small></span></div>
					<form className="profile-form" method="post" action="/api/auth/logout"><button className="profile-row" type="submit" title="Sign out">{user.picture ? <img className="avatar avatar-image" src={user.picture} alt="" referrerPolicy="no-referrer"/> : <span className="avatar">{initials}<span className="online-dot"/></span>}<span><strong>{user.name}</strong><small>Level {profile.level} · Sign out</small></span><Icon name="arrow" size={16}/></button></form>
				</div>
			</aside>

			<main className="main" id="top">
				<header className="mobile-header"><a className="brand compact" href="#top"><span className="brand-mark"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a><form method="post" action="/api/auth/logout"><button className="mobile-avatar" type="submit" title="Sign out">{user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer"/> : initials}</button></form></header>
				<div className="page-wrap">
					<section className="welcome-row fade-in">
						<div><p className="eyebrow">{todayLabel}</p><h1>안녕하세요, {firstName}! <span className="wave">👋</span></h1><p>Ready for another happy step in Korean?</p></div>
						<div className="top-stats"><div><span className="stat-icon fire"><Icon name="flame" size={19}/></span><span><strong>{stats.streak}</strong><small>day streak</small></span></div><i/><div><span className="stat-icon energy"><Icon name="bolt" size={19}/></span><span><strong>{stats.totalXp}</strong><small>total XP</small></span></div><button className="heart-button" aria-label="Review words due"><Icon name="brain" size={19}/><strong>{stats.dueCount}</strong></button></div>
					</section>

					{active === "learn" ? <LevelCatalog currentLevel={profile.level}/> : active === "practice" ? <PracticeLibrary dashboard={dashboard} openActivity={openActivity}/> : active === "progress" ? <ProgressView dashboard={dashboard}/> : <>
					<section className="hero-card fade-in delay-1">
						<div className="hero-content"><span className="today-pill"><Icon name="sparkles" size={15}/> TODAY'S MISSION</span><h2>Every word brings you closer.</h2><p>Complete your daily practice and keep your streak shining!</p><div className="mission-progress"><div className="progress-label"><span>Daily goal</span><strong>{Math.min(stats.todayActivities, dailyActivities)} of {dailyActivities} activities</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, stats.todayActivities / dailyActivities * 100)}%` }}/></div></div><button className="primary-cta" onClick={() => openActivity(stats.dueCount ? "review" : "vocab")}><span className="play-circle"><Icon name="play" size={17}/></span>Start today's practice<Icon name="arrow" size={18}/></button></div>
						<div className="hero-visual" aria-hidden="true"><div className="sparkle s1">✦</div><div className="sparkle s2">✦</div><div className="mascot-shadow"/><img className="mascot" src="/hangeuloo-icon-white-small.png" alt=""/><div className="speech-bubble">화이팅!<small>You got this!</small></div></div>
					</section>

					<section className="section-block fade-in delay-2">
						<div className="section-heading"><div><h2>Today's practice</h2><p>Small steps, big progress!</p></div><button onClick={() => setActive("practice")}>View all <Icon name="arrow" size={15}/></button></div>
						<div className="activity-grid">
							{activities.map((item) => <button key={item.id} className="activity-card" onClick={() => openActivity(item.id)}><span className={`activity-icon ${item.color}`}><Icon name={item.icon} size={25}/></span><span className="activity-text"><strong>{item.title}</strong><small>{item.copy}</small><span><Icon name="clock" size={13}/>{item.id === "review" ? `${stats.dueCount} words due` : item.meta}</span></span><span className="card-reward">{item.xp}</span><span className="go-arrow"><Icon name="arrow" size={17}/></span></button>)}
						</div>
					</section>

					<div className="lower-grid fade-in delay-3">
						<section className="continue-card">
							<div className="continue-top"><div><span className="section-kicker">CONTINUE LEARNING</span><h2>Level {profile.level} · {levelNames[profile.level]}</h2><p>{levelDescriptions[profile.level]}</p></div><span className="level-orb"><span>{profile.level}</span><small>LEVEL</small></span></div>
							<div className="lesson-progress"><div className="circle-progress"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16"/><circle className="fill" cx="21" cy="21" r="16"/></svg><span>65%</span></div><div><strong>Lesson 8 of 12</strong><small>Past tense: -았어요 / -었어요</small></div><button onClick={() => openActivity("sentence")}><Icon name="play" size={15}/> Continue</button></div>
						</section>
						<section className="week-card"><div className="week-top"><div><h2>This week</h2><p>{stats.weekdays.filter(Boolean).length} active days</p></div><div className="week-xp"><Icon name="bolt" size={15}/><strong>{stats.weeklyXp}</strong> XP</div></div><div className="weekdays">{weekdays.map((item, i) => <div key={i}><span className={stats.weekdays[i] ? "day done" : i === todayWeekdayIndex ? "day today" : "day"}>{stats.weekdays[i] ? <Icon name="check" size={14}/> : i === todayWeekdayIndex ? <span/> : ""}</span><small>{item.day}</small></div>)}</div><div className="weekly-note"><Icon name="star" size={17}/><span><strong>{stats.todayXp} XP today.</strong> Each completed round builds durable progress.</span></div></section>
					</div>

					<section className="interview-banner fade-in delay-3">
						<span className="ai-orb"><Icon name="mic" size={28}/><i/></span><div><span className="section-kicker">AI INTERVIEW PRACTICE</span><h2>Build confidence, one answer at a time.</h2><p>Practice real Korean conversations with friendly, actionable feedback.</p></div><button onClick={() => setModal("interview")}>Try AI interview <Icon name="arrow" size={17}/></button><span className="banner-hangul" aria-hidden="true">말</span>
					</section>
					</>}
				</div>
			</main>

			<nav className="mobile-nav" aria-label="Mobile navigation">{nav.slice(0,5).map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); if (item.id === "interview") setModal("interview"); }}><Icon name={item.icon}/><span>{item.id === "interview" ? "Interview" : item.label}</span></button>)}</nav>

			{modal && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }} onKeyDown={(e) => { if (e.key === "Escape") closeModal(); }}>
				<div className="practice-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
					<button className="modal-close" onClick={closeModal} aria-label="Close"><Icon name="close"/></button>
					{modal === "interview" ? <InterviewPanel scenarios={dashboard.interviewScenarios} recording={recording} setRecording={setRecording} speak={speak} done={() => { setToast("Interview saved · +35 XP"); closeModal(); }}/> : <PracticePanel type={modal} dashboard={dashboard} submit={submitSession} speak={speak}/>}
				</div>
			</div>}
			{toast && <div className="toast"><Icon name="sparkles" size={18}/>{toast}</div>}
		</div>
	);
}

function AuthScreen({ googleConfigured, authError }: { googleConfigured: boolean; authError: string | null }) {
	const [mode, setMode] = useState<"login" | "signup">("signup");
	const errors: Record<string, string> = {
		"not-configured": "Google sign-in is not configured yet.",
		cancelled: "Google sign-in was cancelled. You can try again anytime.",
		"invalid-state": "That sign-in request expired. Please try again.",
		"google-failed": "We couldn't complete Google sign-in. Please try again.",
	};
	return <main className="auth-page">
		<section className="auth-story">
			<a className="brand auth-brand" href="/"><span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a>
			<div className="auth-copy"><span className="auth-pill"><Icon name="sparkles" size={15}/> YOUR KOREAN JOURNEY</span><h1>Learn Korean,<br/><em>one happy step</em><br/>at a time.</h1><p>Short daily lessons, playful practice, and friendly AI interview coaching—all made to help you speak with confidence.</p><div className="auth-benefits"><span><i><Icon name="bolt" size={17}/></i>10-minute daily missions</span><span><i><Icon name="message" size={17}/></i>Real conversation practice</span><span><i><Icon name="flame" size={17}/></i>Progress that keeps you motivated</span></div></div>
			<div className="auth-mascot" aria-hidden="true"><div className="auth-bubble">같이 배워요!<small>Let's learn together!</small></div><img className="auth-mascot-image" src="/hangeuloo-icon-white-small.png" alt=""/><span className="auth-star one">✦</span><span className="auth-star two">✦</span></div>
		</section>
		<section className="auth-panel"><div className="auth-card"><div className="auth-tabs" role="tablist"><button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button><button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button></div><div className="auth-heading"><span className="auth-wave">👋</span><h2>{mode === "signup" ? "Start your happy journey!" : "Welcome back!"}</h2><p>{mode === "signup" ? "Create your free account and learn your first Korean words today." : "Continue your streak and keep making progress."}</p></div>{authError && <div className="auth-error" role="alert"><Icon name="heart" size={18}/>{errors[authError] ?? "Something went wrong. Please try again."}</div>}<a className={`google-button ${!googleConfigured ? "disabled" : ""}`} href={googleConfigured ? "/api/auth/google?returnTo=/" : "/?authError=not-configured"}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</a><p className="auth-terms">By continuing, you agree to Hangeuloo's <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p><div className="auth-switch">{mode === "signup" ? "Already learning with us?" : "New to Hangeuloo?"} <button onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Log in" : "Create an account"}</button></div></div><p className="auth-safe"><Icon name="lock" size={14}/> Secure sign-in powered by Google</p></section>
	</main>;
}

function Onboarding({ userName }: { userName: string }) {
	return <main className="onboarding-page"><section className="onboarding-card">
		<a className="brand" href="/"><span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a>
		<div className="onboarding-heading"><span className="auth-pill"><Icon name="sparkles" size={15}/> 2 MINUTE SETUP</span><h1>반가워요, {userName.split(" ")[0]}!</h1><p>Tell us how you want to learn. You can change these choices later.</p></div>
		<Form method="post" className="onboarding-form">
			<input type="hidden" name="intent" value="onboarding"/>
			<fieldset><legend>Guidance language <small>Bahasa pengantar</small></legend><div className="option-row"><label><input type="radio" name="guideLanguage" value="id" defaultChecked/><span>Bahasa Indonesia</span></label><label><input type="radio" name="guideLanguage" value="en"/><span>English</span></label></div></fieldset>
			<fieldset><legend>Your main goal</legend><div className="option-grid"><label><input type="radio" name="goal" value="conversation" defaultChecked/><span>Everyday conversation</span></label><label><input type="radio" name="goal" value="job"/><span>Job interview</span></label><label><input type="radio" name="goal" value="topik"/><span>TOPIK study</span></label><label><input type="radio" name="goal" value="travel"/><span>Travel</span></label></div></fieldset>
			<fieldset><legend>Starting level</legend><div className="level-options">{levelNames.map((name, level) => <label key={name}><input type="radio" name="level" value={level} defaultChecked={level === 0}/><span><b>Level {level}</b><strong>{name}</strong><small>{levelDescriptions[level]}</small></span></label>)}</div></fieldset>
			<fieldset><legend>Topics you enjoy <small>Choose any</small></legend><div className="chip-options">{["K-culture", "Food", "Travel", "School", "Work", "Daily life"].map((interest) => <label key={interest}><input type="checkbox" name="interests" value={interest}/><span>{interest}</span></label>)}</div></fieldset>
			<label className="target-field">Daily practice target<select name="dailyTarget" defaultValue="10"><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="20">20 minutes</option></select></label>
			<button className="check-button" type="submit">Build my learning path <Icon name="arrow" size={17}/></button>
		</Form>
	</section></main>;
}

function LevelCatalog({ currentLevel }: { currentLevel: number }) {
	const future = ["Conversation Builder", "Interview Korean", "Professional Korean", "Advanced Korean"];
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">YOUR LEARNING PATH</span><h2>Seven steps to confident Korean</h2><p>Levels 0–2 are ready now. Complete four practice tracks at your pace.</p></div><div className="level-grid">
		{levelNames.map((name, level) => <article className={level === currentLevel ? "level-card current" : "level-card"} key={name}><span className="level-number">{level}</span><div><small>{level === currentLevel ? "CURRENT LEVEL" : level < currentLevel ? "AVAILABLE" : "READY TO EXPLORE"}</small><h3>{name}</h3><p>{levelDescriptions[level]}</p><div className="track-list">{["Vocabulary", "Grammar", "Listening", "Speaking"].map((track) => <span key={track}><Icon name="check" size={13}/>{track}</span>)}</div></div></article>)}
		{future.map((name, index) => <article className="level-card locked" key={name}><span className="level-number"><Icon name="lock" size={20}/></span><div><small>COMING SOON · LEVEL {index + 3}</small><h3>{name}</h3><p>Preview the next milestone while you build strong foundations.</p></div></article>)}
	</div></section>;
}

function PracticeLibrary({ dashboard, openActivity }: { dashboard: DashboardData; openActivity: (id: string) => void }) {
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">PRACTICE LIBRARY</span><h2>Choose today’s focus</h2><p>Every completed activity updates your XP, streak, and review schedule.</p></div><div className="practice-library">{activities.map((item) => <button key={item.id} className="library-card" onClick={() => openActivity(item.id)}><span className={`activity-icon ${item.color}`}><Icon name={item.icon} size={25}/></span><div><strong>{item.title}</strong><p>{item.copy}</p><small>{item.id === "review" ? `${dashboard.stats.dueCount} words ready now` : item.meta}</small></div><Icon name="arrow"/></button>)}</div></section>;
}

function ProgressView({ dashboard }: { dashboard: DashboardData }) {
	const { stats, profile } = dashboard;
	const mastery = stats.totalVocabulary ? Math.round(stats.masteredCount / stats.totalVocabulary * 100) : 0;
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">LEARNING PROGRESS</span><h2>Your effort is adding up</h2><p>Progress is saved after every completed practice round.</p></div><div className="progress-cards"><article><span className="stat-icon energy"><Icon name="bolt"/></span><strong>{stats.totalXp}</strong><small>Total XP</small></article><article><span className="stat-icon fire"><Icon name="flame"/></span><strong>{stats.streak}</strong><small>Day streak</small></article><article><span className="activity-icon mint"><Icon name="brain"/></span><strong>{stats.dueCount}</strong><small>Reviews due</small></article><article><span className="activity-icon purple"><Icon name="star"/></span><strong>{mastery}%</strong><small>Vocabulary mastered</small></article></div><div className="progress-detail"><div><h3>Level {profile!.level} · {levelNames[profile!.level]}</h3><p>{stats.practicedCount} of {stats.totalVocabulary} available words practiced</p><div className="progress-track"><span style={{ width: `${stats.totalVocabulary ? stats.practicedCount / stats.totalVocabulary * 100 : 0}%` }}/></div></div><div><h3>This week</h3><p>{stats.weeklyXp} XP across {stats.weekdays.filter(Boolean).length} active days</p><div className="weekdays">{weekdays.map((item, index) => <div key={index}><span className={stats.weekdays[index] ? "day done" : "day"}>{stats.weekdays[index] && <Icon name="check" size={14}/>}</span><small>{item.day}</small></div>)}</div></div></div></section>;
}

type SubmitSession = (result: { gameType: string; correctCount: number; totalCount: number; results?: Array<{ id: number; correct: boolean; confidence?: "again" | "hard" | "good" }> }) => void;

function PracticePanel({ type, dashboard, submit, speak }: { type: string; dashboard: DashboardData; submit: SubmitSession; speak: (text?: string, rate?: number) => void }) {
	if (type === "sentence") return dashboard.sentence ? <SentencePanel exercise={dashboard.sentence} submit={submit}/> : <EmptyPractice/>;
	if (type === "listen") return dashboard.listening ? <ListeningPanel exercise={dashboard.listening} submit={submit} speak={speak}/> : <EmptyPractice/>;
	if (type === "review") return dashboard.review.length ? <ReviewPanel item={dashboard.review[0]} choices={dashboard.vocabulary} submit={submit}/> : <EmptyPractice review/>;
	return dashboard.vocabulary.length ? <MatchingPanel items={dashboard.vocabulary} submit={submit}/> : <EmptyPractice/>;
}

function EmptyPractice({ review = false }: { review?: boolean }) {
	return <div className="empty-practice"><span className="activity-icon mint"><Icon name={review ? "check" : "book"}/></span><h2 id="modal-title">{review ? "Review queue cleared!" : "Practice is loading"}</h2><p>{review ? "You have reviewed everything due today. Try vocabulary matching next." : "No exercises are available for this level yet."}</p></div>;
}

function MatchingPanel({ items, submit }: { items: VocabularyItem[]; submit: SubmitSession }) {
	const [left, setLeft] = useState<number | null>(null);
	const [matched, setMatched] = useState<number[]>([]);
	const [mistakes, setMistakes] = useState<number[]>([]);
	const [message, setMessage] = useState("Choose a Korean word, then its meaning.");
	const meanings = [...items].sort((a, b) => ((a.id * 11) % 17) - ((b.id * 11) % 17));
	function chooseMeaning(id: number) {
		if (left === null || matched.includes(id)) return;
		if (left === id) {
			setMatched((current) => [...current, id]);
			setMessage("정답이에요! Keep the combo going.");
		} else {
			setMistakes((current) => [...new Set([...current, left, id])]);
			setMessage("Not quite. Both words will enter your review schedule.");
		}
		setLeft(null);
	}
	return <div className="practice-content"><span className="modal-kicker">VOCABULARY MATCH · 10 PAIRS</span><div className="modal-progress"><span style={{ width: `${matched.length / items.length * 100}%` }}/></div><h2 id="modal-title">Match each pair</h2><p className="match-note">{message} <strong>{matched.length}/{items.length}</strong></p><div className="matching-board"><div>{items.map((item) => <button key={item.id} disabled={matched.includes(item.id)} className={left === item.id ? "selected" : matched.includes(item.id) ? "matched" : ""} onClick={() => setLeft(item.id)}><b>{item.korean}</b><small>{item.romanization}</small></button>)}</div><div>{meanings.map((item) => <button key={item.id} disabled={matched.includes(item.id)} className={matched.includes(item.id) ? "matched" : ""} onClick={() => chooseMeaning(item.id)}>{item.meaning}</button>)}</div></div>{matched.length === items.length && <button className="check-button" onClick={() => submit({ gameType: "vocabulary", correctCount: items.length - mistakes.filter((id) => items.some((item) => item.id === id)).length, totalCount: items.length, results: items.map((item) => ({ id: item.id, correct: !mistakes.includes(item.id) })) })}>Finish round <Icon name="sparkles" size={17}/></button>}</div>;
}

function SentencePanel({ exercise, submit }: { exercise: SentenceExercise; submit: SubmitSession }) {
	const [sentence, setSentence] = useState<string[]>([]);
	const [result, setResult] = useState<"correct" | "wrong" | null>(null);
	const correct = sentence.join(" ") === exercise.answer;
	return <div className="practice-content"><span className="modal-kicker">SENTENCE BUILDER</span><div className="modal-progress"><span style={{ width: "100%" }}/></div><h2 id="modal-title">Build the sentence</h2><p className="exercise-prompt">{exercise.prompt}</p><div className="sentence-slots">{sentence.length ? sentence.map((word, index) => <button key={`${word}-${index}`} onClick={() => !result && setSentence(sentence.filter((_, position) => position !== index))}>{word}</button>) : <span>Tap words in the correct order</span>}</div><div className="word-choices">{exercise.tokens.map((word) => <button key={word} disabled={sentence.includes(word) || Boolean(result)} onClick={() => setSentence([...sentence, word])}>{word}</button>)}</div>{result ? <div className={result === "correct" ? "success-feedback" : "success-feedback gentle-error"}><span><Icon name={result === "correct" ? "check" : "heart"} size={24}/></span><div><strong>{result === "correct" ? "정답이에요!" : "Almost there"}</strong><p><b>{exercise.answer}</b><br/>{exercise.grammarNote}</p></div><button onClick={() => submit({ gameType: "sentence", correctCount: correct ? 1 : 0, totalCount: 1 })}>Save result</button></div> : <button className="check-button" disabled={sentence.length !== exercise.tokens.length} onClick={() => setResult(correct ? "correct" : "wrong")}>Check answer</button>}</div>;
}

function normalizeKorean(value: string) {
	return value.normalize("NFC").replace(/[\s.,!?]/g, "");
}

function ListeningPanel({ exercise, submit, speak }: { exercise: ListeningExercise; submit: SubmitSession; speak: (text?: string, rate?: number) => void }) {
	const [answer, setAnswer] = useState("");
	const [speed, setSpeed] = useState(1);
	const [showHelp, setShowHelp] = useState(false);
	const [result, setResult] = useState<"correct" | "wrong" | null>(null);
	const correct = normalizeKorean(answer) === normalizeKorean(exercise.answer);
	return <div className="practice-content"><span className="modal-kicker">LISTENING · {exercise.mode === "dictation" ? "DICTATION" : "FILL IN THE BLANK"}</span><div className="modal-progress"><span style={{ width: "100%" }}/></div><h2 id="modal-title">Listen and type</h2><button className="listen-button" onClick={() => speak(exercise.audioText, speed)}><Icon name="play" size={24}/><span>Play Korean</span></button><div className="speed-row">{[0.75, 1, 1.25].map((value) => <button className={speed === value ? "active" : ""} key={value} onClick={() => setSpeed(value)}>{value}x</button>)}</div><p className="exercise-prompt">{exercise.prompt}</p><textarea className="listen-input" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="한글로 입력하세요" disabled={Boolean(result)}/>{!result && <button className="hint-button" onClick={() => setShowHelp(true)}>Show translation hint</button>}{showHelp && <p className="translation-hint">{exercise.translation}</p>}{result ? <div className={result === "correct" ? "success-feedback" : "success-feedback gentle-error"}><span><Icon name={result === "correct" ? "check" : "heart"} size={24}/></span><div><strong>{result === "correct" ? "잘 들었어요!" : "Listen once more next time"}</strong><p><b>{exercise.audioText}</b><br/>{exercise.note}</p></div><button onClick={() => submit({ gameType: "listening", correctCount: correct ? 1 : 0, totalCount: 1 })}>Save result</button></div> : <button className="check-button" disabled={!answer.trim()} onClick={() => setResult(correct ? "correct" : "wrong")}>Check answer</button>}</div>;
}

function ReviewPanel({ item, choices, submit }: { item: VocabularyItem; choices: VocabularyItem[]; submit: SubmitSession }) {
	const [selected, setSelected] = useState<number | null>(null);
	const options = [item, ...choices.filter((choice) => choice.id !== item.id).slice(0, 3)].sort((a, b) => ((a.id * 7) % 13) - ((b.id * 7) % 13));
	const correct = selected === item.id;
	return <div className="practice-content"><span className="modal-kicker">MEMORY REVIEW · {item.memoryState?.replace("_", " ").toUpperCase()}</span><div className="modal-progress"><span style={{ width: "100%" }}/></div><h2 id="modal-title">What does this word mean?</h2><p className="korean-prompt">{item.korean}</p><p className="romanization">{item.romanization}</p><div className="answer-choices">{options.map((option, index) => <button key={option.id} className={selected === option.id ? "selected" : ""} disabled={selected !== null} onClick={() => setSelected(option.id)}><span>{index + 1}</span>{option.meaning}</button>)}</div>{selected !== null && <div className={correct ? "success-feedback confidence-feedback" : "success-feedback gentle-error confidence-feedback"}><span><Icon name={correct ? "check" : "heart"} size={24}/></span><div><strong>{correct ? "Great recall!" : `${item.korean} means “${item.meaning}”.`}</strong><p>{item.exampleKo}<br/>{item.example}</p><div className="confidence-row"><button onClick={() => submit({ gameType: "review", correctCount: correct ? 1 : 0, totalCount: 1, results: [{ id: item.id, correct, confidence: "again" }] })}>Again · 1d</button><button onClick={() => submit({ gameType: "review", correctCount: correct ? 1 : 0, totalCount: 1, results: [{ id: item.id, correct, confidence: "hard" }] })}>Hard</button><button onClick={() => submit({ gameType: "review", correctCount: correct ? 1 : 0, totalCount: 1, results: [{ id: item.id, correct, confidence: "good" }] })}>Good</button></div></div></div>}</div>;
}

function InterviewPanel({ scenarios, recording, setRecording, speak, done }: { scenarios: InterviewScenario[]; recording: boolean; setRecording: (v: boolean) => void; speak: (text?: string, rate?: number) => void; done: () => void }) {
	const [stage, setStage] = useState<"ready" | "answer" | "feedback">("ready");
	const [scenarioId, setScenarioId] = useState(scenarios.at(-1)?.id ?? 0);
	const [answer, setAnswer] = useState("");
	const [micNote, setMicNote] = useState("");
	const [audioUrl, setAudioUrl] = useState("");
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [duration, setDuration] = useState(0);
	const [speed, setSpeed] = useState(1);
	const streamRef = useRef<MediaStream | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const startedAtRef = useRef(0);
	const idempotencyKey = useRef(crypto.randomUUID());
	const transcriptFetcher = useFetcher<{ ok: boolean; transcript?: { text: string; duration: number }; error?: string }>();
	const feedbackFetcher = useFetcher<{ ok: boolean; feedback?: InterviewFeedback; error?: string }>();
	const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
	const feedback = feedbackFetcher.data?.feedback;

	useEffect(() => () => {
		streamRef.current?.getTracks().forEach((track) => track.stop());
		if (audioUrl) URL.revokeObjectURL(audioUrl);
	}, [audioUrl]);
	useEffect(() => {
		if (transcriptFetcher.data?.transcript) {
			setAnswer(transcriptFetcher.data.transcript.text);
			setDuration(transcriptFetcher.data.transcript.duration || duration);
			setMicNote("Korean transcript ready. Edit it before asking for feedback.");
		} else if (transcriptFetcher.data?.error) setMicNote(transcriptFetcher.data.error);
	}, [transcriptFetcher.data]);
	useEffect(() => {
		if (feedbackFetcher.data?.feedback) setStage("feedback");
	}, [feedbackFetcher.data]);

	if (!scenario) return <EmptyPractice/>;

	async function startVoice() {
		setStage("answer");
		if (!navigator.mediaDevices?.getUserMedia) { setMicNote("Microphone unavailable. Type your answer below."); return; }
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			chunksRef.current = [];
			const recorder = new MediaRecorder(stream);
			recorderRef.current = recorder;
			recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
			recorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
				if (audioUrl) URL.revokeObjectURL(audioUrl);
				setAudioBlob(blob);
				setAudioUrl(URL.createObjectURL(blob));
				setDuration(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
				setMicNote("Recording preserved in this browser. Play it back or transcribe it.");
			};
			startedAtRef.current = Date.now();
			recorder.start(250);
			setRecording(true);
			setMicNote("Recording in your browser");
		} catch { setMicNote("Microphone permission was not granted. Typing still works."); }
	}

	function stopVoice() {
		if (recorderRef.current?.state === "recording") recorderRef.current.stop();
		streamRef.current?.getTracks().forEach((track) => track.stop());
		setRecording(false);
	}

	function transcribe() {
		if (!audioBlob) return;
		const form = new FormData();
		form.set("intent", "transcribe");
		form.set("audio", new File([audioBlob], "answer.webm", { type: audioBlob.type }));
		transcriptFetcher.submit(form, { method: "post", encType: "multipart/form-data" });
	}

	function requestFeedback() {
		feedbackFetcher.submit({ intent: "interview-feedback", scenarioId: String(scenario.id), answer, answerMode: audioBlob ? "voice" : "typed", duration: String(duration), idempotencyKey: idempotencyKey.current }, { method: "post" });
	}

	return <div className="interview-content"><span className="modal-kicker">AI INTERVIEW · LEVEL {scenario.level}</span><h2 id="modal-title">{scenario.title}</h2><p className="interview-subtitle">{scenario.titleKo} · friendly, low-pressure coaching</p>
		{stage === "ready" && <div className="scenario-picker">{scenarios.map((item) => <button className={item.id === scenario.id ? "active" : ""} key={item.id} onClick={() => setScenarioId(item.id)}><small>LEVEL {item.level}</small><strong>{item.title}</strong><span>{item.titleKo}</span></button>)}</div>}
		<div className="interviewer"><span className="ai-face">ㅎ<i/></span><div><small>HANA · AI COACH</small><p>“{scenario.questionKo}”</p><span>{scenario.question}</span></div><button onClick={() => speak(scenario.questionKo, speed)} aria-label="Play question"><Icon name="play" size={18}/></button></div><div className="speed-row interview-speed">{[0.75, 1, 1.25].map((value) => <button className={speed === value ? "active" : ""} key={value} onClick={() => setSpeed(value)}>{value}x</button>)}</div>
		{stage === "ready" && <div className="interview-actions"><p>{scenario.guidance}</p><button className="record-button" onClick={startVoice}><Icon name="mic" size={23}/> Start speaking</button><button className="type-answer" onClick={() => setStage("answer")}>Type my answer instead</button></div>}
		{stage === "answer" && <div className="recording-panel"><div className={recording ? "recording-icon active" : "recording-icon"}><Icon name="mic" size={28}/></div><strong>{recording ? "듣고 있어요..." : "Your answer"}</strong>{micNote && <p className="mic-note">{micNote}</p>}<div className="waveform">{[1,2,3,4,5,6,7,8,9,10,11,12].map((number) => <i key={number} style={{ height: `${10 + (number % 5) * 7}px` }}/>)}</div>{recording && <button className="stop-recording" onClick={stopVoice}>Stop recording</button>}{audioUrl && <div className="audio-review"><audio src={audioUrl} controls/><button onClick={transcribe} disabled={transcriptFetcher.state !== "idle"}>{transcriptFetcher.state === "idle" ? "Transcribe Korean" : "Transcribing..."}</button></div>}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="한국어로 대답해 보세요..." aria-label="Your Korean answer"/><button className="check-button" disabled={!answer.trim() || feedbackFetcher.state !== "idle" || recording} onClick={requestFeedback}>{feedbackFetcher.state === "idle" ? <>Get AI feedback <Icon name="sparkles" size={17}/></> : "Hana is reviewing your answer..."}</button>{feedbackFetcher.data?.error && <div className="ai-error" role="alert">{feedbackFetcher.data.error}</div>}</div>}
		{stage === "feedback" && feedback && <div className="feedback-panel structured-feedback"><div className="score-ring"><strong>{feedback.overallScore}</strong><small>Overall</small></div><div className="feedback-copy"><strong>Your personal feedback</strong><p><b>Correction:</b> {feedback.correctedAnswer}</p><p><b>Natural answer:</b> {feedback.naturalAnswer}</p><div><span>Grammar <b>{feedback.grammarScore}</b></span><span>Content <b>{feedback.contentScore}</b></span><span>Fluency <b>{feedback.fluencyScore}</b></span></div>{feedback.mistakes.length > 0 && <p><b>Notice:</b> {feedback.mistakes.join(" · ")}</p>}{feedback.recommendedWords.length > 0 && <p><b>Try these:</b> {feedback.recommendedWords.join(", ")}</p>}<p><b>Next:</b> {feedback.nextPractice}</p></div><button className="check-button" onClick={done}>Finish practice · +35 XP</button></div>}
	</div>;
}
