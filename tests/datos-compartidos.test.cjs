const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseHTML}=require('linkedom');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function entorno(){
 const {document,window}=parseHTML(read('index.html'));
 const ctx={document,Event:window.Event,LabelRollCalculos:require('../calculos.js')};vm.createContext(ctx);vm.runInContext(read('datos-compartidos.js'),ctx);
 const editar=(id,v)=>{document.getElementById(id).value=v;document.getElementById(id).dispatchEvent(new window.Event('input',{bubbles:true}));};
 return {document,editar};
}
test('sincroniza datos en ambos sentidos, incluido borrar y coma decimal',()=>{
 const {document:d,editar}=entorno();
 editar('total','300000');assert.equal(d.getElementById('desp-total').value,'300000');assert.equal(d.getElementById('fin-total').value,'300000');
 editar('fin-avance','38,1');assert.equal(d.getElementById('avance').value,'38,1');assert.equal(d.getElementById('desp-avance').value,'38,1');
 editar('desp-figuras','');assert.equal(d.getElementById('figuras').value,'');assert.equal(d.getElementById('fin-figuras').value,'');
 editar('fin-espesor','0,15');assert.equal(d.getElementById('espesor').value,'0,15');
});
test('preparación usa mandril y distancia, no confunde diámetro de bobina',()=>{
 const {document:d,editar}=entorno();editar('mandrilBruto','90');editar('distanciaMarca','50');
 assert.equal(d.getElementById('fin-preparacion').value,'190');assert.equal(d.getElementById('mandril').value,'90');
 editar('fin-diametro','500');assert.equal(d.getElementById('mandrilBruto').value,'90');
});
