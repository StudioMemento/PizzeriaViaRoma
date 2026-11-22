import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const engine = process.env.BROWSER_ENGINE || "chromium";
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await pw[engine].launch({ headless:true, executablePath:process.env.BROWSER_PATH || process.env.CHROMIUM_PATH });
const shots = process.env.QA_DIR;
if (shots) await mkdir(shots, { recursive:true });

function measureOven() {
  const box = el => el.getBoundingClientRect();
  const ink = el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect();
  };
  const nav = box(document.querySelector(".vr-dock"));
  const second = box(document.querySelectorAll(".dock-tile")[1]);
  const captionX = second.left;
  const takeaway = document.querySelector("#asporto");
  const takeawayTitle = takeaway.querySelector("h2");
  const textBox = node => {
    const range = document.createRange();
    range.selectNodeContents(node);
    return [...range.getClientRects()];
  };
  const question = textBox(takeawayTitle.firstChild);
  const answer = textBox(takeaway.querySelector("p").firstChild);
  const card = box(takeaway.querySelector(".crust-card"));
  const caption = box(takeaway.querySelector(".takeaway-copy"));
  const x = caption.left - card.left, y = card.bottom - caption.bottom;
  const titleSize = parseFloat(getComputedStyle(takeawayTitle).fontSize);
  const captionSize = parseFloat(getComputedStyle(takeaway.querySelector("p")).fontSize);
  const textFits = titleSize >= captionSize * 2 && question.length <= 2 && answer.length <= 2 &&
    question[0].top >= card.top && question.at(-1).top < answer[0].top && Math.abs(x - y) < 1 &&
    [...question, ...answer].every(r => Math.abs(r.left - caption.left) < 1 && r.right <= card.right - x + 1 && r.bottom <= card.bottom);
  const guest = document.querySelector("#customer");
  const guestCard = box(guest.querySelector(".crust-card")), guestCopy = box(guest.querySelector(".takeaway-copy"));
  const guestHeading = guest.querySelector("h2");
  const guestInk = [...textBox(guestHeading.firstChild), box(guestHeading.querySelector("svg"))];
  const photoLink = guest.querySelector("a");
  const communityFits = Math.abs((guestCopy.left - guestCard.left) - (guestCard.bottom - guestCopy.bottom)) < 1 &&
    guestInk.every(r => r.left >= guestCopy.left - 1 && r.right <= guestCopy.right + 1 && r.bottom <= guestCard.bottom) &&
    !guest.querySelector(".takeaway-copy p") && photoLink.getAttribute("aria-label").includes("Google Maps") &&
    Math.abs(box(guestHeading.querySelector("svg")).right - guestCopy.right) < 1 &&
    Math.abs(box(guest.querySelector("img")).width - guestCard.width) <= 2 &&
    guest.querySelector("img").getAttribute("src").includes("/polaroid-interni-");
  const head = box(document.querySelector(".site-top"));
  const oven = document.querySelector("#pizza-slider");
  const area = box(oven);
  const title = ink(oven.querySelector(".oven-heading"));
  const image = box(oven.querySelector(".vr-pizza-card img"));
  const stage = box(oven.querySelector("#forno"));
  const arrows = [...oven.querySelectorAll(".pizza-arrow")].map(box);
  const center = box(oven.querySelector('.vr-pizza-card[data-active="true"]'));
  const sides = [-1, 1].map(direction => box(oven.querySelector('[data-forno-index="'+(direction < 0 ? 39 : 1)+'"]')));
  const gap = [center.left - sides[0].right, sides[1].left - center.right];
  const measures = arrows.map((r,i) => ({
    centerX: (r.left + r.right) / 2,
    expectedX: i ? (center.right + sides[1].left) / 2 : (sides[0].right + center.left) / 2,
    centerY: Math.abs((r.top+r.bottom-center.top-center.bottom)/2),
    width: r.width, height: r.height, sideScale: sides[i].width / center.width,
  }));
  const problems = [];
  for (const caption of oven.querySelectorAll(".pizza-caption")) {
    const heading = caption.querySelector("h3");
    const name = ink(heading);
    const text = document.createRange();
    text.selectNodeContents(heading);
    const ingredients = [...caption.querySelectorAll("li")];
    const aligned = [heading, ...ingredients].every(el => Math.abs(captionX-box(el).left) < 1);
    const ordered = ingredients.every((li,i) => !i || ink(li).top > ink(ingredients[i-1]).bottom-4);
    if (!aligned || !ordered || text.getClientRects().length > (innerHeight <= 490 && innerWidth > innerHeight ? 2 : 1) || name.right > box(heading).right + 1 ||
        name.bottom > ink(ingredients[0]).top+4 || ink(ingredients.at(-1)).bottom > nav.top-3)
      problems.push({pizza:heading.textContent, aligned, ordered, nameRight:name.right, limit:box(heading).right,
        nameBottom:name.bottom, start:ink(ingredients[0]).top, last:ink(ingredients.at(-1)).bottom,dock:nav.top});
  }
  return {height:area.height, device:innerHeight, top:area.top, black:getComputedStyle(oven).backgroundColor, problems,
    textFits, communityFits, image:center.width, title:title.top, header:head.bottom, headingAligned:Math.abs(box(oven.querySelector("h2")).left-nav.left)<1,
    headingFilled: Math.abs(ink(oven.querySelector(".spread-line > :first-child")).left-title.left)<1 &&
      Math.abs(ink(oven.querySelector(".spread-line > :last-child")).right-box(oven.querySelector("h2")).right)<2,
    titleGap:stage.top-title.bottom, landscape:innerWidth>innerHeight && innerHeight<=490, measures, gap,
    stage:stage.height, overflow:document.documentElement.scrollWidth > innerWidth+1,
    blurAbove:+getComputedStyle(document.querySelector(".vr-edge-blur")).zIndex > +getComputedStyle(oven).zIndex};

}

