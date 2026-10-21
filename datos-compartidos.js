/* Datos con el mismo significado y unidades; la última edición prevalece. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const grupos=[['total','desp-total','fin-total'],['figuras','desp-figuras','fin-figuras'],['avance','desp-avance','fin-avance'],['separacion','desp-separacion','fin-separacion'],['etiquetasManual','desp-etiquetas','fin-etiquetas'],['espesor','fin-espesor'],['mandril','mandrilBruto']];
 let sincronizando=false;
 function copiar(ids,valor,origen){
  for(const id of ids){const el=$(id);if(!el||id===origen||el.value===valor)continue;el.value=valor;el.dispatchEvent(new Event('input',{bubbles:true}));}
 }
 function preparacion(){
  try{
   const mandril=LabelRollCalculos.numero($('mandrilBruto').value,'mandrilBruto');
   const distancia=LabelRollCalculos.numero($('distanciaMarca').value,'distanciaMarca',{cero:true});
   copiar(['fin-preparacion'],String(mandril+2*distancia));
  }catch(_){/* No reemplazar una medición con un cálculo incompleto. */}
 }
 document.addEventListener('input',e=>{
  if(sincronizando)return;
  const grupo=grupos.find(ids=>ids.includes(e.target.id));
  sincronizando=true;
  try{
   if(grupo)copiar(grupo,e.target.value,e.target.id);
   if(['mandril','mandrilBruto','distanciaMarca'].includes(e.target.id))preparacion();
  }finally{sincronizando=false;}
 });
 // Los botones también generan valores: muestra de espesor, ejemplo y embalaje.
 document.addEventListener('click',e=>{
  if(sincronizando)return;
  sincronizando=true;
  try{
   if(e.target.closest('#usarMuestra'))copiar(['fin-espesor'],$ ('espesor').value);
   if(e.target.closest('#cargarEjemplo')){copiar(['mandril'],$ ('mandrilBruto').value);preparacion();}
   const estado=globalThis.LabelRollApp?.getEstado();
   if(e.target.closest('#calcularEmbalaje')&&estado?.pedido){
    copiar(['desp-etiquetas','fin-etiquetas'],String(estado.pedido.etiquetas));
   }
   if(e.target.closest('.caja-opcion, #calcularEmbalaje')&&estado?.seleccionada){
    copiar(['fin-porCaja'],String(estado.seleccionada.capacidad));
   }
  }finally{sincronizando=false;}
 });
})();
