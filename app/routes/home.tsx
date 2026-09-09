import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

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

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Hangeuloo — Learn Korean, one happy step at a time" },
		{ name: "description", content: "Cheerful Korean practice with bite-sized lessons and AI interview coaching." },
	];
}

export default function Home() {
	const [active, setActive] = useState("home");
	const [modal, setModal] = useState<string | null>(null);
	const [recording, setRecording] = useState(false);
	const [toast, setToast] = useState("");
	const [xp, setXp] = useState(840);

	useEffect(() => {
		if (!toast) return;
		const timer = setTimeout(() => setToast(""), 2400);
		return () => clearTimeout(timer);
	}, [toast]);

	function speak(text = "오늘 무엇을 했어요?") {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			window.speechSynthesis.cancel();
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = "ko-KR";
			utterance.rate = 0.82;
			window.speechSynthesis.speak(utterance);
			setToast("Playing Korean audio");
		} else setToast("Audio isn't available in this browser");
	}

	function rewardPractice() {
		setXp((value) => value + 20);
		setToast("정답이에요! +20 XP");
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
					<div className="mini-streak"><span className="mini-fire"><Icon name="flame" size={18}/></span><span><strong>7 day streak!</strong><small>Keep it going!</small></span></div>
					<button className="profile-row"><span className="avatar">AM<span className="online-dot"/></span><span><strong>Alex Morgan</strong><small>Level 2 Learner</small></span><Icon name="arrow" size={16}/></button>
				</div>
			</aside>

			<main className="main" id="top">
				<header className="mobile-header"><a className="brand compact" href="#top"><span className="brand-mark"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a><button className="mobile-avatar">AM</button></header>
				<div className="page-wrap">
					<section className="welcome-row fade-in">
						<div><p className="eyebrow">FRIDAY, MAY 24</p><h1>안녕하세요, Alex! <span className="wave">👋</span></h1><p>Ready for another happy step in Korean?</p></div>
						<div className="top-stats"><div><span className="stat-icon fire"><Icon name="flame" size={19}/></span><span><strong>7</strong><small>day streak</small></span></div><i/><div><span className="stat-icon energy"><Icon name="bolt" size={19}/></span><span><strong>{xp}</strong><small>total XP</small></span></div><button className="heart-button" aria-label="Five hearts"><Icon name="heart" size={19}/><strong>5</strong></button></div>
					</section>

					<section className="hero-card fade-in delay-1">
						<div className="hero-content"><span className="today-pill"><Icon name="sparkles" size={15}/> TODAY'S MISSION</span><h2>Every word brings you closer.</h2><p>Complete your daily practice and keep your streak shining!</p><div className="mission-progress"><div className="progress-label"><span>Daily goal</span><strong>2 of 4 activities</strong></div><div className="progress-track"><span style={{ width: "50%" }}/></div></div><button className="primary-cta" onClick={() => openActivity("vocab")}><span className="play-circle"><Icon name="play" size={17}/></span>Start today's practice<Icon name="arrow" size={18}/></button></div>
						<div className="hero-visual" aria-hidden="true"><div className="sparkle s1">✦</div><div className="sparkle s2">✦</div><div className="mascot-shadow"/><div className="mascot"><div className="ear left"/><div className="ear right"/><div className="face"><span className="eye left"/><span className="eye right"/><span className="blush left"/><span className="blush right"/><span className="mouth">ω</span></div><div className="hanbok"><span>한</span></div><div className="arm left"/><div className="arm right"/></div><div className="speech-bubble">화이팅!<small>You got this!</small></div></div>
					</section>

					<section className="section-block fade-in delay-2">
						<div className="section-heading"><div><h2>Today's practice</h2><p>Small steps, big progress!</p></div><button onClick={() => setActive("practice")}>View all <Icon name="arrow" size={15}/></button></div>
						<div className="activity-grid">
							{activities.map((item) => <button key={item.id} className="activity-card" onClick={() => openActivity(item.id)}><span className={`activity-icon ${item.color}`}><Icon name={item.icon} size={25}/></span><span className="activity-text"><strong>{item.title}</strong><small>{item.copy}</small><span><Icon name="clock" size={13}/>{item.meta}</span></span><span className="card-reward">{item.xp}</span><span className="go-arrow"><Icon name="arrow" size={17}/></span></button>)}
						</div>
					</section>

					<div className="lower-grid fade-in delay-3">
						<section className="continue-card">
							<div className="continue-top"><div><span className="section-kicker">CONTINUE LEARNING</span><h2>Level 2 · Daily Korean</h2><p>Talking about your daily routine</p></div><span className="level-orb"><span>2</span><small>LEVEL</small></span></div>
							<div className="lesson-progress"><div className="circle-progress"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16"/><circle className="fill" cx="21" cy="21" r="16"/></svg><span>65%</span></div><div><strong>Lesson 8 of 12</strong><small>Past tense: -았어요 / -었어요</small></div><button onClick={() => openActivity("sentence")}><Icon name="play" size={15}/> Continue</button></div>
						</section>
						<section className="week-card"><div className="week-top"><div><h2>This week</h2><p>4 of 5 day goal</p></div><div className="week-xp"><Icon name="bolt" size={15}/><strong>180</strong> XP</div></div><div className="weekdays">{weekdays.map((item, i) => <div key={i}><span className={item.done ? "day done" : item.today ? "day today" : "day"}>{item.done ? <Icon name="check" size={14}/> : item.today ? <span/> : ""}</span><small>{item.day}</small></div>)}</div><div className="weekly-note"><Icon name="star" size={17}/><span><strong>One more day!</strong> You're so close to your weekly goal.</span></div></section>
					</div>

					<section className="interview-banner fade-in delay-3">
						<span className="ai-orb"><Icon name="mic" size={28}/><i/></span><div><span className="section-kicker">AI INTERVIEW PRACTICE</span><h2>Build confidence, one answer at a time.</h2><p>Practice real Korean conversations with friendly, actionable feedback.</p></div><button onClick={() => setModal("interview")}>Try AI interview <Icon name="arrow" size={17}/></button><span className="banner-hangul" aria-hidden="true">말</span>
					</section>
				</div>
			</main>

			<nav className="mobile-nav" aria-label="Mobile navigation">{nav.slice(0,5).map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); if (item.id === "interview") setModal("interview"); }}><Icon name={item.icon}/><span>{item.id === "interview" ? "Interview" : item.label}</span></button>)}</nav>

			{modal && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }} onKeyDown={(e) => { if (e.key === "Escape") closeModal(); }}>
				<div className="practice-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
					<button className="modal-close" onClick={closeModal} aria-label="Close"><Icon name="close"/></button>
					{modal === "interview" ? <InterviewPanel recording={recording} setRecording={setRecording} speak={speak} done={() => { setXp(v => v + 35); setToast("Interview saved · +35 XP"); closeModal(); }}/> : <PracticePanel type={modal} reward={rewardPractice} speak={speak} close={closeModal}/>}
				</div>
			</div>}
			{toast && <div className="toast"><Icon name="sparkles" size={18}/>{toast}</div>}
		</div>
	);
}

