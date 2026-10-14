// Motion cards (.mo): Lottie files, rendered as SVG so they stay sharp at any size. Each card loads when it nears the
// viewport and plays while at least a third of it is visible. 'hold' pieces play once (to `end` when set), rest on the
// finished logo, then play again; 'seamless' pieces loop continuously. Clicking a card replays it. Off-screen cards pause.
// Reduced motion: every card shows its finished frame and stays still.
import lottie from 'lottie-web/build/player/lottie_light';
import { HOLD } from '../data/motion.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion(root = document) {
  const cards = [...root.querySelectorAll('.mo')];
  if (!cards.length) return () => {};
  const state = new Map(); // el → { a, visible, timer, started }

  const light = (hex) => { if (!hex) return true; const n = parseInt(hex.replace('#', ''), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150; };
  cards.forEach((el) => { if (light(getComputedStyle(el).getPropertyValue('--mo-bg').trim())) el.classList.add('light'); });

  function playFromStart(el) {
    const s = state.get(el); if (!s) return;
    clearTimeout(s.timer); el.classList.remove('done');
    const end = +el.dataset.end || 0;
    if (end) s.a.playSegments([0, end], true); else s.a.goToAndPlay(0, true);
  }

  function ensure(el) {
    if (state.has(el)) return state.get(el);
    const s = { a: null, visible: false, timer: 0, started: false };
    const seamless = el.dataset.loop === 'seamless';
    s.a = lottie.loadAnimation({
      container: el.querySelector('.mo__stage'), renderer: 'svg', loop: seamless, autoplay: false, path: el.dataset.src,
      rendererSettings: {
        preserveAspectRatio: el.dataset.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet', progressiveLoad: true,
        ...(el.dataset.view ? { viewBoxSize: el.dataset.view } : {}),   // crop full-window intros to the logo
      },
    });
    const end = +el.dataset.end || 0;
    s.a.addEventListener('DOMLoaded', () => {
      if (reduce()) s.a.goToAndStop(end || s.a.totalFrames - 1, true);
      else if (s.visible) { s.started = true; playFromStart(el); }
    });
    if (!seamless) s.a.addEventListener('complete', () => {
      el.classList.add('done');
      clearTimeout(s.timer);
      s.timer = setTimeout(() => { if (s.visible && !reduce()) playFromStart(el); }, HOLD);
    });
    state.set(el, s); return s;
  }

  function show(el) {
    const s = ensure(el); s.visible = true;
    if (reduce() || !s.a.isLoaded) return; // DOMLoaded starts it (or parks it on the last frame)
    if (!s.started || el.classList.contains('done')) { s.started = true; playFromStart(el); }
    else if (s.a.isPaused) s.a.play();
  }
  function hide(el) {
    const s = state.get(el); if (!s) return;
    s.visible = false; clearTimeout(s.timer); s.timer = 0;
    s.a.pause();
  }

  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.intersectionRatio >= 0.35) show(en.target);
    else if (en.intersectionRatio === 0) hide(en.target);
  }), { threshold: [0, 0.35] });
  const pre = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) ensure(en.target); }), { rootMargin: '600px 0px' });
  const onClick = (e) => { const el = e.currentTarget; const s = ensure(el); if (!reduce() && s.a.isLoaded) playFromStart(el); };  // an unloaded card starts itself
  cards.forEach((el) => { io.observe(el); pre.observe(el); el.addEventListener('click', onClick); });

  return () => {
    io.disconnect(); pre.disconnect();
    cards.forEach((el) => el.removeEventListener('click', onClick));
    state.forEach((s) => { clearTimeout(s.timer); s.a.destroy(); });
    state.clear();
  };
}

// Films: a poster button that swaps itself for the player on click (no third-party iframe until asked for).
export function initFilms(root = document) {
  const films = [...root.querySelectorAll('.film')];
  const onClick = (e) => {
    const el = e.currentTarget, box = el.querySelector('.film__frame');
    if (el.classList.contains('on')) return;
    el.classList.add('on');
    if (el.dataset.vimeo) {
      const f = document.createElement('iframe');
      f.src = `https://player.vimeo.com/video/${el.dataset.vimeo}?autoplay=1&dnt=1&title=0&byline=0&portrait=0&color=29A191`;
      f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = el.dataset.title || 'Film';
      box.appendChild(f);
    } else {
      const v = document.createElement('video');
      v.src = el.dataset.src; v.controls = true; v.autoplay = true; v.playsInline = true;
      box.appendChild(v); v.play().catch(() => {});
    }
  };
  films.forEach((el) => el.addEventListener('click', onClick));
  return () => films.forEach((el) => el.removeEventListener('click', onClick));
}
