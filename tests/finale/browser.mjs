import assert from "node:assert/strict";
import { galleryPace, edgeField, fieldInput } from "./motion.mjs";
import { readFile } from "node:fs/promises";

const playwright = process.env.PLAYWRIGHT_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + "/playwright/index.mjs" : "playwright");
const { chromium } = await import(playwright);
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const url = process.env.TEST_URL || "http://127.0.0.1:4175/";
const original = JSON.parse(await readFile("src/data/photos.json", "utf8"));

async function tick(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function center(locator) {
  await locator.evaluate(el => window.scrollBy({ top: el.getBoundingClientRect().top + el.clientHeight / 2 - innerHeight / 2, behavior: "instant" }));
}
async function position(stage) {
  return stage.locator(".ribbon-card").first().evaluate(el => el.style.transform);
}
async function touchSwipe(page, from, to, afterMove) {
  const cdp = await page.context().newCDPSession(page);
  const points = { x: from.x, y: from.y };
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [points] });
  for (let i = 1; i <= 6; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * i / 6, y: from.y + (to.y - from.y) * i / 6 }] });
    if (afterMove) await afterMove();
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

async function galleries(page, touch) {
  const rooms = page.locator("#gallery .venue-room");
  assert.equal(await rooms.count(), 5);
  assert.deepEqual(await rooms.locator("h2").allTextContents(), ["Esterno", "Bancone", "Sala sinistra", "Sala destra", "Via Roma"]);
  for (const [key, photos] of Object.entries(original.GALLERY_ALBUMS))
    assert.equal(await page.locator(`#album-${key} .ribbon-card`).count(), photos.length);
  assert.equal(await rooms.locator(".photo-controls,.photo-expand,[aria-live] + button").count(), 0);
  assert.equal(await page.locator("#customer .ribbon-stage, #customer .photo-byline").count(), 0);
  assert.equal(await page.locator("#customer .crust-photo[src*='polaroid-interni']").count(), 1);
  const photoLink = page.getByRole("link", {name:/Ricordi condivisi dalla community.*Google Maps/});
  assert.equal(await photoLink.getAttribute("href"), "https://www.google.com/maps/place//data=!4m3!3m2!1s0x477983a3cc4c3b4f:0x641962f142805885!10e5");
  const stage = rooms.first().locator(".ribbon-stage");
  await center(stage); await page.waitForSelector("#album-esterno [data-enhanced]");
  await center(stage); await stage.focus(); await page.keyboard.press("Home");
  await page.waitForFunction(() => document.querySelector("#album-esterno .ribbon-stage").dataset.active === "0");
  const projection = await stage.evaluate(node => {
    const cards = [...node.querySelectorAll(".ribbon-card")];
    const frame = i => cards[i].getBoundingClientRect();
    const centered = frame(0), right = frame(1);
    return { clip: node.firstElementChild.style.clipPath, transforms: cards[0].style.transform, sideHigher: right.height > centered.height,
      seam:right.left-centered.right, gap:parseFloat(getComputedStyle(node.firstElementChild).columnGap),
      narrowerThanStage: centered.width < node.clientWidth, noTilt: centered.top >= right.top };
  });
  assert.ok(projection.sideHigher && projection.noTilt && projection.narrowerThanStage);
  assert.ok(Math.abs(projection.seam-projection.gap)<.15,"The projected center seam uses the gallery's declared gap");
  assert.match(projection.transforms, /matrix3d/); assert.match(projection.clip, /polygon/);
  await page.keyboard.press("ArrowLeft");
  assert.equal(await stage.getAttribute("data-active"), String(original.GALLERY_ALBUMS.esterno.length - 1));
  await page.keyboard.press("ArrowRight"); assert.equal(await stage.getAttribute("data-active"), "0");

  const rect = await stage.boundingBox();
  const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
  const before = await position(stage);
  if (touch) {
    const initialY = await page.evaluate(() => scrollY);
    for (const dx of [112,-110]) {
      const frames = [];
      const prior = await position(stage);
      await touchSwipe(page,{x,y},{x:x+dx,y:y+(dx>0?14:-12)},async()=>{
        frames.push(await page.evaluate(()=>[scrollY,visualViewport.pageTop]));
      });
      assert.notEqual(await position(stage),prior);
      assert.ok(frames.flat().every(v=>Math.abs(v-initialY)<=1),"Horizontal movement must hold the page still");
    }
  }
  else { await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x-110,y+1,{steps:7}); await page.mouse.up(); }
  assert.notEqual(await position(stage), before);
  assert.equal(await page.locator("dialog[open]").count(), 0);

  if(touch) {
    const priorY=await page.evaluate(()=>scrollY);
    await touchSwipe(page,{x,y},{x:x+2,y:y-110});
    await page.waitForFunction(prior=>scrollY>prior+15,priorY);
  }

  const guestCard = page.locator("#customer .crust-card-shell");
  await center(guestCard);
  await guestCard.locator("img").evaluate(im => im.decode());
  const geometry = await guestCard.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const ref = document.querySelector("#asporto .crust-card-shell").getBoundingClientRect();
    return {ratio:rect.width / rect.height, width:rect.width, referenceWidth:ref.width};
  });
  assert.ok(Math.abs(geometry.ratio-16/9)<.02 && Math.abs(geometry.width-geometry.referenceWidth)<1);

}

