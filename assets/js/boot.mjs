// Avvio di Swiss Ephemeris (WebAssembly) e del sito
import './swisseph-bundle.mjs';
(async()=>{try{
  const [wasm,data]=await Promise.all([
    fetch('assets/swisseph/swisseph.wasm').then(r=>{if(!r.ok)throw new Error('wasm '+r.status);return r.arrayBuffer();}),
    fetch('assets/swisseph/swisseph.data').then(r=>{if(!r.ok)throw new Error('data '+r.status);return r.arrayBuffer();})]);
  await AQ.init({instantiateWasm:(info,cb)=>{WebAssembly.instantiate(wasm,info).then(r=>cb(r.instance));return {};},getPreloadedPackage:()=>data,locateFile:p=>p});
  window.__boot();
}catch(e){window.__bootFail&&window.__bootFail(e);}})();
