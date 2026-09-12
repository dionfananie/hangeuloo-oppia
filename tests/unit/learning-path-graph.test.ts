import assert from "node:assert/strict";
import test from "node:test";
import {
	evaluateGraph,
	isNodeAccessible,
	selectNextActivity,
	type CurriculumEdge,
	type CurriculumNode,
	type GraphState,
} from "../../app/lib/learning-path-graph.ts";

function node(partial: Partial<CurriculumNode> & Pick<CurriculumNode, "id" | "type">): CurriculumNode {
	return {
		nodeKey: partial.id,
		lessonRole: null,
		milestoneId: null,
		branchId: null,
		displayOrder: 0,
		...partial,
	};
}

function edge(
	nodeId: string,
	prerequisiteNodeId: string,
	requiredOutcome: CurriculumEdge["requiredOutcome"],
): CurriculumEdge {
	return { nodeId, prerequisiteNodeId, requiredOutcome };
}

// Mirrors the real v1 topology: two foundation milestones gate the branch choice.
const nodes: CurriculumNode[] = [
	node({ id: "f-vowels", type: "lesson", lessonRole: "core", displayOrder: 1 }),
	node({ id: "f-check-vowels", type: "check", displayOrder: 2 }),
	node({ id: "f-remediation-vowels", type: "remediation", lessonRole: "remediation", displayOrder: 3 }),
	node({ id: "f-consonants-1", type: "lesson", lessonRole: "core", displayOrder: 4 }),
	node({ id: "f-check-consonants-1", type: "check", displayOrder: 5 }),
	node({ id: "branch-choice", type: "branch_choice", displayOrder: 6 }),
	node({ id: "c-1-greetings", type: "lesson", lessonRole: "core", branchId: "br-conversation", displayOrder: 7 }),
	node({ id: "c-1-practice", type: "practice", branchId: "br-conversation", displayOrder: 8 }),
];

const edges: CurriculumEdge[] = [
	edge("f-check-vowels", "f-vowels", "completed"),
	edge("f-remediation-vowels", "f-check-vowels", "failed"),
	edge("f-consonants-1", "f-check-vowels", "passed"),
	edge("f-check-consonants-1", "f-consonants-1", "completed"),
	edge("branch-choice", "f-check-consonants-1", "passed"),
	edge("c-1-greetings", "branch-choice", "branch_selected"),
	edge("c-1-practice", "c-1-greetings", "completed"),
];

function state(overrides: Partial<GraphState> = {}): GraphState {
	return {
		nodes,
		edges,
		progress: {},
		checkResults: {},
		selectedBranchId: null,
		...overrides,
	};
}

function status(nodeId: string, graph: GraphState) {
	return evaluateGraph(graph).byId.get(nodeId)?.status;
}

const foundationPassed = {
	progress: { "f-vowels": { status: "completed" as const }, "f-consonants-1": { status: "completed" as const } },
	checkResults: {
		"f-check-vowels": { passed: true },
		"f-check-consonants-1": { passed: true },
	},
};

test("a fresh graph exposes only the root lesson", () => {
	const graph = state();
	const evaluation = evaluateGraph(graph);
	assert.equal(status("f-vowels", graph), "available");
	assert.equal(status("f-check-vowels", graph), "locked");
	assert.equal(status("f-consonants-1", graph), "locked");
	assert.equal(status("branch-choice", graph), "locked");
	assert.equal(evaluation.next?.nodeId, "f-vowels");
	assert.deepEqual(evaluation.byId.get("f-check-vowels")?.blockedBy, ["f-vowels"]);
});

test("completing the root lesson unlocks its check", () => {
	const graph = state({ progress: { "f-vowels": { status: "completed" } } });
	assert.equal(status("f-check-vowels", graph), "available");
	assert.equal(evaluateGraph(graph).next?.nodeId, "f-check-vowels");
});

test("a failed check unlocks remediation before a retry", () => {
	const graph = state({
		progress: { "f-vowels": { status: "completed" } },
		checkResults: { "f-check-vowels": { passed: false } },
	});
	assert.equal(status("f-check-vowels", graph), "failed");
	assert.equal(status("f-remediation-vowels", graph), "available");
	assert.equal(evaluateGraph(graph).next?.kind, "remediation");
	assert.equal(evaluateGraph(graph).next?.nodeId, "f-remediation-vowels");
});

test("after remediation, the failed check becomes the retry target", () => {
	const graph = state({
		progress: {
			"f-vowels": { status: "completed" },
			"f-remediation-vowels": { status: "completed" },
		},
		checkResults: { "f-check-vowels": { passed: false } },
	});
	assert.equal(status("f-remediation-vowels", graph), "completed");
	assert.equal(evaluateGraph(graph).next?.nodeId, "f-check-vowels");
});

test("passing a check opens the next milestone and hides remediation", () => {
	const graph = state({
		progress: { "f-vowels": { status: "completed" } },
		checkResults: { "f-check-vowels": { passed: true } },
	});
	assert.equal(status("f-check-vowels", graph), "passed");
	assert.equal(status("f-consonants-1", graph), "available");
	assert.equal(status("f-remediation-vowels", graph), "locked");
	assert.equal(evaluateGraph(graph).next?.nodeId, "f-consonants-1");
});

test("branch choice becomes available only after the final foundation check", () => {
	const partial = state({
		progress: { "f-vowels": { status: "completed" } },
		checkResults: { "f-check-vowels": { passed: true } },
	});
	assert.equal(status("branch-choice", partial), "locked");

	const graph = state(foundationPassed);
	assert.equal(status("branch-choice", graph), "available");
	assert.equal(evaluateGraph(graph).next?.kind, "branch_choice");
});

test("selecting a branch opens its first lesson", () => {
	const graph = state({ ...foundationPassed, selectedBranchId: "br-conversation" });
	assert.equal(status("branch-choice", graph), "selected");
	assert.equal(status("c-1-greetings", graph), "available");
	assert.equal(evaluateGraph(graph).next?.nodeId, "c-1-greetings");
});

test("completing a branch lesson surfaces its lesson-specific practice", () => {
	const graph = state({
		...foundationPassed,
		selectedBranchId: "br-conversation",
		progress: { ...foundationPassed.progress, "c-1-greetings": { status: "completed" } },
	});
	assert.equal(status("c-1-practice", graph), "available");
	assert.equal(evaluateGraph(graph).next?.kind, "practice");
	assert.equal(evaluateGraph(graph).next?.nodeId, "c-1-practice");
});

test("in-progress lessons take priority over available checks", () => {
	const graph = state({ progress: { "f-vowels": { status: "in_progress" } } });
	assert.equal(status("f-vowels", graph), "in_progress");
	assert.equal(evaluateGraph(graph).next?.nodeId, "f-vowels");
});

test("authorization denies locked nodes regardless of direct access", () => {
	const graph = state();
	const evaluation = evaluateGraph(graph);
	assert.equal(isNodeAccessible("f-vowels", evaluation), true);
	assert.equal(isNodeAccessible("f-check-vowels", evaluation), false);
	assert.equal(isNodeAccessible("c-1-greetings", evaluation), false);
	assert.equal(isNodeAccessible("missing", evaluation), false);
});

test("next activity selection falls back to the first available lesson in order", () => {
	const graph = state();
	const fallback = selectNextActivity(graph, evaluateGraph(graph));
	assert.equal(fallback?.nodeId, "f-vowels");
});
