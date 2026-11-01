const PLATES=[0,1,2,3,4,5].map(i=>`assets/img/fase-${i}.webp`);
const COVERS=Object.fromEntries(["paper", "love", "born", "super", "monday", "posta", "asr"].map(n=>[n,`assets/img/rubrica-${n}.webp`]));
/* ======== EVENTI: modifica qui ======== */
/* Gli eventi si modificano in content/events.js */
const MAIL=SITE.email;
const OWNER=(()=>{try{return !!(localStorage.getItem('decap-cms-user')||localStorage.getItem('netlify-cms-user'));}catch(e){return false;}})();
let NATAL=null;
const RUBRICHE=[
  {id:'paper-news',name:'Paper-News',cover:'paper',freq:'settimanale e mensile',desc:'I transiti della settimana e del mese.'},
  {id:'paperelle-in-love',name:'Paperelle in Love',cover:'love',freq:'con Luna e Venere',desc:'Amore e relazioni, segno per segno.'},
  {id:'born-in-the-quack',name:'Born in the Quack',cover:'born',freq:'mensile',desc:'Il segno del mese con playlist e ricetta.'},
  {id:'superquack',name:'SuperQuack',cover:'super',freq:'mensile',desc:'Mitologia, storia, figure di donne, femminismi.'},
  {id:'monday-quack',name:'Monday Quack',cover:'monday',freq:'ogni lunedì',desc:'Le risposte al box domande del lunedì.'},
  {id:'la-posta-di-mara',name:'La posta di Mara',cover:'posta',freq:'ogni due settimane',desc:'Le vostre domande arrivate via email.'},
  {id:'asr-papere',name:'ASR Papere',cover:'asr',freq:'settimanale',desc:'Oroscopo giallorosso e pronostici astrali.'}];
const rub=id=>RUBRICHE.find(r=>r.id===id)||RUBRICHE[0];

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const R=Math.PI/180, VS="\uFE0E";
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dateFmt=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Rome'});
const shortDate=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Rome'});
const ymdRome=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const cap=s=>s.replace(/^./,c=>c.toUpperCase());
const MESI=['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const G=p=>p.id==='vertex'?'Vx':p.glyph+VS;
/* URL sicuro dentro style="background-image:url(…)": solo percorsi del sito, https o immagini interne */
const cssUrl=u=>{u=String(u||'').trim();if(!/^(\/(?!\/)|https:\/\/|assets\/|data:image\/(webp|png|jpeg);base64,)/i.test(u))return 'none';return `url('${u.replace(/["'()\\<>\s]/g,c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0'))}')`;};

/* ======== ruota ======== */
const ELEM=['fire','earth','air','water'];
function spread(list,min){const a=list.map(p=>({p,d:p.lon})).sort((x,y)=>x.d-y.d);if(a.length<2)return a;
  for(let it=0;it<80;it++){let mv=false;for(let i=0;i<a.length;i++){const j=(i+1)%a.length,gap=AQ.norm(a[j].d-a[i].d);
    if(gap<min){const p=(min-gap)/2+.01;a[i].d=AQ.norm(a[i].d-p);a[j].d=AQ.norm(a[j].d+p);mv=true;}}if(!mv)break;}return a;}
function arcPath(a1,a2,r1,r2,P){const [x1,y1]=P(a1,r1),[x2,y2]=P(a2,r1),[x3,y3]=P(a2,r2),[x4,y4]=P(a1,r2);const L=AQ.norm(a2-a1)>180?1:0;
  return `M${x1} ${y1}A${r1} ${r1} 0 ${L} 0 ${x2} ${y2}L${x3} ${y3}A${r2} ${r2} 0 ${L} 1 ${x4} ${y4}Z`;}
const LOGO_INNER=(()=>{const t=document.createElement('div');t.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="122 132 362 296" class="logo" role="img" aria-label="Logo AstroQuack">
<path fill="#FADBEB" d="M 395.19 311.27 C 395.19 353.83 360.69 388.33 318.12 388.33 C 275.57 388.33 241.06 353.83 241.06 311.27 C 241.06 268.71 275.57 234.21 318.12 234.21 C 360.69 234.21 395.19 268.71 395.19 311.27 "/>
<path fill="#E3619F" d="M 223.39 203.59 L 175.82 164.04 L 133.61 164.04 L 151.21 178.77 L 204.32 223.21 C 210.64 215.17 214.06 211.24 223.39 203.59 "/>
<path fill="#E3619F" d="M 311.39 276.76 L 223.39 203.59 C 220.50 206.64 210.96 211.24 204.32 223.21 L 297.98 301.59 L 450.43 172.98 L 450.43 164.04 Z M 311.39 276.76 "/>
<path fill="#E3619F" d="M 130.63 416.80 C 130.63 416.80 150.99 414.31 150.99 381.04 L 150.99 178.77 L 163.69 189.21 L 163.69 381.04 C 163.69 381.04 161.92 408.35 181.28 419.28 Z M 130.63 416.80 "/>
<path fill="#E3619F" d="M 411.59 248.73 C 411.51 248.64 411.49 248.54 411.44 248.45 L 297.98 335.61 L 297.98 350.17 L 415.37 260.50 C 414.01 256.67 414.33 251.93 411.59 248.73 "/>
<path fill="#E3619F" d="M 450.43 394.94 C 449.44 378.56 450.43 215.68 450.43 215.68 L 409.52 249.93 C 412.14 255.05 413.49 257.95 414.49 261.18 L 432.05 244.98 L 432.05 395.44 C 432.05 395.44 434.54 407.36 407.72 416.80 L 474.76 416.80 C 474.76 416.80 451.42 411.33 450.43 394.94 "/>
<path fill="#F4ACCD" d="M 334.00 386.97 C 299.38 385.33 267.48 365.48 253.08 332.73 C 245.5 315.49 243.84 297.10 247.18 279.66 C 239.17 298.78 238.70 321.02 247.71 341.50 C 262.69 375.55 298.95 393.61 334.00 386.97 "/>
<path fill="#FADBEB" d="M 322.35 157.42 C 322.26 156.08 321.80 154.93 320.64 154.15 C 316.84 152.16 316.36 158.55 319.25 159.80 C 320.92 160.74 322.44 159.10 322.35 157.42 M 308.31 200.09 C 314.56 200.29 321.42 197.86 321.78 190.63 C 321.72 185.23 319.11 179.62 312.80 180.88 C 305.42 181.67 298.28 188.68 290.75 185.14 C 290.63 185.03 290.44 185.12 290.53 185.30 C 291.32 188.66 293.96 191.06 296.65 193.00 C 297.57 193.76 292.35 192.46 291.99 192.41 C 291.26 192.21 291.29 192.75 291.54 193.28 C 291.93 194.29 292.82 194.87 293.56 195.57 C 297.47 199.37 303.07 199.94 308.31 200.09 M 325.84 169.75 C 323.40 171.38 324.26 174.06 326.02 175.87 C 329.89 180.64 335.11 186.94 332.57 193.43 C 328.00 205.65 313.51 206.04 302.39 206.07 C 296.10 205.71 289.13 205.58 284.03 201.39 C 277.47 196.48 274.07 191.24 272.33 183.22 C 271.53 179.87 270.87 176.44 270.81 172.98 C 270.85 170.30 274.01 170.79 275.06 172.57 C 277.84 176.33 282.33 179.76 287.25 178.52 C 290.54 177.66 293.52 175.94 296.88 175.28 C 299.21 174.73 301.57 174.50 303.95 174.41 C 304.80 174.48 307.80 174.61 306.48 173.10 C 300.26 171.70 297.00 165.39 297.79 159.32 C 297.98 157.51 298.35 155.74 298.90 154.01 C 299.00 153.67 298.79 153.73 298.60 153.75 C 297.44 153.82 296.08 153.39 295.53 152.33 C 296.17 152.19 296.96 152.44 297.66 152.41 C 296.16 151.67 294.80 149.87 295.21 148.19 C 296.72 149.10 298.33 150.10 300.19 150.33 C 301.20 150.54 301.92 149.69 302.52 149.01 C 303.85 147.52 305.50 146.47 307.30 145.65 C 314.46 142.18 323.79 145.26 327.39 152.37 C 328.35 154.10 328.59 156.10 329.53 157.83 C 328.48 159.14 328.90 160.92 328.06 162.30 C 326.66 164.44 322.86 167.30 325.84 169.75 "/>
<path fill="#EA5F9E" d="M 325.84 169.75 C 322.86 167.29 326.66 164.45 328.06 162.30 C 328.90 160.92 328.48 159.14 329.53 157.83 C 330.37 159.02 331.56 160.01 333.08 159.86 C 335.07 159.76 337.04 159.53 338.97 159.00 C 340.57 159.01 339.52 161.56 339.20 162.41 C 338.32 164.41 336.81 165.77 334.78 166.57 C 336.17 166.74 337.14 167.35 337.57 168.68 C 333.62 168.38 329.54 168.30 325.84 169.75 "/>
<path fill="#F4ACCD" d="M 308.31 200.09 C 303.07 199.94 297.47 199.37 293.56 195.57 C 292.82 194.87 291.93 194.29 291.54 193.28 C 291.30 192.75 291.25 192.21 291.99 192.41 C 292.25 192.45 297.62 193.76 296.65 193.00 C 293.96 191.06 291.31 188.66 290.53 185.29 C 290.46 185.13 290.61 185.03 290.75 185.14 C 299.06 188.96 306.67 180.37 315.01 180.75 C 319.95 180.87 321.76 186.48 321.78 190.63 C 321.42 197.86 314.57 200.28 308.31 200.09 "/>
<path fill="#EA5F9E" d="M 321.58 156.69 C 321.65 155.73 320.20 155.20 320.13 156.36 C 320.06 157.31 321.53 157.86 321.58 156.69 M 322.35 157.42 C 322.44 159.10 320.92 160.74 319.25 159.80 C 316.36 158.55 316.84 152.16 320.64 154.15 C 321.80 154.93 322.26 156.08 322.35 157.42 "/>
<path fill="#FEF9FC" d="M 321.58 156.69 C 321.53 157.85 320.06 157.31 320.13 156.36 C 320.20 155.20 321.65 155.73 321.58 156.69 "/>
<path fill="#F4ACCD" d="M 345.66 398.44 C 295.19 411.42 244.01 382.07 231.36 332.88 C 218.71 283.69 249.37 233.30 299.84 220.32 C 312.93 216.95 326.07 216.44 338.58 218.37 C 318.86 211.10 296.66 209.55 274.57 215.24 C 217.94 229.80 183.55 286.35 197.74 341.53 C 211.93 396.71 269.35 429.65 325.97 415.08 C 348.06 409.40 366.76 397.33 380.52 381.45 C 370.50 389.18 358.75 395.07 345.66 398.44 "/>
</svg>`;return t.firstElementChild.innerHTML;})();
function wheel(pl,h,o={}){
  const cx=300,cy=300,asc=h?h.asc:0,R0=292,R1=250,RP=212,RH=h?118:100;
  const P=(lon,r)=>{const a=(180+lon-asc)*R;return[+(cx+r*Math.cos(a)).toFixed(2),+(cy-r*Math.sin(a)).toFixed(2)];};
  let s=`<svg viewBox="-26 -26 652 652" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="chart-svg">`;
  if(o.glow) s+=`<defs><radialGradient id="wg${o.id||''}"><stop offset="0" stop-color="var(--pink)" stop-opacity=".25"/><stop offset="1" stop-color="var(--pink)" stop-opacity="0"/></radialGradient></defs><circle cx="300" cy="300" r="320" fill="url(#wg${o.id||''})"/>`;
  for(let i=0;i<12;i++) s+=`<path d="${arcPath(i*30,i*30+30,R0,R1,P)}" fill="var(--el-${ELEM[i%4]})" stroke="var(--rose)" stroke-width="1"/>`;
  s+=`<circle cx="300" cy="300" r="${R0}" fill="none" stroke="var(--pink)" stroke-width="2"/><circle cx="300" cy="300" r="${R1}" fill="var(--surface)" stroke="var(--pink)" stroke-width="1.4"/>`;
  for(let i=0;i<12;i++){const [x,y]=P(i*30+15,271);s+=`<text class="zs" x="${x}" y="${y}" font-size="25" text-anchor="middle" dominant-baseline="central">${AQ.SIGNS[i][1]+VS}</text>`;}
  for(let d=0;d<360;d+=(o.mini?2:1)){const len=d%10===0?10:d%5===0?7:3.5;const [x1,y1]=P(d,R1),[x2,y2]=P(d,R1-len);s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--rose)" stroke-width="${d%10===0?1.4:.8}"/>`;}
  // logo in filigrana: nessuno sfondo, appena visibile, sotto le linee
  s+=`<circle cx="300" cy="300" r="${RH}" fill="none" stroke="var(--rose)" stroke-width="1.2"/>`;
  if(o.logo) s+=`<g class="wm" opacity="${o.mini?.9:.09}" transform="translate(300 300) scale(${o.mini?.44:.36}) translate(-303 -280)">${LOGO_INNER}</g>`;
  if(h){
    for(let i=1;i<=12;i++){const c=h.cusps[i],ang=[1,4,7,10].includes(i);const [x1,y1]=P(c,ang?R0+8:R1),[x2,y2]=P(c,RH);
      s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ang?'var(--pink-strong)':'var(--rose)'}" stroke-width="${ang?2.2:1}"/>`;
      const mid=AQ.norm(c+AQ.norm(h.cusps[i%12+1]-c)/2),[hx,hy]=P(mid,RH+13);
      s+=`<text class="hn" x="${hx}" y="${hy}" font-size="11.5" text-anchor="middle" dominant-baseline="central">${i}</text>`;}
    for(const [lbl,l] of [['AC',h.asc],['DC',AQ.norm(h.asc+180)],['MC',h.mc],['IC',AQ.norm(h.mc+180)]]){const [x,y]=P(l,R0+18);s+=`<text class="axl" x="${x}" y="${y}" font-size="13" text-anchor="middle" dominant-baseline="central">${lbl}</text>`;}
  }
  if(o.aspects){
    s+='<g class="asp">';
    for(const x of o.aspects){if(x.angle===0)continue;const [x1,y1]=P(x.a.lon,RH),[x2,y2]=P(x.b.lon,RH);
      const col=x.type==='hard'?'var(--asp-hard)':x.type==='soft'?'var(--asp-soft)':'var(--asp-minor)';
      const w=x.orb<1?2.1:x.orb<3?1.45:1,op=x.orb<1?.95:x.orb<3?.78:.55;
      s+=`<line data-a="${x.a.id}" data-b="${x.b.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}"${x.type==='minor'?' stroke-dasharray="5 4"':''}/>`;}
    s+='</g>';
  }
  for(const {p,d} of spread(pl,o.mini?9:6.4)){
    const [t1x,t1y]=P(p.lon,R1),[t2x,t2y]=P(p.lon,R1-12),[cx2,cy2]=P(d,RP+16),[gx,gy]=P(d,RP),[dx,dy]=P(d,RP-27),f=AQ.fmt(p.lon);
    s+=`<g class="pt" data-p="${p.id}" tabindex="-1"><title>${esc(p.name)}: ${f.full} ${f.sign[0]}${p.retro?' retrogrado':''}</title>`;
    s+=`<line x1="${t1x}" y1="${t1y}" x2="${t2x}" y2="${t2y}" stroke="var(--pink-strong)" stroke-width="2"/><line x1="${t2x}" y1="${t2y}" x2="${cx2}" y2="${cy2}" stroke="var(--rose)" stroke-width=".8"/>`;
    s+=`<circle cx="${gx}" cy="${gy}" r="15" fill="transparent"/><text class="pg${p.cat==='A'||p.cat==='M'||p.cat==='X'?' pg-s':''}" x="${gx}" y="${gy}" font-size="${p.id==='vertex'?15:(p.cat==='A'?20:25)}" text-anchor="middle" dominant-baseline="central">${G(p)}</text>`;
    s+=`<text class="pd" x="${dx}" y="${dy}" font-size="10.5" text-anchor="middle" dominant-baseline="central">${f.deg}°${String(f.min).padStart(2,'0')}${p.retro?'℞':''}</text></g>`;
  }
  return s+`</svg>`;
}
function moonPhaseName(a){return['Luna nuova','Luna crescente','Primo quarto','Gibbosa crescente','Luna piena','Gibbosa calante','Ultimo quarto','Luna calante'][Math.floor(AQ.norm(a+22.5)/45)%8];}
function moonIcon(a){const f=(1-Math.cos(a*R))/2,wax=AQ.norm(a)<180,rx=Math.abs(1-2*f)*18,big=f>.5;
  return `<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="19" fill="none" stroke="var(--rose)" stroke-opacity=".6"/><circle cx="21" cy="21" r="18" fill="color-mix(in srgb,var(--rose) 38%,var(--bg))"/><path d="M21 3A18 18 0 0 ${wax?1:0} 21 39A${rx.toFixed(2)} 18 0 0 ${(wax?big:!big)?1:0} 21 3Z" fill="var(--pink)"/></svg>`;}

