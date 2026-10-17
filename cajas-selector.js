function imagenCaja(i){
 const h=[70,100,75,45][i],t=i?'#eee':'#d9b585',l=i?'#ccc':'#bb9465',r=i?'#aaa':'#987346';
 return `<svg viewBox="0 0 240 240" aria-hidden="true"><path d="M20 105L120 60L220 105L120 153Z" fill="${t}" stroke="#888"/><path d="M20 105L120 153V${153+h}L20 ${105+h}Z" fill="${l}" stroke="#888"/><path d="M120 153L220 105V${105+h}L120 ${153+h}Z" fill="${r}" stroke="#888"/><path d="M70 82L170 129v20" fill="none" stroke="#888" stroke-width="12" opacity=".35"/>${i>1?`<circle cx="188" cy="40" r="32" fill="#14191c" stroke="#30373d" stroke-width="2"/>`+Array.from({length:i-1},(_,n)=>`<g transform="translate(${n*18-8} 0) rotate(35 183 40)"><path d="M180 15h7v15h-7z" fill="#eee"/><rect x="177" y="27" width="13" height="37" rx="5" fill="#ff2938"/><path d="M183 34v20" stroke="#ae0716" stroke-width="3"/></g>`).join(''):''}</svg>`;
}
function mostrarSelectorCajas(opciones,recomendada,seleccionar){
 const panel=document.getElementById('recomendacion');panel.hidden=false;
 panel.innerHTML='<h3 id="tituloCajas">CAJA RECOMENDADA</h3><div class="cajas-selector" role="group" aria-labelledby="tituloCajas"></div><div class="caja-detalle" aria-live="polite"></div>';
 const lista=panel.querySelector('.cajas-selector');
 opciones.forEach((o,i)=>{
  const b=document.createElement('button'),nombre=i?'N1':'CampoFr',corte=i>1?` · ${i-1} ${i===2?'corte':'cortes'}`:'';
  b.type='button';b.className='caja-opcion';b.disabled=!o.capacidad;b.setAttribute('aria-pressed','false');
  b.setAttribute('aria-label',`${nombre}${corte}, ${o.L} por ${o.A} por ${o.H} milímetros${!o.capacidad?', no cabe el rollo':''}`);
  b.innerHTML=`<span class="caja-nombre">${nombre}</span>${imagenCaja(i)}<span class="caja-medidas">${o.L} × ${o.A} × ${o.H} mm${corte}</span><span class="caja-estado">${!o.capacidad?'No cabe el rollo':o===recomendada?'★ Recomendada':`${fmt0(o.capacidad)} rollos/caja`}</span>`;
  b.addEventListener('click',()=>activar(o,b));lista.appendChild(b);
 });
 function activar(o,b){
  lista.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  panel.querySelector('.caja-detalle').innerHTML=`<p><b>Pedido:</b> ${fmt0(o.cajas)} cajas · <b>Última caja:</b> ${fmt0(o.ultimos)} rollos</p>`;
  seleccionar(o);
 }
 if(recomendada)activar(recomendada,lista.children[opciones.indexOf(recomendada)]);
 else panel.querySelector('.caja-detalle').textContent='Ninguna caja admite el rollo con estas dimensiones.';
}
