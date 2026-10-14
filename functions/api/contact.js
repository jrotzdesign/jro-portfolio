// POST /api/contact — sends the contact form as a plain-text email through the Cloudflare Email Service.
// Secrets/vars (Pages project settings): CF_EMAIL_TOKEN (secret), CF_ACCOUNT_ID, optional CONTACT_TO.
// The gate middleware in ../_middleware.js already sits in front of this route.
// The token and the visitor's message are never logged.

const TOPICS = ['Brand identity', 'Website', 'Motion', 'Something else'];
const DEFAULT_TO = 'jrotz.design@gmail.com';
// local part, then a domain of 2+ dot-separated labels (no empty labels: a@.b.co and a@b..com fail)
const EMAIL_RE = /^[^\s@<>,;:"()[\]\\]+@[^\s@<>,;:"()[\]\\.]+(\.[^\s@<>,;:"()[\]\\.]+)*\.[^\s@<>,;:"()[\]\\.]{2,}$/;

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', ...extra } });

// a header-safe single line
const LINEBREAKS = new RegExp('[\\r\\n\\u2028\\u2029]+', 'g');
const line = (s) => String(s).replace(LINEBREAKS, ' ').trim();

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ ok: false }, 405, { Allow: 'POST' });
  // browsers always send Origin on a cross-site POST: refuse one that is not this site (a script with no Origin is stopped by the gate)
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false }, 403);

  let data;
  try { data = await request.json(); } catch { return json({ ok: false }, 400); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ ok: false }, 400);

  // honeypot: a person never sees this field. Pretend it worked, send nothing.
  if (typeof data.company === 'string' && data.company.trim() !== '') return json({ ok: true });

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  const topic = data.topic == null ? '' : data.topic;
  if (!name || name.length > 100) return json({ ok: false }, 400);
  if (!email || email.length >= 200 || !EMAIL_RE.test(email)) return json({ ok: false }, 400);
  if (!message || message.length > 4000) return json({ ok: false }, 400);
  if (typeof topic !== 'string' || (topic !== '' && !TOPICS.includes(topic))) return json({ ok: false }, 400);

  if (!env.CF_EMAIL_TOKEN || !env.CF_ACCOUNT_ID) return json({ ok: false, reason: 'not-configured' }, 503);

  const sentFrom = typeof data.page === 'string' && data.page.startsWith('/') && data.page.length <= 200 ? data.page : (request.headers.get('Referer') || 'unknown').slice(0, 200);
  const when = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'long' }).format(new Date());
  const text = [
    `Name: ${line(name)}`,
    `Email: ${line(email)}`,
    `Topic: ${topic || '(not chosen)'}`,
    `Sent: ${when}`,
    `From page: ${line(sentFrom)}`,
    '',
    message,
    '',
  ].join('\n');

  const payload = {
    to: env.CONTACT_TO || DEFAULT_TO,
    // REST field names (the Workers binding spells these `replyTo` and uses `email`): developers.cloudflare.com/email-service/api/send-emails/rest-api/
    from: { address: 'contact@jrortizdesign.com', name: 'jrortizdesign.com' },
    reply_to: { address: line(email), name: line(name) },
    subject: `Portfolio inquiry — ${line(name)}${topic ? ` · ${topic}` : ''}`,
    text,
  };

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CF_EMAIL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      // status and API error code only: never the token, never the visitor's message
      console.error('contact: email API error', res.status, body && body.errors && body.errors[0] ? body.errors[0].code : 'no-code');
      return json({ ok: false }, 502);
    }
    const out = await res.json().catch(() => null);
    const delivered = Array.isArray(out?.result?.delivered) ? out.result.delivered.length : 0;
    const queued = Array.isArray(out?.result?.queued) ? out.result.queued.length : 0;
    return json({ ok: true, delivered: delivered > 0, queued: queued > 0 });
  } catch {
    console.error('contact: email API unreachable');
    return json({ ok: false }, 502);
  }
}
