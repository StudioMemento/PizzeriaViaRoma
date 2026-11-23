import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const modulePath=process.env.PLAYWRIGHT_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/index.mjs' : 'playwright');
const {chromium}=await import(modulePath);
const browser=await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
const url=process.env.TEST_URL || 'http://127.0.0.1:4175/';
const out=process.env.QA_DIR || 'test-results/menu';
await mkdir(out,{recursive:true});
const results=[],errors=[];

async function waitForFieldState(page, expected) {
  // Reduced-motion and paused fields intentionally stop requesting animation frames.
  await page.waitForFunction(
    state => document.querySelector('.menu-side-viewport')?.dataset.state === state,
    expected,
    { polling: 80 },
  );
}

async function checkSectionPolish(page, touch) {
  const layout = await page.evaluate(() => {
    const rect = el => el.getBoundingClientRect();
    const gap = (above, below) => rect(below).top - rect(above).bottom;
    const oven = document.querySelector('#pizza-slider');
    const atmosphere = document.querySelector('.menu-atmosphere');
    const edges = [oven, atmosphere, document.querySelector('.menu-side-background')];
    const sections = [...document.querySelectorAll('#carta > .mcat')];
    const drinks = document.querySelector('#bevande .mcat-body');
    const bottles = drinks.querySelector(':scope > .groupline');
    const producers = [...drinks.querySelectorAll('.drink-bottle-group')];
    const [draught, wines] = drinks.querySelectorAll('.drink-table');
    const leaders = [...oven.querySelectorAll('.pizza-arrow')];
    return {
      strokes: [getComputedStyle(oven).borderTop, getComputedStyle(oven).borderBottom, getComputedStyle(atmosphere).borderBottom],
      sectionRules: [oven, atmosphere].map(el => {
        const rule = getComputedStyle(el, '::after');
        return [rule.height, rule.width, rule.backgroundImage, rule.bottom, rule.pointerEvents];
      }),
      overlays: edges.flatMap(el => ['::before', '::after'].map(p => getComputedStyle(el, p).backgroundImage)),
      headings: sections.slice(-3).map(el => el.querySelector('h3').textContent),
      categoryGaps: sections.slice(1).map((el, i) => gap(sections[i].querySelector('.mcat-body'), el.querySelector('.mcat-head'))),
      groupGaps: [gap(bottles.previousElementSibling, bottles), gap(producers.at(-1), draught), gap(draught, wines)],
      breweryGap: gap(producers[0], producers[1]),
      controls: leaders.map(button => ({width: rect(button).width, height: rect(button).height, glyphHeight: rect(button.querySelector('path')).height})),
    };
  });
  assert.ok(layout.strokes.slice(0,2).every(edge => edge.startsWith('0px none')));
  assert.ok(layout.strokes[2].startsWith('0px none'));
  assert.deepEqual(layout.sectionRules[1], layout.sectionRules[0]);
  assert.ok(layout.overlays.slice(0,2).every(background => background.includes('linear-gradient')));
  assert.ok([2,4,5].every(i => layout.overlays[i] === 'none'));
  assert.deepEqual(layout.headings, ['Le stuzzicherie', 'I dolci', 'Le bevande']);
  assert.ok(layout.categoryGaps.every(gap => gap >= 115));
  assert.ok(layout.groupGaps.every(gap => gap >= 55) && layout.breweryGap >= 37);
  assert.ok(layout.controls.every(b => b.width >= 48 && b.height >= 44 && b.glyphHeight >= 21.5));

  await page.emulateMedia({reducedMotion: 'reduce'});
  const oven = page.locator('#pizza-slider');
  await oven.locator('.pizza-controls').evaluate(el => scrollTo({top: scrollY + el.getBoundingClientRect().top - innerHeight * .55, behavior: 'instant'}));
  const stage = oven.locator('#forno');
  assert.equal(await oven.locator('.pizza-dot').count(),0);
  const arrows = oven.locator('.pizza-arrow');
  const waitForActive = index => oven.locator(`.pizza-caption:nth-child(${index + 1})[aria-hidden="false"]`).waitFor();
  const activate = arrow => touch ? arrow.tap({position:{x:5,y:12}}) : arrow.click({position:{x:5,y:12}});
  await stage.focus(); await page.keyboard.press('Home');
  await waitForActive(0);
  await activate(arrows.first());
  await waitForActive(39);
  await activate(arrows.last());
  await waitForActive(0);
  await arrows.last().focus();
  await page.keyboard.press('Enter');
  await waitForActive(1);
  await arrows.first().focus();
  await page.keyboard.press('Space');
  await waitForActive(0);
  return layout;
}

