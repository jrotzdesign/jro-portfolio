// JRO morph v3: anchor-aligned cubic interpolation across 3 weights (181 → 283 → 448 wide) × 2 heights (235 → 379), per letter.
// Letters are positioned with the drawing's own inter-letter gaps (which change with weight — the R's leg tucks under the O at heavier weights).
export function makeJRO(JRO){
  const W=['181','283','448'], H=['235','379'];
  const get=(wi,hi)=>JRO[W[wi]+'x'+H[hi]];
  function letter(i,w,h){
    h=Math.max(0,Math.min(1,h));
    if(w>2) return block(i,h,Math.min(1,w-2));
    w=Math.max(0,w);
    const w0=Math.min(1,Math.floor(w)), w1=Math.min(2,w0+1), tw=w-w0;
    const A=get(w0,0)[i], B=get(w1,0)[i], C=get(w0,1)[i], D=get(w1,1)[i];
    return A.map((sp,s)=>sp.map((seg,k)=>seg.map((v,n)=>{ const top=A[s][k][n]*(1-tw)+B[s][k][n]*tw, bot=C[s][k][n]*(1-tw)+D[s][k][n]*tw; return top*(1-h)+bot*h; })));
  }
  // w ∈ (2,3]: the letter squares off into its solid block (t=1 → a rectangle the width of the J). The outer contour is re-drawn
  // around the block's perimeter in traversal order (so it never folds), counters close into a vertical slit. Opening frames of the hero.
  function block(i,h,t){
    const L=letter(i,2,h), bb=bbox(L), bw=(i===0?bb.maxx-bb.minx:bbox(letter(0,2,h)).maxx), x0=bb.minx, x1=bb.minx+bw, y0=0, y1=bb.maxy;
    const per=2*(x1-x0)+2*(y1-y0);
    // point on the rect perimeter at arc position u (0 at top-left, clockwise); edge id: 0 top,1 right,2 bottom,3 left
    const at=u=>{ u=((u%per)+per)%per; const w=x1-x0, hh=y1-y0; if(u<w) return [x0+u,y0,0]; u-=w; if(u<hh) return [x1,y0+u,1]; u-=hh; if(u<w) return [x1-u,y1,2]; u-=w; return [x0,y1-u,3]; };
    const corner=(e1,e2)=>{ const C={'01':[x1,y0],'12':[x1,y1],'23':[x0,y1],'30':[x0,y0]}; return C[''+e1+e2]||C[''+e2+e1]||null; };
    return L.map((sp,s)=>{
      if(s>0){ const cx=sp.reduce((a,c)=>a+c[0],0)/sp.length; return sp.map(c=>c.map((v,n)=>n%2===0?v+t*(cx-v):v)); }
      const n=sp.length, P=sp.map(c=>[c[0],c[1]]);
      let area=0; for(let k=0;k<n;k++){ const a=P[k], b=P[(k+1)%n]; area+=a[0]*b[1]-b[0]*a[1]; }
      const cw=area>0; // y-down coords: positive = clockwise on screen, the same sense as `at`
      const cum=[0]; for(let k=1;k<=n;k++) cum.push(cum[k-1]+Math.hypot(P[k%n][0]-P[k-1][0],P[k%n][1]-P[k-1][1]));
      const total=cum[n];
      // start: project anchor 0 onto the perimeter (nearest point), then walk the perimeter at the contour's own pace
      let best=0, bd=Infinity; for(let u=0;u<per;u+=2){ const q=at(u); const d=Math.hypot(q[0]-P[0][0],q[1]-P[0][1]); if(d<bd){bd=d;best=u;} }
      const T=P.map((p,k)=>at(best+(cw?1:-1)*per*cum[k]/total));
      return sp.map((c,k)=>{ const a=T[k], b=T[(k+1)%n];
        let c1,c2; if(a[2]===b[2]){ c1=[a[0]+(b[0]-a[0])/3,a[1]+(b[1]-a[1])/3]; c2=[a[0]+2*(b[0]-a[0])/3,a[1]+2*(b[1]-a[1])/3]; }
        else { const cn=corner(a[2],b[2]); c1=cn?[cn[0],cn[1]]:[a[0],a[1]]; c2=cn?[cn[0],cn[1]]:[b[0],b[1]]; }
        const tgt=[a[0],a[1],c1[0],c1[1],c2[0],c2[1],b[0],b[1]];
        return c.map((v,q)=>v+t*(tgt[q]-v)); });
    });
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
  function apply(svg,params,paths){ const r=build(params); const ps=paths||svg.querySelectorAll('path'); ps.forEach((p,i)=>{p.setAttribute('d',r.d[i]); p.setAttribute('fill-rule','evenodd');}); svg.setAttribute('viewBox',`0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`); return r; }
  return {letter,build,apply,bbox};
}

// Convenience: the same params for all three letters.
export const V=(w,h)=>[{w,h},{w,h},{w,h}];
// Server-side SVG path strings for a static mark (used in the HTML so the nav/contact marks exist before JS).
export function staticMark(M,w,h){ const r=M.build(V(w,h)); return {d:r.d,viewBox:`0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`}; }
