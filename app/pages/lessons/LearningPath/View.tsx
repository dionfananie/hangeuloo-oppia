import { Link } from "react-router";
import type { NextActivity, PathNodeView, NodeStatus } from "~/lib/learning-path.server";
import { nodeHref } from "~/lib/learning-path-graph";
import Icon from "~/pages/home/components/Icon";
import LessonsLayout from "../LessonsLayout";
import useLearningPath from "./hook";
import "./styles.css";

function nodeKindLabel(node: PathNodeView, isId: boolean): string {
	switch (node.type) {
		case "check":
			return isId ? "Cek" : "Check";
		case "practice":
			return isId ? "Latihan" : "Practice";
		case "branch_choice":
			return isId ? "Pilih jalur" : "Choose path";
		case "remediation":
			return isId ? "Ulasan" : "Review";
		default:
			return isId ? "Lesson" : "Lesson";
	}
}

function statusLabel(status: NodeStatus, isId: boolean): string {
	switch (status) {
		case "completed":
		case "passed":
		case "selected":
			return isId ? "Selesai" : "Done";
		case "in_progress":
			return isId ? "Berlangsung" : "In progress";
		case "failed":
			return isId ? "Coba lagi" : "Retry";
		case "available":
			return isId ? "Siap" : "Ready";
		default:
			return isId ? "Terkunci" : "Locked";
	}
}

function iconFor(status: NodeStatus): "check" | "lock" | "play" | "book" | "refresh" {
	if (status === "completed" || status === "passed" || status === "selected") return "check";
	if (status === "locked") return "lock";
	if (status === "failed") return "refresh";
	return "play";
}

function nextActivityHref(next: NextActivity | null): string {
	if (!next) return "/lessons";
	return nodeHref(next.kind, next.nodeId);
}

