// Every motion piece on the site, in one place. /in-motion/ shows all of them; a project page shows only the pieces
// whose `project` is that project's slug — a piece only appears on a project it was verified against.
//
//  t       'lottie' (JSON in public/motion) | 'video' (mp4 in public/motion, muted, no controls, loops)
//  loop    'hold'     play once, rest on the finished frame for HOLD ms, play again (logo reveals)
//          'seamless' loop continuously (icon loops, reels)
//  end     optional last frame to play to — for files whose final frames are blank
//  bg      card background (the brand's own colour where it is known)
//  fit     'cover' for files that paint their own full-frame background; otherwise fitted inside the card
//          (inset = extra padding as a % of the card, for small square icons)
//  family  /in-motion/ grouping for pieces without a project page
//  source  where the file came from, so it can be re-checked
//
// Verified Oct 13 2026:
//  · Prestige — prestigeas.com (logo, icon loops; same icon files on all 16 facility sites) and the Prestige case study
//    page on the MOZART&CO Webflow site (/prestige-case-study: wordmark build, the mark's four elements, facility names)
//  · Lionstone — the lion-mark preloader shared by the Lionstone facility sites; web motion from the Mozart case study
//  · Glades West — gladeswestrehab.com · Carlton Shores — Mozart case study · Mozart&Co. — the MOZART&CO Webflow site
//  · Precision — Dropbox MOZART&CO/MOZART CO/Branding Animiaiton/Precision/Precision Brand Reel.mp4
//  · IPX, Mon Amie, Mr. Lumberjack — Nando's own files (~/Downloads/ipx animation, mon-amie-theme, mr-lumberjack-site_14)
//  · Facility intros — each facility's Webflow site; operator from the client folders in Dropbox MOZART&CO
//    (Lion Care/Facilties, Quantum/Facilities, Paramount/Facilities, Millennial/Facilities, EXCELSIOR CARE, OAK GLEN)

export const HOLD = 2600; // ms the finished frame rests before a 'hold' piece plays again

