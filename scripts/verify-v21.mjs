import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

// Captured from the supplied V20 archive, before any V21 implementation.
// These inputs contain menu prices, recipes, allergens and selected original photos.
const baseline = {
  'src/data/menu.json': 'b3b2ab1c435338a518df75ed1999747388a04c30595146b4043c93bccf279592',
  'src/data/allergens.json': 'b6cb1f081cd03b67420856805433dec88776549f9d2b4a6a5ffdd458993dc190',
  'src/data/photos.json': 'ee1f16d5342107546d51d406405287e6dfb173e274996379be6eb29bd4ea5c57',
  'src/data/images.json': '9f907baaf0f296553146178be8a439d190a9dc8507769bed7d123263f4e1a34a',
  'src/data/allergen-info.ts': '5a3ed46caa370862b3eafec2bef5f95b8592b12e99ce506a6197863f46a541eb',
};
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async p => JSON.parse(await readFile(p, 'utf8'));
for (const [file, hash] of Object.entries(baseline)) {
  assert.equal(digest(await readFile(file)), hash, `Original source changed: ${file}`);
}
assert.notEqual(digest(Buffer.from('changed-menu-positive-control')), baseline['src/data/menu.json']);

const imageIndex = await json('src/data/images.json');
for (const [file, metadata] of Object.entries(imageIndex)) {
  assert.equal(digest(await readFile(`public/${file}`)), metadata.sha256, `Original photograph changed: ${file}`);
  if (metadata.small) await stat(`public/${metadata.small}`);
}
const printArtwork = await json('tests/fixtures/menu-asset-hashes.json');
for (const [file, hash] of Object.entries(printArtwork)) {
  assert.equal(digest(await readFile(`public/${file}`)), hash, `Printed menu artwork changed: ${file}`);
}
const menu = await json('src/data/menu.json');
const photos = await json('src/data/photos.json');
const translations = await json('src/data/translations.json');
for (const group of ['T', 'UI']) {
  for (const language of ['it', 'en', 'de', 'fr']) {
    assert.ok(translations[group]?.[language], `Missing ${group} language: ${language}`);
  }
}

const html = await readFile('dist/index.html', 'utf8');
assert.ok(html.length > 10000, 'Prerendered HTML is unexpectedly empty');
assert.ok(!html.includes('<!--app-html-->'), 'Prerender marker not replaced');
assert.match(html, /noindex,nofollow/, 'Temporary build lost noindex protection');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const assertUnique = values => assert.equal(new Set(values).size, values.length, 'Duplicate HTML ids');
assert.throws(() => assertUnique(['duplicate', 'duplicate']), /Duplicate HTML ids/);
assertUnique(ids);
const idSet = new Set(ids);
for (const id of ['home', 'pizza-slider', 'cornicione', 'catshow', 'menu', 'gallery', 'customer', 'social', 'dove']) {
  assert.ok(idSet.has(id), `Missing required section ${id}`);
}
for (const id of ['classiche', 'audaci', 'bianche', 'calzoni', 'cucina', 'stuzzicherie', 'dolci', 'bevande']) {
  assert.ok(idSet.has(`cat-${id}`), `Missing printed-menu category: ${id}`);
}
for (const album of Object.keys(photos.GALLERY_ALBUMS)) {
  assert.ok(idSet.has(`album-${album}`), `Venue album missing from rendered page: ${album}`);
}
for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  assert.ok(idSet.has(match[1]), `Broken internal navigation: #${match[1]}`);
}
for (const match of html.matchAll(/\b(?:src|href)="(\/[^"#?]+)"/g)) {
  if (match[1].startsWith('//')) continue;
  await stat(`dist${match[1]}`).catch(() => assert.fail(`Missing built URL: ${match[1]}`));
}
for (const file of ['privacy.html', 'cookie.html', 'note-legali.html', 'legal.css', 'assets/fonts/jost.css', 'assets/fonts/phosphor.css']) {
  await stat(`dist/${file}`);
}
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
for (const rows of Object.values(menu.MENU)) {
  for (const row of rows) assert.ok(html.includes(escape(row[0])), `Menu item missing from initial HTML: ${row[0]}`);
}
assert.match(html, /tel:\+390427541232/, 'Phone link regressed');
assert.match(html, /wa\.me\/393802453757/, 'WhatsApp link regressed');
assert.match(html, /maps\.google\.com\/\?cid=7212905066552907909/, 'Map link regressed');
const socialStart = html.indexOf('id="social"');
const infoStart = html.indexOf('id="dove"');
assert.ok(socialStart >= 0 && infoStart > socialStart);
const social = html.slice(socialStart, infoStart);
const hasReviewContent = value => /review-ticker|review-card|Le parole di chi|Leggi le recensioni|Tripadvisor|Restaurant Guru/i.test(value);
assert.ok(hasReviewContent('<div class="review-ticker">Tripadvisor</div>'), 'Review absence check positive control failed');
assert.ok(!hasReviewContent(social), 'Reviews remain inside social section');
assert.match(social, /instagram\.com\/pizzeriaviaromamaniago/);
assert.match(social, /facebook\.com\/people\/Pizzeria-Via-Roma/);

let jsGzip = 0, cssGzip = 0, jsFiles = 0;
for (const file of await readdir('dist/assets')) {
  if (!/\.(?:js|css)$/.test(file)) continue;
  const bytes = await readFile(`dist/assets/${file}`);
  if (file.endsWith('.js')) { jsGzip += gzipSync(bytes).length; jsFiles++; }
  else cssGzip += gzipSync(bytes).length;
}
assert.ok(jsFiles > 0, 'Built JavaScript missing');
assert.ok(jsGzip < 320 * 1024, `All JavaScript chunks exceed 320 KiB gzip: ${jsGzip}`);
assert.ok(cssGzip < 80 * 1024, `All CSS exceeds 80 KiB gzip: ${cssGzip}`);
const assetCount = Object.keys(imageIndex).length;
const galleryCount = Object.values(photos.GALLERY_ALBUMS).flat().length;
console.log(`Data/asset parity: ${Object.keys(baseline).length} baseline files; ${assetCount} photographs; ${Object.keys(printArtwork).length} printed banners; ${galleryCount} venue + ${photos.CUSTOMER.length} community photos.`);
console.log(`Production: unique ids, section/menu/album coverage, internal targets, built assets, contacts, social review removal, four languages. JS ${Math.round(jsGzip/1024)} KiB gzip; CSS ${Math.round(cssGzip/1024)} KiB gzip.`);
console.log('VIAROMA_V21_VERIFIED');
