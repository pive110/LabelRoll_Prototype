const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../calculos.js'),{parseHTML}=require('linkedom');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('recomendación: menos cajas antes que volumen; empate por volumen',()=>{
 const opciones=[{id:'pequena',capacidad:8,cajas:11,volumenTotal:200,cortes:0},{id:'grande',capacidad:10,cajas:9,volumenTotal:300,cortes:0},{id:'ajustada',capacidad:10,cajas:9,volumenTotal:270,cortes:1}];
 assert.equal(C.recomendar(opciones,'cajas').id,'ajustada');
 assert.equal(C.recomendar(opciones,'volumen').id,'pequena');
 assert.equal(C.recomendar([{capacidad:0,cajas:0,volumenTotal:0},...opciones],'cajas').id,'ajustada');
});
function comprobar(p,L,A,D){
 assert.equal(p.centros.length,p.capa);
 for(let i=0;i<p.centros.length;i++){
  const a=p.centros[i];
  assert.ok(a.x>=D/2-1e-7&&a.x<=L-D/2+1e-7);
  assert.ok(a.y>=D/2-1e-7&&a.y<=A-D/2+1e-7);
  for(let j=0;j<i;j++)assert.ok(Math.hypot(a.x-p.centros[j].x,a.y-p.centros[j].y)>=D-1e-7);
 }
}
test('prueba real: caja interior 390×290×250, Ø135 y ancho 100: 5×2=10',()=>{
 const p=C.patronBase(390,290,135);
 assert.equal(p.nombre,'Alternado');assert.equal(p.capa,5);
 assert.equal(p.capa*Math.floor(250/100),10);comprobar(p,390,290,135);
 const girado=C.patronBase(290,390,135);assert.equal(girado.capa,5);comprobar(girado,290,390,135);
});
test('catálogo: aumenta N1 de 8 a 10 y conserva el pedido y última caja',()=>{
 for(const rollos of [1,9,10,11,21,100]){
  const o=C.optimizarCajas(135,100,rollos).find(o=>o.id==='n1-250');
  assert.equal(o.capacidad,10);assert.equal(o.patron.capa,5);assert.equal(o.capas,2);
  assert.equal((o.cajas-1)*o.capacidad+o.ultimos,rollos);
  assert.equal(o.huecos,o.cajas*o.capacidad-rollos);
 }
});
test('cuadrícula gana en empate; dimensiones límite y cajas sin altura útil',()=>{
 const p=C.patronBase(270,270,135);assert.equal(p.nombre,'Cuadrícula');assert.equal(p.capa,4);comprobar(p,270,270,135);
 assert.equal(C.patronBase(134.99,290,135).capa,0);
 assert.equal(C.patronBase(135,135,135).capa,1);
 assert.ok(C.optimizarCajas(135,301,10).every(o=>o.capacidad===0));
 assert.throws(()=>C.optimizarCajas(0,100,10));
 assert.throws(()=>C.optimizarCajas(1e-20,1e-20,10));
});
test('450 geometrías: sin solapes, dentro de caja y nunca peor que cuadrícula',()=>{
 for(let i=1;i<=450;i++){
  const D=40+i%110,L=100+(i*37)%500,A=100+(i*61)%400,p=C.patronBase(L,A,D);
  assert.ok(p.capa>=Math.floor(L/D)*Math.floor(A/D));comprobar(p,L,A,D);
 }
 const p=C.patronBase(10000,10000,1);assert.ok(p.capa>300);assert.deepEqual(p.centros,[]);
});
test('visor: recibe patrón real, muestra 10 y última caja de 1; rechaza solapes',()=>{
 const {window,document}=parseHTML(read('visor-3d.html'));
 window.matchMedia=()=>({matches:true,addEventListener:()=>{}});
 const sandbox={window,document,location:{protocol:'file:',origin:'null'},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},console};
 vm.createContext(sandbox);vm.runInContext(read('visor.js'),sandbox);
 const p=C.patronBase(390,290,135),d={L:390,A:290,H:250,D:135,Ar:100,Di:84,nz:2,total:10,centros:p.centros,patron:p.nombre,tipo:'capacidad'};
 sandbox.cargarResultado(d);assert.equal(document.getElementById('count').textContent,'10 / 10');
 assert.match(document.getElementById('distribution').textContent,/Alternado · 5 rollos\/capa · 2 capas/);
 sandbox.cargarResultado({...d,total:1,tipo:'ultima'});assert.equal(document.getElementById('count').textContent,'1 / 1');
 assert.equal(document.getElementById('viewKind').textContent,'ÚLTIMA CAJA');
 sandbox.cargarResultado({...d,centros:d.centros.map(()=>d.centros[0])});assert.equal(document.getElementById('count').textContent,'1 / 1');
 sandbox.cargarResultado({...d,centros:[{x:0,y:0}]});assert.equal(document.getElementById('count').textContent,'1 / 1');
});
test('interfaz, visor y guardado conservan los datos de la caja elegida',async()=>{
 const {window,document}=parseHTML(read('index.html'));
 for(const el of document.querySelectorAll('select')){let val=el.querySelector('option').getAttribute('value');Object.defineProperty(el,'value',{get:()=>val,set:v=>val=v});}
 for(const el of document.querySelectorAll('input,button,select')){el.focus=()=>{};el.getClientRects=()=>[{}];}
 const sandbox={window,document,navigator:{onLine:true},location:{protocol:'file:',origin:'null'},localStorage:{getItem:()=>null,setItem:()=>{}},console};
 vm.createContext(sandbox);for(const f of ['cajas.js','calculos.js','cajas-selector.js','interfaz.js'])vm.runInContext(read(f),sandbox,{filename:f});
 const $=id=>document.getElementById(id),raw={total:'21000',mandril:'84',etiquetasManual:'1000',anchoRollo:'100',avance:'100',separacion:'0',diamMax:'',espesor:String(Math.PI*(135**2-84**2)/(4*1000*100))};
 for(const [id,v] of Object.entries(raw))$(id).value=v;
 sandbox.LabelRollApp.calcular();assert.equal(sandbox.LabelRollApp.getEstado().estado,'valido');
 const n1=[...document.querySelectorAll('.caja-opcion')].find(b=>b.getAttribute('aria-label').startsWith('N1 · 1 corte,'));
 n1.click();assert.equal($('rCaja').textContent,'10');
 assert.equal($('rCajas').textContent,'3');
 assert.equal($('resumenCajas').textContent,'2 completas + 1 caja con 1 rollo');
 assert.equal($('resumenCajas').parentElement,$('rCajas').parentElement);assert.equal(document.querySelector('.caja-detalle'),null);
 let mensaje;Object.defineProperty($('visorOriginal'),'contentWindow',{value:{postMessage:m=>mensaje=m}});
 document.querySelectorAll('.caja-vista')[2].click();assert.equal($('overlayVista').hidden,false);assert.equal(sandbox.LabelRollApp.getEstado().seleccionada.id,'n1-250');assert.equal($('abrirVista').hidden,true);$('tipoVista').value='capacidad';sandbox.LabelRollApp.enviarVista();
 assert.equal(mensaje.datos.centros.length,5);assert.equal(mensaje.datos.nz,2);assert.equal(mensaje.datos.total,10);
 $('tipoVista').value='ultima';sandbox.LabelRollApp.enviarVista();assert.equal(mensaje.datos.total,1);
 const spb=[...document.querySelectorAll('.caja-opcion')].find(b=>b.getAttribute('aria-label').startsWith('SPB,'));
 assert.ok(spb);assert.ok(!/NaN|undefined/.test(spb.innerHTML));assert.match(spb.textContent,/rollos\/palet/);spb.click();
 assert.equal($('comparacion').hidden,true);assert.equal($('comparacion').textContent,'');assert.equal(document.querySelectorAll('.caja-opcion .caja-icono svg').length,5);assert.match(spb.querySelector('.caja-capacidad').textContent,/rollos\/caja/);assert.match(spb.querySelector('.caja-palet').textContent,/rollos\/palet/);assert.ok(!/NaN|undefined/.test($('comparacion').textContent));
 $('tipoVista').value='capacidad';sandbox.LabelRollApp.enviarVista();
 assert.deepEqual([mensaje.datos.L,mensaje.datos.A,mensaje.datos.H],[380,380,300]);
 assert.equal(mensaje.datos.total,Number($('rCaja').textContent));
 let archivo,revocado=false;sandbox.Blob=Blob;sandbox.URL={createObjectURL:b=>{archivo=b;return 'blob:pedido';},revokeObjectURL:()=>{revocado=true;}};
 sandbox.LabelRollApp.cerrarVista();$('imprimirFicha').click();
 assert.ok(archivo);assert.equal(revocado,true);const html=await archivo.text();
 assert.match(html,/SPB/);assert.match(html,/rollos\/palet/);assert.match(html,/21.000/);assert.match(html,/charset="utf-8"/);
 assert.match($('estadoResultados').textContent,/descargar/);


});

