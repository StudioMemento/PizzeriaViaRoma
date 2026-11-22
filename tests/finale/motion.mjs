import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function speedAtCenter(page, selector) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const stage = page.locator(selector);
  await stage.evaluate(el => el.scrollIntoView({block:"center", behavior:"instant"}));
  await stage.locator(".is-current").waitFor();
  await page.mouse.move(1,1);
  await stage.focus(); await page.keyboard.press("Home");
  await stage.evaluate(el => el.blur());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  return stage.evaluate(async el => {
    const photo = el.querySelector(".ribbon-card");
    const marker = document.createElement("i");
    marker.style.cssText = "position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none";
    photo.append(marker);
    const next = () => new Promise(resolve => requestAnimationFrame(resolve));
    // A zero-size marker follows the actual projected image center on the curved track.
    for (let i=0;i<4;i++) await next();
    let last = await next(), seconds = 0;
    const start = marker.getBoundingClientRect().left;
    for (let i=0;i<30;i++) {
      const now = await next();
      seconds += Math.min(.04,(now-last)/1000);
      last = now;
    }
    const speed = (start-marker.getBoundingClientRect().left)/seconds;
    marker.remove();
    return speed;
  });
}

export async function galleryPace(page) {
  for (const [width,height] of [[1440,900],[390,844]]) {
    await page.setViewportSize({width,height});
    const venue = await speedAtCenter(page,"#album-esterno .ribbon-stage");
    const expected = await page.locator(".panorama .ribbon-card").first().evaluate(el=>{
      const w=el.offsetWidth;
      return Math.min(1800,w*2.15,Math.max(w*1.12,el.closest(".ribbon-stage").clientWidth*.54))*3.2*Math.PI/180;
    });
    assert.ok(Math.abs(venue-expected)<expected*.07,JSON.stringify({width,venue,expected}));
    console.log(`PACE_OK ${width}px · panorama ${venue.toFixed(1)} px/s`);
  }
}

export async function edgeField(page) {
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.locator("#social").evaluate(el=>el.scrollIntoView({block:"center",behavior:"instant"}));
  const field=page.locator(".final-sections .finale-field-view");
  await page.waitForFunction(()=>document.querySelector(".final-sections .finale-field-view canvas").width>300);
  const result=await field.evaluate(el=>{
    const gutter=(el.clientWidth-document.querySelector(".spread-title").offsetWidth)/2;
    const canvas=[...el.querySelectorAll("canvas")];
    return {top:el.getBoundingClientRect().top, pointer:getComputedStyle(el.parentElement).pointerEvents, bands:canvas.map((c,side)=>{
      const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data, counts=[0,0,0,0,0];
      for(let i=3;i<d.length;i+=4) if(d[i]>12){
        const x=((i-3)/4)%c.width, distance=(side?c.width-1-x:x)*c.clientWidth/c.width;
        counts[Math.min(4,Math.floor(4*distance/gutter))]++;
      }
      return counts;
    })};
  });
  assert.ok(Math.abs(result.top)<1);assert.equal(result.pointer,"none");
  for(const counts of result.bands) {
    assert.ok(counts[0]>counts[3]*2 && counts[4]>0 && counts[4]<counts[0]*.22,JSON.stringify(counts));
  }
  const pixels=()=>field.locator("canvas").first().evaluate(c=>c.toDataURL());
  const still=await pixels();await page.mouse.move(15,220);await page.waitForTimeout(100);
  assert.equal(await pixels(),still,"Reduced motion keeps a static field");
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.waitForFunction(prev=>document.querySelector(".final-sections .finale-field-view canvas").toDataURL()!==prev,still);
  await page.locator("#home").evaluate(el=>el.scrollIntoView({behavior:"instant"}));
  // The scroll and the browser's intersection notification can land on different frames.
  await field.evaluate(el=>new Promise(resolve=>{
    const observer=new IntersectionObserver(([entry])=>{
      if (entry.isIntersecting) return;
      observer.disconnect();
      requestAnimationFrame(resolve);
    });
    observer.observe(el);
  }));
  const away=await pixels();await page.waitForTimeout(120);
  assert.equal(await pixels(),away,"Offscreen atmosphere is paused");
}

