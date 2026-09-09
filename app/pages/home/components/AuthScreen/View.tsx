import Icon from "../Icon";
import useAuthScreen from "./hook";

const authErrors: Record<string, string> = {
	"not-configured": "Google sign-in is not configured yet.",
	cancelled: "Google sign-in was cancelled. You can try again anytime.",
	"invalid-state": "That sign-in request expired. Please try again.",
	"google-failed": "We couldn't complete Google sign-in. Please try again.",
};

function AuthScreen({ googleConfigured, authError }: { googleConfigured: boolean; authError: string | null }) {
	const { mode, setMode } = useAuthScreen();
	return <main className="auth-page">
		<section className="auth-story">
			<a className="brand auth-brand" href="/"><span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a>
			<div className="auth-copy"><span className="auth-pill"><Icon name="sparkles" size={15} /> YOUR KOREAN JOURNEY</span><h1>Learn Korean,<br /><em>one happy step</em><br />at a time.</h1><p>Short daily lessons, playful practice, and friendly AI interview coaching—all made to help you speak with confidence.</p><div className="auth-benefits"><span><i><Icon name="bolt" size={17} /></i>10-minute daily missions</span><span><i><Icon name="message" size={17} /></i>Real conversation practice</span><span><i><Icon name="flame" size={17} /></i>Progress that keeps you motivated</span></div></div>
			<div className="auth-mascot" aria-hidden="true"><div className="auth-bubble">같이 배워요!<small>Let's learn together!</small></div><img className="auth-mascot-image" src="/hangeuloo-icon-white-small.png" alt="" /><span className="auth-star one">✦</span><span className="auth-star two">✦</span></div>
		</section>
		<section className="auth-panel"><div className="auth-card"><div className="auth-tabs" role="tablist"><button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button><button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button></div><div className="auth-heading"><span className="auth-wave">👋</span><h2>{mode === "signup" ? "Start your happy journey!" : "Welcome back!"}</h2><p>{mode === "signup" ? "Create your free account and learn your first Korean words today." : "Continue your streak and keep making progress."}</p></div>{authError && <div className="auth-error" role="alert"><Icon name="heart" size={18} />{authErrors[authError] ?? "Something went wrong. Please try again."}</div>}<a className={`google-button ${!googleConfigured ? "disabled" : ""}`} href={googleConfigured ? "/api/auth/google?returnTo=/" : "/?authError=not-configured"}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z" /><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.55l3.35-2.62Z" /><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" /></svg>{mode === "signup" ? "Sign up with Google" : "Continue with Google"}</a><p className="auth-terms">By continuing, you agree to Hangeuloo's <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p><div className="auth-switch">{mode === "signup" ? "Already learning with us?" : "New to Hangeuloo?"} <button onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Log in" : "Create an account"}</button></div></div><p className="auth-safe"><Icon name="lock" size={14} /> Secure sign-in powered by Google</p></section>
	</main>;
}

export default AuthScreen;
