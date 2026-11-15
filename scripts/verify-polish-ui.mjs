import {setup,pageFor,position,assert,noOverflow,drag} from "./browser-helpers.mjs";
import {writeFile} from "node:fs/promises";
const qa=await setup();
const evidence={browser:qa.browser.version(),progress:[],touch:[],reviews:[],contacts:[]};
try {
  const {page,problems}=await pageFor(qa.browser,qa.url);
  for(const fraction of [0,.5,1]) {
    await page.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:"instant"}),fraction);
    await page.waitForTimeout(120);
    const metric=await page.locator('.scroll-progress').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {progress:Number(e.dataset.progress),width:r.width,height:r.height,right:r.right,viewport:innerWidth,pointer:s.pointerEvents};});
    assert.equal(metric.width,2);assert.equal(metric.right,1440);assert.ok(metric.height>=23.9);assert.equal(metric.pointer,'none');assert.ok(Math.abs(metric.progress-fraction)<.001);
    evidence.progress.push(metric);
    await page.screenshot({path:`test-results/progress-${fraction}.png`});
  }
  await position(page,'#home',0);
  const hero=await page.locator('.hero-cta').evaluate(e=>{const s=getComputedStyle(e);return {radius:s.borderRadius,bg:s.backgroundColor,border:s.borderWidth,svg:e.querySelectorAll('svg').length};});
  assert.deepEqual(hero,{radius:'0px',bg:'rgba(0, 0, 0, 0)',border:'0px',svg:1});
  const tiles=await page.locator('.dock-tile').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};}));
  assert.equal(tiles.length,4);for(let i=1;i<tiles.length;i++)assert.ok(tiles[i].left>tiles[i-1].right+8);
  for(const id of ['esterno','bancone','sala_sinistra','sala_destra','via_roma']) {
    await position(page,`#album-${id}`);
    const geometry=await page.locator(`#album-${id}`).evaluate(el=>{
      const center=el.querySelector('.is-current').getBoundingClientRect();
      return {center:center.width,sides:[...el.querySelectorAll('.depth-1')].map(e=>({width:e.getBoundingClientRect().width,mask:getComputedStyle(e).maskImage,opacity:getComputedStyle(e).opacity})),images:[...el.querySelectorAll('.gallery-card img')].map(e=>e.getAttribute('src'))};
    });
    assert.ok(geometry.center>1440*.55);
    assert.equal(geometry.sides.length,2);
    for(const side of geometry.sides){assert.ok(side.width<geometry.center*.85);assert.notEqual(side.mask,'none');assert.ok(Number(side.opacity)<.9);}
    const stage=page.locator(`#album-${id} .gallery-stage`);
    await stage.focus();await page.keyboard.press('ArrowRight');assert.equal(await stage.getAttribute('data-index'),'1');
    await page.keyboard.press('ArrowLeft');assert.equal(await stage.getAttribute('data-index'),'0');
  }
  for(const language of ['it','en','de','fr']) {
    await page.locator(`[data-lang="${language}"]`).click();
    const words=await page.locator('#customer,#social').allTextContents();
    assert.doesNotMatch(words.join(' '),/condivid|taggaci|inviaci|tag us|share|partagez|envoyez|markiert uns|teilen|schickt uns/i);
    await noOverflow(page);
  }
  await page.locator('[data-lang="it"]').click();
  await position(page,'.reviews-zone',85);
  const track=page.locator('.review-track');
  assert.equal(await page.locator('.review-runner .rev').count(),4);
  const start=await track.evaluate(e=>e.scrollLeft);await page.waitForTimeout(400);assert.equal(await track.evaluate(e=>e.scrollLeft),start);
  for(let i=1;i<=3 && !await page.locator('.review-controls button').last().isDisabled();i++){
    await page.locator('.review-controls button').last().click();await page.waitForTimeout(650);
    const left=await track.evaluate(e=>e.scrollLeft);assert.ok(left>start);evidence.reviews.push(left);
  }
  assert.equal(evidence.reviews.length,2,"Desktop reader should show two reviews at a time");
  assert.equal(await page.locator('.review-controls button').last().isDisabled(),true);
  await track.focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(600);
  assert.ok(await track.evaluate(e=>e.scrollLeft)<evidence.reviews.at(-1));
  await track.evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));
  await drag(page,'.review-track');await page.waitForTimeout(600);
  assert.ok(await track.evaluate(e=>e.scrollLeft)>300,'Desktop review drag did not advance');
  await position(page,'#dove',65);
  const card=page.locator('.contacts-bento .magic-bento__card').nth(1);
  await card.hover({position:{x:45,y:45}});await page.waitForTimeout(500);
  const glow=await card.evaluate(e=>({x:e.style.getPropertyValue('--mb-x'),y:e.style.getPropertyValue('--mb-y'),hot:Number(e.style.getPropertyValue('--mb-hot')),radius:getComputedStyle(e).borderRadius,spot:getComputedStyle(e).getPropertyValue('--mb-spot-size').trim()}));
  assert.equal(glow.radius,'0px');assert.equal(glow.spot,'200px');assert.ok(glow.hot>.5);assert.ok(Math.abs(parseFloat(glow.x)-45)<2);evidence.glow=glow;
  await page.screenshot({path:'test-results/contacts-glow.png'});
  for(const width of [320,390,768,900,1100,1440,1920]) {
    await page.setViewportSize({width,height:900});
    for(const language of ['it','en','de','fr']) {
      await page.locator(`[data-lang="${language}"]`).click();
      await position(page,'#dove',65);
      await noOverflow(page);
      const clipped=await page.locator('.contacts-bento .visit-copy').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));
      assert.deepEqual(clipped,[],`Clipped contacts: ${width}px ${language}`);
    }
    evidence.contacts.push(width);
  }
  assert.deepEqual(problems,[]);await page.close();
  const mobile=await pageFor(qa.browser,qa.url,{width:390,height:844},{hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const cdp=await mobile.page.context().newCDPSession(mobile.page);
  async function swipe(selector){
    const rect=await mobile.page.locator(selector).boundingBox();
    const x=Math.min(290,rect.x+rect.width*.65),y=rect.y+Math.min(rect.height*.45,110);
    assert.ok(y>65 && y<740,`Touch target outside usable viewport: ${selector}`);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-16*i,y:y+1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await mobile.page.waitForTimeout(150);
  }
  for(const id of ['esterno','bancone','sala_sinistra','sala_destra','via_roma']) {
    await position(mobile.page,`#album-${id}`,95);
    await swipe(`#album-${id} .is-current`);
    assert.equal(await mobile.page.locator(`#album-${id} .gallery-stage`).getAttribute('data-index'),'1');
    assert.equal(await mobile.page.locator('dialog').count(),0);
    evidence.touch.push(id);
  }
  await position(mobile.page,'#forno',160);await swipe('#forno .mid .shot');
  assert.equal(await mobile.page.locator('#forno .mid').getAttribute('data-forno-index'),'1');evidence.touch.push('pizza');
  await position(mobile.page,'#catshow',130);await swipe('#showrail .is-active .preview-window');
  assert.equal(await mobile.page.locator('#showrail .is-active').getAttribute('data-cat'),'audaci');evidence.touch.push('categories');
  assert.ok(!(await mobile.page.evaluate(()=>location.hash)).startsWith('#cat-'));
  await position(mobile.page,'.review-track',170);await swipe('.review-track');
  assert.ok(await mobile.page.locator('.review-track').evaluate(e=>e.scrollLeft)>100);evidence.touch.push('reviews');
  assert.deepEqual(mobile.problems,[]);
  await writeFile('test-results/polish-evidence.json',JSON.stringify(evidence,null,2));
  console.log('POLISH_UI_OK — visible 2px progress at top/middle/end; five galleries; four languages; manual reviews; localized square Bento; contacts at 7 widths × 4 languages; eight touch targets.');
} finally { await qa.close(); }
