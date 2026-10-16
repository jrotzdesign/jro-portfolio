// Runs before `astro build` (and `astro dev`):
//  1. a 1200×630 social card per project, cropped from its image → public/og/<slug>.jpg (git-ignored, rebuilt as needed)
//  2. src/data/img-dims.json: intrinsic width/height of every image in public/img, so every <img> can carry
//     width/height and nothing shifts as it loads
//  3. a guard that /og.jpg itself is 1200×630
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { projects } from '../src/data/projects.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const OG_W = 1200, OG_H = 630, MAX_BYTES = 300 * 1024;

// 1 — social cards, rebuilt from scratch each time (12 images, a second or two): a card always matches its project's
// current image, and a removed project's card goes away
fs.rmSync(path.join(PUB, 'og'), { recursive: true, force: true });
fs.mkdirSync(path.join(PUB, 'og'), { recursive: true });
let made = 0;
for (const p of projects) {
  if (!p.img) continue;
  const src = path.join(PUB, p.img), out = path.join(PUB, 'og', `${p.slug}.jpg`);
  let q = 84, buf;
  do {
    buf = await sharp(src).resize(OG_W, OG_H, { fit: 'cover', position: sharp.strategy.attention })
      .flatten({ background: '#f2f3f0' }).jpeg({ quality: q, mozjpeg: true, progressive: true }).toBuffer();
    q -= 6;
  } while (buf.length > MAX_BYTES && q >= 50);
  if (buf.length > MAX_BYTES) throw new Error(`og card for ${p.slug} is still ${Math.round(buf.length / 1024)} KB`);
  fs.writeFileSync(out, buf);
  made++;
}

// 2 — image dimensions
const dims = {};
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
  const f = path.join(dir, d.name);
  if (d.isDirectory()) return walk(f);
  if (/\.(webp|jpe?g|png|avif)$/i.test(d.name)) dims['/' + path.relative(PUB, f).split(path.sep).join('/')] = f;
});
walk(path.join(PUB, 'img'));
const out = {};
for (const [key, f] of Object.entries(dims).sort()) { const m = await sharp(f).metadata(); out[key] = [m.width, m.height]; }
const json = JSON.stringify(out, null, 0).replace(/\],"/g, '],\n"').replace('{"', '{\n"').replace(/\]\}$/, ']\n}') + '\n';
const target = path.join(ROOT, 'src/data/img-dims.json');
if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== json) fs.writeFileSync(target, json);

// 3 — the site-wide card
const og = await sharp(path.join(PUB, 'og.jpg')).metadata();
if (og.width !== OG_W || og.height !== OG_H) throw new Error(`public/og.jpg is ${og.width}×${og.height}, not ${OG_W}×${OG_H}`);

console.log(`prebuild: ${made} social card(s) written, ${Object.keys(out).length} image sizes recorded, og.jpg ${og.width}×${og.height}`);