function PracticePanel({ type, reward, speak, close }: { type: string; reward: () => void; speak: (text?: string) => void; close: () => void }) {
	const [selected, setSelected] = useState<number | null>(null);
	const [sentence, setSentence] = useState<string[]>([]);
	const [result, setResult] = useState<"correct" | "wrong" | null>(null);
	const isSentence = type === "sentence";
	const content = type === "listen"
		? { label: "LISTENING PRACTICE", title: "What did you hear?", prompt: "Tap play, then choose the right meaning.", choices: ["I am a student", "I went to school", "I like coffee", "I am at home"], answer: 1 }
		: { label: type === "review" ? "MEMORY REVIEW" : "VOCABULARY MATCH", title: "What does this word mean?", prompt: "학교", choices: ["School", "Friend", "Food", "Tomorrow"], answer: 0 };
	const tokens = ["학교에", "어제", "갔어요", "저는"];
	const expected = ["저는", "어제", "학교에", "갔어요"];
	const check = () => {
		const correct = isSentence ? sentence.join(" ") === expected.join(" ") : selected === content.answer;
		setResult(correct ? "correct" : "wrong");
		if (correct) reward();
	};
	return <div className="practice-content">
		<span className="modal-kicker">{isSentence ? "SENTENCE BUILDER" : content.label}</span><div className="modal-progress"><span style={{width:"20%"}}/></div>
		<h2 id="modal-title">{isSentence ? "Build the sentence" : content.title}</h2>
		{type === "listen" && <button className="listen-button" onClick={() => speak("저는 학교에 갔어요")}><Icon name="play" size={24}/><span>0:03</span></button>}
		<p className={type === "vocab" || type === "review" ? "korean-prompt" : "exercise-prompt"}>{isSentence ? "I went to school yesterday." : content.prompt}</p>
		{isSentence && <div className="sentence-slots">{sentence.length ? sentence.map((word, i) => <button key={`${word}-${i}`} onClick={() => !result && setSentence(sentence.filter((_, n) => n !== i))}>{word}</button>) : <span>Tap words in the correct order</span>}</div>}
		<div className={isSentence ? "word-choices" : "answer-choices"}>{(isSentence ? tokens : content.choices).map((choice, index) => <button key={choice} disabled={isSentence && sentence.includes(choice)} className={`${!isSentence && selected === index ? "selected" : ""} ${result === "correct" && ((!isSentence && index === content.answer) || isSentence) ? "correct" : ""}`} onClick={() => { if (result) return; if (isSentence) setSentence([...sentence, choice]); else setSelected(index); }}><span>{index + 1}</span>{choice}{result === "correct" && !isSentence && index === content.answer && <Icon name="check" size={18}/>}</button>)}</div>
		{result ? <div className={result === "correct" ? "success-feedback" : "success-feedback gentle-error"}><span><Icon name={result === "correct" ? "check" : "heart"} size={24}/></span><div><strong>{result === "correct" ? "정답이에요! Correct!" : "Almost there!"}</strong><p>{result === "correct" ? (isSentence ? "Great word order! -었어요 marks the past tense." : type === "listen" ? "You caught the key words 학교에 갔어요." : "학교 means “school”. Great recall!") : (isSentence ? "Korean time words usually come before the place: 저는 어제 학교에 갔어요." : `The best answer is “${content.choices[content.answer]}”. Mistakes help your memory grow!`)}</p></div><button onClick={result === "correct" ? close : () => { setResult(null); setSelected(null); setSentence([]); }}>{result === "correct" ? "Continue" : "Try again"}</button></div> : <button className="check-button" disabled={isSentence ? sentence.length !== tokens.length : selected === null} onClick={check}>Check answer</button>}
	</div>;
}

