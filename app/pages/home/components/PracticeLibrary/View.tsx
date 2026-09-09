import type { DashboardData } from "~/lib/learning.server";
import Icon from "../Icon";
import { activities } from "../../helpers";

function PracticeLibrary({ dashboard, openActivity }: { dashboard: DashboardData; openActivity: (id: string) => void }) {
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">PRACTICE LIBRARY</span><h2>Choose today’s focus</h2><p>Every completed activity updates your XP, streak, and review schedule.</p></div><div className="practice-library">{activities.map((item) => <button key={item.id} className="library-card" onClick={() => openActivity(item.id)}><span className={`activity-icon ${item.color}`}><Icon name={item.icon} size={25} /></span><div><strong>{item.title}</strong><p>{item.copy}</p><small>{item.id === "review" ? `${dashboard.stats.dueCount} words ready now` : item.meta}</small></div><Icon name="arrow" /></button>)}</div></section>;
}

export default PracticeLibrary;
