// Weight field: display type responds like the hero mark does — letters near the pointer swell toward Bricolage
// Grotesque's heaviest weight and ease back as it leaves, and scrolling fast thickens what's on screen a little.
// Every letter eases toward its target each frame (no jumps), so the type feels as soft as the scroll.
const MAX = 800, R = 170, LERP = 0.14, SCROLL_BOOST = 140;
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function split(el) {
  if (el.dataset.wf) return;
  el.dataset.wf = '1';
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'wf-w';
          [...part].forEach((ch) => { const l = document.createElement('span'); l.className = 'wf-l'; l.textContent = ch; w.appendChild(l); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
}

export function initWeight(root = document, lenis = null) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const els = [...root.querySelectorAll('.display')].filter((el) => !el.closest('[data-word], .hero__mark') && !el.hasAttribute('data-word'));
  els.forEach(split);
  const letters = els.flatMap((el) => [...el.querySelectorAll('.wf-l')].map((l) => ({ l, el, base: 0, w: 0, t: 0 })));
  letters.forEach((o) => { o.base = parseFloat(getComputedStyle(o.el).fontWeight) || 500; o.w = o.base; });

  let px = -1e4, py = -1e4, boost = 0, raf = 0;
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { rootMargin: '100px 0px' });
  els.forEach((el) => io.observe(el));
  const move = (e) => { px = e.clientX; py = e.clientY; };
  const leave = () => { px = py = -1e4; };
  addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', leave);

  function tick() {
    raf = requestAnimationFrame(tick);
    const v = lenis ? Math.abs(lenis.velocity || 0) : 0;
    boost += (Math.min(1, v / 40) - boost) * 0.08;
    const live = letters.filter((o) => visible.has(o.el));
    // read every position first, then write every weight — interleaving the two would force a layout per letter
    const pointer = px > -1e3;
    for (const o of live) {
      if (!pointer) { o.near = 0; continue; }
      const r = o.l.getBoundingClientRect();
      o.near = smooth(1 - Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py) / R);
    }
    for (const o of live) {
      o.t = Math.min(MAX, o.base + (MAX - o.base) * o.near + SCROLL_BOOST * boost);
      o.w += (o.t - o.w) * LERP;
      const w = Math.round(o.w * 2) / 2;
      if (w !== o.last) { o.last = w; o.l.style.fontVariationSettings = `"opsz" 96, "wght" ${w}`; }
    }
  }
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf); io.disconnect();
    removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave);
  };
}
