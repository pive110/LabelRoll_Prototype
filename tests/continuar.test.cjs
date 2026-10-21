const test=require('node:test'),assert=require('node:assert/strict');
const {calcularRestante}=require('../continuar.js');
const base={total:'300000',cajas:'8',porCaja:'24',sueltos:'2',etiquetas:'1000',parcial:'500',diametro:'500',preparacion:'190',espesor:'0.15',figuras:'3',avance:'38.1',separacion:'0'};
test('descuenta solo producción válida y excluye preparación',()=>{
 const r=calcularRestante(base);assert.equal(r.fabricadas,194500);assert.equal(r.pendientes,105500);
 assert.ok(Math.abs(r.disponibles-Math.PI*(500**2-190**2)/600)<1e-8);
 assert.ok(Math.abs(r.necesarios-Math.ceil(105500/3)*.0381)<1e-8);assert.ok(r.margen<0);
});
test('bobina suficiente y preparación agotada',()=>{
 assert.ok(calcularRestante({...base,diametro:'900'}).margen>0);
 assert.equal(calcularRestante({...base,diametro:'190'}).disponibles,0);
});
test('pedido completado y conteos imposibles',()=>{
 assert.equal(calcularRestante({...base,total:'194500'}).necesarios,0);
 for(const cambio of [{total:'100'},{diametro:'180'},{espesor:'0'},{cajas:'1.5'},{figuras:'0'}])assert.throws(()=>calcularRestante({...base,...cambio}));
});
