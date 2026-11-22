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
const local = [...html.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)].map(
  (m) => m[1].split("?")[0],
);
for (const url of local) await stat("dist" + url);
let js = 0,
  css = 0;
const jsSizes = new Map();
const cssSizes = new Map();
for (const file of await readdir("dist/assets")) {
  if (!/\.(js|css)$/.test(file)) continue;
  const bytes = await readFile("dist/assets/" + file),
    gzip = gzipSync(bytes).length;
  if (file.endsWith(".js")) { js += gzip; jsSizes.set(`assets/${file}`, gzip); }
  else { css += gzip; cssSizes.set(`assets/${file}`, gzip); }
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
// Budget includes the 40-slide catalogue and the responsive takeaway feature.
assert.ok(initialJs < 102_000, `Initial JS budget exceeded: ${initialJs}`);
assert.ok(js < 112_000, `JS budget exceeded: ${js}`);
// Check the stylesheet needed by the first page separately from the on-demand dialog styles.
const initialStyles = new Set([...initialKeys].flatMap(key => manifest[key].css || []));
const initialCss = [...initialStyles].reduce((sum, file) => sum + cssSizes.get(file), 0);
assert.ok(initialCss < 10_450, `Initial CSS budget exceeded: ${initialCss}`);
assert.ok(css < 12_100, `Total CSS budget exceeded: ${css}`);
const edgeKey = "src/components/bento/effects.ts";
assert.ok(manifest[edgeKey]?.isDynamicEntry && !initialKeys.has(edgeKey), "Finale field must load on approach");
assert.ok(jsSizes.get(manifest[edgeKey].file) < 3000, "Combined edge and card particles exceed their deferred budget");
const ribbonKey = "src/components/gallery/ribbon.ts";
assert.ok(manifest[ribbonKey]?.isDynamicEntry && !initialKeys.has(ribbonKey), "Ribbon motion must load on approach");
// Keep the interactive venue panoramas lightweight.
assert.ok(jsSizes.get(manifest[ribbonKey].file) < 2_900, "Gallery controller exceeds budget");
assert.ok(!Object.keys(manifest).some(key=>key.includes('dot-grid')), "Removed Dot Grid remains in the build");
const sideKey = "src/components/menu/side-squares/controller.ts";
assert.ok(manifest[sideKey]?.isDynamicEntry, "Side-square engine is not deferred");
assert.ok(!initialKeys.has(sideKey), "Side-square engine leaked into initial loading");
assert.ok(jsSizes.get(manifest[sideKey].file) < 4_000, "Side-square engine exceeds 4 KB gzip");
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

console.log(`BUILD_METRICS ${JSON.stringify({ initialJsGzipBytes: initialJs, allJsGzipBytes: js, cssGzipBytes: css, initialCssGzipBytes: initialCss, htmlGzipBytes: gzipSync(html).length, htmlBytes: Buffer.byteLength(html), initialJsFiles: initialFiles.length, totalJsFiles: jsSizes.size })}`);
