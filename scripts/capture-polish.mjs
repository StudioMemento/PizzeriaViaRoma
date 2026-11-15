import { setup, pageFor, position, assert } from "./browser-helpers.mjs";
const qa = await setup();
try {
  for (const viewport of [{width:1440,height:900},{width:900,height:1200},{width:390,height:844},{width:320,height:700}]) {
    const {page,problems} = await pageFor(qa.browser,qa.url,viewport,{hasTouch:viewport.width<700});
    for (const [name,selector,offset] of [
      ["hero","#home",0],["pizza","#pizza-slider",85],["categories","#catshow",160],
      ["menu","#cat-classiche",135],["esterno","#album-esterno",70],
      ["bancone","#album-bancone",70],["sala-sinistra","#album-sala_sinistra",70],
      ["sala-destra","#album-sala_destra",70],["via-roma","#album-via_roma",70],
      ["community","#customer",65],["reviews",".reviews-zone",100],["contacts","#dove",60]
    ]) {
      await position(page,selector,offset);
      await page.waitForTimeout(600);
      await page.locator(selector).evaluate(async e => { await Promise.all([...e.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight && r.bottom>0 && r.left<innerWidth && r.right>0 && getComputedStyle(i).visibility==='visible';}).map(i=>i.decode().catch(()=>{}))); });
      await page.screenshot({path:`test-results/${viewport.width}-${name}.png`});
    }
    assert.deepEqual(problems,[]);
    await page.close();
  }
  console.log("VISUAL_CAPTURES_READY");
} finally { await qa.close(); }