async function contactAndLegal(page, touch) {
  const pins = await page.locator(".map-pin").evaluateAll(all => all.map(pin => {
    const rect=pin.getBoundingClientRect(), map=pin.parentElement.getBoundingClientRect();
    const label=pin.querySelector("span"), box=label.getBoundingClientRect(), style=getComputedStyle(label);
    const stem=getComputedStyle(pin,"::before"), dot=getComputedStyle(pin,"::after");
    const glass=getComputedStyle(label,"::before");
    return {text:label.textContent, ink:style.color, softLabel:(glass.backdropFilter||glass.webkitBackdropFilter).includes("blur"),
      tipAnchored:parseFloat(stem.width) === 1 && parseFloat(stem.bottom) === 0 && dot.content === "none",
      aligned:Math.abs(rect.top - parseFloat(stem.height) - box.bottom) < 1 && box.left < rect.left && box.right >= rect.left,
      fits:box.left>=map.left && box.top>=map.top && box.right<=map.right && box.bottom<=map.bottom,
      x:(rect.left-map.left)/map.width, y:(rect.top-map.top)/map.height};
  }));
  assert.deepEqual(pins.map(p=>p.text),["Pizzeria Via Roma","Piazza Italia"]);
  for (const [i,[x,y]] of [[.7191,.311],[.6082,.5081]].entries()) {
    const p=pins[i];
    assert.ok(p.fits && Math.abs(p.x-x)<.001 && Math.abs(p.y-y)<.001);
    assert.ok(p.tipAnchored && p.aligned && p.softLabel);
  }
  assert.notEqual(pins[0].ink,pins[1].ink);
  const links = page.locator(".social-bento a");
  assert.equal(await links.count(),6); assert.equal(await page.locator(".platform-google").getAttribute("href"),
    "https://www.google.com/maps/place//data=!4m4!3m3!1s0x477983a3cc4c3b4f:0x641962f142805885!9m1!1b1");
  assert.deepEqual(await links.evaluateAll(a => a.map(el => new URL(el.href).hostname)),
    ["www.instagram.com","www.facebook.com","www.google.com","www.tripadvisor.it","restaurantguru.it","www.sluurpy.it"]);
  assert.equal(await page.locator(".map-tile").getAttribute("href"),"https://maps.google.com/?cid=7212905066552907909");
  assert.equal(await page.locator(".phone-tile").getAttribute("href"),"tel:+390427541232");
  assert.equal(await page.locator(".wa-tile").getAttribute("href"),"https://wa.me/393802453757");
  assert.equal(await page.locator(".wa-tile img").getAttribute("src"),"/assets/social/whatsapp.webp?v=46");
  assert.equal(await page.locator(".phone-tile img").getAttribute("src"),"/assets/social/telefono.webp");
  assert.equal(await page.locator(".studio-credit").getAttribute("href"),"https://mementostudio.it");
  assert.deepEqual(await links.locator(".tile-bottom > span:first-child").allTextContents(),["Instagram","Facebook","Google Reviews","Tripadvisor","Restaurant Guru","Sluurpy"]);
  await center(page.locator("#social"));await Promise.all((await links.locator("img").all()).map(el=>el.evaluate(im=>im.decode())));
  for (const image of await links.locator("img").all()) {
    const inside = await image.evaluate(im => {
      const tile=im.parentElement, r=im.getBoundingClientRect(), box=tile.getBoundingClientRect();
      const label=tile.querySelector(".tile-bottom > span").getBoundingClientRect();
      const canvas=document.createElement("canvas"); canvas.width=canvas.height=24;
      const ctx=canvas.getContext("2d"); ctx.drawImage(im,0,0,24,24);
      return getComputedStyle(im).objectFit==="contain" && r.top>box.top && r.bottom<label.top+2
        && r.left>box.left && r.right<box.right && ctx.getImageData(0,0,1,1).data[3]===0;
    });
    assert.ok(inside, "Transparent emblem must fit above its label");
  }
  const first=links.first();
  await page.mouse.move(1,1); await tick(page);
  assert.ok(await first.locator("img").evaluate(im=>getComputedStyle(im).filter.startsWith("saturate(0.8) brightness(1) drop-shadow(")));
  if (!touch) {
    await first.hover(); await tick(page);
    assert.ok(await first.locator("img").evaluate(im=>getComputedStyle(im).filter.startsWith("saturate(1) brightness(1.1) drop-shadow(")));
    assert.equal(await first.evaluate(el=>getComputedStyle(el,"::after").opacity),"1");
    assert.equal(await first.evaluate(el=>getComputedStyle(el).color),"rgb(240, 212, 147)");
    assert.equal(await first.locator(".tile-arrow").evaluate(el=>getComputedStyle(el).color),"rgb(240, 212, 147)");
    assert.equal(await first.locator("canvas").count(),0,"Reduced motion disables particle animation");
  }
  for (const lang of ["it", "en", "de", "fr"]) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await contactTextFits(page);
    const footer = page.locator(".visit-footer nav a");
    for (let i=0;i<3;i++) {
      const link=footer.nth(i);
      await center(link); await link.click();
      const dialog=page.locator("dialog.modal-legal[open]");
      const text = dialog.locator("article.legal-text");
      await text.waitFor();
      assert.equal(await text.getAttribute("lang"), lang);
      const path=await link.getAttribute("href");
      const response=await page.request.get(new URL(path,url).toString()); assert.ok(response.ok());
      const html=await response.text();
      assert.doesNotMatch(html, /legal-draft|bozza per la revisione/i);
      assert.equal(await text.locator(".legal-draft").count(), 0);
      assert.equal(await text.evaluate((e,html)=>new DOMParser().parseFromString(html,"text/html").querySelector(".legal-text").innerHTML===e.innerHTML,html),true);
      const dims=await dialog.evaluate(d=>{
        const v=d.querySelector(".legal-scroll"),rail=d.querySelector(".vr-scroll-progress");
        const close=d.querySelector(".modal-close").getBoundingClientRect();
        return {width:d.clientWidth,height:d.clientHeight,innerWidth,innerHeight,range:v.scrollHeight-v.clientHeight,hidden:rail.hidden,bar:getComputedStyle(v).scrollbarWidth,closeFits:close.top>=0&&close.bottom<=innerHeight,back:getComputedStyle(d,"::backdrop").backdropFilter};
      });
      assert.ok(Math.abs(dims.width-dims.innerWidth)<2 && Math.abs(dims.height-dims.innerHeight)<2 && dims.closeFits);
      assert.ok(dims.back.includes("blur"));assert.equal(dims.bar,"none");assert.equal(dims.hidden,dims.range<=1);
      if (dims.range>1) {
        if (touch && lang==="it" && i===1 && dims.range>20) {
          const reader=dialog.locator(".legal-scroll"), bounds=await reader.boundingBox();
          const x=bounds.x+bounds.width/2;
          await touchSwipe(page,{x,y:bounds.y+bounds.height*.75},{x,y:bounds.y+bounds.height*.24});
          await page.waitForFunction(()=>document.querySelector("dialog[open] .legal-scroll")?.scrollTop>1);
        }
        await page.keyboard.press("End");
        await page.waitForFunction(()=>{const v=document.querySelector(".legal-scroll");return v.scrollTop>=v.scrollHeight-v.clientHeight-1;});
        // The native scroll event is delivered after scrollTop updates.
        await page.waitForFunction(() => {
          const fill = document.querySelector(".legal-panel .vr-scroll-progress > span");
          return new DOMMatrix(getComputedStyle(fill).transform).m22 > .98;
        }, null, {timeout:3000});
      }
      assert.equal(path.split("/").pop(), ["cookie.html","privacy.html","note-legali.html"][i]);
      assert.equal(await text.locator("p br").count(), 0, "Sentences are separate paragraphs");
      if (touch) {
        const paragraph = text.locator("p").first();
        await paragraph.scrollIntoViewIfNeeded();
        await paragraph.tap({position:{x:2,y:4}});
      } else if (i===0) {
        await text.locator("h2").first().click();
      } else if (i===1) {
        await page.keyboard.press("Escape");
      } else {
        await page.mouse.click(3,3);
      }
      await dialog.waitFor({state:"detached"});assert.ok(await link.evaluate(e=>e===document.activeElement));
    }
  }
  await page.locator('[data-lang="it"]').click();
}

