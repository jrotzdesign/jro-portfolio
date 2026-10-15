// Every motion piece on the site, in one place. /in-motion/ shows all of them; a project page shows only the pieces
// whose `project` is that project's slug — a piece only appears on a project it was verified against.
//
//  t       'lottie' (JSON in public/motion — vector, the same files the Webflow sites play)
//  Every piece is a Lottie file, never a recording or an embedded page — only the animation itself, at retina sharpness.
//  Website reels and brand films are videos and live in each project's `films` instead.
//  loop    'hold'     play once, rest on the finished frame for HOLD ms, play again (logo reveals)
//          'seamless' loop continuously (icon loops, reels)
//  end     last frame to play to, for intros that go on to wipe away and reveal their website (IPX, Ardelle Gardens):
//          the card stops on the finished logo, never on the reveal
//  view    'x y w h' crop of the composition (its viewBox), for intros built for a full browser window where the
//          logo is a small mark in the middle — measured from the rendered frames so the logo fills the card
//  bg      card background (the brand's own colour where it is known)
//  fit     'cover' for files that paint their own full-frame background; otherwise fitted inside the card
//          (inset = extra padding as a % of the card, for small square icons)
//  start   frame a 'hold'/'seamless' piece begins from (and returns to), for files whose first frames are empty
//  family  /in-motion/ grouping: an operator in FAMILIES (the Facility logo intros section), or AGENCY
//          (the agency's and independent work). The Prestige section is every piece whose project is 'prestige'.
//  source  where the file came from, so it can be re-checked
//
// Verified Oct 13 2026:
//  · Prestige — prestigeas.com (logo, icon loops; same icon files on all 16 facility sites) and the Prestige case study
//    page on the MOZART&CO Webflow site (/prestige-case-study: wordmark build, the mark's four elements, facility names)
//  · Lionstone — the lion-mark preloader shared by the Lionstone facility sites; web motion from the Mozart case study
//  · Glades West — gladeswestrehab.com · Carlton Shores — Mozart case study · Mozart&Co. — the MOZART&CO Webflow site
//  · IPX — Nando's own After Effects file (~/Downloads/ipx animation)
//  · Facility intros — each facility's Webflow site; operator from the client folders in Dropbox MOZART&CO
//    (Lion Care/Facilties, Quantum/Facilities, Paramount/Facilities, Millennial/Facilities, EXCELSIOR CARE, OAK GLEN)

export const HOLD = 2600; // ms the finished frame rests before a 'hold' piece plays again

