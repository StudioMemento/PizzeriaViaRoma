import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

// Exercise the real effect lifecycle with deterministic platform fakes.
// This checks behavior; it is not a substitute for browser / hardware rendering.
const refs = [], effects = [];
let hookIndex = 0;
const useRef = initial => refs[hookIndex++] ??= { current:initial };
const useEffect = callback => effects.push(callback);
const listeners = new Map();
const target = (name) => ({
  dataset:{}, addEventListener:(e,f)=>listeners.set(name+':'+e,f),
  removeEventListener:(e)=>listeners.delete(name+':'+e),
});
let reduced=false,hidden=false,dialog=false;
const raf=new Map(); let id=0,glimmerDraws=0,liquidDraws=0,disposeCount=0,glimmerSize,liquidSize,lastHover=0,pressAt;
let sectionBox={left:0,top:0,width:1440,height:900};
let logoBox={left:540,top:190,width:360,height:360};
const img={...target('image'),complete:true,naturalWidth:851};
const section={...target('hero'),getBoundingClientRect:()=>sectionBox};
const logo={...target('logo'),getBoundingClientRect:()=>logoBox,querySelector:()=>img};
const canvas=target('canvas');
const particles=target('particles');
let intersection,resize;
const doc={...target('document'),get hidden(){return hidden},fonts:{ready:Promise.resolve()}};
const media={...target('media'),get matches(){return reduced}};
const context={
  console,Math,HTMLDialogElement:class{},HTMLElement:class{},
  window:{...target('window'),innerWidth:1440,innerHeight:900,scrollY:0},document:doc,
  matchMedia:()=>media,
  requestAnimationFrame:(fn)=>{raf.set(++id,fn);return id},cancelAnimationFrame:i=>raf.delete(i),
  ResizeObserver:class{constructor(f){resize=f}observe(){}disconnect(){}},
  IntersectionObserver:class{constructor(f){intersection=f}observe(){}disconnect(){}},
  useRef, useEffect, useDialog:()=>({modal:dialog?{}:null}),
  createGlimmer:()=>({resize:g=>{glimmerSize=g},draw:()=>{glimmerDraws++},press:(x,y)=>{pressAt=[x,y]},release:()=>{pressAt=null}}),
  createLiquid:()=>({resize:s=>{liquidSize=s},draw:(_t,_x,_y,h)=>{liquidDraws++;lastHover=h},dispose:()=>{disposeCount++}}),
  HERO_PRESET:{mobileFps:30,desktopFps:40},
  LOGO_MARK:{centerX:425/851,centerY:424.5/851,radius:292/851},
};
vm.createContext(context);
let src=await readFile('src/components/hero/useHeroEffects.ts','utf8');
src=src.replace(/^import .*;\n/gm,'').replace('export function','function');
vm.runInContext(stripTypeScriptTypes(src),context);
const render = () => {
  hookIndex = 0; effects.length = 0;
  context.useHeroEffects({current:section},{current:logo},{current:particles},{current:canvas});
};
render(); effects[0]();
const cleanup=effects[1](); await Promise.resolve();
let clock=0;
const tick=(now)=>{clock=Math.max(clock+40,now);const jobs=[...raf.values()];raf.clear();jobs.forEach(fn=>fn(clock));};
tick(0);
assert.equal(glimmerSize.x,540+360*425/851);assert.equal(glimmerSize.y,190+360*424.5/851);assert.equal(liquidSize,360);
assert.equal(raf.size,0,'No continuous clock before hero enters viewport');
intersection([{isIntersecting:true}]);assert.equal(section.dataset.fxState,'running');assert.equal(raf.size,1);
tick(100);tick(140);
listeners.get('hero:pointerdown')({pointerType:'mouse',isPrimary:true,button:0,clientX:80,clientY:110,target:{closest:()=>null}});
assert.deepEqual(pressAt,[80,110]);listeners.get('window:pointerup')({pointerType:'mouse'});assert.equal(pressAt,null);
listeners.get('hero:pointerdown')({pointerType:'mouse',isPrimary:true,button:0,clientX:80,clientY:110,target:{closest:()=>({})}});
assert.equal(pressAt,null,'Links and buttons must keep their normal action');assert.ok(liquidDraws>0);assert.equal(logo.dataset.liquidReady,'true');
listeners.get('hero:pointermove')({pointerType:'mouse',clientX:720,clientY:370});
assert.equal(logo.dataset.gold,'true');
for(let t=180;t<=1180;t+=40)tick(t);
assert.ok(lastHover>.98,'Gold material should ease in while hovering the visible mark');
listeners.get('hero:pointermove')({pointerType:'mouse',clientX:545,clientY:195});
assert.equal(logo.dataset.gold,'false','Transparent PNG corner is not the logo hit area');
for(let t=1220;t<=2220;t+=40)tick(t);
assert.ok(lastHover<.02,'Gold should ease out');
let before=glimmerDraws;
intersection([{isIntersecting:false}]);tick(180);assert.equal(raf.size,0);assert.equal(glimmerDraws,before);assert.equal(section.dataset.fxState,'paused');
intersection([{isIntersecting:true}]);hidden=true;listeners.get('document:visibilitychange')();tick(220);assert.equal(raf.size,0);assert.equal(glimmerDraws,before);
hidden=false;listeners.get('document:visibilitychange')();tick(260);assert.ok(glimmerDraws>before);
reduced=true;listeners.get('media:change')();assert.equal(section.dataset.fxState,'reduced');assert.equal(logo.dataset.liquidReady,'false');assert.equal(raf.size,0);
sectionBox={left:0,top:-20,width:390,height:844};logoBox={left:35,top:160,width:320,height:320};resize();tick(300);
assert.equal(glimmerSize.x,35+320*425/851);assert.equal(glimmerSize.y,180+320*424.5/851);assert.equal(liquidSize,320);
reduced=false;listeners.get('media:change')();tick(340);assert.equal(logo.dataset.liquidReady,'true');
listeners.get('canvas:webglcontextlost')({preventDefault(){}});assert.equal(logo.dataset.liquidReady,'false');
const liquidBefore=liquidDraws;tick(380);assert.equal(liquidDraws,liquidBefore);
listeners.get('canvas:webglcontextrestored')();tick(420);assert.ok(liquidDraws>liquidBefore);
dialog=true;render();effects[0]();assert.equal(raf.size,0);assert.equal(section.dataset.fxState,'paused');
dialog=false;render();effects[0]();assert.equal(raf.size,1);
cleanup();assert.equal(raf.size,0);assert.equal(listeners.size,0);assert.equal(disposeCount,1);

