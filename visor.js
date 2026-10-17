
'use strict';
const NS='http://www.w3.org/2000/svg';
const svg=document.getElementById('scene');
let box={L:400,W:300,H:300};
let roll={D:179.666062,width:45,core:84};
const colors=['#E5E7EB','#75B5CD','#E8AA60','#A6A2DB','#80BD9E','#E56D74'];
const DURATION=620,STAGGER=350,MAX_ROLLS=300;
// Fases del cierre: pausa, dos solapas cortas, dos largas y precintado.
const HOLD=900,SHORT_TIME=900,LONG_TIME=1000,TAPE_TIME=850;
const TAPE_COLOR='#E30613';
let velocidad=1;
const movimientoReducido=window.matchMedia('(prefers-reduced-motion: reduce)');
let positions=[],counts={nx:0,ny:0,nz:0},TOTAL=0;
let elapsed=0,previous=null,playing=false,complete=false,raf=null;
let FILL_END=0,SHORT_START=0,LONG_START=0,TAPE_START=0;
let transform={scale:1,x:0,y:0};
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:6}).format(n);
function projectRaw(x,y,z){return{x:(x-y)*Math.sqrt(3)/2,y:(x+y)*.5-z};}
function iso(x,y,z){const p=projectRaw(x,y,z);return{x:transform.x+p.x*transform.scale,y:transform.y+p.y*transform.scale};}
function fitView(){
 const vertices=[];
 for(const x of [0,box.L])for(const y of [0,box.W])for(const z of [0,box.H+Math.max(roll.width,box.H*.18)])vertices.push(projectRaw(x,y,z));
 const xs=vertices.map(p=>p.x),ys=vertices.map(p=>p.y);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const sx=660/Math.max(1,maxX-minX),sy=590/Math.max(1,maxY-minY);
 transform.scale=Math.min(sx,sy);
 transform.x=435-(minX+maxX)/2*transform.scale;
 transform.y=375-(minY+maxY)/2*transform.scale;
}
function el(tag,attrs={}){const v=document.createElementNS(NS,tag);for(const [k,val] of Object.entries(attrs))v.setAttribute(k,String(val));svg.append(v);return v;}
function poly(points,fill,stroke='#666',opacity=1){return el('polygon',{points:points.map(p=>`${p.x},${p.y}`).join(' '),fill,stroke,opacity,'stroke-width':1.5,'stroke-linejoin':'round'});}
function line(a,b,stroke='#ccc',width=2){return el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke,'stroke-width':width});}
function circle(cx,cy,z,r,from=0,to=2*Math.PI,steps=36){const p=[];for(let i=0;i<=steps;i++){const a=from+(to-from)*i/steps;p.push(iso(cx+r*Math.cos(a),cy+r*Math.sin(a),z));}return p;}
function cylinder(item){
 const {x,y,z,k}=item,r=roll.D/2,zt=z+roll.width,color=colors[k%colors.length];
 const start=-Math.PI/4,end=3*Math.PI/4;
 poly(circle(x,y,z,r),'#777981','#686871');
 poly([...circle(x,y,zt,r,start,end,26),...circle(x,y,z,r,end,start,26)],color,'#85858d');
 poly(circle(x,y,zt,r),color,'#c4c4cc');
 poly(circle(x,y,zt+.01,roll.core/2),'#303036','#ececf1');
 poly(circle(x,y,zt+.02,Math.max(.001,roll.core/2-1)),'#232329','#76767e');
}
function wallFade(){return phase(elapsed,FILL_END,HOLD);}
function boxBack(){const fade=wallFade();const p000=iso(0,0,0),p100=iso(box.L,0,0),p110=iso(box.L,box.W,0),p010=iso(0,box.W,0),p001=iso(0,0,box.H),p101=iso(box.L,0,box.H),p011=iso(0,box.W,box.H);
 poly([p000,p100,p110,p010],'#23232a','#707078');
 poly([p000,p100,p101,p001],'#97979e','#85858d',.3+.68*fade);
 poly([p000,p010,p011,p001],'#b0b0b6','#85858d',.3+.68*fade);
}
function boxFront(){const fade=wallFade();const p100=iso(box.L,0,0),p110=iso(box.L,box.W,0),p010=iso(0,box.W,0),p001=iso(0,0,box.H),p101=iso(box.L,0,box.H),p111=iso(box.L,box.W,box.H),p011=iso(0,box.W,box.H);
 poly([p010,p110,p111,p011],'#c3c3c9','#898992',.075+.905*fade);
 poly([p100,p110,p111,p101],'#b2b2b9','#898992',.075+.905*fade);
 line(p001,p101,'#c7c7cd',2.2);line(p101,p111,'#c7c7cd',2.2);line(p111,p011,'#c7c7cd',2.2);line(p011,p001,'#c7c7cd',2.2);
 line(p011,p010,'#888890',1.3);line(p111,p110,'#888890',1.3);line(p101,p100,'#888890',1.3);
}
// Los pares de solapas se mueven simultáneamente. Modelo geométrico
// SVG isométrico: plegado de 90° (vertical) a 0° (horizontal).
function phase(t,start,duration){return smooth((t-start)/duration);}
function flapPolys(progress, axis){
  if(progress<=0)return;
  const theta=(1-progress)*Math.PI/2;
  const c=Math.cos(theta),si=Math.sin(theta);
  const L=box.L,W=box.W,H=box.H;
  const eps=0.25;
  if(axis==='short'){
    // Solapas en los dos extremos cortos: x=0 y x=L.
    const reach=Math.min(L*.43,W*.48);
    for(const edge of [0,L]){
      const dir=edge===0?1:-1;
      const x2=edge+dir*reach*c;
      const z2=H+reach*si;
      const a=iso(edge,0,H+eps),b=iso(edge,W,H+eps);
      const d=iso(x2,0,z2+eps),e=iso(x2,W,z2+eps);
      poly([a,b,e,d],edge===0?'#97979e':'#b0b0b6','#d5d5d9',.98);
      line(d,e,'#ececef',1.1);
    }
  } else {
    // Solapas largas: llegan exactamente a la junta central.
    const reach=W/2;
    for(const edge of [0,W]){
      const dir=edge===0?1:-1;
      const y2=edge+dir*reach*c;
      const z2=H+reach*si;
      const a=iso(0,edge,H+2*eps),b=iso(L,edge,H+2*eps);
      const d=iso(0,y2,z2+2*eps),e=iso(L,y2,z2+2*eps);
      poly([a,b,e,d],edge===0?'#c3c3c9':'#b2b2b9','#eeeeee',.98);
      line(d,e,'#e1e1e5',1.1);
    }
  }
}
function drawTape(progress){
  if(progress<=0)return;
  const L=box.L,W=box.W,H=box.H+.9;
  const halfWidth=Math.min(Math.max(8,W*.055),W*.15);
  const x1=0,x2=L*progress;
  poly([iso(x1,W/2-halfWidth,H),iso(x2,W/2-halfWidth,H),
        iso(x2,W/2+halfWidth,H),iso(x1,W/2+halfWidth,H)],
       TAPE_COLOR,'#f15a64',.64);
  // Línea fina luminosa que hace reconocible la cinta roja semitransparente.
  line(iso(x1,W/2,H+.1),iso(x2,W/2,H+.1),'#ff8189',1.3);
}
function closureStatus(){
  if(!positions.length)return 'No cabe ningún rollo con estas medidas';
  if(complete)return 'Caja cerrada y precintada';
  if(!playing&&elapsed>0)return 'Animación pausada';
  if(elapsed<FILL_END)return playing?'Colocando rollos…':'Pulsa ▶ para iniciar la animación';
  if(elapsed<SHORT_START)return 'Las paredes adquieren el color de la caja…';
  if(elapsed<LONG_START)return 'Cerrando las dos solapas cortas…';
  if(elapsed<TAPE_START)return 'Cerrando las dos solapas largas…';
  return 'Aplicando cinta roja…';
}
function smooth(t){t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);}
function render(){
 svg.replaceChildren();boxBack();let settled=0;const visible=[];
 positions.forEach((p,i)=>{const t=(elapsed-i*STAGGER)/DURATION;if(t<=0)return;
 const start=box.H+Math.max(roll.width,box.H*.18),z=start+(p.z-start)*smooth(t);
 visible.push({...p,z});if(t>=1)settled++;
 });
 visible.sort((a,b)=>a.z-b.z||(a.x+a.y)-(b.x+b.y));
 visible.forEach(cylinder);boxFront();
 // Todo el cierre empieza ÚNICAMENTE después del llenado.
 const pShort=phase(elapsed,SHORT_START,SHORT_TIME);
 const pLong=phase(elapsed,LONG_START,LONG_TIME);
 if(elapsed>=SHORT_START)flapPolys(pShort,'short');
 if(elapsed>=LONG_START)flapPolys(pLong,'long');
 if(elapsed>=TAPE_START)drawTape(phase(elapsed,TAPE_START,TAPE_TIME));
 $('count').textContent=`${settled} / ${positions.length}`;
 $('progressFill').style.width=`${TOTAL?Math.min(100,100*elapsed/TOTAL):0}%`;
 $('status').textContent=closureStatus();
}
function syncIcon(){$('playIcon').innerHTML=playing?'<path d="M6 4h4v16H6z M14 4h4v16h-4z"/>':'<path d="M7 4 20 12 7 20Z"/>';
 $('play').setAttribute('aria-label',playing?'Pausar animación':'Reproducir animación');$('play').disabled=positions.length===0;}
