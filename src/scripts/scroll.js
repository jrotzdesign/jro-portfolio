// Smooth scroll (Lenis) wired into GSAP's ticker + ScrollTrigger. One instance per page view;
// the Astro ClientRouter tears it down before every swap and the next page builds its own.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export { gsap, ScrollTrigger };

let lenis = null, raf = null;

export function startScroll() {
  stopScroll();
  if (reduce()) return null;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  raf = (t) => lenis && lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopScroll() {
  if (raf) gsap.ticker.remove(raf);
  raf = null;
  if (lenis) lenis.destroy();
  lenis = null;
}

export const getLenis = () => lenis;

// Scroll to an element or a y position, smoothly when Lenis is on.
export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.1, ...opts });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else target.scrollIntoView({ behavior: 'smooth' });
}

// Kill every ScrollTrigger + tween the page created (called before the router swaps pages).
export function killAll() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  stopScroll();
}
