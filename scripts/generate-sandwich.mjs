import { deflateSync } from "node:zlib";
import { writeFile } from "node:fs/promises";

const size = 300;
const pixels = Buffer.alloc(size * size * 4);
const colors = {
	navy: [40, 50, 74, 255],
	cream: [255, 248, 232, 255],
	yellow: [255, 212, 101, 255],
	pink: [255, 183, 184, 255],
	mint: [169, 229, 195, 255],
	purple: [108, 81, 204, 255],
};

function setPixel(x, y, color) {
	if (x < 0 || y < 0 || x >= size || y >= size) return;
	const offset = (y * size + x) * 4;
	pixels.set(color, offset);
}

function fillShape(test, color) {
	for (let y = 0; y < size; y += 1) {
		for (let x = 0; x < size; x += 1) {
			if (test(x, y)) setPixel(x, y, color);
		}
	}
}

function roundedRect(left, top, right, bottom, radius, color) {
	fillShape((x, y) => {
		const cx = x < left + radius ? left + radius : x > right - radius ? right - radius : x;
		const cy = y < top + radius ? top + radius : y > bottom - radius ? bottom - radius : y;
		return x >= left && x <= right && y >= top && y <= bottom && (x >= left + radius && x <= right - radius || y >= top + radius && y <= bottom - radius || (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2);
	}, color);
}

function ellipse(cx, cy, rx, ry, color) {
	fillShape((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, color);
}

function polygon(points, color) {
	fillShape((x, y) => {
		let inside = false;
		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const [xi, yi] = points[i];
			const [xj, yj] = points[j];
			if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
		}
		return inside;
	}, color);
}

// Soft grounding ellipse.
ellipse(150, 249, 80, 12, [40, 50, 74, 32]);

// Bottom bread slice with a navy outline and cream crumb.
polygon([[58, 187], [230, 187], [247, 219], [225, 241], [79, 241], [53, 218]], colors.navy);
polygon([[65, 190], [224, 190], [238, 216], [218, 233], [84, 233], [62, 216]], colors.cream);
roundedRect(83, 215, 102, 222, 4, colors.yellow);
roundedRect(181, 214, 202, 221, 4, colors.yellow);

// Lettuce layer.
polygon([[53, 176], [234, 176], [242, 194], [225, 202], [207, 196], [187, 204], [166, 196], [143, 204], [120, 196], [97, 203], [75, 195], [57, 199]], colors.navy);
polygon([[59, 178], [229, 178], [234, 191], [222, 196], [207, 190], [187, 198], [166, 190], [143, 198], [120, 190], [98, 197], [77, 190], [61, 194]], colors.mint);

// Tomato and cheese fillings.
roundedRect(62, 155, 232, 183, 8, colors.navy);
roundedRect(68, 159, 226, 177, 5, colors.pink);
polygon([[57, 142], [239, 142], [232, 163], [63, 163]], colors.navy);
polygon([[63, 147], [233, 147], [228, 158], [68, 158]], colors.yellow);

// Top bread slice, tilted slightly for a friendly 3/4 view.
polygon([[47, 133], [68, 75], [93, 53], [210, 53], [245, 83], [252, 135]], colors.navy);
polygon([[57, 130], [76, 80], [97, 63], [207, 63], [235, 86], [241, 130]], colors.yellow);
polygon([[75, 81], [96, 65], [205, 65], [229, 85], [225, 96], [84, 96]], colors.cream);

// Bread highlights and sesame-like crumbs.
ellipse(101, 78, 7, 3, colors.cream);
ellipse(133, 70, 5, 3, colors.cream);
ellipse(174, 77, 7, 3, colors.cream);
ellipse(204, 88, 5, 3, colors.cream);

// Small purple sparkle accent.
polygon([[254, 67], [258, 78], [269, 82], [258, 86], [254, 98], [250, 86], [239, 82], [250, 78]], colors.purple);

function chunk(type, data) {
	const bytes = Buffer.alloc(8 + data.length);
	bytes.writeUInt32BE(data.length, 0);
	bytes.write(type, 4);
	data.copy(bytes, 8);
	let crc = 0xffffffff;
	for (const byte of bytes.subarray(4)) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
	}
	const result = Buffer.alloc(bytes.length + 4);
	bytes.copy(result);
	result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, bytes.length);
	return result;
}

const scanlines = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y += 1) {
	scanlines[y * (size * 4 + 1)] = 0;
	pixels.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
}
const png = Buffer.concat([
	Buffer.from("89504e470d0a1a0a", "hex"),
	chunk("IHDR", (() => { const data = Buffer.alloc(13); data.writeUInt32BE(size, 0); data.writeUInt32BE(size, 4); data[8] = 8; data[9] = 6; return data; })()),
	chunk("IDAT", deflateSync(scanlines)),
	chunk("IEND", Buffer.alloc(0)),
]);

await writeFile("public/section-02-v1/0024-sandwich.png", png);
console.log("Created public/section-02-v1/0024-sandwich.png");