function InterviewPanel({ recording, setRecording, speak, done }: { recording: boolean; setRecording: (v: boolean) => void; speak: (text?: string) => void; done: () => void }) {
	const [stage, setStage] = useState<"ready" | "answer" | "feedback">("ready");
	const [answer, setAnswer] = useState("");
	const [micNote, setMicNote] = useState("");
	const streamRef = useRef<MediaStream | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), []);
	const startVoice = async () => {
		setStage("answer");
		if (!navigator.mediaDevices?.getUserMedia) { setMicNote("Microphone unavailable — type your answer below."); return; }
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;
			recorderRef.current = new MediaRecorder(stream);
			recorderRef.current.start();
			setRecording(true);
			setMicNote("Recording safely in your browser");
		} catch { setMicNote("Microphone permission was not granted — typing still works."); }
	};
	const stopVoice = () => {
		if (recorderRef.current?.state === "recording") recorderRef.current.stop();
		streamRef.current?.getTracks().forEach(track => track.stop());
		setRecording(false);
	};
	const feedback = () => { stopVoice(); if (!answer.trim()) setAnswer("어제 친구하고 카페에 갔어요. 그리고 한국어를 공부했어요."); setStage("feedback"); };
	return <div className="interview-content"><span className="modal-kicker">AI INTERVIEW · LEVEL 2</span><h2 id="modal-title">Daily conversation</h2><p className="interview-subtitle">A friendly, low-pressure practice round</p><div className="interviewer"><span className="ai-face">ㅎ<i/></span><div><small>HANA · AI COACH</small><p>“오늘 무엇을 했어요?”</p><span>What did you do today?</span></div><button onClick={() => speak()} aria-label="Play question"><Icon name="play" size={18}/></button></div>{stage === "ready" && <div className="interview-actions"><p>Listen to the question, then answer in 2–3 Korean sentences.</p><button className="record-button" onClick={startVoice}><Icon name="mic" size={23}/> Start speaking</button><button className="type-answer" onClick={() => setStage("answer")}>Type my answer instead</button></div>}{stage === "answer" && <div className="recording-panel"><div className={recording ? "recording-icon active" : "recording-icon"}><Icon name="mic" size={28}/></div><strong>{recording ? "듣고 있어요..." : "Your answer"}</strong>{micNote && <p className="mic-note">{micNote}</p>}<div className="waveform">{[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <i key={n} style={{height: `${10 + (n%5)*7}px`}}/>)}</div><textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="한국어로 대답해 보세요..." aria-label="Your Korean answer"/><button className="check-button" onClick={feedback}>Get feedback <Icon name="sparkles" size={17}/></button></div>}{stage === "feedback" && <div className="feedback-panel"><div className="score-ring"><strong>86</strong><small>Great!</small></div><div className="feedback-copy"><strong>Clear and natural answer!</strong><p>Your past tense is correct. Try adding <b>재미있었어요</b> to share how it felt.</p><div><span>Grammar <b>88</b></span><span>Content <b>85</b></span><span>Fluency <b>84</b></span></div></div><button className="check-button" onClick={done}>Finish practice · +35 XP</button></div>}</div>;
}
