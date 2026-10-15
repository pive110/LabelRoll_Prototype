/* Label Roll Calculator · tarjetas visuales de cajas v1
   Solo lee el resultado de recomendación ya calculado. No modifica optimización ni Vista 3D. */
(() => {
  'use strict';
  const TIPOS = [
    {l:300,a:300,h:210,n:'CampoFr',c:0,kraft:true},
    {l:400,a:300,h:300,n:'N1',c:0,kraft:false},
    {l:400,a:300,h:250,n:'N1',c:1,kraft:false},
    {l:400,a:300,h:200,n:'N1',c:2,kraft:false}
  ];
  function iconoCutter(){return `<svg class="lrc-cutter" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19l9-11 5 4-9 10-5-3Z" fill="#d62a34" stroke="#89252a" stroke-width=".7"/><path d="m13 8 3-4 4 3-2 5Z" fill="#c1c8d0" stroke="#747c87" stroke-width=".7"/><path d="m7 17 7-8" stroke="#fa9ba0" stroke-width="1.1"/><circle cx="7" cy="19" r="1" fill="#451518"/></svg>`;}
  function cajaSvg(t){
    /* Mismo factor y proyección para las cuatro: variación dimensional auténtica. */
    const s=.32, x=t.l*s, y=t.a*s, z=t.h*s;
    const ax=.77,ay=.36,bx=-.77,by=.36;
    const P=(u,v,w)=>[u*ax+v*bx, u*ay+v*by-w];
    const ps={A:P(0,0,z),B:P(x,0,z),C:P(x,y,z),D:P(0,y,z),E:P(0,0,0),F:P(x,0,0),G:P(x,y,0),H:P(0,y,0)};
    const vs=Object.values(ps), xmin=Math.min(...vs.map(p=>p[0])), xmax=Math.max(...vs.map(p=>p[0])), ymin=Math.min(...vs.map(p=>p[1])), ymax=Math.max(...vs.map(p=>p[1]));
    const offx=160-(xmin+xmax)/2, offy=103-(ymin+ymax)/2;
    const pt=p=>`${(p[0]+offx).toFixed(1)},${(p[1]+offy).toFixed(1)}`;
    const poly=(...names)=>names.map(n=>pt(ps[n])).join(' ');
    const color=t.kraft?['#d7b28d','#b99067','#cba67e']:['#e0e4e9','#a2abb5','#c4ccd5'];
 return `<svg class="lrc-caja-svg" viewBox="0 0 320 206" role="img" aria-label="Caja ${t.n}, representación isométrica proporcional"><g stroke="${t.kraft?'#917353':'#79838d'}" stroke-width="1.05" stroke-linejoin="round"><polygon points="${poly('D','C','G','H')}" fill="${color[1]}"/><polygon points="${poly('B','C','G','F')}" fill="${color[2]}"/><polygon points="${poly('A','B','C','D')}" fill="${color[0]}"/></g></svg>`;
  function card(t,i,sel){
    const selected=i===sel;
    return `<article class="lrc-caja-card${selected?' lrc-seleccionada':''}" aria-label="${t.n}${t.c?' con '+t.c+' corte'+(t.c>1?'s':''):''}${selected?', caja recomendada':''}"><div class="lrc-caja-nombre">${t.n}</div><div class="lrc-caja-figura">${cajaSvg(t)}</div>${t.c?`<div class="lrc-cortes" aria-label="${t.c} corte${t.c>1?'s':''}">${Array.from({length:t.c},iconoCutter).join('')}</div>`:''}${selected?'<span class="lrc-elegida">✓ RECOMENDADA</span>':''}</article>`;
  }
  function detectar(rec){
    const marcado=rec.querySelector('.resaltado');
    if(!marcado)return -1;
    const nums=(marcado.textContent.match(/\d+/g)||[]).map(Number);
    return TIPOS.findIndex(t=>t.l===nums[0]&&t.a===nums[1]&&t.h===nums[2]);
  }
  function init(){
    const rec=document.getElementById('recomendacion');if(!rec)return;
    const css=document.createElement('style');css.textContent=`
      #recomendacion.lrc-activa{border-left:0;padding:15px 10px 14px;background:transparent}
      #recomendacion.lrc-activa>h3{margin:0 0 13px;color:#d92f3c;font-size:13px;letter-spacing:.04em}
      #recomendacion.lrc-activa>p{display:none!important}
      .lrc-galeria{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
      .lrc-caja-card{position:relative;display:flex;flex-direction:column;align-items:center;min-width:0;min-height:145px;padding:12px 5px 23px;border:1.5px solid #cbd0d6;border-radius:11px;background:#fff;color:#222;overflow:hidden}
      .lrc-caja-card.lrc-seleccionada{border:2px solid #e30613;background:#fffafa}
      .lrc-caja-nombre{font-weight:800;font-size:15px;line-height:1.3}
      .lrc-caja-figura{width:100%;flex:1;display:flex;align-items:center;justify-content:center}
      .lrc-caja-svg{width:100%;max-width:210px;height:auto;display:block}
      .lrc-cortes{position:absolute;top:7px;right:6px;display:flex;align-items:center;gap:0;background:#ffffffdd;border:1px solid #dedee2;border-radius:20px;padding:2px 3px}
      .lrc-cutter{width:17px;height:17px}
      .lrc-elegida{position:absolute;bottom:5px;left:2px;right:2px;text-align:center;font-size:8px;font-weight:800;letter-spacing:.03em;color:#d11c2d}
      body.theme-dark .lrc-caja-card{background:#242428;color:#f7f7f8;border-color:#4a4b52}
      body.theme-dark .lrc-caja-card.lrc-seleccionada{border-color:#e30613;background:#2d2427}
      body.theme-dark .lrc-cortes{background:#303036;border-color:#555}
      @media(max-width:540px){.lrc-galeria{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.lrc-caja-card{min-height:145px}.lrc-caja-svg{max-width:240px}}
      @media(min-width:541px) and (max-width:750px){.lrc-caja-card{min-height:128px}.lrc-caja-nombre{font-size:13px}.lrc-cutter{width:14px;height:14px}}
    `;document.head.appendChild(css);
    let inUpdate=false;
    function actualizar(){
      if(inUpdate)return;
      const idx=detectar(rec);
      if(idx<0){rec.classList.remove('lrc-activa');rec.querySelector('.lrc-galeria')?.remove();return;}
      inUpdate=true;
      let galeria=rec.querySelector('.lrc-galeria');
      if(!galeria){galeria=document.createElement('div');galeria.className='lrc-galeria';rec.appendChild(galeria);}
      galeria.innerHTML=TIPOS.map((t,i)=>card(t,i,idx)).join('');
      rec.classList.add('lrc-activa');
      inUpdate=false;
    }
    new MutationObserver(actualizar).observe(rec,{childList:true,subtree:false});
    actualizar();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
