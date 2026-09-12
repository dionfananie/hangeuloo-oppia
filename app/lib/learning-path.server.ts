import type { GuideLanguage } from "./learning.server";
import {
	evaluateGraph,
	isNodeAccessible,
	nodeHref,
	type CurriculumEdge,
	type CurriculumNode,
	type GraphState,
	type NextActivity,
	type NodeType,
	type NodeStatus,
} from "./learning-path-graph";
import { enrollVocabulary, recordActivity } from "./learning-activity.server";
import type { LessonExperience } from "./lesson-experience.server";

export type { NextActivity, NodeStatus, NodeType } from "./learning-path-graph";

export type PathNodeView = {
	id: string;
	key: string;
	type: NodeType;
	title: string;
	description: string;
	estimatedMinutes: number;
	xpReward: number;
	status: NodeStatus;
	blockedBy: string[];
	milestoneId: string | null;
	branchId: string | null;
};

export type PathMilestoneView = {
	id: string;
	key: string;
	title: string;
	description: string;
	order: number;
	progress: number;
	nodes: PathNodeView[];
};

export type PathBranchView = {
	id: string;
	key: string;
	title: string;
	description: string;
	availability: "available" | "coming_soon";
	nodes: PathNodeView[];
};

export type LearningPathCatalog = {
	guideLanguage: GuideLanguage;
	milestoneCompleted: number;
	milestoneTotal: number;
	milestones: PathMilestoneView[];
	branches: PathBranchView[];
	activeBranchId: string | null;
	next: NextActivity | null;
};

export type PathLessonItem = {
	id: string;
	type: "character" | "word" | "sentence";
	koreanText: string;
	romanization: string;
	translation: string;
	pronunciation: string;
	explanation: string;
	exampleKo: string;
	example: string;
	audioUrl: string | null;
};

export type PathLessonDetail = {
	id: string;
	type: "lesson" | "remediation";
	title: string;
	description: string;
	estimatedMinutes: number;
	xpReward: number;
	itemCount: number;
	currentItemIndex: number;
	status: NodeStatus;
	progress: number;
	items: PathLessonItem[];
};

export type LessonCompletion = {
	xp: number;
	vocabularyAdded: number;
	nextHref: string | null;
	nextTitle: string | null;
	practiceHref: string | null;
	practiceTitle: string | null;
};

export type PathSummary = {
	guideLanguage: GuideLanguage;
	milestoneCompleted: number;
	milestoneTotal: number;
	nextKind: NextActivity["kind"] | null;
	nextHref: string | null;
	nextTitle: string | null;
	activeBranchTitle: string | null;
};

type NodeRow = {
	id: string;
	node_key: string;
	node_type: NodeType;
	lesson_role: "core" | "remediation" | null;
	milestone_id: string | null;
	branch_id: string | null;
	display_order: number;
	title_id: string;
	title_en: string;
	description_id: string;
	description_en: string;
	estimated_minutes: number;
	xp_reward: number;
};

type EdgeRow = {
	node_id: string;
	prerequisite_node_id: string;
	required_outcome: CurriculumEdge["requiredOutcome"];
};

function localized(row: Record<string, unknown>, field: string, language: GuideLanguage): string {
	return String(row[`${field}_${language}`]);
}

async function getLanguage(db: D1Database, userId: string): Promise<GuideLanguage> {
	const profile = await db
		.prepare("SELECT guide_language FROM learning_profiles WHERE user_id = ?")
		.bind(userId)
		.first<{ guide_language: GuideLanguage }>();
	return profile?.guide_language ?? "en";
}

