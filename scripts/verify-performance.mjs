import {
  setup,
  pageFor,
  position,
  noOverflow,
  assert,
} from "./browser-helpers.mjs";
const qa = await setup();
try {
  const { page, problems } = await pageFor(qa.browser, qa.url);
  await page.addInitScript(() => {
    window.__qaFrames = 0;
    const native = window.requestAnimationFrame;
    window.requestAnimationFrame = (fn) =>
      native.call(window, (ts) => {
        window.__qaFrames++;
        fn(ts);
      });
  });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page
      .locator(".scroll-progress")
      .evaluate((e) => getComputedStyle(e).width),
    "2px",
  );
  assert.equal(
    await page
      .locator("html")
      .evaluate((e) => getComputedStyle(e).scrollbarWidth),
    "none",
  );
  assert.equal(
    await page
      .locator(".vr-dock")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  assert.equal(
    await page
      .locator(".hero-cta")
      .evaluate((e) => getComputedStyle(e).borderRadius),
    "0px",
  );
  assert.equal(await page.locator("video,#storia,.walkthrough").count(), 0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(80);
  assert.equal(
    Number(
      await page.locator(".scroll-progress").getAttribute("data-progress"),
    ),
    0,
  );
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(150);
  assert.equal(
    Number(
      await page.locator(".scroll-progress").getAttribute("data-progress"),
    ),
    1,
  );
  await position(page, "#cat-audaci");
  await page.waitForTimeout(1000);
  const start = await page.evaluate(() => window.__qaFrames);
  await page.waitForTimeout(750);
  const frames = await page.evaluate(() => window.__qaFrames);
  assert.ok(
    frames - start <= 3,
    `Offscreen effects still scheduling frames: ${frames - start}`,
  );
  await position(page, "#social .review-track", 350);
  await page.mouse.move(10, 350);
  await page.waitForTimeout(250);
  const moving = await page
    .locator(".review-runner")
    .evaluate((e) => e.style.transform);
  await page.waitForTimeout(300);
  assert.equal(
    await page.locator(".review-runner").evaluate((e) => e.style.transform),
    moving,
    "Review content moved without input",
  );
  await position(page, "#cat-audaci");
  await page.waitForTimeout(100);
  const paused = await page
    .locator(".review-runner")
    .evaluate((e) => e.style.transform);
  await page.waitForTimeout(300);
  assert.equal(
    await page.locator(".review-runner").evaluate((e) => e.style.transform),
    paused,
    "Offscreen review ticker kept moving",
  );
  for (const width of [320, 390, 768, 900, 1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
    assert.ok(
      await page
        .locator(".vr-visit-contact .visit-copy strong")
        .evaluateAll((es) =>
          es.every((e) => e.scrollWidth <= e.clientWidth + 1),
        ),
      `Contact number is clipped at ${width}px`,
    );
  }
  assert.deepEqual(problems, []);
  await page.goto("about:blank");
  const reduced = await pageFor(
    qa.browser,
    qa.url,
    { width: 390, height: 844 },
    { reducedMotion: "reduce", isMobile: true, hasTouch: true },
  );
  assert.equal(await reduced.page.locator(".hero-dot-field canvas").count(), 0);
  assert.equal(
    await reduced.page.locator(".magic-bento[data-motion]").count(),
    0,
  );
  await position(reduced.page, "#social .review-track", 350);
  const stable = await reduced.page
    .locator(".review-runner")
    .evaluate((e) => e.style.transform);
  await reduced.page.waitForTimeout(350);
  assert.equal(
    await reduced.page
      .locator(".review-runner")
      .evaluate((e) => e.style.transform),
    stable,
  );
  // Real touch input must swipe horizontally while allowing native vertical scroll.
  await position(reduced.page, "#album-esterno");
  const stage = reduced.page.locator("#album-esterno .gallery-stage");
  const b = await stage.boundingBox();
  const x = b.x + b.width * 0.6,
    y = b.y + b.height * 0.5;
  const cdp = await reduced.page.context().newCDPSession(reduced.page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - i * 16, y: y + 1 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  assert.equal(
    await stage.getAttribute("data-index"),
    "1",
    "Touch swipe failed",
  );
  const scroll = await reduced.page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 190, y: 420 }],
  });
  for (let i = 1; i <= 8; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 190, y: 420 - i * 20 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await reduced.page.waitForTimeout(250);
  assert.ok(
    (await reduced.page.evaluate(() => scrollY)) > scroll,
    "Vertical touch scroll blocked",
  );
  assert.deepEqual(reduced.problems, []);
  await reduced.page.goto("about:blank");
  console.log(
    "UI_PERFORMANCE_OK — 2px progress, 7 widths, unclipped contacts, reduced motion, sleeping offscreen effects, native touch swipe/scroll.",
  );
} finally {
  await qa.close();
}