function tick(ts){if(!playing)return;if(previous===null)previous=ts;elapsed+=Math.min(100,ts-previous)*velocidad;previous=ts;
 if(elapsed>=TOTAL){elapsed=TOTAL;playing=false;complete=true;raf=null;render();syncIcon();return;}
 render();raf=requestAnimationFrame(tick);
}
function reset(){if(raf!==null)cancelAnimationFrame(raf);raf=null;elapsed=0;previous=null;playing=false;complete=false;render();syncIcon();}
function toggle(){if(!positions.length)return;if(complete)reset();playing=!playing;previous=null;
 if(playing){raf=requestAnimationFrame(tick);}else{if(raf!==null)cancelAnimationFrame(raf);raf=null;render();}syncIcon();}
$('play').addEventListener('click',toggle);
$('reset').addEventListener('click',reset);
// Única fuente: resultados recibidos de Label Roll Calculator.
// Sin llamada inicial a calculate(): no hay recálculo de embalaje.
function cargarResultado(d){
 if(!d || ![d.L,d.A,d.H,d.D,d.Ar,d.Di,d.nx,d.ny,d.nz,d.total].every(Number.isFinite))return;
 const {L,A,H,D,Ar,Di,nx,ny,nz,total}=d;
 if([L,A,H,D,Ar,Di].some(v=>v<=0) || Di>=D ||
    [nx,ny,nz,total].some(v=>!Number.isSafeInteger(v)||v<0) ||
    total<1 || total>nx*ny*nz || nx*ny*nz>MAX_ROLLS || nx*D>L+1e-8 || ny*D>A+1e-8 || nz*Ar>H+1e-8)return;
 box={L,W:A,H};roll={D,width:Ar,core:Di};
 counts={nx,ny,nz};positions=[];
 // Coordenadas de los rollos recibidos: nx, ny y nz proceden de la calculadora.
 // La vista solo construye las posiciones gráficas.
 const mx=(L-nx*D)/2,my=(A-ny*D)/2;
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
   if(positions.length<total)positions.push({x:mx+D/2+i*D,y:my+D/2+j*D,z:k*Ar,k});
 }
 FILL_END=positions.length?(positions.length-1)*STAGGER+DURATION:0;
 SHORT_START=FILL_END+HOLD;LONG_START=SHORT_START+SHORT_TIME;
 TAPE_START=LONG_START+LONG_TIME;
 TOTAL=positions.length?TAPE_START+TAPE_TIME:0;
 fitView();
 $('dims').textContent=[L,A,H].map(fmt).join(' × ')+' mm';
 $('diam').textContent=fmt(D)+' mm';
 $('rollwidth').textContent=fmt(Ar)+' mm';
 $('mandril').textContent=fmt(Di)+' mm';
 $('distribution').textContent=`${nx} × ${ny} posiciones · ${Math.ceil(total/(nx*ny))} capas usadas`;
 $('viewKind').textContent=d.tipo==='ultima'?'ÚLTIMA CAJA':'CAPACIDAD MÁXIMA';
 $('usableHeight').textContent=fmt(H)+' mm (según calculadora)';
 $('legend').replaceChildren();
 for(let i=0;i<Math.ceil(total/(nx*ny));i++){
   const div=document.createElement('div');div.className='legend-item';
   const s=document.createElement('span');s.className='swatch';s.style.background=colors[i%colors.length];
   const t=document.createElement('span');t.textContent=`Capa ${i+1}`;div.append(s,t);$('legend').append(div);
 }
 reset();
 if(movimientoReducido.matches)verFinal();
}
function verFinal(){if(raf!==null)cancelAnimationFrame(raf);raf=null;playing=false;elapsed=TOTAL;complete=true;render();syncIcon();}
$('finish').addEventListener('click',verFinal);
$('speed').addEventListener('change',()=>{velocidad=Number($('speed').value);});
movimientoReducido.addEventListener('change',event=>{if(event.matches)verFinal();});
window.addEventListener('message',event=>{
 if(event.source!==window.parent)return;
 if(location.protocol!=='file:'&&event.origin!==location.origin)return;
 if(event.data?.tipo==='LABEL_ROLL_FOCUS_LAST')$('speed').focus();
 if(event.data?.tipo==='LABEL_ROLL_VISTA')cargarResultado(event.data.datos);
 if(event.data?.tipo==='LABEL_ROLL_STOP')reset();
});
$('status').textContent='Abre VISTA 3D desde la calculadora';

function avisarPadre(tipo){window.parent.postMessage({tipo},location.protocol==='file:'?'*':location.origin);}
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){event.preventDefault();avisarPadre('LABEL_ROLL_CLOSE');}
 const foco=document.activeElement,primero=$('play').disabled?$('reset'):$('play');
 if(event.key==='Tab'&&event.shiftKey&&foco===primero){event.preventDefault();avisarPadre('LABEL_ROLL_FOCUS_PREVIOUS');}
 if(event.key==='Tab'&&!event.shiftKey&&foco===$('speed')){event.preventDefault();avisarPadre('LABEL_ROLL_FOCUS_NEXT');}
});
