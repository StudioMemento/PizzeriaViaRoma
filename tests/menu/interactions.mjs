import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {transformWithOxc} from 'vite';
const jsx=(type,props)=>({type,props:props||{}});
async function source(path,bindings){
 const {code}=await transformWithOxc(await readFile(path,'utf8'),path,{jsx:{runtime:'automatic'}});
 const runnable=code.replace(/^import\s[\s\S]*?;\n/gm,'').replace(/^export\s*\{[\s\S]*?;\n/gm,'').replaceAll('export default ','').replaceAll('export ','');
 const scope=vm.createContext({_jsx:jsx,_jsxs:jsx,_Fragment:'fragment',console,...bindings});vm.runInContext(runnable,scope);return scope;
}
const clone=v=>JSON.parse(JSON.stringify(v));
const nodes=(node,predicate)=>{const out=[];const visit=n=>{if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(visit);return}if(typeof n.type==='function')return visit(n.type(n.props));if(predicate(n))out.push(n);visit(n.props.children)};visit(node);return out};
// Run the real navigation hook through mount, dependency changes, resize and cleanup.
const slots=[],effects=[],ios=[],ros=[],listeners=new Map(),classes=new Set();let cursor=0,dirty=false,language='it',state,reduced=false,targetId='',scrollRequest,hash='';
const same=(a,b)=>a&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
const hooks={useRef:v=>slots[cursor++]||=({current:v}),useState:init=>{const n=cursor++,s=slots[n]||={value:init};return [s.value,v=>{if(v!==s.value){s.value=v;dirty=true}}]},useEffect:(fn,deps)=>{const n=cursor++,old=slots[n];if(!same(old?.deps,deps)){slots[n]={deps,cleanup:old?.cleanup};effects.push({n,fn})}}};
let geometryReads=0;
const buttons=Array.from({length:8},(_,i)=>({get offsetLeft(){geometryReads++;return 2+i*100},get offsetWidth(){geometryReads++;return 94},style:{values:new Map(),setProperty(k,v){this.values.set(k,v)},removeProperty(k){this.values.delete(k)}}}));
const ids=['classiche','audaci','bianche','calzoni','cucina','stuzzicherie','dolci','bevande'];
const rail={clientWidth:320,scrollWidth:800,scrollLeft:0,children:buttons,querySelector:q=>buttons[ids.indexOf(q.match(/data-go="([^"]+)"/)[1])],scrollTo:v=>{scrollRequest=v;rail.scrollLeft=Math.max(0,Math.min(v.left,rail.scrollWidth-rail.clientWidth))},scrollBy:v=>{scrollRequest=v;rail.scrollLeft=Math.max(0,Math.min(rail.scrollLeft+v.left,rail.scrollWidth-rail.clientWidth))},addEventListener:(k,f)=>listeners.set('rail:'+k,f),removeEventListener:k=>listeners.delete('rail:'+k)};
const wrapper={classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k)}};
const win={innerHeight:844,addEventListener:(k,f)=>listeners.set('window:'+k,f),removeEventListener:k=>listeners.delete('window:'+k)};
const nav=await source('src/components/menu/useMenuNavigation.ts',{...hooks,window:win,matchMedia:()=>({matches:reduced}),history:{replaceState:(_a,_b,url)=>{hash=url}},document:{querySelectorAll:()=>ids.map(id=>({id:'cat-'+id})),getElementById:id=>({scrollIntoView:options=>{targetId=id;scrollRequest=options}})},IntersectionObserver:class{constructor(fn,options){this.fn=fn;this.options=options;this.observed=[];ios.push(this)}observe(el){this.observed.push(el)}disconnect(){this.disconnected=true}},ResizeObserver:class{constructor(fn){this.fn=fn;this.observed=[];ros.push(this)}observe(el){this.observed.push(el)}disconnect(){this.disconnected=true}}});
function commit(){let rounds=0;do{assert.ok(++rounds<5);cursor=0;dirty=false;state=nav.useMenuNavigation(language);state.chips.current=rail;state.wrap.current=wrapper;for(const {n,fn}of effects.splice(0)){slots[n].cleanup?.();slots[n].cleanup=fn()}}while(dirty)}
commit();assert.equal(state.active,'classiche');assert.equal(scrollRequest.left,0,'First pill must clamp to exactly zero');assert.equal(buttons[0].style.values.get('--chip-edge'),'none');
const cachedReads=geometryReads;
rail.scrollLeft=-18;listeners.get('rail:scroll')();assert.equal(buttons[0].style.values.get('--chip-edge'),'none','Safari overscroll must not fade the first pill');assert.ok(!classes.has('can-l'));rail.scrollLeft=0;
assert.equal(nav.chipEdgeMask(2,94,320,false,true),'none');assert.equal(nav.chipEdgeMask(60,94,320,true,true),'none');assert.ok(nav.chipEdgeMask(-15,94,320,true,true).includes('transparent 15px'));assert.equal(nav.chipEdgeMask(224,94,320,true,false),'none');
assert.equal(geometryReads,cachedReads,'Rail scrolling must reuse cached layout');assert.equal(ios[0].observed.length,8);assert.equal(ros[0].observed.length,9);assert.ok(classes.has('can-r'));assert.ok(!classes.has('can-l'));
state.nudge(1);listeners.get('rail:scroll')();assert.ok(classes.has('can-l'));assert.equal(scrollRequest.behavior,'smooth');
state.select('dolci');assert.equal(targetId,'cat-dolci');assert.equal(hash,'#cat-dolci');commit();assert.equal(state.active,'dolci');assert.ok(!classes.has('can-r'));
ios.at(-1).fn([{target:{id:'cat-audaci'},isIntersecting:true}]);commit();assert.equal(state.active,'audaci');
reduced=true;state.select('bevande');assert.equal(scrollRequest.behavior,'instant');commit();assert.equal(scrollRequest.left,480);assert.equal(buttons.at(-1).style.values.get('--chip-edge'),'none');
rail.scrollLeft=500;listeners.get('rail:scroll')();assert.equal(buttons.at(-1).style.values.get('--chip-edge'),'none');assert.ok(!classes.has('can-r'));rail.scrollLeft=480;
state.nudge(-1);assert.equal(scrollRequest.behavior,'instant');
rail.clientWidth=1000;listeners.get('window:resize')();ros.at(-1).fn();assert.ok(!classes.has('can-l'));assert.ok(!classes.has('can-r'));assert.ok(ios[0].disconnected);
language='de';commit();assert.equal(ros.at(-1).observed.length,9);assert.ok(ros.at(-2).disconnected);
slots.forEach(s=>s.cleanup?.());assert.equal(listeners.size,0);assert.ok(ros.at(-1).disconnected);assert.ok(ios.at(-1).disconnected);
// The measured font ratio follows the CSS content width without a resize callback.
let effect, width=320, scale=.25, ratio=3, tracking=.26, fitWrites=0, fontReady;
const fontSize=()=>width*scale;
const label={getBoundingClientRect:()=>({width:fontSize()*(ratio+tracking)})};
const heading={firstElementChild:label,style:{setProperty:(key,value)=>{
 assert.equal(key,'--menu-title-scale');scale=Number(value);assert.ok(Number.isFinite(scale));fitWrites++;
}}};
const title=await source('src/components/menu/MenuTitle.tsx',{
 useRef:()=>({current:heading}),useLayoutEffect:fn=>{effect=fn},
 getComputedStyle:()=>({fontSize:fontSize()+'px',letterSpacing:fontSize()*tracking+'px'}),
 document:{fonts:{ready:{then:fn=>{fontReady=fn}}}}
});
const fits=()=>assert.ok(Math.abs(fontSize()*ratio-width)<.001);
title.useTitleFit('Menù');let cleanup=effect();fits();
ratio=3.85;fontReady();fits();
const beforeResize=fitWrites;width=1200;fits();width=0;fits();width=960;fits();
assert.equal(fitWrites,beforeResize);
cleanup();const oldReady=fontReady;ratio=8;title.useTitleFit('Die Speisekarte');cleanup=effect();fits();
width=0;const lastWrites=fitWrites;fontReady();assert.equal(fitWrites,lastWrites);
cleanup();fontReady();oldReady();assert.equal(fitWrites,lastWrites);

