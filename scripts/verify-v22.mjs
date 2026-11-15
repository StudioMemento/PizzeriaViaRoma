import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { digest, readJson as json, filesUnder, verifyFrozenFiles, verifyMenuHtml, verifyNewCss } from '../tests/v22/freeze-contract.mjs';
import { runPositiveControls } from '../tests/v22/positive-controls.mjs';
import { verifyChromeSignal } from '../tests/v22/chrome-signal.mjs';
import { verifyCarouselScheduler } from '../tests/v22/carousel-scheduler.mjs';
import { verifyFieldBudget } from '../tests/v22/field-budget.mjs';

const fixture = await json('tests/v22/frozen-v21.json');
assert.equal(digest(await readFile('tests/v22/menu-v21.html')), fixture.menuHtmlSha256, 'Baseline menu snapshot changed');
await verifyFrozenFiles('.', fixture.sha256);
const mainSource = await readFile('src/main.tsx', 'utf8');
const styleImports = [...mainSource.matchAll(/import\s+["']([^"']+\.css)["']/g)].map(match => match[1]);
assert.deepEqual(styleImports.slice(0, fixture.existingStyleImports.length), fixture.existingStyleImports, 'Existing CSS import order changed');
assert.deepEqual(styleImports.slice(fixture.existingStyleImports.length), ['./styles/effects-v22.css', './styles/interactions-v22.css', './styles/design-v22.css'], 'V22 CSS import order changed');
const controls = await runPositiveControls(fixture);
const allCss = (await Promise.all(['src', 'public'].map(filesUnder))).flat().filter(file => file.endsWith('.css'));
const newCss = allCss.filter(file => !(file in fixture.sha256));
for (const file of newCss) verifyNewCss(await readFile(file, 'utf8'), file, fixture);
await verifyChromeSignal();
await verifyCarouselScheduler();
await verifyFieldBudget();
console.log(`Freeze: ${Object.keys(fixture.sha256).length} V21 files unchanged; ${newCss.length} new CSS files confined to non-menu scopes; ${controls} positive controls passed.`);
if (process.argv.includes('--source-only')) {
  console.log('VIAROMA_V22_SOURCE_VERIFIED');
  process.exit(0);
}
const pkg = await json('package.json');
assert.match(pkg.version, /^22\./, 'Package does not identify V22');
assert.match(pkg.scripts.test, /verify-v22\.mjs/, 'npm test does not execute V22 integrity checks');
assert.ok(!pkg.scripts['test:legacy'], 'Obsolete test:legacy remains advertised');

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
verifyMenuHtml(html, fixture.menuHtmlSha256);
assert.match(html, /<body\b[^>]*\bclass="[^"]*\bv22-ready\b/, 'Production HTML is a stale pre-V22 build');
assert.match(html, /<meta name="build" content="[^"]*V22\b/, 'Production build metadata is not V22');
for (const fontCss of ['/assets/fonts/jost.css', '/assets/fonts/phosphor.css']) assert.ok(html.includes(`href="${fontCss}"`), `Original menu font stylesheet missing: ${fontCss}`);
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
console.log(`Data/asset parity: ${Object.keys(fixture.sha256).length} frozen V21 files; ${assetCount} photographs; ${Object.keys(printArtwork).length} printed banners; ${galleryCount} venue + ${photos.CUSTOMER.length} community photos.`);
console.log(`Production: unique ids, section/menu/album coverage, internal targets, built assets, contacts, social review removal, four languages. JS ${Math.round(jsGzip/1024)} KiB gzip; CSS ${Math.round(cssGzip/1024)} KiB gzip.`);
console.log('VIAROMA_V22_VERIFIED');
