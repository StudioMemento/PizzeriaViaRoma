import { readFile, readdir } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const name = "ViaRoma_5.9_Vercel";
const zip = await readFile(process.env.DEPLOY_ZIP || `../${name}.zip`);
let end = -1;
for (let p = zip.length - 22; p >= Math.max(0, zip.length - 65557); p--)
  if (zip.readUInt32LE(p) === 0x06054b50) {
    end = p;
    break;
  }
assert.ok(end >= 0, "ZIP end directory not found");
const count = zip.readUInt16LE(end + 10);
let p = zip.readUInt32LE(end + 16);
const names = [];
for (let i = 0; i < count; i++) {
  assert.equal(zip.readUInt32LE(p), 0x02014b50);
  const method = zip.readUInt16LE(p + 10),
    size = zip.readUInt32LE(p + 20),
    length = zip.readUInt16LE(p + 28),
    extra = zip.readUInt16LE(p + 30),
    comment = zip.readUInt16LE(p + 32),
    offset = zip.readUInt32LE(p + 42);
  const entry = zip.subarray(p + 46, p + 46 + length).toString("utf8");
  p += 46 + length + extra + comment;
  if (entry.endsWith("/")) continue;
  assert.ok(!entry.startsWith("/") && !entry.includes("\\") && entry.split("/").every(part => part && part !== "." && part !== ".."), "Invalid archive path");
  const file = entry;
  names.push(file);
  assert.ok(
    !/(^|\/)(node_modules|\.git|\.vercel|dist|\.ssr|test-results)(\/|$)/.test(
      file,
    ),
    `Unwanted build files: ${file}`,
  );
  assert.ok(
    !/(^|\/)\.env(?:\.|$)|\.(pem|key|p12|mp4|mov|webm)$/.test(file),
    `Unwanted private/media file: ${file}`,
  );
  assert.equal(zip.readUInt32LE(offset), 0x04034b50);
  const start =
    offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
  const compressed = zip.subarray(start, start + size);
  assert.ok(method === 0 || method === 8);
  const data = method === 8 ? inflateRawSync(compressed) : compressed;
  const digest = (b) => createHash("sha256").update(b).digest("hex");
  assert.equal(
    digest(data),
    digest(await readFile(file)),
    `Archive/source mismatch: ${file}`,
  );
}
for (const required of [
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "vercel.json",
  "tsconfig.json",
  "index.html",
  ".nvmrc",
  "README.md",
  "THIRD_PARTY.md",
  "docs/Allergeni_5.9.md",
  "src/main.tsx",
  "src/components/gallery/ribbon.ts",
  "src/hooks/horizontalDrag.ts",
  "src/components/gallery/PhotoRibbon.tsx",
  "src/components/LegalReader.tsx",
  "src/components/Takeaway.tsx",
  ...[480, 960, 1600].map(width => `public/assets/asporto/asporto-serale-${width}.webp`),
  "src/components/SpreadTitle.tsx",
  "src/components/bento/particles.ts",
  "src/components/bento/edge-field.ts",
  "src/components/bento/effects.ts",
  "src/components/FinaleAtmosphere.tsx",
  ...["instagram", "facebook", "google", "tripadvisor", "guru", "sluurpy", "whatsapp", "telefono"].map(id => `public/assets/social/${id}.webp`),
  "src/components/BentoGrid.tsx",
  "tests/intro/catalog-browser.mjs",
  "tests/intro/viewport.mjs",
  "tests/finale/browser.mjs",
  "tests/finale/motion.mjs",
  "src/hooks/useOnApproach.ts",
  "src/styles/bento-motion.css",
  "public/assets/memento-wordmark.svg",
  "public/assets/via-roma-orizzontale.svg",
  "public/assets/dock.svg",
  "public/assets/satin-specks.svg",
  "public/assets/menu/filetto.svg",
  "public/assets/ribbons/esterno-01.webp",
  "src/components/GuestPhotos.tsx",
  "src/components/FeatureCard.tsx",
  ...[480, 960, 1600].map(width => `public/assets/foto-ospiti/polaroid-interni-${width}.webp`),
  "public/fr/privacy.html",
  "public/de/note-legali.html",
  "public/en/cookie.html",
  "src/App.tsx",
  "src/data/menu.json",
  "public/assets/logo.png",
  "public/assets/fonts/jost-300.woff2",
  "public/legal.css",
  "public/legal-text.css",
  "docs/QA_V25.md",
  "docs/LAYOUT_V25.md",
  "src/styles/clean.css",
  "src/styles/menu.css",
  "src/components/menu/MenuTitle.tsx",
  "src/components/menu/useMenuNavigation.ts",
  "src/components/Menu.tsx",
  "src/components/Dialogs.tsx",
  "tests/menu/interactions.mjs",
  "tests/menu/browser.mjs",
  "docs/MENU_CHECKPOINT.md",
  "docs/MENU_3_1_POLISH.md",
  "docs/MENU_3_2_POLISH.md",
  "docs/MENU_3_3_POLISH.md",
  "docs/MENU_3_4_POLISH.md",
  "docs/MENU_3_5_POLISH.md",
  "docs/MENU_3_6_POLISH.md",
  "docs/MENU_3_7_AUDIT.md",
  "docs/MENU_3_8_POLISH.md",
  "docs/MENU_3_9_POLISH.md",
  "docs/MENU_4_0_POLISH.md",
  "src/components/menu/MenuSideSquares.tsx",
  "src/components/menu/side-squares/controller.ts",
  "src/components/menu/side-squares/field.ts",
  "src/components/menu/side-squares/preset.ts",
  "tests/menu/blinking-squares.mjs",
  "licenses/Phosphor-MIT.txt",
])
  assert.ok(names.includes(required), `${required} missing`);
assert.ok(!names.some(file => file.startsWith("public/assets/community/")), "Guest photographs must stay on Google Maps");
const excluded = new Set(["node_modules", "dist", ".ssr", "test-results", ".git", ".vercel", ".unlazy", "GATES.md"]);
async function collect(dir = ".") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = dir === "." ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
assert.deepEqual([...names].sort(), (await collect()).sort(), "ZIP does not contain the complete source tree");
assert.ok(names.length > 150, "Assets or source missing");
assert.equal(new Set(names).size, names.length, "Duplicate entries");
console.log(
  `DEPLOY_PACKAGE_OK — ${names.length} files, ${(zip.length / 1048576).toFixed(1)} MiB, every file matches its source.`,
);
