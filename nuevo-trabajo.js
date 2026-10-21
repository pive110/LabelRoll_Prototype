document.getElementById('nuevoTrabajo').addEventListener('click',()=>{
 const $=id=>document.getElementById(id);
 LabelRollApp.cerrarVista();
 document.querySelectorAll('#calculadora input').forEach(el=>{
  el.value='';el.removeAttribute('aria-invalid');
  el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 document.querySelectorAll('#calculadora select').forEach(el=>{
  el.selectedIndex=0;el.dispatchEvent(new Event('change',{bubbles:true}));
 });
 LabelRollApp.invalidarMuestra();
 LabelRollApp.invalidarPedido('Nuevo trabajo. Introduce los datos para calcular.','pendiente');
 document.querySelectorAll('#calculadora .error').forEach(el=>{el.hidden=true;el.textContent='';});
 ['resultadoBobina','resultadoDesperdicio','resultadoContinuar','planBobina','resumenCajas'].forEach(id=>$(id).hidden=true);
 $('recomendacion').replaceChildren();$('comparacion').replaceChildren();$('contenidoTecnico').replaceChildren();
 document.querySelectorAll('#calculadora details').forEach(el=>el.open=false);
 $('toggleEspesor').setAttribute('aria-expanded','false');
 LabelRollBobina.navegar('inicio');
 $('estadoNuevoTrabajo').textContent='Campos y resultados limpiados. Listo para un nuevo trabajo.';
 $('nuevoTrabajo').focus();
});

// Los ceros iniciales no representan un trabajo introducido por el operario.
(function(){
 const boton=document.getElementById('nuevoTrabajo'),editados=new Set();
 function actualizar(){
  const hayDatos=Array.from(document.querySelectorAll('#calculadora input')).some(el=>el.value.trim()!==''&&(editados.has(el.id)||el.value!==(el.getAttribute('value')||'')));
  boton.classList.toggle('con-datos',hayDatos);
  boton.title=hayDatos?'Hay datos introducidos. Limpiar para empezar un nuevo trabajo':'Empezar un nuevo trabajo';
  boton.setAttribute('aria-label',hayDatos?'Nuevo trabajo: hay datos introducidos, pulsar para limpiarlos':'Nuevo trabajo');
 }
 document.addEventListener('input',e=>{if(e.target.matches('#calculadora input')){if(e.target.value.trim())editados.add(e.target.id);else editados.delete(e.target.id);actualizar();}});
 document.addEventListener('click',e=>{if(e.target.closest('#nuevoTrabajo'))editados.clear();actualizar();});
 actualizar();
})();