test('prueba real N1 de un corte: Ø111 permite 8 rollos por capa sin solapes',()=>{
 for(const [L,A]of [[390,290],[290,390]]){
  const p=C.patronBase(L,A,111);assert.equal(p.capa,8);comprobar(p,L,A,111);
 }
 const caja=C.optimizarCajas(111,100,17).find(c=>c.id==='n1-250');
 assert.equal(caja.patron.capa,8);assert.equal(caja.capas,2);assert.equal(caja.capacidad,16);assert.equal(caja.cajas,2);assert.equal(caja.ultimos,1);
});

test('compara los patrones en pedidos futuros y conserva cuadrícula en empate',()=>{
 const ocho=C.patronBase(390,290,111);assert.deepEqual(ocho.comparacion,{cuadricula:6,alternado:8});assert.equal(ocho.nombre,'Alternado');
 const cinco=C.patronBase(390,290,135);assert.deepEqual(cinco.comparacion,{cuadricula:4,alternado:5});
 const empate=C.patronBase(270,270,135);assert.equal(empate.capa,4);assert.equal(empate.nombre,'Cuadrícula');
});

test('SPB: capacidad, recomendación, última caja y geometría 3D de 380×380×300',()=>{
 const opciones=C.optimizarCajas(190,100,25),spb=opciones.find(o=>o.id==='spb');
 assert.deepEqual([spb.L,spb.A,spb.H],[380,380,300]);
 assert.equal(spb.capacidad,12);assert.equal(spb.capas,3);assert.equal(spb.cajas,3);assert.equal(spb.ultimos,1);
 assert.equal(C.recomendar(opciones).id,'spb');comprobar(spb.patron,380,380,190);
 assert.equal(C.optimizarCajas(380,300,1).find(o=>o.id==='spb').capacidad,1);
 assert.equal(C.optimizarCajas(381,100,1).find(o=>o.id==='spb').capacidad,0);
 assert.equal(C.optimizarCajas(190,301,1).find(o=>o.id==='spb').capacidad,0);
 const {window,document}=parseHTML(read('visor-3d.html'));
 window.matchMedia=()=>({matches:true,addEventListener:()=>{}});
 const sandbox={window,document,location:{protocol:'file:',origin:'null'},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},console};
 vm.createContext(sandbox);vm.runInContext(read('visor.js'),sandbox);
 const datos={L:spb.L,A:spb.A,H:spb.H,D:190,Ar:100,Di:84,nz:spb.capas,total:spb.capacidad,centros:spb.patron.centros,patron:spb.patron.nombre,tipo:'capacidad'};
 sandbox.cargarResultado(datos);assert.equal(document.getElementById('count').textContent,'12 / 12');
 sandbox.cargarResultado({...datos,total:spb.ultimos,tipo:'ultima'});assert.equal(document.getElementById('count').textContent,'1 / 1');
});

