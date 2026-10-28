(() => {
 'use strict';
 const destino=new URL('https://label-roll-operarios-110.pivedelta.chatgpt.site/');
 // Solo conserva la intención de abrir administración, nunca datos del pedido.
 if(new URLSearchParams(location.search).get('administrar')==='1')destino.searchParams.set('administrar','1');
 document.getElementById('abrirAplicacion').href=destino.href;
 // Actualiza únicamente el worker de esta aplicación para las instalaciones antiguas.
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).catch(()=>{});
 location.replace(destino.href);
})();