/* ======== apertura e cielo ======== */
const SKY_IDS=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','node','chiron','lilith'];
function renderNow(){
  const now=new Date(),pl=AQ.points(now),sun=AQ.fmt(pl[0].lon),moon=AQ.fmt(pl[1].lon),m=AQ.moonInfo(now);
  $('#heroNow').innerHTML=`${moonIcon(m.angle)}<span>Adesso: Sole in ${sun.sign[0]}, Luna in ${moon.sign[0]} · ${moonPhaseName(m.angle).toLowerCase()}</span>`;
  $('#railSky').innerHTML=`${moonIcon(m.angle)}<span><b>${moonPhaseName(m.angle)}</b>Luna in ${moon.sign[0]}</span>`;
  $('#heroDate').textContent=`41°54′ N · 12°29′ E · ${dateFmt.format(now)}`;
}
let skyDay=new Date();
function renderSky(){
  const [y,m,d]=ymdRome(skyDay).split('-').map(Number),{date}=AQ.localToUTC(y,m,d,12,0,'Europe/Rome'),pl=AQ.points(date).filter(p=>SKY_IDS.includes(p.id));
  $('#skyWheel').innerHTML=wheel(pl,null,{logo:1,mini:1,glow:1,id:'s'});
  $('#dayPick').value=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const mi=AQ.moonInfo(date);
  $('#moonLine').innerHTML=`${moonIcon(mi.angle)}<div><b>${cap(dateFmt.format(date))}</b><span>${moonPhaseName(mi.angle)}, illuminata al ${Math.round(mi.ill*100)}% · ore 12:00 a Roma</span></div>`;
  $('#skyList').innerHTML=pl.map(p=>{const f=AQ.fmt(p.lon);return `<li><span class="g" aria-hidden="true">${G(p)}</span><span class="nm">${p.name}${p.retro?'<span class="retro" title="Retrogrado">℞</span>':''}</span><span class="ps">${f.text} ${f.sign[0]}</span></li>`}).join('');
}
$('#dayPrev').onclick=()=>{skyDay=new Date(skyDay-864e5);renderSky();};
$('#dayNext').onclick=()=>{skyDay=new Date(+skyDay+864e5);renderSky();};
$('#dayToday').onclick=()=>{skyDay=new Date();renderSky();};
$('#dayPick').onchange=e=>{if(!e.target.value)return;const [y,m,d]=e.target.value.split('-').map(Number);if(y<1800||y>2399)return;skyDay=AQ.localToUTC(y,m,d,12,0,'Europe/Rome').date;renderSky();};
(function(){const o=$('#orrery'),hero=$('#home');if(matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(pointer: coarse)').matches)return;
  let raf;hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{o.style.transform=`translate(calc(-50% + ${(-x*26).toFixed(1)}px),calc(-50% + ${(-y*20).toFixed(1)}px))`;$('.bgimg').style.transform=`translate(${(x*12).toFixed(1)}px,${(y*9).toFixed(1)}px)`;});});})();

