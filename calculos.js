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
 function optimizarCajas(D,Ar,rollos){
  if(![D,Ar].every(n=>Number.isFinite(n)&&n>0)||!Number.isSafeInteger(rollos)||rollos<=0)throw new ErrorDato('anchoRollo','Las dimensiones o la cantidad de rollos no son válidas.');
  return CAJAS.map(caja=>{
   const nx=Math.floor((caja.L+1e-9)/D),ny=Math.floor((caja.A+1e-9)/D),capas=Math.floor((caja.H+1e-9)/Ar),capa=nx*ny,capacidad=capa*capas;
   if(!Number.isSafeInteger(capacidad))throw new ErrorDato('anchoRollo','La capacidad calculada es demasiado grande. Revisa el ancho y el diámetro del rollo.');
   const cajas=capacidad?Math.ceil(rollos/capacidad):0,volumenTotal=cajas*caja.L*caja.A*caja.H;
   if(!Number.isFinite(volumenTotal))throw new ErrorDato('anchoRollo','El volumen calculado está fuera de rango.');
   return {...caja,patron:{nombre:'Cuadrícula',nx,ny,capa},capas,capacidad,cajas,volumenTotal,ultimos:capacidad?rollos-(cajas-1)*capacidad:0,huecos:capacidad?cajas*capacidad-rollos:0,huecoSuperior:capacidad?caja.H-capas*Ar:0};
  });
 }
 function recomendar(opciones,criterio='volumen'){
  return opciones.filter(o=>o.capacidad>0).sort((a,b)=>criterio==='cajas'?(a.cajas-b.cajas||a.volumenTotal-b.volumenTotal||a.cortes-b.cortes):(a.volumenTotal-b.volumenTotal||a.cajas-b.cajas||b.capacidad-a.capacidad))[0]||null;
 }
 return Object.freeze({ErrorDato,numero,mayorDivisor,diametro,calcularPedido,calcularEspesor,optimizarCajas,recomendar});
});
