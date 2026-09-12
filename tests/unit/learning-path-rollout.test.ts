import assert from "node:assert/strict";
import test from "node:test";
import { hashUserId, isRolloutEnabled, parseRolloutPercent } from "../../app/lib/learning-path-rollout.ts";

test("hashing the same user id is deterministic", () => {
	assert.equal(hashUserId("user-123"), hashUserId("user-123"));
	assert.notEqual(hashUserId("user-123"), hashUserId("user-124"));
});

test("rollout boundaries are absolute", () => {
	assert.equal(isRolloutEnabled("user-123", 0), false);
	assert.equal(isRolloutEnabled("user-123", 100), true);
});

test("intermediate rollout percentages assign consistently", () => {
	const enabled = isRolloutEnabled("user-123", 50);
	assert.equal(isRolloutEnabled("user-123", 50), enabled);
});

test("rollout percentage parsing clamps and rejects invalid input", () => {
	assert.equal(parseRolloutPercent(undefined), 0);
	assert.equal(parseRolloutPercent(null), 0);
	assert.equal(parseRolloutPercent("abc"), 0);
	assert.equal(parseRolloutPercent("25"), 25);
	assert.equal(parseRolloutPercent("150"), 100);
	assert.equal(parseRolloutPercent("-5"), 0);
});