/* ======== tema natale ======== */
/* ---- atlante: tutti i comuni italiani e le città del mondo (assets/js/atlas.js) ---- */
const TZ_LIST=(()=>{try{return Intl.supportedValuesOf('timeZone');}catch(e){return [...new Set(['Europe/Rome',...CITIES.map(c=>c.tz),'UTC'])];}})();
$('#fTz').innerHTML=['Europe/Rome',...TZ_LIST.filter(t=>t!=='Europe/Rome')].map(t=>`<option>${t}</option>`).join('');
const normK=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’`]/g,"'").replace(/[^a-z0-9']+/g,' ').trim();
const regionName=(()=>{try{const dn=new Intl.DisplayNames(['it'],{type:'region'});return c=>{try{return c?dn.of(c):''}catch(e){return c}};}catch(e){return c=>c;}})();
let ATL=null;
function atlas(){
  if(ATL)return ATL;
  if(!window.ATLAS_IT){ATL=CITIES.map(c=>({name:c.name,label:c.name,lat:c.lat,lon:c.lon,tz:c.tz,it:c.tz==='Europe/Rome',pop:0,k:normK(c.name),kl:normK(c.name)}));return ATL;}
  ATL=[];
  for(const l of ATLAS_IT.split('\n')){const [n,pr,la,lo,alt]=l.split('|');ATL.push({name:n,label:`${n} (${pr})`,alt,lat:+la,lon:+lo,tz:'Europe/Rome',it:true,pop:0,k:normK(n),k2:alt?normK(alt):'',kl:normK(`${n} ${pr}`)});}
  const seen=new Set();
  for(const l of ATLAS_W.split('\n')){const [n,iso,la,lo,tz,pop]=l.split('|'),cn=regionName(iso),lab=cn?`${n}, ${cn}`:n;if(seen.has(lab))continue;seen.add(lab);ATL.push({name:n,label:cn?`${n}, ${cn}`:n,lat:+la,lon:+lo,tz,it:false,pop:+pop,k:normK(n),kl:normK(cn?`${n} ${cn}`:n)});}
  return ATL;}
function searchPlaces(q,limit=10){
  const k=normK(q);if(k.length<2)return[];const out=[];
  for(const p of atlas()){let s=9;
    if(p.kl===k||p.k===k||p.k2===k)s=0;else if(p.k.startsWith(k)||(p.k2&&p.k2.startsWith(k))||p.kl.startsWith(k))s=1;else if((' '+p.k).includes(' '+k))s=2;else if(k.length>=3&&p.k.includes(k))s=3;
    if(s<9)out.push([s,p]);}
  out.sort((a,b)=>a[0]-b[0]||(b[1].it-a[1].it)||(b[1].pop-a[1].pop)||a[1].name.length-b[1].name.length||a[1].name.localeCompare(b[1].name,'it'));
  return out.slice(0,limit).map(x=>x[1]);}
let selPlace=null;
function findCity(v){const t=String(v||'').trim();if(!t)return null;
  if(selPlace&&selPlace.label===t)return{name:selPlace.label,lat:selPlace.lat,lon:selPlace.lon,tz:selPlace.tz};
  const k=normK(t),hit=atlas().find(p=>p.kl===k||normK(p.label)===k)||(()=>{const r=searchPlaces(t,2);return r.length&&(r[0].k===k||r[0].k2===k)?r[0]:null;})();
  return hit?{name:hit.label,lat:hit.lat,lon:hit.lon,tz:hit.tz}:null;}
const placeIn=$('#fPlace'),placeAc=$('#placeAc');let acItems=[],acIdx=-1;
function placeHintFor(p){$('#placeHint').textContent=p?`${coordText(p.lat,p.lon)} · ${p.tz}`:'Tutti i comuni italiani e oltre 7.000 città del mondo.';}
function closeAc(){placeAc.hidden=true;placeIn.setAttribute('aria-expanded','false');acIdx=-1;placeIn.removeAttribute('aria-activedescendant');}
function renderAc(){
  if(!acItems.length){placeAc.innerHTML=`<li class="ac-none">${normK(placeIn.value).length<2?'':'Nessun luogo trovato: prova le coordinate qui sotto.'}</li>`;placeAc.hidden=normK(placeIn.value).length<2;placeIn.setAttribute('aria-expanded',String(!placeAc.hidden));return;}
  placeAc.innerHTML=acItems.map((p,i)=>`<li id="ac-${i}" role="option" aria-selected="${i===acIdx}" data-i="${i}"><b>${esc(p.name)}</b> <span>${esc(p.it?(p.label.slice(p.name.length).trim()+(p.alt?' · '+p.alt:'')):p.label.slice(p.name.length+2))}</span></li>`).join('');
  placeAc.hidden=false;placeIn.setAttribute('aria-expanded','true');
  if(acIdx>=0)placeIn.setAttribute('aria-activedescendant','ac-'+acIdx);
  $$('#placeAc li[data-i]').forEach(li=>li.addEventListener('mousedown',e=>{e.preventDefault();pickPlace(acItems[+li.dataset.i]);}));}
function pickPlace(p){selPlace=p;placeIn.value=p.label;placeHintFor(p);closeAc();}
placeIn.addEventListener('input',()=>{selPlace=null;acItems=searchPlaces(placeIn.value);acIdx=acItems.length?0:-1;renderAc();placeHintFor(findCity(placeIn.value));});
placeIn.addEventListener('keydown',e=>{if(placeAc.hidden||!acItems.length)return;
  if(e.key==='ArrowDown'){e.preventDefault();acIdx=(acIdx+1)%acItems.length;renderAc();}
  else if(e.key==='ArrowUp'){e.preventDefault();acIdx=(acIdx-1+acItems.length)%acItems.length;renderAc();}
  else if(e.key==='Enter'&&acIdx>=0){e.preventDefault();pickPlace(acItems[acIdx]);}
  else if(e.key==='Escape'){closeAc();}});
placeIn.addEventListener('blur',()=>setTimeout(closeAc,120));
$('#fNoTime').addEventListener('change',e=>{$('#fTime').disabled=e.target.checked;});
/* coordinate in gradi e primi (come astro.com) */
const num=s=>+String(s).trim().replace(',','.');
function readCoord(p,max,neg){
  const d=$('#'+p+'D').value.trim().replace(',','.'),mi=$('#'+p+'M').value.trim(),se=$('#'+p+'S').value.trim(),h=$('#'+p+'H').value;
  if(!d&&!mi&&!se)return null;
  const dv=num(d||'0'),mv=mi?num(mi):0,sv=se?num(se):0;
  if(!isFinite(dv)||!isFinite(mv)||!isFinite(sv)||mv<0||mv>=60||sv<0||sv>=60)return NaN;
  if(d.includes('.')&&(mi||se))return NaN;
  const v=Math.abs(dv)+mv/60+sv/3600;if(v>max)return NaN;
  return (h===neg||dv<0?-1:1)*v;}
function dms(v,pos,neg){const a=Math.abs(v);let d=Math.floor(a),m=Math.floor((a-d)*60),s=Math.round(((a-d)*60-m)*60);if(s===60){s=0;m++;}if(m===60){m=0;d++;}
  return `${d}°${String(m).padStart(2,'0')}′${String(s).padStart(2,'0')}″ ${v<0?neg:pos}`;}
const dec=v=>v.toFixed(4).replace('.',',')+'°';
function coordText(lat,lon){return `${dms(lat,'N','S')} ${dms(lon,'E','O')} (${dec(lat)}, ${dec(lon)})`;}
function updateConv(){const la=readCoord('lat',90,'S'),lo=readCoord('lon',180,'O'),el=$('#coordConv');
  if(la===null&&lo===null){el.textContent='';return;}
  const part=(v,n,p,q)=>v===null?`${n}: da inserire`:isNaN(v)?`${n}: valore non valido`:`${n} ${dms(v,p,q)} = ${dec(v)}`;
  el.textContent=part(la,'Latitudine','N','S')+' · '+part(lo,'Longitudine','E','O');}
function setCoord(p,v,pos,neg){const a=Math.abs(v),d=Math.floor(a),mf=(a-d)*60,m=Math.floor(mf+1e-9),s=Math.round((mf-m)*60*100)/100;
  $('#'+p+'D').value=d;$('#'+p+'M').value=m;$('#'+p+'S').value=s?String(s).replace('.',','):'';$('#'+p+'H').value=v<0?neg:pos;}
function parsePasted(txt){
  const t=txt.replace(/[’']/g,'′').replace(/["”]/g,'″').replace(/,(\d)/g,'.$1');let lat=null,lon=null;
  const put=(L,v)=>{L=L.toUpperCase();if(L==='N'||L==='S')lat=L==='S'?-v:v;else lon=(L==='W'||L==='O')?-v:v;};
  // 1) stile astro.com: 41n54, 12e29, 41n54′30
  let re=/(\d{1,3})\s*([NSEWO])\s*(\d{1,2})(?:\s*[′:]\s*(\d{1,2}(?:\.\d+)?))?/gi,mm,found=0;
  while((mm=re.exec(t))){put(mm[2],+mm[1]+(+mm[3])/60+(mm[4]?+mm[4]/3600:0));found++;}
  if(found>=2&&lat!==null&&lon!==null)return{lat,lon};
  lat=lon=null;found=0;
  // 2) 41°54′30″ N
  re=/(\d{1,3}(?:\.\d+)?)\s*°\s*(?:(\d{1,2}(?:\.\d+)?)\s*′\s*)?(?:(\d{1,2}(?:\.\d+)?)\s*″\s*)?([NSEWO])/gi;
  while((mm=re.exec(t))){put(mm[4],+mm[1]+(mm[2]?+mm[2]/60:0)+(mm[3]?+mm[3]/3600:0));found++;}
  if(found>=2&&lat!==null&&lon!==null)return{lat,lon};
  // 3) due decimali: 41.9, 12.4833
  const nums=t.match(/-?\d+\.\d+/g);if(nums&&nums.length===2)return{lat:+nums[0],lon:+nums[1],decimal:true};
  return null;}
$('#fPaste').addEventListener('input',e=>{const r=parsePasted(e.target.value);if(!r){$('#coordConv').textContent=e.target.value.trim()?'Formato non riconosciuto: usa ad esempio 41n54 12e29':'';return;}
  if(Math.abs(r.lat)>90||Math.abs(r.lon)>180){$('#coordConv').textContent='Coordinate fuori intervallo.';return;}
  setCoord('lat',r.lat,'N','S');setCoord('lon',r.lon,'E','O');updateConv();});
['latD','latM','latS','latH','lonD','lonM','lonS','lonH'].forEach(id=>$('#'+id).addEventListener('input',updateConv));

const SET_DEFAULT={sys:'P',node:'true',lilith:'mean',minor:true,asteroids:false,extra:true};
let SET={...SET_DEFAULT,...(store.get('aq-set')||{})}, lastNatal=null, dstChoice=null;
function syncSettings(){$('#sSys').value=SET.sys;$('#sNode').value=SET.node;$('#sLil').value=SET.lilith;$('#sMinor').checked=SET.minor;$('#sAst').checked=SET.asteroids;$('#sExtra').checked=SET.extra;}
function readSettings(){SET={sys:$('#sSys').value,node:$('#sNode').value,lilith:$('#sLil').value,minor:$('#sMinor').checked,asteroids:$('#sAst').checked,extra:$('#sExtra').checked};store.set('aq-set',SET);}
$$('#settingsBox select,#settingsBox input').forEach(el=>el.addEventListener('change',()=>{readSettings();if(lastNatal)renderNatal(lastNatal,true);}));
$('#natalForm').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#formErr');err.innerHTML='';
  const name=$('#fName').value.trim(),dv=$('#fDate').value,noTime=$('#fNoTime').checked,tv=noTime?'12:00':$('#fTime').value;
  if(!dv){err.textContent='Inserisci la data di nascita.';$('#fDate').focus();return;}
  const yy=+dv.slice(0,4);if(yy<1800||yy>2399){err.textContent='Le effemeridi coprono gli anni dal 1800 al 2399.';return;}
  if(!tv){err.textContent='Inserisci l’ora di nascita, oppure spunta «Non conosco l’ora».';$('#fTime').focus();return;}
  let place;const la=readCoord('lat',90,'S'),lo=readCoord('lon',180,'O');
  if(la!==null||lo!==null){
    if(la===null||lo===null||isNaN(la)||isNaN(lo)){err.textContent='Coordinate incomplete o non valide: gradi fino a 90 (latitudine) e 180 (longitudine), primi e secondi da 0 a 59.';$('#manualBox').open=true;return;}
    place={name:$('#fPlace').value.trim()||'Coordinate manuali',lat:la,lon:lo,tz:$('#fTz').value};
  }else{place=findCity($('#fPlace').value);
    if(!place){const v=$('#fPlace').value.trim();err.textContent=v?'Luogo non in elenco: scegli una città suggerita o inserisci le coordinate.':'Inserisci il luogo di nascita.';if(v)$('#manualBox').open=true;$('#fPlace').focus();return;}}
  const [y,m,d]=dv.split('-').map(Number),[hh,mm]=tv.split(':').map(Number);
  const t=AQ.localToUTC(y,m,d,hh,mm,place.tz);
  if(!noTime&&!t.exists){err.textContent=`Le ${tv} di quel giorno non sono esistite: gli orologi sono passati all’ora legale. Controlla l’ora (probabilmente un’ora dopo).`;return;}
  let offset=null;
  if(!noTime&&t.ambiguous){const key=`${dv} ${tv} ${place.tz}`;
    if(!dstChoice||dstChoice.key!==key){err.innerHTML=`Quella notte le ${esc(tv)} si sono ripetute due volte (ritorno all’ora solare). Era ancora ora legale? <span class="dst"><button type="button" class="mini" data-off="${Math.max(...t.cands)}">Sì, ora legale</button> <button type="button" class="mini" data-off="${Math.min(...t.cands)}">No, ora solare</button></span>`;
      $$('#formErr [data-off]').forEach(b=>b.onclick=()=>{dstChoice={key,off:+b.dataset.off};$('#natalForm').requestSubmit();});return;}
    offset=dstChoice.off;}
  store.set('aq-natal',{name,dv,tv,noTime,place:$('#fPlace').value,coords:['latD','latM','latS','latH','lonD','lonM','lonS','lonH'].map(id=>$('#'+id).value),tz:$('#fTz').value});
  renderNatal({name,y,m,d,hh,mm,noTime,place,offset});
});
const MAIN_IDS=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','node','chiron','lilith','asc','mc'];
function renderNatal(o,keepScroll){
  lastNatal=o;
  let date,offset;
  if(o.offset!=null){offset=o.offset;date=new Date(Date.UTC(o.y,o.m-1,o.d,o.hh,o.mm)-offset*60000);}else{const t=AQ.localToUTC(o.y,o.m,o.d,o.hh,o.mm,o.place.tz);date=t.date;offset=t.offset;}
  let pl=AQ.points(date,{node:SET.node,lilith:SET.lilith,asteroids:SET.asteroids});
  const h=o.noTime?null:AQ.houses(date,o.place.lat,o.place.lon,SET.sys);
  if(h&&SET.extra){pl.push(AQ.fortune(pl,h));pl.push({id:'vertex',name:'Vertice',glyph:'Vx',cat:'M',lon:h.vertex,speed:0,retro:false});}
  const angles=h?[{id:'asc',name:'Ascendente',glyph:'AC',cat:'X',lon:h.asc,speed:0},{id:'mc',name:'Medio Cielo',glyph:'MC',cat:'X',lon:h.mc,speed:0}]:[];
  const asp=AQ.aspects([...pl,...angles],{minor:SET.minor});
  const sun=AQ.fmt(pl[0].lon),moon=AQ.fmt(pl[1].lon),asc=h?AQ.fmt(h.asc):null;
  const off=`UTC${offset>=0?'+':'−'}${Math.floor(Math.abs(offset)/60)}${offset%60?':'+String(Math.abs(offset)%60).padStart(2,'0'):''}`;
  const dl=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric'}).format(new Date(Date.UTC(o.y,o.m-1,o.d,12)));
  const sg=f=>`<span class="g" aria-hidden="true">${f.sign[1]+VS}</span>${f.sign[0]}`;
  const rows=pl.map(p=>{const f=AQ.fmt(p.lon);return `<tr data-row="${p.id}"><td><span class="g" aria-hidden="true">${G(p)}</span>${p.name}</td><td>${sg(f)}</td><td class="num">${f.full}${p.retro?'<span class="retro" title="Retrogrado">℞</span>':''}</td>${h?`<td class="num">${AQ.houseOf(p.lon,h.cusps)}</td>`:''}</tr>`}).join('');
  const angRows=h?[['AC','Ascendente',h.asc],['MC','Medio Cielo',h.mc]].map(([g,n,l])=>{const f=AQ.fmt(l);return `<tr class="ang"><td><b class="axb">${g}</b>${n}</td><td>${sg(f)}</td><td class="num">${f.full}</td><td></td></tr>`}).join(''):'';
  const cusps=h?Array.from({length:12},(_,i)=>{const f=AQ.fmt(h.cusps[i+1]);return `<div><small>Casa ${i+1}</small>${sg(f)} <span class="data">${f.text}</span></div>`}).join(''):'';
  // griglia aspetti triangolare
  const gridPts=[...pl.filter(p=>MAIN_IDS.includes(p.id)),...angles];
  const amap={};asp.forEach(x=>{amap[x.a.id+'|'+x.b.id]=x;amap[x.b.id+'|'+x.a.id]=x;});
  let grid='<table class="agrid"><tbody>';
  gridPts.forEach((r,i)=>{grid+=`<tr><th scope="row" title="${esc(r.name)}"><span class="g">${G(r)}</span></th>`;
    for(let j=0;j<i;j++){const c=gridPts[j],x=amap[r.id+'|'+c.id];
      grid+=x?`<td class="a-${x.type}" title="${esc(r.name)} ${x.name.toLowerCase()} ${esc(c.name)} · orbita ${x.orb.toFixed(2)}° ${x.applying?'applicativo':'separativo'}"><span class="g">${x.glyph.length>1?x.glyph:x.glyph+VS}</span><small>${Math.floor(x.orb)}°${String(Math.round((x.orb%1)*60)).padStart(2,'0')}${x.applying?'A':'S'}</small></td>`:'<td></td>';}
    grid+=`<td class="diag"><span class="g">${G(r)}</span></td></tr>`;});
  grid+='</tbody></table>';
  // elementi e qualità (dieci pianeti)
  const ten=pl.slice(0,10),el=[0,0,0,0],qu=[0,0,0];ten.forEach(p=>{const s=Math.floor(p.lon/30);el[s%4]++;qu[s%3]++;});
  const aspList=asp.filter(x=>!(x.a.cat==='X'&&x.b.cat==='X')).sort((a,b)=>a.orb-b.orb).map(x=>`<li class="al-${x.type}"><span class="g">${G(x.a)}</span> ${x.name.toLowerCase()} <span class="g">${G(x.b)}</span> ${x.a.name} e ${x.b.name} <small>${x.orb.toFixed(2)}° ${x.applying?'A':'S'}</small></li>`).join('');
  $('#natalOut').innerHTML=`
    <div class="res-head"><h3>${o.name?'Il cielo di '+esc(o.name):'Il tuo cielo di nascita'}</h3>
    <p class="res-meta">${dl}, ${o.noTime?'ora sconosciuta (calcolato alle 12:00, senza case, Ascendente, Vertice e Parte di Fortuna)':`ore ${String(o.hh).padStart(2,'0')}:${String(o.mm).padStart(2,'0')} (${off}) · UT ${date.toISOString().slice(11,16)}`} · ${esc(o.place.name)}, ${coordText(o.place.lat,o.place.lon)}${h?' · case '+h.system:''} · nodo ${SET.node==='true'?'vero':'medio'} · Lilith ${SET.lilith==='mean'?'media':'osculante'}</p></div>
    <div class="big3"><div><small>Sole</small><b>${sg(sun)}</b></div><div><small>Luna</small><b>${sg(moon)}</b></div><div><small>Ascendente</small><b>${asc?sg(asc):'serve l’ora'}</b></div></div>
    <div class="chart-card"><div class="wheel-wrap" id="natalWheel" role="img" aria-label="Carta del tema natale con le linee degli aspetti">${wheel(pl,h,{aspects:asp,logo:1})}</div>
      <div class="legend"><span><i class="l-hard"></i>Quadrato, opposizione</span><span><i class="l-soft"></i>Trigono, sestile</span>${SET.minor?'<span><i class="l-minor"></i>Aspetti minori</span>':''}<span class="hint">Passa sopra un pianeta per vederne gli aspetti</span></div></div>
    <div class="tables">
      <div class="tbl-wrap"><table><caption>Posizioni</caption><thead><tr><th>Punto</th><th>Segno</th><th>Grado</th>${h?'<th>Casa</th>':''}</tr></thead><tbody>${rows}${angRows}</tbody></table></div>
      ${h?`<div><h3 style="margin-bottom:12px">Cuspidi delle case</h3><div class="cusps">${cusps}</div></div>`:''}
      <div><h3 style="margin-bottom:12px">Griglia degli aspetti</h3><div class="tbl-wrap">${grid}</div><p class="hint" style="margin-top:8px">Orbita in gradi e primi; A applicativo, S separativo.</p></div>
      <div class="dist"><div><h4>Elementi</h4>${['Fuoco','Terra','Aria','Acqua'].map((n,i)=>`<p><span>${n}</span><i style="--w:${el[i]*10}%"></i><b>${el[i]}</b></p>`).join('')}</div>
        <div><h4>Qualità</h4>${['Cardinale','Fisso','Mobile'].map((n,i)=>`<p><span>${n}</span><i style="--w:${qu[i]*10}%"></i><b>${qu[i]}</b></p>`).join('')}</div></div>
      ${(B.admin||OWNER)?`<div><h3 style="margin-bottom:12px">Elenco degli aspetti <span style="font-family:var(--body);font-size:.75rem;font-weight:700;vertical-align:middle;background:#FFE7B8;color:#6B4300;border-radius:999px;padding:3px 10px">Visibile solo a te</span></h3><ul class="aspects">${aspList||'<li>Nessun aspetto.</li>'}</ul></div>`:''}
    </div>
    <div class="transits" id="transits"></div>
    <div class="res-actions"><button class="btn" type="button" id="shareChart">Condividi la carta</button><button class="btn ghost" type="button" id="printChart">Stampa</button><a class="btn ghost" href="#contattami">Chiedi una lettura</a><button class="btn ghost" type="button" id="newCalc">Nuovo calcolo</button></div>`;
  $('#newCalc').onclick=()=>{$('#natalForm').reset();updateConv();syncSettings();$('#fTime').disabled=false;lastNatal=null;$('#tema').scrollIntoView();$('#fName').focus({preventScroll:true});};
  NATAL={pl,h,angles,date,name:o.name,dl,place:o.place.name,sun:sun.sign[0],moon:moon.sign[0],asc:asc?asc.sign[0]:null};renderTransits();
  $('#shareChart').onclick=shareChart;$('#printChart').onclick=()=>window.print();
  const svg=$('#natalWheel svg');
  svg.querySelectorAll('.pt').forEach(g=>{const id=g.dataset.p;
    const on=()=>{svg.classList.add('focus');svg.querySelectorAll('.asp line').forEach(l=>l.classList.toggle('hi',l.dataset.a===id||l.dataset.b===id));g.classList.add('hi');};
    const off=()=>{svg.classList.remove('focus');svg.querySelectorAll('.hi').forEach(x=>x.classList.remove('hi'));};
    g.addEventListener('pointerenter',on);g.addEventListener('pointerleave',off);g.addEventListener('click',()=>{svg.classList.contains('focus')&&g.classList.contains('hi')?off():(off(),on());});});
  if(!keepScroll)$('#natalOut').scrollIntoView({block:'start'});
}
(function(){syncSettings();const s=store.get('aq-natal');if(!s)return;$('#fName').value=s.name||'';$('#fDate').value=s.dv||'';$('#fTime').value=s.tv||'12:00';$('#fNoTime').checked=!!s.noTime;$('#fTime').disabled=!!s.noTime;$('#fPlace').value=s.place||'';if(s.coords)['latD','latM','latS','latH','lonD','lonM','lonS','lonH'].forEach((id,i)=>{if(s.coords[i]!=null)$('#'+id).value=s.coords[i];});updateConv();if(s.tz)$('#fTz').value=s.tz;})();

/* ======== BLOG ======== */
const B={db:null,admin:false,posts:[],drafts:[],filter:'tutte',shown:6,editing:null};
function md(src){ // markdown essenziale e sicuro
  const lines=esc(src||'').split(/\n/);let html='',list=null;
  const inline=t=>t.replace(/!\[([^\]]*)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g,'<img src="$2" alt="$1" loading="lazy">').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|[^\w])_(.+?)_(?=[^\w]|$)/g,'$1<em>$2</em>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[\w-]+|\/(?!\/)[^\s)]*)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  for(const raw of lines){const l=raw.trimEnd();
    if(/^[-*] /.test(l)){if(list!=='ul'){if(list)html+=`</${list}>`;html+='<ul>';list='ul';}html+=`<li>${inline(l.slice(2))}</li>`;continue;}
    if(/^\d+\. /.test(l)){if(list!=='ol'){if(list)html+=`</${list}>`;html+='<ol>';list='ol';}html+=`<li>${inline(l.replace(/^\d+\. /,''))}</li>`;continue;}
    if(list){html+=`</${list}>`;list=null;}
    if(!l.trim())continue;
    if(l.startsWith('### '))html+=`<h4>${inline(l.slice(4))}</h4>`;
    else if(l.startsWith('## '))html+=`<h3>${inline(l.slice(3))}</h3>`;
    else if(l.startsWith('&gt; '))html+=`<blockquote>${inline(l.slice(5))}</blockquote>`;
    else html+=`<p>${inline(l)}</p>`;}
  if(list)html+=`</${list}>`;return html;}
const readMin=t=>Math.max(1,Math.round((t||'').split(/\s+/).length/200));
const coverOf=p=>COVERS[rub(p.rubrica).cover];
const visiblePosts=()=>B.posts.filter(p=>B.admin||new Date(p.date)<=new Date()).sort((a,b)=>b.date.localeCompare(a.date));
function renderBlog(){
  const chips=[{id:'tutte',name:'Tutte'},...RUBRICHE];
  $('#blogFilter').innerHTML=chips.map(c=>`<button type="button" class="chipf" data-r="${c.id}" aria-pressed="${B.filter===c.id}">${c.name}</button>`).join('');
  $$('#blogFilter [data-r]').forEach(b=>b.onclick=()=>{B.filter=b.dataset.r;B.shown=6;renderBlog();});
  const list=visiblePosts().filter(p=>B.filter==='tutte'||p.rubrica===B.filter);
  $('#blogGrid').innerHTML=list.length?list.slice(0,B.shown).map(p=>{const r=rub(p.rubrica),fut=new Date(p.date)>new Date();
    return `<article class="post-card"><a class="pc-btn" href="/blog/${encodeURIComponent(p.slug)}">
      <span class="pc-img" style="background-image:${cssUrl(coverOf(p))}"><span class="pc-rub">${esc(r.name)}</span>${fut?'<span class="pc-sched">Programmato</span>':''}</span>
      <span class="pc-body"><span class="pc-date">${shortDate.format(new Date(p.date))} · ${readMin(p.body)} min</span><span class="pc-title">${esc(p.title)}</span><span class="pc-ex">${esc(p.excerpt||(p.body||'').replace(/[#*>\[\]]/g,'').slice(0,160))}</span></span></a></article>`;}).join('')
    :`<p class="empty-ev">${B.posts.length?'Nessun articolo in questa rubrica, per ora.':'Il blog sta per aprire: i primi articoli arrivano a breve.'}</p>`;
  $('#blogMore').hidden=list.length<=B.shown;
  $$('#blogGrid [data-slug]').forEach(b=>b.onclick=()=>openPost(b.dataset.slug));
  $('#blogAdmin').hidden=!(B.admin||OWNER);
  if(B.admin){$('#draftList').innerHTML=B.drafts.length?B.drafts.map(d=>`<li><span>${esc(d.title||'Senza titolo')}</span><small>${esc(rub(d.rubrica).name)} · bozza</small><button type="button" class="mini" data-edit-d="${esc(d.slug)}">Modifica</button></li>`).join(''):'<li class="hint">Nessuna bozza.</li>';
    $$('[data-edit-d]').forEach(b=>b.onclick=()=>openEditor(B.drafts.find(d=>d.slug===b.dataset.editD),'drafts'));}
}
$('#blogMore').onclick=()=>{B.shown+=6;renderBlog();};
function openPost(slug){
  const p=B.posts.find(x=>x.slug===slug);if(!p)return;const r=rub(p.rubrica);
  const rel=visiblePosts().filter(x=>x.rubrica===p.rubrica&&x.slug!==p.slug).slice(0,3);
  $('#postBody').innerHTML=`<div class="post-cover" style="background-image:${cssUrl(coverOf(p))}"></div>
    <div class="post-inner"><p class="post-meta"><span class="pc-rub static">${esc(r.name)}</span> ${shortDate.format(new Date(p.date))} · ${readMin(p.body)} min di lettura</p>
    <h2 class="post-title">${esc(p.title)}</h2>${p.excerpt?`<p class="lede">${esc(p.excerpt)}</p>`:''}
    <div class="prose">${md(p.body)}</div>
    ${p.signs&&p.signs.length?`<p class="post-signs">${p.signs.map(i=>`<span class="chip-s"><span class="g">${AQ.SIGNS[i][1]+VS}</span>${AQ.SIGNS[i][0]}</span>`).join('')}</p>`:''}
    <div class="post-cta"><p>Vuoi approfondire il tuo cielo?</p><a class="btn" href="#contattami" data-close>Scrivimi</a></div>
    ${rel.length?`<h3 style="margin:40px 0 14px">Della stessa rubrica</h3><div class="rel">${rel.map(x=>`<button type="button" class="rel-i" data-slug="${esc(x.slug)}"><span>${shortDate.format(new Date(x.date))}</span>${esc(x.title)}</button>`).join('')}</div>`:''}
    ${B.admin?`<div class="res-actions"><button type="button" class="btn ghost" id="editPost">Modifica articolo</button></div>`:''}</div>`;
  $$('#postBody [data-slug]').forEach(b=>b.onclick=()=>openPost(b.dataset.slug));
  $$('#postBody [data-close]').forEach(b=>b.onclick=()=>$('#postDlg').close());
  if(B.admin)$('#editPost').onclick=()=>{$('#postDlg').close();openEditor(p,'posts');};
  const dlg=$('#postDlg');if(!dlg.open)dlg.showModal();dlg.scrollTop=0;
}
$('#postClose').onclick=()=>$('#postDlg').close();
/* editor riservato */
const slugify=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||('articolo-'+Date.now().toString(36));
function openEditor(p,coll){
  B.editing={orig:p||null,coll:coll||null};
  const now=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  $('#eTitle').value=p?.title||'';$('#eRub').innerHTML=RUBRICHE.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');$('#eRub').value=p?.rubrica||RUBRICHE[0].id;
  $('#eDate').value=p?.date?new Date(new Date(p.date)-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):now;
  $('#eEx').value=p?.excerpt||'';$('#eBody').value=p?.body||'';$('#eStatus').value=coll==='drafts'||!p?'bozza':'pubblicato';
  $('#eSigns').innerHTML=AQ.SIGNS.map((s,i)=>`<label class="sg-c"><input type="checkbox" value="${i}" ${p?.signs?.includes(i)?'checked':''}><span class="g">${s[1]+VS}</span>${s[0]}</label>`).join('');
  $('#eDelete').hidden=!p;$('#eMsg').textContent='';$('#ePreview').hidden=true;$('#eBody').hidden=false;
  $('#evList').innerHTML='';
  $('#editDlg').showModal();
}
$('#newPost').onclick=()=>openEditor(null,null);
$('#eClose').onclick=()=>$('#editDlg').close();
$$('[data-md]').forEach(b=>b.onclick=()=>{const t=$('#eBody'),[a,z]=[t.selectionStart,t.selectionEnd],sel=t.value.slice(a,z)||'testo',k=b.dataset.md;
  const rep={b:`**${sel}**`,i:`*${sel}*`,h:`\n## ${sel}\n`,l:`\n- ${sel}\n`,q:`\n> ${sel}\n`,a:`[${sel}](https://)`}[k];t.setRangeText(rep,a,z,'end');t.focus();});
$('#eTogglePrev').onclick=()=>{const on=$('#ePreview').hidden;$('#ePreview').hidden=!on;$('#eBody').hidden=on;if(on)$('#ePreview').innerHTML=md($('#eBody').value)||'<p class="hint">Niente da mostrare.</p>';};
$('#evCalc').onclick=()=>{const d=new Date($('#eDate').value||Date.now()),span=+$('#evSpan').value;const start=new Date(d);start.setHours(0,0,0,0);const end=new Date(+start+span*864e5);
  const evs=AQ.eventsBetween(start,end).filter(e=>$('#evMoon').checked||!e.moon);
  const df=new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/Rome'});
  $('#evList').innerHTML=evs.length?evs.map(e=>`<li><span>${df.format(e.date)}</span>${esc(e.text)}</li>`).join('')+`<li><button type="button" class="mini pri" id="evInsert">Inserisci nel testo</button></li>`:'<li class="hint">Nessun evento nel periodo.</li>';
  if(evs.length)$('#evInsert').onclick=()=>{const t=$('#eBody');t.setRangeText('\n'+evs.map(e=>`- **${df.format(e.date)}**: ${e.text}`).join('\n')+'\n',t.selectionStart,t.selectionEnd,'end');t.focus();};};
$('#eSave').onclick=async()=>{
  const title=$('#eTitle').value.trim();if(!title){$('#eMsg').textContent='Serve un titolo.';$('#eTitle').focus();return;}
  const status=$('#eStatus').value,coll=status==='bozza'?'drafts':'posts';
  const orig=B.editing.orig,slug=orig?.slug||slugify(title);
  if(!orig&&[...B.posts,...B.drafts].some(p=>p.slug===slug)){$('#eMsg').textContent='Esiste già un articolo con questo titolo: cambialo leggermente.';return;}
  const doc={title,slug,rubrica:$('#eRub').value,date:new Date($('#eDate').value||Date.now()).toISOString(),excerpt:$('#eEx').value.trim().slice(0,200),body:$('#eBody').value,
    signs:[...$$('#eSigns input:checked')].map(i=>+i.value),updated:new Date().toISOString(),created:orig?.created||new Date().toISOString()};
  $('#eMsg').textContent='Salvataggio…';
  try{await B.db.doc(`${coll}/${slug}`).set(doc);
    if(B.editing.coll&&B.editing.coll!==coll)await B.db.doc(`${B.editing.coll}/${slug}`).delete();
    $('#eMsg').textContent=status==='bozza'?'Bozza salvata.':(new Date(doc.date)>new Date()?'Programmato: comparirà sul sito alla data scelta.':'Pubblicato.');
    B.editing={orig:doc,coll};$('#eDelete').hidden=false;
  }catch(e){$('#eMsg').textContent='Non salvato: riprova.';}
};
$('#eDelete').onclick=async()=>{const o=B.editing;if(!o.orig||!confirm('Eliminare definitivamente questo articolo?'))return;
  try{await B.db.doc(`${o.coll}/${o.orig.slug}`).delete();$('#editDlg').close();}catch(e){$('#eMsg').textContent='Non eliminato: riprova.';}};
async function initBlog(){
  if(!(window.claude&&claude.use)){ // sito pubblicato: articoli da content/posts.js
    B.posts=(window.POSTS||[]).filter(p=>p.status!=='bozza');renderBlog();openFromHash();return;}
  renderBlog();
  const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
  if(!db)return;B.db=db;B.admin=user?await user.canEdit():false;if(B.admin&&lastNatal)renderNatal(lastNatal,true);
  db.collection('posts').onSnapshot(q=>{B.posts=q.docs.map(d=>d.data());renderBlog();openFromHash();},()=>{});
  if(B.admin)db.collection('drafts').onSnapshot(q=>{B.drafts=q.docs.map(d=>d.data());renderBlog();},()=>{});
}
function openFromHash(){const h=location.hash.slice(1);if(h.startsWith('p-'))location.replace('/blog/'+encodeURIComponent(h.slice(2)));}

/* ======== CONTATTAMI ======== */
const cForm=$('#contactForm'),cMsg=$('#cMsg');
cMsg.addEventListener('input',()=>{$('#cCount').textContent=`${cMsg.value.length} / 3000`;});
let cStart=Date.now();
function contactBody(v){return `Nome: ${v.name}\nEmail: ${v.email}\nMotivo: ${v.reason}\nModalità: ${v.mode}\n\n${v.msg}\n\n— inviato dal sito AstroQuack`;}
cForm.addEventListener('submit',e=>{
  e.preventDefault();const err=$('#cErr');err.textContent='';$$('#contactForm [aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));
  if($('#cHp').value)return; // trappola antispam
  const v={name:$('#cName').value.trim(),email:$('#cEmail').value.trim(),reason:document.querySelector('input[name=cReason]:checked')?.value,mode:document.querySelector('input[name=cMode]:checked')?.value,msg:cMsg.value.trim(),ok:$('#cPrivacy').checked};
  const bad=(el,t)=>{err.textContent=t;el.setAttribute('aria-invalid','true');el.focus();};
  if(v.name.length<2)return bad($('#cName'),'Scrivi il tuo nome.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))return bad($('#cEmail'),'Inserisci un indirizzo email valido.');
  if(!v.reason){err.textContent='Scegli il motivo del contatto.';return;}
  if(!v.mode){err.textContent='Scegli se preferisci online o in presenza.';return;}
  if(v.msg.length<20)return bad(cMsg,'Raccontami qualcosa in più: almeno 20 caratteri.');
  if(!v.ok)return bad($('#cPrivacy'),'Per inviare serve il consenso al trattamento dei dati.');
  if(Date.now()-cStart<3000){err.textContent='Un attimo… riprova tra qualche secondo.';return;}
  const subject=`[AstroQuack] ${v.reason} – ${v.name}`,body=contactBody(v);
  if(SITE.web3formsKey){const btn=cForm.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Invio in corso…';
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:SITE.web3formsKey,subject,from_name:'Sito AstroQuack',name:v.name,email:v.email,replyto:v.email,'Motivo del contatto':v.reason,'Modalità':v.mode,message:v.msg,botcheck:$('#cHp').value})})
      .then(r=>r.json()).then(j=>{if(!j.success)throw new Error(j.message||'errore');['doneMail','doneMail2','cCopy'].forEach(id=>$('#'+id).hidden=true);$('#doneSent').hidden=false;$('#contactDone').hidden=false;cForm.hidden=true;})
      .catch(()=>{err.innerHTML=`Non è stato possibile inviare il messaggio. Riprova tra poco oppure <a href="mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">scrivi via email</a>.`;})
      .finally(()=>{btn.disabled=false;btn.textContent='Invia il messaggio';});
    return;}
  location.href=`mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  $('#contactDone').hidden=false;cForm.hidden=true;
  $('#cCopy').onclick=async()=>{try{await navigator.clipboard.writeText(`A: ${MAIL}\nOggetto: ${subject}\n\n${body}`);$('#cCopy').textContent='Copiato';}catch(_){$('#cCopy').textContent='Copia non riuscita';}};
});
$('#cAgain').onclick=()=>{cForm.reset();$('#cCount').textContent='0 / 3000';cForm.hidden=false;$('#contactDone').hidden=true;cStart=Date.now();};

/* ======== eventi ======== */
let evMode='next';
function renderEvents(){
  const today=ymdRome(new Date());
  const list=EVENTS.filter(e=>evMode==='next'?e.date>=today:e.date<today).sort((a,b)=>evMode==='next'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
  $('#timeline').innerHTML=list.length?list.map((e,i)=>{const [y,m,d]=e.date.split('-').map(Number),pl=PLATES[[1,2,4,5,3,0][(i+(evMode==='past'?3:0))%6]];
    return `<li class="ev"><div class="ev-img" style="background-image:${cssUrl(e.image||pl)}"><div class="date"><b>${d}</b><span>${MESI[m-1]} ${y}</span></div></div>
    <div><h3>${esc(e.title)}</h3><p class="where">${esc(e.where)}${e.time?' · ore '+esc(e.time):''}</p><p>${esc(e.text)}</p>
    ${e.media&&e.media.length?`<div class="gallery">${e.media.map((x,k)=>`<div class="tile ${x.type==='video'?'video':''}" style="background-image:${cssUrl(x.src||PLATES[(k+i*2+1)%6])}"><span>${esc(x.label)}</span></div>`).join('')}</div>`:''}</div></li>`}).join('')
    :`<li class="empty-ev">${evMode==='next'?'Nessun evento in programma per ora: tieni d’occhio Instagram per le novità.':'Ancora nessun evento passato in archivio.'}</li>`;
}
$('#tabNext').onclick=()=>{evMode='next';$('#tabNext').setAttribute('aria-selected','true');$('#tabPast').setAttribute('aria-selected','false');renderEvents();};
$('#tabPast').onclick=()=>{evMode='past';$('#tabPast').setAttribute('aria-selected','true');$('#tabNext').setAttribute('aria-selected','false');renderEvents();};
function renderLunations(){
  const fm=new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'});
  $('#lunations').innerHTML=AQ.nextLunations(new Date(),4).map(l=>`<div class="lun" style="background-image:url(${PLATES[l.full?3:0]})"><div><b>${l.full?'Luna piena':'Luna nuova'} in ${AQ.fmt(l.lon).sign[0]}</b><span>${fm.format(l.date)}</span></div></div>`).join('');
}

/* ======== CALENDARIO DEI TRANSITI ======== */
const CAL={y:0,m:0,events:[],sel:null,cache:{},show:new Set(store.get('aq-calf')||['moon','phase','ingress','station','aspect'])};
const hm=new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'});
const monthFmt=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric',timeZone:'UTC'});
const SG=i=>AQ.SIGNS[i][1]+VS;
function evShort(e){switch(e.type){
  case 'moon':return `☽${VS}→${SG(e.sign)}`;
  case 'phase':return `${['●','◐','○','◑'][e.phase/90]} ${['nuova','1° quarto','piena','ult. quarto'][e.phase/90]}`;
  case 'ingress':return `${e.glyph}${VS}→${SG(e.sign)}`;
  case 'station':return `${e.glyph}${VS} ${e.retro?'℞':'D'}`;
  case 'aspect':return `${e.a.glyph}${VS}${e.glyph}${VS}${e.b.glyph}${VS}`;}}
function evLong(e){const f=e.lon!=null?AQ.fmt(e.lon):null;switch(e.type){
  case 'moon':return{g:'☽'+VS,t:`La Luna entra in ${AQ.SIGNS[e.sign][0]}`};
  case 'phase':return{g:['●','◐','○','◑'][e.phase/90],t:`${e.name} a ${f.text} ${f.sign[0]}`};
  case 'ingress':return{g:e.glyph+VS,t:`${e.name} entra in ${AQ.SIGNS[e.sign][0]}${e.retro?' (retrogrado)':''}`};
  case 'station':return{g:e.glyph+VS,t:`${e.name} ${e.retro?'diventa retrogrado':'torna diretto'} a ${f.text} ${f.sign[0]}`};
  case 'aspect':return{g:e.glyph+VS,t:`${e.a.name} ${e.name} ${e.b.name}`};}}
const dayKey=d=>ymdRome(d);
function calCompute(){const k=`${CAL.y}-${CAL.m}`;if(CAL.cache[k])return CAL.cache[k];
  const d1=AQ.localToUTC(CAL.y,CAL.m,1,0,0,'Europe/Rome').date,ny=CAL.m===12?CAL.y+1:CAL.y,nm=CAL.m===12?1:CAL.m+1,d2=AQ.localToUTC(ny,nm,1,0,0,'Europe/Rome').date;
  const ev=AQ.events(d1,d2);
  // retrogradi nel mese: stato all'inizio + stazioni
  const start=AQ.retroState(d1),st=ev.filter(e=>e.type==='station');
  const retro=start.map(p=>{const s=st.filter(e=>e.id===p.id);return{...p,stations:s,any:p.retro||s.length>0};}).filter(p=>p.any);
  return CAL.cache[k]={ev,retro,d1,d2};}
function renderCal(){
  if(!CAL.y){const t=ymdRome(new Date()).split('-').map(Number);CAL.y=t[0];CAL.m=t[1];}
  $('#calTitle').textContent=monthFmt.format(new Date(Date.UTC(CAL.y,CAL.m-1,15)));
  $('#calGrid').innerHTML='<p class="hint" style="grid-column:1/-1;padding:20px">Calcolo dei transiti…</p>';
  setTimeout(()=>{
    const {ev,retro}=calCompute();CAL.events=ev;
    const byDay={};ev.forEach(e=>{(byDay[dayKey(e.date)]??=[]).push(e);});
    const first=`${CAL.y}-${String(CAL.m).padStart(2,'0')}-01`,startW=(new Date(first+'T12:00:00Z').getUTCDay()+6)%7;
    const days=new Date(Date.UTC(CAL.y,CAL.m,0)).getUTCDate(),today=ymdRome(new Date());
    if(!CAL.sel||!CAL.sel.startsWith(`${CAL.y}-${String(CAL.m).padStart(2,'0')}`))CAL.sel=today.startsWith(first.slice(0,7))?today:first;
    let html='';for(let i=0;i<startW;i++)html+='<div class="mday out" aria-hidden="true"></div>';
    const ORDER={phase:0,station:1,ingress:2,aspect:3,moon:4},COL={phase:'color-mix(in srgb,var(--pink) 60%,transparent)',ingress:'var(--rose)',station:'#F2C46B',aspect:'var(--ink-soft)',moon:'var(--line)'};
    for(let d=1;d<=days;d++){const key=`${CAL.y}-${String(CAL.m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const noon=AQ.localToUTC(CAL.y,CAL.m,d,12,0,'Europe/Rome').date,ml=AQ.points(noon).find(p=>p.id==='moon').lon,mi=AQ.moonInfo(noon);
      const list=(byDay[key]||[]).filter(e=>CAL.show.has(e.type)).sort((a,b)=>ORDER[a.type]-ORDER[b.type]);
      const vis=list.slice(0,3),more=list.length-vis.length;
      html+=`<button type="button" class="mday${key===today?' today':''}" data-day="${key}" aria-pressed="${CAL.sel===key}" aria-label="${d} ${monthFmt.format(new Date(Date.UTC(CAL.y,CAL.m-1,15)))}: ${list.length} eventi, Luna in ${AQ.SIGNS[Math.floor(ml/30)][0]}">
        <span class="top"><span class="n">${d}</span><span class="ms" title="Luna in ${AQ.SIGNS[Math.floor(ml/30)][0]} alle 12:00">${moonIcon(mi.angle)}${SG(Math.floor(ml/30))}</span></span>
        ${vis.map(e=>`<span class="ce t-${e.type}">${evShort(e)}</span>`).join('')}${more>0?`<span class="more">+${more}</span>`:''}
        <span class="dots">${[...new Set(list.map(e=>e.type))].filter(t=>t!=='moon').map(t=>`<i style="--c:${COL[t]}"></i>`).join('')}</span></button>`;}
    $('#calGrid').innerHTML=html;
    $$('#calGrid .mday[data-day]').forEach(b=>b.onclick=()=>{CAL.sel=b.dataset.day;$$('#calGrid .mday[data-day]').forEach(x=>x.setAttribute('aria-pressed',x===b));renderDay();});
    $('#retroList').innerHTML=retro.length?retro.map(p=>{const s=p.stations.map(e=>`${e.retro?'retrogrado':'diretto'} dal ${shortDay(e.date)}`).join(', ');
      return `<li><span class="g">${p.glyph+VS}</span><span>${p.name} <small>${s||(p.retro?'retrogrado per tutto il mese':'')}</small></span></li>`;}).join(''):'<li class="hint">Nessun pianeta retrogrado questo mese.</li>';
    renderDay();
  },20);
}
const shortDay=d=>new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short',timeZone:'Europe/Rome'}).format(d);
function renderDay(){const key=CAL.sel,[y,m,d]=key.split('-').map(Number),noon=AQ.localToUTC(y,m,d,12,0,'Europe/Rome').date;
  const ml=AQ.points(noon).find(p=>p.id==='moon').lon,mi=AQ.moonInfo(noon);
  $('#dayTitle').textContent=cap(new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(key+'T12:00:00Z')));
  $('#daySub').textContent=`${moonPhaseName(mi.angle)}, Luna in ${AQ.SIGNS[Math.floor(ml/30)][0]} alle 12:00`;
  const list=CAL.events.filter(e=>dayKey(e.date)===key&&CAL.show.has(e.type));
  $('#dayList').innerHTML=list.length?list.map(e=>{const l=evLong(e);return `<li><time>${hm.format(e.date)}</time><span class="g" aria-hidden="true">${l.g}</span><span>${esc(l.t)}</span></li>`;}).join(''):'<li class="hint" style="display:block">Nessun evento tra quelli selezionati.</li>';}
