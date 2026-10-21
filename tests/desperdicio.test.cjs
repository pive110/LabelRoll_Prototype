const test=require('node:test'),assert=require('node:assert/strict');
const {calcularMargen}=require('../desperdicio.js');
const base={tirada:'4000',total:'300000',figuras:'3',avance:'38,1',separacion:'0',etiquetas:'1000'};
test('metros lineales con figuras: margen 190 m y equivalencia en rollos',()=>{
 const r=calcularMargen(base);
 assert.ok(Math.abs(r.necesarios-3810)<1e-8);assert.ok(Math.abs(r.diferencia-190)<1e-8);
 assert.equal(r.bandas,12000);assert.ok(Math.abs(r.rollosEquivalentes-570/38.1)<1e-8);
});
test('tirada insuficiente, cero y pedido exacto',()=>{
 assert.ok(calcularMargen({...base,tirada:'3700'}).diferencia<0);
 assert.equal(calcularMargen({...base,tirada:'0'}).bandas,0);
 assert.ok(Math.abs(calcularMargen({...base,tirada:'3810'}).diferencia)<1e-8);
});
test('avances completos y separación incluida',()=>{
 const r=calcularMargen({...base,total:'10',figuras:'3',avance:'100',separacion:'10'});
 assert.equal(r.necesarios,.44);
});
test('rechaza figuras fraccionarias, cero, datos negativos y cantidades inválidas',()=>{
 for(const cambio of [{figuras:'1.5'},{figuras:'0'},{tirada:'-1'},{etiquetas:'0'},{total:''}])assert.throws(()=>calcularMargen({...base,...cambio}));
});