// Render the actual particle algorithm into a recording canvas to independently
// measure exclusion geometry, alpha range, density and DPR limit at two sizes.
const geometrySrc=(await readFile('src/components/hero/logoGeometry.ts','utf8')).replace('export const','const');
const presetSrc=(await readFile('src/components/hero/preset.ts','utf8')).replace('export const','const');
let points=[];
const ctx={globalAlpha:1,clearRect(){points=[]},setTransform(){},fillRect(x,y,w,h){points.push({x:x+w/2,y:y+h/2,a:this.globalAlpha})},drawImage(sprite,x,y,w,h){points.push({x:x+w/2,y:y+h/2,a:this.globalAlpha})}};
const recording={dataset:{},getContext:()=>ctx};
const particleScope={Math,window:{devicePixelRatio:3},document:{createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})}};
vm.createContext(particleScope);
vm.runInContext(stripTypeScriptTypes(geometrySrc+'\n'+presetSrc+'\n'+(await readFile('src/components/hero/glimmer.ts','utf8')).replace(/^import .*;\n/gm,'').replace('export type','type').replace('export function','function')),particleScope);
const renderer=particleScope.createGlimmer(recording);
for(const g of [{width:1440,height:900,x:720,y:370,logoWidth:360},{width:390,height:844,x:195,y:340,logoWidth:320}]){
 renderer.resize(g);renderer.draw(0);assert.ok(points.filter(p=>p.a>.25).length>125, "Gold dust is too dim at this viewport");
 assert.equal(recording.width,Math.round(g.width*1.5));
 const clearRadius=Number(recording.dataset.hollowRadius);
 assert.ok(Math.abs(clearRadius-g.logoWidth*292/851)<.01,'Hollow must start at visible alpha perimeter');
 assert.ok(points.every(p=>Math.hypot(p.x-g.x,p.y-g.y)>=clearRadius),'Particle entered logo hollow');
 assert.ok(points.some(p=>Math.hypot(p.x-g.x,p.y-g.y)<clearRadius+10 && p.a>.02),'No visible particles emerge near the logo perimeter');
 assert.ok(points.every(p=>p.a>=0&&p.a<=1));
 const first=JSON.stringify(points);renderer.draw(2);assert.notEqual(JSON.stringify(points),first,'Particles are static');
}
const scene={width:1440,height:900,x:720,y:370,logoWidth:360};
function waveFrame(input) {
 const fx=particleScope.createGlimmer(recording);fx.resize(scene);fx.draw(0);
 if(input){fx.press(600,440);if(input==='tap')fx.release()}
 fx.draw(.12);fx.draw(.26);return points.map(p=>({...p}));
}
const idle=waveFrame(null),tap=waveFrame('tap'),hold=waveFrame('hold');
assert.deepEqual(tap.map(p=>p.x),idle.map(p=>p.x),'A tap must keep the field on course');
assert.ok(tap.some((p,i)=>p.a>idle[i].a+.12),'Tap must create a visible traveling light wave');
assert.notDeepEqual(hold.map(p=>p.x),idle.map(p=>p.x),'Holding must accelerate the outward travel');
assert.equal(vm.runInContext('HERO_PRESET.glimmer.speed',particleScope),.25,'Outward speed must stay unchanged');
console.log('HERO_RUNTIME_OK — logo-relative geometry, DPR cap, live particles, pause/resume, reduced motion, context recovery and complete cleanup. Browser rendering remains a separate check.');
