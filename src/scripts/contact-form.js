// The contact form on /contact/: client-side checks, then fetch() to /api/contact without reloading.
// Errors and success are announced through the #cf-status live region.
import { EMAIL as MAIL } from '../data/site.js';

// must match functions/api/contact.js: the server silently drops anything sent < 3 s or > 2 h after the form loaded
const MIN_MS = 3000, MAX_MS = 2 * 60 * 60 * 1000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function initContactForm(root = document) {
  const form = root.querySelector('#cform');
  if (!form) return () => {};
  const status = root.querySelector('#cf-status');
  // time trap: when the form appeared (the visitor's own clock; the server checks only the gap to the submit time)
  if (form.elements.jro_ts) form.elements.jro_ts.value = String(Date.now());
  const button = form.querySelector('button[type="submit"]');
  const fields = { name: form.elements.name, email: form.elements.email, message: form.elements.message };
  const messages = { name: 'Add your name.', email: 'Add an email address I can reply to.', message: 'Add a message.' };

  const setError = (key, text) => {
    const el = fields[key], out = form.querySelector(`#err-${key}`);
    el.setAttribute('aria-invalid', text ? 'true' : 'false');
    out.textContent = text;
  };
  const check = () => {
    let first = null;
    for (const key of Object.keys(fields)) {
      const el = fields[key];
      const bad = !el.value.trim() || (key === 'email' && !el.checkValidity());
      setError(key, bad ? messages[key] : '');
      if (bad && !first) first = el;
    }
    return first;
  };
  // clear a field's error as soon as it is fixed
  const inputs = Object.keys(fields).map((key) => {
    const fn = () => { if (fields[key].getAttribute('aria-invalid') === 'true' && fields[key].value.trim() && (key !== 'email' || fields[key].checkValidity())) setError(key, ''); };
    fields[key].addEventListener('input', fn);
    return () => fields[key].removeEventListener('input', fn);
  });

  const fail = () => {
    status.replaceChildren('That didn’t go through. Email me directly at ');
    const a = document.createElement('a');
    a.href = `mailto:${MAIL}`; a.textContent = MAIL;
    status.append(a, '.');
    status.classList.add('is-error');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (button.disabled) return;                  // a second Enter while sending
    status.classList.remove('is-error'); status.textContent = '';
    const bad = check();
    if (bad) { status.textContent = 'Check the highlighted fields.'; status.classList.add('is-error'); bad.focus(); return; }
    const label = button.textContent;
    button.disabled = true; button.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
    try {
      // a real visitor must never trip the time trap: too fast → wait out the rest; tab open for hours, restored from
      // the back/forward cache, or no timestamp → start the clock again now (bots don't run this script)
      let ts = Number(form.elements.jro_ts?.value) || 0;
      if (!ts || Date.now() - ts > MAX_MS - 60000) ts = Date.now() - MIN_MS - 500;
      const short = MIN_MS + 250 - (Date.now() - ts);
      if (short > 0) await wait(short);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.value.trim(), email: fields.email.value.trim(), topic: form.elements.topic.value,
          message: fields.message.value.trim(), jro_hp_ref: form.elements.jro_hp_ref?.value ?? '', page: location.pathname,
          jro_ts: ts, jro_sent: Date.now(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) throw new Error('send failed');
      const first = fields.name.value.trim().split(/\s+/)[0];
      // the live region itself becomes the visible message, so it is announced once and shown once
      form.remove();
      status.className = 'cf__status cf__done';
      status.textContent = `Thanks, ${first}. I’ll reply from ${MAIL} within a couple of days.`;
      status.tabIndex = -1; status.focus();
    } catch {
      button.disabled = false; button.textContent = label; form.removeAttribute('aria-busy');
      fail();                                    // keeps everything they typed
    }
  };
  form.addEventListener('submit', submit);
  return () => { form.removeEventListener('submit', submit); inputs.forEach((f) => f()); };
}
