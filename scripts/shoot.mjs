// Capture hi-res card images for projects that only have a URL (local dev server or live site).
// Usage: node scripts/shoot.mjs <slug> <url> [selector-to-wait-for]
//   → public/img/<slug>.webp (1600×1200, 4:3, 2× DPR) and public/img/gallery/<slug>--01.webp (full page, wide)
// Then set `img: '/img/<slug>.webp'` on the project in src/data/projects.js.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';

const [slug, url, waitFor] = process.argv.slice(2);
if (!slug || !url) { console.error('usage: node scripts/shoot.mjs <slug> <url> [selector]'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
if (waitFor) await page.waitForSelector(waitFor, { timeout: 30000 });
await page.waitForTimeout(2500); // let intro animations finish
const card = await page.screenshot({ type: 'png' });
await page.setViewportSize({ width: 1600, height: 900 });
const wide = await page.screenshot({ type: 'png' });
await browser.close();

fs.mkdirSync('public/img/gallery', { recursive: true });
await sharp(card).resize(1600, 1200).webp({ quality: 84 }).toFile(`public/img/${slug}.webp`);
await sharp(wide).resize(1600, 900).webp({ quality: 84 }).toFile(`public/img/gallery/${slug}--01.webp`);
console.log(`wrote public/img/${slug}.webp and public/img/gallery/${slug}--01.webp`);