$('#calPrev').onclick=()=>{CAL.m--;if(CAL.m<1){CAL.m=12;CAL.y--;}if(CAL.y<1800){CAL.y=1800;CAL.m=1;}CAL.sel=null;renderCal();};
$('#calNext').onclick=()=>{CAL.m++;if(CAL.m>12){CAL.m=1;CAL.y++;}if(CAL.y>2399){CAL.y=2399;CAL.m=12;}CAL.sel=null;renderCal();};
$('#calToday').onclick=()=>{CAL.y=0;CAL.sel=null;renderCal();};
$$('#calFilters [data-f]').forEach(b=>{b.setAttribute('aria-pressed',CAL.show.has(b.dataset.f));b.onclick=()=>{const f=b.dataset.f;CAL.show.has(f)?CAL.show.delete(f):CAL.show.add(f);b.setAttribute('aria-pressed',CAL.show.has(f));store.set('aq-calf',[...CAL.show]);if(CAL.events.length||CAL.y)renderCal();};});

/* ======== LUNE NUOVE E PIENE ======== */
const LUNE={y:0,cache:{}};
const lnFmt=new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'});
const lnLong=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'});
function lunationsYear(y){if(LUNE.cache[y])return LUNE.cache[y];
  const d1=AQ.localToUTC(y,1,1,0,0,'Europe/Rome').date,d2=AQ.localToUTC(y+1,1,1,0,0,'Europe/Rome').date;
  return LUNE.cache[y]=AQ.events(d1,d2,{moon:false,aspects:false,planets:false}).filter(e=>e.phase===0||e.phase===180);}
