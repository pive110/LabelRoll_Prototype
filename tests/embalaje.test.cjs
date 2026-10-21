const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../calculos.js'),{parseHTML}=require('linkedom');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('recomendación: menos cajas antes que volumen; empate por volumen',()=>{
 const opciones=[{id:'pequena',capacidad:8,cajas:11,volumenTotal:200,cortes:0},{id:'grande',capacidad:10,cajas:9,volumenTotal:300,cortes:0},{id:'ajustada',capacidad:10,cajas:9,volumenTotal:270,cortes:1}];
 assert.equal(C.recomendar(opciones).id,'ajustada');
 assert.equal(C.recomendar(opciones,'volumen').id,'pequena');
 assert.equal(C.recomendar([{capacidad:0,cajas:0,volumenTotal:0},...opciones]).id,'ajustada');
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
test('interfaz y mensaje al visor usan las mismas posiciones que el cálculo',()=>{
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
 assert.equal($('resumenCajas').parentElement,$('rCajas').parentElement);assert.match($('comparacion').textContent,/Alternado/);
 let mensaje;Object.defineProperty($('visorOriginal'),'contentWindow',{value:{postMessage:m=>mensaje=m}});
 sandbox.LabelRollApp.abrirVista();$('tipoVista').value='capacidad';sandbox.LabelRollApp.enviarVista();
 assert.equal(mensaje.datos.centros.length,5);assert.equal(mensaje.datos.nz,2);assert.equal(mensaje.datos.total,10);
 $('tipoVista').value='ultima';sandbox.LabelRollApp.enviarVista();assert.equal(mensaje.datos.total,1);
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
