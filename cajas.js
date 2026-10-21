/* Catálogo único: medidas del catálogo existente, sin tolerancias añadidas. */
(function(root){
 const cajas=Object.freeze([
  {id:'campofr',nombre:'CampoFr',titulo:'CampoFr',L:290,A:290,H:260,cortes:0,imagen:0},
  {id:'n1',nombre:'N1',titulo:'N1',L:390,A:290,H:290,cortes:0,imagen:1},
  {id:'n1-250',nombre:'N1 · 1 corte',titulo:'N1',L:390,A:290,H:250,cortes:1,imagen:2},
  {id:'n1-200',nombre:'N1 · 2 cortes',titulo:'N1',L:390,A:290,H:190,cortes:2,imagen:3}
 ].map(Object.freeze));
 if(typeof module==='object'&&module.exports)module.exports=cajas;
 else root.LabelRollCajas=cajas;
})(globalThis);