async function loadGraph(db: D1Database, userId: string, experience: LessonExperience) {
	const language = await getLanguage(db, userId);
	const versionId = experience.curriculumVersionId;
	if (!versionId) return null;
	const [nodeRows, edgeRows, progressRows, checkRows] = await Promise.all([
		db
			.prepare("SELECT * FROM curriculum_nodes WHERE curriculum_version_id = ?")
			.bind(versionId)
			.all<NodeRow>(),
		db
			.prepare(
				`SELECT p.node_id, p.prerequisite_node_id, p.required_outcome
				FROM curriculum_prerequisites p JOIN curriculum_nodes n ON n.id = p.node_id
				WHERE n.curriculum_version_id = ?`,
			)
			.bind(versionId)
			.all<EdgeRow>(),
		db
			.prepare("SELECT node_id, status FROM user_curriculum_node_progress WHERE user_id = ?")
			.bind(userId)
			.all<{ node_id: string; status: "in_progress" | "completed" }>(),
		db
			.prepare(
				`SELECT check_node_id, MAX(passed) passed FROM user_curriculum_check_attempts
				WHERE user_id = ? GROUP BY check_node_id`,
			)
			.bind(userId)
			.all<{ check_node_id: string; passed: number }>(),
	]);
	const nodes: CurriculumNode[] = nodeRows.results.map((row) => ({
		id: row.id,
		nodeKey: row.node_key,
		type: row.node_type,
		lessonRole: row.lesson_role,
		milestoneId: row.milestone_id,
		branchId: row.branch_id,
		displayOrder: Number(row.display_order),
	}));
	const edges: CurriculumEdge[] = edgeRows.results.map((row) => ({
		nodeId: row.node_id,
		prerequisiteNodeId: row.prerequisite_node_id,
		requiredOutcome: row.required_outcome,
	}));
	const progress: GraphState["progress"] = {};
	for (const row of progressRows.results) progress[row.node_id] = { status: row.status };
	const checkResults: GraphState["checkResults"] = {};
	for (const row of checkRows.results) checkResults[row.check_node_id] = { passed: Number(row.passed) === 1 };
	const state: GraphState = {
		nodes,
		edges,
		progress,
		checkResults,
		selectedBranchId: experience.selectedBranchId,
	};
	return { state, evaluation: evaluateGraph(state), language, rows: nodeRows.results };
}

function mapNodeView(
	row: NodeRow,
	evaluation: ReturnType<typeof evaluateGraph>,
	language: GuideLanguage,
): PathNodeView {
	const item = evaluation.byId.get(row.id);
	return {
		id: row.id,
		key: row.node_key,
		type: row.node_type,
		title: localized(row, "title", language),
		description: localized(row, "description", language),
		estimatedMinutes: Number(row.estimated_minutes),
		xpReward: Number(row.xp_reward),
		status: item?.status ?? "locked",
		blockedBy: item?.blockedBy ?? [],
		milestoneId: row.milestone_id,
		branchId: row.branch_id,
	};
}

const milestoneDoneStatuses = new Set<NodeStatus>(["completed", "passed", "selected"]);

