import type { DashboardData } from "~/lib/learning.server";
import Icon from "../Icon";
import { activities } from "../../helpers";

function PracticeLibrary({ dashboard, openActivity, practiceUnlocks }: { dashboard: DashboardData; openActivity: (id: string) => void; practiceUnlocks: string[] }) {
	const typeById: Record<string, string> = { vocab: "vocabulary", listen: "listening", sentence: "sentence", review: "review" };
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">PRACTICE LIBRARY</span><h2>Choose today’s focus</h2><p>Complete a related lesson to unlock each practice track.</p></div><div className="practice-library">{activities.map((item) => {
		const unlocked = practiceUnlocks.includes(typeById[item.id]);
		return <button key={item.id} className={`library-card ${unlocked ? "" : "practice-locked"}`} onClick={() => unlocked ? openActivity(item.id) : window.location.assign("/lessons")}><span className={`activity-icon ${item.color}`}><Icon name={unlocked ? item.icon : "lock"} size={25} /></span><div><strong>{item.title}</strong><p>{item.copy}</p><small>{unlocked ? (item.id === "review" ? `${dashboard.stats.dueCount} words ready now` : item.meta) : "Complete a lesson to unlock"}</small></div><Icon name={unlocked ? "arrow" : "lock"} /></button>;
	})}</div></section>;
}

export default PracticeLibrary;
