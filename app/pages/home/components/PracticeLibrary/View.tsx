import type { DashboardData } from "~/lib/learning.server";
import Icon from "../Icon";
import { activities } from "../../helpers";
import { Link } from "react-router";

function PracticeLibrary({
	dashboard,
	openActivity,
	practiceUnlocks,
}: {
	dashboard: DashboardData;
	openActivity: (id: string) => void;
	practiceUnlocks: string[];
}) {
	const typeById: Record<string, string> = {
		vocab: "vocabulary",
		listen: "listening",
		sentence: "sentence",
		review: "review",
	};
	return (
		<section className="catalog-view fade-in">
			<div className="view-title">
				<span className="section-kicker">PRACTICE LIBRARY</span>
				<h2>Choose today’s focus</h2>
				<p>Complete a related lesson to unlock each practice track.</p>
			</div>
			<div className="practice-library">
				{activities.map((item) => {
					const unlocked = practiceUnlocks.includes(typeById[item.id]);
					const route =
						item.id === "vocab"
							? "/practice/vocabulary"
							: `/practice/${item.id === "listen" ? "listening" : item.id}`;
					return unlocked ? (
						<Link key={item.id} className="library-card" to={route}>
							<span className={`activity-icon ${item.color}`}>
								<Icon name={item.icon} size={25} />
							</span>
							<div>
								<strong>{item.title}</strong>
								<p>{item.copy}</p>
								<small>
									{item.id === "review" ? `${dashboard.stats.dueCount} words ready now` : item.meta}
								</small>
							</div>
							<Icon name="arrow" />
						</Link>
					) : (
						<button
							key={item.id}
							className="library-card practice-locked"
							onClick={() => window.location.assign("/lessons")}
						>
							<span className={`activity-icon ${item.color}`}>
								<Icon name="lock" size={25} />
							</span>
							<div>
								<strong>{item.title}</strong>
								<p>{item.copy}</p>
								<small>Complete a lesson to unlock</small>
							</div>
							<Icon name="lock" />
						</button>
					);
				})}
			</div>
		</section>
	);
}

export default PracticeLibrary;
