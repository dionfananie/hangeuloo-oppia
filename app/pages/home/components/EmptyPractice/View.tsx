import Icon from "../Icon";
import { getEmptyPracticeContent } from "./helpers";
import type { EmptyPracticeProps } from "./types";

function EmptyPractice({ review = false }: EmptyPracticeProps) {
	const content = getEmptyPracticeContent(review);

	return (
		<div className="empty-practice">
			<span className="activity-icon mint">
				<Icon name={content.icon} />
			</span>
			<h2 id="modal-title">{content.title}</h2>
			<p>{content.description}</p>
		</div>
	);
}

export default EmptyPractice;
