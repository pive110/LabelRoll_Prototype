/* Una versión coherente de recursos y limpieza limitada a esta aplicación. */
const CACHE_PREFIX='label-roll-calculator-';
const CACHE_NAME=CACHE_PREFIX+'2.0.0';
const BASE=new URL('./',self.location.href);
const APP_SHELL=['./','./index.html','./visor-3d.html','./manifest.json','./favicon.ico?v=4','./icon-180.png?v=4','./icon-192.png?v=4','./icon-512.png?v=4','./cajas.js?v=2.0.0','./calculos.js?v=2.0.0','./cajas-selector.js?v=2.0.0','./interfaz.js?v=2.0.0','./styles.css?v=2.0.0','./visor.js?v=2.0.0','./visor.css?v=2.0.0'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});
self.addEventListener('message',event=>{if(event.data?.tipo==='ACTUALIZAR')self.skipWaiting();});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
function destinoDocumento(url){
 if(url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname)return new URL('index.html',BASE).href;
 if(url.pathname===new URL('visor-3d.html',BASE).pathname)return new URL('visor-3d.html',BASE).href;
 if(url.pathname===new URL('manifest.json',BASE).pathname)return new URL('manifest.json',BASE).href;
 return null;
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 const documento=destinoDocumento(url);
 if(documento){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   try{
    const response=await fetch(request,{cache:'no-store'});
    if(response.ok){await cache.put(documento,response.clone());return response;}
    return (await cache.match(documento))||response;
   }catch(_){return (await cache.match(documento))||Response.error();}
  })());
 }else{
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME),cached=await cache.match(request);
   if(cached)return cached;
   return fetch(request);
  })());
 }
});
