import type { DashboardData } from "~/lib/learning.server";
import type { SubmitSession, SpeakFn } from "../../types";
import SentencePanel from "../SentencePanel";
import ListeningPanel from "../ListeningPanel";
import ReviewPanel from "../ReviewPanel";
import MatchingPanel from "../MatchingPanel";
import EmptyPractice from "../EmptyPractice";

function PracticePanel({ type, dashboard, submit, speak }: { type: string; dashboard: DashboardData; submit: SubmitSession; speak: SpeakFn }) {
	if (type === "sentence") return dashboard.sentence ? <SentencePanel exercise={dashboard.sentence} submit={submit} /> : <EmptyPractice />;
	if (type === "listen") return dashboard.listening ? <ListeningPanel exercise={dashboard.listening} submit={submit} speak={speak} /> : <EmptyPractice />;
	if (type === "review") return dashboard.review.length ? <ReviewPanel item={dashboard.review[0]} choices={dashboard.vocabulary} submit={submit} /> : <EmptyPractice review />;
	return dashboard.vocabulary.length ? <MatchingPanel items={dashboard.vocabulary} submit={submit} /> : <EmptyPractice />;
}

export default PracticePanel;
