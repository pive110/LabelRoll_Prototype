const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'_site');
fs.mkdirSync(out,{recursive:true});
const files=['index.html','styles.css','menu.css','estetica.css','ayudas-continuar.js','bobina.js','desperdicio.js','continuar.js','datos-compartidos.js','nuevo-trabajo.js','cajas.js','calculos.js','cajas-selector.js','interfaz.js','visor-3d.html','visor.js','visor.css','service-worker.js','manifest.json','logo.svg','favicon.ico','icon-180.png','icon-192.png','icon-256.png','icon-512.png'];
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log(`Publicación preparada: ${files.length} archivos de la aplicación.`);