export async function getLearningPathCatalog(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
): Promise<LearningPathCatalog | null> {
	const graph = await loadGraph(db, userId, experience);
	if (!graph) return null;
	const { state, evaluation, language, rows } = graph;
	const versionId = experience.curriculumVersionId as string;
	const nodeViews = rows.map((row) => mapNodeView(row, evaluation, language));

	const [milestoneRows, branchRows] = await Promise.all([
		db
			.prepare(
				`SELECT id, milestone_key, title_id, title_en, description_id, description_en, milestone_order
				FROM curriculum_milestones WHERE curriculum_version_id = ? ORDER BY milestone_order`,
			)
			.bind(versionId)
			.all<{
				id: string;
				milestone_key: string;
				title_id: string;
				title_en: string;
				description_id: string;
				description_en: string;
				milestone_order: number;
			}>(),
		db
			.prepare(
				`SELECT id, branch_key, title_id, title_en, description_id, description_en, availability
				FROM curriculum_branches WHERE curriculum_version_id = ? ORDER BY display_order`,
			)
			.bind(versionId)
			.all<{
				id: string;
				branch_key: string;
				title_id: string;
				title_en: string;
				description_id: string;
				description_en: string;
				availability: "available" | "coming_soon";
			}>(),
	]);

	const milestones: PathMilestoneView[] = milestoneRows.results.map((row) => {
		const nodes = nodeViews.filter((node) => node.milestoneId === row.id);
		const done = nodes.filter((node) => milestoneDoneStatuses.has(node.status)).length;
		return {
			id: row.id,
			key: row.milestone_key,
			title: localized(row, "title", language),
			description: localized(row, "description", language),
			order: Number(row.milestone_order),
			progress: nodes.length ? Math.round((done / nodes.length) * 100) : 0,
			nodes,
		};
	});

	const branches: PathBranchView[] = branchRows.results.map((row) => ({
		id: row.id,
		key: row.branch_key,
		title: localized(row, "title", language),
		description: localized(row, "description", language),
		availability: row.availability,
		nodes: nodeViews.filter((node) => node.branchId === row.id),
	}));

	const milestoneCompleted = milestones.filter((milestone) => milestone.progress === 100).length;

	return {
		guideLanguage: language,
		milestoneCompleted,
		milestoneTotal: milestones.length,
		milestones,
		branches,
		activeBranchId: experience.selectedBranchId,
		next: evaluation.next,
	};
}

export async function getPathSummary(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
): Promise<PathSummary | null> {
	const graph = await loadGraph(db, userId, experience);
	if (!graph) return null;
	const { state, evaluation, language, rows } = graph;
	const nodeById = new Map(rows.map((row) => [row.id, row]));
	const next = evaluation.next;
	const nextRow = next ? nodeById.get(next.nodeId) : undefined;
	const activeBranch = state.selectedBranchId
		? await db
				.prepare("SELECT title_id, title_en FROM curriculum_branches WHERE id = ?")
				.bind(state.selectedBranchId)
				.first<{ title_id: string; title_en: string }>()
		: null;
	const milestoneRows = await db
		.prepare("SELECT COUNT(*) total FROM curriculum_milestones WHERE curriculum_version_id = ?")
		.bind(experience.curriculumVersionId as string)
		.first<{ total: number }>();
	const done = new Set(
		evaluation.nodes
			.filter((item) => item.node.milestoneId && milestoneDoneStatuses.has(item.status))
			.map((item) => item.node.milestoneId),
	);
	return {
		guideLanguage: language,
		milestoneCompleted: done.size,
		milestoneTotal: Number(milestoneRows?.total ?? 0),
		nextKind: next?.kind ?? null,
		nextHref: next ? nodeHref(next.kind, next.nodeId) : null,
		nextTitle: nextRow ? localized(nextRow, "title", language) : null,
		activeBranchTitle: activeBranch ? localized(activeBranch, "title", language) : null,
	};
}

export async function authorizeBranchChoice(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
): Promise<string> {
	const graph = await loadGraph(db, userId, experience);
	if (!graph) throw new Response("Learning path not assigned", { status: 403 });
	const branchChoice = graph.state.nodes.find((node) => node.type === "branch_choice");
	if (!branchChoice) throw new Response("No branch choice available", { status: 404 });
	if (!isNodeAccessible(branchChoice.id, graph.evaluation))
		throw new Response("Complete the foundation first", { status: 403 });
	return branchChoice.id;
}

export async function authorizePathNode(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
	allowedTypes: NodeType[],
) {
	const graph = await loadGraph(db, userId, experience);
	if (!graph) throw new Response("Learning path not assigned", { status: 403 });
	const node = graph.rows.find((row) => row.id === nodeId);
	if (!node) throw new Response("Activity not found", { status: 404 });
	if (!allowedTypes.includes(node.node_type)) throw new Response("Activity not found", { status: 404 });
	if (!isNodeAccessible(nodeId, graph.evaluation))
		throw new Response("Complete the previous activity first", { status: 403 });
	return { node, graph, language: graph.language };
}

