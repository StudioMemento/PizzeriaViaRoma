import {
  setup,
  pageFor,
  position,
  drag,
  noOverflow,
  assert,
} from "./browser-helpers.mjs";
import { readFile } from "node:fs/promises";
const baseline = JSON.parse(
  await readFile("tests/fixtures/v18-content.json", "utf8"),
);
const allergenBaseline = JSON.parse(
  await readFile("tests/fixtures/v18-allergens.json", "utf8"),
);
const socialBaseline = JSON.parse(
  await readFile("tests/fixtures/v18-social-layout.json", "utf8"),
);
const qa = await setup();
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 900, height: 1200 },
    { width: 320, height: 700 },
  ]) {
    const { page, problems } = await pageFor(qa.browser, qa.url, viewport, {
      hasTouch: viewport.width < 700,
    });
    assert.equal(
      (await page.locator(".hero-slogan").innerText()).replace(/\s+/g, " "),
      "La pizza di sempre, con un tocco in più!",
    );
    assert.equal(await page.locator(".vr-dock .dock-tile").count(), 4);
    await page.locator(".hero-cta").click();
    await page.waitForFunction(() => location.hash === "#menu");
    for (const lang of ["en", "de", "fr", "it"]) {
      await page.locator(`[data-lang="${lang}"]`).click();
      assert.equal(await page.locator("html").getAttribute("lang"), lang);
      assert.ok(
        (await page.locator(".vr-dock").innerText())
          .toLowerCase()
          .includes(baseline.T[lang].tab_menu.toLowerCase()),
      );
    }
    // Every displayed main dish price and printed category heading is checked
    // against independently captured V18 content, not a second rendering loop.
    for (const [category, rows] of Object.entries(baseline.MENU))
      for (const [name, , price] of rows) {
        const item = page
          .locator(`#cat-${category} [data-menu-item]`)
          .filter({ has: page.locator(".nome", { hasText: name }) });
        const candidates = await item.all();
        const exact = [];
        for (const candidate of candidates)
          if ((await candidate.locator(".nome").textContent()).trim() === name)
            exact.push(candidate);
        assert.equal(exact.length, 1, `${name} duplicate/missing`);
        assert.equal(await exact[0].locator(".prezzo").innerText(), price);
        const expected = allergenBaseline.items[`${category}:${name}`];
        const trigger = exact[0].locator(".allergen-trigger");
        if (name !== "Coperto" && (expected.codes.length || expected.frozen))
          assert.equal(
            (await trigger.textContent()).replace(/\s/g, ""),
            expected.codes.join("·") + (expected.frozen ? "*" : ""),
            `Allergen mapping changed: ${name}`,
          );
        else assert.equal(await trigger.count(), 0);
      }
    for (const id of [
      "classiche",
      "audaci",
      "bianche",
      "calzoni",
      "cucina",
      "stuzzicherie",
      "dolci",
      "bevande",
    ])
      assert.equal(
        await page.locator(`#cat-${id} h3`).innerText(),
        baseline.T.it.cats[id][0].toUpperCase(),
      );
    await position(page, "#pizza-slider");
    await page.locator("#forno .mid img").evaluate((img) => img.decode());
    assert.ok(
      await page
        .locator("#forno .mid img")
        .evaluate(
          (img) =>
            img.naturalWidth > 0 && Number(getComputedStyle(img).opacity) > 0,
        ),
      "Pizza photograph is invisible",
    );
    const first = await page.locator("#forno .mid figcaption").innerText();
    await page.locator("#pizza-slider .pizza-arrow.next").click();
    assert.notEqual(
      await page.locator("#forno .mid figcaption").innerText(),
      first,
    );
    const second = await page.locator("#forno .mid figcaption").innerText();
    await drag(page, "#forno .mid img");
    assert.notEqual(
      await page.locator("#forno .mid figcaption").innerText(),
      second,
      "Pizza image drag failed",
    );
    await position(page, "#catshow");
    await page
      .locator("#showrail .is-active img")
      .evaluate((img) => img.decode());
    assert.ok(
      await page
        .locator("#showrail .is-active img")
        .evaluate(
          (img) =>
            img.naturalWidth > 0 && Number(getComputedStyle(img).opacity) > 0,
        ),
      "Category artwork is invisible",
    );
    const cat = await page
      .locator("#showrail .is-active")
      .getAttribute("data-cat");
    const arrowBox = await page.locator("#catshow .chev.r").boundingBox(),
      artBox = await page
        .locator("#showrail .is-active .preview-window")
        .boundingBox();
    assert.ok(
      arrowBox &&
        artBox &&
        Math.abs(
          arrowBox.y + arrowBox.height / 2 - artBox.y - artBox.height / 2,
        ) < 3,
      "Category arrow is hidden or vertically misaligned",
    );
    await drag(page, "#showrail .is-active img");
    assert.notEqual(
      await page.locator("#showrail .is-active").getAttribute("data-cat"),
      cat,
      "Category image drag failed",
    );
    assert.ok(
      !new URL(page.url()).hash.startsWith("#cat-"),
      "Drag activated category link",
    );
    await page.locator("#showrail .is-active a").click();
    assert.ok(new URL(page.url()).hash.startsWith("#cat-"));
    await position(page, "#cat-calzoni");
    await page.locator("#cat-calzoni .allergen-trigger").first().click();
    await page.locator("dialog[open]").waitFor();
    assert.equal(await page.locator(".allergen-list li").count(), 15);
    assert.equal(
      await page.locator(".allergen-list li").last().locator("b").innerText(),
      "*",
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").count(), 0);
    assert.equal(await page.locator(".album").count(), 5);
    for (const id of [
      "esterno",
      "bancone",
      "sala_sinistra",
      "sala_destra",
      "via_roma",
    ]) {
      const album = page.locator(`#album-${id}`);
      await position(page, `#album-${id}`);
      await album.locator(".gallery-arrow.next").click();
      assert.equal(
        await album.locator(".gallery-stage").getAttribute("data-index"),
        "1",
      );
      await drag(page, `#album-${id} .is-current img`);
      assert.equal(
        await album.locator(".gallery-stage").getAttribute("data-index"),
        "2",
      );
      assert.equal(
        await page.locator("dialog").count(),
        0,
        "Drag accidentally opened image",
      );
      await album.locator(".is-current").click();
      await page.locator("dialog[open]").waitFor();
      assert.ok(
        (await page.locator("#modal-title").innerText()).includes("3 /"),
      );
      assert.equal(
        await page.locator(".lightbox-image img").getAttribute("src"),
        "/" + baseline.GALLERY_ALBUMS[id][2],
      );
      await page.locator(".lightbox-controls button").last().click();
      assert.equal(
        await page.locator(".lightbox-image img").getAttribute("src"),
        "/" + baseline.GALLERY_ALBUMS[id][3],
      );
      await page.keyboard.press("Escape");
    }
    await position(page, "#customer");
    const community = await page
      .locator(".community-photo img")
      .first()
      .getAttribute("src");
    await page.locator(".community-controls button").last().click();
    assert.notEqual(
      await page.locator(".community-photo img").first().getAttribute("src"),
      community,
    );
    assert.equal(await page.locator('#customer a[href*="wa.me"]').count(), 0);
    const socialLinks = await page
      .locator("#social .social-card")
      .evaluateAll((es) => es.map((e) => e.href));
    assert.equal(socialLinks.length, 4);
    assert.ok(socialLinks[0].includes("pizzeriaviaromamaniago"));
    assert.equal(await page.locator("#social .social-lead").innerText(), "Seguici per le novità e gli scatti dal locale.");
    assert.deepEqual(
      await page
        .locator("#social .review-runner .rev:not([aria-hidden]) blockquote p")
        .allTextContents(),
      baseline.REVIEW_LIBRARY.map((r) => r.text),
    );
    // Social links retain their dimensions and typography; editorial text and
    // the manual review reader are intentionally revised in V20.
    const fixtureLayout = socialBaseline.layouts[viewport.width];
    const expectedLayout = fixtureLayout && Object.fromEntries([".social-actions", ".social-card", ".social-head h2"].map(key => [key, fixtureLayout[key]]));
    if (expectedLayout) {
      await position(page, "#social");
      const layout = await page.evaluate((selectors) => {
        const out = {};
        for (const selector of selectors) {
          const el = document.querySelector("#social " + selector),
            s = getComputedStyle(el),
            b = el.getBoundingClientRect();
          out[selector] = {
            width: Math.round(b.width),
            height: Math.round(b.height),
            font: s.fontFamily,
            size: s.fontSize,
            weight: s.fontWeight,
            color: s.color,
            spacing: s.letterSpacing,
            columns: s.gridTemplateColumns,
          };
        }
        return out;
      }, Object.keys(expectedLayout));
      // The shorter editorial lead changes intrinsic column sizing. Keep the
      // heading typography and height, plus exact social-card geometry.
      delete layout[".social-head h2"].width;
      delete expectedLayout[".social-head h2"].width;
      assert.deepEqual(
        layout,
        expectedLayout,
        `Social layout changed at ${viewport.width}px`,
      );
    }
    await position(page, "#dove");
    assert.equal(
      await page.locator('#dove a[href="tel:+390427541232"]').count(),
      1,
    );
    assert.equal(
      await page.locator('#dove a[href="https://wa.me/393802453757"]').count(),
      1,
    );
    await noOverflow(page);
    assert.deepEqual(problems, [], `Browser errors at ${viewport.width}px`);
    await page.goto("about:blank");
    console.log(`Flows passed at ${viewport.width}×${viewport.height}`);
  }
  console.log("BROWSER_FLOWS_OK");
} finally {
  await qa.close();
}
