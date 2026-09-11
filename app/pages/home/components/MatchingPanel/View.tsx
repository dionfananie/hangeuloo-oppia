import Icon from "../Icon";
import type { VocabularyItem } from "~/lib/learning.server";
import type { SubmitSession } from "../../types";
import useMatchingPanel from "./hook";

function MatchingPanel({ items, submit }: { items: VocabularyItem[]; submit: SubmitSession }) {
	const { left, setLeft, matched, mistakes, message, meanings, chooseMeaning } = useMatchingPanel(items);
	return (
		<div className="practice-content">
			<span className="modal-kicker">VOCABULARY MATCH · 10 PAIRS</span>
			<div className="modal-progress">
				<span style={{ width: `${(matched.length / items.length) * 100}%` }} />
			</div>
			<h2 id="modal-title">Match each pair</h2>
			<p className="match-note">
				{message}{" "}
				<strong>
					{matched.length}/{items.length}
				</strong>
			</p>
			<div className="matching-board">
				<div>
					{items.map((item) => (
						<button
							key={item.id}
							disabled={matched.includes(item.id)}
							className={left === item.id ? "selected" : matched.includes(item.id) ? "matched" : ""}
							onClick={() => setLeft(item.id)}
						>
							<b>{item.korean}</b>
							<small>{item.romanization}</small>
						</button>
					))}
				</div>
				<div>
					{meanings.map((item) => (
						<button
							key={item.id}
							disabled={matched.includes(item.id)}
							className={matched.includes(item.id) ? "matched" : ""}
							onClick={() => chooseMeaning(item.id)}
						>
							{item.meaning}
						</button>
					))}
				</div>
			</div>
			{matched.length === items.length && (
				<button
					className="check-button"
					onClick={() =>
						submit({
							gameType: "vocabulary",
							correctCount:
								items.length - mistakes.filter((id) => items.some((item) => item.id === id)).length,
							totalCount: items.length,
							results: items.map((item) => ({ id: item.id, correct: !mistakes.includes(item.id) })),
						})
					}
				>
					Finish round <Icon name="sparkles" size={17} />
				</button>
			)}
		</div>
	);
}

export default MatchingPanel;
