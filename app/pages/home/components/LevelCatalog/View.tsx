import Icon from "../Icon";
import { levelNames, levelDescriptions } from "../../helpers";

function LevelCatalog({ currentLevel }: { currentLevel: number }) {
	const future = ["Conversation Builder", "Interview Korean", "Professional Korean", "Advanced Korean"];
	return <section className="catalog-view fade-in"><div className="view-title"><span className="section-kicker">YOUR LEARNING PATH</span><h2>Seven steps to confident Korean</h2><p>Levels 0–2 are ready now. Complete four practice tracks at your pace.</p></div><div className="level-grid">
		{levelNames.map((name, level) => <article className={level === currentLevel ? "level-card current" : "level-card"} key={name}><span className="level-number">{level}</span><div><small>{level === currentLevel ? "CURRENT LEVEL" : level < currentLevel ? "AVAILABLE" : "READY TO EXPLORE"}</small><h3>{name}</h3><p>{levelDescriptions[level]}</p><div className="track-list">{["Vocabulary", "Grammar", "Listening", "Speaking"].map((track) => <span key={track}><Icon name="check" size={13} />{track}</span>)}</div></div></article>)}
		{future.map((name, index) => <article className="level-card locked" key={name}><span className="level-number"><Icon name="lock" size={20} /></span><div><small>COMING SOON · LEVEL {index + 3}</small><h3>{name}</h3><p>Preview the next milestone while you build strong foundations.</p></div></article>)}
	</div></section>;
}

export default LevelCatalog;