// Execute item handlers and the real dialog render/cancel/click handlers.
const allergen=await source('src/data/allergen-info.ts',{});const getAllergenInfo=vm.runInContext('getAllergenInfo',allergen);
const data=JSON.parse(await readFile('src/data/menu.json','utf8')),allergens=JSON.parse(await readFile('src/data/allergens.json','utf8'));
let currentLang='it',opened,closed=0,modal;
const copy={allergens:'Allergeni',close:'Chiudi',allergenIncluded:'Presente in questo piatto',allergenNote:'Per maggiori info, chiedi al personale.',frozenTitle:'Prodotti surgelati',frozen:'Surgelato all’origine o in assenza del fresco.'};
const shared={getAllergenInfo,useDialog:()=>({open:v=>{opened=v},modal,close:()=>{closed++},update:()=>{}}),useI18n:()=>({language:currentLang,copy,ui:{legal_notes:'Note legali'}}),translateName:n=>n,translateDescription:n=>n,data};
const items=await source('src/components/Menu.tsx',shared);
const row=['Deliziosa','Bordo ripieno di ricotta, pomodoro, mozzarella di Bufala in cottura','13,00','1 · 7'];
let view=items.MenuItem({row});const name=nodes(view,n=>n.type==='button'&&n.props.className==='nome')[0];name.props.onClick();const fromName=clone(opened);nodes(view,n=>n.props.className==='allergen-trigger')[0].props.onClick();assert.deepEqual(clone(opened),fromName);assert.equal(opened.codes,'1 · 7');
const noCodes=items.ItemName({name:'Acqua'});assert.equal(noCodes.type,'button');noCodes.props.onClick();assert.equal(opened.name,'Acqua');assert.equal(items.ItemName({name:'Coperto'}).type,'span');
for(const drinkRow of [...data.ACQUA_BIBITE,...data.BOTTIGLIA.flatMap(group=>group[2])]) {
 const drink=items.MenuItem({row:drinkRow,showCodes:false});
 assert.equal(nodes(drink,n=>n.type==='button').length,1,'Drink name opens its product information');
 assert.equal(nodes(drink,n=>n.props.className==='allergen-trigger').length,0);
}
for(const rows of [data.SPINA.map(b=>({name:b[0],qualifier:b[1],prices:b.slice(2,5)})),data.VINI.map(v=>({name:v[0],prices:v.slice(1,4)}))]) {
 const table=items.DrinkTable({title:'Drinks',id:'drinks',sizes:['Small','Medium','Large'],rows});
 assert.equal(nodes(table,n=>n.type==='button').length,rows.length);
}
const dialogEffects=[];
let nativeOpen=false;const rootStyle={overflow:'auto'},dialogRef={current:{clientWidth:390,clientHeight:844,scrollHeight:844,scrollWidth:390,style:{setProperty(){}},dataset:{},showModal:()=>{nativeOpen=true},close:()=>{nativeOpen=false}}};
const dialog=await source('src/components/Dialogs.tsx',{...shared,allergens,LegalReader:()=>null,useRef:()=>dialogRef,useLayoutEffect:fn=>dialogEffects.push(fn),ResizeObserver:class{observe(){} disconnect(){}},document:{documentElement:{style:rootStyle},fonts:{ready:Promise.resolve()}},useDrag:()=>({}),Icon:()=>null,Photo:()=>null,wrap:(v,n)=>(v%n+n)%n});
for(const lang of ['it','en','de','fr']){
 currentLang=lang;modal={kind:'allergens',name:row[0],description:row[1],codes:'1 · 7 *'};view=dialog.Dialogs();
 const header=nodes(view,n=>n.props.className==='modal-header')[0];assert.equal(nodes(header,n=>n.type==='h2').length,1);assert.equal(nodes(header,n=>n.type==='p').length,0,'Redundant allergen eyebrow must be removed');
 const rows=nodes(view,n=>n.type==='li');assert.equal(rows.length,15);
 for(const row of rows){const children=row.props.children;assert.equal(children[0].props.className,'allergen-code');assert.equal(children[1].props.className,'allergen-text');assert.ok(nodes(children[1],n=>n.props.className==='allergen-name').length);assert.ok(nodes(children[1],n=>n.props.className==='allergen-description').length);}assert.equal(rows.filter(n=>n.props.className==='contains').length,3);
 const mounts=dialogEffects.splice(0).map(fn=>fn());assert.equal(nativeOpen,true);assert.equal(rootStyle.overflow,'hidden');
 for(const target of [{kind:'body'},{kind:'description'},{kind:'title'}]){const before=closed;view.props.onClick({target,currentTarget:{}});assert.equal(closed,before+1)}
 let stopped=false;nodes(view,n=>n.props.className==='modal-close')[0].props.onClick({stopPropagation:()=>{stopped=true}});assert.ok(stopped);
 let prevented=false;view.props.onCancel({preventDefault:()=>{prevented=true}});assert.ok(prevented);
 mounts.reverse().forEach(fn=>fn?.());assert.equal(nativeOpen,false);assert.equal(rootStyle.overflow,'auto');
}
const contentText = node => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node !== 'object') return String(node);
  if (Array.isArray(node)) return node.map(contentText).join('');
  if (typeof node.type === 'function') return contentText(node.type(node.props));
  return contentText(node.props.children);
};
const foods = [...Object.values(data.MENU).flat(), ...data.VARIANTI, ...data.CORNICE].filter(r => r[0] !== 'Coperto');
const beers = [...data.BOTTIGLIA.flatMap(group => group[2]), ...data.SPINA];
const drinks = [...data.ACQUA_BIBITE, ...beers, ...data.VINI];
assert.equal(beers.length, 10);
for (const beer of beers) assert.equal(beer.at(-1), '1', beer[0]);
for (const name of ['Marinara Classica', "Marinara d'Oro"]) assert.equal(foods.find(r => r[0] === name)[3], '1 - 7');
for (const lang of ['it','en','de','fr']) {
  currentLang = lang;
  for (const [name, codes] of [...foods.map(r => [r[0],r[3]]), ...drinks.map(r => [r[0],r.at(-1)])]) {
    modal = {kind:'allergens', name, codes};
    const view = dialog.Dialogs();
    const header = nodes(view,n => n.props.className === 'modal-header')[0];
    assert.equal(nodes(header,n => n.type === 'p').length, 0, name);
    const rows = nodes(view,n => n.type === 'li');
    assert.deepEqual(rows.slice(0,14).map(r => contentText(nodes(r,n => n.props.className === 'allergen-description')[0])), allergens[lang].map(row => row[1]));
    const expected = getAllergenInfo(codes);
    const active = rows.flatMap((r,i) => r.props.className === 'contains' ? [i+1] : []);
    assert.deepEqual(active, [...expected.codes,...(expected.frozen ? [15] : [])], name);
    dialogEffects.length = 0;
  }
}
modal={kind:'legal',slug:'privacy'};view=dialog.Dialogs();
const before=closed;view.props.onClick({target:{},currentTarget:{}});assert.equal(closed,before+1,'A click inside the legal reader closes it');
const outside={};view.props.onClick({target:outside,currentTarget:outside});assert.equal(closed,before+2);
console.log('MENU_INTERACTIONS_OK — fitted title/font loading/resize/translations; 8-category scrollspy, exact unclipped rail endpoints, pill-only edge masks, cached layout and reduced motion; item and number triggers, 15 allergen rows in four languages, any-click/Escape/close handlers, scroll-lock cleanup and legal-dialog isolation.');