function calculateProgress(status: NodeStatus, currentItemIndex: number, itemCount: number) {
	if (status === "completed" || status === "passed") return 100;
	if (status !== "in_progress" || itemCount < 1) return 0;
	return Math.round(((Math.min(Math.max(0, currentItemIndex), itemCount - 1) + 1) / itemCount) * 100);
}

export async function getLearningPathLesson(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
): Promise<PathLessonDetail> {
	const { node, language } = await authorizePathNode(db, userId, experience, nodeId, [
		"lesson",
		"remediation",
	]);
	const [itemsResult, progressRow] = await Promise.all([
		db
			.prepare("SELECT * FROM curriculum_node_items WHERE node_id = ? ORDER BY item_order")
			.bind(nodeId)
			.all<Record<string, unknown>>(),
		db
			.prepare(
				"SELECT status, current_item_index FROM user_curriculum_node_progress WHERE user_id = ? AND node_id = ?",
			)
			.bind(userId, nodeId)
			.first<{ status: "in_progress" | "completed"; current_item_index: number }>(),
	]);
	const itemCount = itemsResult.results.length;
	const currentItemIndex = progressRow ? Number(progressRow.current_item_index) : 0;
	const status: NodeStatus = progressRow?.status === "completed" ? "completed" : "available";
	return {
		id: node.id,
		type: node.node_type as "lesson" | "remediation",
		title: localized(node, "title", language),
		description: localized(node, "description", language),
		estimatedMinutes: Number(node.estimated_minutes),
		xpReward: Number(node.xp_reward),
		itemCount,
		currentItemIndex: Math.min(Math.max(0, currentItemIndex), Math.max(0, itemCount - 1)),
		status,
		progress: calculateProgress(status, currentItemIndex, itemCount),
		items: itemsResult.results.map((item) => ({
			id: String(item.id),
			type: item.type as PathLessonItem["type"],
			koreanText: String(item.korean_text),
			romanization: String(item.romanization),
			translation: localized(item, "translation", language),
			pronunciation: localized(item, "pronunciation", language),
			explanation: localized(item, "explanation", language),
			exampleKo: String(item.example_ko),
			example: localized(item, "example", language),
			audioUrl: item.audio_url ? String(item.audio_url) : null,
		})),
	};
}

export async function viewLearningPathItem(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
	itemIndex: number,
): Promise<number> {
	const { node } = await authorizePathNode(db, userId, experience, nodeId, ["lesson", "remediation"]);
	const countRow = await db
		.prepare("SELECT COUNT(*) total FROM curriculum_node_items WHERE node_id = ?")
		.bind(nodeId)
		.first<{ total: number }>();
	const itemCount = Number(countRow?.total ?? 0);
	if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= itemCount)
		throw new Response("Invalid lesson item", { status: 400 });
	const progressRow = await db
		.prepare(
			"SELECT status, current_item_index FROM user_curriculum_node_progress WHERE user_id = ? AND node_id = ?",
		)
		.bind(userId, nodeId)
		.first<{ status: "in_progress" | "completed"; current_item_index: number }>();
	const furthestAllowed =
		progressRow?.status === "completed"
			? itemCount - 1
			: progressRow?.status === "in_progress"
				? Number(progressRow.current_item_index) + 1
				: 0;
	if (itemIndex > furthestAllowed) throw new Response("Complete lesson items in order", { status: 400 });
	await db
		.prepare(
			`INSERT INTO user_curriculum_node_progress (user_id, node_id, status, current_item_index)
			VALUES (?, ?, 'in_progress', ?)
			ON CONFLICT(user_id, node_id) DO UPDATE SET
			current_item_index = MAX(current_item_index, excluded.current_item_index),
			last_accessed_at = CURRENT_TIMESTAMP`,
		)
		.bind(userId, nodeId, itemIndex)
		.run();
	void node;
	return itemIndex;
}