const W = 'Webflow site';
export const motion = [
  // ── brand systems: shown on their project pages ──
  { id: 'prestige-logo', project: 'prestige', t: 'lottie', src: '/motion/prestige-logo.json', name: 'Prestige · logo reveal', bg: '#E4F0FC', loop: 'hold', source: 'prestigeas.com' },
  { id: 'prestige-wordmark', project: 'prestige', t: 'lottie', src: '/motion/prestige-wordmark.json', name: 'Prestige · building the wordmark', bg: '#E4F0FC', loop: 'seamless', source: 'MOZART&CO Webflow · /prestige-case-study (header.json)' },
  { id: 'prestige-mark', project: 'prestige', t: 'lottie', src: '/motion/prestige-mark.json', name: 'Prestige · four elements, one mark', bg: '#FFFFFF', loop: 'hold', source: 'MOZART&CO Webflow · /prestige-case-study (animation-mobile.json)' },
  { id: 'prestige-network', project: 'prestige', t: 'lottie', src: '/motion/prestige-network.json', name: 'Prestige · one system, every facility', bg: '#C5E2F7', fit: 'cover', loop: 'seamless', source: 'MOZART&CO Webflow · /prestige-case-study (main.json)' },
  { id: 'prestige-care', project: 'prestige', inset: 18, t: 'lottie', src: '/motion/prestige-care.json', name: 'Prestige · care-network icon', bg: '#0D2538', loop: 'seamless', source: 'prestigeas.com + every Prestige facility site' },
  { id: 'prestige-bloom', project: 'prestige', inset: 18, t: 'lottie', src: '/motion/prestige-bloom.json', name: 'Prestige · bloom icon', bg: '#0D2538', loop: 'seamless', source: 'prestigeas.com + every Prestige facility site' },
  { id: 'lionstone-mark', project: 'lionstone', t: 'lottie', src: '/motion/lionstone-mark.json', name: 'Lionstone · lion mark', bg: '#0E4C57', loop: 'hold', source: 'Lionstone facility sites (preloader)' },
  { id: 'lionstone-web', project: 'lionstone', t: 'video', src: '/motion/lionstone-web-motion.mp4', poster: '/motion/lionstone-web-motion.jpg', name: 'Lionstone · the website in motion', bg: '#F4F5F5', loop: 'seamless', source: 'cdn.mozartcompany.com/work/lionstone/web-motion.mp4' },
  { id: 'glades-west-mark', project: 'glades-west', t: 'lottie', src: '/motion/glades-west-mark.json', name: 'Glades West · mark reveal', bg: '#0F4556', loop: 'hold', source: 'gladeswestrehab.com' },
  { id: 'carlton-web', project: 'carlton-shores', t: 'video', src: '/motion/carlton-shores-website-motion.mp4', poster: '/motion/carlton-shores-website-motion.jpg', name: 'Carlton Shores · the website in motion', bg: '#002E40', loop: 'seamless', source: 'cdn.mozartcompany.com/work/carlton-shores/website-motion.mp4' },
  { id: 'precision-reel', project: 'precision', t: 'video', src: '/motion/precision-reel.mp4', poster: '/motion/precision-reel.jpg', name: 'Precision · brand reel', bg: '#F2EDE8', loop: 'seamless', source: 'Dropbox · MOZART CO/Branding Animiaiton/Precision' },
  { id: 'mozart-wordmark', project: 'mozart', t: 'lottie', src: '/motion/mozart-wordmark.json', name: 'Mozart&Co. · wordmark', bg: '#0A0500', loop: 'hold', source: 'MOZART&CO Webflow site' },

  // ── JRO Design ──
  { id: 'lumberjack-intro', project: 'lumberjack', t: 'video', src: '/motion/lumberjack-intro.mp4', poster: '/motion/lumberjack-intro.jpg', name: 'Mr. Lumberjack · landing intro', bg: '#FFFDF9', loop: 'seamless', source: '~/Downloads/mr-lumberjack-site_14/mr-lumberjack-intro.html (recorded)' },
  { id: 'ipx-intro', project: 'ipx', t: 'lottie', src: '/motion/ipx-intro.json', name: 'IPX · logo intro', bg: '#22254D', fit: 'cover', end: 86, loop: 'hold', source: '~/Downloads/ipx animation (After Effects → Lottie)' },
  { id: 'mon-amie-intro', project: 'mon-amie', t: 'video', src: '/motion/mon-amie-intro.mp4', poster: '/motion/mon-amie-intro.jpg', name: 'Mon Amie · landing intro', bg: '#FFFFFF', loop: 'seamless', source: '~/Downloads/mon-amie-theme/reference (recorded)' },

  // ── facility logo intros: /in-motion/ only, grouped by operator ──
  { id: 'shore-acres', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/shore-acres.json', name: 'Shore Acres', bg: '#1E2A38', loop: 'hold', source: W },
  { id: 'gulf-shores', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/gulf-shores.json', name: 'Gulfshore', bg: '#AF726D', loop: 'hold', source: W },
  { id: 'lake-gibson', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/lake-gibson.json', name: 'The Club at Lake Gibson', bg: '#AACAD5', loop: 'hold', source: W },
  { id: 'ardelle-gardens', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/ardelle-gardens.json', name: 'Ardelle Gardens', bg: '#243C4A', loop: 'hold', end: 76, source: W + ' (Bristol)' },
  { id: 'madison-pointe', family: 'Lion Care', t: 'lottie', src: '/motion/madison-pointe.json', name: 'Madison Pointe', bg: '#062B42', loop: 'hold', source: W },
  { id: 'bayside', family: 'Lion Care', t: 'lottie', src: '/motion/bayside.json', name: 'Bayside', bg: '#E6E7E3', loop: 'hold', source: W },
  { id: 'advanced', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/advanced.json', name: 'Advanced Care', bg: '#FFFFFF', loop: 'hold', source: W },
  { id: 'lexington', family: 'Lion Care', t: 'lottie', src: '/motion/lexington.json', name: 'Lexington', bg: '#EFEDE6', loop: 'hold', source: W },
  { id: 'woodbridge', family: 'Lion Care', fit: 'cover', t: 'lottie', src: '/motion/woodbridge.json', name: 'Woodbridge', bg: '#8492A0', loop: 'hold', source: W },
  { id: 'apollo', family: 'Lion Care', t: 'lottie', src: '/motion/apollo.json', name: 'Apollo', bg: '#0A1A2E', loop: 'hold', source: W },
  { id: 'greenbriar', family: 'Quantum', fit: 'cover', t: 'lottie', src: '/motion/greenbriar.json', name: 'Greenbriar', bg: '#0F3B2E', loop: 'hold', source: W },
  { id: 'fort-lauderdale', family: 'Quantum', fit: 'cover', t: 'lottie', src: '/motion/fort-lauderdale.json', name: 'Fort Lauderdale', bg: '#4D674A', loop: 'hold', source: W },
  { id: 'wilton-manors', family: 'Quantum', t: 'video', src: '/motion/wilton-manors.mp4', poster: '/motion/wilton-manors.jpg', name: 'Wilton Manors · brand reel', bg: '#4F5B2B', loop: 'seamless', source: 'Dropbox · MOZART CO/Branding Animiaiton/Willton Manor' },
  { id: 'kendall-lakes', family: 'Quantum', t: 'video', src: '/motion/kendall-lakes.mp4', poster: '/motion/kendall-lakes.jpg', name: 'Kendall Lakes · brand reel', bg: '#2E0E2A', loop: 'seamless', source: 'Dropbox · MOZART CO/Branding Animiaiton/Kendall Lakes' },
  { id: 'the-ponce', family: 'Paramount', fit: 'cover', t: 'lottie', src: '/motion/the-ponce.json', name: 'The Ponce', bg: '#12364F', loop: 'hold', source: W },
  { id: 'woodland-grove', family: 'Paramount', t: 'lottie', src: '/motion/woodland-grove.json', name: 'Woodland Grove', bg: '#EEF1EC', loop: 'hold', source: W },
  { id: 'ridgecrest', family: 'Paramount', t: 'lottie', src: '/motion/ridgecrest.json', name: 'Ridgecrest', bg: '#24384F', loop: 'hold', source: W },
  { id: 'millennial', family: 'Millennial', t: 'video', src: '/motion/millennial.mp4', poster: '/motion/millennial.jpg', name: 'Millennial · brand reel', bg: '#FFFFFF', loop: 'seamless', source: 'Dropbox · MOZART CO/Branding Animiaiton/Millennial' },
  { id: 'lakes-of-clermont', family: 'Millennial', t: 'video', src: '/motion/lakes-of-clermont.mp4', poster: '/motion/lakes-of-clermont.jpg', name: 'Lakes of Clermont · brand reel', bg: '#0B1A3A', loop: 'seamless', source: 'Dropbox · MOZART CO/Branding Animiaiton/Lakes of Clermont' },
  { id: 'alden-lakes', family: 'Millennial', t: 'lottie', src: '/motion/alden-lakes.json', name: 'Alden Lakes', bg: '#EEF0EA', loop: 'hold', source: W },
  { id: 'alora', family: 'Millennial', t: 'lottie', src: '/motion/alora.json', name: 'Alora', bg: '#F2EFE6', loop: 'hold', end: 85, source: W },
  { id: 'creekstone', family: 'Millennial', t: 'lottie', src: '/motion/creekstone.json', name: 'Creekstone', bg: '#FAF1EA', loop: 'hold', source: W },
  { id: 'seravita-springs', family: 'Millennial', t: 'lottie', src: '/motion/seravita-springs.json', name: 'Seravita Springs', bg: '#EEF3F5', loop: 'hold', source: W },
  { id: 'williston', family: 'Millennial', t: 'lottie', src: '/motion/williston.json', name: 'Williston', bg: '#F6EFE7', loop: 'hold', source: W },
  { id: 'excel', family: 'More', t: 'lottie', src: '/motion/excel.json', name: 'Excelsior Care', bg: '#2B2730', loop: 'hold', source: W },
  { id: 'oak-glen', family: 'More', t: 'lottie', src: '/motion/oak-glen.json', name: 'Oak Glen', bg: '#1E2C33', loop: 'hold', source: W },
  { id: 'carerite', family: 'More', t: 'lottie', src: '/motion/carerite.json', name: 'CareRite', bg: '#051B34', loop: 'hold', source: W },
];

export const FAMILIES = ['Lion Care', 'Quantum', 'Paramount', 'Millennial', 'More'];
export const motionFor = (slug) => motion.filter((m) => m.project === slug);
export const byId = Object.fromEntries(motion.map((m) => [m.id, m]));
