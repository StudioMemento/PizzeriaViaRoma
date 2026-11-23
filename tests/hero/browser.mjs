import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const modulePath=process.env.PLAYWRIGHT_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/index.mjs' : 'playwright');
const {chromium,webkit}=await import(modulePath);
const out=process.env.QA_DIR || 'test-results/hero';
await mkdir(out,{recursive:true});
const result=[];
for(const engine of (process.env.HERO_BROWSERS || 'chromium,webkit').split(',')) {
  const type=engine==='webkit'?webkit:chromium;
  const executablePath = engine === 'chromium'
    ? process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)
    : process.env.WEBKIT_PATH;
  const options = {headless:true, executablePath, ...(engine==='chromium' ? {args:['--enable-unsafe-swiftshader']} : {})};
  const browser=await type.launch(options);
  try {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/');
    await page.locator('.hero-logo[data-liquid-ready=true]').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    for(const [width,height] of [[1440,900],[390,844],[360,800],[844,390],[768,1024]]) {
      await page.setViewportSize({width,height});await page.waitForTimeout(220);
      const view=await page.evaluate(()=>{
        const h=document.querySelector('#home').getBoundingClientRect(),l=document.querySelector('.hero-logo').getBoundingClientRect(),p=document.querySelector('.hero-glimmer');
        return {center:[Number(p.dataset.centerX),Number(p.dataset.centerY)],expected:[l.left-h.left+l.width*425/851,l.top-h.top+l.height*424.5/851],overflow:document.documentElement.scrollWidth>window.innerWidth,font:getComputedStyle(document.querySelector('.hero-slogan')).fontFamily,weight:getComputedStyle(document.querySelector('.hero-slogan')).fontWeight,tints:[...document.querySelectorAll('.vr-edge-blur,.vr-edge-blur > div')].map(e=>getComputedStyle(e).backgroundColor),blurBoxes:[...document.querySelectorAll('.vr-edge-blur')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),langBlur:getComputedStyle(document.querySelector('.lang')).backdropFilter,scrollbar:getComputedStyle(document.documentElement).scrollbarWidth || getComputedStyle(document.documentElement,"::-webkit-scrollbar").display,scrollbarGutter:innerWidth-document.documentElement.clientWidth,progressWidth:getComputedStyle(document.querySelector('.vr-scroll-progress')).width,selection:getComputedStyle(document.body).userSelect || getComputedStyle(document.body).getPropertyValue("-webkit-user-select"),tileBlur:getComputedStyle(document.querySelector('.dock-tile')).backdropFilter,active:getComputedStyle(document.querySelector('a[aria-current] .dock-tile')).color};
      });
      assert.ok(Math.abs(view.center[0]-view.expected[0])<1 && Math.abs(view.center[1]-view.expected[1])<1);
      assert.equal(view.overflow,false);assert.equal(view.weight,'300');assert.ok(view.font.includes('Jost'));
      assert.ok(view.tints.every(c=>c==='rgba(0, 0, 0, 0)'));assert.equal(view.tileBlur,'blur(12px)');assert.equal(view.langBlur,'blur(12px)');assert.ok(view.blurBoxes.every(b=>b.width>0&&b.height>=96));assert.equal(view.scrollbarGutter,0);if(view.scrollbar)assert.equal(view.scrollbar,'none');assert.equal(view.progressWidth,'2px');assert.equal(view.selection,'none');assert.equal(view.active,'rgb(242, 213, 148)');
      await page.screenshot({path:`${out}/${engine}-${width}x${height}.png`});result.push({engine,width,height,...view});
    }
    await page.setViewportSize({width:1440,height:900});
    await page.locator('.hero-logo').hover();
    await page.waitForFunction(()=>document.querySelector('.hero-logo').dataset.gold==='true');
    await page.waitForTimeout(850);
    await page.screenshot({path:`${out}/${engine}-gold-hover.png`});
    await page.mouse.move(20,200);
    await page.waitForFunction(()=>document.querySelector('.hero-logo').dataset.gold==='false');
    const canceled=await page.evaluate(()=>{
      const el=document.querySelector('.hero-logo');
      return {
        menu:!el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2})),
        middle:!el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,button:1})),
        primary:!el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,button:0}))
      };
    });
    assert.deepEqual(canceled,{menu:true,middle:true,primary:false});
    await page.locator('.vr-dock a[href="#classiche"]').click();
    await page.waitForFunction(()=>document.querySelector('#home').dataset.fxState==='paused');
    await page.waitForFunction(()=>document.querySelector('.vr-dock a[href="#classiche"]').hasAttribute('aria-current'));
    await page.evaluate(()=>window.scrollTo({top:(document.documentElement.scrollHeight-innerHeight)/2,behavior:'instant'}));
    await page.waitForFunction(()=>Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('.vr-scroll-progress > span')).transform).m22-.5)<.01);
    await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
    await page.waitForFunction(()=>Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('.vr-scroll-progress > span')).transform).m22-1)<.01);
    if(engine==='chromium') {
      const cdp=await page.context().newCDPSession(page);
      await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'}]});
      assert.ok(await page.locator('.vr-edge-blur--bottom').evaluate(e=>e.getBoundingClientRect().height)>0,'Optical blur must stay visible with reduced-transparency preference');
      await cdp.detach();
    }
    await page.locator('.vr-dock a[href="#home"]').click();
    await page.waitForFunction(()=>document.querySelector('#home').dataset.fxState==='running');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.querySelector('#home').dataset.fxState==='reduced');
    assert.equal(await page.locator('.hero-logo').getAttribute('data-liquid-ready'),'false');
    assert.equal(await page.locator('#home .hero-slogan').evaluate(e=>getComputedStyle(e).animationName),'none');
    assert.equal(errors.length,0,errors.join('\n'));
    const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    const staticPage=await nojs.newPage();await staticPage.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/');
    assert.ok(await staticPage.locator('.hero-logo img').isVisible());assert.ok((await staticPage.locator('#carta').textContent()).includes('Margherita Classica'));await nojs.close();
  } finally { await browser.close(); }
}
await writeFile(`${out}/results.json`,JSON.stringify(result,null,2));
console.log('HERO_BROWSER_OK — geometry, type, untinted blur, translucent satin, hover gold, progress, input policy, reduced motion and static fallback.');