// Equal seeded fields at the same animation phase let the test isolate the response to input.
export async function fieldInput(browser,url) {
  const manifest=JSON.parse(await readFile("dist/.vite/manifest.json","utf8"));
  const module=manifest["src/components/bento/effects.ts"].file;
  const page=await browser.newPage({viewport:{width:940,height:390},hasTouch:true});
  const panel='<section class="final-sections"><h2 class="spread-title"></h2><div class="view"><canvas></canvas><canvas></canvas></div></section>';
  await page.route("**/__field_test",route=>route.fulfill({contentType:"text/html",body:
    '<style>*{box-sizing:border-box}body{margin:0;display:flex}.final-sections{position:relative;width:50vw;height:320px}.spread-title{margin:0 auto;width:56%}.view{position:absolute;inset:0;display:flex;justify-content:space-between;gap:11vw}canvas{width:26%;height:100%}</style>'+panel+panel}));
  try {
    await page.goto(new URL("__field_test",url).href);
    await page.evaluate(async path=>{
      const { mountEdgeField }=await import(path);
      const points = new WeakMap();
      const drawing = CanvasRenderingContext2D.prototype;
      const {arc, clearRect} = drawing;
      drawing.clearRect = function(...args) {
        points.set(this.canvas, []);
        return clearRect.apply(this, args);
      };
      drawing.arc = function(...args) {
        points.get(this.canvas)?.push(args.slice(0, 2));
        return arc.apply(this, args);
      };
      // Compare individual motes with the same seed at the same time.
      window.plume = () => {
        const [live,still] = [...document.querySelectorAll(".view canvas:first-child")].map(canvas => points.get(canvas) || []);
        const intake = [], core = [];
        still.forEach(([x,y],i) => {
          if (!live[i]) return;
          const dx = x-23, dy = y-150, distance = Math.hypot(dx,dy);
          const [sx,sy] = live[i];
          if (dy>18 && dy<85 && distance<95) intake.push([y-sy,distance-Math.hypot(sx-23,sy-150)]);
          if (distance<70) core.push(Math.abs(sx-x));
        });
        return {rising:intake.filter(([rise,gain])=>rise>.8 && gain>.3).length,
          intake:intake.length, curl:Math.max(0,...core)};
      };
      document.querySelectorAll(".view").forEach(mountEdgeField);
      window.fieldsEqual=()=>{
        const [a,b]=[...document.querySelectorAll(".view canvas:first-child")];
        const sample=c=>c.getContext("2d").getImageData(0,80,c.width,160).data;
        const x=sample(a),y=sample(b);let total=0,changed=0;
        for(let i=3;i<x.length;i+=4){total+=x[i];changed+=Math.abs(x[i]-y[i]);}
        return {painted:total>1000,changed};
      };
    },"/"+module);
    await page.waitForFunction(()=>window.fieldsEqual().painted && window.fieldsEqual().changed===0);
    await page.mouse.move(23,150);
    await page.waitForFunction(()=>window.fieldsEqual().changed>1000);
    await page.waitForFunction(()=>{const p=window.plume();return p.intake>=2 && p.rising>=p.intake*.65 && p.curl>.8;});
    const plume=await page.evaluate(()=>window.plume());
    assert.ok(plume.curl<30, "Curl should stay local");
    await page.mouse.move(240,370);
    await page.waitForFunction(()=>window.fieldsEqual().changed===0);
    const client=await page.context().newCDPSession(page);
    await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:23,y:150}]});
    await page.waitForFunction(()=>window.fieldsEqual().changed>1000);
    await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await page.waitForFunction(()=>window.fieldsEqual().changed===0);
    await client.detach();
    console.log("EDGE_OK · side density, sparse inner margin, reduced motion, offscreen pause and independent mouse/touch displacement");
  } finally { await page.close(); }
}