function renderLune(){
  const now=new Date();if(!LUNE.y)LUNE.y=+ymdRome(now).slice(0,4);
  // le prossime due
  const nx=AQ.nextLunations(now,2);
  $('#luneNext').innerHTML=nx.map(l=>{const f=AQ.fmt(l.lon),days=Math.ceil((l.date-now)/864e5);
    return `<div class="lnx" style="background-image:url(${PLATES[l.full?3:0]})"><div><small>${days<=1?'Entro domani':'Tra '+days+' giorni'}</small><b>${l.full?'Luna piena':'Luna nuova'} in ${f.sign[0]}</b><span>${f.text} ${f.sign[0]} · ${lnLong.format(l.date)}</span></div></div>`;}).join('');
  // anno, mese per mese
  $('#luneTitle').textContent=LUNE.y;
  const list=lunationsYear(LUNE.y),cur=ymdRome(now).slice(0,7);let html='';
  for(let m=1;m<=12;m++){const key=`${LUNE.y}-${String(m).padStart(2,'0')}`,items=list.filter(e=>ymdRome(e.date).slice(0,7)===key);
    const fulls=items.filter(e=>e.phase===180).length,news=items.filter(e=>e.phase===0).length;let nf=0,nn=0;
    html+=`<article class="lm${key===cur?' cur':''}"><h4>${new Intl.DateTimeFormat('it-IT',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(LUNE.y,m-1,15)))}</h4><ul>${items.map(e=>{const f=AQ.fmt(e.lon),full=e.phase===180;
      const second=full?(++nf===2&&fulls===2):(++nn===2&&news===2);
      return `<li class="${e.date<now?'past':''}">${moonIcon(e.phase)}<div>${second?`<em>${full?'Seconda Luna piena del mese (Luna blu)':'Seconda Luna nuova del mese (Luna nera)'}</em>`:''}<b>${full?'Luna piena':'Luna nuova'} in ${f.sign[0]}</b><span>${lnFmt.format(e.date)} · ${f.text} ${f.sign[1]+VS}</span></div></li>`;}).join('')}</ul></article>`;}
  $('#luneYear').innerHTML=html;
}
$('#lunePrev').onclick=()=>{if(LUNE.y>1800){LUNE.y--;renderLune();}};
$('#luneNextY').onclick=()=>{if(LUNE.y<2399){LUNE.y++;renderLune();}};
$('#luneToday').onclick=()=>{LUNE.y=0;renderLune();};

