/* Funciones puras compartidas por la interfaz y las pruebas. Unidades: mm. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./cajas.js'));
 else root.LabelRollCalculos=factory(root.LabelRollCajas);
})(globalThis,function(CAJAS){
 'use strict';
 class ErrorDato extends Error{constructor(campo,mensaje){super(mensaje);this.campo=campo;}}
 function numero(texto,campo,{vacio=false,entero=false,cero=false}={}){
  const raw=String(texto??'').trim();
  if(!raw&&vacio)return 0;
  if(!raw||!/^\d+(?:[.,]\d+)?$/.test(raw))throw new ErrorDato(campo,'Introduce un número válido, sin separadores de miles.');
  const n=Number(raw.replace(',','.'));
  if(!Number.isFinite(n)||(cero?n<0:n<=0))throw new ErrorDato(campo,cero?'Introduce cero o una medida positiva.':'Introduce un valor mayor que cero.');
  if(entero&&!Number.isSafeInteger(n))throw new ErrorDato(campo,'Introduce un número entero de etiquetas dentro del rango permitido.');
  return n;
 }
 function mayorDivisor(total,maximo){
  if(maximo>=total)return total;
  const limite=Math.floor(Math.min(Math.sqrt(total),maximo));
  if(limite>1000000)throw new ErrorDato('total','Este pedido supera el límite de cálculo de rollos iguales. Selecciona «Aprovechar Ø máximo».');
  let mejor=1;
  for(let i=1;i<=limite;i++)if(total%i===0){if(i<=maximo)mejor=Math.max(mejor,i);const otro=total/i;if(otro<=maximo)mejor=Math.max(mejor,otro);}
  return mejor;
 }
 function diametro(Di,N,paso,e){return Math.sqrt(Di*Di+4*N*paso*e/Math.PI);}
 function calcularPedido(raw){
  const total=numero(raw.total,'total',{entero:true}),Av=numero(raw.avance,'avance'),S=numero(raw.separacion,'separacion',{vacio:true,cero:true}),e=numero(raw.espesor,'espesor'),Di=numero(raw.mandril,'mandril');
  const hayMax=String(raw.diamMax??'').trim()!=='';
  let etiquetas,maxFisico=null,Dmax=null;
  const modo=raw.modo==='capacidad'?'capacidad':'iguales';
  if(hayMax){
   Dmax=numero(raw.diamMax,'diamMax');
   if(Dmax<=Di)throw new ErrorDato('diamMax','El Ø máximo debe ser mayor que el mandril.');
   maxFisico=Math.floor(Math.PI*(Dmax*Dmax-Di*Di)/(4*(Av+S)*e));
   if(!Number.isSafeInteger(maxFisico)||maxFisico<1)throw new ErrorDato('diamMax','No se obtiene una capacidad válida. Comprueba diámetro, avance y espesor.');
   etiquetas=modo==='iguales'?mayorDivisor(total,Math.min(total,maxFisico)):Math.min(total,maxFisico);
  }else etiquetas=Math.min(total,numero(raw.etiquetasManual,'etiquetasManual',{entero:true}));
  const rollos=Math.ceil(total/etiquetas),ultimo=total-(rollos-1)*etiquetas;
  const D=diametro(Di,etiquetas,Av+S,e),metros=(Av+S)*etiquetas/1000,Dultimo=diametro(Di,ultimo,Av+S,e);
  if(![D,metros,Dultimo].every(Number.isFinite)||D<=Di||metros<=0)throw new ErrorDato('espesor','El resultado no es válido. Revisa las magnitudes de avance, mandril y espesor.');
  return {total,Av,S,e,Di,D,Dultimo,metros,etiquetas,rollos,ultimo,maxFisico,Dmax,modo:hayMax?modo:'manual',planCorrecto:ultimo>0&&ultimo<=etiquetas&&(rollos-1)*etiquetas+ultimo===total};
 }
 function calcularEspesor(raw){
  const D=numero(raw.muestraDiametro,'muestraDiametro'),N=numero(raw.muestraEtiquetas,'muestraEtiquetas',{entero:true}),Di=numero(raw.mandril,'mandril'),Av=numero(raw.avance,'avance'),S=numero(raw.separacion,'separacion',{vacio:true,cero:true});
  if(D<=Di)throw new ErrorDato('muestraDiametro','El diámetro medido debe superar el del mandril.');
  const e=Math.PI*(D*D-Di*Di)/(4*N*(Av+S));
  if(!Number.isFinite(e)||e<=0||Number(e.toFixed(8))<=0)throw new ErrorDato('muestraDiametro','No se puede obtener un espesor válido con estas medidas.');
  return e;
 }
 // Patrones regulares comprobables; no es una búsqueda del máximo absoluto.
 // Los centros sirven tanto al cálculo como al visor, sin reconstruir cuadrículas.
 function patronBase(L,A,D){
  const eps=1e-9,ajuste=n=>Math.max(0,Math.floor(n+eps));
  const nx=ajuste(L/D),ny=ajuste(A/D);
  let alternado=0;
  let mejor={nombre:'Cuadrícula',nx,ny,capa:nx*ny,tipo:'cuadricula'};
  for(const girado of [false,true])for(const fase of [0,1]){
   const ancho=girado?A:L,alto=girado?L:A,paso=D*Math.sqrt(3)/2;
   const filas=alto+eps<D?0:ajuste((alto-D)/paso)+1;
   const completas=ajuste(ancho/D),desplazadas=ajuste((ancho-D/2)/D);
   const pares=Math.ceil(filas/2),impares=Math.floor(filas/2);
   const capa=pares*(fase?desplazadas:completas)+impares*(fase?completas:desplazadas);
   alternado=Math.max(alternado,capa);
   if(capa>mejor.capa)mejor={nombre:'Alternado',tipo:'alternado',capa,filas,completas,desplazadas,fase,girado,paso,nx:completas,ny:filas};
  }
  // Abrir el paso horizontal permite acercar las filas sin solapar los rollos.
  for(const girado of [false,true])for(const fase of [0,1]){
   const ancho=girado?A:L,alto=girado?L:A,completas=ajuste(ancho/D);
   if(completas<2)continue;
   const pasoX=Math.min(D*Math.sqrt(3),(ancho-D)/(completas-1));
   if(pasoX<=D+eps)continue;
   const paso=Math.sqrt(Math.max(0,D*D-pasoX*pasoX/4));
   const filas=alto+eps<D?0:ajuste((alto-D)/paso)+1,desplazadas=completas-1;
   const capa=Math.ceil(filas/2)*(fase?desplazadas:completas)+Math.floor(filas/2)*(fase?completas:desplazadas);
   alternado=Math.max(alternado,capa);
   if(capa>mejor.capa)mejor={nombre:'Alternado',tipo:'alternado',capa,filas,completas,desplazadas,fase,girado,paso,pasoX,nx:completas,ny:filas};
  }
  if(!Number.isSafeInteger(mejor.capa))throw new ErrorDato('anchoRollo','La capacidad calculada es demasiado grande. Revisa el ancho y el diámetro del rollo.');
  const centros=[];
  if(mejor.capa>0&&mejor.capa<=300){
   if(mejor.tipo==='cuadricula'){
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)centros.push({x:D/2+i*D,y:D/2+j*D});
   }else for(let j=0;j<mejor.filas;j++){
    const desplazada=(j+mejor.fase)%2,n=desplazada?mejor.desplazadas:mejor.completas;
    for(let i=0;i<n;i++){
     const pasoX=mejor.pasoX||D;
     const x=D/2+i*pasoX+desplazada*pasoX/2,y=D/2+j*mejor.paso;
     centros.push(mejor.girado?{x:y,y:x}:{x,y});
    }
   }
   const minX=Math.min(...centros.map(p=>p.x)),maxX=Math.max(...centros.map(p=>p.x));
   const minY=Math.min(...centros.map(p=>p.y)),maxY=Math.max(...centros.map(p=>p.y));
   for(const p of centros){p.x+=(L-minX-maxX)/2;p.y+=(A-minY-maxY)/2;}
  }
  return {...mejor,centros,comparacion:{cuadricula:nx*ny,alternado}};
 }
 function optimizarCajas(D,Ar,rollos){
  if(![D,Ar].every(n=>Number.isFinite(n)&&n>0)||!Number.isSafeInteger(rollos)||rollos<=0)throw new ErrorDato('anchoRollo','Las dimensiones o la cantidad de rollos no son válidas.');
  return CAJAS.map(caja=>{
   const patron=patronBase(caja.L,caja.A,D),capas=Math.floor((caja.H+1e-9)/Ar),capacidad=patron.capa*capas;
   if(!Number.isSafeInteger(capacidad))throw new ErrorDato('anchoRollo','La capacidad calculada es demasiado grande. Revisa el ancho y el diámetro del rollo.');
   const cajas=capacidad?Math.ceil(rollos/capacidad):0,volumenTotal=cajas*caja.L*caja.A*caja.H;
   if(!Number.isFinite(volumenTotal))throw new ErrorDato('anchoRollo','El volumen calculado está fuera de rango.');
   return {...caja,patron,capas,capacidad,cajas,volumenTotal,ultimos:capacidad?rollos-(cajas-1)*capacidad:0,huecos:capacidad?cajas*capacidad-rollos:0,huecoSuperior:capacidad?caja.H-capas*Ar:0};
  });
 }
 function recomendar(opciones,criterio='cajas'){
  return opciones.filter(o=>o.capacidad>0).sort((a,b)=>criterio==='cajas'?(a.cajas-b.cajas||a.volumenTotal-b.volumenTotal||a.cortes-b.cortes):(a.volumenTotal-b.volumenTotal||a.cajas-b.cajas||b.capacidad-a.capacidad))[0]||null;
 }
 return Object.freeze({ErrorDato,numero,mayorDivisor,diametro,calcularPedido,calcularEspesor,patronBase,optimizarCajas,recomendar});
});
