// Project page: smooth scroll, entrance for the title block, lazy reveals, keyboard nav (Esc / ← / →).
import { navigate } from 'astro:transitions/client';
import { gsap, ScrollTrigger, reduce, startScroll, killAll } from './scroll.js';

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
