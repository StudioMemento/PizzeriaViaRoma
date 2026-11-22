import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await import('../tests/v25/motion.mjs');
await import('../tests/v25/scheduler.mjs');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const[p,h]of Object.entries(await json('tests/v25/content-baseline.json')))assert.equal(hash(await readFile(p)),h,`Content changed: ${p}`);
const html=await readFile('dist/index.html','utf8');
function carta(s){const start=s.indexOf('<div id="carta">');assert.ok(start>=0);let depth=0;for(const m of s.slice(start).matchAll(/<\/?div\b[^>]*>/g)){depth+=m[0].startsWith('</')?-1:1;if(!depth)return s.slice(start,start+m.index+m[0].length);}throw Error('Unclosed carta');}
assert.equal(carta(html),await readFile('tests/v25/menu-carta-v24.html','utf8'),'Entire printed menu DOM changed');
const gallery=await json('tests/v25/gallery-resize.json'),images=await json('src/data/images.json');
assert.equal(gallery.length,40);
for(const row of gallery){const m=images[row.path];assert.ok(m.width<=1920&&m.height<=1080);assert.equal(hash(await readFile('public/'+row.path)),m.sha256);assert.equal(m.bytes,row.after.bytes);}
const packageJson=await json('package.json');assert.deepEqual(Object.keys(packageJson.dependencies).sort(),['react','react-dom']);
const css=(await Promise.all((await readdir('src/styles')).map(p=>readFile('src/styles/'+p,'utf8')))).join('\n');
assert.doesNotMatch(css,/backdrop-filter|\bfilter\s*:|@keyframes|scroll-snap|animation\s*:/,'Decorative effects remain');
assert.doesNotMatch(html,/<canvas|gradual-blur|atmosphere|metallic|holo-card/i);
assert.equal((html.match(/class="crust-card"/g)||[]).length,3);
assert.equal((html.match(/class="dock-tile"/g)||[]).length,5);
assert.equal((html.match(/class="photo-open"/g)||[]).length,6,'Only one picture per album and community should be mounted');
console.log('V25 CLEAN CONTRACT OK — menu/data/art unchanged, 40 FHD photos, zero decorative renderers/filters, six gallery images mounted.');
