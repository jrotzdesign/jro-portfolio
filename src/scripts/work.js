// Project page: smooth scroll, entrance for the title block, lazy reveals, keyboard nav (Esc / ← / →).
import { navigate } from 'astro:transitions/client';
import { gsap, ScrollTrigger, reduce, startScroll, killAll } from './scroll.js';
import lottie from 'lottie-web/build/player/lottie_light';

let cleanups = [];
const on = (el, ev, fn, opts) => { el.addEventListener(ev, fn, opts); cleanups.push(() => el.removeEventListener(ev, fn, opts)); };

export function initWork() {
  destroyWork();
  const root = document.getElementById('work');
  startScroll();
  window.scrollTo(0, 0);

  if (!reduce()) {
    gsap.from(root.querySelectorAll('[data-in]'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out', delay: 0.1, clearProps: 'all' });
    root.querySelectorAll('[data-rv]').forEach((el) =>
      gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  }

  /* in motion: each piece loads when it nears the viewport, plays while at least half visible, replays on click */
  const pieces = [...root.querySelectorAll('.mo')];
  const anims = new Map();
  const light = (hex) => { if (!hex) return true; const n = parseInt(hex.replace('#', ''), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 > 150; };
  pieces.forEach((el) => { if (light(getComputedStyle(el).getPropertyValue('--mo-bg').trim())) el.classList.add('light'); });
  function ensure(el) {
    if (anims.has(el)) return anims.get(el);
    let a;
    if (el.dataset.type === 'video') { a = el.querySelector('video'); a.preload = 'auto'; }
    else {
      a = lottie.loadAnimation({ container: el.querySelector('.mo__stage'), renderer: 'svg', loop: false, autoplay: false, path: el.dataset.src, rendererSettings: { preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true } });
      a.addEventListener('complete', () => el.classList.add('done'));
      if (reduce()) a.addEventListener('DOMLoaded', () => a.goToAndStop(a.totalFrames - 1, true));
    }
    anims.set(el, a); return a;
  }
  const replay = (el) => { const a = ensure(el); el.classList.remove('done'); if (el.dataset.type === 'video') { a.currentTime = 0; a.play().catch(() => {}); } else { a.goToAndPlay(0, true); } };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    const el = en.target;
    if (en.intersectionRatio >= 0.5) { const a = ensure(el); if (reduce()) return; if (el.dataset.type === 'video') a.play().catch(() => {}); else if (!el.classList.contains('done') && a.isPaused) a.play(); }
    else if (en.intersectionRatio === 0 && anims.has(el)) { const a = anims.get(el); if (el.dataset.type === 'video') a.pause(); else a.pause(); }
  }), { threshold: [0, 0.5] });
  const pre = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) ensure(en.target); }), { rootMargin: '600px 0px' });
  pieces.forEach((el) => { io.observe(el); pre.observe(el); on(el, 'click', () => replay(el)); });
  cleanups.push(() => { io.disconnect(); pre.disconnect(); anims.forEach((a, el) => { if (el.dataset.type !== 'video') a.destroy(); }); anims.clear(); });

  on(window, 'keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') navigate('/#index');
    else if (e.key === 'ArrowRight') navigate(root.dataset.next);
    else if (e.key === 'ArrowLeft') navigate(root.dataset.prev);
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export function destroyWork() {
  cleanups.forEach((f) => f()); cleanups = [];
  killAll();
}
