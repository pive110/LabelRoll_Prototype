/* Prototipo local: cálculo independiente del diámetro de parada. */
(function(root){
 'use strict';
 const C=typeof module==='object'&&module.exports?require('./calculos.js'):root.LabelRollCalculos;
 function calcularParada(raw){
  const mandril=C.numero(raw.mandrilBruto,'mandrilBruto'),distancia=C.numero(raw.distanciaMarca,'distanciaMarca',{cero:true}),margen=C.numero(raw.margenParada,'margenParada',{cero:true,vacio:true});
  const marca=mandril+2*distancia,parada=marca+margen;
  if(!Number.isFinite(parada))throw new C.ErrorDato('distanciaMarca','Las medidas están fuera de rango.');
  return {mandril,distancia,margen,marca,parada};
 }
 if(typeof module==='object'&&module.exports){module.exports={calcularParada};return;}
 const $=id=>document.getElementById(id),ids=['mandrilBruto','distanciaMarca','margenParada'];
 const fmt=n=>n.toLocaleString('es-ES',{maximumFractionDigits:2});
 function navegar(vista){
  root.LabelRollApp.cerrarVista();
  for(const id of ['inicio','pantallaBobina','pantallaRollos','pantallaDesperdicio','pantallaContinuar'])$(id).hidden=id!==vista;
  window.scrollTo?.({top:0,behavior:'instant'});if(vista!=='inicio')$(vista).focus();
 }
 $('irBobina').addEventListener('click',()=>navegar('pantallaBobina'));
 $('irRollos').addEventListener('click',()=>navegar('pantallaRollos'));
 document.querySelectorAll('[data-inicio]').forEach(el=>el.addEventListener('click',()=>{navegar('inicio');$('irBobina').focus();}));
 function limpiar(){
  $('resultadoBobina').hidden=true;$('errorBobina').hidden=true;
  ids.forEach(id=>$(id).removeAttribute('aria-invalid'));
 }
 const esquema=$('esquemaParada');
 function destacarMedida(id){
  esquema.querySelectorAll('[data-medida]').forEach(g=>g.classList.toggle('activa',g.dataset.medida===id));
 }
 function actualizarEsquema(){
  const datos=[['mandrilBruto','esquemaMandril','Ø ','Selecciona el campo del mandril'],['distanciaMarca','esquemaDistancia','','Distancia radial hasta la marca'],['margenParada','esquemaMargen','+','Se añade al diámetro de la marca']];
  for(const [id,salida,prefijo,ayuda]of datos){
   try{const n=C.numero($(id).value,id,{cero:id!=='mandrilBruto'});$(salida).textContent=prefijo+fmt(n)+' mm'+(id==='margenParada'?' de diámetro':'');}
   catch(_){$(salida).textContent=ayuda;}
  }
 }
 ids.forEach(id=>{
  $(id).addEventListener('focus',()=>destacarMedida(id));
  $(id).addEventListener('blur',()=>destacarMedida(null));
  $(id).addEventListener('input',()=>{limpiar();actualizarEsquema();});
 });
 actualizarEsquema();
 $('cargarEjemplo').addEventListener('click',()=>{
  limpiar();for(const [id,value]of Object.entries({mandrilBruto:'90',distanciaMarca:'50',margenParada:'0'}))$(id).value=value;
  actualizarEsquema();$('mandrilBruto').focus();
 });
 $('calcularBobina').addEventListener('click',()=>{
  limpiar();
  try{
   const r=calcularParada(Object.fromEntries(ids.map(id=>[id,$(id).value])));
   $('valorParada').textContent=fmt(r.parada)+' mm';
   $('detalleParada').textContent='Marca: Ø '+fmt(r.marca)+' mm · margen: +'+fmt(r.margen)+' mm de diámetro';
   $('notaParada').textContent=r.margen===0?'Sin margen: el objetivo coincide con la marca roja. Añade margen si necesitas detenerte antes.':'La máquina se detendrá antes de la marca. Ajusta el margen con una prueba de parada real.';
   $('resultadoBobina').hidden=false;
  }catch(e){$('errorBobina').textContent=e.message;$('errorBobina').hidden=false;$(e.campo)?.setAttribute('aria-invalid','true');$(e.campo)?.focus();}
 });
 $('datosPedido').addEventListener('input',e=>{if(e.target.id==='figuras'){root.LabelRollApp.invalidarPedido();$('planBobina').hidden=true;}});
 $('calcularEmbalaje').addEventListener('click',()=>{
  $('planBobina').hidden=true;const p=root.LabelRollApp.getEstado().pedido;if(!p||!$('figuras').value.trim())return;
  try{
   const figuras=C.numero($('figuras').value,'figuras',{entero:true});
   const consumo=Math.ceil(p.total/figuras)*(p.Av+p.S)/1000;
   $('rBobinaEstimada').textContent=fmt(consumo)+' m';
   $('detalleBobinaEstimada').textContent=fmt(figuras)+(figuras===1?' etiqueta':' etiquetas')+' en paralelo · No incluye merma de producción.';
  }catch(e){$('rBobinaEstimada').textContent='—';$('detalleBobinaEstimada').textContent='Revisa las figuras: introduce un número entero mayor que cero.';}
  $('planBobina').hidden=false;
 });
 root.LabelRollBobina=Object.freeze({calcularParada,navegar});
})(globalThis);
