const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,'acceso',name),'utf8');
test('el acceso fija el destino y no propaga datos ni redirecciones del visitante',()=>{
 let destino,registro;const enlace={};const context={URL,URLSearchParams,document:{getElementById:()=>enlace},navigator:{serviceWorker:{register:(...args)=>{registro=args;return Promise.resolve();}}},location:{protocol:'https:',search:'?administrar=1&pedido=privado&redirect=https://evil.example',replace:url=>destino=url}};
 vm.runInNewContext(read('acceso.js'),context);
 assert.equal(destino,'https://label-roll-operarios-110.pivedelta.chatgpt.site/?administrar=1');assert.equal(enlace.href,destino);assert.equal(registro[0],'./service-worker.js');assert.equal(registro[1].updateViaCache,'none');
 context.location.search='?pedido=privado';vm.runInNewContext(read('acceso.js'),context);assert.equal(destino,'https://label-roll-operarios-110.pivedelta.chatgpt.site/');
});
test('la migración solo elimina cachés de Label Roll y redirige sus navegaciones',async()=>{
 const handlers={},deleted=[];let skipped=false,claimed=false,promise;
 const sandbox={URL,Response,self:{location:{href:'https://pive110.github.io/calculadora-rollos/service-worker.js'},addEventListener:(name,f)=>handlers[name]=f,skipWaiting:async()=>{skipped=true;},clients:{claim:async()=>{claimed=true;}}},caches:{keys:async()=>['otro-proyecto','label-roll-calculator-2.2.0'],delete:async name=>deleted.push(name)}};
 vm.runInNewContext(read('service-worker.js'),sandbox);handlers.install({waitUntil:p=>promise=p});await promise;assert.ok(skipped);handlers.activate({waitUntil:p=>promise=p});await promise;assert.ok(claimed);assert.deepEqual(deleted,['label-roll-calculator-2.2.0']);
 const navigate=url=>handlers.fetch({request:{method:'GET',mode:'navigate',url},respondWith:p=>promise=p});navigate('https://pive110.github.io/calculadora-rollos/?administrar=1&pedido=privado');const r=await promise;assert.equal(r.status,302);assert.equal(r.headers.get('location'),'https://label-roll-operarios-110.pivedelta.chatgpt.site/?administrar=1');
 for(const request of [{method:'POST',mode:'navigate',url:'https://pive110.github.io/calculadora-rollos/'},{method:'GET',mode:'navigate',url:'https://pive110.github.io/otra-app/'},{method:'GET',mode:'cors',url:'https://pive110.github.io/calculadora-rollos/acceso.js'},{method:'GET',mode:'navigate',url:'https://evil.example/calculadora-rollos/'}])handlers.fetch({request,respondWith:()=>assert.fail('Intercepción fuera de alcance')});
});
test('el acceso ofrece botón sin JavaScript y publica una lista cerrada sin claves',()=>{
 const {parseHTML}=require('linkedom'),{document}=parseHTML(read('index.html'));
 assert.equal(document.getElementById('abrirAplicacion').getAttribute('href'),'https://label-roll-operarios-110.pivedelta.chatgpt.site/');assert.ok(document.querySelector('noscript'));assert.equal(document.querySelector('meta[name="referrer"]').content,'no-referrer');
 require('../scripts/build.cjs');const files=fs.readdirSync(path.join(root,'_site'));assert.equal(files.length,12);for(const name of files)assert.ok(!/clave|\.env|usuarios|registro|\.git|\.txt/i.test(name),name);
 assert.ok(fs.readFileSync(path.join(root,'_site','index.html'),'utf8').includes('Tu producción, lista.'));
});
