// The gate page: the JRO mark as the lock. It morphs with every keystroke, collapses and shakes on a wrong word,
// and blooms to the full-weight mark before the site slides in on the right one. Self-contained (no site assets),
// because nothing behind the gate is reachable until the cookie is set.
import JRO from '../src/data/jro3.json';
import { makeJRO, V } from '../src/lib/morph.js';

const M = makeJRO(JRO);
const first = M.build(V(0.4, 0.2));
const navMark = M.build(V(0, 0));

// Client-side copy of the morph engine (weights 0–2 × heights 0–1 over the six drawn variants).
const ENGINE = `
function makeJRO(JRO){const W=['181','283','448'],H=['235','379'];const get=(wi,hi)=>JRO[W[wi]+'x'+H[hi]];
function letter(i,w,h){w=Math.max(0,Math.min(2,w));h=Math.max(0,Math.min(1,h));const w0=Math.min(1,Math.floor(w)),w1=Math.min(2,w0+1),tw=w-w0;
const A=get(w0,0)[i],B=get(w1,0)[i],C=get(w0,1)[i],D=get(w1,1)[i];
return A.map((sp,s)=>sp.map((seg,k)=>seg.map((v,n)=>{const top=A[s][k][n]*(1-tw)+B[s][k][n]*tw,bot=C[s][k][n]*(1-tw)+D[s][k][n]*tw;return top*(1-h)+bot*h;})));}
function bbox(sps){let minx=1e9,maxx=-1e9,maxy=0;sps.forEach(sp=>sp.forEach(c=>{for(let n=0;n<8;n+=2){if(c[n]<minx)minx=c[n];if(c[n]>maxx)maxx=c[n];if(c[n+1]>maxy)maxy=c[n+1];}}));return{minx,maxx,maxy};}
function gap(i,w,h){const a=bbox(letter(i,w,h)),b=bbox(letter(i+1,w,h));return b.minx-a.maxx;}
function build(P){const f=v=>v.toFixed(2);const ds=[];let x=0,maxH=0,prevRight=0;P.forEach((p,i)=>{const sps=letter(i,p.w,p.h),bb=bbox(sps);
if(i>0){const q=P[i-1];x=prevRight+gap(i-1,(q.w+p.w)/2,(q.h+p.h)/2);}const dx=x-bb.minx;
ds.push(sps.map(sp=>'M'+f(sp[0][0]+dx)+' '+f(sp[0][1])+sp.map(c=>'C'+f(c[2]+dx)+' '+f(c[3])+' '+f(c[4]+dx)+' '+f(c[5])+' '+f(c[6]+dx)+' '+f(c[7])).join('')+'Z').join(''));
prevRight=x+(bb.maxx-bb.minx);if(bb.maxy>maxH)maxH=bb.maxy;});return{d:ds,width:prevRight,height:maxH};}
function apply(svg,P){const r=build(P);svg.querySelectorAll('path').forEach((p,i)=>p.setAttribute('d',r.d[i]));svg.setAttribute('viewBox','0 0 '+r.width.toFixed(1)+' '+r.height.toFixed(1));return r;}
return{letter,build,apply};}`;

const CSS = `
:root{--rosa:#E4007C;--ink:#121316;--ink-2:#55585f;--bone:#f2f3f0;--bone-2:#e6e7e3;--night:#0e0f12;--accent:#29A191;--line:rgba(18,19,22,.12);--display:"Bricolage Grotesque",sans-serif;--body:"Figtree",sans-serif;--mono:"DM Mono",monospace;--pad:clamp(1.25rem,4vw,3.5rem)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--bone);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;overflow:hidden}
::selection{background:var(--accent);color:#0b1513}
.mono{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase}
.gate{position:fixed;inset:0;display:grid;grid-template-rows:64px 1fr auto;transition:transform .9s cubic-bezier(.76,0,.24,1),opacity .6s;will-change:transform}
.gate.open{transform:translateY(-100%)}
.nav{display:flex;justify-content:space-between;align-items:center;padding:0 var(--pad)}
.nav svg{height:30px;width:auto;fill:var(--ink)}
.nav .c{opacity:.6}
.stage{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(1.5rem,4vh,3rem);padding:0 var(--pad)}
.mark{width:min(62vw,48vh * 448 / 379);height:48vh;display:flex;align-items:center;justify-content:center}
.mark svg{height:100%;width:auto;max-width:100%;fill:var(--ink);overflow:visible;transition:fill .3s}
.mark.no svg{fill:var(--rosa)}
.mark.yes svg{fill:var(--accent)}
form{display:flex;align-items:flex-end;gap:1rem;width:min(100%,34rem)}
.field{flex:1;position:relative}
input{width:100%;font:500 clamp(1.4rem,3.2vw,2.2rem)/1.2 var(--display);letter-spacing:-.02em;color:var(--ink);background:none;border:0;border-bottom:1px solid var(--ink);padding:.3rem 0;outline:0;border-radius:0;font-variation-settings:"opsz" 96}
input::placeholder{color:var(--ink-2);opacity:.55}
input:focus{border-bottom-color:var(--accent)}
button.go{width:48px;height:48px;border:1px solid var(--line);border-radius:999px;background:none;color:var(--ink);font:500 1.1rem var(--display);cursor:pointer;transition:background .3s,border-color .3s,color .3s;flex:0 0 auto}
button.go:hover{background:var(--accent);border-color:var(--accent);color:#0b1513}
.hint{min-height:1.4em;color:var(--ink-2);transition:color .3s}
.hint.no{color:var(--rosa)}.hint.yes{color:var(--accent)}
.foot{display:flex;justify-content:space-between;padding:1.4rem var(--pad);border-top:1px solid var(--line)}
@media(max-width:700px){.mark{width:80vw;height:34vh}.foot{flex-direction:column;gap:.4rem}}
@media(prefers-reduced-motion:reduce){.gate{transition:none}}
`;

