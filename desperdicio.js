(function(root){
 'use strict';
 const C=typeof module==='object'&&module.exports?require('./calculos.js'):root.LabelRollCalculos;
 function calcularMargen(raw){
  const leer=(id,opts={})=>C.numero(raw[id],'desp-'+id,opts);
  const tirada=leer('tirada',{cero:true}),total=leer('total',{entero:true}),figuras=leer('figuras',{entero:true}),avance=leer('avance'),separacion=leer('separacion',{cero:true,vacio:true}),etiquetas=leer('etiquetas',{entero:true});
  const paso=(avance+separacion)/1000,necesarios=Math.ceil(total/figuras)*paso;
  const diferencia=tirada-necesarios,bandas=tirada*figuras,metrosRollo=etiquetas*paso;
  const rollosEquivalentes=Math.abs(diferencia)*figuras/metrosRollo;
  if(![paso,necesarios,diferencia,bandas,metrosRollo,rollosEquivalentes].every(Number.isFinite)||paso<=0||metrosRollo<=0)throw new C.ErrorDato('desp-tirada','Revisa las cantidades: el resultado está fuera de rango.');
  return {tirada,total,figuras,paso,necesarios,diferencia,bandas,metrosRollo,rollosEquivalentes};
 }
 if(typeof module==='object'&&module.exports){module.exports={calcularMargen};return;}
 const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('es-ES',{maximumFractionDigits:2});
 $('irDesperdicio').addEventListener('click',()=>root.LabelRollBobina.navegar('pantallaDesperdicio'));
 const form=$('formDesperdicio'),salida=$('resultadoDesperdicio');
 form.addEventListener('input',()=>{salida.hidden=true;$('errorDesperdicio').hidden=true;form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));});
 form.addEventListener('submit',e=>{
  e.preventDefault();salida.hidden=true;$('errorDesperdicio').hidden=true;
  try{
   const r=calcularMargen(Object.fromEntries(new FormData(form))),falta=r.diferencia< -1e-8,exacto=Math.abs(r.diferencia)<=1e-8;
   const usados=r.tirada?Math.min(100,r.necesarios/r.tirada*100):100;
   salida.innerHTML='<h3>'+(falta?'La tirada no alcanza':exacto?'Tirada ajustada al pedido':'Margen disponible para desperdicio')+'</h3><div class="result-grid"><div class="card principal"><div class="titulo">'+(falta?'FALTAN':'MARGEN')+'</div><div class="numero">'+fmt(Math.abs(r.diferencia))+' m</div><div class="unidad">Metros lineales de bobina bruta</div></div><div class="card"><div class="titulo">EQUIVALENCIA EN ROLLOS TERMINADOS</div><div class="numero">'+fmt(r.rollosEquivalentes)+'</div><div class="unidad">Rollos equivalentes '+(falta?'que faltan':'de margen')+' · '+fmt(r.metrosRollo)+' m por rollo</div></div></div><div class="barra-tirada" aria-hidden="true"><span style="width:'+usados+'%"></span></div>';
   salida.hidden=false;
  }catch(err){$('errorDesperdicio').textContent=err.message;$('errorDesperdicio').hidden=false;$(err.campo)?.setAttribute('aria-invalid','true');$(err.campo)?.focus();}
 });
})(globalThis);
