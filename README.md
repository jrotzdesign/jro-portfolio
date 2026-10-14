# jrortizdesign.com — JRO Design portfolio

Astro 5 static site, GSAP + Lenis, deployed on Cloudflare Pages.

```
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/projects.js` | The 16 projects: copy, meta, card image, gallery. Order = order on the site. |
| `src/data/jro3.json` + `src/lib/morph.js` | The JRO mark as anchor-aligned cubic data (3 weights × 2 heights) and the morph engine (`makeJRO`). |
| `src/pages/index.astro` | Home: hero (mark docks into the nav), three pinned chapters, index grid, about, contact. |
| `src/pages/work/[slug].astro` | One page per project, generated from `projects.js`. |
| `src/scripts/scroll.js` | Lenis ↔ GSAP/ScrollTrigger wiring, torn down and rebuilt on every client-side navigation. |
| `src/scripts/home.js`, `work.js` | Page behaviour. Each exports `init*` / `destroy*` and hooks `astro:page-load` / `astro:before-swap`. |
| `src/styles/global.css` | Tokens (`--ink`, `--bone`, `--night`, `--accent` #29A191, `--rosa` #E4007C) and all component styles. |
| `public/img/` | Card/hero images (`<key>.webp`) and `gallery/<project>--<name>.webp`. |

## Adding or changing a project

Edit `src/data/projects.js`. Drop images in `public/img/` (≤ 2000 px, webp) and point `img` / `gallery[].src` at them. A project with `img: null` renders its `tile` text instead until an image exists — Mon Amie, Selectblinds and IPX are in that state.

## Deploy

Cloudflare Pages, Git integration: build command `npm run build`, output directory `dist`, Node 20+. Custom domain `jrortizdesign.com`.

## Password gate

`functions/_middleware.js` runs on Cloudflare Pages in front of every request. If the `SITE_PASSWORD` secret is set on the Pages project, visitors without the signed cookie get the gate page (`functions/gate.js`) instead of the site; the right word sets a 30-day HttpOnly cookie. Set or change the word with `npx wrangler pages secret put SITE_PASSWORD --project-name jro-portfolio`; delete the secret to open the site to everyone. For local testing put `SITE_PASSWORD=…` in `.dev.vars` (git-ignored) and run `npx wrangler pages dev dist`. Visiting `/__gate/leave` clears the cookie.

## In motion (project pages)

A project with a `motion` array in `src/data/projects.js` gets an "In motion" strip between the intro and the gallery. Items are `{t:'lottie', src:'/motion/x.json', name, bg?}` (Lottie JSON, played with lottie-web's light build) or `{t:'video', src:'/motion/x.mp4', name}` (muted, looping). Pieces load when they near the viewport, play once when at least half visible, and replay on click; `bg` colours the card behind transparent Lottie files. Files live in `public/motion/`.

## Motion, films, brand specs (Oct 13)

- `src/data/motion.js` is the single list of motion pieces. A piece shows on a project page only when its `project`
  is that project's slug; every piece shows on `/in-motion/`. Each entry records where the file came from (`source`).
  `loop: 'hold'` plays, rests on the finished frame for `HOLD` ms, plays again; `'seamless'` loops continuously;
  `end` trims files whose last frames are blank; `fit: 'cover'` for files that paint their own background.
- Project data (`src/data/projects.js`) can carry `story` (numbered chapters), `brand` (typefaces + palette, swatches
  copy their hex on click) and `films` (Vimeo id or local mp4 + poster in `public/img/films`, loaded on click only).
- Player: `src/scripts/motion-player.js` (shared by project pages and `/in-motion/`).

## Oct 13 (b)

- `src/scripts/weight.js`: display type swells toward weight 800 near the pointer and eases back (and thickens a
  little while scrolling fast). Bricolage Grotesque is loaded as a variable font (wght 200–800).
- Motion chapter on the home page plays three motion pieces (Lumberjack, IPX, Mon Amie) instead of stills.
- `/in-motion/` groups facility intros by operator (Lion Care, Quantum, Paramount, Millennial) — sources are recorded
  in `src/data/motion.js`.
- Hero opening: region curves are eased into the block edges while they grow (no sharp little corners); carve.py
  pulls near-edge vertices in smoothly instead of hard-snapping them.

## Oct 14 — motion is vector or live code only

- Every motion card is a Lottie (the same JSON files the Webflow sites play) or, for Mr. Lumberjack and Mon Amie, the
  real HTML intro running live in a scaled frame (`public/motion/html/*`, design viewport in `w`/`h`). No recordings:
  they went soft on retina screens.
- Website reels and brand reels are films (click to play) on their project pages.