const JS = `
const JRO=__JRO__; const M=(${ENGINE})(JRO);
const $=s=>document.querySelector(s); const svg=$('#mark svg'), mark=$('#mark'), input=$('#word'), hint=$('#hint'), form=$('#f'), gate=$('#gate');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Three letters ease toward a shared target; each one lags a little more than the last, so the mark swells
// as one continuous wave rather than reacting letter by letter. No velocity, no kicks.
const RATE=[.075,.058,.045];
const L=[0,1,2].map(()=>({w:.4,h:.2}));
let target={w:.4,h:.2}, mood='idle', t0=performance.now(), done=false;
const base=len=>{ const p=Math.min(1,len/12); const e=1-Math.pow(1-p,2); return {w:.4+1.6*e, h:.2+.8*e}; };
function tick(now){
  const t=(now-t0)/1000;
  L.forEach((l,i)=>{
    let tw=target.w, th=target.h;
    if(mood==='idle'){ tw+=Math.sin(t*.6+i*.9)*.08; th+=Math.sin(t*.45+i*.7)*.03; }   // slow breath
    l.w+=(tw-l.w)*RATE[i]; l.h+=(th-l.h)*RATE[i];
  });
  M.apply(svg,L.map(l=>({w:Math.max(0,Math.min(2,l.w)),h:Math.max(0,Math.min(1,l.h))})));
  if(!done) requestAnimationFrame(tick);
}
if(!reduce) requestAnimationFrame(tick); else M.apply(svg,[{w:1,h:.5},{w:1,h:.5},{w:1,h:.5}]);
function retarget(){ const n=input.value.length; target=n?base(n):{w:.4,h:.2}; mood=n?'typing':'idle'; }
input.addEventListener('input',()=>{ retarget(); mark.className='mark'; hint.className='mono hint'; hint.textContent=input.value?'':'Type the word, press enter.'; });
let tries=0; const nopes=['Not it.','Still not it.','Ask Jose for the word.'];
form.addEventListener('submit',async e=>{
  e.preventDefault(); const word=input.value.trim(); if(!word||done) return;
  const r=await fetch('/__gate',{method:'POST',body:new FormData(form)}).catch(()=>null);
  if(r&&r.ok){
    mood='yes'; target={w:2,h:1}; mark.className='mark yes'; hint.className='mono hint yes'; hint.textContent='Welcome in.';
    setTimeout(()=>gate.classList.add('open'),700);
    setTimeout(()=>{ done=true; location.reload(); },1600);
  } else {
    tries++; mood='no'; target={w:0,h:0}; mark.className='mark no'; hint.className='mono hint no'; hint.textContent=nopes[Math.min(tries-1,2)];
    setTimeout(()=>{ input.value=''; retarget(); mark.className='mark'; input.focus(); },900);
  }
});
const time=$('#time'); const clock=()=>time.textContent='NYC '+new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()); clock(); setInterval(clock,15000);
`;

export function gatePage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Jose Ortiz — JRO Design</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Figtree:wght@400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="gate" id="gate">
  <nav class="nav">
    <svg viewBox="0 0 ${navMark.width.toFixed(1)} ${navMark.height.toFixed(1)}" aria-label="JRO">${navMark.d.map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('')}</svg>
    <span class="mono c">Private preview</span>
    <span class="mono c" id="time">NYC —:—</span>
  </nav>
  <main class="stage">
    <div class="mark" id="mark"><svg viewBox="0 0 ${first.width.toFixed(1)} ${first.height.toFixed(1)}" aria-hidden="true">${first.d.map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('')}</svg></div>
    <form id="f" autocomplete="off">
      <div class="field"><input id="word" name="word" type="password" placeholder="the magic word" autocapitalize="off" autocorrect="off" spellcheck="false" autofocus aria-label="Password"></div>
      <button class="go" type="submit" aria-label="Enter">→</button>
    </form>
    <div class="mono hint" id="hint">Type the word, press enter.</div>
  </main>
  <footer class="foot mono">
    <span>© ${new Date().getFullYear()} Jose R. Ortiz · JRO Design · New York</span>
    <span>This site is behind a password while it's being finished.</span>
  </footer>
</div>
<script>${JS.replace('__JRO__', JSON.stringify(JRO))}</script>
</body>
</html>`;
}
