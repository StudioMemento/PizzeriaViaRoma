// Font-metric estimate only: not a browser layout or physical-device test.
// Reads actual CSS, bundled text and Jost fonts. Browser checks remain in browser.mjs.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import postcss from 'postcss';
const modulePath=process.env.SQUARES_CANVAS_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas/index.js');
const {GlobalFonts,createCanvas}=await import(modulePath);
for(const weight of [300,400,500]) assert.ok(GlobalFonts.registerFromPath(`public/assets/fonts/jost-${weight}.woff2`,`Jost${weight}`));
const ctx=createCanvas(1,1).getContext('2d');
const css=postcss.parse(await readFile('src/styles/menu.css','utf8'));
const data=JSON.parse(await readFile('src/data/menu.json','utf8'));
const allergens=JSON.parse(await readFile('src/data/allergens.json','utf8'));
const translations=JSON.parse(await readFile('src/data/translations.json','utf8'));
const source=await readFile('src/i18n.tsx','utf8');
const additions=vm.runInNewContext(source.slice(source.indexOf('const additions ='),source.indexOf('const LanguageContext'))+';additions');
const names=[...Object.values(data.MENU).flat(),...data.VARIANTI,...data.CORNICE].map(row=>row[0]).filter(n=>n!=='Coperto');
function styles(selector,width,height){
 const values={};
 css.walkRules(rule=>{
  if(!rule.selectors.includes(selector))return;
  for(let p=rule.parent;p;p=p.parent){
   if(p.type!=='atrule')continue;
   if(p.name!=='media'||!/\((?:min|max)-(?:width|height):/.test(p.params))return;
   for(const [,limit,axis,n]of p.params.matchAll(/\((min|max)-(width|height):\s*(\d+)px\)/g)){
    const value=axis==='width'?width:height;
    if(limit==='min'?value<+n:value>+n)return;
   }
  }
  rule.walkDecls(d=>values[d.prop]=d.value);
 });return values;
}
function pixels(value,width,height){
 if(value.startsWith('clamp')){const n=[...value.matchAll(/[\d.]+/g)].map(m=>+m[0]);return Math.max(n[0],Math.min((value.includes('dvh')?height:width)*n[1]/100,n[2]));}
 return parseFloat(value);
}
function lines(text,font,width,weight=300,tracking=0){
 if(text.includes('\n'))return text.split('\n').reduce((n,line)=>n+lines(line,font,width,weight,tracking),0);
 ctx.font=`${font}px Jost${weight}`;
 const measure=s=>ctx.measureText(s).width+s.length*tracking;
 let count=1,line='';
 for(const word of text.split(/ +/)){
  const candidate=line?`${line} ${word}`:word;
  if(measure(candidate)<=width){line=candidate;continue;}
  if(line){count++;line='';}
  for(const character of word){if(line&&measure(line+character)>width){count++;line='';}line+=character;}
 }
 return count;
}
// A native browser balances whole rows across columns. The estimator models
// the same reading order using the tallest column of each possible split.
function balancedHeight(items, columns, gap) {
 if (columns === 1) return items.reduce((sum, item) => sum + item.height, 0) + (items.length - 1) * gap;
 let best = Infinity;
 for (let cut = 1; cut <= items.length - columns + 1; cut++)
  best = Math.min(best, Math.max(balancedHeight(items.slice(0,cut), 1, gap), balancedHeight(items.slice(cut), columns-1, gap)));
 return best;
}
function estimate(width,height,language){
 const base='.vr-dialog.modal-allergens',title=styles('.allergen-panel .modal-header h2',width,height);
 const note=styles('.allergen-note',width,height);
 const translated=names.map(n=>language==='it'?n:translations.NAME_TR[n]?.[['en','de','fr'].indexOf(language)]||n);
 const columns=height<=560 ? (width>=460&&height<=340?[3,2]:[2,1]) : [1,2];
 let best;
 for(const count of columns)for(const density of ['roomy','regular','compact','minimum']){
  const variant='.modal-allergens[data-density='+density+']';
  const props={...styles(base,width,height),...styles(variant,width,height)};
  const row={...styles('.allergen-list li',width,height),...styles(variant+' .allergen-list li',width,height)};
  const desc={...styles('.allergen-description',width,height),...styles(variant+' .allergen-description',width,height)};
  const list={...styles('.allergen-list',width,height),...styles(variant+' .allergen-list',width,height)};
  const value=key=>pixels(props[key],width,height);
  const font=value('--name'),descFont=value('--detail'),titleFont=value('--title'),inset=value('--inset'),available=Math.min(760,width-2*inset);
  const textWidth=(available-(count-1)*parseFloat(list['column-gap']))/count-font*(parseFloat(row['grid-template-columns'])+parseFloat(row['column-gap']));
  const rows=[...allergens[language],[additions[language].frozenTitle,additions[language].frozen]].map(([name,description])=>{
   const text=language==='it'?description.replace(' noci del Brasile','\nnoci\u00a0del\u00a0Brasile'):description;
   const nameLines=lines(name.toUpperCase(),font,textWidth,500,font*.065),descLines=lines(text,descFont,textWidth);
   return {name,nameLines,descLines,height:nameLines*font*parseFloat(row['line-height'])+parseFloat(desc['margin-top'])+descLines*descFont*parseFloat(desc['line-height'])};
  });
  const listHeight=balancedHeight(rows,count,value('--row-gap'));
  const worstTitle=translated.map(name=>({name,lines:lines(name,titleFont,available-48,400)})).sort((a,b)=>b.lines-a.lines)[0];
  const titleHeight=Math.max(32,worstTitle.lines*titleFont*parseFloat(title['line-height']));
  const noteHeight=lines(additions[language].allergenNote,descFont,available)*descFont*parseFloat(note['line-height']);
  const required=titleHeight+listHeight+noteHeight+2*value('--section-gap')+2*inset;
  assert.ok(Number.isFinite(required),'Unresolved CSS length in dialog estimate');
  const result={width,height,language,density,font,descriptionFont:descFont,columns:count,worstTitle,estimatedHeight:Math.ceil(required),estimatedFreeSpace:Math.floor(height-required),rows};
  if(result.estimatedFreeSpace>=0)return result;
  if(!best||result.estimatedFreeSpace>best.estimatedFreeSpace)best=result;
 }
 return best;
}
assert.ok(lines('A short line',14,300)<lines('A short line',14,20),'Wrapping control must detect narrow text');
const results=[];
for(const [w,h]of [[320,480],[320,568],[360,640],[375,667],[390,700],[320,721],[375,736],[390,780],[390,844],[430,932],[768,1024],[1440,900],[3440,1440],[568,280],[568,320],[844,390]])for(const lang of ['it','en','de','fr'])results.push(estimate(w,h,lang));
await mkdir('test-results/menu',{recursive:true});
await writeFile('test-results/menu/dialog-font-estimate.json',JSON.stringify({scope:'Font-metric estimate with real Jost fonts and content; excludes browser layout, font rasterizer differences, safe-area insets and enlarged text. Not proof of no-scroll on a device.',results},null,2));
console.table(results.map(({rows,...result})=>result));
const overflows=results.filter(r=>r.estimatedFreeSpace<0);
if(overflows.length){console.log('Estimated overflow cases:',overflows.map(({width,height,language,estimatedFreeSpace})=>({width,height,language,estimatedFreeSpace})));process.exitCode=1;}
else console.log('DIALOG_ESTIMATE_OK — all modeled viewports fit at default font sizes; confirm in a browser.');
