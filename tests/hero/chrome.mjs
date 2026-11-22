import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

// Run the production scroll signal with independent geometry and event records.
const listeners=new Map(),raf=new Map();let frameId=0,resize,hidden=false,reads=0;
const target=name=>({addEventListener:(event,fn)=>listeners.set(name+':'+event,fn),removeEventListener:event=>listeners.delete(name+':'+event)});
const win={...target('window'),scrollY:0,innerHeight:800};
const root={scrollHeight:4800};
const tops={menu:1600,gallery:3000,dove:4200};
const doc={...target('document'),documentElement:root,body:{},fonts:{ready:Promise.resolve()},get hidden(){return hidden},getElementById:id=>({getBoundingClientRect:()=>{reads++;return {top:tops[id]-win.scrollY}}})};
const scope={window:win,document:doc,Set,Math,requestAnimationFrame:fn=>{raf.set(++frameId,fn);return frameId},cancelAnimationFrame:id=>raf.delete(id),ResizeObserver:class{constructor(fn){resize=fn}observe(){}disconnect(){}}};
vm.createContext(scope);
const navigation=await readFile('src/components/Navigation.tsx','utf8');
vm.runInContext(stripTypeScriptTypes(navigation.slice(navigation.indexOf('type PagePosition'),navigation.indexOf('function ScrollProgress'))),scope);
const ticks=()=>{const jobs=[...raf.values()];raf.clear();jobs.forEach(f=>f())};
const positions=[];const stop=scope.subscribePagePosition(p=>positions.push(p));
const stop2=scope.subscribePagePosition(()=>{});await Promise.resolve();ticks();
assert.equal(positions.at(-1).progress,0);assert.equal(positions.at(-1).active,'home');
assert.equal(raf.size,0,'No idle scroll RAF');
const initialReads=reads;
win.scrollY=2000;listeners.get('window:scroll')();ticks();
assert.equal(positions.at(-1).progress,.5);assert.equal(positions.at(-1).active,'menu');
assert.equal(reads,initialReads,'No per-scroll layout measurements');
win.scrollY=4000;listeners.get('window:scroll')();ticks();assert.equal(positions.at(-1).progress,1);
win.scrollY=4100;listeners.get('window:scroll')();ticks();assert.equal(positions.at(-1).progress,1,'Clamp elastic overscroll');
root.scrollHeight=8800;resize();ticks();assert.equal(positions.at(-1).progress,4100/8000,'Refresh document range on content resize');
hidden=true;listeners.get('document:visibilitychange')();assert.equal(raf.size,0);
hidden=false;listeners.get('document:visibilitychange')();ticks();
stop();assert.ok(listeners.has('window:scroll'),'Shared listener survives first subscriber cleanup');
stop2();assert.equal(listeners.size,0);assert.equal(raf.size,0);

// The input policy blocks exactly the requested browser gestures.
let setup;class Element{constructor(isEditable=false){this.isEditable=isEditable}closest(){return this.isEditable?this:null}}
const policyScope={useEffect:fn=>setup=fn,document:target('document'),Element};
vm.createContext(policyScope);
const input=(await readFile('src/components/hero/usePresentationInteractions.ts','utf8')).replace(/^import .*;\n/gm,'').replace('export function','function');
vm.runInContext(stripTypeScriptTypes(input),policyScope);policyScope.usePresentationInteractions();const cleanup=setup();
const dispatch=(name,button=0,isEditable=false)=>{let blocked=false;listeners.get('document:'+name)?.({button,target:new Element(isEditable),preventDefault(){blocked=true}});return blocked};
assert.equal(dispatch('mousedown',0),false);assert.equal(dispatch('mousedown',1),true);
assert.equal(dispatch('auxclick',1),true);assert.equal(dispatch('auxclick',2),false);
assert.equal(dispatch('contextmenu',2),true);assert.equal(dispatch('selectstart'),true);
assert.equal(dispatch('selectstart',0,true),false);assert.equal(dispatch('dragstart'),true);
for(const event of ['wheel','touchstart','touchmove','keydown','pointerdown','click'])assert.equal(listeners.has('document:'+event),false,`${event} must not be intercepted`);
cleanup();assert.equal(listeners.size,0);
console.log('HERO_CHROME_OK — accurate shared scroll progress, resize/overscroll, zero idle RAF, input restrictions, preserved primary/touch/keyboard gestures and cleanup.');