/* prospetto lunare del mese */
const LM={y:0,m:0};
function renderLuneMonth(){
  const now=new Date();if(!LM.y){const t=ymdRome(now).split('-').map(Number);LM.y=t[0];LM.m=t[1];}
  const title=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(LM.y,LM.m-1,15)));
  $('#lmTitle').textContent=title;
  const key=`${LM.y}-${String(LM.m).padStart(2,'0')}`,today=ymdRome(now);
  const lun=lunationsYear(LM.y).filter(e=>ymdRome(e.date).slice(0,7)===key);
  const days=new Date(Date.UTC(LM.y,LM.m,0)).getUTCDate(),startW=(new Date(key+'-01T12:00:00Z').getUTCDay()+6)%7;
  const hhmm=new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Rome'});
  let html='',bar='';for(let i=0;i<startW;i++)html+='<div class="lmd out" aria-hidden="true"></div>';
  for(let d=1;d<=days;d++){const dk=`${key}-${String(d).padStart(2,'0')}`,noon=AQ.localToUTC(LM.y,LM.m,d,12,0,'Europe/Rome').date,mi=AQ.moonInfo(noon),s=Math.floor(mi.moonLon/30);
    const ev=lun.find(e=>ymdRome(e.date)===dk),ill=Math.round(mi.ill*100);
    const tag=ev?`<span class="tag">${ev.phase===180?'Luna piena':'Luna nuova'}<small>${hhmm.format(ev.date)} · ${AQ.fmt(ev.lon).text}</small></span>`:`<span class="il">${ill}%</span>`;
    html+=`<div class="lmd${dk===today?' today':''}${ev?' key':''}" role="listitem" aria-label="${d}: ${moonPhaseName(mi.angle)}, illuminata al ${ill}%, Luna in ${AQ.SIGNS[s][0]}${ev?', '+(ev.phase===180?'Luna piena':'Luna nuova')+' alle '+hhmm.format(ev.date):''}">
      <span class="n">${d}</span>${moonIcon(ev?ev.phase:mi.angle)}<span class="sg">${AQ.SIGNS[s][1]+VS}</span>${tag}</div>`;
    bar+=`<i style="--f:${mi.ill.toFixed(3)}" title="${d}: ${ill}%"></i>`;}
  $('#lmGrid').innerHTML=html;$('#lmBar').innerHTML=bar;
  $('#lmSum').textContent=lun.length?lun.map(e=>`${e.phase===180?'Luna piena':'Luna nuova'} in ${AQ.fmt(e.lon).sign[0]} ${new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',timeZone:'Europe/Rome'}).format(e.date)} alle ${hhmm.format(e.date)}`).join(' · '):'Nessuna Luna nuova o piena in questo mese.';
}
$('#lmPrev').onclick=()=>{LM.m--;if(LM.m<1){LM.m=12;LM.y--;}if(LM.y<1800){LM.y=1800;LM.m=1;}renderLuneMonth();};
$('#lmNext').onclick=()=>{LM.m++;if(LM.m>12){LM.m=1;LM.y++;}if(LM.y>2399){LM.y=2399;LM.m=12;}renderLuneMonth();};
$('#lmToday').onclick=()=>{LM.y=0;renderLuneMonth();};

/* ======== navigazione, reveal, tema ======== */
const links=[...$$('.nav a')];
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));}});},{rootMargin:'-45% 0px -50% 0px'});
['cielo','calendario','lune','chi-sono','tema','sinastria','blog','contattami','social','eventi'].forEach(id=>io.observe(document.getElementById(id)));
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target);}}),{rootMargin:'0px 0px -12% 0px'});
$$('.reveal').forEach(el=>ro.observe(el));
$$('[data-goto-rub]').forEach(a=>a.addEventListener('click',()=>{B.filter=a.dataset.gotoRub;B.shown=6;renderBlog();}));
function isDark(){const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}
function setTheme(t){if(t!=='light'&&t!=='dark')t=null;if(t)document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme;const lbl=isDark()?'Pagine chiare':'Pagine scure';$('#themeBtn').textContent=lbl;$('#themeBtn2').textContent=lbl;if($('#themeBtn3'))$('#themeBtn3').textContent=lbl;}
const toggle=()=>{const t=isDark()?'light':'dark';store.set('aq-theme',t);setTheme(t);};
$('#themeBtn').onclick=toggle;$('#themeBtn2').onclick=toggle;$('#themeBtn3').onclick=toggle;
setTheme(store.get('aq-theme'));
window.addEventListener('hashchange',openFromHash);
renderEvents();initBlog();
function lazyRender(sel,fn){const el=$(sel);if(!('IntersectionObserver' in window)||!el){fn();return;}let done=false;const o=new IntersectionObserver(es=>{if(!done&&es.some(e=>e.isIntersecting)){done=true;o.disconnect();fn();}},{rootMargin:'800px 0px'});o.observe(el);}
window.__boot=()=>{renderNow();renderSky();lazyRender('#calendario',renderCal);lazyRender('#lune',()=>{renderLune();renderLuneMonth();});setInterval(renderNow,600000);$('#engineState').textContent='Swiss Ephemeris '+AQ.swe.version();$('#natalForm button[type=submit]').disabled=false;$('#synForm button[type=submit]').disabled=false;};
window.__bootFail=e=>{$('#heroNow').textContent='Non è stato possibile avviare il motore astronomico: ricarica la pagina.';console.error(e);};
$('#emptyWheel').innerHTML=wheel([],null,{mini:1,logo:1});
$('#contactDone').insertAdjacentHTML('afterbegin',moonIcon(180));

