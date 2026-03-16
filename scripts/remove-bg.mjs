import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "BVP Bot.jpeg");
const outputPath = join(root, "public", "mascot.png");

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const buf = Buffer.from(data);

// Sample the top-left corner for the seed background color
const seedR = buf[0], seedG = buf[1], seedB = buf[2];
console.log(`Background seed color: R=${seedR} G=${seedG} B=${seedB}`);

const TOLERANCE = 55; // per-channel tolerance

function colorDistance(r, g, b) {
  return Math.abs(r - seedR) + Math.abs(g - seedG) + Math.abs(b - seedB);
}

// BFS flood fill from all four corners
const visited = new Uint8Array(width * height);
const queue = [];

function enqueue(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const i = y * width + x;
  if (visited[i]) return;
  const p = i * channels;
  if (colorDistance(buf[p], buf[p + 1], buf[p + 2]) <= TOLERANCE) {
    visited[i] = 1;
    queue.push(i);
  }
}

// Seed from all edges for robustness
for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

let head = 0;
while (head < queue.length) {
  const i = queue[head++];
  const x = i % width;
  const y = Math.floor(i / width);
  enqueue(x + 1, y);
  enqueue(x - 1, y);
  enqueue(x, y + 1);
  enqueue(x, y - 1);
}

console.log(`Flood fill complete — ${queue.length} background pixels found`);

// Mark background pixels transparent
for (let i = 0; i < queue.length; i++) {
  buf[queue[i] * channels + 3] = 0;
}

// Light edge feathering: partially fade pixels adjacent to the mask boundary
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const i = y * width + x;
    if (visited[i]) continue; // already background
    // Check neighbors — if any neighbor is background, soften alpha
    const neighbors = [
      visited[(y - 1) * width + x],
      visited[(y + 1) * width + x],
      visited[y * width + (x - 1)],
      visited[y * width + (x + 1)],
    ];
    const bgNeighbors = neighbors.filter(Boolean).length;
    if (bgNeighbors >= 2) {
      buf[i * channels + 3] = Math.min(buf[i * channels + 3], 120);
    } else if (bgNeighbors === 1) {
      buf[i * channels + 3] = Math.min(buf[i * channels + 3], 200);
    }
  }
}

// Save result
await sharp(buf, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Saved: ${outputPath}`);
