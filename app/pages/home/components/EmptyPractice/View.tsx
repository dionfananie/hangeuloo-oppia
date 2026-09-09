import Icon from "../Icon";

function EmptyPractice({ review = false }: { review?: boolean }) {
	return <div className="empty-practice"><span className="activity-icon mint"><Icon name={review ? "check" : "book"} /></span><h2 id="modal-title">{review ? "Review queue cleared!" : "Practice is loading"}</h2><p>{review ? "You have reviewed everything due today. Try vocabulary matching next." : "No exercises are available for this level yet."}</p></div>;
}

export default EmptyPractice;
