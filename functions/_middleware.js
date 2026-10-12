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

export async function onRequest({ request, env, next }) {
  const password = env.SITE_PASSWORD;
  if (!password) return next();                                    // gate off
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

  if (authed) return next();
  if (url.pathname === '/favicon.svg') return next();
  return new Response(gatePage(), { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
