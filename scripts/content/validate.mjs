// validate.mjs — validates the learning-path curriculum that is seeded into the
// local D1 database. Structural, referential, localization, and assessment checks.
//
// Usage: node scripts/content/validate.mjs

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const wranglerBin = path.join(repoRoot, "node_modules", ".bin", "wrangler");

function query(sql) {
	const result = spawnSync(
		wranglerBin,
		["d1", "execute", "hangeuloo-oppia", "--local", "--json", "--command", sql],
		{
			cwd: repoRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		},
	);
	if (result.status !== 0) {
		throw new Error(`wrangler query failed: ${result.stderr ?? "unknown error"}`);
	}
	const parsed = JSON.parse(result.stdout);
	const rows = [];
	for (const statement of parsed) {
		if (statement.results) rows.push(...statement.results);
	}
	return rows;
}

const violations = [];
function assert(condition, message) {
	if (!condition) violations.push(message);
}

const nodes = query(
	"SELECT id, node_key, node_type, milestone_id, branch_id, title_id, title_en, description_id, description_en FROM curriculum_nodes ORDER BY display_order",
);
const edges = query(
	"SELECT p.node_id, p.prerequisite_node_id, p.required_outcome FROM curriculum_prerequisites p JOIN curriculum_nodes n ON n.id = p.node_id WHERE n.curriculum_version_id = 'cv-v1'",
);
const milestones = query(
	"SELECT id, milestone_key, title_id, title_en, description_id, description_en FROM curriculum_milestones",
);
const branches = query(
	"SELECT id, branch_key, title_id, title_en, description_id, description_en, availability FROM curriculum_branches",
);
const nodeItems = query(
	"SELECT id, node_id, translation_id, translation_en, explanation_id, explanation_en FROM curriculum_node_items",
);
const checkItems = query(
	"SELECT id, check_node_id, prompt_id, prompt_en, choices, answer, explanation_id, explanation_en FROM curriculum_check_items",
);
const practiceItems = query(
	"SELECT id, practice_node_id, source_type, source_ref FROM curriculum_practice_items",
);

const nodeById = new Map(nodes.map((node) => [node.id, node]));
const nodeItemIds = new Set(nodeItems.map((item) => item.id));

// Localization parity: every authored field must be non-empty in both languages.
for (const row of [...nodes, ...milestones, ...branches, ...nodeItems, ...checkItems]) {
	for (const field of [
		"title_id",
		"title_en",
		"description_id",
		"description_en",
		"translation_id",
		"translation_en",
		"explanation_id",
		"explanation_en",
		"prompt_id",
		"prompt_en",
	]) {
		if (row[field] !== undefined && !String(row[field]).trim()) {
			assert(false, `${row.id}: empty ${field}`);
		}
	}
}

// Graph integrity.
const nodesPresent = new Set(nodes.map((node) => node.id));
for (const edge of edges) {
	assert(nodesPresent.has(edge.node_id), `dangling edge target: ${edge.node_id}`);
	assert(nodesPresent.has(edge.prerequisite_node_id), `dangling prerequisite: ${edge.prerequisite_node_id}`);
}

const indegree = new Map(nodes.map((node) => [node.id, 0]));
for (const edge of edges) indegree.set(edge.node_id, (indegree.get(edge.node_id) ?? 0) + 1);

// Cycle detection (Kahn's algorithm).
const adjacency = new Map();
for (const edge of edges) {
	if (!adjacency.has(edge.prerequisite_node_id)) adjacency.set(edge.prerequisite_node_id, []);
	adjacency.get(edge.prerequisite_node_id).push(edge.node_id);
}
const queue = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id);
const visited = new Set();
while (queue.length) {
	const id = queue.shift();
	visited.add(id);
	for (const next of adjacency.get(id) ?? []) {
		indegree.set(next, indegree.get(next) - 1);
		if (indegree.get(next) === 0) queue.push(next);
	}
}
assert(visited.size === nodes.length, `graph contains a cycle (visited ${visited.size}/${nodes.length})`);

// Every node except the root lesson is reachable.
const rootId = "f-vowels";
const reachable = new Set([rootId]);
const work = [rootId];
while (work.length) {
	const id = work.shift();
	for (const next of adjacency.get(id) ?? []) {
		if (!reachable.has(next)) {
			reachable.add(next);
			work.push(next);
		}
	}
}
for (const node of nodes) {
	if (node.id !== rootId) assert(reachable.has(node.id), `unreachable node: ${node.id}`);
}

// Structure counts.
assert(milestones.length === 5, `expected 5 milestones, got ${milestones.length}`);
assert(branches.length === 4, `expected 4 branches, got ${branches.length}`);
assert(
	branches.filter((branch) => branch.availability === "available").length === 1,
	"exactly one branch should be available",
);
assert(
	nodes.filter((node) => node.node_type === "branch_choice").length === 1,
	"exactly one branch_choice node expected",
);

// Every lesson/remediation has items; every check has check items; every practice has practice items.
const itemCountByNode = new Map();
for (const item of nodeItems) itemCountByNode.set(item.node_id, (itemCountByNode.get(item.node_id) ?? 0) + 1);
const checkCountByNode = new Map();
for (const item of checkItems)
	checkCountByNode.set(item.check_node_id, (checkCountByNode.get(item.check_node_id) ?? 0) + 1);
const practiceCountByNode = new Map();
for (const item of practiceItems)
	practiceCountByNode.set(item.practice_node_id, (practiceCountByNode.get(item.practice_node_id) ?? 0) + 1);

for (const node of nodes) {
	if (node.node_type === "lesson" || node.node_type === "remediation") {
		assert((itemCountByNode.get(node.id) ?? 0) > 0, `lesson/remediation has no items: ${node.id}`);
	}
	if (node.node_type === "check") {
		assert((checkCountByNode.get(node.id) ?? 0) > 0, `check has no questions: ${node.id}`);
	}
	if (node.node_type === "practice") {
		assert((practiceCountByNode.get(node.id) ?? 0) > 0, `practice has no items: ${node.id}`);
	}
}

// Check items must have parseable choices and an answer present in the choices.
for (const item of checkItems) {
	let choices;
	try {
		choices = JSON.parse(item.choices);
	} catch {
		assert(false, `${item.id}: invalid choices JSON`);
		continue;
	}
	const ids = new Set(choices.map((choice) => choice.id));
	assert(ids.has(item.answer), `${item.id}: answer "${item.answer}" not present in choices`);
}

// Practice items must resolve to a node item or a known vocabulary source.
const validSources = new Set(["node_item", "vocabulary", "sentence_exercise", "listening_exercise"]);
for (const item of practiceItems) {
	assert(validSources.has(item.source_type), `${item.id}: invalid source_type ${item.source_type}`);
	if (item.source_type === "node_item") {
		assert(
			nodeItemIds.has(item.source_ref),
			`${item.id}: source_ref ${item.source_ref} does not resolve to a node item`,
		);
	}
}

if (violations.length) {
	console.error(`Content validation failed with ${violations.length} violation(s):`);
	for (const violation of violations) console.error(`  - ${violation}`);
	process.exit(1);
}

console.log(
	`Content validation passed: ${nodes.length} nodes, ${edges.length} edges, ${nodeItems.length} lesson items, ${checkItems.length} check items, ${practiceItems.length} practice items.`,
);
