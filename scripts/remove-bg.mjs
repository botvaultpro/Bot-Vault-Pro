/**
 * Aggressive background removal for BVP mascot.
 * Strategy:
 *   1. BFS flood-fill from ALL edge pixels using Manhattan-distance tolerance 180.
 *      This handles the dark navy→dark-blue gradient background.
 *   2. Second pass: any remaining pixel that is "background-like"
 *      (dark, blue-shifted, low brightness) and has ≥3 transparent neighbours
 *      gets removed too — catches interior background pockets.
 *   3. Edge feathering for smooth blending on the site.
 */
import sharp from "sharp";
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

// Seed color = top-left corner
const seedR = buf[0], seedG = buf[1], seedB = buf[2];
console.log(`Seed color: R=${seedR} G=${seedG} B=${seedB}`);

// Manhattan distance from seed (generous — must catch gradient up to ~10,35,91)
const TOLERANCE = 180;

function manhattan(r, g, b) {
  return Math.abs(r - seedR) + Math.abs(g - seedG) + Math.abs(b - seedB);
}

const transparent = new Uint8Array(width * height); // 1 = background

// ---------- Pass 1: BFS flood-fill from all edges ----------
const queue = new Int32Array(width * height);
let head = 0, tail = 0;

function tryEnqueue(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = y * width + x;
  if (transparent[idx]) return;
  const p = idx * channels;
  if (manhattan(buf[p], buf[p + 1], buf[p + 2]) <= TOLERANCE) {
    transparent[idx] = 1;
    queue[tail++] = idx;
  }
}

// Seed from every edge pixel
for (let x = 0; x < width; x++) { tryEnqueue(x, 0); tryEnqueue(x, height - 1); }
for (let y = 0; y < height; y++) { tryEnqueue(0, y); tryEnqueue(width - 1, y); }

while (head < tail) {
  const i = queue[head++];
  const x = i % width, y = Math.floor(i / width);
  tryEnqueue(x + 1, y);
  tryEnqueue(x - 1, y);
  tryEnqueue(x, y + 1);
  tryEnqueue(x, y - 1);
}
console.log(`Pass 1 BFS: ${tail} pixels removed`);

// ---------- Pass 2: Remove isolated dark-background pockets ----------
// Dark-background heuristic: very dark, blue channel dominant.
function isBackgroundLike(r, g, b) {
  const brightness = r + g + b;
  return brightness < 270 && b > r * 1.4 && b > g * 1.1;
}

let pass2 = 0;
let changed = true;
while (changed) {
  changed = false;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (transparent[idx]) continue;
      const p = idx * channels;
      if (!isBackgroundLike(buf[p], buf[p + 1], buf[p + 2])) continue;
      // Count transparent neighbours (4-connected)
      const tNeighbours =
        (transparent[(y - 1) * width + x] || 0) +
        (transparent[(y + 1) * width + x] || 0) +
        (transparent[y * width + (x - 1)] || 0) +
        (transparent[y * width + (x + 1)] || 0);
      if (tNeighbours >= 1) {
        transparent[idx] = 1;
        pass2++;
        changed = true;
      }
    }
  }
}
console.log(`Pass 2 pocket cleanup: ${pass2} additional pixels removed`);

// ---------- Apply transparency + edge feathering ----------
for (let i = 0; i < width * height; i++) {
  if (transparent[i]) {
    buf[i * channels + 3] = 0;
  }
}

// Feather: partially fade foreground pixels with ≥1 transparent 4-neighbour
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * width + x;
    if (transparent[idx]) continue;
    const tNeighbours =
      (transparent[(y - 1) * width + x] || 0) +
      (transparent[(y + 1) * width + x] || 0) +
      (transparent[y * width + (x - 1)] || 0) +
      (transparent[y * width + (x + 1)] || 0);
    if (tNeighbours >= 3) buf[idx * channels + 3] = 80;
    else if (tNeighbours === 2) buf[idx * channels + 3] = 160;
    else if (tNeighbours === 1) buf[idx * channels + 3] = 220;
  }
}

await sharp(buf, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Saved: ${outputPath}`);
