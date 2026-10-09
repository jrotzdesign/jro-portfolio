// JRO morph v3: anchor-aligned cubic interpolation across 3 weights (181 → 283 → 448 wide) × 2 heights (235 → 379), per letter.
// Letters are positioned with the drawing's own inter-letter gaps (which change with weight — the R's leg tucks under the O at heavier weights).
export function makeJRO(JRO){
  const W=['181','283','448'], H=['235','379'];
  const get=(wi,hi)=>JRO[W[wi]+'x'+H[hi]];
  function letter(i,w,h){
    w=Math.max(0,Math.min(2,w)); h=Math.max(0,Math.min(1,h));
    const w0=Math.min(1,Math.floor(w)), w1=Math.min(2,w0+1), tw=w-w0;
    const A=get(w0,0)[i], B=get(w1,0)[i], C=get(w0,1)[i], D=get(w1,1)[i];
    return A.map((sp,s)=>sp.map((seg,k)=>seg.map((v,n)=>{ const top=A[s][k][n]*(1-tw)+B[s][k][n]*tw, bot=C[s][k][n]*(1-tw)+D[s][k][n]*tw; return top*(1-h)+bot*h; })));
  }
  function bbox(sps){ let minx=Infinity,maxx=-Infinity,maxy=0; sps.forEach(sp=>sp.forEach(c=>{ for(let n=0;n<8;n+=2){ if(c[n]<minx)minx=c[n]; if(c[n]>maxx)maxx=c[n]; if(c[n+1]>maxy)maxy=c[n+1]; } })); return {minx,maxx,maxy}; }
  // gap between letter i and i+1 as drawn, at a given weight/height
  function gap(i,w,h){ const a=bbox(letter(i,w,h)), b=bbox(letter(i+1,w,h)); return b.minx-a.maxx; }
  function build(params){
    const f=v=>v.toFixed(2); const ds=[]; let x=0, maxH=0, prevRight=0;
    params.forEach((p,i)=>{
      const sps=letter(i,p.w,p.h), bb=bbox(sps);
      if(i>0){ const q=params[i-1]; x=prevRight+gap(i-1,(q.w+p.w)/2,(q.h+p.h)/2); }
      const dx=x-bb.minx;
      ds.push(sps.map(sp=>'M'+f(sp[0][0]+dx)+' '+f(sp[0][1])+sp.map(c=>'C'+f(c[2]+dx)+' '+f(c[3])+' '+f(c[4]+dx)+' '+f(c[5])+' '+f(c[6]+dx)+' '+f(c[7])).join('')+'Z').join(''));
      prevRight=x+(bb.maxx-bb.minx); if(bb.maxy>maxH) maxH=bb.maxy;
    });
    return {d:ds,width:prevRight,height:maxH};
  }
  function apply(svg,params){ const r=build(params); const ps=svg.querySelectorAll('path'); ps.forEach((p,i)=>{p.setAttribute('d',r.d[i]); p.setAttribute('fill-rule','evenodd');}); svg.setAttribute('viewBox',`0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`); return r; }
  return {letter,build,apply,bbox};
}

// Convenience: the same params for all three letters.
export const V=(w,h)=>[{w,h},{w,h},{w,h}];
// Server-side SVG path strings for a static mark (used in the HTML so the nav/contact marks exist before JS).
export function staticMark(M,w,h){ const r=M.build(V(w,h)); return {d:r.d,viewBox:`0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`}; }
