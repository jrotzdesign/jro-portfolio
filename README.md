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

## Public site, caching and SEO

The site is public and indexed. `functions/_middleware.js` does two things in front of every request: it 301s `www.jrortizdesign.com/*` to `https://jrortizdesign.com/*` (same path and query), and it sends `Cache-Control: public, max-age=0, must-revalidate` on HTML so a deploy shows up at once and pages stay eligible for the back/forward cache. `/img/*` and `/_astro/*` keep a one-year immutable cache (`public/_headers`).

- **Titles, descriptions, JSON-LD:** `src/data/seo.js` (titles under 60 characters, descriptions 140–160). Home and `/contact/` carry a `Person`, home a `WebSite`, each project a `CreativeWork` and a `BreadcrumbList`.
- **Social cards:** `scripts/prebuild.mjs` crops every project image to a 1200×630 JPEG in `public/og/<slug>.jpg` (git-ignored, rebuilt as needed) and records every image's size in `src/data/img-dims.json` for `width`/`height` attributes. `/og.jpg` is the site-wide card.
- **Alt text:** `src/data/alt.js`, written from what each image shows.
- **Sitemap and robots:** `@astrojs/sitemap` writes `sitemap-index.xml` (every page but the 404); `public/robots.txt` allows everything and points at it. Only the 404 page is `noindex`.
- **Checks:** `npm run build` ends with `scripts/check-seo.mjs`, which fails the build on a missing or out-of-range title or description, more or fewer than one `h1`, a missing `og:*`/`twitter:*` tag, an `og:image` that isn't a real 1200×630 file, invalid JSON-LD, an `<img>` without `alt` or `width`/`height`, or a sitemap that misses a page.

## Pages and the contact form

Routes: `/` home, `/work/` projects (the same card grid and filters as the home index, one shared component), `/contact/` about + contact form, `/in-motion/`, `/work/<slug>/`, and `404.astro`. The nav is Projects · In motion · Contact.

`/contact/` posts JSON to `functions/api/contact.js` (a Pages Function). It silently drops honeypot hits and submissions sent faster than 3 seconds or more than 2 hours after the page loaded, validates on the server, and sends a plain-text email through the Cloudflare Email Service. Without the secrets it returns `503 {"ok":false,"reason":"not-configured"}` and the page shows the "email me directly" fallback.

## Contact form setup

Four steps in the Cloudflare dashboard:

1. **Enable Email Routing** on jrortizdesign.com (Email → Email Routing → Enable).
2. **Add and verify the destination address** `jrotz.design@gmail.com` (Email Routing → Destination addresses; click the confirmation link Cloudflare sends).
3. **Create an API token** with Account → Email Sending → Edit (My Profile → API Tokens → Create Token → Custom token).
4. **Add the variables** in the Pages project (jro-portfolio → Settings → Variables and Secrets, Production):
   - `CF_EMAIL_TOKEN` (secret): the token from step 3
   - `CF_ACCOUNT_ID`: the account ID (`5017f0d78a38195a445b1619c32d4f86`)
   - `CONTACT_TO` (optional): where inquiries go; defaults to `jrotz.design@gmail.com`

Abuse protection: the endpoint is public. It refuses a POST whose `Origin` is another site, drops honeypot hits and anything faster than 3 seconds or older than 2 hours after the page loaded (both times from the visitor's own clock, so a wrong system clock can't drop a real message), and validates every field. For a launch, add a Cloudflare rate-limiting rule for `POST /api/contact` (Security → WAF → Rate limiting rules), since it sends real email.

Mail is sent from `contact@jrortizdesign.com` with the visitor as Reply-To. The token is never in the repo or the client, and the function never logs it or the message text.

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

- Every motion card is a Lottie (the same JSON files the Webflow sites play). No recordings: they went soft on retina
  screens.
- Website reels and brand reels are films (click to play) on their project pages.

## Oct 14 — the animation only

- Cards show the animation, never the site behind it: intros that go on to wipe away and reveal their website stop on
  the finished logo (`end`: IPX 78, Ardelle Gardens 72).
- Intros built for a full browser window are cropped to the logo with `view` (the composition's viewBox, measured from
  rendered frames), so a small centred mark fills the card.
- The Mr. Lumberjack and Mon Amie HTML intros are gone. Home chapter 003 is now Motion: Lionstone lion mark, Prestige
  facility network, IPX logo intro.
- Weight field: letters swell in place. Each glyph's extra width is cancelled with equal negative margins, and pair
  kerning is measured once and applied as a fixed margin (letters drawn with font-kerning:none), so neighbours, lines
  and line breaks never move.
