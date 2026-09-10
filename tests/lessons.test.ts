import assert from "node:assert/strict";
import test from "node:test";
import { calculateLessonProgress, deriveLessonStatus, levelAfterCompletion } from "../app/lib/lessons.server.ts";

test("lesson status preserves progress and completion while enforcing locks", () => {
	assert.equal(deriveLessonStatus(null, false), "locked");
	assert.equal(deriveLessonStatus(null, true), "available");
	assert.equal(deriveLessonStatus("in_progress", false), "in_progress");
	assert.equal(deriveLessonStatus("completed", false), "completed");
});

test("lesson progress is based on the current viewed card", () => {
	assert.equal(calculateLessonProgress("locked", 0, 4), 0);
	assert.equal(calculateLessonProgress("available", 0, 4), 0);
	assert.equal(calculateLessonProgress("in_progress", 0, 4), 25);
	assert.equal(calculateLessonProgress("in_progress", 2, 4), 75);
	assert.equal(calculateLessonProgress("in_progress", 99, 4), 100);
	assert.equal(calculateLessonProgress("completed", 0, 4), 100);
});

test("finishing the final lesson advances only the active curriculum level", () => {
	assert.equal(levelAfterCompletion(0, 0, true), 1);
	assert.equal(levelAfterCompletion(1, 1, true), 2);
	assert.equal(levelAfterCompletion(2, 2, true), 2);
	assert.equal(levelAfterCompletion(1, 0, true), 1);
	assert.equal(levelAfterCompletion(0, 0, false), 0);
});