async function contactTextFits(page) {
  const clipped=await page.locator(".bento-grid .bento-tile").evaluateAll(tiles=>tiles.flatMap(tile=>{
    const bounds=tile.getBoundingClientRect();
    return [...tile.querySelectorAll("strong,small,.hours-note,.action-label,.social-tile .tile-bottom > span:first-child")].filter(label=>{
      const range=document.createRange();range.selectNodeContents(label);
      return [...range.getClientRects()].some(r=>r.left<bounds.left-1 || r.right>bounds.right+1 || r.top<bounds.top-1 || r.bottom>bounds.bottom+1);
    }).map(label=>label.textContent);
  }));
  assert.ok(await page.locator(".hours-tile").evaluate(el=>{
    const time=el.querySelector(".opening-time").getBoundingClientRect(), note=el.querySelector(".hours-note");
    const first=note.firstElementChild.getBoundingClientRect(), last=note.lastElementChild.getBoundingClientRect();
    const box=el.getBoundingClientRect();
    return first.top>=time.bottom && Math.abs(time.left-first.left)<1.5 && Math.abs(time.right-last.right)<1.5
      && Math.abs((time.right+time.left)-(box.right+box.left))<2 && time.left-box.left>box.width*.055;
  }),"Centered, equal-width hours and closing day in every language");
  assert.deepEqual(clipped,[],"Labels must fit the card");
  const orderFits = await page.locator(".contact-tile").evaluateAll(tiles => tiles.every(tile => {
    const ink = e => { const r = document.createRange(); r.selectNodeContents(e); return [...r.getClientRects()]; };
    const [label] = ink(tile.querySelector(".action-label")), [phone] = ink(tile.querySelector("small"));
    const [arrow] = tile.querySelector(".tile-arrow").getClientRects();
    return phone.top > label.top && Math.abs(phone.left-label.left) < 1 &&
      phone.right <= arrow.left && !tile.querySelector(".contact-purpose");
  }));
  assert.ok(orderFits,"The phone number fits on its own line below the action");
}

async function finalLayout(page) {
  await tick(page);
  const result = await page.evaluate(() => {
    const rect = node => node.getBoundingClientRect();
    const ok = (a,b) => Math.abs(a-b) < 1.6;
    const content = rect(document.querySelector(".menu-head"));
    const atGutters = el => { const r=rect(el); return ok(r.left,content.left) && ok(r.right,content.right); };
    const titles = [...document.querySelectorAll(".spread-title")];
    const rooms = [...document.querySelectorAll(".venue-room")];
    const titleGap = room => {
      const title=rect(room.querySelector("h2")), ribbon=rect(room.querySelector(".photo-ribbon"));
      // At the middle of the curved stage, the 4:3 center image has this top edge.
      const photoWidth=room.querySelector(".ribbon-card").offsetWidth;
      return ribbon.top+(ribbon.height-.75*photoWidth)/2-title.bottom;
    };
    const pairs=rooms.slice(1).map((room,i) => {
      const prev=rooms[i].querySelector(".photo-ribbon");
      return [titleGap(room),rect(room.querySelector("h2")).top-rect(prev).bottom];
    });
    const tiles=document.querySelectorAll(".bento-grid a");
    const outer=[...document.querySelectorAll("#customer .crust-card-shell,.bento-grid,.footer-row")];
    const bento=[...document.querySelectorAll(".bento-grid")].map(grid=>[...grid.children].map(el=>{
      const r=rect(el);return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};
    }));
    return {validTitles:titles.length===7 && titles.every(atGutters),pairs, mobile:innerWidth<=700, tablet:innerWidth>700 && innerWidth<1000, squareSocial:matchMedia("(max-width:700px),(pointer:coarse) and (max-width:1000px) and (max-height:540px)").matches, firstGap:rect(rooms[0].querySelector("h2")).top-rect(rooms[0]).top,
      menuPad:parseFloat(getComputedStyle(document.querySelector("#menu")).paddingBottom),
      rules:[...document.querySelectorAll("#customer,#social,#dove,.visit-footer,.footer-row")].every(el=>{const c=getComputedStyle(el);return c.borderTopWidth==="0px" && c.borderBottomWidth==="0px";}),
      footerRule:getComputedStyle(document.querySelector(".footer-row nav")).borderTopWidth,
      firstRowLabel:document.querySelector("#visit-title").getAttribute("aria-label"), areas:bento,
      blockSizes:[...document.querySelectorAll("#social,#dove")].every(el=>rect(el).height+1>=innerHeight),
      validEdges:outer.every(atGutters)&&[...document.querySelectorAll(".ribbon-stage")].every(el=>ok(rect(el).left,0)&&ok(rect(el).right,innerWidth)),
      shortSides:[...tiles].every(el=>{const r=rect(el);return Math.min(r.width,r.height)>=44;}),
      overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.ok(result.validTitles && result.validEdges && result.blockSizes && result.shortSides && !result.overflow, JSON.stringify(result));
  assert.equal(result.menuPad >= 36 && result.menuPad <= 84 && result.firstGap >= 122,true); assert.ok(result.rules,"The finale sections have no separators");
  assert.equal(result.footerRule,"0px","Footer links have no dividing rule");
  result.pairs.forEach(([next,prev])=>assert.ok(next>=0 && prev>next,`Title distances: own photo ${next}, preceding stage ${prev}`));
  assert.equal(result.firstRowLabel.toUpperCase(),"TI ASPETTIAMO!");
  const [social,visit]=result.areas;
  assert.equal(social.length,6);assert.equal(visit.length,4);
  const [ig,fb,...reviews]=social, [map,hours,wa,phone]=visit;
  const close=(a,b)=>Math.abs(a-b)<1.6;
  const square=tile=>close(tile.w,tile.h);
  const wide=tile=>Math.abs(tile.w/tile.h-2)<.12;
  assert.ok([ig,fb].every(result.squareSocial?square:wide) && reviews.every(square));
  assert.ok([map,wa,phone].every(square));
  const hoursAspect = hours.w / hours.h;
  if (result.mobile) assert.ok(Math.abs(hoursAspect-1.15)<.03);
  else if (result.tablet) assert.ok(hoursAspect>=1.8 && hoursAspect<=2.3);
  else assert.ok(square(hours));
  assert.ok(close(wa.t,phone.t) && close(wa.w,phone.w) && phone.l>wa.r);
  assert.ok(close(hours.l,wa.l) && close(hours.r,phone.r) && wa.t>hours.b);
  if(result.mobile) {
    assert.ok(close(ig.t,fb.t) && fb.l>ig.r && reviews[0].t>fb.b && close(ig.l,reviews[0].l) && close(fb.r,reviews[1].r));
    assert.ok(close(reviews[0].t,reviews[1].t) && close(reviews[2].t,reviews[3].t) && reviews[2].t>reviews[1].b);
    assert.ok(hours.t>map.b && close(map.w,hours.w) && close(map.l,hours.l));
  } else {
    assert.ok(close(ig.t,fb.t) && fb.l>ig.r && reviews.every(r=>r.t>ig.b && close(r.t,reviews[0].t)));
    assert.ok(close(map.t,hours.t) && hours.l>map.r && close(map.b,phone.b));
  }
  assert.equal(await page.locator(".opening-time").innerText(),"18:00 - 23:00");
  assert.equal(await page.locator(".hours-note").textContent(),"CHIUSO IL LUNEDÌ");
  assert.equal(await page.locator(".hours-copy p .sr-only").textContent(),"Chiuso il lunedì");
  assert.ok(await page.locator(".hours-tile").evaluate(el=>{
    const style=getComputedStyle(el), wa=getComputedStyle(document.querySelector(".wa-tile"));
    return style.backgroundColor===wa.backgroundColor && style.backgroundImage===wa.backgroundImage;
  }),"Identical substrate under the hours and WhatsApp");
  assert.equal(await page.locator("#openState,.status-tile").count(),0);
  await contactTextFits(page);
  const footer=page.locator(".visit-footer");
  await footer.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:"instant"}));
  const correct=await footer.evaluate(el=>{
    const blur=document.querySelector(".vr-edge-blur--bottom"), dock=document.querySelector(".vr-dock");
    const links=[...el.querySelectorAll("a")];
    const row=el.querySelector(".footer-row").getBoundingClientRect(), left=el.querySelector("p").getBoundingClientRect(), nav=el.querySelector("nav").getBoundingClientRect(), credit=el.querySelector(".studio-credit").getBoundingClientRect();
    const title=el.querySelector(".studio-credit span"), wordmark=el.querySelector(".studio-credit img").getBoundingClientRect();
    const text=title.getBoundingClientRect();
    const ink = node => { const r=document.createRange(); r.selectNodeContents(node); return r.getBoundingClientRect(); };
    const brandInk = ink(el.querySelector("p span:last-child"));
    const legalInk = ink(el.querySelector("nav a").firstChild);
    const aligned = innerWidth < 768 ? Math.abs(left.top-credit.top)<1 : Math.abs(brandInk.bottom-legalInk.bottom)<4 && Math.abs(brandInk.bottom-wordmark.bottom)<7;
    const creditLabel = getComputedStyle(title);
    const balanced = Math.abs(brandInk.width / wordmark.width - 1) < .12;
    return balanced && creditLabel.fontWeight === "300" && parseFloat(creditLabel.letterSpacing) >= .13 * parseFloat(creditLabel.fontSize) &&
      title.textContent==="Powered by" && el.querySelector(".studio-credit img").alt==="MEMENTO" && Math.abs(text.right-wordmark.right)<1 && text.bottom<=wordmark.top && wordmark.width>=105 && Math.abs(row.left-left.left)<1 && Math.abs(row.right-credit.right)<1 && credit.left>=left.right-1 && aligned && el.querySelectorAll("nav > span[aria-hidden=true]").length===2 && Math.abs((nav.left+nav.right)/2-innerWidth/2)<1.5 &&
      Number(getComputedStyle(el).zIndex)>Number(getComputedStyle(blur).zIndex) &&
      links.every(a=>{ const r=a.getBoundingClientRect();return r.bottom<=dock.getBoundingClientRect().top && a.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)); });
  });
  assert.ok(correct,"Footer columns, hit targets and dock clearance");
}

