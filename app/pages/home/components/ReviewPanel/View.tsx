import Icon from "../Icon";
import type { VocabularyItem } from "~/lib/learning.server";
import type { SubmitSession } from "../../types";
import useReviewPanel from "./hook";

function ReviewPanel({
	item,
	choices,
	submit,
}: {
	item: VocabularyItem;
	choices: VocabularyItem[];
	submit: SubmitSession;
}) {
	const { selected, setSelected, options, correct } = useReviewPanel(item, choices);
	return (
		<div className="practice-content">
			<span className="modal-kicker">
				MEMORY REVIEW · {item.memoryState?.replace("_", " ").toUpperCase()}
			</span>
			<div className="modal-progress">
				<span style={{ width: "100%" }} />
			</div>
			<h2 id="modal-title">What does this word mean?</h2>
			<p className="korean-prompt">{item.korean}</p>
			<p className="romanization">{item.romanization}</p>
			<div className="answer-choices">
				{options.map((option, index) => (
					<button
						key={option.id}
						className={selected === option.id ? "selected" : ""}
						disabled={selected !== null}
						onClick={() => setSelected(option.id)}
					>
						<span>{index + 1}</span>
						{option.meaning}
					</button>
				))}
			</div>
			{selected !== null && (
				<div
					className={
						correct
							? "success-feedback confidence-feedback"
							: "success-feedback gentle-error confidence-feedback"
					}
				>
					<span>
						<Icon name={correct ? "check" : "heart"} size={24} />
					</span>
					<div>
						<strong>{correct ? "Great recall!" : `${item.korean} means “${item.meaning}”.`}</strong>
						<p>
							{item.exampleKo}
							<br />
							{item.example}
						</p>
						<div className="confidence-row">
							<button
								onClick={() =>
									submit({
										gameType: "review",
										correctCount: correct ? 1 : 0,
										totalCount: 1,
										results: [{ id: item.id, correct, confidence: "again" }],
									})
								}
							>
								Again · 1d
							</button>
							<button
								onClick={() =>
									submit({
										gameType: "review",
										correctCount: correct ? 1 : 0,
										totalCount: 1,
										results: [{ id: item.id, correct, confidence: "hard" }],
									})
								}
							>
								Hard
							</button>
							<button
								onClick={() =>
									submit({
										gameType: "review",
										correctCount: correct ? 1 : 0,
										totalCount: 1,
										results: [{ id: item.id, correct, confidence: "good" }],
									})
								}
							>
								Good
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default ReviewPanel;
