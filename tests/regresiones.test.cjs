const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../calculos.js'),{parseHTML}=require('linkedom');
const base={total:'102000',mandril:'84',etiquetasManual:'1500',anchoRollo:'90',avance:'200',separacion:'15,9',diamMax:'',espesor:'0,115'};
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('pedido real y embalaje conocido',()=>{const p=C.calcularPedido(base);assert.equal(p.rollos,68);assert.equal(p.ultimo,1500);assert.ok(Math.abs(p.D-233.397)<0.01);const o=C.recomendar(C.optimizarCajas(p.D,90,68));assert.equal(o.id,'n1');assert.equal(o.capacidad,3);assert.equal(o.cajas,23);assert.equal(o.ultimos,2);});
test('rechaza formatos ambiguos, negativos, infinitos y enteros inseguros',()=>{for(const s of ['1.000,5','1e3','0x10','Infinity','-1','NaN',''])assert.throws(()=>C.numero(s,'test'));assert.throws(()=>C.numero('9007199254740992','total',{entero:true}));assert.equal(C.numero('0,115','test'),0.115);});
test('pedido primo: modos iguales y parcial conservan el total',()=>{const raw={...base,total:'1009',diamMax:'150'};const a=C.calcularPedido(raw),b=C.calcularPedido({...raw,modo:'capacidad'});assert.equal(a.etiquetas,1);assert.ok(b.etiquetas>1);assert.ok(b.ultimo<b.etiquetas);assert.ok(b.D<=150);assert.ok(b.planCorrecto);});
test('1000 repartos conservan exactamente etiquetas y cajas',()=>{for(let i=1;i<=1000;i++){const p=C.calcularPedido({...base,total:String(i*137),diamMax:'235',modo:i%2?'capacidad':'iguales'});assert.ok(p.planCorrecto);assert.ok(p.D<=235+1e-9);for(const o of C.optimizarCajas(p.D,90,p.rollos)){if(o.capacidad){assert.equal((o.cajas-1)*o.capacidad+o.ultimos,p.rollos);assert.ok(o.ultimos>0&&o.ultimos<=o.capacidad);}}}});
test('espesor inverso y entradas imposibles',()=>{const p=C.calcularPedido(base);assert.ok(Math.abs(C.calcularEspesor({...base,muestraDiametro:String(p.D),muestraEtiquetas:'1500'})-0.115)<1e-12);assert.throws(()=>C.calcularEspesor({...base,muestraDiametro:'80',muestraEtiquetas:'1500'}));assert.equal(C.recomendar(C.optimizarCajas(500,90,5)),null);assert.throws(()=>C.mayorDivisor(8000000000000001,2000000));});
function ui(){
 const {window,document}=parseHTML(read('index.html'));
 for(const el of document.querySelectorAll('select')){let val=el.querySelector('option').getAttribute('value');Object.defineProperty(el,'value',{get:()=>val,set:v=>val=v});}
 for(const el of document.querySelectorAll('input,button,select')){el.focus=()=>{};el.getClientRects=()=>[{}];}
 for(const el of document.querySelectorAll('dialog')){el.close=()=>el.removeAttribute('open');el.showModal=()=>el.setAttribute('open','');}
 const sandbox={window,document,navigator:{onLine:true},location:{protocol:'file:',origin:'null'},localStorage:{getItem:()=>null,setItem:()=>{}},console};
 vm.createContext(sandbox);for(const f of ['cajas.js','calculos.js','cajas-selector.js','interfaz.js'])vm.runInContext(read(f),sandbox,{filename:f});
 const $=id=>document.getElementById(id);for(const [id,v]of Object.entries(base))$(id).value=v;
 return {$,app:sandbox.LabelRollApp,input:(id,v)=>{$(id).value=v;$(id).dispatchEvent(new window.Event('input',{bubbles:true}));}};
}
test('editar o recalcular con error retira resultados y check anteriores',()=>{const {$,app,input}=ui();app.calcular();assert.equal(app.getEstado().estado,'valido');assert.equal($('pedidoVerificado').hidden,false);input('total','');assert.equal(app.getEstado().pedido,null);assert.equal($('pedidoVerificado').hidden,true);assert.equal($('abrirVista').hidden,true);app.calcular();assert.equal(app.getEstado().estado,'error');assert.equal($('total').getAttribute('aria-invalid'),'true');});
test('la muestra cambia y no permite aplicar un espesor antiguo',()=>{const {$,app,input}=ui();$('muestraDiametro').value='230,7';$('muestraEtiquetas').value='1500';app.calcularMuestra();assert.equal($('usarMuestra').disabled,false);input('avance','210');assert.equal($('usarMuestra').disabled,true);app.usarMuestra();assert.equal($('espesor').value,'0,115');app.calcularMuestra();app.calcular();app.usarMuestra();assert.equal(app.getEstado().pedido,null);assert.equal($('pedidoVerificado').hidden,true);});
test('ancho incorrecto conserva producción pero muestra error de embalaje',()=>{const {$,app}=ui();$('anchoRollo').value='abc';app.calcular();assert.equal(app.getEstado().estado,'parcial');assert.equal($('anchoRollo').getAttribute('aria-invalid'),'true');assert.equal($('abrirVista').hidden,true);});
test('offline resuelve visor con query y conserva cachés ajenas',async()=>{const handlers={},deleted=[],hits=[];const sandbox={URL,Response,self:{location:{href:'https://example.test/app/service-worker.js'},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}}},caches:{keys:async()=>['otra-app','label-roll-calculator-old','label-roll-calculator-2.2.0'],delete:async n=>deleted.push(n),open:async()=>({match:async u=>{hits.push(u);return new Response('visor');}})},fetch:async()=>{throw Error('offline')}};vm.createContext(sandbox);vm.runInContext(read('service-worker.js'),sandbox);let p;handlers.activate({waitUntil:v=>p=v});await p;assert.deepEqual(deleted,['label-roll-calculator-old']);handlers.fetch({request:{url:'https://example.test/app/visor-3d.html?vista=1',method:'GET'},respondWith:v=>p=v});assert.equal(await(await p).text(),'visor');assert.deepEqual(hits,['https://example.test/app/visor-3d.html']);});
test('recursos locales e identificadores únicos',()=>{for(const file of ['index.html','visor-3d.html']){const {document}=parseHTML(read(file));const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(ids).size,ids.length);for(const el of document.querySelectorAll('[src],link[href]')){const ref=(el.getAttribute('src')||el.getAttribute('href')).split('?')[0];if(!ref.startsWith('about:'))assert.ok(fs.existsSync(path.join(__dirname,'..',ref)),ref);}}});
test('visor representa última caja parcial y permite finalizar sin animación',()=>{
 const {window,document}=parseHTML(read('visor-3d.html'));
 window.matchMedia=()=>({matches:true,addEventListener:()=>{}});
 const sandbox={window,document,location:{protocol:'file:',origin:'null'},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},console};
 vm.createContext(sandbox);vm.runInContext(read('visor.js'),sandbox);
 sandbox.cargarResultado({L:300,A:300,H:210,D:230,Ar:90,Di:84,centros:[{x:150,y:150}],patron:'Cuadrícula',nz:2,total:1,tipo:'ultima'});
 assert.equal(document.getElementById('count').textContent,'1 / 1');
 assert.equal(document.getElementById('viewKind').textContent,'ÚLTIMA CAJA');
 assert.ok(document.getElementById('scene').children.length>0);
 sandbox.cargarResultado({L:300,A:300,H:210,D:230,Ar:90,Di:84,centros:[{x:150,y:150}],patron:'Cuadrícula',nz:2,total:3,tipo:'ultima'});
 assert.equal(document.getElementById('count').textContent,'1 / 1');
});
