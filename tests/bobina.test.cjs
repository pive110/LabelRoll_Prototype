const test=require('node:test'),assert=require('node:assert/strict');
const {calcularParada}=require('../bobina.js');
test('marca sin margen: mandril 90 y distancia 50 dan 190 mm',()=>{const r=calcularParada({mandrilBruto:'90',distanciaMarca:'50',margenParada:'0'});assert.equal(r.marca,190);assert.equal(r.parada,190);});
test('margen en diámetro se suma para detener antes',()=>assert.equal(calcularParada({mandrilBruto:'90',distanciaMarca:'50',margenParada:'5'}).parada,195));
test('rechaza medidas negativas o mandril cero',()=>{for(const raw of [{mandrilBruto:'0',distanciaMarca:'50'},{mandrilBruto:'90',distanciaMarca:'-1'},{mandrilBruto:'90',distanciaMarca:'50',margenParada:'-1'}])assert.throws(()=>calcularParada(raw));});
