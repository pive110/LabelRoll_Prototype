/* Estado de pantalla y eventos. Los cálculos viven en calculos.js. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),C=globalThis.LabelRollCalculos;
 const campos=['total','mandril','etiquetasManual','anchoRollo','avance','separacion','diamMax','espesor'];
 const camposMuestra=['muestraDiametro','muestraEtiquetas','mandril','avance','separacion'];
 const resultados=['rEtiquetas','rRollos','rDiametro','rMetros','rMax','rProducidas','rCaja','rCajas'];
 const fmt=(n,d=2)=>n.toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d}),ent=n=>n.toLocaleString('es-ES');
 let pedido=null,opciones=[],recomendada=null,seleccionada=null,ancho=null,muestra=null,estado='pendiente',focoAnterior=null;
 const leer=()=>Object.fromEntries([...campos,'muestraDiametro','muestraEtiquetas'].map(id=>[id,$(id).value]));
 const firmaMuestra=()=>JSON.stringify(camposMuestra.map(id=>$(id).value.trim()));
 function mensajeEstado(texto,nuevo){estado=nuevo;$('estadoResultados').textContent=texto;$('estadoResultados').dataset.estado=nuevo;}
 function limpiarError(id){const campo=$(id),err=$(id+'Error');if(campo)campo.removeAttribute('aria-invalid');if(err){err.hidden=true;err.textContent='';}}
 function errorDato(error,{muestra=false}={}){
  const campo=$(error.campo),err=$(error.campo+'Error');
  if(campo)campo.setAttribute('aria-invalid','true');
  if(err){err.textContent=error.message;err.hidden=false;}
  const general=$(muestra?'muestraError':'error');general.textContent=error.message;general.hidden=false;
  if(campo&&!campo.disabled)campo.focus();
 }
 function cerrarVista(){
  if($('overlayVista').hidden)return;
  $('overlayVista').hidden=true;$('calculadora').inert=false;document.body.classList.remove('vista-abierta');
  $('visorOriginal').src='about:blank';
  if(focoAnterior&&!focoAnterior.hidden)focoAnterior.focus();
 }
 function invalidarPedido(texto='Datos modificados. Pulsa Calcular para actualizar.',nuevo='desactualizado'){
  cerrarVista();pedido=null;opciones=[];recomendada=null;seleccionada=null;ancho=null;
  resultados.forEach(id=>$(id).textContent='—');
  ['planBobina','resumenCajas','pedidoVerificado','recomendacion','comparacion','detalleTecnico','abrirVista','imprimirFicha','nota'].forEach(id=>$(id).hidden=true);
  $('fichaImpresion').replaceChildren();$('error').hidden=true;
  mensajeEstado(texto,nuevo);
 }
 function invalidarMuestra(){
  muestra=null;$('usarMuestra').disabled=true;$('espesorResultado').hidden=true;$('muestraError').hidden=true;
 }
 function sincronizarModo(){
  const activo=$('diamMax').value.trim()!=='';
  $('opcionesDiametro').hidden=!activo;$('etiquetasManual').disabled=activo;
  $('etiquetasManual').title=activo?'Con Ø máximo, este valor se calcula automáticamente.':'';
  $('ayudaModo').textContent=$('modoRollos').value==='iguales'?'Busca rollos iguales y una cantidad total exacta. Con algunos pedidos puede resultar un rollo muy pequeño.':'Aprovecha el diámetro disponible; el último rollo puede llevar menos etiquetas.';
 }
 function calcularMuestra(){
  invalidarMuestra();camposMuestra.forEach(limpiarError);
  try{
   const valor=C.calcularEspesor(leer());muestra={valor,firma:firmaMuestra()};
   $('espesorValor').textContent=fmt(valor,5)+' mm';$('espesorMicras').textContent='Equivale a '+fmt(valor*1000)+' µm';
   $('espesorResultado').hidden=false;$('usarMuestra').disabled=false;
  }catch(error){errorDato(error,{muestra:true});}
 }
 function usarMuestra(){
  if(!muestra||muestra.firma!==firmaMuestra()){
   invalidarMuestra();$('muestraError').textContent='Los datos de la muestra han cambiado. Vuelve a calcular el espesor.';$('muestraError').hidden=false;return;
  }
  $('espesor').value=Number(muestra.valor.toFixed(8)).toString().replace('.',',');
  limpiarError('espesor');invalidarPedido('Espesor actualizado. Pulsa Calcular para actualizar el pedido.');
  $('espesorRapido').open=false;$('dialogoEspesor').close();$('toggleEspesor').setAttribute('aria-expanded','false');$('espesor').focus();
 }
 function detalle(){
  if(!pedido)return;
  const p=pedido,o=seleccionada;
  const modo=p.modo==='iguales'?'Rollos iguales y pedido exacto':p.modo==='capacidad'?'Máximo aprovechamiento con último rollo parcial':'Etiquetas por rollo indicadas manualmente';
  let html='<p><b>Reparto:</b> '+modo+'. Último rollo: '+ent(p.ultimo)+' etiquetas · Ø '+fmt(p.Dultimo)+' mm.</p><p><b>Material:</b> avance '+fmt(p.Av)+' mm + separación '+fmt(p.S)+' mm · espesor '+fmt(p.e,5)+' mm · mandril '+fmt(p.Di)+' mm.</p>';
  if(o)html+='<p><b>'+o.nombre+':</b> '+o.L+' × '+o.A+' × '+o.H+' mm · '+ent(o.patron.capa)+' rollos/capa × '+ent(o.capas)+' capas · patrón '+o.patron.nombre+'.</p><p><b>Hueco superior:</b> '+fmt(o.huecoSuperior)+' mm · '+ent(o.huecos)+' posiciones libres en el conjunto de cajas.</p>';
  html+='<p><b>Criterio:</b> menor número de cajas; en empate, menor volumen total. Un único formato de caja por pedido, rollos verticales, comparando cuadrícula y patrón alternado en ambos sentidos, sin holgura añadida. Se elige el mejor patrón probado; no se garantiza el máximo de todas las disposiciones posibles. No incluye coste, peso ni disponibilidad.</p>';
  html+='<p>El check confirma el reparto previsto, no la cantidad realmente fabricada. La capacidad geométrica requiere comprobar las medidas interiores y el ajuste físico.</p>';
  if(o&&o.capacidad>300)html+='<p>La vista 3D admite hasta 300 rollos por caja.</p>';
  $('contenidoTecnico').innerHTML=html;$('detalleTecnico').hidden=false;
 }
 function seleccionarCaja(o){
  if(!pedido)return;seleccionada=o;
  $('rCaja').textContent=ent(o.capacidad);$('rCajas').textContent=ent(o.cajas);
  const incompleta=o.ultimos<o.capacidad,completas=o.cajas-(incompleta?1:0);
  $('resumenCajas').textContent=incompleta?ent(completas)+' completas + 1 caja con '+ent(o.ultimos)+' '+(o.ultimos===1?'rollo':'rollos'):ent(completas)+' '+(completas===1?'caja completa':'cajas completas');
  $('resumenCajas').hidden=false;
  mostrarComparacionCajas(opciones,recomendada,o);
  $('abrirVista').hidden=o.capacidad>300;detalle();
 }
 function calcular(){
  invalidarPedido('Revisando los datos…','pendiente');campos.forEach(limpiarError);
  try{pedido=C.calcularPedido({...leer(),modo:$('modoRollos').value});}
  catch(error){mensajeEstado('No hay un cálculo válido. Revisa el campo señalado.','error');errorDato(error);return;}
  const p=pedido;
  $('rEtiquetas').textContent=ent(p.etiquetas);$('rRollos').textContent=ent(p.rollos);$('rDiametro').textContent=fmt(p.D)+' mm';$('rMetros').textContent=fmt(p.metros)+' m';
  $('tituloMax').textContent=p.maxFisico===null?'ETIQUETAS ÚLTIMO ROLLO':'MÁX. ETIQUETAS POR Ø';$('rMax').textContent=ent(p.maxFisico===null?p.ultimo:p.maxFisico);
  $('rProducidas').textContent=ent(p.total);$('pedidoVerificado').hidden=!p.planCorrecto;
  mensajeEstado('Cálculo actualizado.','valido');$('imprimirFicha').hidden=false;
  const avisos=[];
  if(p.modo==='iguales'&&p.maxFisico>p.etiquetas*2&&p.rollos>1)avisos.push('El reparto exacto reduce mucho las etiquetas por rollo. Puedes probar «Aprovechar Ø máximo» para permitir un último rollo parcial.');
  if(!$('anchoRollo').value.trim())avisos.push('Introduce el ancho del rollo para calcular las cajas.');
  else try{
   ancho=C.numero($('anchoRollo').value,'anchoRollo');opciones=C.optimizarCajas(p.D,ancho,p.rollos);recomendada=C.recomendar(opciones);
   mostrarComparacionCajas(opciones,recomendada,null);mostrarSelectorCajas(opciones,recomendada,seleccionarCaja);
  }catch(error){
   ancho=null;errorDato(error);mensajeEstado('Producción calculada. Corrige el ancho para obtener el embalaje.','parcial');
  }
  if(avisos.length){$('nota').textContent=avisos.join(' ');$('nota').hidden=false;}
  detalle();
 }
 function enviarVista(){
  document.querySelectorAll('[data-tipo-vista]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tipoVista===$('tipoVista').value)));
  if(!pedido||!seleccionada||$('overlayVista').hidden)return;
  const o=seleccionada,total=$('tipoVista').value==='ultima'?o.ultimos:o.capacidad;
  const datos={L:o.L,A:o.A,H:o.H,D:pedido.D,Ar:ancho,Di:pedido.Di,centros:o.patron.centros,patron:o.patron.nombre,nz:o.capas,total,tipo:$('tipoVista').value};
  // Los archivos locales tienen origen opaco. El destinatario se limita al iframe propio.
  $('visorOriginal').contentWindow.postMessage({tipo:'LABEL_ROLL_VISTA',datos},location.protocol==='file:'?'*':location.origin);
 }
 function abrirVista(){
  if(!pedido||!seleccionada||seleccionada.capacidad>300)return;
  focoAnterior=document.activeElement;$('overlayVista').hidden=false;$('calculadora').inert=true;document.body.classList.add('vista-abierta');
  $('tipoVista').value=pedido.rollos<seleccionada.capacidad?'ultima':'capacidad';
  document.querySelectorAll('[data-tipo-vista]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tipoVista===$('tipoVista').value)));
  $('visorOriginal').src='./visor-3d.html';$('cerrarVista').focus();
 }
 function imprimir(){
  if(!pedido)return;
  const p=pedido,o=seleccionada;
  const filas=[['Etiquetas solicitadas',ent(p.total)],['Etiquetas por rollo',ent(p.etiquetas)],['Rollos',ent(p.rollos)],['Etiquetas del último rollo',ent(p.ultimo)],['Diámetro teórico',fmt(p.D)+' mm'],['Metros por rollo completo',fmt(p.metros)+' m'],['Mandril',fmt(p.Di)+' mm'],['Avance / separación',fmt(p.Av)+' / '+fmt(p.S)+' mm'],['Espesor',fmt(p.e,5)+' mm'],['Ancho',ancho?fmt(ancho)+' mm':'Sin calcular'],['Caja seleccionada',o?o.nombre:'Sin embalaje calculado'],['Disposición',o?o.patron.nombre+' · '+ent(o.patron.capa)+' rollos/capa × '+ent(o.capas)+' capas':'—'],['Número de cajas',o?ent(o.cajas):'—'],['Rollos de la última caja',o?ent(o.ultimos):'—']];
  $('fichaImpresion').innerHTML='<h2>Ficha de producción · planificación</h2><p>'+new Date().toLocaleDateString('es-ES')+'</p><table>'+filas.map(([k,v])=>'<tr><th scope="row">'+k+'</th><td>'+v+'</td></tr>').join('')+'</table><p>Cálculo geométrico sin holguras añadidas. Confirmar el ajuste físico de las cajas.</p>';
  window.print();
 }
 function aplicarTema(oscuro){
  document.body.classList.toggle('theme-dark',oscuro);$('cambiarTema').setAttribute('aria-pressed',String(oscuro));
  $('cambiarTema').querySelector('.bobina-giro').style.transform='rotate('+(oscuro?0:180)+'deg)';
  const etiquetaTema=oscuro?'Activar modo claro':'Activar modo oscuro';
  $('cambiarTema').setAttribute('aria-label',etiquetaTema);$('cambiarTema').title=etiquetaTema;
  document.querySelector('meta[name="theme-color"]').content=oscuro?'#19191b':'#f2f3f5';
  try{localStorage.setItem('labelroll-tema',oscuro?'oscuro':'claro')}catch(_){/* Preferencia opcional. */}
 }
 $('datosPedido').addEventListener('input',event=>{
  const id=event.target.id;limpiarError(id);
  if(camposMuestra.includes(id))invalidarMuestra();
  if(campos.includes(id)||id==='modoRollos')invalidarPedido();
  if(id==='diamMax'||id==='modoRollos')sincronizarModo();
 });
 $('modoRollos').addEventListener('change',()=>{sincronizarModo();invalidarPedido();});
 document.querySelectorAll('input[inputmode="decimal"]').forEach(input=>input.addEventListener('input',()=>{
  const inicio=input.selectionStart,fin=input.selectionEnd;
  if(input.value.includes('.')){input.value=input.value.replaceAll('.',',');if(inicio!==null)input.setSelectionRange(inicio,fin);}
 }));
 $('calculadora').addEventListener('keydown',event=>{
  if(event.key!=='Enter'||event.isComposing||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.target.tagName!=='INPUT')return;
  const enMuestra=event.target.closest('#espesorRapido');
  const contenedor=enMuestra||event.target.closest('.pantalla');if(!contenedor)return;
  const visibles=Array.from(contenedor.querySelectorAll('input,select')).filter(input=>!input.disabled&&input.getClientRects().length&&(enMuestra||!input.closest('#espesorRapido')));
  const i=visibles.indexOf(event.target);if(i<0)return;event.preventDefault();
  const boton=enMuestra?$('calcularMuestra'):contenedor.id==='pantallaRollos'?$('calcularEmbalaje'):contenedor.querySelector('button[type="submit"],#calcularBobina');
  (visibles[i+1]||boton)?.focus();
 });
 $('toggleEspesor').addEventListener('click',()=>{
  $('espesorRapido').open=true;$('dialogoEspesor').showModal();
  $('toggleEspesor').setAttribute('aria-expanded','true');document.body.classList.add('espesor-abierto');
  $('muestraDiametro').focus();
 });
 $('cerrarEspesor').addEventListener('click',()=>$('dialogoEspesor').close());
 $('dialogoEspesor').addEventListener('close',()=>{document.body.classList.remove('espesor-abierto');$('toggleEspesor').setAttribute('aria-expanded','false');});
 $('calcularMuestra').addEventListener('click',calcularMuestra);$('usarMuestra').addEventListener('click',usarMuestra);$('calcularEmbalaje').addEventListener('click',calcular);
 $('abrirVista').addEventListener('click',abrirVista);$('cerrarVista').addEventListener('click',cerrarVista);$('tipoVista').addEventListener('change',enviarVista);$('visorOriginal').addEventListener('load',enviarVista);
 document.querySelectorAll('[data-tipo-vista]').forEach(b=>b.addEventListener('click',()=>{$('tipoVista').value=b.dataset.tipoVista;enviarVista();}));
 $('imprimirFicha').addEventListener('click',imprimir);
 $('cambiarTema').addEventListener('click',()=>{
  aplicarTema(!document.body.classList.contains('theme-dark'));
 });
 document.addEventListener('keydown',event=>{
  if($('overlayVista').hidden)return;
  if(event.key==='Escape'){event.preventDefault();cerrarVista();}
  if(event.key==='Tab'&&event.shiftKey&&document.activeElement===$('cerrarVista')){event.preventDefault();$('visorOriginal').contentWindow.postMessage({tipo:'LABEL_ROLL_FOCUS_LAST'},location.protocol==='file:'?'*':location.origin);}
 });
 window.addEventListener('message',event=>{
  if(event.source!==$('visorOriginal').contentWindow||$('overlayVista').hidden)return;
  if(location.protocol!=='file:'&&event.origin!==location.origin)return;
  if(event.data?.tipo==='LABEL_ROLL_CLOSE')cerrarVista();
  if(event.data?.tipo==='LABEL_ROLL_FOCUS_NEXT')$('cerrarVista').focus();
  if(event.data?.tipo==='LABEL_ROLL_FOCUS_PREVIOUS')document.querySelector('[data-tipo-vista="ultima"]').focus();
 });
 function conexion(){
  $('estadoConexion').textContent=location.protocol==='file:'?'Label Roll Calculator':navigator.onLine?'Label Roll Calculator':'Sin conexión · los cálculos siguen disponibles';
 }
 window.addEventListener('online',conexion);window.addEventListener('offline',conexion);conexion();
 let saved;try{saved=localStorage.getItem('labelroll-tema')}catch(_){}aplicarTema(saved!=='claro');sincronizarModo();
 if('serviceWorker' in navigator && location.protocol!=='file:'){
  let registro,actualizando=false;
  const avisar=()=>{if(registro?.waiting)$('actualizacion').hidden=false;};
  navigator.serviceWorker.register('./service-worker.js').then(r=>{
   registro=r;avisar();r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')avisar();});});
  }).catch(()=>{$('estadoConexion').textContent='Label Roll · 2.2.0 · modo sin conexión no disponible';});
  $('actualizarApp').addEventListener('click',()=>{if(registro?.waiting){actualizando=true;registro.waiting.postMessage({tipo:'ACTUALIZAR'});}});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(actualizando)location.reload();else if(registro){$('actualizacion').hidden=false;$('actualizarApp').onclick=()=>location.reload();}});
 }
 globalThis.LabelRollApp=Object.freeze({calcular,calcularMuestra,usarMuestra,invalidarPedido,invalidarMuestra,abrirVista,cerrarVista,enviarVista,imprimir,getEstado:()=>({estado,pedido,seleccionada,muestra})});
})();
