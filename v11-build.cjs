"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=__dirname;
const out=path.join(root,"dist");
const required=["index.html","app.css","app.js","assets/logo.png","assets/flame.png","assets/video/walkthrough/v14a-walkthrough.mp4","assets/video/walkthrough/mobile/v14a-walkthrough.mp4"];
for(const relative of required){if(!fs.existsSync(path.join(root,relative)))throw new Error(`Missing required V14A file: ${relative}`)}
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const file of ["index.html","app.css","app.js"])fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.cpSync(path.join(root,"assets"),path.join(out,"assets"),{recursive:true,force:true});
fs.writeFileSync(path.join(out,"BUILD.txt"),"Pizzeria Via Roma V14A CLEAN\nMenu > Via Roma > Info > Call\nHome and info touch particles\nAligned 2048x487 paths\nDiscrete slider autoplay\nOne optimized scroll-scrub film with four checkpoints\nResponsive gallery dock and album grid\n");
console.log(`Pizzeria Via Roma V14A build complete: ${out}`);
