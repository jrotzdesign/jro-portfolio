// width/height attributes for an image in public/img, from the manifest scripts/prebuild.mjs writes before each build.
import D from './img-dims.json';

export const dims = (src) => {
  const d = D[src];
  return d ? { width: d[0], height: d[1] } : {};
};
