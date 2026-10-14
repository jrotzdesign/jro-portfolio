// Password gate for the whole site (Cloudflare Pages Function).
// Every request without a valid cookie gets the gate page instead of the site. The gate POSTs the word to /__gate;
// a correct word sets a signed, HttpOnly cookie for 30 days. Set the word with:
//   npx wrangler pages secret put SITE_PASSWORD --project-name jro-portfolio
// Leave SITE_PASSWORD unset to disable the gate entirely (useful for previews).
import { gatePage } from './gate.js';

const COOKIE = 'jro_gate';
const MAX_AGE = 60 * 60 * 24 * 30;

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const token = (secret) => hmac(secret, 'jro-gate-v1');
const safeEqual = (a, b) => a.length === b.length && [...a].every((c, i) => c === b[i]);

// Unlocked responses must never land in Cloudflare's shared edge cache (a cached image would be served to anyone),
// so public, immutable becomes private, immutable: browsers still keep assets for a year, the CDN stops sharing them.
function privatize(res) {
  const out = new Response(res.body, res);
  const cc = out.headers.get('Cache-Control') || '';
  out.headers.set('Cache-Control', cc ? cc.replace(/\bpublic\b/, 'private') : 'private, no-cache');
  if (!/\bprivate\b/.test(out.headers.get('Cache-Control'))) out.headers.set('Cache-Control', 'private, ' + out.headers.get('Cache-Control'));
  out.headers.set('Vary', 'Cookie');
  out.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return noStoreHtml(out);
}

// HTML is never kept at the edge: pages come and go (removed projects, the 404), and a stale copy must not outlive a deploy.
// Assets (/img, /_astro, /motion, fonts) keep their long-lived headers.
function noStoreHtml(res) {
  if (!/text\/html/i.test(res.headers.get('Content-Type') || '')) return res;
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'private, no-store');
  return out;
}

export async function onRequest({ request, env, next }) {
  const password = env.SITE_PASSWORD;
  if (!password) return noStoreHtml(await next());                  // gate off
  const url = new URL(request.url);
  const expected = await token(password);
  const cookies = Object.fromEntries((request.headers.get('Cookie') || '').split(';').map((c) => c.trim().split('=')));
  const authed = cookies[COOKIE] && safeEqual(cookies[COOKIE], expected);

  if (url.pathname === '/__gate') {
    if (request.method !== 'POST') return Response.redirect(url.origin + '/', 302);
    const form = await request.formData();
    const word = String(form.get('word') || '').trim().toLowerCase();
    const ok = safeEqual(word, password.toLowerCase());
    if (!ok) return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }
  if (url.pathname === '/__gate/leave') {
    return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }

  if (authed) return privatize(await next());
  if (url.pathname === '/favicon.svg' || url.pathname === '/robots.txt') return next();
  return new Response(gatePage(), { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
}
