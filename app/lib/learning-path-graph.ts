// learning-path-graph.ts — pure evaluation of a versioned prerequisite graph.
// No D1 access here; the server modules load raw rows and feed this module.

export type NodeType = "lesson" | "check" | "practice" | "branch_choice" | "remediation";
export type RequiredOutcome = "completed" | "passed" | "failed" | "branch_selected";
export type NodeStatus =
	"locked" | "available" | "in_progress" | "completed" | "passed" | "failed" | "selected";

export type CurriculumNode = {
	id: string;
	nodeKey: string;
	type: NodeType;
	lessonRole: "core" | "remediation" | null;
	milestoneId: string | null;
	branchId: string | null;
	displayOrder: number;
};

export type CurriculumEdge = {
	nodeId: string;
	prerequisiteNodeId: string;
	requiredOutcome: RequiredOutcome;
};

export type NodeProgress = {
	status: "in_progress" | "completed" | null;
};

export type CheckResult = {
	passed: boolean;
};

export type GraphState = {
	nodes: CurriculumNode[];
	edges: CurriculumEdge[];
	progress: Record<string, NodeProgress>;
	checkResults: Record<string, CheckResult>;
	selectedBranchId: string | null;
};

export type NodeEvaluation = {
	node: CurriculumNode;
	status: NodeStatus;
	blockedBy: string[];
};

export type GraphEvaluation = {
	nodes: NodeEvaluation[];
	byId: Map<string, NodeEvaluation>;
	next: NextActivity | null;
};

export type NextActivity = {
	kind: "lesson" | "check" | "practice" | "branch_choice" | "remediation";
	nodeId: string;
};

export function isCheckType(type: NodeType) {
	return type === "check";
}

function prerequisiteSatisfied(edge: CurriculumEdge, state: GraphState): boolean {
	const prereq = state.nodes.find((node) => node.id === edge.prerequisiteNodeId);
	if (!prereq) return false;
	switch (edge.requiredOutcome) {
		case "completed":
			if (prereq.type === "check") return state.checkResults[prereq.id]?.passed === true;
			if (prereq.type === "branch_choice") return state.selectedBranchId != null;
			return state.progress[prereq.id]?.status === "completed";
		case "passed":
			return prereq.type === "check" && state.checkResults[prereq.id]?.passed === true;
		case "failed":
			return prereq.type === "check" && state.checkResults[prereq.id]?.passed === false;
		case "branch_selected":
			return state.selectedBranchId != null;
	}
}

function incomingEdges(nodeId: string, state: GraphState): CurriculumEdge[] {
	return state.edges.filter((edge) => edge.nodeId === nodeId);
}

function evaluateNode(node: CurriculumNode, state: GraphState): NodeEvaluation {
	const edges = incomingEdges(node.id, state);
	const blockedBy = edges
		.filter((edge) => !prerequisiteSatisfied(edge, state))
		.map((edge) => edge.prerequisiteNodeId);
	const unlocked = blockedBy.length === 0;

	if (node.type === "branch_choice") {
		return {
			node,
			status: state.selectedBranchId != null ? "selected" : unlocked ? "available" : "locked",
			blockedBy,
		};
	}

	if (node.type === "check") {
		const check = state.checkResults[node.id];
		if (check?.passed) return { node, status: "passed", blockedBy };
		if (check && !check.passed) return { node, status: "failed", blockedBy };
		return { node, status: unlocked ? "available" : "locked", blockedBy };
	}

	const progress = state.progress[node.id];
	if (progress?.status === "completed") return { node, status: "completed", blockedBy };
	if (progress?.status === "in_progress") return { node, status: "in_progress", blockedBy };
	return { node, status: unlocked ? "available" : "locked", blockedBy };
}

function remediationFor(checkNodeId: string, state: GraphState): CurriculumNode | undefined {
	const edge = state.edges.find(
		(candidate) => candidate.prerequisiteNodeId === checkNodeId && candidate.requiredOutcome === "failed",
	);
	if (!edge) return undefined;
	return state.nodes.find((node) => node.id === edge.nodeId && node.type === "remediation");
}

function orderedAvailable(
	evaluation: GraphEvaluation,
	predicate: (item: NodeEvaluation) => boolean,
): NodeEvaluation | null {
	const matches = evaluation.nodes
		.filter(predicate)
		.sort((left, right) => left.node.displayOrder - right.node.displayOrder);
	return matches[0] ?? null;
}

export function selectNextActivity(state: GraphState, evaluation: GraphEvaluation): NextActivity | null {
	const inProgress = orderedAvailable(
		evaluation,
		(item) => item.status === "in_progress" && item.node.type !== "practice",
	);
	if (inProgress) return { kind: inProgress.node.type as NextActivity["kind"], nodeId: inProgress.node.id };

	const failedCheck = orderedAvailable(
		evaluation,
		(item) => item.status === "failed" && item.node.type === "check",
	);
	if (failedCheck) {
		const remediation = remediationFor(failedCheck.node.id, state);
		const remediationEval = remediation ? evaluation.byId.get(remediation.id) : undefined;
		if (remediation && remediationEval && remediationEval.status === "available") {
			return { kind: "remediation", nodeId: remediation.id };
		}
		return { kind: "check", nodeId: failedCheck.node.id };
	}

	const practice = orderedAvailable(
		evaluation,
		(item) => item.status === "available" && item.node.type === "practice",
	);
	if (practice) return { kind: "practice", nodeId: practice.node.id };

	const branchChoice = orderedAvailable(
		evaluation,
		(item) => item.status === "available" && item.node.type === "branch_choice",
	);
	if (branchChoice) return { kind: "branch_choice", nodeId: branchChoice.node.id };

	const check = orderedAvailable(
		evaluation,
		(item) => item.status === "available" && item.node.type === "check",
	);
	if (check) return { kind: "check", nodeId: check.node.id };

	const lesson = orderedAvailable(
		evaluation,
		(item) => item.status === "available" && item.node.type === "lesson",
	);
	if (lesson) return { kind: "lesson", nodeId: lesson.node.id };

	return null;
}

export function evaluateGraph(state: GraphState): GraphEvaluation {
	const evaluations = state.nodes
		.slice()
		.sort((left, right) => left.displayOrder - right.displayOrder)
		.map((node) => evaluateNode(node, state));
	const byId = new Map(evaluations.map((item) => [item.node.id, item]));
	return {
		nodes: evaluations,
		byId,
		next: selectNextActivity(state, { nodes: evaluations, byId, next: null }),
	};
}

export function isNodeAccessible(nodeId: string, evaluation: GraphEvaluation): boolean {
	const item = evaluation.byId.get(nodeId);
	return Boolean(item && item.status !== "locked");
}

export function findRemediationCandidates(checkNodeId: string, state: GraphState): string[] {
	return state.edges
		.filter((edge) => edge.prerequisiteNodeId === checkNodeId && edge.requiredOutcome === "failed")
		.map((edge) => edge.nodeId);
}

export function nodeHref(type: NodeType, nodeId: string): string {
	switch (type) {
		case "check":
			return `/lessons/checks/${nodeId}`;
		case "practice":
			return `/lessons/practice/${nodeId}`;
		case "branch_choice":
			return "/lessons";
		default:
			return `/lessons/${nodeId}`;
	}
}
