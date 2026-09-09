import type { DashboardData } from "~/lib/learning.server";
import Icon from "../Icon";
import { weekdays, levelNames } from "../../helpers";

function ProgressView({ dashboard }: { dashboard: DashboardData }) {
	const { stats, profile } = dashboard;
	const mastery = stats.totalVocabulary ? Math.round(stats.masteredCount / stats.totalVocabulary * 100) : 0;
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">LEARNING PROGRESS</span><h2>Your effort is adding up</h2><p>Progress is saved after every completed practice round.</p></div><div className="progress-cards"><article><span className="stat-icon energy"><Icon name="bolt" /></span><strong>{stats.totalXp}</strong><small>Total XP</small></article><article><span className="stat-icon fire"><Icon name="flame" /></span><strong>{stats.streak}</strong><small>Day streak</small></article><article><span className="activity-icon mint"><Icon name="brain" /></span><strong>{stats.dueCount}</strong><small>Reviews due</small></article><article><span className="activity-icon purple"><Icon name="star" /></span><strong>{mastery}%</strong><small>Vocabulary mastered</small></article></div><div className="progress-detail"><div><h3>Level {profile!.level} · {levelNames[profile!.level]}</h3><p>{stats.practicedCount} of {stats.totalVocabulary} available words practiced</p><div className="progress-track"><span style={{ width: `${stats.totalVocabulary ? stats.practicedCount / stats.totalVocabulary * 100 : 0}%` }} /></div></div><div><h3>This week</h3><p>{stats.weeklyXp} XP across {stats.weekdays.filter(Boolean).length} active days</p><div className="weekdays">{weekdays.map((item, index) => <div key={index}><span className={stats.weekdays[index] ? "day done" : "day"}>{stats.weekdays[index] && <Icon name="check" size={14} />}</span><small>{item.day}</small></div>)}</div></div></div></section>;
}

export default ProgressView;
