import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = resolve(root, "public/500words.json");
const outputDir = resolve(root, "public/word-batches");
const perSection = 20;

function slugify(value) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function pad(value, length = 2) {
	return String(value).padStart(length, "0");
}

const words = JSON.parse(await readFile(sourceFile, "utf8"));
words.sort((a, b) => a.id - b.id);

if (words.length !== 500) {
	throw new Error(`Expected 500 words, found ${words.length}`);
}

const sections = [];
for (let index = 0; index < words.length; index += perSection) {
	sections.push(words.slice(index, index + perSection));
}

await mkdir(outputDir, { recursive: true });

const manifest = {
	total: words.length,
	sections: sections.length,
	perSection,
	imageDir: "public/images/words/",
	imagePattern: "{id:04d}-{slug}.png",
	batches: [],
};

for (let index = 0; index < sections.length; index += 1) {
	const section = index + 1;
	const fileName = `batch-${pad(section)}.json`;
	const entries = sections[index].map((word) => ({
		id: word.id,
		category: word.category,
		en: word.en,
		ko: word.ko,
		image: `${pad(word.id, 4)}-${slugify(word.en)}.png`,
	}));
	await writeFile(resolve(outputDir, fileName), `${JSON.stringify(entries, null, 2)}\n`);
	manifest.batches.push({
		section,
		file: fileName,
		fromId: entries[0].id,
		toId: entries[entries.length - 1].id,
		count: entries.length,
	});
}

await writeFile(resolve(outputDir, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${sections.length} batches (${words.length} words) to public/word-batches/`);