test('palets: datos comprobados, prioridad por rollos y redondeo del pedido',()=>{
 const opciones=C.optimizarCajas(135,100,1000);
 for(const o of opciones){assert.equal(o.cajasPorPalet,o.id==='spb'?18:32);assert.equal(o.rollosPorPalet,o.capacidad*o.cajasPorPalet);assert.equal(o.palets,Math.ceil(o.cajas/o.cajasPorPalet));}
 assert.equal(C.recomendar(opciones).rollosPorPalet,Math.max(...opciones.map(o=>o.rollosPorPalet)));
 const datos=[{id:'n1',capacidad:10,rollosPorPalet:320,cajas:10,volumenTotal:100,cortes:0},{id:'spb',capacidad:16,rollosPorPalet:288,cajas:7,volumenTotal:90,cortes:0}];
 assert.equal(C.recomendar(datos).id,'n1');assert.equal(C.recomendar(datos,'cajas').id,'spb');
 for(const cantidad of [216,217]){const o=C.optimizarCajas(190,100,cantidad).find(o=>o.id==='spb');assert.equal(o.rollosPorPalet,216);assert.equal(o.palets,cantidad===216?1:2);}
 assert.equal(C.recomendar(C.optimizarCajas(500,100,1)),null);
});

test('visor automático: llena, cierra y reinicia el bucle sin controles visibles',()=>{
 const {window,document}=parseHTML(read('visor-3d.html'));
 window.matchMedia=()=>({matches:false,addEventListener:()=>{}});
 let siguiente;const sandbox={window,document,location:{protocol:'file:',origin:'null'},requestAnimationFrame:fn=>{siguiente=fn;return 1;},cancelAnimationFrame:()=>{},console};
 vm.createContext(sandbox);vm.runInContext(read('visor.js'),sandbox);
 sandbox.cargarResultado({L:200,A:200,H:100,D:190,Ar:100,Di:84,nz:1,total:1,centros:[{x:100,y:100}],patron:'Cuadrícula',tipo:'capacidad'});
 assert.equal(typeof siguiente,'function');
 for(let t=0;t<=1000;t+=100)siguiente(t);
 assert.equal(document.getElementById('count').textContent,'1 / 1');
 for(let t=1100;t<=5500;t+=100)siguiente(t);
 assert.equal(document.getElementById('count').textContent,'0 / 1');
 for(let t=5600;t<=6500;t+=100)siguiente(t);
 assert.equal(document.getElementById('count').textContent,'1 / 1');
 assert.equal(document.querySelector('.controls').hidden,true);assert.equal(document.querySelector('.controls-extra').hidden,true);
});
