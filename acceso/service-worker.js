/* Migración de las instalaciones antiguas. No almacena pedidos ni credenciales. */
'use strict';
const BASE=new URL('./',self.location.href);
const DESTINO='https://label-roll-operarios-110.pivedelta.chatgpt.site/';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const nombres=await caches.keys();
 await Promise.all(nombres.filter(n=>n.startsWith('label-roll-calculator-')).map(n=>caches.delete(n)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 const destino=new URL(DESTINO);
 if(url.searchParams.get('administrar')==='1')destino.searchParams.set('administrar','1');
 event.respondWith(Promise.resolve(Response.redirect(destino.href,302)));
});
