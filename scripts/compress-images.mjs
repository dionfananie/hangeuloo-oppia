import { readdir, stat, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";

const projectRoot = resolve(import.meta.dirname, "..");

const pngOptions = {
	palette: true,
	colours: 256,
	quality: 90,
	compressionLevel: 9,
	effort: 10,
	adaptiveFiltering: true,
};

function parseArguments() {
	const args = process.argv.slice(2);
	const allIndex = args.indexOf("--all");

	return {
		all: allIndex !== -1,
		target: args.filter((arg, index) => index !== allIndex)[0],
	};
}

async function collectPngs(dir, files = []) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) await collectPngs(full, files);
		else if (extname(entry.name).toLowerCase() === ".png") files.push(full);
	}
	return files;
}

async function compress(file) {
	const before = (await stat(file)).size;
	const buffer = await sharp(file).png(pngOptions).toBuffer();

	if (buffer.length >= before) {
		return { file, before, after: before, saved: 0, skipped: true };
	}

	await writeFile(file, buffer);
	return { file, before, after: buffer.length, saved: 1 - buffer.length / before, skipped: false };
}

const { all, target } = parseArguments();
const targetPath = resolve(projectRoot, target);
const isDirectory = (await stat(targetPath)).isDirectory();
const files = all
	? await collectPngs(resolve(projectRoot, "public"))
	: isDirectory
		? await collectPngs(targetPath)
		: [targetPath];

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
	const result = await compress(file);
	totalBefore += result.before;
	totalAfter += result.after;
	const label = result.file.replace(`${projectRoot}/`, "");
	console.log(
		result.skipped
			? `${label}: already optimal (${result.before} bytes)`
			: `${label}: ${result.before} -> ${result.after} bytes (saved ${Math.round(result.saved * 100)}%)`,
	);
}

console.log(
	`\nTotal: ${totalBefore} -> ${totalAfter} bytes (saved ${Math.round((1 - totalAfter / totalBefore) * 100)}%) | files ${files.length}`,
);
