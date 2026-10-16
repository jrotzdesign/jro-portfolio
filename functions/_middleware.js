// Runs in front of every request on Cloudflare Pages.
//  · www.jrortizdesign.com/* → 301 to https://jrortizdesign.com/* (same path and query), so there is one canonical host
//  · HTML is revalidated on every visit (public, max-age=0, must-revalidate): a deploy or a removed page shows up at
//    once, and pages stay eligible for the browser's back/forward cache. Assets keep their headers from public/_headers.
const APEX = 'jrortizdesign.com';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === `www.${APEX}`) {
    url.hostname = APEX;
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.href, 301);
  }
  const res = await next();
  if (!/text\/html/i.test(res.headers.get('Content-Type') || '')) return res;
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return out;
}
