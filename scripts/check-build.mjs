import { readFile, readdir, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
const html = await readFile("dist/index.html", "utf8");
assert.ok(
  html.includes("Margherita Classica") && html.includes("cat-calzoni"),
  "Menu missing from initial HTML",
);
assert.ok(!html.includes("<!--app-html-->"));
assert.ok(!html.includes("walkthrough"));
assert.ok(
  html.includes("noindex,nofollow"),
  "Preview indexing protection missing",
);
const local = [...html.matchAll(/(?:src|href)="(\/assets\/[^"#?]+)"/g)].map(
  (m) => m[1],
);
for (const url of local) await stat("dist" + url);
let js = 0,
  css = 0;
const jsSizes = new Map();
for (const file of await readdir("dist/assets")) {
  if (!/\.(js|css)$/.test(file)) continue;
  const bytes = await readFile("dist/assets/" + file),
    gzip = gzipSync(bytes).length;
  if (file.endsWith(".js")) { js += gzip; jsSizes.set(`assets/${file}`, gzip); }
  else css += gzip;
}
// Count the initial static import graph independently from deferred chunks.
const manifest = JSON.parse(await readFile("dist/.vite/manifest.json", "utf8"));
const entryKeys = Object.keys(manifest).filter((key) => manifest[key].isEntry);
assert.ok(entryKeys.length > 0, "Vite entry manifest missing");
const initialKeys = new Set();
const collect = (key) => {
  if (initialKeys.has(key)) return;
  const chunk = manifest[key];
  assert.ok(chunk, `Missing manifest import: ${key}`);
  initialKeys.add(key);
  for (const dependency of chunk.imports || []) collect(dependency);
};
entryKeys.forEach(collect);
const initialFiles = [...new Set([...initialKeys].map(key => manifest[key].file).filter(file => file.endsWith(".js")))];
const initialJs = initialFiles.reduce((sum, file) => {
  assert.ok(jsSizes.has(file), `Missing initial JavaScript: ${file}`);
  return sum + jsSizes.get(file);
}, 0);
assert.ok(js < 160_000, `JS budget exceeded: ${js}`);
assert.ok(css < 35_000, `CSS budget exceeded: ${css}`);
for (const file of [
  "privacy.html",
  "cookie.html",
  "note-legali.html",
  "legal.css",
  "assets/fonts/jost.css",
  "assets/fonts/phosphor.css",
])
  await stat("dist/" + file);
assert.ok(
  !(await readFile("dist/legal.css", "utf8")).includes(
    "https://fonts.googleapis.com",
  ),
  "External font dependency",
);
console.log(
  `PRODUCTION_CHECK_OK — prerendered menu; initial JS ${Math.round(initialJs / 1024)} KiB gzip, all JS chunks ${Math.round(js / 1024)} KiB gzip, CSS ${Math.round(css / 1024)} KiB gzip, HTML ${Math.round(gzipSync(html).length / 1024)} KiB gzip.`,
);

console.log(`BUILD_METRICS ${JSON.stringify({ initialJsGzipBytes: initialJs, allJsGzipBytes: js, cssGzipBytes: css, htmlGzipBytes: gzipSync(html).length, htmlBytes: Buffer.byteLength(html), initialJsFiles: initialFiles.length, totalJsFiles: jsSizes.size })}`);