if(SITE.repo)$('#srcLink').href=SITE.repo;
$$('a[href^="mailto:"]').forEach(a=>{a.href='mailto:'+SITE.email;if(!a.children.length&&a.textContent.includes('@'))a.textContent=SITE.email;else{const h=a.querySelector('.h');if(h&&h.textContent.includes('@'))h.textContent=SITE.email;}});

/* menu mobile */
(function(){const dlg=$('#menuDlg');if(!dlg)return;
  $('#navMore').onclick=()=>{dlg.showModal();};
  $('#menuClose').onclick=()=>dlg.close();
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  $$('#menuDlg a').forEach(a=>a.addEventListener('click',()=>dlg.close()));})();

/* =====================================================================
   DOPPIA RUOTA (sinastria e transiti), ASPETTI INCROCIATI
   ===================================================================== */
const XASP=[[0,'congiunzione','\u260C','major'],[180,'opposizione','\u260D','hard'],[120,'trigono','\u25B3','soft'],[90,'quadrato','\u25A1','hard'],[60,'sestile','\u26B9','soft']];
function crossAspects(A,B,orbFn){const out=[];
  for(const a of A)for(const b of B){let d=Math.abs(a.lon-b.lon);if(d>180)d=360-d;
    for(const [ang,name,glyph,type] of XASP){const orb=Math.abs(d-ang);if(orb<=orbFn(a,b,ang)){
      const dt=.05,la=a.lon+(a.speed||0)*dt,lb=b.lon+(b.speed||0)*dt;let d2=Math.abs(la-lb)%360;if(d2>180)d2=360-d2;
      out.push({a,b,angle:ang,name,glyph,type,orb,applying:Math.abs(d2-ang)<orb});break;}}}
  return out.sort((x,y)=>x.orb-y.orb);}
const fmtOrb=o=>`${Math.floor(o)}°${String(Math.round((o%1)*60)).padStart(2,'0')}′`;
function wheel2(A,B,h,cross,o={}){
  const cx=300,cy=300,asc=h?h.asc:0,R0=292,R1=250,RB=192,RH=h?104:96;
  const P=(lon,r)=>{const a=(180+lon-asc)*R;return[+(cx+r*Math.cos(a)).toFixed(2),+(cy-r*Math.sin(a)).toFixed(2)];};
  let s=`<svg viewBox="-26 -26 652 652" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="chart-svg">`;
  for(let i=0;i<12;i++) s+=`<path d="${arcPath(i*30,i*30+30,R0,R1,P)}" fill="var(--el-${ELEM[i%4]})" stroke="var(--rose)" stroke-width="1"/>`;
  s+=`<circle cx="300" cy="300" r="${R0}" fill="none" stroke="var(--pink)" stroke-width="2"/><circle cx="300" cy="300" r="${R1}" fill="var(--surface)" stroke="var(--pink)" stroke-width="1.4"/>`;
  for(let i=0;i<12;i++){const [x,y]=P(i*30+15,271);s+=`<text class="zs" x="${x}" y="${y}" font-size="25" text-anchor="middle" dominant-baseline="central">${AQ.SIGNS[i][1]+VS}</text>`;}
  for(let d=0;d<360;d+=2){const len=d%10===0?9:4;const [x1,y1]=P(d,R1),[x2,y2]=P(d,R1-len);s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--rose)" stroke-width="${d%10===0?1.3:.7}"/>`;}
  s+=`<circle cx="300" cy="300" r="${RB}" fill="color-mix(in srgb,var(--blush) 35%,var(--surface))" stroke="var(--rose)" stroke-width="1.2"/>`;
  s+=`<circle cx="300" cy="300" r="${RH}" fill="var(--surface)" stroke="var(--rose)" stroke-width="1.2"/>`;
  s+=`<g opacity=".09" transform="translate(300 300) scale(.3) translate(-303 -280)">${LOGO_INNER}</g>`;
  if(h){for(let i=1;i<=12;i++){const c=h.cusps[i],ang=[1,4,7,10].includes(i);const [x1,y1]=P(c,ang?R0+8:RB),[x2,y2]=P(c,RH);
      s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ang?'var(--pink-strong)':'var(--rose)'}" stroke-width="${ang?2:1}"/>`;
      const mid=AQ.norm(c+AQ.norm(h.cusps[i%12+1]-c)/2),[hx,hy]=P(mid,RH+11);s+=`<text class="hn" x="${hx}" y="${hy}" font-size="10" text-anchor="middle" dominant-baseline="central">${i}</text>`;}
    for(const [lbl,l] of [['AC',h.asc],['MC',h.mc]]){const [x,y]=P(l,R0+18);s+=`<text class="axl" x="${x}" y="${y}" font-size="13" text-anchor="middle" dominant-baseline="central">${lbl}</text>`;}}
  s+='<g class="asp">';
  for(const x of cross){if(x.angle===0)continue;const [x1,y1]=P(x.a.lon,RH),[x2,y2]=P(x.b.lon,RH);const col=x.type==='hard'?'var(--asp-hard)':'var(--asp-soft)';
    s+=`<line data-a="${x.a.id}" data-b="b-${x.b.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${x.orb<1?2:1.2}" stroke-opacity="${x.orb<1?.95:.7}"/>`;}
  s+='</g>';
  const put=(list,rTick0,rTick1,rG,rD,cls,pref)=>{for(const {p,d} of spread(list,7)){const [t1x,t1y]=P(p.lon,rTick0),[t2x,t2y]=P(p.lon,rTick1),[gx,gy]=P(d,rG),[dx,dy]=P(d,rD),f=AQ.fmt(p.lon);
    s+=`<g class="pt" data-p="${pref}${p.id}"><title>${esc(p.name)}: ${f.full} ${f.sign[0]}</title><line x1="${t1x}" y1="${t1y}" x2="${t2x}" y2="${t2y}" stroke="var(--pink-strong)" stroke-width="1.8"/><circle cx="${gx}" cy="${gy}" r="13" fill="transparent"/><text class="${cls}" x="${gx}" y="${gy}" font-size="${p.cat==='X'?13:21}" text-anchor="middle" dominant-baseline="central">${p.cat==='X'?p.glyph:G(p)}</text><text class="pd" x="${dx}" y="${dy}" font-size="9.5" text-anchor="middle" dominant-baseline="central">${f.deg}°${p.retro?'℞':''}</text></g>`;}};
  put(B,R1,R1-10,227,206,'pg pg-b','b-');
  put(A.filter(p=>p.cat!=='X'),RB,RB-9,169,146,'pg','');
  return s+'</svg>';}
function hoverCross(svg){svg.querySelectorAll('.pt').forEach(g=>{const id=g.dataset.p;
  const on=()=>{svg.classList.add('focus');svg.querySelectorAll('.asp line').forEach(l=>l.classList.toggle('hi',l.dataset.a===id||l.dataset.b===id));g.classList.add('hi');};
  const off=()=>{svg.classList.remove('focus');svg.querySelectorAll('.hi').forEach(x=>x.classList.remove('hi'));};
  g.addEventListener('pointerenter',on);g.addEventListener('pointerleave',off);g.addEventListener('click',()=>{g.classList.contains('hi')?off():(off(),on());});});}

/* =====================================================================
   TRANSITI PERSONALI
   ===================================================================== */
const TR_IDS=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','node','chiron'];
let TR_DAY=null;
function renderTransits(){
  const box=$('#transits');if(!box||!NATAL)return;
  if(!TR_DAY)TR_DAY=ymdRome(new Date());
  const [y,m,d]=TR_DAY.split('-').map(Number),date=AQ.localToUTC(y,m,d,12,0,'Europe/Rome').date;
  const T=AQ.points(date,{node:SET.node,lilith:SET.lilith}).filter(p=>TR_IDS.includes(p.id));
  const N=[...NATAL.pl.filter(p=>MAIN_IDS.includes(p.id)),...NATAL.angles].map(p=>({...p,speed:0}));
  const orb=(n,t)=>['jupiter','saturn','uranus','neptune','pluto','node','chiron'].includes(t.id)?1.5:1;
  const X=crossAspects(N,T,orb);
  const hd=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(TR_DAY+'T12:00:00Z'));
  const list=X.map(x=>`<li class="al-${x.type}"><span class="g">${G(x.b)}</span><span><b>${esc(x.b.name)}</b> in transito ${x.name} ${x.a.cat==='X'?'all’':'al tuo '}<b>${esc(x.a.name)}</b>${x.a.cat==='X'?'':' natale'} <small>orbita ${fmtOrb(x.orb)} · ${x.applying?'si avvicina':'si allontana'}</small></span></li>`).join('');
  const houses=NATAL.h?`<div class="tr-houses"><h4>I pianeti in transito nelle tue case</h4><ul>${T.map(t=>{const f=AQ.fmt(t.lon);return `<li><span class="g">${G(t)}</span>${esc(t.name)} <span class="data">${f.text} ${f.sign[0]}</span> <b>casa ${AQ.houseOf(t.lon,NATAL.h.cusps)}</b></li>`;}).join('')}</ul></div>`:'';
  box.innerHTML=`<div class="tr-head"><h3>I transiti sul tuo tema</h3><p class="lede" style="margin-top:6px">Il cielo di un giorno qualsiasi, sopra la tua carta natale: anello esterno, alle 12:00 di Roma.</p>
    <div class="daynav tr-nav"><button type="button" id="trPrev" aria-label="Giorno precedente">‹</button><input type="date" id="trDate" value="${TR_DAY}" aria-label="Giorno dei transiti" min="1800-01-01" max="2399-12-31"><button type="button" id="trNext" aria-label="Giorno successivo">›</button><button type="button" class="linkbtn" id="trToday">Oggi</button></div>
    <p class="tr-day">${cap(hd)}</p></div>
    <div class="chart-card"><div class="wheel-wrap" id="trWheel" role="img" aria-label="Tema natale con i pianeti in transito sull’anello esterno">${wheel2(N,T,NATAL.h,X)}</div>
      <div class="legend"><span><i class="l-in"></i>Interno: la tua carta natale</span><span><i class="l-out"></i>Esterno: i transiti</span><span><i class="l-hard"></i>Tesi</span><span><i class="l-soft"></i>Armonici</span></div></div>
    <div class="tr-cols"><div><h4>Aspetti dei transiti</h4>${list?`<ul class="tr-list">${list}</ul>`:'<p class="hint">Nessun transito esatto entro un grado e mezzo in questo giorno.</p>'}</div>${houses}</div>`;
  const go=n=>{const [a,b,c]=TR_DAY.split('-').map(Number);const t=new Date(Date.UTC(a,b-1,c+n));TR_DAY=t.toISOString().slice(0,10);renderTransits();};
  $('#trPrev').onclick=()=>go(-1);$('#trNext').onclick=()=>go(1);$('#trToday').onclick=()=>{TR_DAY=ymdRome(new Date());renderTransits();};
  $('#trDate').onchange=e=>{if(e.target.value&&+e.target.value.slice(0,4)>=1800&&+e.target.value.slice(0,4)<=2399){TR_DAY=e.target.value;renderTransits();}};
  hoverCross($('#trWheel svg'));
}

/* =====================================================================
   SINASTRIA
   ===================================================================== */
function makePicker(p){
  const input=$('#'+p+'Place'),list=$('#'+p+'Ac'),hint=$('#'+p+'Hint');let sel=null,items=[],idx=-1;
  const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');idx=-1;};
  const draw=()=>{if(!items.length){list.hidden=true;return;}
    list.innerHTML=items.map((q,i)=>`<li id="${p}-ac-${i}" role="option" aria-selected="${i===idx}" data-i="${i}"><b>${esc(q.name)}</b> <span>${esc(q.it?(q.label.slice(q.name.length).trim()+(q.alt?' · '+q.alt:'')):q.label.slice(q.name.length+2))}</span></li>`).join('');
    list.hidden=false;input.setAttribute('aria-expanded','true');
    list.querySelectorAll('li[data-i]').forEach(li=>li.addEventListener('mousedown',e=>{e.preventDefault();pick(items[+li.dataset.i]);}));};
  const pick=q=>{sel=q;input.value=q.label;hint.textContent=`${coordText(q.lat,q.lon)} · ${q.tz}`;close();};
  input.addEventListener('input',()=>{sel=null;items=searchPlaces(input.value);idx=items.length?0:-1;draw();});
  input.addEventListener('keydown',e=>{if(list.hidden||!items.length)return;
    if(e.key==='ArrowDown'){e.preventDefault();idx=(idx+1)%items.length;draw();}else if(e.key==='ArrowUp'){e.preventDefault();idx=(idx-1+items.length)%items.length;draw();}
    else if(e.key==='Enter'&&idx>=0){e.preventDefault();pick(items[idx]);}else if(e.key==='Escape')close();});
  input.addEventListener('blur',()=>setTimeout(close,120));
  return{get:()=>sel?{name:sel.label,lat:sel.lat,lon:sel.lon,tz:sel.tz}:findCity(input.value)};}
