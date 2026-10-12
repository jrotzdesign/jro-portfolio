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
