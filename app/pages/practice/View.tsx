import { Link, useLoaderData } from "react-router";
import type { Route } from "../../routes/+types/practice";
import Icon from "../home/components/Icon";
import { practiceModes } from "./helpers";

export default function PracticeHome() {
	const { summary } = useLoaderData<Route.ComponentProps["loaderData"]>();
	return (
		<main className="practice-page">
			<header className="practice-page-header">
				<Link className="brand" to="/">
					<span className="brand-mark">
						<span>ㅎ</span>
					</span>
					<span className="brand-name">Hangeuloo</span>
				</Link>
				<Link className="practice-exit" to="/lessons">
					Lessons <Icon name="arrow" size={15} />
				</Link>
			</header>
			<div className="practice-page-content">
				<section className="practice-hero">
					<div>
						<span className="section-kicker">PRACTICE STUDIO</span>
						<h1>Small practice, lasting Korean.</h1>
						<p>Choose a focused activity and keep your recall growing.</p>
						<Link className="practice-start" to="/practice/vocabulary">
							<span>
								<Icon name="play" size={17} />
							</span>
							Start random practice <Icon name="arrow" size={17} />
						</Link>
					</div>
					<div className="practice-hero-orb" aria-hidden="true">
						<Icon name="game" size={50} />
					</div>
				</section>
				<section className="practice-stats">
					{[
						[`Level ${summary.level}`, "Current level"],
						[summary.totalVocabulary, "Available words"],
						[summary.practicedToday, "Practiced today"],
						[summary.dueCount, "Due reviews"],
						[summary.streak, "Day streak"],
					].map(([value, label]) => (
						<article key={label}>
							<strong>{value}</strong>
							<small>{label}</small>
						</article>
					))}
				</section>
				<div className="practice-section-heading">
					<div>
						<span className="section-kicker">PRACTICE MODES</span>
						<h2>What would you like to train?</h2>
					</div>
					<span>{summary.totalVocabulary} words ready</span>
				</div>
				<div className="practice-mode-grid">
					{practiceModes.map((practiceMode) => (
						<Link
							className="practice-mode-card"
							to={`/practice/vocabulary/${practiceMode.id}`}
							key={practiceMode.id}
						>
							<span className={`activity-icon ${practiceMode.color}`}>
								<Icon name={practiceMode.icon} size={24} />
							</span>
							<strong>{practiceMode.title}</strong>
							<p>{practiceMode.description}</p>
							<span className="practice-mode-link">
								Practice now <Icon name="arrow" size={15} />
							</span>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