const SYN_PICK={sa:makePicker('sa'),sb:makePicker('sb')};
['sa','sb'].forEach(p=>$('#'+p+'NoTime').addEventListener('change',e=>{$('#'+p+'Time').disabled=e.target.checked;}));
function synPerson(p){
  const name=$('#'+p+'Name').value.trim(),dv=$('#'+p+'Date').value,noTime=$('#'+p+'NoTime').checked,tv=noTime?'12:00':$('#'+p+'Time').value,label=p==='sa'?'la prima persona':'la seconda persona';
  if(!dv)throw `Inserisci la data di nascita del${p==='sa'?'la prima':'la seconda'} persona.`;
  if(+dv.slice(0,4)<1800||+dv.slice(0,4)>2399)throw 'Le effemeridi coprono gli anni dal 1800 al 2399.';
  if(!tv)throw `Inserisci l’ora di nascita per ${label}, oppure spunta «Non conosco l’ora».`;
  const place=SYN_PICK[p].get();if(!place)throw `Scegli il luogo di nascita per ${label} dall’elenco.`;
  const [y,m,d]=dv.split('-').map(Number),[hh,mm]=tv.split(':').map(Number),t=AQ.localToUTC(y,m,d,hh,mm,place.tz);
  const pl=AQ.points(t.date,{node:SET.node,lilith:SET.lilith}).filter(q=>MAIN_IDS.includes(q.id)&&q.id!=='snode');
  const h=noTime?null:AQ.houses(t.date,place.lat,place.lon,SET.sys);
  const angles=h?[{id:'asc',name:'Ascendente',glyph:'AC',cat:'X',lon:h.asc,speed:0},{id:'mc',name:'Medio Cielo',glyph:'MC',cat:'X',lon:h.mc,speed:0}]:[];
  const dl=new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric'}).format(new Date(Date.UTC(y,m-1,d,12)));
  return{name:name||(p==='sa'?'Persona A':'Persona B'),pl,h,angles,meta:`${dl}${noTime?', ora sconosciuta':', ore '+tv} · ${place.name}`};}
$('#synForm').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#synErr');err.textContent='';let A,B;
  try{A=synPerson('sa');B=synPerson('sb');}catch(x){err.textContent=String(x);return;}
  store.set('aq-syn',['sa','sb'].map(p=>({n:$('#'+p+'Name').value,d:$('#'+p+'Date').value,t:$('#'+p+'Time').value,x:$('#'+p+'NoTime').checked})));
  renderSynastry(A,B);});
function renderSynastry(A,B){
  const small=q=>['node','chiron','lilith'].includes(q.id)||q.cat==='X';
  const orb=(a,b,ang)=>{let o=ang===0||ang===180?8:ang===60?5:7;if(small(a)||small(b))o*=.6;return o;};
  const PA=[...A.pl,...A.angles],PB=[...B.pl,...B.angles],X=crossAspects(PA,PB,orb);
  const n={soft:X.filter(x=>x.type==='soft').length,hard:X.filter(x=>x.type==='hard').length,conj:X.filter(x=>x.angle===0).length};
  const amap={};X.forEach(x=>amap[x.a.id+'|'+x.b.id]=x);
  let grid=`<table class="agrid xgrid"><thead><tr><th></th>${PB.map(b=>`<th title="${esc(b.name)} di ${esc(B.name)}"><span class="g">${b.cat==='X'?b.glyph:G(b)}</span></th>`).join('')}</tr></thead><tbody>`;
  PA.forEach(a=>{grid+=`<tr><th scope="row" title="${esc(a.name)} di ${esc(A.name)}"><span class="g">${a.cat==='X'?a.glyph:G(a)}</span></th>`+PB.map(b=>{const x=amap[a.id+'|'+b.id];return x?`<td class="a-${x.type}" title="${esc(a.name)} di ${esc(A.name)} ${x.name} ${esc(b.name)} di ${esc(B.name)} · orbita ${fmtOrb(x.orb)}"><span class="g">${x.glyph+VS}</span><small>${Math.floor(x.orb)}°</small></td>`:'<td></td>';}).join('')+'</tr>';});
  grid+='</tbody></table>';
  const list=X.slice(0,24).map(x=>`<li class="al-${x.type}"><span class="g">${x.glyph+VS}</span><span><b>${esc(x.a.name)}</b> di ${esc(A.name)} ${x.name} <b>${esc(x.b.name)}</b> di ${esc(B.name)} <small>orbita ${fmtOrb(x.orb)}</small></span></li>`).join('');
  const over=(P,H,who,whose)=>H?`<div class="tr-houses"><h4>I pianeti di ${esc(who)} nelle case di ${esc(whose)}</h4><ul>${P.filter(q=>q.cat!=='X').map(q=>{const f=AQ.fmt(q.lon);return `<li><span class="g">${G(q)}</span>${esc(q.name)} <span class="data">${f.text} ${f.sign[0]}</span> <b>casa ${AQ.houseOf(q.lon,H.cusps)}</b></li>`;}).join('')}</ul></div>`:'';
  $('#synOut').innerHTML=`<div class="syn-res">
    <div class="res-head"><h3>${esc(A.name)} <em style="color:var(--pink)">e</em> ${esc(B.name)}</h3>
    <p class="res-meta">${esc(A.name)}: ${esc(A.meta)}<br>${esc(B.name)}: ${esc(B.meta)}</p></div>
    <div class="big3"><div><small>Aspetti armonici</small><b>${n.soft}</b></div><div><small>Aspetti tesi</small><b>${n.hard}</b></div><div><small>Congiunzioni</small><b>${n.conj}</b></div></div>
    <div class="chart-card"><div class="wheel-wrap" id="synWheel" role="img" aria-label="Doppia ruota: ${esc(A.name)} all’interno, ${esc(B.name)} all’esterno">${wheel2(PA,PB,A.h,X)}</div>
      <div class="legend"><span><i class="l-in"></i>Interno: ${esc(A.name)}</span><span><i class="l-out"></i>Esterno: ${esc(B.name)}</span><span><i class="l-hard"></i>Tesi</span><span><i class="l-soft"></i>Armonici</span></div></div>
    <div class="tables"><div><h3 style="margin-bottom:12px">Griglia degli aspetti</h3><p class="hint" style="margin-bottom:8px">Righe: ${esc(A.name)} · colonne: ${esc(B.name)}</p><div class="tbl-wrap">${grid}</div></div>
      <div><h3 style="margin-bottom:12px">Gli aspetti più stretti</h3>${list?`<ul class="tr-list">${list}</ul>`:'<p class="hint">Nessun aspetto maggiore tra i due temi.</p>'}</div>
      <div class="tr-cols">${over(B.pl,A.h,B.name,A.name)}${over(A.pl,B.h,A.name,B.name)}</div></div>
    <div class="res-actions"><a class="btn" href="#contattami">Chiedi una lettura di coppia</a></div></div>`;
  hoverCross($('#synWheel svg'));
  $('#synOut').scrollIntoView({block:'start'});}
(function(){const s=store.get('aq-syn');if(!s)return;['sa','sb'].forEach((p,i)=>{const v=s[i]||{};$('#'+p+'Name').value=v.n||'';$('#'+p+'Date').value=v.d||'';$('#'+p+'Time').value=v.t||'12:00';$('#'+p+'NoTime').checked=!!v.x;$('#'+p+'Time').disabled=!!v.x;});})();

/* =====================================================================
   CONDIVIDERE LA CARTA (immagine per le storie)
   ===================================================================== */
const loadImg=src=>new Promise((ok,ko)=>{const i=new Image();i.decoding='async';i.onload=()=>ok(i);i.onerror=ko;i.src=src;});
async function shareChart(){
  const btn=$('#shareChart');if(!btn||!NATAL)return;btn.disabled=true;const label=btn.textContent;btn.textContent='Preparo l’immagine…';
  try{
    const night=document.createElement('div');night.className='night';night.style.display='none';document.body.appendChild(night);
    const cs=getComputedStyle(night),cv=n=>cs.getPropertyValue('--'+n).trim();
    let xml=new XMLSerializer().serializeToString($('#natalWheel svg')).replace(/color-mix\([^)]*\)\)?/g,cv('blush')).replace(/var\(--([\w-]+)\)/g,(x,n)=>cv(n)||'#FCE9F3');night.remove();
    const st=`<style>text{font-family:'Noto Sans Symbols','Segoe UI Symbol','Apple Symbols',sans-serif}.zs{fill:${cv('ink')}}.pg{fill:${cv('pink-strong')}}.pg-s{fill:${cv('ink-soft')}}.pd,.hn{fill:${cv('ink-soft')};font-family:sans-serif}.axl{fill:${cv('pink-strong')};font-family:sans-serif;font-weight:600}</style>`;
    xml=xml.replace(/<svg([^>]*)>/,(x,a)=>`<svg${a.includes('xmlns=')?a:a+' xmlns="http://www.w3.org/2000/svg"'} width="1000" height="1000">${st}`);
    const [chart,bg,logo]=await Promise.all([loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml)),loadImg('/assets/img/cielo.jpg'),loadImg('/assets/img/logo.svg')]);
    try{await Promise.all([document.fonts.load("italic 90px 'Instrument Serif'"),document.fonts.load("600 40px 'Instrument Sans'"),document.fonts.load("28px 'Jura'")]);}catch(e){}
    const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
    const r=Math.max(1080/bg.width,1920/bg.height);x.drawImage(bg,(1080-bg.width*r)*.62,(1920-bg.height*r)/2,bg.width*r,bg.height*r);
    const g=x.createLinearGradient(0,0,0,1920);g.addColorStop(0,'rgba(23,8,21,.55)');g.addColorStop(.5,'rgba(23,8,21,.35)');g.addColorStop(1,'rgba(23,8,21,.9)');x.fillStyle=g;x.fillRect(0,0,1080,1920);
    const lw=150,lh=lw*296/362;x.drawImage(logo,(1080-lw)/2,120,lw,lh);
    x.textAlign='center';x.fillStyle='#FCE9F3';x.font="italic 96px 'Instrument Serif', Georgia, serif";
    x.fillText(NATAL.name?`Il cielo di ${NATAL.name}`:'Il mio cielo di nascita',540,390,980);
    x.font="30px 'Jura', sans-serif";x.fillStyle='#D9AECB';x.fillText(`${NATAL.dl} · ${NATAL.place}`,540,450,980);
    x.font="600 40px 'Instrument Sans', sans-serif";x.fillStyle='#FFA3CF';
    x.fillText(`Sole in ${NATAL.sun} · Luna in ${NATAL.moon}${NATAL.asc?' · Ascendente '+NATAL.asc:''}`,540,530,1000);
    x.drawImage(chart,40,600,1000,1000);
    x.font="italic 54px 'Instrument Serif', Georgia, serif";x.fillStyle='#FCE9F3';x.fillText('AstroQuack',540,1735);
    x.font="30px 'Jura', sans-serif";x.fillStyle='#D9AECB';x.fillText((SITE.url||location.origin).replace(/^https?:\/\//,''),540,1790);
    const blob=await new Promise(ok=>c.toBlob(ok,'image/png'));const file=new File([blob],'astroquack-tema-natale.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:'Il mio tema natale · AstroQuack'});
    else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);}
  }catch(e){if(e&&e.name!=='AbortError')alert('Non è stato possibile creare l’immagine. Riprova.');console.error(e);}
  finally{btn.disabled=false;btn.textContent=label;}}

/* =====================================================================
   NEWSLETTER, SOCIAL, INVIO DIRETTO
   ===================================================================== */
(function(){const s=SITE.social||{};$$('[data-social]').forEach(a=>{const u=s[a.dataset.social];if(u)a.href=u;});$$('[data-handle]').forEach(e=>{const h=s[e.dataset.handle+'Handle'];if(h)e.textContent=h;});})();
if(SITE.web3formsKey)$('#cHint').textContent='Il messaggio arriva direttamente nella mia casella.';
(function(){if(!SITE.newsletterAction)return;$('#newsletter').hidden=false;
  $('#nlForm').addEventListener('submit',e=>{e.preventDefault();const err=$('#nlErr'),em=$('#nlEmail').value.trim();err.textContent='';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){err.textContent='Inserisci un indirizzo email valido.';$('#nlEmail').focus();return;}
    if(!$('#nlOk').checked){err.textContent='Per iscriverti serve il consenso.';return;}
    const f=document.createElement('form');f.method='POST';f.action=SITE.newsletterAction;f.target='nlFrame';f.hidden=true;
    const add=(k,v)=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;f.appendChild(i);};
    add(SITE.newsletterEmailField||'email',em);new URLSearchParams(SITE.newsletterExtraFields||'').forEach((v,k)=>add(k,v));
    document.body.appendChild(f);f.submit();f.remove();$('#nlDone').hidden=false;$('#nlForm').querySelector('button').disabled=true;});})();