export default function LearningPath() {
	const { user, path, isId } = useLearningPath();
	const branchChoice = path.milestones
		.flatMap((milestone) => milestone.nodes)
		.find((node) => node.type === "branch_choice");

	return (
		<LessonsLayout user={user}>
			<section className="lessons-welcome fade-in">
				<div>
					<span className="lessons-kicker">
						<Icon name="sparkles" size={14} /> {isId ? "JALUR BELAJARMU" : "YOUR LEARNING PATH"}
					</span>
					<h1>{isId ? "Fondasi dulu, percakapan berikutnya." : "Foundations first, conversation next."}</h1>
					<p>
						{isId
							? "Kuasi Hangul langkah demi langkah, lalu gunakan dalam percakapan nyata."
							: "Master Hangul step by step, then use it in real conversation."}
					</p>
				</div>
				<div
					className="path-total-progress"
					aria-label={`${path.milestoneCompleted} of ${path.milestoneTotal} milestones`}
				>
					<div
						className="lesson-ring"
						style={
							{
								"--lesson-progress": `${(path.milestoneCompleted / Math.max(1, path.milestoneTotal)) * 100}%`,
							} as React.CSSProperties
						}
					>
						<strong>{path.milestoneCompleted}</strong>
						<small>/{path.milestoneTotal}</small>
					</div>
					<span>
						<strong>{isId ? "Milestone selesai" : "Milestones complete"}</strong>
						<small>{isId ? "Langkah demi langkah" : "One step at a time"}</small>
					</span>
				</div>
			</section>

			{path.next && (
				<section className="lessons-continue fade-in delay-1">
					<div className="continue-art" aria-hidden="true">
						<span>한</span>
						<i>ㄱ</i>
						<b>ㅏ</b>
					</div>
					<div className="lessons-continue-copy">
						<span className="lessons-kicker">{isId ? "LANGKAH BERIKUTNYA" : "YOUR NEXT STEP"}</span>
						<h2>{isId ? "Lanjutkan perjalananmu" : "Continue your journey"}</h2>
						<p>{isId ? "Kegiatan berikutnya sudah siap." : "Your next activity is ready."}</p>
					</div>
					<Link className="lesson-primary-link" to={nextActivityHref(path.next)}>
						<span>
							<Icon name="play" size={18} />
						</span>
						{isId ? "Lanjutkan" : "Continue"}
						<Icon name="arrow" size={17} />
					</Link>
				</section>
			)}

			<section className="lessons-section fade-in delay-2">
				<div className="lessons-section-heading">
					<div>
						<span className="lessons-kicker">{isId ? "FONDASI HANGUL" : "HANGUL FOUNDATION"}</span>
						<h2>{isId ? "Lima milestone membaca" : "Five reading milestones"}</h2>
					</div>
					<p>
						{isId
							? "Selesaikan lesson dan cek untuk membuka percakapan."
							: "Finish lessons and checks to unlock conversation."}
					</p>
				</div>
				<div className="path-milestone-list">
					{path.milestones.map((milestone) => (
						<article className="path-milestone-card" key={milestone.id}>
							<div className="path-milestone-head">
								<span className="path-milestone-order">{milestone.order}</span>
								<div>
									<h3>{milestone.title}</h3>
									<p>{milestone.description}</p>
								</div>
								<span className="path-milestone-progress">{milestone.progress}%</span>
							</div>
							<ul className="path-node-list">
								{milestone.nodes.map((node) => {
									const accessible = node.status !== "locked";
									const content = (
										<>
											<span className={`path-node-icon status-${node.status}`}>
												<Icon name={iconFor(node.status)} size={16} />
											</span>
											<span className="path-node-copy">
												<strong>{node.title}</strong>
												<small>
													{nodeKindLabel(node, isId)} · {node.estimatedMinutes} min
												</small>
											</span>
											<span className={`path-node-status status-${node.status}`}>
												{statusLabel(node.status, isId)}
											</span>
										</>
									);
									return (
										<li key={node.id} className={`path-node ${accessible ? "" : "is-locked"}`}>
											{accessible ? (
												<Link to={nodeHref(node.type, node.id)}>{content}</Link>
											) : (
												<div>{content}</div>
											)}
										</li>
									);
								})}
							</ul>
						</article>
					))}
				</div>
			</section>

			{branchChoice?.status === "available" && (
				<section className="lessons-section fade-in delay-3 path-branch-choice">
					<div className="lessons-section-heading">
						<div>
							<span className="lessons-kicker">{isId ? "PILIH JALURMU" : "CHOOSE YOUR PATH"}</span>
							<h2>{isId ? "Mau belajar percakapan apa?" : "What do you want to talk about?"}</h2>
						</div>
					</div>
					<div className="path-branch-grid">
						{path.branches.map((branch) =>
							branch.availability === "available" ? (
								<form key={branch.id} method="post" action="/lessons">
									<input type="hidden" name="intent" value="select-branch" />
									<input type="hidden" name="branchId" value={branch.id} />
									<button className="path-branch-card">
										<span className="path-branch-title">{branch.title}</span>
										<p>{branch.description}</p>
										<span className="path-branch-cta">
											{isId ? "Pilih" : "Choose"} <Icon name="arrow" size={15} />
										</span>
									</button>
								</form>
							) : (
								<article className="path-branch-card is-soon" key={branch.id}>
									<span className="path-branch-title">
										<Icon name="lock" size={14} /> {branch.title}
									</span>
									<p>{branch.description}</p>
									<span className="path-branch-cta">{isId ? "Segera hadir" : "Coming soon"}</span>
								</article>
							),
						)}
					</div>
				</section>
			)}

			{path.activeBranchId && (
				<section className="lessons-section fade-in delay-3">
					<div className="lessons-section-heading">
						<div>
							<span className="lessons-kicker">
								{isId ? "PERCAKAPAN SEHARI-HARI" : "EVERYDAY CONVERSATION"}
							</span>
							<h2>{isId ? "Jalur aktifmu" : "Your active branch"}</h2>
						</div>
					</div>
					<ul className="path-node-list path-branch-nodes">
						{path.branches
							.find((branch) => branch.id === path.activeBranchId)
							?.nodes.map((node) => {
								const accessible = node.status !== "locked";
								return (
									<li key={node.id} className={`path-node ${accessible ? "" : "is-locked"}`}>
										<span className={`path-node-icon status-${node.status}`}>
											<Icon name={iconFor(node.status)} size={16} />
										</span>
										<span className="path-node-copy">
											<strong>{node.title}</strong>
											<small>
												{nodeKindLabel(node, isId)} · {node.estimatedMinutes} min
											</small>
										</span>
										<span className={`path-node-status status-${node.status}`}>
											{statusLabel(node.status, isId)}
										</span>
										{accessible && (
											<Link
												className="path-node-go"
												to={nodeHref(node.type, node.id)}
												aria-label={`${isId ? "Buka" : "Open"} ${node.title}`}
											>
												<Icon name="arrow" size={15} />
											</Link>
										)}
									</li>
								);
							})}
					</ul>
				</section>
			)}
		</LessonsLayout>
	);
}
