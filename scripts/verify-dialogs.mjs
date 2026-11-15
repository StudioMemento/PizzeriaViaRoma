import { setup, pageFor, position, assert } from "./browser-helpers.mjs";
const qa = await setup();
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const { page, problems } = await pageFor(qa.browser, qa.url, viewport);
    await position(page, "#dove");
    for (const slug of ["privacy", "cookie", "note-legali"]) {
      const trigger = page.locator(`.legal-links a[href="${slug}.html"]`);
      await trigger.click();
      await page.locator("dialog[open]").waitFor();
      assert.ok((await page.locator(".legal-body").innerText()).length > 500);
      await page.locator(".legal-body p").first().click();
      assert.equal(
        await page.locator("dialog[open]").count(),
        1,
        "Interior click closed dialog",
      );
      assert.equal(
        await page
          .locator(".legal-body")
          .evaluate((el) => getComputedStyle(el).userSelect),
        "text",
      );
      await page.keyboard.press("Escape");
      await page.locator("dialog").waitFor({ state: "detached" });
      assert.ok(
        await trigger.evaluate((el) => el === document.activeElement),
        "Focus was not restored",
      );
      await trigger.click();
      await page.locator("dialog[open]").waitFor();
      await page.locator(".modal-close").click();
      await page.locator("dialog").waitFor({ state: "detached" });
      assert.ok(
        await trigger.evaluate((el) => el === document.activeElement),
        "Focus was not restored after the close button",
      );
      await trigger.click();
      await page.locator("dialog[open]").waitFor();
      await page.mouse.click(2, 2);
      await page.locator("dialog").waitFor({ state: "detached" });
      assert.ok(
        await trigger.evaluate((el) => el === document.activeElement),
        "Focus was not restored after the backdrop",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.style.overflow),
        "",
      );
    }
    // Native modal focus stays inside the panel, including reverse traversal.
    await page.locator(".legal-links a").first().click();
    await page.locator("dialog[open]").waitFor();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      assert.ok(
        await page.evaluate(
          () =>
            !!document.activeElement?.closest("dialog") ||
            document.activeElement === document.body,
        ),
      );
    }
    await page.keyboard.press("Escape");
    assert.deepEqual(problems, []);
    await page.goto("about:blank");
  }
  console.log(
    "DIALOG_FLOWS_OK — 3 legal texts × Escape/X/backdrop × desktop/mobile; selection and focus restoration.",
  );
} finally {
  await qa.close();
}
