function imagenCaja(i){
 const h=[70,100,75,45][i],t=i?'#eee':'#d9b585',l=i?'#ccc':'#bb9465',r=i?'#aaa':'#987346';
 return `<svg viewBox="0 0 240 270" aria-hidden="true"><path d="M20 105L120 60L220 105L120 153Z" fill="${t}" stroke="#888"/><path d="M20 105L120 153V${153+h}L20 ${105+h}Z" fill="${l}" stroke="#888"/><path d="M120 153L220 105V${105+h}L120 ${153+h}Z" fill="${r}" stroke="#888"/><path d="M70 82L170 129v20" fill="none" stroke="#888" stroke-width="12" opacity=".35"/>${i>1?`<circle cx="188" cy="40" r="32" fill="#14191c" stroke="#30373d" stroke-width="2"/>`+Array.from({length:i-1},(_,n)=>`<g transform="translate(${n*18-8} 0) rotate(35 183 40)"><path d="M180 15h7v15h-7z" fill="#eee"/><rect x="177" y="27" width="13" height="37" rx="5" fill="#ff2938"/><path d="M183 34v20" stroke="#ae0716" stroke-width="3"/></g>`).join(''):''}</svg>`;
}

function mostrarSelectorCajas(opciones,recomendada,seleccionar){
 const panel=document.getElementById('recomendacion');panel.hidden=false;
 panel.innerHTML='<h3 id="tituloCajas">SELECCIÓN DE CAJA</h3><div class="cajas-selector" role="group" aria-labelledby="tituloCajas"></div><div class="caja-detalle" aria-live="polite"></div>';
 const lista=panel.querySelector('.cajas-selector'),fmt=n=>n.toLocaleString('es-ES');
 opciones.forEach(o=>{
  const b=document.createElement('button');b.type='button';b.className='caja-opcion';b.disabled=!o.capacidad;b.setAttribute('aria-pressed','false');
  const esRecomendada=o.id===recomendada?.id;
  b.setAttribute('aria-label',o.nombre+', '+o.L+' por '+o.A+' por '+o.H+' milímetros'+(esRecomendada?', recomendada':'')+(!o.capacidad?', no cabe el rollo':''));
  b.innerHTML='<span class="caja-nombre">'+o.titulo+'</span>'+imagenCaja(o.imagen)+(o.cortes?'<span class="caja-medidas">'+o.cortes+' '+(o.cortes===1?'corte':'cortes')+'</span>':'')+'<span class="caja-estado">'+(!o.capacidad?'No cabe el rollo':esRecomendada?'★ Recomendada':fmt(o.capacidad)+' rollos/caja')+'</span>';
  b.addEventListener('click',()=>activar(o,b));lista.appendChild(b);
 });
 function activar(o,b){
  lista.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  panel.querySelector('.caja-detalle').innerHTML='<p><b>Pedido:</b> '+fmt(o.cajas)+' '+(o.cajas===1?'caja':'cajas')+' · <b>Última caja:</b> '+fmt(o.ultimos)+' '+(o.ultimos===1?'rollo':'rollos')+'</p>';
  seleccionar(o);
 }
 if(recomendada)activar(recomendada,lista.children[opciones.findIndex(o=>o.id===recomendada.id)]);
 else panel.querySelector('.caja-detalle').textContent='Ninguna de estas cuatro cajas admite el formato de rollo.';
}
function mostrarComparacionCajas(opciones,recomendada,seleccionada){
 const tabla=document.getElementById('comparacion');tabla.hidden=false;
 tabla.innerHTML='<table><caption class="sr-only">Comparación de cajas; estrella: recomendada, check: seleccionada</caption><thead><tr><th scope="col">Caja</th><th scope="col">Rollos/caja</th><th scope="col">Cajas</th><th scope="col">Disposición</th></tr></thead><tbody>'+opciones.map(o=>{
  const elegida=o.id===seleccionada?.id,mejor=o.id===recomendada?.id;
  return '<tr class="'+(elegida?'seleccionada':'')+'"><th scope="row">'+o.nombre+(mejor?'<span class="marca-tabla">★ Recomendada</span>':'')+(elegida?'<span class="marca-tabla">✓ Seleccionada</span>':'')+'</th><td>'+ (o.capacidad?o.capacidad.toLocaleString('es-ES'):'No cabe')+'</td><td>'+(o.capacidad?o.cajas.toLocaleString('es-ES'):'—')+'</td><td>'+(o.capacidad?o.patron.nombre+' · '+o.patron.capa+'/capa × '+o.capas+' capas<small class="comparacion-patrones">Cuadrícula: '+o.patron.comparacion.cuadricula+'/capa<br>Alternado: '+o.patron.comparacion.alternado+'/capa</small>':'—')+'</td></tr>';
 }).join('')+'</tbody></table>';
}
