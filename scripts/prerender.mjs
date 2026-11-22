import { readFile, writeFile, rm } from "node:fs/promises";
import { render } from "../.ssr/entry-server.js";
const path = "dist/index.html";
const html = (await readFile(path, "utf8")).replace("<!--app-html-->", render());
await writeFile(path, html);
await rm(".ssr", { recursive: true, force: true });
console.log("Static HTML prerendered. Clean component CSS requires no purge pass.");
