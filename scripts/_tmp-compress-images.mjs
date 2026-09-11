import { readdir, stat, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";

const root = "/home/dionfananie/hangeuloo-oppia/public";

async function collect(dir, files = []) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) await collect(full, files);
		else if (extname(entry.name).toLowerCase() === ".png") files.push(full);
	}
	return files;
}

const files = await collect(root);
let totalBefore = 0;
let totalAfter = 0;
let skipped = 0;
let errors = 0;

for (const file of files) {
	try {
		const before = (await stat(file)).size;
		const buffer = await sharp(file)
			.png({
				palette: true,
				colours: 256,
				quality: 90,
				compressionLevel: 9,
				effort: 10,
				adaptiveFiltering: true,
			})
			.toBuffer();
		totalBefore += before;
		if (buffer.length < before) {
			await writeFile(file, buffer);
			totalAfter += buffer.length;
			console.log(
				`${file.replace(root + "/", "")}: ${before} -> ${buffer.length} (${Math.round((1 - buffer.length / before) * 100)}%)`,
			);
		} else {
			totalAfter += before;
			skipped++;
		}
	} catch (err) {
		errors++;
		console.error(`ERROR ${file}: ${err.message}`);
	}
}

console.log(
	`\nTotal: ${totalBefore} -> ${totalAfter} bytes (saved ${Math.round((1 - totalAfter / totalBefore) * 100)}%) | files ${files.length} | skipped ${skipped} | errors ${errors}`,
);
