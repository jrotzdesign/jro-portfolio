// After `astro build`: checks every page in dist/ for the things search engines and share previews need, and fails
// the build if one is missing. Titles < 60 chars, descriptions 120–160, one h1, canonical + og:url, a 1200×630
// og:image that exists, robots meta (only the 404 is noindex), JSON-LD that parses and has the fields schema.org
// expects, alt + width/height on every <img>, and a sitemap that lists every page but the 404.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://jrortizdesign.com';
const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

const pages = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
  const f = path.join(dir, d.name);
  if (d.isDirectory()) walk(f);
  else if (d.name.endsWith('.html')) pages.push(f);
});
walk(DIST);

const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`)); return m ? m[1] : null; };
const meta = (html, key, kind = 'name') => { const m = html.match(new RegExp(`<meta[^>]*${kind}="${key}"[^>]*>`)); return m ? attr(m[0], 'content') : null; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#38;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const urlPath = (f) => '/' + path.relative(DIST, f).split(path.sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '/');

const PERSON = ['name', 'alternateName', 'jobTitle', 'url', 'image', 'email', 'sameAs', 'address', 'knowsAbout'];
const ogChecked = new Map();
const indexed = [];

for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  const page = urlPath(f);
  const is404 = page === '/404/';
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode(meta(html, 'description') || '');
  const robots = meta(html, 'robots');
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];

  if (!title) fail(page, 'no <title>');
  else if (title.length >= 60) fail(page, `title is ${title.length} chars: ${title}`);
  if (!is404 && (desc.length < 120 || desc.length > 160)) fail(page, `description is ${desc.length} chars`);
  if (!is404 && !/[.!?…”]$/.test(desc)) fail(page, 'description does not end as a sentence');
  if (is404 ? robots !== 'noindex, follow' : robots !== 'index, follow') fail(page, `robots meta is "${robots}"`);
  if (!is404) indexed.push(page);
  if (!is404 && canonical !== SITE + page) fail(page, `canonical is ${canonical}`);
  if (is404 && (canonical || meta(html, 'og:url', 'property'))) fail(page, 'the 404 page must not declare a canonical or og:url');
  if (!is404 && meta(html, 'og:url', 'property') !== canonical) fail(page, 'og:url differs from canonical');
  for (const k of ['og:title', 'og:description', 'og:image', 'og:site_name', 'og:locale']) if (!meta(html, k, 'property')) fail(page, `missing ${k}`);
  for (const k of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) if (!meta(html, k)) fail(page, `missing ${k}`);

  // og:image must be a real 1200×630 file in the build
  const og = meta(html, 'og:image', 'property') || '';
  if (!og.startsWith(SITE + '/')) fail(page, `og:image is not absolute on ${SITE}: ${og}`);
  else {
    const file = path.join(DIST, og.slice(SITE.length));
    if (!ogChecked.has(file)) ogChecked.set(file, fs.existsSync(file) ? await sharp(file).metadata().then((m) => `${m.width}x${m.height}`) : 'missing');
    if (ogChecked.get(file) !== '1200x630') fail(page, `og:image ${og} is ${ogChecked.get(file)}`);
  }

  // Mozart&Co. as a current employer: only project pages may name it (as where that work was done)
  const isProjectPage = /^\/work\/[^/]+\/$/.test(page);
  const shareValues = [title, desc, ...[...html.matchAll(/<meta[^>]*(?:property|name)="(?:og|twitter):[^"]*"[^>]*>/g)].map((m) => decode(attr(m[0], 'content') || ''))];
  if (!isProjectPage && shareValues.some((v) => /mozart/i.test(v))) fail(page, 'title/description/og/twitter names Mozart&Co.');

  // one h1
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(page, `${h1} <h1> elements`);

  // images: alt attribute always, and intrinsic size
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    const src = attr(img, 'src');
    if (attr(img, 'alt') === null && !/\salt(\s|>|\/)/.test(img)) fail(page, `<img ${src}> has no alt`);
    if (!attr(img, 'width') || !attr(img, 'height')) fail(page, `<img ${src}> has no width/height`);
  }

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const nodes = [];
  for (const b of blocks) {
    try { const j = JSON.parse(b); if (j['@context'] !== 'https://schema.org') fail(page, 'JSON-LD @context'); nodes.push(...(j['@graph'] || [j])); }
    catch (e) { fail(page, `JSON-LD does not parse: ${e.message}`); }
  }
  const of = (t) => nodes.filter((n) => n['@type'] === t);
  const isProject = /^\/work\/[^/]+\/$/.test(page);
  const want = page === '/' ? ['Person', 'WebSite'] : page === '/contact/' ? ['Person'] : isProject ? ['CreativeWork', 'BreadcrumbList', 'Person'] : [];
  for (const t of want) if (of(t).length !== 1) fail(page, `expected one ${t} in JSON-LD, found ${of(t).length}`);
  for (const p of of('Person')) {
    for (const k of PERSON) if (p[k] == null || (Array.isArray(p[k]) && !p[k].length)) fail(page, `Person.${k} missing`);
    if (p.worksFor || /mozart/i.test(JSON.stringify(p))) fail(page, 'Person names Mozart&Co. (worksFor / jobTitle)');
  }
  for (const w of of('CreativeWork')) {
    for (const k of ['name', 'description', 'image', 'url', 'creator']) if (!w[k]) fail(page, `CreativeWork.${k} missing`);
    if (w.url !== canonical) fail(page, 'CreativeWork.url differs from canonical');
    if (w.creator && w.creator['@id'] !== `${SITE}/#person`) fail(page, 'CreativeWork.creator is not the Person');
  }
  for (const bl of of('BreadcrumbList')) {
    const items = bl.itemListElement || [];
    items.forEach((it, i) => { if (it.position !== i + 1 || !/^https:\/\//.test(it.item || '') || !it.name) fail(page, `breadcrumb ${i + 1} malformed`); });
    if (items.at(-1)?.item !== canonical) fail(page, 'last breadcrumb is not this page');
  }
}

// sitemap: every indexed page, never the 404
const sm = fs.readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f)).map((f) => fs.readFileSync(path.join(DIST, f), 'utf8')).join('');
if (!fs.existsSync(path.join(DIST, 'sitemap-index.xml'))) errors.push('sitemap-index.xml missing');
const locs = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '')));
for (const p of indexed) if (!locs.has(p)) errors.push(`sitemap is missing ${p}`);
if ([...locs].some((l) => l.includes('404'))) errors.push('sitemap lists the 404 page');
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
if (!/Allow: \//.test(robots) || /Disallow: \/\s/.test(robots) || !robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) errors.push('robots.txt is not "Allow: /" with the sitemap');

if (errors.length) { console.error(`check-seo: ${errors.length} problem(s)\n  ` + errors.join('\n  ')); process.exit(1); }
console.log(`check-seo: ${pages.length} pages OK (${indexed.length} indexed + 404), sitemap ${locs.size} URLs, ${ogChecked.size} social cards 1200×630`);
