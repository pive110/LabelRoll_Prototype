function imagenCaja(i){
 const h=[70,100,75,45,100][i],t=i?'#eee':'#d9b585',l=i?'#ccc':'#bb9465',r=i?'#aaa':'#987346';
 return `<svg viewBox="0 0 240 270" aria-hidden="true"><path d="M20 105L120 60L220 105L120 153Z" fill="${t}" stroke="#888"/><path d="M20 105L120 153V${153+h}L20 ${105+h}Z" fill="${l}" stroke="#888"/><path d="M120 153L220 105V${105+h}L120 ${153+h}Z" fill="${r}" stroke="#888"/><path d="M70 82L170 129v20" fill="none" stroke="#888" stroke-width="12" opacity=".35"/>${i>1&&i<4?`<circle cx="188" cy="40" r="32" fill="#14191c" stroke="#30373d" stroke-width="2"/>`+Array.from({length:i-1},(_,n)=>`<g transform="translate(${n*18-8} 0) rotate(35 183 40)"><path d="M180 15h7v15h-7z" fill="#eee"/><rect x="177" y="27" width="13" height="37" rx="5" fill="#ff2938"/><path d="M183 34v20" stroke="#ae0716" stroke-width="3"/></g>`).join(''):''}</svg>`;
}

function mostrarSelectorCajas(opciones,recomendada,seleccionar,ver3d){
 const panel=document.getElementById('recomendacion');panel.hidden=false;
 panel.innerHTML='<h3 id="tituloCajas">Elige la caja</h3><p class="cajas-ayuda">La recomendada permite más rollos por palet.</p><div class="cajas-selector" role="group" aria-labelledby="tituloCajas"></div><p class="caja-aviso" role="status" hidden></p>';
 const lista=panel.querySelector('.cajas-selector'),fmt=n=>n.toLocaleString('es-ES');
 opciones.forEach(o=>{
  const b=document.createElement('button');b.type='button';b.className='caja-opcion';b.disabled=!o.capacidad;b.setAttribute('aria-pressed','false');
  const mejor=o.id===recomendada?.id;
  b.setAttribute('aria-label',o.nombre+', '+o.L+' por '+o.A+' por '+o.H+' milímetros'+(mejor?', recomendada':'')+(o.capacidad?', '+fmt(o.rollosPorPalet)+' rollos por palet':', no cabe el rollo'));
  b.innerHTML='<span class="caja-identidad"><span class="caja-icono">'+imagenCaja(o.imagen)+'</span><span class="caja-nombre">'+o.nombre+'</span><span class="caja-estado">'+(mejor?'★ Recomendada':'')+'</span></span><span class="caja-capacidad">'+(o.capacidad?'<strong>'+fmt(o.capacidad)+'</strong><span>rollos/caja</span>':'<span>No cabe el rollo</span>')+'</span><span class="caja-capacidad caja-palet">'+(o.capacidad?'<strong>'+fmt(o.rollosPorPalet)+'</strong><span>rollos/palet</span>':'—')+'</span><span class="caja-check" aria-hidden="true"></span>';
  const fila=document.createElement('div');fila.className='caja-fila';
  const vista=document.createElement('button');vista.type='button';vista.className='caja-vista';
  vista.disabled=!o.capacidad||o.capacidad>300;vista.setAttribute('aria-label','Ver '+o.nombre+' en 3D');
  vista.title=o.capacidad>300?'Vista 3D disponible hasta 300 rollos por caja':'Ver '+o.nombre+' en 3D';
  vista.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Zm0 0v10m9-5-9 5-9-5m9 5v10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span>3D</span>';
  b.addEventListener('click',()=>activar(o,b));vista.addEventListener('click',()=>{activar(o,b);ver3d?.();});
  fila.appendChild(b);fila.appendChild(vista);lista.appendChild(fila);
 });
 function activar(o,b){
  lista.querySelectorAll('.caja-opcion').forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.querySelector('.caja-check').textContent=x===b?'✓':'';});
  seleccionar(o);
 }
 if(recomendada)activar(recomendada,lista.querySelectorAll('.caja-opcion')[opciones.findIndex(o=>o.id===recomendada.id)]);
 else {const aviso=panel.querySelector('.caja-aviso');aviso.hidden=false;aviso.textContent='Ninguna caja admite este rollo. Revisa el diámetro y el ancho.';}
}
function mostrarComparacionCajas(){
 const panel=document.getElementById('comparacion');
 if(panel){panel.hidden=true;panel.innerHTML='';}
}
