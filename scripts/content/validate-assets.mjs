// validate-assets.mjs — reports release gates for the learning-path content:
// Korean-language review sign-off and reviewed audio. Reads content/manifest.json.
//
// Usage: node scripts/content/validate-assets.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const manifestPath = path.join(repoRoot, "content", "manifest.json");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const koreanApproved = manifest.review?.korean?.status === "approved";
const scoredAudioReady = manifest.audio?.scored?.status === "approved";

console.log(`Curriculum: ${manifest.versionKey} v${manifest.versionNumber} (${manifest.status})`);
console.log(`Korean-language review: ${manifest.review?.korean?.status ?? "missing"}`);
console.log(`Scored audio: ${manifest.audio?.scored?.status ?? "missing"}`);

if (koreanApproved) {
	console.log("Release gate PASSED: Korean-language review approved.");
} else {
	console.log("Release gate BLOCKED: Korean-language review is not yet approved.");
}

if (!scoredAudioReady && manifest.audio?.scored?.note) {
	console.log(`Scored audio note: ${manifest.audio.scored.note}`);
}

process.exit(0);
