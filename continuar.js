(function(root){
 'use strict';
 const C=typeof module==='object'&&module.exports?require('./calculos.js'):root.LabelRollCalculos;
 function calcularRestante(raw){
  const n=(id,opts={})=>C.numero(raw[id],'fin-'+id,opts),ent={entero:true},op={entero:true,cero:true,vacio:true};
  const total=n('total',ent),cajas=n('cajas',op),porCaja=n('porCaja',ent),sueltos=n('sueltos',op),etiquetas=n('etiquetas',ent),parcial=n('parcial',op);
  const diametro=n('diametro'),preparacion=n('preparacion'),espesor=n('espesor'),figuras=n('figuras',ent),avance=n('avance'),separacion=n('separacion',{cero:true,vacio:true});
  if(diametro<preparacion)throw new C.ErrorDato('fin-diametro','El diámetro actual no puede ser menor que el de la preparación.');
  const fabricadas=(cajas*porCaja+sueltos)*etiquetas+parcial;
  if(!Number.isSafeInteger(fabricadas))throw new C.ErrorDato('fin-cajas','La cantidad fabricada está fuera de rango.');
  if(fabricadas>total)throw new C.ErrorDato('fin-cajas','Lo fabricado supera el pedido. Revisa las cajas, rollos y etiquetas adicionales.');
  const pendientes=total-fabricadas,paso=(avance+separacion)/1000;
  const disponibles=Math.PI*(diametro*diametro-preparacion*preparacion)/(4*espesor*1000);
  const necesarios=Math.ceil(pendientes/figuras)*paso,margen=disponibles-necesarios;
  const rollosPendientes=pendientes/etiquetas,rollosMargen=Math.abs(margen)*figuras/(etiquetas*paso);
  if(![disponibles,necesarios,margen,rollosMargen].every(Number.isFinite))throw new C.ErrorDato('fin-diametro','Las medidas generan un resultado fuera de rango.');
  return {fabricadas,pendientes,disponibles,necesarios,margen,rollosPendientes,rollosMargen};
 }
 if(typeof module==='object'&&module.exports){module.exports={calcularRestante};return;}
 const $=id=>document.getElementById(id),form=$('formContinuar'),salida=$('resultadoContinuar');
 $('irContinuar').addEventListener('click',()=>root.LabelRollBobina.navegar('pantallaContinuar'));
 const fmt=n=>n.toLocaleString('es-ES',{maximumFractionDigits:2});
 form.addEventListener('input',()=>{salida.hidden=true;$('errorContinuar').hidden=true;form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));});
 form.addEventListener('submit',e=>{
  e.preventDefault();salida.hidden=true;$('errorContinuar').hidden=true;
  try{
   const r=calcularRestante(Object.fromEntries(new FormData(form))),falta=r.margen< -1e-8;
   const card=(titulo,valor,ayuda)=>'<div class="card"><div class="titulo">'+titulo+'</div><div class="numero">'+valor+'</div><div class="unidad">'+ayuda+'</div></div>';
   salida.innerHTML='<h3>'+(r.pendientes===0?'Pedido completado':falta?'No alcanza según la estimación':'Alcanza según la estimación')+'</h3><div class="result-grid">'+card('BOBINA ÚTIL ESTIMADA',fmt(r.disponibles)+' m','Lineales · preparación excluida')+card('NECESARIOS PARA TERMINAR',fmt(r.necesarios)+' m',fmt(r.pendientes)+' etiquetas pendientes')+card(falta?'FALTAN':'MARGEN',fmt(Math.abs(r.margen))+' m','Metros lineales')+card('EQUIVALENCIA DEL '+(falta?'DÉFICIT':'MARGEN'),fmt(r.rollosMargen)+' rollos','Rollos terminados equivalentes')+'</div><p>'+fmt(r.fabricadas)+' etiquetas válidas fabricadas · '+fmt(r.rollosPendientes)+' rollos equivalentes pendientes.</p><p class="unidad">Estimación por diámetro y espesor. Las pérdidas posteriores consumen el margen indicado.</p>';
   salida.hidden=false;
  }catch(err){$('errorContinuar').textContent=err.message;$('errorContinuar').hidden=false;$(err.campo)?.setAttribute('aria-invalid','true');$(err.campo)?.focus();}
 });
})(globalThis);
