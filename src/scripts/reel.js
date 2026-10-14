// /in-motion/: smooth scroll, title entrance, every motion piece looping while in view, Esc back to the index.
import { navigate } from 'astro:transitions/client';
import { gsap, ScrollTrigger, reduce, startScroll, killAll, getLenis } from './scroll.js';
import { initWeight } from './weight.js';
import { initMotion } from './motion-player.js';

let cleanups = [];

export function initReel() {
  destroyReel();
  const root = document.getElementById('reel');
  startScroll();
  window.scrollTo(0, 0);
  if (!reduce()) gsap.from(root.querySelectorAll('[data-in]'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', delay: 0.1, clearProps: 'all' });
  cleanups.push(initWeight(root, getLenis()));
  cleanups.push(initMotion(root));
  const key = (e) => { if (e.key === 'Escape' && !(e.metaKey || e.ctrlKey || e.altKey)) navigate('/#index'); };
  window.addEventListener('keydown', key); cleanups.push(() => window.removeEventListener('keydown', key));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export function destroyReel() {
  cleanups.forEach((f) => f()); cleanups = [];
  killAll();
}
