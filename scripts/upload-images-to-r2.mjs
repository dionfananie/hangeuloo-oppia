import { execFile } from "node:child_process";
import { readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const wranglerBin = resolve(projectRoot, "node_modules/.bin/wrangler");
const bucket = "oppia-world-assets";
const defaultFolders = ["03-04", "05", "06", "batch-08", "batch-09", "batch-10", "batch-11", "batch-12"];
const defaultConcurrency = 10;

function parseArguments() {
	const args = process.argv.slice(2);
	const concurrencyIndex = args.indexOf("--concurrency");

	return {
		folders: args.filter((arg, index) => index !== concurrencyIndex && arg !== args[concurrencyIndex + 1]),
		concurrency:
			concurrencyIndex === -1 ? defaultConcurrency : Number(args[concurrencyIndex + 1]) || defaultConcurrency,
	};
}

async function collectPngs(folder) {
	const dir = resolve(projectRoot, "public", folder);
	const entries = await readdir(dir, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".png")
		.map((entry) => resolve(dir, entry.name));
}

async function uploadOne(file) {
	const key = `images/${file.split("/").pop()}`;
	const { stdout, stderr } = await execFileAsync(
		wranglerBin,
		["r2", "object", "put", `${bucket}/${key}`, "--file", file, "--content-type", "image/png", "--remote"],
		{ cwd: projectRoot },
	);

	if (stderr && !stderr.includes("Upload complete")) {
		throw new Error(stderr.trim());
	}

	return { key, stdout };
}

async function runWithConcurrency(items, limit, worker) {
	const results = [];
	let cursor = 0;

	async function run() {
		while (cursor < items.length) {
			const current = items[cursor];
			cursor += 1;
			results.push(await worker(current));
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
	return results;
}

const { folders, concurrency } = parseArguments();
const targets = folders.length > 0 ? folders : defaultFolders;

const files = [];
for (const folder of targets) {
	files.push(...(await collectPngs(folder)));
}

let success = 0;
let failed = 0;
const startedAt = Date.now();

await runWithConcurrency(files, concurrency, async (file) => {
	try {
		const { key } = await uploadOne(file);
		success += 1;
		process.stdout.write(`ok   ${key}\n`);
	} catch (error) {
		failed += 1;
		process.stdout.write(`FAIL ${file} -> ${error.message}\n`);
	}
});

const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`\nUploaded ${success}/${files.length} to ${bucket}/images/ in ${seconds}s (${failed} failed)`);

if (failed > 0) {
	process.exitCode = 1;
}