const W = 'Webflow site';
export const AGENCY = 'Agency and independent';
export const motion = [
  // ── Prestige Healthcare: the brand system in motion ──
  { id: 'prestige-logo', project: 'prestige', t: 'lottie', src: '/motion/prestige-logo.json', name: 'Prestige · logo reveal', bg: '#E4F0FC', loop: 'hold', source: 'prestigeas.com' },
  { id: 'prestige-wordmark', start: 9, project: 'prestige', t: 'lottie', src: '/motion/prestige-wordmark.json', name: 'Prestige · building the wordmark', bg: '#E4F0FC', loop: 'seamless', source: 'MOZART&CO Webflow · /prestige-case-study (header.json)' },
  { id: 'prestige-mark', project: 'prestige', t: 'lottie', src: '/motion/prestige-mark.json', name: 'Prestige · four elements, one mark', bg: '#FFFFFF', loop: 'hold', source: 'MOZART&CO Webflow · /prestige-case-study (animation-mobile.json)' },
  { id: 'prestige-network', project: 'prestige', t: 'lottie', src: '/motion/prestige-network.json', name: 'Prestige · one system, every facility', bg: '#C5E2F7', fit: 'cover', loop: 'seamless', source: 'MOZART&CO Webflow · /prestige-case-study (main.json)' },
  { id: 'prestige-care', project: 'prestige', inset: 18, t: 'lottie', src: '/motion/prestige-care.json', name: 'Prestige · care-network icon', bg: '#0D2538', loop: 'seamless', source: 'prestigeas.com + every Prestige facility site' },
  { id: 'prestige-bloom', project: 'prestige', inset: 18, t: 'lottie', src: '/motion/prestige-bloom.json', name: 'Prestige · bloom icon', bg: '#0D2538', loop: 'seamless', source: 'prestigeas.com + every Prestige facility site' },
  { id: 'lionstone-mark', family: 'Lionstone', project: 'lionstone', t: 'lottie', src: '/motion/lionstone-mark.json', name: 'Lionstone · group mark', bg: '#0E4C57', loop: 'hold', source: 'Lionstone facility sites (preloader)' },


  // ── agency and independent ──
  { id: 'mozart-wordmark', inset: 12, family: AGENCY, project: 'mozart', t: 'lottie', src: '/motion/mozart-wordmark.json', name: 'Mozart&Co. · the agency’s own wordmark', bg: '#0A0500', loop: 'hold', source: 'MOZART&CO Webflow site' },
  { id: 'ipx-intro', view: '230 140 1459 821', family: AGENCY, project: 'ipx', t: 'lottie', src: '/motion/ipx-intro.json', name: 'IPX · logo intro · JRO Design', bg: '#22254D', fit: 'cover', end: 78, loop: 'hold', source: '~/Downloads/ipx animation (After Effects → Lottie)' },

  // ── facility logo intros: /in-motion/ only, grouped by operator ──
  { id: 'shore-acres', view: '207 131 1035 647', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/shore-acres.json', name: 'Shore Acres', bg: '#1E2A38', loop: 'hold', source: W },
  { id: 'gulf-shores', view: '310 204 819 546', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/gulf-shores.json', name: 'Gulfshore', bg: '#AF726D', loop: 'hold', source: W },
  { id: 'lake-gibson', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/lake-gibson.json', name: 'The Club at Lake Gibson', bg: '#AACAD5', loop: 'hold', source: W },
  { id: 'ardelle-gardens', view: '422 238 1075 605', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/ardelle-gardens.json', name: 'Ardelle Gardens', bg: '#243C4A', loop: 'hold', end: 72, source: W + ' (Bristol)' },
  { id: 'madison-pointe', family: 'Lion Care', t: 'lottie', src: '/motion/madison-pointe.json', name: 'Madison Pointe', bg: '#062B42', loop: 'hold', source: W },
  { id: 'bayside', view: '295 201 1074 680', family: 'Lion Care', t: 'lottie', src: '/motion/bayside.json', name: 'Bayside', bg: '#E6E7E3', loop: 'hold', source: W },
  { id: 'advanced', view: '240 173 1298 821', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/advanced.json', name: 'Advanced Care', bg: '#FFFFFF', loop: 'hold', source: W },
  { id: 'lexington', view: '268 187 910 568', family: 'Lion Care', t: 'lottie', src: '/motion/lexington.json', name: 'Lexington', bg: '#EFEDE6', loop: 'hold', source: W },
  { id: 'woodbridge', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/woodbridge.json', name: 'Woodbridge', bg: '#8492A0', loop: 'hold', source: W },
  { id: 'apollo', view: '341 227 760 507', family: 'Lion Care', t: 'lottie', src: '/motion/apollo.json', name: 'Apollo', bg: '#0A1A2E', loop: 'hold', source: W },
  { id: 'greenbriar', view: '457 253 1003 564', family: 'Quantum', fit: 'cover', t: 'lottie', src: '/motion/greenbriar.json', name: 'Greenbriar', bg: '#0F3B2E', loop: 'hold', source: W },
  { id: 'fort-lauderdale', family: 'Quantum', fit: 'cover', t: 'lottie', src: '/motion/fort-lauderdale.json', name: 'Fort Lauderdale', bg: '#4D674A', loop: 'hold', source: W },
  { id: 'glades-west-mark', view: '254 142 1410 793', family: 'Quantum', project: 'glades-west', t: 'lottie', src: '/motion/glades-west-mark.json', name: 'Glades West · mark reveal', bg: '#0F4556', loop: 'hold', source: 'gladeswestrehab.com' },
  { id: 'lakes-of-clermont', view: '424 238 590 332', family: 'Millennial', fit: 'cover', t: 'lottie', src: '/motion/lakes-of-clermont.json', name: 'The Lakes of Clermont', bg: '#0B1A3F', loop: 'hold', source: 'lakesofclermonthrc.com' },
  { id: 'the-ponce', view: '367 233 703 439', family: 'Paramount', fit: 'cover', t: 'lottie', src: '/motion/the-ponce.json', name: 'The Ponce', bg: '#12364F', loop: 'hold', source: W },
  { id: 'woodland-grove', family: 'Paramount', t: 'lottie', src: '/motion/woodland-grove.json', name: 'Woodland Grove', bg: '#EEF1EC', loop: 'hold', source: W },
  { id: 'ridgecrest', view: '132 86 1174 734', family: 'Paramount', t: 'lottie', src: '/motion/ridgecrest.json', name: 'Ridgecrest', bg: '#24384F', loop: 'hold', source: W },
  { id: 'alden-lakes', family: 'Millennial', t: 'lottie', src: '/motion/alden-lakes.json', name: 'Alden Lakes', bg: '#EEF0EA', loop: 'hold', source: W },
  { id: 'alora', inset: 10, family: 'Millennial', t: 'lottie', src: '/motion/alora.json', name: 'Alora', bg: '#F2EFE6', loop: 'hold', end: 85, source: W },
  { id: 'creekstone', family: 'Millennial', t: 'lottie', src: '/motion/creekstone.json', name: 'Creekstone', bg: '#FAF1EA', loop: 'hold', source: W },
  { id: 'seravita-springs', family: 'Millennial', t: 'lottie', src: '/motion/seravita-springs.json', name: 'Seravita Springs', bg: '#EEF3F5', loop: 'hold', source: W },
  { id: 'williston', family: 'Millennial', t: 'lottie', src: '/motion/williston.json', name: 'Williston', bg: '#F6EFE7', loop: 'hold', source: W },
  { id: 'excel', view: '326 216 783 516', family: 'Other operators', t: 'lottie', src: '/motion/excel.json', name: 'Excelsior Care', bg: '#2B2730', loop: 'hold', source: W },
  { id: 'oak-glen', family: 'Other operators', fit: 'cover', t: 'lottie', src: '/motion/oak-glen.json', name: 'Oak Glen', bg: '#1E2C33', loop: 'hold', source: W },
  { id: 'carerite', view: '482 255 480 250', family: 'Other operators', t: 'lottie', src: '/motion/carerite.json', name: 'CareRite', bg: '#051B34', loop: 'hold', source: W },
];

export const FAMILIES = ['Lion Care', 'Quantum', 'Paramount', 'Millennial', 'Lionstone', 'Other operators'];
export const motionFor = (slug) => motion.filter((m) => m.project === slug);
export const byId = Object.fromEntries(motion.map((m) => [m.id, m]));
