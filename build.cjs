'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'dist');
const files=['index.html','base.css','app.css','polish.css','refine.css','site.js','motion.js','gallery.js','app.js','allergens.js','privacy.html','cookie.html','note-legali.html','legal.css'];
for(const file of [...files,'assets/logo.png','assets/video/walkthrough/v18-walkthrough.mp4','assets/video/walkthrough/mobile/v18-walkthrough.mp4']){
 if(!fs.existsSync(path.join(root,file)))throw new Error(`File mancante: ${file}`);
}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const file of files)fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
fs.writeFileSync(path.join(out,'BUILD.txt'),'Pizzeria Via Roma V18.0.0 — review package, 5 October 2026\n');
console.log('Build V18 completata: '+out);
