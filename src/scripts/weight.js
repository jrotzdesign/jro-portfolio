// Weight field: display type responds like the hero mark does — letters near the pointer swell toward Bricolage
// Grotesque's heaviest weight and ease back as it leaves, and scrolling fast thickens what's on screen a little.
// Every letter eases toward its target each frame (no jumps), so the type feels as soft as the scroll.
// Heavier glyphs are wider, so each letter's growth is cancelled with equal negative margins on both sides: the letter
// swells around its own centre and its neighbours, the line and the line breaks never move (no jitter).
// The browser kerns across the letter spans only while neighbours share a weight, so a pair would gain or lose its
// kerning mid-hover and jump. Letters are drawn unkerned (.wf-l, font-kerning:none) and each pair's kerning, measured
// once, is put back as a fixed margin: the type looks exactly as kerned as before and nothing toggles.
const MAX = 800, R = 170, LERP = 0.14, SCROLL_BOOST = 140;
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function split(el) {
  if (el.dataset.wf) return;
  el.dataset.wf = '1';
  // the per-letter spans are decorative: give the heading its real text as its name (line breaks read as spaces)
  const copy = el.cloneNode(true);
  copy.querySelectorAll('br').forEach((b) => b.replaceWith(' '));
  el.setAttribute('aria-label', copy.textContent.replace(/\s+/g, ' ').trim());
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'wf-w'; w.setAttribute('aria-hidden', 'true');
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

  // how much wider each glyph gets from its base weight to the middle and heaviest weight, per px of font size. Measured
  // on a hidden probe at 100px, one glyph at a time, so page transforms (reveals, pinned scenes) can't skew it.
  const fs = new Map();
  const sizes = () => els.forEach((el) => fs.set(el, parseFloat(getComputedStyle(el).fontSize) || 16));
  const STEPS = [0, 0.5, 1];
  let measured = false;
  function measure() {
    sizes();
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;font-size:100px;letter-spacing:0;line-height:1';
    document.body.appendChild(probe);
    const cache = new Map();
    for (const o of letters) {
      const fam = getComputedStyle(o.el).fontFamily, key = `${fam}|${o.base}|${o.l.textContent}`;
      if (!cache.has(key)) {
        probe.style.fontFamily = fam; probe.textContent = o.l.textContent;
        const w = STEPS.map((t) => { probe.style.fontVariationSettings = `"opsz" 96, "wght" ${o.base + (MAX - o.base) * t}`; return probe.getBoundingClientRect().width; });
        cache.set(key, w.map((x) => (x - w[0]) / 100));
      }
      o.g = cache.get(key); o.last = undefined;
    }
    // kerning between each letter and the next one in its word, at the base weight (per px of font size)
    probe.style.fontKerning = 'normal';
    const kern = new Map();
    letters.forEach((o, i) => {
      const n = letters[i + 1]; o.k = 0;
      if (!n || n.l.parentNode !== o.l.parentNode) return;
      const fam = getComputedStyle(o.el).fontFamily, pair = o.l.textContent + n.l.textContent, key = `${fam}|${o.base}|${pair}`;
      if (!kern.has(key)) {
        probe.style.fontFamily = fam; probe.style.fontVariationSettings = `"opsz" 96, "wght" ${o.base}`;
        const wd = (t) => { probe.textContent = t; return probe.getBoundingClientRect().width; };
        kern.set(key, (wd(pair) - wd(o.l.textContent) - wd(n.l.textContent)) / 100);
      }
      o.k = kern.get(key);
    });
    probe.remove();
    measured = true; settled = false;
    letters.forEach((o) => { o.l.style.fontKerning = 'none'; });
  }
  // extra width (px) of a letter at weight w, interpolated between the measured steps
  const grow = (o, w) => {
    const t = Math.max(0, Math.min(1, (w - o.base) / (MAX - o.base))) * (STEPS.length - 1), k = Math.min(STEPS.length - 2, Math.floor(t));
    return (o.g[k] + (o.g[k + 1] - o.g[k]) * (t - k)) * fs.get(o.el);
  };
  let rz = 0;
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { sizes(); letters.forEach((o) => { o.last = undefined; }); settled = false; }, 120); };  // margins are px: rewrite them at the new size
  addEventListener('resize', onResize, { passive: true });

  let px = -1e4, py = -1e4, boost = 0, raf = 0;
  let settled = false;                       // true once nothing is moving: the loop then skips its work until input returns
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target), settled = false)), { rootMargin: '100px 0px' });
  els.forEach((el) => io.observe(el));
  const move = (e) => { px = e.clientX; py = e.clientY; settled = false; };
  const leave = () => { px = py = -1e4; settled = false; };
  // `pointerleave` never fires on document: use the root element for the mouse leaving the window, and the end of a touch
  const up = (e) => { if (e.pointerType !== 'mouse') leave(); };
  addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('mouseleave', leave);
  addEventListener('pointerup', up); addEventListener('pointercancel', up);

  function tick() {
    raf = requestAnimationFrame(tick);
    const v = lenis ? Math.abs(lenis.velocity || 0) : 0;
    boost += (Math.min(1, v / 40) - boost) * 0.08;
    if (!measured || (settled && v < 1 && boost < 0.002)) return;
    const live = letters.filter((o) => visible.has(o.el));
    // read every position first, then write every weight — interleaving the two would force a layout per letter
    const pointer = px > -1e3;
    for (const o of live) {
      if (!pointer) { o.near = 0; continue; }
      const r = o.l.getBoundingClientRect();
      o.near = smooth(1 - Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py) / R);
    }
    let moving = false;
    for (const o of live) {
      o.t = Math.min(MAX, o.base + (MAX - o.base) * o.near + SCROLL_BOOST * boost);
      o.w += (o.t - o.w) * LERP;
      if (Math.abs(o.t - o.w) > 0.25) moving = true;
      const w = Math.round(o.w * 2) / 2;
      if (w !== o.last) {
        o.last = w;
        o.l.style.fontVariationSettings = `"opsz" 96, "wght" ${w}`;
        const half = -grow(o, w) / 2;
        o.l.style.marginLeft = `${half.toFixed(2)}px`;
        o.l.style.marginRight = `${(half + o.k * fs.get(o.el)).toFixed(2)}px`;
      }
    }
    if (!moving && !pointer) settled = true;
  }
  let dead = false;
  // measure with the real font: `fonts.ready` can resolve before the variable font has even been requested, so load the
  // family explicitly, and measure again if a font finishes loading later
  const fam = els[0] ? getComputedStyle(els[0]).fontFamily : '';
  const fonts = document.fonts;
  const remeasure = () => { if (!dead) measure(); };
  (fonts && fam ? Promise.all([fonts.load(`400 100px ${fam}`), fonts.load(`${MAX} 100px ${fam}`)]).then(() => fonts.ready) : Promise.resolve()).then(remeasure, remeasure);
  fonts?.addEventListener?.('loadingdone', remeasure);
  raf = requestAnimationFrame(tick);
  return () => {
    dead = true; clearTimeout(rz); removeEventListener('resize', onResize); fonts?.removeEventListener?.('loadingdone', remeasure);
    cancelAnimationFrame(raf); io.disconnect();
    removeEventListener('pointermove', move); document.documentElement.removeEventListener('mouseleave', leave);
    removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
  };
}
