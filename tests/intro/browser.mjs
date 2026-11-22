import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const modulePath=process.env.PLAYWRIGHT_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/index.mjs' : 'playwright');
const {chromium}=await import(modulePath);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const url=process.env.TEST_URL || 'http://127.0.0.1:4174/';
const out=process.env.QA_DIR || 'test-results/intro';
await mkdir(out,{recursive:true});
const results=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 for(const [width,height] of [[3440,1440],[5120,1440],[1440,900],[390,844],[360,800],[320,568],[430,932],[667,375],[844,390]]){
  await page.setViewportSize({width,height});await page.mouse.move(2,2);
  await page.evaluate(()=>window.scrollTo({top:scrollY+document.querySelector('#cornicione').getBoundingClientRect().top,behavior:'instant'}));
  await page.waitForFunction(()=>[...document.querySelectorAll('#cornicione .crust-photo')].every(img=>img.complete&&img.naturalWidth>0));
  await page.waitForFunction(()=>document.querySelector('#cornicione').dataset.fxState==='running');
  await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
  const measure=await page.evaluate(()=>{
   const section=document.querySelector('#cornicione'),r=section.getBoundingClientRect();
   const font=el=>{const c=getComputedStyle(el);return [c.fontFamily,c.fontSize,c.fontWeight,c.lineHeight,c.letterSpacing,c.backgroundImage]};
   return {vh:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,section:r.toJSON(),heroFont:font(document.querySelector('#home h1')),titleFont:font(section.querySelector('h2')),cards:[...section.querySelectorAll('.crust-card')].map(el=>{const n=el.querySelector('h3').getBoundingClientRect(),p=el.querySelector('.crust-price').getBoundingClientRect(),c=el.getBoundingClientRect();return {card:c.toJSON(),name:n.toJSON(),price:p.toJSON(),radius:getComputedStyle(el).borderRadius,crop:getComputedStyle(el.querySelector('img')).objectPosition,shade:getComputedStyle(el.querySelector('.crust-card-shade')).backgroundImage}})};
  });
  assert.deepEqual(measure.titleFont,measure.heroFont,'Heading must match hero font and gradient');
  assert.equal(measure.overflow,false);assert.equal(measure.cards.length,3);
  if(width<768 || (height<=540&&width<1200))assert.ok(Math.abs(measure.section.height-height)<1,'Mobile intro exceeds one viewport');
  for(const c of measure.cards){
   assert.equal(c.radius,'0px');assert.ok(c.name.left>=c.card.left&&c.price.right<=c.card.right);
   assert.ok(c.name.right<=c.price.left+1,'Name and price overlap');assert.ok(Math.abs(c.name.bottom-c.price.bottom)<1,'Copy bottom alignment diverges');
   assert.ok(c.card.bottom<=measure.section.bottom-60,'Card collides with dock');
   assert.ok(!c.shade.includes('90deg'),'Shade runs sideways');
  }
  await page.screenshot({path:`${out}/cornicione-${width}x${height}.png`});results.push({width,height,...measure});
 }
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(()=>window.scrollTo({top:scrollY+document.querySelector('#cornicione').getBoundingClientRect().top,behavior:'instant'}));
 const shell=page.locator('.crust-card-shell').first();const rect=await shell.boundingBox();
 await page.mouse.move(rect.x+rect.width*.85,rect.y+rect.height*.25);
 await page.waitForFunction(()=>document.querySelector('.crust-card-shell').dataset.tiltActive==='true');
 assert.equal(await page.locator('.crust-card').first().evaluate(e=>getComputedStyle(e).getPropertyValue('--card-scale').trim()),'1.1');
 await page.screenshot({path:`${out}/holo-hover-desktop.png`});
 await page.mouse.move(2,2);
 await page.waitForFunction(()=>document.querySelector('.crust-card-shell').dataset.tiltActive==='false');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [3440,5120,7680]){
  await page.setViewportSize({width,height:1080});
  await page.evaluate(()=>window.scrollTo({top:scrollY+document.querySelector('#pizza-slider').getBoundingClientRect().top+innerHeight*.1,behavior:'instant'}));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-carousel-card]')].filter(el=>getComputedStyle(el).visibility==='visible').every(el=>el.querySelector('img').complete&&el.querySelector('img').naturalWidth>0));
  const row=await page.evaluate(()=>{const stage=document.querySelector('.vr-pizza-stage').getBoundingClientRect();const cards=[...document.querySelectorAll('[data-carousel-card]')].filter(el=>getComputedStyle(el).visibility==='visible').map(el=>el.getBoundingClientRect().toJSON()).sort((a,b)=>a.left-b.left);return {stage:stage.toJSON(),cards,count:document.querySelectorAll('[data-carousel-card]').length}});
  assert.ok(row.cards[0].left<row.stage.left&&row.cards.at(-1).right>row.stage.right,`Pizza belt at ${width}px spans ${row.cards[0].left} to ${row.cards.at(-1).right} inside stage ${row.stage.left} to ${row.stage.right}`);
  const focus=row.cards.findIndex(card=>Math.abs((card.left+card.right)/2-width/2)<1);
  assert.ok(focus>0 && focus<row.cards.length-1);
  for(let i=1;i<row.cards.length;i++) {
    const gap=row.cards[i].left-row.cards[i-1].right;
    const target=i===focus || i===focus+1 ? 104 : 16;
    assert.ok(Math.abs(gap-target)<1);
  }
  await page.screenshot({path:`${out}/pizza-${width}.png`});results.push({width,carousel:row});
 }
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const mobile=await touch.newPage();await mobile.goto(url);await mobile.evaluate(()=>window.scrollTo({top:scrollY+document.querySelector('#cornicione').getBoundingClientRect().top,behavior:'instant'}));
 const cdp=await touch.newCDPSession(mobile);
 const touchPoint=(x,y)=>({x,y,id:1,radiusX:3,radiusY:3,force:1});
 const sendTouch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
 for(const selector of ['#cornicione .crust-card-shell','#asporto .crust-card-shell']) {
  const card=mobile.locator(selector).first();
  await card.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  const box=await card.boundingBox(), x=box.x+box.width*.4, y=box.y+box.height*.5;
  const before=await mobile.evaluate(()=>scrollY);
  await sendTouch('touchStart',[touchPoint(x,y)]);
  await sendTouch('touchMove',[touchPoint(x+box.width*.3,y+3)]);
  await mobile.waitForFunction(sel=>document.querySelector(sel).dataset.tiltActive==='true',selector);
  assert.equal(await card.evaluate(el=>getComputedStyle(el.firstElementChild).getPropertyValue('--card-scale').trim()),'1.1');
  assert.ok(Math.abs((await mobile.evaluate(()=>scrollY))-before)<1);
  await sendTouch('touchEnd',[]);
  await mobile.waitForFunction(sel=>document.querySelector(sel).dataset.tiltActive==='false',selector);
  await sendTouch('touchStart',[touchPoint(x,y)]);
  for (let dy=20;dy<=100;dy+=20) await sendTouch('touchMove',[touchPoint(x+1,y-dy)]);
  await sendTouch('touchEnd',[]);
  await mobile.waitForFunction(old=>scrollY>old+10,before);
 }
 await mobile.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await mobile.locator('.crust-card').first().evaluate(e=>getComputedStyle(e).transform),'none');
 await touch.close();assert.deepEqual(errors,[]);
} finally {await browser.close();}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
console.log('INTRO_BROWSER_OK — ultrawide coverage, mobile one-viewport layout, exact heading styles, bottom copy, mouse/touch tilt, reduced motion and screenshots.');
