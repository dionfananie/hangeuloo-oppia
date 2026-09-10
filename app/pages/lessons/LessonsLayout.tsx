import { Link } from "react-router";
import type { AuthUser } from "~/lib/auth.server";
import Icon from "~/pages/home/components/Icon";
import { getInitials } from "~/pages/home/helpers";

export default function LessonsLayout({ user, children }: { user: AuthUser; children: React.ReactNode }) {
	return <div className="lessons-app">
		<header className="lessons-header">
			<Link className="brand lessons-brand" to="/lessons" aria-label="Hangeuloo Lessons home">
				<span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span>
				<span><span className="brand-name">Hangeuloo</span><small>LESSONS</small></span>
			</Link>
			<nav aria-label="Lessons navigation">
				<Link to="/"><Icon name="home" size={17} /> Dashboard</Link>
				<Link className="lessons-nav-active" to="/lessons"><Icon name="map" size={17} /> Learning path</Link>
			</nav>
			<form method="post" action="/api/auth/logout">
				<button className="lessons-profile" type="submit" title="Sign out">
					{user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" /> : <span>{getInitials(user.name)}</span>}
					<strong>{user.name.split(" ")[0]}</strong>
			</button>
			</form>
		</header>
		<main className="lessons-main">{children}</main>
	</div>;
}