try {
  const sizes = [[320,480],[320,568],[390,844],[480,320],[568,280],[667,375],[844,390],[768,1024],[1440,900],[2560,1080],[3440,1440]];
  for (const [width,height] of sizes) {
    const page = await browser.newPage({viewport:{width,height}, hasTouch:width<900, isMobile:width<900, reducedMotion:"reduce"});
    try {
      await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
      await page.evaluate(() => document.fonts.ready);
      const oven = page.locator("#pizza-slider");
      for (const lang of ["en","de","fr","it"]) {
        await page.locator('[data-lang="'+lang+'"]').click();
        await oven.evaluate(el => scrollTo({top:scrollY+el.getBoundingClientRect().top, behavior:"instant"}));
        await page.waitForFunction(lang=>document.documentElement.lang===lang,lang);
        const info = await page.evaluate(measureOven);
        assert.ok(!info.overflow && Math.abs(info.top)<1 && Math.abs(info.device*1.2-info.height)<1 && info.image>85 && info.stage>72, JSON.stringify({width,height,lang,info}));
        assert.ok(info.textFits && info.communityFits, "Feature card captions must fit: "+JSON.stringify({width,height,lang,info}));
        assert.equal(info.black,"rgb(9, 9, 9)");
        assert.ok(info.blurAbove && info.headingAligned && info.headingFilled && info.title>info.header-2, JSON.stringify({width,height,lang,info}));
        assert.ok(info.landscape || info.titleGap >= 12, "Section title touches the stage: "+JSON.stringify(info));
        for (const m of info.measures) {
          assert.ok(Math.abs(m.centerX-m.expectedX)<1 && m.centerY<1 && m.width>=44 && m.height>=44 && m.sideScale<.73, JSON.stringify(m));
        }
        assert.ok(info.gap.every(gap=>gap>=47), "Chevron lane is too small");
        assert.deepEqual(info.problems.slice(0,2),[], width+"×"+height+" "+lang+" "+JSON.stringify(info.problems.slice(0,2)));
      }
      for (const progress of [0,.1,.2]) {
        const covers = await oven.evaluate((el,p) => {
          scrollTo({top:el.getBoundingClientRect().top + scrollY + p*innerHeight,behavior:"instant"});
          const frame=el.querySelector(".pizza-frame").getBoundingClientRect();
          return Math.abs(frame.top)<=1 && Math.abs(frame.bottom-innerHeight)<=1;
        }, progress);
        assert.ok(covers, "Adjacent section visible inside oven hold");
      }
      if (shots && [320,390,568,844,1440,3440].includes(width)) {
        const rafIndex = await oven.locator(".pizza-caption h3").evaluateAll(all => all.findIndex(h=>h.textContent==="Raf"));
        await oven.locator("#forno").focus({preventScroll:true});
        await page.keyboard.press("Home");
        for (let i=0;i<rafIndex;i++) await page.keyboard.press("ArrowRight");
        await page.waitForFunction(()=>document.querySelector('.pizza-caption[aria-hidden="false"] h3').textContent==="Raf");
        await page.keyboard.press("Tab");
        await page.evaluate(()=>document.activeElement?.blur());
        await page.screenshot({path:shots+"/forno-"+width+".jpg", type:"jpeg", quality:78});
        if ([390,1440].includes(width)) {
          for (const [sel,label] of [["#asporto .crust-card","asporto"],[".map-photo","mappa"],[".menu-art","menu"]]) {
            const item = page.locator(sel).first();
            await item.scrollIntoViewIfNeeded();
            await item.evaluate(async el=>{const img=el.querySelector("img"); if(img) await img.decode();});
            await item.screenshot({path:shots+"/"+label+"-"+width+".jpg",type:"jpeg",quality:80});
          }
        }
      }
      console.log(engine,width+"×"+height,"40 captions × 4 languages fit above dock");
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
