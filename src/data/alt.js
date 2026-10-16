// Alt text for project imagery ("<Project> — <what it shows>"), keyed by image path. Written from the images
// themselves, not the filenames (several gallery filenames don't match what they show).
// Card and chapter thumbnails sit inside links or captions that already name the project, so they stay alt="".
export const ALT = {
  '/img/mozart-site.webp': 'Mozart&Co. website — homepage hero, “Engineering market leaders in healthcare & real estate”, with client logos',

  '/img/prestige-thumb.webp': 'Prestige Healthcare — presenter on stage in front of the facility network wall',
  '/img/gallery/prestige--hero-stage.webp': 'Prestige Healthcare — the facility network wall on an event stage, audience in silhouette',
  '/img/gallery/prestige--gallery-02.webp': 'Prestige Healthcare — brochure page with the icon set and a caregiver photo',
  '/img/gallery/prestige--gallery-05.webp': 'Prestige Healthcare — stationery: folder, notebook, business cards and pen',
  '/img/gallery/prestige--gallery-07.webp': 'Prestige Healthcare — business cards with the gradient pattern and foil mark',

  '/img/lionstone-grid-thumb.webp': 'Lionstone Healthcare — brochure cover and an open spread',
  '/img/gallery/lionstone--poster.webp': 'Lionstone Healthcare — Deuterium Variable type specimen with construction lines',
  '/img/gallery/lionstone--map.webp': 'Lionstone Healthcare — interactive facilities map, “Mapping the Future of Healthcare”',
  '/img/gallery/lionstone--print-cover.webp': 'Lionstone Healthcare — printed brochure, “Always Here for You”',
  '/img/gallery/lionstone--social-grid-1.webp': 'Lionstone Healthcare — social media grid on a phone',

  '/img/towne-thumb.webp': 'Towne Group — lobby wall reading “Stability through partnership” behind the reception desk',
  '/img/gallery/towne--gallery-a-1.webp': 'Towne Group — branded reception area, “Stability through partnership”',
  '/img/gallery/towne--gallery-b-1.webp': 'Towne Group — banner flag on a brick building',
  '/img/gallery/towne--gallery-c-1.webp': 'Towne Group — app icon on a phone held up against the sky',
  '/img/gallery/towne--gallery-d-1.webp': 'Towne Group — website on a laptop resting on an armchair',

  '/img/glades-west-thumb.webp': 'Glades West — business cards with the foil compass mark',
  '/img/gallery/glades-west--palette.webp': 'Glades West — brand colour palette page',
  '/img/gallery/glades-west--team.webp': 'Glades West — therapy team in navy scrubs in the rehab gym',
  '/img/gallery/glades-west--building-sign.webp': 'Glades West — building sign, “Pioneering concepts in rehabilitation care”',
  '/img/gallery/glades-west--graduation.webp': 'Glades West — staff applauding a resident in a graduation cap and gown',

  '/img/village-place-lobby-receptionist.webp': 'Village Place — reception desk under the lit Village Place wall sign',
  '/img/gallery/village-place--id-brochure-cover.webp': 'Village Place — brochure cover with the V mark',
  '/img/gallery/village-place--id-business-cards.webp': 'Village Place — business cards, front and back',
  '/img/gallery/village-place--people-hero.webp': 'Village Place — three staff members in front of the lobby sign',

  '/img/carlton-shores-grid-thumb.webp': 'Carlton Shores — the mark on navy with ripple lines',
  '/img/gallery/carlton-shores--boat-gym.webp': 'Carlton Shores — therapy gym with a boat set into a blue floor',
  '/img/gallery/carlton-shores--lobby-sign.webp': 'Carlton Shores — lobby lounge with the illuminated sign',
  '/img/gallery/carlton-shores--therapy-rings.webp': 'Carlton Shores — therapist helping a resident with a ring exercise',
  '/img/gallery/carlton-shores--team-boat.webp': 'Carlton Shores — care team gathered around the therapy boat',

  '/img/precision-thumb.webp': 'Precision — stacked brand cubes in a concrete space',
  '/img/gallery/precision--gallery-a-1.webp': 'Precision — folder, letterhead and business cards',
  '/img/gallery/precision--gallery-a-2.webp': 'Precision — perforated packaging with the wordmark',
  '/img/gallery/precision--gallery-a-3.webp': 'Precision — business cards and letterhead laid out',
  '/img/gallery/precision--gallery-a-4.webp': 'Precision — box with the wordmark and contact details',

  '/img/lumberjack.webp': 'Mr. Lumberjack — homepage, “From the farm to your fourth-floor walk-up”',
  '/img/lumberjack-2.webp': 'Mr. Lumberjack — product row: Fraser fir, wreaths and garland',

  '/img/mon-amie.webp': 'Mon Amie — store homepage with the new-collection hero',
  '/img/gallery/mon-amie--01.webp': 'Mon Amie — homepage, “Lo que sí te vas a poner”',

  '/img/selectblinds.webp': 'Selectblinds Checkout — cart, delivery, payment and confirmation screens',
  '/img/gallery/selectblinds--flow.webp': 'Selectblinds Checkout — the full checkout flow, screen by screen',
  '/img/gallery/selectblinds--delivery.webp': 'Selectblinds Checkout — delivery details and shipping method screens',
  '/img/gallery/selectblinds--payment.webp': 'Selectblinds Checkout — payment and order confirmation screens',

  '/img/ipx.webp': 'Indoor Pickleball X — homepage concept, “Indoor pickleball. Any day, any hour.”',
  '/img/gallery/ipx--01.webp': 'Indoor Pickleball X — homepage hero in a wide view',
};

// alt for a project image; falls back to the project name so nothing meaningful is ever unlabelled
export const altFor = (src, p) => ALT[src] ?? `${p.t} — project image`;
