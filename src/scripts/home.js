// Home page: hero mark docks into the nav, three pinned chapters, index grid, contact row.
import { gsap, ScrollTrigger, reduce, startScroll, scrollTo, killAll, getLenis } from './scroll.js';
import { makeJRO, V } from '../lib/morph.js';
import JRO from '../data/jro3.json';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const M = makeJRO(JRO);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

let cleanups = [];
const on = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); cleanups.push(() => el.removeEventListener(ev, fn, opts)); };

export function initHome() {
  destroyHome();
  const noMotion = reduce();
  const mobile = matchMedia('(max-width:700px)').matches;
  const lenis = startScroll();
  const body = document.body;

  /* in-page anchors scroll smoothly */
  $$('a[href^="#"]').forEach((a) => on(a, 'click', (e) => {
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); scrollTo(t); }
  }));

  /* hero: widest/tallest mark fills the screen, scrolling morphs it to the main mark and docks it in the nav */
  const nav = $('#nav'), navMark = $('#navMark'), slotEl = $('.nav__slot');
  const heroMark = $('#heroMark'), heroSvg = $('#heroSvg'), heroCopy = $('#heroCopy'), heroHint = $('#heroHint');
  M.apply(navMark, V(0, 0));
  let heroST = null;
  function paintHero(p) {
    M.apply(heroSvg, V(2 * (1 - p), 1 - p));
    const slot = slotEl.getBoundingClientRect();
    const bigW = Math.min(innerWidth * 0.82, innerHeight * 0.78 * (448 / 379));
    const w = bigW + (slot.height * (181 / 235) - bigW) * ease(p);
    const cx = innerWidth / 2 + (slot.left + (slot.height * (181 / 235)) / 2 - innerWidth / 2) * ease(p);
    const cy = innerHeight / 2 + (slot.top + slot.height / 2 - innerHeight / 2) * ease(p);
    heroMark.style.width = w + 'px'; heroMark.style.left = cx + 'px'; heroMark.style.top = cy + 'px';
    heroCopy.style.opacity = Math.max(0, (p - 0.55) / 0.45);
    heroHint.style.opacity = Math.max(0, 1 - p * 3);
    nav.classList.toggle('docked', p > 0.985);
    heroMark.style.opacity = p > 0.985 ? 0 : 1;
  }
  paintHero(0);
  heroST = ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => paintHero(s.progress) });
  on(window, 'resize', () => paintHero(heroST ? heroST.progress : 0));

  /* chapters: word rises and splits, images grow from a stack to full frame, caption lands */
  const navCh = $('#navCh'), total = $$('.ch').length;
  $$('.ch').forEach((ch) => {
    const word = $('[data-word]', ch);
    if (!word.dataset.split) { word.innerHTML = [...word.textContent].map((c) => `<span>${c}</span>`).join(''); word.dataset.split = '1'; }
    const letters = $$('span', word), imgs = $$('.ch__img', ch), cap = $('.ch__cap', ch);
    const label = () => (navCh.textContent = `${ch.dataset.n} / ${String(total).padStart(3, '0')}`);
    if (noMotion) { imgs.forEach((im) => (im.style.transform = 'translate(-50%,-50%) scale(1)')); cap.style.opacity = 1; return; }
    const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top top', end: 'bottom bottom', scrub: 0.4, onEnter: label, onEnterBack: label } });
    tl.from(letters, { yPercent: 120, opacity: 0, stagger: 0.04, duration: 0.6, ease: 'power3.out' }, 0)
      .to(imgs[1], { scale: 0.7, rotate: -8, x: -innerWidth * 0.28, duration: 1, ease: 'power2.inOut' }, 0.5)
      .to(imgs[2], { scale: 0.7, rotate: 8, x: innerWidth * 0.28, duration: 1, ease: 'power2.inOut' }, 0.5)
      .to(imgs[0], { scale: 1, duration: 1.2, ease: 'power2.inOut' }, 0.5)
      .to(letters, { yPercent: -60, opacity: 0, stagger: 0.02, duration: 0.6, ease: 'power2.in' }, 0.7)
      .to(imgs[0], { scale: mobile ? 1 : 1.08, duration: 0.6, ease: 'none' }, 1.7)
      .to([imgs[1], imgs[2]], { opacity: 0, duration: 0.3 }, 1.6)
      .fromTo(cap, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.7);
  });

  /* background follows the section under the middle of the screen */
  const bgSecs = $$('[data-bg]').filter((s) => s !== body);
  function bgTick() {
    const mid = innerHeight * 0.5; let cur = 'bone';
    for (const s of bgSecs) if (s.getBoundingClientRect().top <= mid) cur = s.dataset.bg;
    if (body.dataset.bg !== cur) body.dataset.bg = cur;
  }
  /* nav mark's weight tracks page progress */
  function navTick() {
    const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    M.apply(navMark, V(Math.min(2, Math.max(0, ((p - 0.3) / 0.7) * 2)), 0));
  }
  const tickAll = () => { bgTick(); navTick(); };
  if (lenis) { lenis.on('scroll', tickAll); cleanups.push(() => lenis.off && lenis.off('scroll', tickAll)); }
  else on(window, 'scroll', tickAll, { passive: true });
  tickAll();

  /* index filter */
  $$('.filters button').forEach((b) => on(b, 'click', () => {
    $$('.filters button').forEach((z) => z.classList.toggle('on', z === b));
    const f = b.dataset.f;
    $$('.card').forEach((c) => c.classList.toggle('hide', !(f === 'all' || c.dataset.g === f)));
    ScrollTrigger.refresh();
  }));

  /* reveals */
  if (!noMotion) $$('[data-rv]').forEach((el) => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));

  /* contact: copy the address; NYC clock */
  const mail = $('#mail');
  on(mail, 'click', (e) => { e.preventDefault(); navigator.clipboard?.writeText(mail.dataset.mail); mail.classList.add('did'); setTimeout(() => mail.classList.remove('did'), 1800); });
  const time = $('#time');
  const tick = () => (time.textContent = 'NYC ' + new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()));
  tick(); const iv = setInterval(tick, 15000); cleanups.push(() => clearInterval(iv));

  /* fonts load after first paint → recompute pins */
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function destroyHome() {
  cleanups.forEach((f) => f()); cleanups = [];
  killAll();
}
