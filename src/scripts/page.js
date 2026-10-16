// Standalone pages (/work/ and /contact/): smooth scroll, entrance and reveals, the weight field, project filters,
// the contact bits and form, and Esc to the page named in #page[data-esc] (home by default).
import { navigate } from 'astro:transitions/client';
import { gsap, ScrollTrigger, reduce, startScroll, killAll, getLenis } from './scroll.js';
import { initWeight } from './weight.js';
import { initFilters } from './filters.js';
import { initContactBits } from './contact-bits.js';
import { initContactForm } from './contact-form.js';

let cleanups = [];

export function initPage() {
  destroyPage();
  const root = document.getElementById('page');
  startScroll();
  window.scrollTo(0, 0);
  if (!reduce()) {
    gsap.from(root.querySelectorAll('[data-in]'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', delay: 0.1, clearProps: 'all' });
    root.querySelectorAll('[data-rv]').forEach((el) =>
      gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  }
  cleanups.push(initWeight(root, getLenis()));
  cleanups.push(initFilters(root, () => ScrollTrigger.refresh()));
  cleanups.push(initContactBits(root));
  cleanups.push(initContactForm(root));
  const key = (e) => {
    const typing = /^(input|textarea|select)$/i.test(e.target?.tagName || '');
    const form = root.querySelector('#cform');
    const dirty = !!form && [...form.elements].some((f) => f.name && f.name !== 'topic' && f.type !== 'submit' && f.type !== 'hidden' && String(f.value).trim() !== '');
    if (e.key === 'Escape' && !typing && !dirty && !(e.metaKey || e.ctrlKey || e.altKey)) navigate(root.dataset.esc || '/');   // never discard a message in progress
  };
  window.addEventListener('keydown', key); cleanups.push(() => window.removeEventListener('keydown', key));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export function destroyPage() {
  cleanups.forEach((f) => f()); cleanups = [];
  killAll();
}
