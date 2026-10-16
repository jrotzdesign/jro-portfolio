// Search and sharing metadata: page titles and descriptions, and the JSON-LD for every page.
// One source, so titles stay under 60 characters and descriptions within 120–160 (checked after every build by
// scripts/check-seo.mjs). Mozart&Co. is never named as a current employer here: only project pages credit it,
// as where that work was done. JRO Design is the independent practice.
import { EMAIL } from './site.js';

export const SITE = 'https://jrortizdesign.com';
export const LINKEDIN = 'https://www.linkedin.com/in/jose-r-ortiz-design/';

export const PAGES = {
  home: {
    title: 'Jose Ortiz — Design Director, Brand & Web · New York',
    description: 'Jose Ortiz is a design director in New York working on brand systems, web at scale and motion. JRO Design is his independent practice.',
  },
  work: {
    title: 'Projects — Jose Ortiz, Design Director',
    description: 'Projects by Jose Ortiz, a design director in New York: brand systems, websites and motion, from agency work and from JRO Design, his independent practice.',
  },
  motion: {
    title: 'Logo animation & motion — Jose Ortiz',
    description: 'Logo animation and motion design by Jose Ortiz: logo reveals, icon loops and site intros for healthcare brands, built in After Effects and shipped as Lottie.',
  },
  contact: {
    title: 'About & contact — Jose Ortiz',
    description: 'About Jose Ortiz, a design director in New York working on brand systems, web at scale and motion, and how to reach him by form or email.',
  },
  notFound: {
    title: 'Not found — Jose Ortiz',
    description: 'This page moved or never existed.',
  },
};

// The discipline shown in each project page's title: "<Project> — <discipline> · Jose Ortiz".
export const DISCIPLINE = {
  mozart: 'Web design & build',
  prestige: 'Web system',
  lionstone: 'Web system',
  towne: 'Brand identity',
  'glades-west': 'Brand identity & web',
  'village-place': 'Brand & environment',
  'carlton-shores': 'Brand identity',
  precision: 'Brand identity system',
  lumberjack: 'Brand, web & motion',
  'mon-amie': 'Brand & Shopify',
  selectblinds: 'UX design',
  ipx: 'Web concept & motion',
};

export const projectTitle = (p) => `${p.t} — ${DISCIPLINE[p.slug] ?? 'Design'} · Jose Ortiz`;

// Intros longer than 160 characters, trimmed by hand from their own words (an automatic cut lost the point).
const TRIMMED = {
  lionstone: 'Thirty-five facility websites across Ohio and New Jersey on one design system, with an interactive facilities map and careers embeds restyled to each brand.',
  towne: 'A healthcare staffing company unifying seven specialized divisions under one identity. The work was to make seven feel like one without flattening any of them.',
  'glades-west': 'A facility already first-choice locally, rebuilt as a brand that converts hospital referrals from the next ring out: identity, website, film and photography.',
  'village-place': 'A hurricane took the building down to the studs. We came in for the relaunch: brand, photography, film and digital. The building filled 104 beds in four months.',
  precision: 'A complete identity system for Precision Healthcare Services and its rehab and long-term care brands: Greenbriar, Wilton Manors, The Ponce, Carlton Shores.',
  lumberjack: 'Nine Christmas-tree stands across Manhattan, Long Island City and Brooklyn: a vintage general-store identity and a Shopify build for orders and delivery.',
  selectblinds: 'Every product on Selectblinds is unique to the customer’s choices, which made checkout complex and messy. I overhauled it: more orders, fewer complaints.',
  ipx: 'A website concept for Indoor Pickleball X, a multi-location indoor pickleball club: fewer words, clearer paths to booking a court, and a logo intro.',
};

// The project's own one-line intro, trimmed to at most 160 characters: a hand trim when there is one, whole if it
// fits, else the first sentence when that alone is long enough, else cut at the last word that fits, with an ellipsis.
export function projectDescription(p) {
  if (TRIMMED[p.slug]) return TRIMMED[p.slug];
  const s = p.intro.trim();
  if (s.length <= 160) return s;
  const first = s.match(/^.+?[.!?](?=\s)/);
  if (first && first[0].length >= 140 && first[0].length <= 160) return first[0];
  const cut = s.slice(0, 159);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—–-]+$/, '') + '…';
}

// ---------- JSON-LD ----------
const PERSON_ID = `${SITE}/#person`;

export const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Jose R. Ortiz',
  alternateName: 'Jose Ortiz',
  jobTitle: 'Design Director',
  url: `${SITE}/`,
  image: `${SITE}/og.jpg`,
  email: EMAIL,
  sameAs: [LINKEDIN],
  address: { '@type': 'PostalAddress', addressLocality: 'Astoria, Queens, New York', addressRegion: 'NY', addressCountry: 'US' },
  knowsAbout: ['Brand identity', 'Web design', 'Webflow', 'Astro', 'Motion design', 'Design systems'],
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  name: 'Jose Ortiz',
  url: `${SITE}/`,
  inLanguage: 'en-US',
  publisher: { '@id': PERSON_ID },
});

const personRef = () => ({ '@type': 'Person', '@id': PERSON_ID, name: 'Jose R. Ortiz', url: `${SITE}/` });

export function creativeWork(p, image) {
  const year = String(p.year || '').match(/\d{4}/);
  return {
    '@type': 'CreativeWork',
    name: p.t,
    description: projectDescription(p),
    url: `${SITE}/work/${p.slug}/`,
    image: new URL(image, SITE).href,
    creator: personRef(),
    ...(year ? { dateCreated: year[0] } : {}),
  };
}

export const breadcrumbs = (p) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE}/work/` },
    { '@type': 'ListItem', position: 3, name: p.t, item: `${SITE}/work/${p.slug}/` },
  ],
});

// one <script type="application/ld+json"> per page, as an @graph
export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });
