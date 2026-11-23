import assert from "node:assert/strict";

const engine = process.env.BROWSER_ENGINE || "chromium";
const playwright = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const executablePath = process.env.BROWSER_PATH || (engine === "chromium" ? process.env.CHROMIUM_PATH : undefined);
const browser = await playwright[engine].launch({ headless: true, executablePath });
const url = process.env.TEST_URL || "http://127.0.0.1:4175/";
const viewports = [[320,568,true], [320,861,true], [390,844,true], [844,390,true], [768,1024,true], [1440,900,false]];
const languages = ["it","en","de","fr"];
const slugs = ["cookie","privacy","note-legali"];

function neutral(color) {
  const parts = color.match(/[\d.]+/g).map(Number);
  return parts[0] === parts[1] && parts[1] === parts[2];
}

async function checkAnchorsAndCursor(page,touch) {
  const jump = async (label,id) => {
    await label.click();
    await page.waitForFunction(id=>location.hash==="#"+id,id);
    await page.waitForFunction(id=>{
      const top=document.getElementById(id).getBoundingClientRect().top;
      return top>=-1 && top<=200;
    },id);
  };
  await jump(page.locator('.vr-dock [href="#classiche"]'),"classiche");
  await jump(page.locator('.chips [data-go="audaci"]'),"audaci");
  await jump(page.locator('.vr-dock [href="#info"]'),"info");
  await page.goBack();
  await page.waitForFunction(()=>location.hash==="#audaci" && document.querySelector('.chips .on').dataset.go==="audaci");
  await page.goForward();
  await page.waitForFunction(()=>location.hash==="#info");
  for (const [old,id] of [["cat-classiche","classiche"],["cat-bevande","bevande"],["dove","info"]]) {
    await page.goto(new URL("/#"+old,url).href);
    await page.waitForFunction(id=>location.hash==="#"+id,id);
    await page.reload();
    await page.waitForFunction(id=>Math.abs(document.getElementById(id).getBoundingClientRect().top)<200,id);
  }
  const pointer = page.locator(".phone-tile");
  const cursor = locator=>locator.evaluate(el=>getComputedStyle(el).cursor);
  const white=style=>style.includes("cursore-bianco.svg");
  for(const selector of ["#info h2","#forno",".phone-number",".lang button.on span"]) {
    assert.equal(white(await cursor(page.locator(selector).first())),!touch,selector);
  }
  if (!touch) {
    const size = await pointer.evaluate(async el => {
      const url = getComputedStyle(el).cursor.match(/url\("([^"]+)"\)/)[1];
      const image = new Image();
      image.src = url;
      await image.decode();
      return [image.naturalWidth,image.naturalHeight];
    });
    assert.deepEqual(size,[13,15], "Desktop cursor dimensions");
  }
  const link=page.locator('.footer-row a[href="/privacy.html"]');
  await link.click();
  const close=page.locator("dialog[open] .modal-close");
  assert.equal(white(await cursor(close)),!touch);
  await close.click();
  assert.equal(await link.evaluate(el=>getComputedStyle(el).outlineStyle),"none");
  if (!touch) {
    await link.focus();
    await page.keyboard.press("Tab");
    assert.ok(await page.locator(".footer-row nav a:focus-visible").evaluate(el=>
      getComputedStyle(el).outlineStyle==="none" && getComputedStyle(el,"::after").width==="6px"));
    await page.emulateMedia({forcedColors:"active"});
    assert.equal(white(await cursor(pointer)),true);
    await page.emulateMedia({forcedColors:"none"});
  }
}

async function checkParticles(page, touch) {
  await page.emulateMedia({reducedMotion:"no-preference"});
  const specks = control => control.evaluate(el=>getComputedStyle(el).backgroundImage.includes("satin-specks.svg"));
  const groups = [
    [page.locator(".lang button.on"), page.locator(".lang button:not(.on)").first()],
    [page.locator(".chips button.on"), page.locator(".chips button:not(.on)").first()],
  ];
  for (const [selected, other] of groups) {
    await selected.scrollIntoViewIfNeeded();
    if (touch) await selected.tap();
    else await page.mouse.move(1,1);
    await selected.focus();
    assert.equal(await specks(selected),false,"Selection and focus alone keep only the glow");
    assert.ok(await selected.evaluate(el=>getComputedStyle(el).boxShadow!=="none"));
    if (touch) continue;
    await selected.hover();
    assert.equal(await specks(selected),true);
    await other.hover();
    assert.equal(await specks(other),true);
    assert.equal(await specks(selected),false,"Only the hovered control carries particles");
    await page.mouse.move(1,1);
    assert.equal(await specks(other),false);
  }
  await page.emulateMedia({reducedMotion:"reduce"});
}

async function checkLegalText(article) {
  const report = await article.evaluate(el => {
    const width = el.getBoundingClientRect().width;
    const noOverflow = el.scrollWidth <= Math.ceil(width) + 1;
    const units = Array.from(el.querySelectorAll(".legal-unit, a[href^='tel:']"));
    const intact = units.every(unit => {
      const range = document.createRange(); range.selectNodeContents(unit);
      const lines = [...range.getClientRects()].filter(rect => rect.width > 0);
      return lines.length === 1 && lines[0].width < width;
    });
    const language = (el.closest("[lang]")?.lang || document.documentElement.lang).slice(0,2);
    const shortWords = {
      it: "e ed o oppure ma che quando il lo la i gli le un una uno",
      en: "and or but if the an a",
      de: "und oder aber wenn der die das dem den des ein eine",
      fr: "et ou mais que le la les des un une"
    };
    const protectedWords = new Set(shortWords[language].split(" "));
    const typography = [];
    for (const paragraph of el.querySelectorAll("p")) {
      const reader = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      const chars = [];
      let text = "", node;
      while ((node = reader.nextNode())) {
        for (let i = 0; i < node.length; i++) chars.push([node,i]);
        text += node.data;
      }
      function line(index) {
        const range = document.createRange(), [node,offset] = chars[index];
        range.setStart(node,offset); range.setEnd(node,offset+1);
        return range.getBoundingClientRect().top;
      }
      for (const boundary of text.matchAll(/\.\s+(?=[A-ZÀ-Ÿ])/gu)) {
        if (line(boundary.index + boundary[0].length) <= line(boundary.index) + 2)
          typography.push("sentence: " + text.slice(boundary.index - 12,boundary.index + 18));
      }
      for (const word of text.matchAll(/(?<![\p{L}’'-])[\p{L}]+(?=\s+\S)/gu)) {
        if (!protectedWords.has(word[0].toLowerCase())) continue;
        const end = word.index + word[0].length;
        const space = text.slice(end).match(/^\s+/u)[0];
        if (Math.abs(line(end-1) - line(end+space.length)) > 2)
          typography.push("wrap: " + text.slice(word.index,end+space.length+16));
      }
    }
    const facts=el.querySelector(".legal-facts");
    let wellFormed;
    if(facts) {
      const pairs=[...facts.querySelectorAll("dt")].map(dt=>[dt,dt.nextElementSibling]);
      const first=pairs[0][1].getBoundingClientRect().left;
      wellFormed=pairs[0][1].textContent==="NIGRO SARAH PIZZERIA" && pairs.every(([term,value])=>
        Math.abs(value.getBoundingClientRect().left-first)<1 && term.getBoundingClientRect().right <= first) &&
        [...facts.querySelectorAll("a")].every(a=>getComputedStyle(a).textDecorationLine==="none");
    }
    const structure = facts
      ? wellFormed && el.querySelectorAll("section").length === 1 && el.querySelectorAll("h2,p").length === 0
      : el.querySelectorAll("h2").length >= 2;
    return { noOverflow, intact, typography, structure };
  });
  assert.deepEqual(report.typography,[]);
  assert.ok(report.noOverflow && report.intact && report.structure, JSON.stringify(report));
}

async function testViewport(width,height,touch) {
  const compact = width < 768 || touch && height <= 540;
  const options={ viewport:{width,height}, hasTouch:touch, isMobile:touch, reducedMotion:"reduce" };
  const context=await browser.newContext(options);
  context.setDefaultTimeout(15000);
  try {
    const page=await context.newPage();
    await page.goto(url,{waitUntil:"domcontentloaded"});
    await page.waitForFunction(() => document.fonts.status === "loaded");
    for(const language of languages) {
      await page.locator('.lang button[data-lang="'+language+'"]').click();
      await page.waitForFunction(lang => document.documentElement.lang === lang,language);
      const buttons=await page.locator(".lang button").evaluateAll(all => all.map(button => {
        const r=button.getBoundingClientRect(), style=getComputedStyle(button);
        return {active:button.getAttribute("aria-pressed")==="true",color:style.color,
          ring:style.borderTopColor, line:style.borderTopWidth, w:r.width,h:r.height,radius:style.borderTopLeftRadius};
      }));
      assert.equal(buttons.filter(button=>button.active).length,1);
      for(const button of buttons) {
        assert.ok(Math.abs(button.w - button.h) < .02);
        if (compact) assert.ok(button.w >= 28 && button.w <= 31);
        else assert.ok(button.w === (touch ? 40 : 33));
        assert.equal(button.radius,"50%");
        assert.equal(button.line,button.active ? "1px" : "0px");
        if (button.active) assert.equal(neutral(button.ring),false);
        assert.equal(neutral(button.color),!button.active);
      }
      assert.ok(neutral(await page.locator(".lang").evaluate(el=>getComputedStyle(el).borderTopColor)));
      const hours=await page.locator(".hours-copy").evaluate(el=>{
        const time=el.querySelector("strong"), note=el.querySelector(".hours-note");
        const a=time.getBoundingClientRect(), b=note.getBoundingClientRect(), tile=el.parentElement.getBoundingClientRect();
        return {weight:getComputedStyle(time).fontWeight, noteWeight:getComputedStyle(note).fontWeight,gap:b.top-a.bottom,
          centered:Math.abs(a.left+a.right-tile.left-tile.right)<2,
          edges:Math.abs(a.left-b.left)+Math.abs(a.right-b.right)<2};
      });
      assert.ok(hours.weight==="300" && hours.noteWeight===hours.weight && hours.gap >= 7.5 && hours.centered && hours.edges, JSON.stringify(hours));
    }
    const italian=page.locator('.lang button[data-lang="it"]');
    if (!touch) {
      await italian.hover();
      const idle=await italian.evaluate(el=>({color:getComputedStyle(el).color,fill:getComputedStyle(el).backgroundColor}));
      assert.ok(neutral(idle.color) && neutral(idle.fill));
    }
    await italian.click();
    if (width===390) {
      await page.setViewportSize({width:height,height:width});
      assert.ok(await page.locator(".lang button").evaluateAll(buttons=>buttons.every(el=>{
        const r=el.getBoundingClientRect();return Math.abs(r.width - r.height) < .02;
      })));
      await page.setViewportSize({width,height});
    }
    if (compact) {
      const tappable = await page.locator(".lang button").evaluateAll(buttons => buttons.every(button => {
        const box = button.getBoundingClientRect();
        const cx = (box.left + box.right) / 2, cy = (box.top + box.bottom) / 2;
        return [-21, 21].every(dy => button.contains(document.elementFromPoint(cx, cy + dy)));
      }));
      assert.ok(tappable, "Each compact language choice has its own 44px-high touch area");
    }
    const flame=page.locator(".site-brand");
    const brandInk=()=>flame.locator("svg").evaluate(el=>getComputedStyle(el).fill);
    if(!touch) {
      await flame.hover();
      assert.equal(neutral(await brandInk()),false);
      await page.mouse.move(width/2,150);
      assert.equal(neutral(await brandInk()),true);
    }
    await page.keyboard.press("Tab");
    await flame.focus();
    await page.waitForFunction(()=>{
      const el=document.querySelector(".site-brand");
      const svg=el.querySelector("svg"), box=svg.getBoundingClientRect(), languages=el.nextElementSibling.getBoundingClientRect();
      return svg.querySelector("use").getBBox().width>1000 && box.right<=languages.left-7
        && languages.right<=document.documentElement.clientWidth && box.width>=95;
    });
    assert.ok(!neutral(await brandInk()));
    await flame.blur();
    if (width===390 || width===1440) {
      await checkAnchorsAndCursor(page,touch);
      await checkParticles(page,touch);
    }
    for (const [id,ratio] of [["home",0],["classiche",null],["gallery",null],["info",1]]) {
      await page.evaluate(({id,ratio})=>{
        const y=ratio===null ? document.getElementById(id).getBoundingClientRect().top+scrollY : (document.documentElement.scrollHeight-innerHeight)*ratio;
        scrollTo({top:y,behavior:"instant"});
      },{id,ratio});
      await page.waitForFunction(id=>document.querySelector(".vr-dock a[aria-current]")?.getAttribute("href")==="#"+id,id);
      if(!touch) await page.locator('.vr-dock a[href="tel:+390427541232"]').hover();
      const tiles=await page.locator(".vr-dock a").evaluateAll(all=>all.map(a=>{
        const s=getComputedStyle(a.firstElementChild);
        const icon = a.querySelector(".dock-tile > *");
        const mark=icon.querySelector("use"), bbox=mark.getBBox();
        const glyphInk = getComputedStyle(mark).stroke;
        return {active:a.hasAttribute("aria-current"), ink:s.color, border:s.borderTopColor, rim:s.borderTopWidth,
          balanced:bbox.width>=14 && bbox.width<=20 && bbox.height>=15 && bbox.height<=20,
          lowerGlow:s.backgroundImage.includes("radial-gradient"), glyphInk};
      }));
      assert.equal(tiles.filter(t=>t.active).length,1);
      assert.ok(tiles.every(t=>t.balanced));
      assert.ok(tiles.every(t=>t.rim==="1px" && neutral(t.border)!==t.active && neutral(t.ink)!==t.active && t.glyphInk===t.ink && t.lowerGlow===t.active));
    }
    for(const progress of [0,.5,1]) {
      await page.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:"instant"}),progress);
      await page.waitForFunction(f=>{
        const s=getComputedStyle(document.querySelector(".vr-scroll-progress > span"));
        return s.backgroundImage.includes("linear-gradient") && Math.abs(new DOMMatrix(s.transform).m22-f)<.01;
      },progress);
    }
    const footer=await page.locator(".footer-row").evaluate(el=>{
      const nav=el.querySelector("nav"), credit=el.querySelector(".studio-credit"), mark=credit.querySelector("img");
      return {divider:getComputedStyle(nav).borderTopWidth, width:el.getBoundingClientRect().width, wordmark:mark.getBoundingClientRect().height,
        stacked:credit.getBoundingClientRect().bottom<=nav.getBoundingClientRect().top};
    });
    assert.equal(footer.divider,"0px");
    assert.equal(footer.stacked, width<768);
    assert.ok(footer.wordmark>=8.3);
    if(width===390) {
      for(const language of languages) {
        await page.locator('.lang button[data-lang="'+language+'"]').click();
        for (const slug of slugs) {
          await page.locator('.footer-row nav a[href$="/'+slug+'.html"]').click();
          const article=page.locator("dialog[open] article.legal-text");
          await article.waitFor(); await checkLegalText(article);
          await page.locator("dialog[open] .modal-close").click();
        }
      }
    }
    if(width===320 || width===1440) {
      const staticContext=await browser.newContext({...options,javaScriptEnabled:false});
      try {
        const page=await staticContext.newPage();
        for(const lang of languages) for(const slug of slugs) {
          const path=(lang==="it"?"":lang+"/")+slug+".html";
          const response=await page.goto(new URL(path,url).href);
          assert.ok(response.ok());
          // A script-disabled Firefox document can paint its fonts without settling a page-side promise.
          if (await page.evaluate(() => document.fonts.status !== "loaded")) await page.waitForLoadState("networkidle");
          assert.equal(await page.evaluate(() => document.fonts.status), "loaded");
          const article=page.locator("article.legal-text");
          await checkLegalText(article);
          if (width===320) {
            await article.evaluate(el=>{ el.style.fontSize="200%"; });
            assert.ok(await article.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
          }
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        }
      } finally { await staticContext.close(); }
    }
    console.log(engine,width,height,"OK");
  } finally { await context.close(); }
}
try {
  for(const [w,h,t] of viewports) await testViewport(w,h,t);
} finally { await browser.close(); }
