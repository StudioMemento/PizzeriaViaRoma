import { readFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const name = "Pizzeria_Via_Roma_V20_Polish";
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
  assert.ok(
    entry.startsWith(name + "/"),
    "Archive must have one project folder",
  );
  const file = entry.slice(name.length + 1);
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
  "src/main.tsx",
  "src/App.tsx",
  "src/data/menu.json",
  "public/assets/logo.png",
  "public/assets/fonts/jost-300.woff2",
  "public/legal.css",
  "docs/VERIFICATION.md",
  "licenses/react-bits-LICENSE.md",
])
  assert.ok(names.includes(required), `${required} missing`);
assert.ok(names.length > 150, "Assets or source missing");
assert.equal(new Set(names).size, names.length, "Duplicate entries");
console.log(
  `DEPLOY_PACKAGE_OK — ${names.length} files, ${(zip.length / 1048576).toFixed(1)} MiB, every file matches its source.`,
);