async function findSuccessors(db: D1Database, userId: string, experience: LessonExperience, nodeId: string) {
	const graph = await loadGraph(db, userId, experience);
	if (!graph) return [];
	return graph.state.edges.filter((edge) => edge.prerequisiteNodeId === nodeId).map((edge) => edge.nodeId);
}

export async function completeLearningPathLesson(
	db: D1Database,
	userId: string,
	experience: LessonExperience,
	nodeId: string,
	lastItemIndex: number,
): Promise<LessonCompletion> {
	const { node, graph } = await authorizePathNode(db, userId, experience, nodeId, ["lesson", "remediation"]);
	const countRow = await db
		.prepare("SELECT COUNT(*) total FROM curriculum_node_items WHERE node_id = ?")
		.bind(nodeId)
		.first<{ total: number }>();
	const itemCount = Number(countRow?.total ?? 0);
	if (!Number.isInteger(lastItemIndex) || lastItemIndex !== itemCount - 1)
		throw new Response("Finish every item before completing this lesson", { status: 400 });
	const current = await db
		.prepare(
			"SELECT status, current_item_index FROM user_curriculum_node_progress WHERE user_id = ? AND node_id = ?",
		)
		.bind(userId, nodeId)
		.first<{ status: "in_progress" | "completed"; current_item_index: number }>();
	if (current?.status !== "in_progress" || Number(current.current_item_index) < itemCount - 1)
		throw new Response("Finish every item before completing this lesson", { status: 400 });
	const updated = await db
		.prepare(
			`UPDATE user_curriculum_node_progress SET status = 'completed', completed_at = CURRENT_TIMESTAMP,
			last_accessed_at = CURRENT_TIMESTAMP
			WHERE user_id = ? AND node_id = ? AND status = 'in_progress' AND current_item_index >= ?`,
		)
		.bind(userId, nodeId, itemCount - 1)
		.run();
	let xp = 0;
	let vocabularyAdded = 0;
	if (Number(updated.meta.changes) > 0) {
		xp = Number(node.xp_reward);
		await recordActivity(db, userId, { sourceType: "lesson", sourceId: nodeId, xp });
		const vocabulary = await db
			.prepare(
				`SELECT DISTINCT vocabulary_id FROM curriculum_node_items
				WHERE node_id = ? AND vocabulary_id IS NOT NULL`,
			)
			.bind(nodeId)
			.all<{ vocabulary_id: number }>();
		const ids = vocabulary.results.map((row) => Number(row.vocabulary_id));
		vocabularyAdded = await enrollVocabulary(db, userId, ids);
	}
	await db
		.prepare(
			"INSERT INTO learning_path_events (id, user_id, curriculum_version_id, node_id, event_type) VALUES (?, ?, ?, ?, 'node_completed')",
		)
		.bind(crypto.randomUUID(), userId, experience.curriculumVersionId, nodeId)
		.run();
	const refreshed = await loadGraph(db, userId, experience);
	const next = refreshed?.evaluation.next ?? null;
	const nextNode = next ? refreshed?.rows.find((row) => row.id === next.nodeId) : undefined;
	const successorIds = await findSuccessors(db, userId, experience, nodeId);
	const practiceId = successorIds.find(
		(id) => graph.state.nodes.find((n) => n.id === id)?.type === "practice",
	);
	const practiceNode = practiceId ? graph.state.nodes.find((n) => n.id === practiceId) : undefined;
	return {
		xp,
		vocabularyAdded,
		nextHref: next ? nodeHref(next.kind, next.nodeId) : "/lessons",
		nextTitle: nextNode ? localized(nextNode, "title", graph.language) : null,
		practiceHref: practiceNode ? nodeHref("practice", practiceNode.id) : null,
		practiceTitle: practiceNode ? localized(practiceNode, "title", graph.language) : null,
	};
}
