/* Calculadoras auxiliares del control de bobina restante. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),C=LabelRollCalculos;
 const icono='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2"/></svg>';
 const dialogo=document.createElement('dialog');dialogo.id='ayudaContinuar';dialogo.className='dialogo-espesor';dialogo.setAttribute('aria-labelledby','tituloAyudaContinuar');
 $('calculadora').appendChild(dialogo);
 let valor=null,destino=null,disparador=null;
 const configuraciones={
  marca:{titulo:'Diámetro de la marca roja',destino:'fin-preparacion',texto:'Mide desde el exterior del mandril hasta la marca roja. Se calcula el diámetro de la marca, sin margen de parada.',campos:[['mandrilBruto','Ø exterior del mandril · mm','mandrilBruto'],['distanciaMarca','Del mandril a la marca roja · mm','distanciaMarca']],calcular:datos=>LabelRollBobina.calcularParada({...datos,margenParada:'0'}).marca},
  espesor:{titulo:'Calcular espesor',destino:'fin-espesor',texto:'Usa un rollo de muestra y sus etiquetas reales. El resultado incluye soporte, adhesivo y frontal.',campos:[['mandril','Ø exterior del mandril · mm','mandril'],['avance','Avance de etiqueta · mm','fin-avance'],['separacion','Separación · mm','fin-separacion'],['muestraDiametro','Ø exterior del rollo de muestra · mm','muestraDiametro'],['muestraEtiquetas','Etiquetas del rollo de muestra','muestraEtiquetas']],calcular:datos=>C.calcularEspesor(datos)}
 };
 for(const [tipo,config] of Object.entries(configuraciones)){
  const campo=$(config.destino),label=document.querySelector('label[for="'+config.destino+'"]'),fila=document.createElement('div');fila.className='campo-label-accion';label.before(fila);fila.appendChild(label);
  const boton=document.createElement('button');boton.id='calcular-fin-'+tipo;boton.type='button';boton.className='boton-ayuda-campo';boton.setAttribute('aria-label',config.titulo);boton.setAttribute('aria-haspopup','dialog');boton.setAttribute('aria-controls',dialogo.id);boton.innerHTML=icono;fila.appendChild(boton);
  boton.addEventListener('click',()=>abrir(config,boton));
 }
 function abrir(config,boton){
  valor=null;destino=$(config.destino);disparador=boton;
  dialogo.innerHTML='<div class="cabecera-espesor"><h2 id="tituloAyudaContinuar">'+config.titulo+'</h2><button type="button" class="cerrar-ayuda" aria-label="Cerrar calculadora">×</button></div><p class="ayuda-intro">'+config.texto+'</p><form novalidate><div class="grid">'+config.campos.map(([id,label])=>'<div class="campo"><label for="ayuda-'+id+'">'+label+'</label><input id="ayuda-'+id+'" name="'+id+'" type="text" inputmode="decimal" autocomplete="off"></div>').join('')+'</div><button type="submit">Calcular</button></form><p class="error" role="alert" hidden></p><div class="espesor-resultado" role="status" hidden><strong id="valorAyudaContinuar"></strong><button type="button" id="aplicarAyudaContinuar">Usar este valor</button></div>';
  config.campos.forEach(([id,,origen])=>dialogo.querySelector('[name="'+id+'"]').value=$(origen)?.value||'');
  dialogo.querySelector('.cerrar-ayuda').addEventListener('click',()=>dialogo.close());
  const formulario=dialogo.querySelector('form'),error=dialogo.querySelector('.error'),resultado=dialogo.querySelector('.espesor-resultado');
  formulario.addEventListener('input',()=>{valor=null;resultado.hidden=true;error.hidden=true;});
  formulario.addEventListener('keydown',event=>{
   if(event.key!=='Enter'||event.isComposing||event.target.tagName!=='INPUT')return;
   event.preventDefault();const inputs=[...formulario.querySelectorAll('input')],i=inputs.indexOf(event.target);(inputs[i+1]||formulario.querySelector('button[type="submit"]')).focus();
  });
  formulario.addEventListener('submit',event=>{
   event.preventDefault();error.hidden=true;resultado.hidden=true;valor=null;
   try{valor=config.calcular(Object.fromEntries(new FormData(formulario)));$('valorAyudaContinuar').textContent=valor.toLocaleString('es-ES',{maximumFractionDigits:config===configuraciones.espesor?5:2})+' mm';resultado.hidden=false;}
   catch(e){error.textContent=e.message;error.hidden=false;dialogo.querySelector('[name="'+e.campo+'"]')?.focus();}
  });
  $('aplicarAyudaContinuar').addEventListener('click',()=>{
   if(valor===null)return;
   destino.value=String(Number(valor.toFixed(8))).replace('.',',');destino.dispatchEvent(new Event('input',{bubbles:true}));dialogo.close();destino.focus();
  });
  dialogo.showModal();document.body.classList.add('espesor-abierto');dialogo.querySelector('input').focus();
 }
 dialogo.addEventListener('close',()=>{document.body.classList.remove('espesor-abierto');if(document.activeElement===document.body)disparador?.focus();});
})();
