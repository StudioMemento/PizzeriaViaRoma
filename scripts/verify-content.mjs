import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const original = await json("tests/fixtures/v18-content.json");
assert.deepEqual(
  await json("src/data/allergens.json"),
  (await json("tests/fixtures/v18-allergens.json")).legend,
  "Allergen legend differs from V18",
);
for (const file of ["menu", "reviews"])
  for (const [key, value] of Object.entries(
    await json(`src/data/${file}.json`),
  ))
    assert.deepEqual(value, original[key], `${key} differs from V18`);
const editorial = await json("tests/fixtures/v20-editorial-fields.json");
const translations = await json("src/data/translations.json");
for (const [group, languages] of Object.entries(translations))
  for (const [language, fields] of Object.entries(languages)) {
    assert.deepEqual(Object.keys(fields).sort(), Object.keys(original[group][language]).sort());
    for (const [key, value] of Object.entries(fields))
      if (!editorial[group]?.includes(key)) assert.deepEqual(value, original[group][language][key], `Unapproved editorial change: ${group}.${language}.${key}`);
  }
const photos = await json("src/data/photos.json");
assert.deepEqual(photos.GALLERY_ALBUMS, original.GALLERY_ALBUMS);
assert.equal(Object.values(photos.GALLERY_ALBUMS).flat().length, 40);
assert.equal(photos.CUSTOMER.length, 12);
assert.deepEqual(photos.CUSTOMER, await json("tests/fixtures/community-selected.json"));
const excluded = new Set(
  [
    0, 1, 11, 12, 13, 14, 19, 20, 21, 23, 26, 29, 31, 33, 34, 36, 37, 38, 40,
    41, 45, 49, 50,
  ].map((i) => original.CUSTOMER[i].src),
);
for (const photo of photos.CUSTOMER) {
  assert.ok(
    original.CUSTOMER.some((p) => p.src === photo.src && p.name === photo.name),
  );
  assert.ok(!excluded.has(photo.src), "Excluded photo reintroduced");
}
for (const [file, expected] of Object.entries(
  await json("tests/fixtures/menu-asset-hashes.json"),
))
  assert.equal(
    createHash("sha256")
      .update(await readFile("public/" + file))
      .digest("hex"),
    expected,
    `Printed artwork changed: ${file}`,
  );
const images = await json("src/data/images.json");
for (const [file, meta] of Object.entries(images)) {
  const bytes = await readFile("public/" + file);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    meta.sha256,
    `${file} changed`,
  );
  if (meta.small) await readFile("public/" + meta.small);
}
const files = await readdir("public", { recursive: true });
assert.ok(
  !files.some((f) => /\.(mp4|mov|webm)$/i.test(f)),
  "Walkthrough video must not be shipped",
);
for (const file of files)
  assert.ok(!excluded.has(file), "Excluded community photo shipped");
console.log(
  "CONTENT_PARITY_OK — original menu, 4 languages (explicit editorial exceptions), 4 reviews, 8 printed banners; 40 gallery + 12 reviewed community images.",
);
