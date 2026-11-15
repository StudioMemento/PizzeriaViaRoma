import "./verify-content.mjs";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const json = async p => JSON.parse(await readFile(p,"utf8"));
const translations = await json("src/data/translations.json");
for (const group of ["T","UI"])
  for (const [language,fields] of Object.entries(translations[group]))
    for (const [key,value] of Object.entries(fields))
      if (typeof value === "string")
        assert.doesNotMatch(value, /condivid|taggaci|inviaci|tag us|share|partagez|envoyez|markiert uns|teilen|schickt uns/i, `Sharing invitation: ${group}.${language}.${key}`);
const photos = await json("src/data/photos.json");
const images = await json("src/data/images.json");
const community = new Set(photos.CUSTOMER.flatMap(p=>[p.src,images[p.src]?.small].filter(Boolean)));
const original = await json("tests/fixtures/v18-content.json");
for (const p of original.CUSTOMER)
  if (!community.has(p.src)) {
    assert.ok(!images[p.src], `Unselected community file is still indexed: ${p.src}`);
    await assert.rejects(readFile("public/"+p.src), {code:"ENOENT"});
  }
for (const src of [...Object.values(photos.GALLERY_ALBUMS).flat(),...photos.CUSTOMER.map(p=>p.src)])
  assert.ok(images[src],`Missing dimensions/hash for ${src}`);
assert.equal((await json("package.json")).version,"20.0.0");
console.log("POLISH_SOURCE_VERIFIED — menu/recipes/allergens/artwork parity; editorial whitelist; original reviews; face-free selection manifest and unused community files removed.");
