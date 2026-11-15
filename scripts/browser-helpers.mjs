import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
export { assert };
export async function serve(directory = "dist") {
  const root = resolve(directory);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
  };
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://local.test").pathname,
      );
      let file = resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403);
        return res.end();
      }
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      res.setHeader(
        "Content-Type",
        types[extname(file)] || "application/octet-stream",
      );
      res.end(await readFile(file));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}
export async function setup() {
  const server = await serve();
  let options = { headless: true };
  // Optional official serverless Chromium adapter for constrained CI. Normal local
  // runs use the browser installed by `npx playwright install chromium`.
  if (process.env.QA_BROWSER_ADAPTER) {
    const { default: adapter } = await import(
      pathToFileURL(resolve(process.env.QA_BROWSER_ADAPTER))
    );
    options = {
      ...options,
      executablePath: await adapter.executablePath(),
      args: adapter.args,
    };
  } else if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)
    options.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch(options);
  await mkdir("test-results", { recursive: true });
  return {
    browser,
    url: server.url,
    close: async () => {
      await browser.close();
      await server.close();
    },
  };
}
export async function pageFor(
  browser,
  url,
  viewport = { width: 1440, height: 900 },
  options = {},
) {
  const page = await browser.newPage({ viewport, ...options });
  const problems = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { page, problems };
}
export async function position(page, selector, offset = 145) {
  await page
    .locator(selector)
    .evaluate(
      (el, offset) =>
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollY - offset,
          behavior: "instant",
        }),
      offset,
    );
  await page.waitForTimeout(160);
}
export async function drag(page, selector, direction = -1) {
  await page.locator(selector).waitFor({ state: "visible" });
  await page.waitForTimeout(550);
  const box = await page.locator(selector).boundingBox();
  assert.ok(box, "Drag target exists");
  const x = box.x + box.width * 0.5,
    y = box.y + Math.min(box.height * 0.45, 120);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + direction * 110, y + 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(100);
}
export async function noOverflow(page) {
  const size = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  assert.ok(
    size.document <= size.viewport + 1,
    `Horizontal overflow: ${JSON.stringify(size)}`,
  );
}
