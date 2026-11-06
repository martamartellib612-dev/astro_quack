/* ===== Motore AstroQuack su Swiss Ephemeris 2.10 (AGPL) ===== */
const AQ=(()=>{
  const R=Math.PI/180, norm=x=>((x%360)+360)%360;
  let swe=null;
  const F=2|256; // SEFLG_SWIEPH | SEFLG_SPEED
  const SIGNS=[['Ariete','\u2648'],['Toro','\u2649'],['Gemelli','\u264A'],['Cancro','\u264B'],['Leone','\u264C'],['Vergine','\u264D'],['Bilancia','\u264E'],['Scorpione','\u264F'],['Sagittario','\u2650'],['Capricorno','\u2651'],['Acquario','\u2652'],['Pesci','\u2653']];
  // id, nome, glifo, codice SE, categoria (L luminari, P pianeti, M punti minori, A asteroidi)
  const BODIES=[
    ['sun','Sole','\u2609',0,'L'],['moon','Luna','\u263D',1,'L'],['mercury','Mercurio','\u263F',2,'P'],['venus','Venere','\u2640',3,'P'],
    ['mars','Marte','\u2642',4,'P'],['jupiter','Giove','\u2643',5,'P'],['saturn','Saturno','\u2644',6,'P'],['uranus','Urano','\u2645',7,'P'],
    ['neptune','Nettuno','\u2646',8,'P'],['pluto','Plutone','\u2647',9,'P'],['node','Nodo Nord','\u260A',null,'M'],['snode','Nodo Sud','\u260B',null,'M'],
    ['chiron','Chirone','\u26B7',15,'M'],['lilith','Lilith','\u26B8',null,'M'],
    ['ceres','Cerere','\u26B3',17,'A'],['pallas','Pallade','\u26B4',18,'A'],['juno','Giunone','\u26B5',19,'A'],['vesta','Vesta','\u26B6',20,'A']];
  async function init(cfg){ globalThis.__SWE_CFG=cfg; swe=new SwissEph(); await swe.initSwissEph(); return swe.version(); }
  // giorno giuliano in tempo universale (UT): calc_ut applica da sé il ΔT
  const jdUT=date=>date.getTime()/864e5+2440587.5;
  const calc=(jd,code)=>{const r=swe.calc_ut(jd,code,F);return{lon:norm(r[0]),lat:r[1],speed:r[3]};};
  function points(date,o={}){
    const jd=jdUT(date),node=o.node==='mean'?10:11,lil=o.lilith==='oscu'?13:12,out=[];
    for(const [id,name,glyph,code,cat] of BODIES){
      if(cat==='A'&&!o.asteroids)continue;
      let p;
      if(id==='node')p=calc(jd,node);
      else if(id==='snode'){const n=calc(jd,node);p={lon:norm(n.lon+180),lat:-n.lat,speed:n.speed};}
      else if(id==='lilith')p=calc(jd,lil);
      else p=calc(jd,code);
      out.push({id,name,glyph,cat,...p,retro:p.speed<0&&id!=='node'&&id!=='snode'});
    }
    return out;
  }
  function houses(date,lat,lon,sys='P'){
    const jd=jdUT(date),h=swe.houses_ex(jd,0,lat,lon,sys);
    const c=[0];for(let i=1;i<=12;i++)c.push(norm(h.cusps[i]));
    let system={P:'Placidus',K:'Koch',R:'Regiomontano',C:'Campano',O:'Porfirio',E:'Equal',W:'Whole Sign'}[sys]||sys;
    if((sys==='P'||sys==='K')&&Math.abs(lat)>66.5)system+=' → Porfirio (latitudine polare)';
    return{cusps:c,asc:norm(h.ascmc[0]),mc:norm(h.ascmc[1]),vertex:norm(h.ascmc[3]),system};
  }
  function houseOf(lon,c){for(let i=1;i<=12;i++){const a=c[i],b=c[i%12+1],span=norm(b-a);if(norm(lon-a)<span)return i;}return 1;}
  function fortune(pl,h){const sun=pl.find(p=>p.id==='sun').lon,moon=pl.find(p=>p.id==='moon').lon,hs=houseOf(sun,h.cusps),day=hs>=7;
    return{id:'fortune',name:'Parte di Fortuna',glyph:'\u2297',cat:'M',lon:norm(day?h.asc+moon-sun:h.asc+sun-moon),speed:0,retro:false,day};}
  function fmt(lon){const s=Math.floor(lon/30);let d=lon-s*30,deg=Math.floor(d),mf=(d-deg)*60,min=Math.floor(mf),sec=Math.round((mf-min)*60);
    if(sec===60){sec=0;min++;}if(min===60){min=0;deg++;}
    let rm=Math.round((d-Math.floor(d))*60),rd=Math.floor(d);if(rm===60){rm=0;rd++;}
    return{sign:SIGNS[s],deg:rd,min:rm,text:`${rd}°${String(rm).padStart(2,'0')}′`,full:`${deg}°${String(min).padStart(2,'0')}′${String(sec).padStart(2,'0')}″`};}
  // aspetti: [angolo, nome, glifo, tipo, orbita luminari, orbita altri]
  const ASPECTS=[[0,'Congiunzione','\u260C','major',10,8],[180,'Opposizione','\u260D','hard',10,8],[120,'Trigono','\u25B3','soft',8,6],[90,'Quadrato','\u25A1','hard',8,6],[60,'Sestile','\u26B9','soft',6,4],
    [150,'Quinconce','\u26BB','minor',3,2],[30,'Semisestile','\u26BA','minor',2,1.5],[45,'Semiquadrato','\u2220','minor',2,1.5],[135,'Sesquiquadrato','\u26BC','minor',2,1.5],[72,'Quintile','Q','minor',1.5,1],[144,'Biquintile','bQ','minor',1.5,1]];
  function orbFor(a,b,asp){const lum=a.cat==='L'||b.cat==='L',small=(a.cat==='M'||a.cat==='A'||a.cat==='X')||(b.cat==='M'||b.cat==='A'||b.cat==='X');let o=lum?asp[4]:asp[5];if(small)o=asp[5]/2;return o;}
  function aspects(list,o={}){const out=[];
    for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=list[i],b=list[j];
      if((a.id==='node'&&b.id==='snode')||(a.id==='snode'&&b.id==='node'))continue;
      if(a.cat==='X'&&b.cat==='X')continue;
      let d=Math.abs(a.lon-b.lon);if(d>180)d=360-d;
      for(const asp of ASPECTS){if(asp[3]==='minor'&&!o.minor)continue;const orb=Math.abs(d-asp[0]);
        if(orb<=orbFor(a,b,asp)){
          // applicativo se la distanza dall'esatto diminuisce
          const dt=0.01,la=a.lon+(a.speed||0)*dt,lb=b.lon+(b.speed||0)*dt;let d2=Math.abs(la-lb);d2=d2%360;if(d2>180)d2=360-d2;
          out.push({a,b,angle:asp[0],name:asp[1],glyph:asp[2],type:asp[3],orb,applying:Math.abs(d2-asp[0])<orb});break;}}}
    return out;}
  function moonInfo(date){const jd=jdUT(date),s=calc(jd,0).lon,m=calc(jd,1).lon;
    return{angle:norm(m-s),ill:(1-Math.cos(norm(m-s)*R))/2,moonLon:m};}
  function nextLunations(from,n=4){const out=[];let jd=jdUT(from);const el=j=>norm(calc(j,1).lon-calc(j,0).lon);
    let prev=el(jd);for(let k=0;k<200&&out.length<n;k++){const j2=jd+0.25,e2=el(j2);
      for(const tgt of [0,180]){const a=norm(prev-tgt+180)-180,b=norm(e2-tgt+180)-180;
        if(a<0&&b>=0){let lo=jd,hi=j2;for(let t=0;t<40;t++){const mid=(lo+hi)/2,v=norm(el(mid)-tgt+180)-180;if(v<0)lo=mid;else hi=mid;}
          const jt=(lo+hi)/2;out.push({full:tgt===180,date:new Date((jt-2440587.5)*864e5),lon:calc(jt,1).lon});}}
      jd=j2;prev=e2;}
    return out;}
  // eventi di un intervallo (ingressi, stazioni, lunazioni) per l'editor del blog
  function eventsBetween(d1,d2){const ev=[],ids=[[0,'Sole'],[2,'Mercurio'],[3,'Venere'],[4,'Marte'],[5,'Giove'],[6,'Saturno'],[7,'Urano'],[8,'Nettuno'],[9,'Plutone']];
    const j1=jdUT(d1),j2=jdUT(d2),step=0.25;
    for(const [code,name] of ids){let pj=j1,pp=calc(pj,code);
      for(let j=j1+step;j<=j2+1e-9;j+=step){const p=calc(j,code);
        if(Math.floor(p.lon/30)!==Math.floor(pp.lon/30)&&Math.abs(p.lon-pp.lon)<20){ev.push({date:new Date((j-2440587.5)*864e5),text:`${name} entra in ${SIGNS[Math.floor(p.lon/30)][0]}${p.speed<0?' (retrogrado)':''}`});}
        if(Math.sign(p.speed)!==Math.sign(pp.speed)&&code>1){ev.push({date:new Date((j-2440587.5)*864e5),text:`${name} ${p.speed<0?'diventa retrogrado':'torna diretto'} a ${fmt(p.lon).text} ${fmt(p.lon).sign[0]}`});}
        pj=j;pp=p;}}
    for(const l of nextLunations(d1,3))if(l.date<=d2)ev.push({date:l.date,text:`${l.full?'Luna piena':'Luna nuova'} a ${fmt(l.lon).text} ${fmt(l.lon).sign[0]}`});
    let mj=j1,mp=calc(mj,1);for(let j=j1+0.125;j<=j2;j+=0.125){const p=calc(j,1);if(Math.floor(p.lon/30)!==Math.floor(mp.lon/30))ev.push({date:new Date((j-2440587.5)*864e5),text:`Luna in ${SIGNS[Math.floor(p.lon/30)][0]}`,moon:true});mp=p;}
    return ev.sort((a,b)=>a.date-b.date);}

  // ===== eventi astronomici di un intervallo, al minuto (per il calendario) =====
  const PL=[[0,'sun','Sole','\u2609'],[2,'mercury','Mercurio','\u263F'],[3,'venus','Venere','\u2640'],[4,'mars','Marte','\u2642'],[5,'jupiter','Giove','\u2643'],[6,'saturn','Saturno','\u2644'],[7,'uranus','Urano','\u2645'],[8,'neptune','Nettuno','\u2646'],[9,'pluto','Plutone','\u2647']];
  const MAJ=[[0,'congiunzione','\u260C'],[60,'sestile','\u26B9'],[90,'quadrato','\u25A1'],[120,'trigono','\u25B3'],[180,'opposizione','\u260D']];
  const jd2date=j=>new Date((j-2440587.5)*864e5);
  const sgn=x=>((x%360)+540)%360-180; // differenza con segno in (-180,180]
  function bisect(f,a,b,n=34){let fa=f(a);for(let i=0;i<n;i++){const m=(a+b)/2,fm=f(m);if((fa<0)===(fm<0)){a=m;fa=fm;}else b=m;}return (a+b)/2;}
  function events(d1,d2,o={}){
    const j1=jdUT(d1),j2=jdUT(d2),out=[],lon=(j,c)=>calc(j,c).lon,spd=(j,c)=>calc(j,c).speed;
    // Luna: ingressi nei segni
    if(o.moon!==false){const st=1/12;let pj=j1,pl=lon(pj,1);
      for(let j=j1+st;j<=j2+1e-9;j+=st){const l=lon(j,1);if(Math.floor(l/30)!==Math.floor(pl/30)){const s=Math.floor(l/30),edge=s*30;
        const jt=bisect(x=>sgn(lon(x,1)-edge),pj,j);out.push({type:'moon',date:jd2date(jt),sign:s});}pj=j;pl=l;}}
    // fasi lunari (quarti)
    {const st=0.25,el=j=>norm(lon(j,1)-lon(j,0));let pj=j1,pe=el(pj);
      for(let j=j1+st;j<=j2+1e-9;j+=st){const e2=el(j);
        for(const [tg,nm] of [[0,'Luna nuova'],[90,'Primo quarto'],[180,'Luna piena'],[270,'Ultimo quarto']]){const a=sgn(pe-tg),b=sgn(e2-tg);
          if(a<0&&b>=0&&Math.abs(a)<30){const jt=bisect(x=>sgn(el(x)-tg),pj,j);out.push({type:'phase',date:jd2date(jt),phase:tg,name:nm,lon:lon(jt,1)});}}
        pj=j;pe=e2;}}
    // pianeti: ingressi, stazioni, aspetti esatti
    if(o.planets!==false){
    const st=0.25,steps=[];for(let j=j1;j<=j2+1e-9;j+=st)steps.push(j);
    const tab=steps.map(j=>PL.map(([c])=>calc(j,c)));
    for(let k=1;k<steps.length;k++){const a=steps[k-1],b=steps[k];
      PL.forEach(([c,id,name,g],i)=>{const p0=tab[k-1][i],p1=tab[k][i];
        if(Math.floor(p0.lon/30)!==Math.floor(p1.lon/30)){const s=Math.floor(p1.lon/30),edge=(p1.speed>=0?s:s+1)*30;
          const jt=bisect(x=>sgn(lon(x,c)-edge),a,b);out.push({type:'ingress',date:jd2date(jt),id,name,glyph:g,sign:s,retro:p1.speed<0});}
        if(i>0&&(p0.speed<0)!==(p1.speed<0)){const jt=bisect(x=>spd(x,c),a,b);out.push({type:'station',date:jd2date(jt),id,name,glyph:g,retro:p1.speed<0,lon:lon(jt,c)});}});
      if(o.aspects!==false)for(let i=0;i<PL.length;i++)for(let m=i+1;m<PL.length;m++){
        const d0=norm(tab[k-1][i].lon-tab[k-1][m].lon),d1=norm(tab[k][i].lon-tab[k][m].lon);
        for(const [ang,nm,g] of MAJ)for(const tg of (ang===0||ang===180)?[ang]:[ang,360-ang]){const x0=sgn(d0-tg),x1=sgn(d1-tg);
          if((x0<0)!==(x1<0)&&Math.abs(x0)<20&&Math.abs(x1)<20){const ci=PL[i][0],cm=PL[m][0];
            const jt=bisect(x=>sgn(norm(lon(x,ci)-lon(x,cm))-tg),a,b);
            out.push({type:'aspect',date:jd2date(jt),a:{id:PL[i][1],name:PL[i][2],glyph:PL[i][3]},b:{id:PL[m][1],name:PL[m][2],glyph:PL[m][3]},angle:ang,name:nm,glyph:g});}}}}
    }
    return out.filter(x=>x.date>=d1&&x.date<d2).sort((x,y)=>x.date-y.date);
  }
  function retroState(date){const j=jdUT(date);return PL.slice(1).map(([c,id,name,g])=>({id,name,glyph:g,retro:calc(j,c).speed<0}));}
  function tzOffsetMin(date,tz){const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(date);const g=k=>+p.find(x=>x.type===k).value;return Math.round((Date.UTC(g('year'),g('month')-1,g('day'),g('hour')%24,g('minute'),g('second'))-date.getTime())/60000);}
  function localToUTC(y,mo,d,h,mi,tz){const guess=Date.UTC(y,mo-1,d,h,mi);const off=tzOffsetMin(new Date(guess),tz);let utc=guess-off*60000;const off2=tzOffsetMin(new Date(utc),tz);if(off2!==off)utc=guess-off2*60000;
    // ora ambigua o inesistente
    const back=tzOffsetMin(new Date(utc),tz),check=new Date(utc+back*60000);const exists=check.getUTCHours()===h&&check.getUTCMinutes()===mi;
    const alt=[off,off2,tzOffsetMin(new Date(guess-off*60000-3600e3),tz),tzOffsetMin(new Date(guess-off*60000+3600e3),tz)];
    const cands=[...new Set(alt)].filter(o=>{const u=guess-o*60000;return tzOffsetMin(new Date(u),tz)===o;});
    return{date:new Date(utc),offset:back,exists,ambiguous:cands.length>1,cands};}
  return{init,events,retroState,SIGNS,BODIES,ASPECTS,points,houses,houseOf,fortune,fmt,aspects,moonInfo,nextLunations,eventsBetween,localToUTC,norm,get swe(){return swe;}};
})();
