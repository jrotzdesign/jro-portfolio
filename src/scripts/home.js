// Home page: hero mark docks into the nav, three pinned chapters, index grid, contact row.
import { gsap, ScrollTrigger, reduce, startScroll, scrollTo, killAll, getLenis } from './scroll.js';
import { makeJRO, V } from '../lib/morph.js';
import JRO from '../data/jro3.json';
import OPEN from '../data/hero-open.json';

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

  /* hero — three acts, scrubbed over the hero's scroll range (storyboard, Oct 10):
     A  0 → .30   three solid blocks are carved into the ultra-wide mark (storyboard keyframes, see hero-open.json)
        .30 → .34  hold on the ultra-wide mark
     B  .34 → .42  the mark un-stretches from full width to its real proportions (w=2, h=1); hold to .46
     C  .46 → 1    the mark morphs toward the main mark (w=0, h=0), shrinks and docks into the nav slot */
  const nav = $('#nav'), navMark = $('#navMark'), slotEl = $('.nav__slot');
  const heroMark = $('#heroMark'), heroSvg = $('#heroSvg'), heroCopy = $('#heroCopy'), heroHint = $('#heroHint');
  const openG = $('#heroOpen'), lettersG = $('#heroLetters'), openPaths = $$('path', openG), letterPaths = $$('path', lettersG);
  const PA = 0.30, PH = 0.34, PB = 0.42, PC = 0.46;
  const STRETCH = 1338.3 / 829.8;      // full-width opening vs the mark's own width (storyboard, 1440 viewport)
  M.apply(navMark, V(0, 0));
  let heroST = null;
  const bigW = () => Math.min(innerWidth * 0.82, innerHeight * 0.78 * (448 / 379));
  // on narrow screens the mark is width-bound, so the storyboard's 1.61× stretch would run off both edges:
  // cap the opening at the viewport minus the page gutter (edge to gutter on a phone, unchanged on desktop)
  const gutter = () => (innerWidth < 700 ? Math.min(Math.max(20, innerWidth * 0.04), 56) : 0);   // mirrors --pad
  const stretch = () => Math.min(STRETCH, (innerWidth - 2 * gutter()) / bigW());
  // opening frames (storyboard): each block is its rectangle minus the real letter's negative spaces, and those
  // spaces grow from nothing into their final shape — so every in-between frame is still clean geometry.
  // Windows are fractions of act A; each region scales about its anchor along the axis that reads as "carving".
  const WIN = { corner: [0, .35], top: [.08, .55], notch: [.25, .65], slit: [.30, .75], gap: [.45, .85], crotch: [.40, .85], leg: [.55, .95] };
  const AXIS = { corner: 'xy', top: 'y', notch: 'x', slit: 'x', gap: 'x', crotch: 'y', leg: 'x' };
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const f1 = (v) => v.toFixed(1);
  function regionPath(r, a) {
    const [t0, t1] = WIN[r.t], k = smooth((a - t0) / (t1 - t0));
    if (k <= 0) return '';
    const sx = AXIS[r.t] === 'y' ? 1 : k, sy = AXIS[r.t] === 'x' ? 1 : k, [ax, ay] = r.a;
    let d = '';
    for (let i = 0; i < r.pts.length; i++) {
      const [x, y] = r.pts[i];
      d += (i ? 'L' : 'M') + f1(ax + (x - ax) * sx) + ' ' + f1(ay + (y - ay) * sy);
    }
    return d + 'Z';
  }
  function paintOpen(a) {
    OPEN.letters.forEach((L, i) => {
      const [x0, x1, y0, y1] = L.rect;
      let d = `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`;
      L.neg.forEach((r) => { d += regionPath(r, a); });
      L.pos.forEach((r) => { d += regionPath(r, a); });
      openPaths[i].setAttribute('d', d);
    });
  }
  function showOpen(on) { openG.style.display = on ? '' : 'none'; lettersG.style.display = on ? 'none' : ''; }
  function paintHero(p) {
    const W = innerWidth, H = innerHeight;
    if (p < PC) {
      const a = Math.min(1, p / PA);                                             // act A progress
      if (a < 1) { paintOpen(a); showOpen(true); } else { M.apply(heroSvg, V(2, 1), letterPaths); showOpen(false); }
      heroSvg.setAttribute('viewBox', '0 0 448 379');
      const S = stretch();
      const sx = p < PH ? S : p < PB ? S + (1 - S) * ease((p - PH) / (PB - PH)) : 1;
      const w = bigW() * sx, h = bigW() * (379 / 448);
      heroMark.style.width = w + 'px'; heroMark.style.height = h + 'px';
      heroMark.style.left = W / 2 + 'px'; heroMark.style.top = H / 2 + 'px';
      heroCopy.style.opacity = 0; heroHint.style.opacity = 1;
      nav.classList.remove('docked'); heroMark.style.opacity = 1;
      return;
    }
    const q = (p - PC) / (1 - PC);                                                // act C progress
    showOpen(false);
    M.apply(heroSvg, V(2 * (1 - q), 1 - q), letterPaths);
    const vb = heroSvg.viewBox.baseVal;
    const slot = slotEl.getBoundingClientRect();
    const w = bigW() + (slot.height * (181 / 235) - bigW()) * ease(q);
    const cx = W / 2 + (slot.left + (slot.height * (181 / 235)) / 2 - W / 2) * ease(q);
    const cy = H / 2 + (slot.top + slot.height / 2 - H / 2) * ease(q);
    heroMark.style.width = w + 'px'; heroMark.style.height = (w * vb.height / vb.width) + 'px';
    heroMark.style.left = cx + 'px'; heroMark.style.top = cy + 'px';
    heroCopy.style.opacity = Math.max(0, (q - 0.55) / 0.45);
    heroHint.style.opacity = Math.max(0, 1 - q * 3);
    nav.classList.toggle('docked', q > 0.985);
    heroMark.style.opacity = q > 0.985 ? 0 : 1;
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
    // on a phone the frames are 88vw wide, so the side images fan further out (mostly off-screen) and smaller
    const fan = mobile ? innerWidth * 0.5 : innerWidth * 0.28, side = mobile ? 0.55 : 0.7;
    tl.from(letters, { yPercent: 120, opacity: 0, stagger: 0.04, duration: 0.6, ease: 'power3.out' }, 0)
      .to(imgs[1], { scale: side, rotate: -8, x: -fan, duration: 1, ease: 'power2.inOut' }, 0.5)
      .to(imgs[2], { scale: side, rotate: 8, x: fan, duration: 1, ease: 'power2.inOut' }, 0.5)
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
