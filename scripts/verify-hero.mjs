import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await import('../tests/v25/motion.mjs');
await import('../tests/v25/scheduler.mjs');
await import('../tests/hero/runtime.mjs');
await import('../tests/hero/chrome.mjs');
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await readFile('tests/hero/immutable-baseline.json','utf8'));
// Positive control: a changed byte must produce a different fingerprint.
assert.notEqual(hash(Buffer.from('unchanged')),hash(Buffer.from('changed')));
for(const[p,h]of Object.entries(baseline)) assert.equal(hash(await readFile(p)),h,`Out-of-scope change: ${p}`);
const html=await readFile('dist/index.html','utf8');
function carta(s){const start=s.indexOf('<div id="carta">');assert.ok(start>=0);let depth=0;for(const m of s.slice(start).matchAll(/<\/?div\b[^>]*>/g)){depth+=m[0].startsWith('</')?-1:1;if(!depth)return s.slice(start,start+m.index+m[0].length);}throw Error('Unclosed carta');}
assert.equal(carta(html),await readFile('tests/v25/menu-carta-v24.html','utf8'));
assert.ok(html.includes('ViaRoma_1_HERO — preview'));
assert.equal((html.match(/<canvas/g)||[]).length,2);
assert.equal((html.match(/class="dock-tile"/g)||[]).length,5);
assert.equal((html.match(/class="photo-open"/g)||[]).length,6);
assert.equal((html.match(/class="crust-card"/g)||[]).length,3);
const pkg=JSON.parse(await readFile('package.json','utf8'));
assert.deepEqual(Object.keys(pkg.dependencies).sort(),['react','react-dom']);
assert.ok((await readFile('src/styles/hero.css','utf8')).includes('--vr-highlight: #dac18b'));
console.log(`HERO_SCOPE_OK — ${Object.keys(baseline).length} original files unchanged; printed menu identical; carousel motion/scheduler pass; two scoped canvases; no added runtime dependencies.`);
