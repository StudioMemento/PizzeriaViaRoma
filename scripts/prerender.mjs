import { readFile, writeFile, rm, readdir } from "node:fs/promises";
import { PurgeCSS } from "purgecss";
import { render } from "../.ssr/entry-server.js";
const path = "dist/index.html";
let html = await readFile(path, "utf8");
html = html.replace("<!--app-html-->", render());
await writeFile(path, html);
// Remove old cascade selectors that have no matching component; keep dynamic state classes.
const cssFiles = (await readdir("dist/assets"))
  .filter((f) => f.endsWith(".css"))
  .map((f) => "dist/assets/" + f);
const result = await new PurgeCSS().purge({
  content: ["src/**/*.{tsx,ts,json,html}", "dist/index.html"],
  css: cssFiles,
  safelist: {
    standard: [
      "on",
      "in",
      "open",
      "closed",
      "contains",
      "mid",
      "is-active",
      "can-l",
      "can-r",
      "dragging",
      "is-dragging",
      "active",
    ],
    deep: [
      // Component states are also applied by animation and pointer handlers.
      /^v21-ready$/,
      /^v22-ready$/,
      /^v22-/,
      /^vr22-/,
      /^particles/,
      /^vr-/,
      /^ag-/,
      /^accordion-gallery/,
      /^circular-gallery/,
      /^vr-atmosphere/,
      /^vr-effect/,
      /^vr-section/,
      /^light-rays/,
      /^shiny-text/,
      /^hero-/,
      /^oven-/,
      /^category-/,
      /^crust-/,
      /^magic-bento/,
      /^dot-grid/,
      /^gradual-blur/,
      /^menu-art-/,
      /^depth-/,
      /^modal-/,
      /^allergen-/,
      /^ph-/,
    ],
    greedy: [
      /data-motion/,
      /data-intro/,
      /data-state/,
      /data-clickable/,
      /data-image/,
    ],
  },
});
for (const file of result) await writeFile(file.file, file.css);
await rm(".ssr", { recursive: true, force: true });
console.log("Static HTML prerendered, CSS pruned.");