async function particles() {
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:"no-preference"});
  await page.clock.install({time:new Date("2026-01-01T00:00:00Z")});
  await page.addInitScript(()=>{let seed=1907;Math.random=()=>((seed=Math.imul(1664525,seed)+1013904223>>>0)/4294967296);});
  await page.goto(url,{waitUntil:"domcontentloaded"}); await page.evaluate(()=>document.fonts.ready);
  await page.clock.pauseAt(new Date("2026-01-01T01:00:00Z"));
  await page.clock.runFor(32);
  const hover = async tile => {
    await center(tile); await page.clock.runFor(32);
    const r=await tile.boundingBox(); await page.mouse.move(r.x+r.width*.6,r.y+r.height*.6);
  };
  const tile=page.locator(".platform-instagram");
  await hover(tile);
  const field=tile.locator("canvas.tile-particles");
  await field.waitFor();
  await page.clock.runFor(90);
  const reflection=()=>tile.evaluate(el=>[el.style.getPropertyValue("--satin-x"),el.style.getPropertyValue("--satin-y")]);
  const startLight=await reflection();
  const area=await tile.boundingBox();
  await page.mouse.move(area.x+area.width*.84,area.y+area.height*.28);
  await page.clock.runFor(90);
  assert.notDeepEqual(await reflection(),startLight,"The edge reflections follow the pointer");
  assert.ok(await tile.evaluate(el=>getComputedStyle(el,"::after").maskImage.includes("linear-gradient")));
  const sample = () => field.evaluate(c=>{
    const data=c.getContext("2d").getImageData(0,0,c.width,c.height).data;
    let light=0, pixels=0, y=0;
    for(let i=3;i<data.length;i+=4) if(data[i]) { light+=data[i];pixels++; y+=Math.floor((i/4)/c.width)*data[i]; }
    return {light,pixels,y};
  });
  await page.clock.runFor(260);const start=await sample();
  await page.clock.runFor(1150);const peak=await sample();
  assert.ok(peak.pixels>start.pixels && peak.light>start.light,"Particle count and intensity grow gradually");
  await page.mouse.move(2,2);await page.clock.runFor(850);const mid=await sample();
  await page.clock.runFor(950);const tail=await sample();
  assert.ok(mid.light>tail.light && tail.light>0 && tail.y/tail.light<mid.y/mid.light,"Particles ascend and fade after exit");
  await page.clock.runFor(1150);assert.equal(await field.count(),1,"The exit lasts the full three seconds");
  await page.clock.runFor(110);assert.equal(await field.count(),0);
  await page.clock.resume();
  const logo=page.locator(".hours-tile");
  await center(logo);await logo.hover();await logo.locator("canvas").waitFor();
  await page.waitForTimeout(650);assert.equal(await logo.locator(".sign-mark").evaluate(e=>getComputedStyle(e,"::after").opacity),"1");
  await page.mouse.move(1,1);await page.waitForTimeout(700);assert.equal(await logo.locator(".sign-mark").evaluate(e=>getComputedStyle(e,"::after").opacity),"0");
  await page.close();
}