function titleFitsGutters() {
  const header = document.querySelector('.menu-head');
  const word = header.querySelector('h2 span');
  const frame = header.getBoundingClientRect();
  const label = word.getBoundingClientRect();
  // The component fits to clientWidth, which rounds a fractional gutter to a CSS pixel.
  const target = word.parentElement.clientWidth;
  const edgeTolerance = 1 + Math.abs(target - frame.width);
  const tracking = parseFloat(getComputedStyle(word).letterSpacing);
  return Math.abs(label.width - tracking - target) < 1 &&
    Math.abs(label.left - frame.left) < edgeTolerance &&
    Math.abs(label.right - tracking - frame.right) < edgeTolerance;
}
try {
 for(const [width,height] of [[320,480],[320,568],[320,721],[320,861],[360,640],[375,667],[375,736],[390,700],[390,780],[390,844],[430,932],[480,320],[568,280],[568,320],[844,390],[768,1024],[1440,900],[3440,1440]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768||height<=520,isMobile:width<768||height<=520});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>window.scrollTo({top:scrollY+document.querySelector('#menu').getBoundingClientRect().top-100,behavior:'instant'}));
  await page.waitForFunction(titleFitsGutters);
  const heading=await page.locator('.menu-head').evaluate(el=>({text:el.textContent.trim(),children:el.children.length,rect:el.getBoundingClientRect().toJSON(),title:el.querySelector('span').getBoundingClientRect().toJSON(),tracking:parseFloat(getComputedStyle(el.querySelector('span')).letterSpacing),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(heading.text,'Menù');assert.equal(heading.children,1);assert.equal(heading.overflow,false);assert.ok(heading.tracking>12);assert.ok(await page.evaluate(titleFitsGutters));
  await page.screenshot({path:`${out}/title-${width}x${height}.png`});
  for(const lang of ['de','fr','en','it']){
   await page.locator('.lang button').filter({hasText:new RegExp(`^${lang.toUpperCase()}$`)}).click();
   await page.waitForFunction(titleFitsGutters);
   const last = page.locator('.pizza-caption').last();
   assert.equal(await last.locator('h3').textContent(),'Delicata');
   assert.equal(await last.locator('li').count(),5);

  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.chips').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.chips button')).maskImage==='none');
  const first=await page.locator('.chips').evaluate(el=>({rail:el.getBoundingClientRect().toJSON(),first:el.querySelector('button').getBoundingClientRect().toJSON(),mask:getComputedStyle(el).maskImage}));
  assert.equal(first.mask,'none','Rail masking isolates satin blur');assert.ok(first.first.left>=first.rail.left);assert.ok(first.first.right<=first.rail.right);

  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#audaci').getBoundingClientRect().top+scrollY-Math.min(140,innerHeight/4),behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('[data-go="audaci"]').getAttribute('aria-current')==='location');
  const layout=await page.evaluate(()=>{
   const style=(el,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(el)[k]]));
   const item=document.querySelector('[data-menu-item="Burrata e Crudo"]'),name=item.querySelector('.nome'),price=item.querySelector('.prezzo'),rail=document.querySelector('.chipbar-inner');
   return {nav:style(document.querySelector('.chipbar'),['zIndex']),blur:style(document.querySelector('.vr-edge-blur'),['zIndex']),rail:style(rail,['backgroundColor']),pill:style(document.querySelector('.chips button.on'),['backgroundImage','backdropFilter']),category:style(document.querySelector('.mcat-head'),['textAlign']),tag:style(document.querySelector('.mcat .tag'),['fontSize']),dots:style(item.querySelector('.dots'),['display','backgroundImage','height','opacity']),name:name.getBoundingClientRect().toJSON(),price:price.getBoundingClientRect().toJSON(),priceColor:getComputedStyle(price).color,desc:item.querySelector('.desc').getBoundingClientRect().toJSON(),chevron:document.querySelector('.chipchev.r').getBoundingClientRect().toJSON(),railRect:rail.getBoundingClientRect().toJSON(),categoryBorder:getComputedStyle(document.querySelector('#audaci')).borderTopWidth};
  });
  assert.ok(+layout.nav.zIndex>+layout.blur.zIndex);assert.equal(layout.rail.backgroundColor,'rgba(0, 0, 0, 0)');
  assert.equal(layout.pill.backdropFilter,'blur(22px)');assert.equal(layout.category.textAlign,'center');assert.ok(parseFloat(layout.tag.fontSize)>=18);assert.equal(layout.categoryBorder,'0px');
  assert.notEqual(layout.dots.display,'none');assert.equal(layout.dots.height,'1px');assert.equal(layout.dots.opacity,'1');assert.ok(layout.dots.backgroundImage.includes('repeating-linear-gradient'));assert.ok(layout.dots.backgroundImage.includes('rgb(37, 37, 36)'));assert.ok(layout.dots.backgroundImage.includes('8px'));assert.equal(layout.priceColor,'rgb(218, 193, 139)');assert.ok(layout.name.right<=layout.price.left);
  if(width<768){assert.ok(layout.desc.right<=layout.price.left+1);assert.ok(layout.chevron.left>=layout.railRect.right-1);assert.ok(layout.chevron.right<=width+1);}
  if(await page.evaluate(()=>matchMedia('(hover: hover)').matches)){
   const inactive=page.locator('.chips button:not(.on)').first();await inactive.hover();
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.chips button:not(.on)')).color==='rgb(213, 213, 213)');
   const art=page.locator('#audaci .menu-art');
   const snapshot=el=>{
    const style=(target,pseudo,keys)=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(target,pseudo)[k]]));
    return {frame:style(el,'::before',['height','backgroundImage','backgroundSize','filter','transitionDuration']),after:style(el,'::after',['height','backgroundImage','backgroundSize','filter','transitionDuration']),mask:getComputedStyle(el.querySelector('.menu-art-window')).maskImage,image:style(el.querySelector('img'),null,['filter','transform','opacity','mixBlendMode']),containerFilter:getComputedStyle(el).filter};
   };
   const before=await art.evaluate(snapshot);
   await art.hover();const after=await art.evaluate(snapshot);
   assert.deepEqual(after,before,'Image hover changed the image or stroke/fade geometry');
   assert.ok(parseFloat(before.frame.height)>=2 && parseFloat(before.frame.height)<=4);
   assert.deepEqual(before.frame,before.after);assert.ok(before.frame.backgroundImage.includes('filetto.svg'));
   assert.ok(await page.locator('.menu-art').evaluateAll(all => all.length === 8 && all.every(el => {
    const box=el.getBoundingClientRect(), img=el.querySelector('img').getBoundingClientRect();
    return Math.abs(img.top-box.top-3)<.1 && Math.abs(box.bottom-img.bottom-3)<.1;
   })), 'The artwork must meet the inside edges of both rules');
   assert.equal(before.frame.backgroundSize,'100% 100%');assert.equal(before.frame.filter,'none');assert.equal(before.frame.transitionDuration,'0s');
   assert.equal(before.mask,'none');assert.equal(before.image.filter,'none');assert.equal(before.containerFilter,'none');
  }
  await page.screenshot({path:`${out}/audaci-${width}x${height}.png`});
  const trigger=page.locator('[data-menu-item="Burrata e Crudo"] button.nome');
  await trigger.click();await page.locator('dialog.modal-allergens').waitFor({state:'visible'});
  const dialog=await page.locator('.modal-allergens').evaluate(el=>({active:[...el.querySelectorAll('.contains .allergen-code')].map(n=>n.textContent),count:el.querySelectorAll('li').length,bg:getComputedStyle(el).backgroundColor,blur:getComputedStyle(el,'::backdrop').backdropFilter,rows:[...el.querySelectorAll('li')].map(n=>getComputedStyle(n).display),font:parseFloat(getComputedStyle(el.querySelector('li')).fontSize),headerOrder:[...el.querySelector('.modal-header>div').children].map(n=>n.tagName),note:el.querySelector('.allergen-note').textContent,indent:[...el.querySelectorAll('.allergen-text')].map(n=>n.getBoundingClientRect().left),circle:getComputedStyle(el.querySelector('.allergen-code')).borderTopWidth,x:getComputedStyle(el.querySelector('.modal-close')).outlineStyle}));
  const appearance = await page.locator(".modal-allergens").evaluate(el => {
    const row = getComputedStyle(el.querySelector("li:not(.contains)"));
    const note = getComputedStyle(el.querySelector(".allergen-note"));
    return { idle:row.color, active:getComputedStyle(el.querySelector("li.contains")).color,
      weight:note.fontWeight, noteSize:parseFloat(note.fontSize), detailSize:parseFloat(getComputedStyle(el.querySelector(".allergen-description")).fontSize) };
  });
  assert.equal(appearance.idle, "rgb(85, 85, 85)");
  assert.equal(appearance.weight, width >= 768 ? "300" : "400");
  assert.notEqual(appearance.active, appearance.idle);
  assert.ok(appearance.noteSize >= 15 && appearance.noteSize <= 20 && appearance.noteSize > appearance.detailSize);
  assert.deepEqual(dialog.active,['1','7']);assert.equal(dialog.count,15);assert.equal(dialog.bg,'rgba(0, 0, 0, 0)');assert.ok(dialog.blur.includes('blur'));assert.ok(dialog.rows.every(v=>v==='grid'));assert.ok(dialog.font>=12.5);assert.deepEqual(dialog.headerOrder,['H2']);assert.equal(dialog.note,'Per maggiori info, chiedi al personale.');const alignedColumns = new Set(dialog.indent.map(x => Math.round(x)));
  assert.equal(alignedColumns.size, await page.locator('.modal-allergens').evaluate(el=>Number(el.style.getPropertyValue('--allergen-columns'))));assert.equal(dialog.circle,'0px');assert.equal(dialog.x,'none');
  await page.screenshot({path:`${out}/allergens-${width}x${height}.png`});
  await page.locator('.allergen-name').first().click();await page.locator('dialog').waitFor({state:'detached'});
  assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
  await page.locator('[data-menu-item="Burrata e Crudo"] .allergen-trigger').click();await page.locator('dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
  await trigger.click();await page.locator('dialog').waitFor({state:'visible'});await page.locator('.modal-close').click();await page.locator('dialog').waitFor({state:'detached'});
  const dialogFits=[];
  for(const lang of ['it','en','de','fr']){
   await page.locator('.lang button').filter({hasText:new RegExp(`^${lang.toUpperCase()}$`)}).click();
   for(const name of ['Classico','Caprese con Bufala e Pomodorini','Tagliere di Affettati Misti e Formaggi']){
    await page.locator(`[data-menu-item="${name}"] button.nome`).click();
    const fit=await page.locator('.modal-allergens').evaluate(el=>({
     overflow:el.scrollHeight>el.clientHeight+1,
     horizontal:el.scrollWidth>el.clientWidth+1,
     top:el.querySelector('.modal-header').getBoundingClientRect().top,
     bottom:el.querySelector('.allergen-note').getBoundingClientRect().bottom,
     left:el.getBoundingClientRect().left,
     right:el.getBoundingClientRect().right,
     width:window.visualViewport?.width ?? innerWidth,
     height:window.visualViewport?.height ?? innerHeight,
     rows:[...el.querySelectorAll('.allergen-text')].map(text=>{
      const name=text.querySelector('.allergen-name'),desc=text.querySelector('.allergen-description');
      return {name:name.getBoundingClientRect().toJSON(),desc:desc.getBoundingClientRect().toJSON(),spacing:parseFloat(getComputedStyle(name).letterSpacing)};
     })
    }));
    assert.equal(fit.overflow,false,`${width}×${height} ${lang}: ${name} overflows vertically`);
    assert.equal(fit.horizontal,false);
    assert.ok(fit.left>=-1 && fit.right<=fit.width+1, 'Dialog must fit the visible viewport');
    assert.ok(fit.top>=0 && fit.bottom<=fit.height+1);
    for(const row of fit.rows){assert.ok(row.desc.top>=row.name.bottom);assert.ok(Math.abs(row.desc.left-row.name.left)<1);assert.ok(row.spacing>0);}
    dialogFits.push({lang,name,...fit});
    await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
   }
  }
  await page.locator('.lang button').filter({hasText:/^IT$/}).click();
  assert.equal(await page.locator('#bevande .item button.nome').count(),15,'Drink names open product information');
  const kitchen=await page.locator('#cucina .tag').evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight),break:getComputedStyle(el.querySelector('br')).display}));
  assert.equal(kitchen.break,width<768?'block':'none');
  if(width<768)assert.ok(Math.abs(kitchen.height-2*kitchen.line)<1,'Kitchen copy must occupy exactly two lines');
  const bottles=await page.locator('.drink-bottle-group .desc').evaluateAll(els=>els.map(el=>({text:el.textContent,breaks:el.querySelectorAll('br').length,overflow:el.scrollWidth>el.clientWidth+1})));
  assert.equal(bottles.length,7);assert.ok(bottles.every(b=>!b.breaks&&!b.overflow));assert.ok(bottles.some(b=>b.text==='IPA 0,5 l'));
  const note=await page.locator('.dolci-note').evaluate(el=>({text:el.textContent,align:getComputedStyle(el).textAlign,color:getComputedStyle(el).color,size:parseFloat(getComputedStyle(el).fontSize)}));
  assert.equal(note.text,'Chiedi al personale la disponibilità del giorno!');assert.equal(note.align,'center');assert.equal(note.color,'rgb(218, 193, 139)');assert.ok(note.size>=22);
  const drinks=[];
  for(const lang of ['de','fr','en','it']){
   await page.locator('.lang button').filter({hasText:new RegExp(`^${lang.toUpperCase()}$`)}).click();
   const groups = await page.locator('.groupsub').evaluateAll(nodes => nodes.map(node => {
     const lineBreak = node.querySelector('br');
     const range = document.createRange();
     range.selectNodeContents(node.lastChild);
     const process = range.getClientRects()[0];
     range.selectNodeContents(lineBreak.previousSibling);
     const origin = [...range.getClientRects()].at(-1);
     return { forced:getComputedStyle(lineBreak).display !== 'none', left:process.left-node.getBoundingClientRect().left,
       below:process.top > origin.top+1, separator:getComputedStyle(node.querySelector('.desktop-separator')).display };
   }));
   assert.equal(groups.length, 2);
   for (const group of groups) {
     assert.equal(group.forced, width < 768);
     assert.equal(group.separator === 'none', width < 768);
     if (width < 768) assert.ok(group.below && Math.abs(group.left) < 1);
   }
   const rows=await page.locator('.drink-row').evaluateAll(els=>els.map(el=>{
    const rect=node=>node.getBoundingClientRect().toJSON();
    return {name:el.dataset.menuItem,row:rect(el),label:rect(el.querySelector('.label')),grid:rect(el.querySelector('.pricegrid')),dots:getComputedStyle(el.querySelector('.dots')).display,
     header:[...el.closest('.drink-table').querySelectorAll('.drink-size-head>span')].map(rect),
     group:rect(el.closest('.drink-table').querySelector('.groupline')),
     cells:[...el.querySelectorAll('.drink-price-cell')].map(cell=>({cell:rect(cell),label:rect(cell.querySelector('.drink-size-label')),price:rect(cell.querySelector('b')),visibleLabel:getComputedStyle(cell.querySelector('.drink-size-label')).position==='static',overflow:cell.scrollWidth>cell.clientWidth+1}))};
   }));
   assert.equal(rows.length,6);
   for(const row of rows){
    assert.equal(row.dots,width<768?'none':'block');assert.equal(row.cells.length,3);
    assert.ok(row.grid.right<=row.row.right+1 && row.grid.left>=row.label.right-1,'Name overlaps a price column');
    for(const [i,cell] of row.cells.entries()){
     assert.equal(cell.overflow,false);assert.equal(cell.visibleLabel,false);
     assert.ok(Math.abs(cell.cell.right-row.header[i].right)<1,'Serving/price columns do not align');
     assert.ok(Math.abs(row.header[i].top-row.group.top)<14,'Serving labels must share the subgroup heading line');
     assert.ok(cell.price.right<=row.row.right+1);
    }
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   drinks.push({lang,rows});
  }
  await page.locator('#drinks-draught').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/draught-${width}x${height}.png`});
  await page.locator('#drinks-wines').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/wines-${width}x${height}.png`});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#audaci').getBoundingClientRect().top+scrollY-Math.min(140,innerHeight/4),behavior:'instant'}));
  await waitForFieldState(page, 'running');
  const bands=await page.locator('.menu-side-viewport').evaluate(el=>({
   viewport:el.getBoundingClientRect().toJSON(),
   content:document.querySelector('#audaci').getBoundingClientRect().toJSON(),
   surfaces:[...el.querySelectorAll('canvas')].map(c=>({rect:c.getBoundingClientRect().toJSON(),pixels:c.width*c.height})),
   events:getComputedStyle(el.parentElement).pointerEvents,
   background:getComputedStyle(document.querySelector('.menu-atmosphere')).backgroundColor,
  }));
  assert.equal(bands.surfaces.length,2);assert.equal(bands.events,'none');assert.equal(bands.background,'rgb(9, 9, 9)');
  assert.ok(bands.surfaces.reduce((n,c)=>n+c.pixels,0)<=1_600_000);
  assert.ok(bands.surfaces[0].rect.right<=bands.content.left+1);
  assert.ok(bands.surfaces[1].rect.left>=bands.content.right-1);
  assert.ok(bands.viewport.height<=height+1);
  const fraction=width>=2400?.3:width>=1200?.2:width>=768?.15:.1;
  assert.ok(Math.abs(bands.surfaces[0].rect.width-Math.min(width*fraction,520))<1);
  await page.screenshot({path:`${out}/side-squares-${width}x${height}.png`});
  await page.emulateMedia({reducedMotion:'reduce'});
  await waitForFieldState(page, 'static');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await trigger.click();await page.locator('dialog').waitFor({state:'visible'});
  await waitForFieldState(page, 'paused');
  await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await waitForFieldState(page, 'paused');
  const polish = await checkSectionPolish(page, width<768||height<=520);
  results.push({width,height,heading,layout,dialog,dialogFits,kitchen,bottles,note,drinks,bands,polish});await page.close();
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
console.log('MENU_BROWSER_OK — 320–3440px, static artwork, original side squares confined to gutters; reduced-motion/dialog/offscreen pause; menu and allergen regression checks.');