async function run(layout) {
  const page=await browser.newPage({viewport:{width:layout[0], height:layout[1]},hasTouch:layout[2],isMobile:layout[2],reducedMotion:"reduce"});
  const errors=[], failed=[], first=[];
  page.on("pageerror",e=>errors.push(e.message));page.on("response",r=>{if(r.status()>=400)failed.push(r.url());});
  page.on("request",r=>first.push(r.url()));
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);await tick(page);
  assert.ok(first.every(link=>!link.includes("/assets/ribbons/")), "Gallery bytes loaded on the menu landing");
  await finalLayout(page);
  if (layout[3]) await galleries(page,layout[2]);
  await contactAndLegal(page,layout[2]);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),"Horizontal page overflow");
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  await page.close();console.log(`FINALE_OK ${layout[0]}×${layout[1]} · galleries ${layout[3]} · 12 localized legal views`);
}

try {
  for(const layout of [[1440,900,false,true],[390,844,true,true],[320,568,true,false],[844,390,true,false],[768,1024,true,false],[3440,1440,false,true]]) await run(layout);
  const compact=await browser.newPage({reducedMotion:"reduce"});
  await compact.goto(url);await compact.evaluate(()=>document.fonts.ready);
  for (const [width,height] of [[320,480],[480,320],[568,280],[1199,600],[2560,1080],[3440,640],[5120,1440]]) {
    await compact.setViewportSize({width,height}); await finalLayout(compact);
    if(height<=320) for(const lang of ["fr","de","en","it"]) {
      await compact.locator(`[data-lang="${lang}"]`).click();await contactTextFits(compact);
    }
    const strip=compact.locator("#album-esterno .ribbon-stage");
    await center(strip);await compact.waitForSelector("#album-esterno [data-enhanced]");await strip.focus();
    await compact.keyboard.press("Home");
    for(const fraction of [0,.25,.5,.75]) {
      const coverage=await strip.evaluate((el,offset)=>{
        const pitch=el.querySelector(".ribbon-card").offsetWidth+parseFloat(getComputedStyle(el.firstElementChild).columnGap);
        el.dispatchEvent(new WheelEvent("wheel",{deltaX:pitch*offset,cancelable:true}));
        const r=el.getBoundingClientRect(), spans=[...el.querySelectorAll(".ribbon-card")].filter(c=>c.style.visibility==="visible").map(c=>c.getBoundingClientRect());
        return [.02,.07,.93,.98].every(f=>spans.some(s=>s.left-5 <=r.width*f && s.right+5>=r.width*f));
      },fraction);
      assert.ok(coverage,`Panorama coverage at ${width}×${height}, offset ${fraction}`);
    }
  }
  await compact.close();console.log("FIT_OK · compact landscape through ultrawide, exact menu gutters, two-line heading and panoramic edge coverage");
  await particles();
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:"no-preference"});
  await page.goto(url,{waitUntil:"domcontentloaded"});
  const room=page.locator("#album-bancone .ribbon-stage");
  await center(room);await page.waitForSelector("#album-bancone [data-enhanced]");await center(room);
  const first=await position(room);await page.waitForFunction(before=>document.querySelector("#album-bancone .ribbon-card").style.transform!==before,first);
  await room.hover();await tick(page);const held=await position(room);await page.waitForTimeout(130);assert.equal(await position(room),held);
  await page.mouse.move(2,2);await page.waitForFunction(before=>document.querySelector("#album-bancone .ribbon-card").style.transform!==before,held);
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await tick(page);const outside=await position(room);await page.waitForTimeout(130);assert.equal(await position(room),outside);
  await galleryPace(page); await edgeField(page);
  await page.close();
  await fieldInput(browser,url);
  console.log("MOTION_OK · gallery drift, offscreen pause, rising particles with a 3 s exit");
} finally { await browser.close(); }
