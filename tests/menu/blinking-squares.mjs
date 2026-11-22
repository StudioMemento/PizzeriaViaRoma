import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { loadSideSquares } from './load-side-squares.mjs';

const field = await loadSideSquares();
const p = field.preset;
assert.equal(p.squareColor, '#c6ab70'); assert.equal(p.backgroundColor, '#090909');

// Judge visible output in CSS pixels and seconds, not just preset field names.
const fineAndCalm = square => {
  assert.ok(square.size >= .8 && square.size <= 1.6, 'Grain must stay fine and visible at 1–1.5 CSS pixels');
  const period = 2 * Math.PI / square.rate;
  assert.ok(period >= 2.6 && period <= 6.5, 'A full fade cycle must take 2.6–6.5 seconds');
};
assert.throws(() => fineAndCalm({ size: 5.7, rate: .4 }), /Grain/);
assert.throws(() => fineAndCalm({ size: 1.2, rate: 2 * Math.PI * 2 }), /fade cycle/);
const onGrid = square => {
  for (const center of [square.x + square.size / 2, square.y + square.size / 2])
    assert.ok(Math.abs(center / p.spacing - .5 - Math.round(center / p.spacing - .5)) < 1e-7, 'Square center left its grid cell');
};
onGrid({ x: 2.5, y: 8.5, size: 1 });
assert.throws(() => onGrid({ x: 2.8, y: 9.2, size: 1 }), /grid cell/);

const layouts = [];
for (const [width, height, fraction] of [[320,568,.1],[390,844,.1],[768,1024,.15],[1199,900,.15],[1200,900,.2],[1440,900,.2],[2399,1440,.2],[2400,1440,.3],[3440,1440,.3],[7680,2160,.3]]) {
  const gutter = Math.min(width * fraction, p.maxFieldWidth);
  const left = field.createSquares(gutter, height, 120);
  const right = field.createSquares(gutter, height, 1033);
  const ratio = field.pixelRatio(gutter, height, 3);
  const pixels = 2 * Math.floor(gutter * ratio) * Math.floor(height * ratio);
  assert.ok(pixels <= p.maxPixels); assert.ok(ratio <= p.maxDpr);
  assert.ok(left.length > 0 && right.length > 0);
  assert.ok(left.length <= p.maxSquaresPerSide && right.length <= p.maxSquaresPerSide);
  assert.deepEqual(left, field.createSquares(gutter, height, 120), 'A remount must not randomize the pattern');
  for (const square of [...left, ...right]) {
    fineAndCalm(square);
    onGrid(square);
    assert.ok(square.x >= 0 && square.x + square.size <= gutter);
    assert.ok(square.y >= 0 && square.y + square.size <= height);
    const mirroredX = width - square.x - square.size;
    assert.ok(mirroredX >= width - gutter, 'Right squares entered the reading column');
    for (let t = 0; t < 22; t += .13) {
      const alpha = field.brightness(square, t);
      assert.ok(Number.isFinite(alpha) && alpha >= 0 && alpha <= 1);
      assert.ok(Math.abs(field.brightness(square, t + 1/p.fps) - alpha) < .075, 'Per-frame brightness changes too abruptly');
    }
  }
  const sizes = left.map(s => s.size).sort((a,b) => a-b);
  const periods = left.map(s => 2 * Math.PI / s.rate).sort((a,b) => a-b);
  assert.ok(sizes[Math.floor(sizes.length*.9)] - sizes[Math.floor(sizes.length*.1)] > .3, 'Size variation is too uniform');
  assert.ok(periods[Math.floor(periods.length*.9)] - periods[Math.floor(periods.length*.1)] > 2, 'Fade durations must differ');
  assert.ok(new Set(left.map(s=>(s.y+s.size/2).toFixed(5))).size < left.length, 'Squares must share aligned rows');
  assert.ok(left.some(s=>s.y > height*.9), 'The capped field must retain its lower rows');
  assert.ok(left.filter(s => s.x < gutter * .3).length > left.filter(s => s.x > gutter * .7).length, 'Density must diminish toward the content');
  assert.notEqual(field.brightness(left[0], 0), field.brightness(left[0], .25));
  layouts.push({ width, height, left: left.length, right: right.length, pixels });
}
const fadeField = field.createSquares(400, 900, 120);
assert.deepEqual(field.createSquares(520,900,120), field.createSquares(1100,900,120), 'Wider gutters must not dilute or stretch the grain');
const thirds = [0,1,2].map(part => fadeField.filter(s => s.x >= part*400/3 && s.x < (part+1)*400/3));
assert.ok(thirds[0].length > thirds[1].length * 2 && thirds[1].length > thirds[2].length * 2, 'Density must fall smoothly toward the menu');
const edge = { ...fadeField[0], peak: .8, phase: Math.PI / 2 };
assert.ok(field.brightness(edge, 0) > .79, 'The alpha bounds need a positive bright fixture');
const innerSquares = fadeField.filter(s=>s.x>320);
assert.ok(innerSquares.length > 0, 'The inner-edge fade check needs actual squares');
assert.ok(innerSquares.every(s=>s.peak < .42), 'Inner-edge fade must damp even a bright square');
const unchangedGeometry = JSON.stringify(fadeField);
const temporal = [0,3,6,9].map(t => fadeField.map(s=>field.brightness(s,t)));
assert.notDeepEqual(temporal[0], temporal[1], 'Three seconds must show a gentle change');
assert.equal(JSON.stringify(fadeField), unchangedGeometry, 'The seed geometry must persist as the rendered tile travels');

// Exercise the real painter and lifecycle against deterministic browser surfaces.
const listeners = new Map(), jobs = new Map(), ios = [], ros = [];
let serial = 0, clock = 0, reads = 0, width = 390, height = 844, gutter = 39;
let hidden = false, reduced = false, available = true, clears = 0, fills = 0, observersDisposed = 0;
const rectangles = [];
const target = name => ({
  addEventListener(type, fn, options) { listeners.set(name + ':' + type, { fn, options }); },
  removeEventListener(type) { listeners.delete(name + ':' + type); },
});
const canvases = [0, 1].map(side => ({
  width: 300, height: 150, style: {},
  get clientWidth() { reads++; return Math.min(gutter, p.maxFieldWidth); },
  getContext() {
    return available ? {
      setTransform() {}, clearRect() { clears++; }, beginPath() {},
      rect(x,y,w,h) { assert.ok(x >= 0 && x + w <= canvases[side].width); assert.ok(y >= 0 && y < canvases[side].height); assert.ok([x,y,w,h].every(Number.isInteger), 'Fine grain must land on backing pixels'); rectangles.push([side,x,y,w,h]); },
      fill() { fills++; },
    } : null;
  },
}));
const viewport = {
  dataset: {}, querySelectorAll: () => canvases,
  get clientWidth() { reads++; return width; },
  get clientHeight() { reads++; return height; },
};
const document = { ...target('document'), get hidden() { return hidden; } };
const window = { ...target('window'), devicePixelRatio: 3, scrollY: 0 };
const media = { ...target('media'), get matches() { return reduced; } };
const runtime = await loadSideSquares({ document, window, matchMedia: () => media,
  requestAnimationFrame(fn) { jobs.set(++serial, fn); return serial; },
  cancelAnimationFrame(id) { jobs.delete(id); },
  ResizeObserver: class { constructor(fn) { this.fn = fn; ros.push(this); } observe() {} disconnect() { observersDisposed++; } },
  IntersectionObserver: class { constructor(fn) { this.fn = fn; ios.push(this); } observe() {} disconnect() { observersDisposed++; } },
});
const fire = name => listeners.get(name).fn();
const tick = (ms = 1000 / 60) => { clock += ms; const current = [...jobs.values()]; jobs.clear(); current.forEach(fn => fn(clock)); };
const section = { getBoundingClientRect() { reads++; return {top:-window.scrollY,height:24000} } };
let engine = runtime.mountSideSquares(section, viewport, false);
assert.equal(jobs.size, 0); assert.equal(clears, 0, 'Nothing is painted outside the menu');
ios.at(-1).fn([{ isIntersecting: true }]); assert.equal(jobs.size, 1);
const initialReads = reads;
for (let i = 0; i < 120; i++) tick();
assert.ok(engine.stats().frames >= 36 && engine.stats().frames <= 41, 'Paint frequency exceeds the 20Hz limit');
assert.equal(reads, initialReads, 'Animation may not read layout');
assert.equal(clears, engine.stats().frames * 2);
assert.ok(fills <= engine.stats().frames * 62, 'Opacity grouping must bound fill calls');
assert.equal(engine.stats().state, 'running'); assert.ok(rectangles.length > 0);
assert.ok(listeners.get('window:scroll').options.passive);
assert.ok([...listeners.keys()].every(name => !/pointer|touch|mouse/.test(name)));
window.scrollY = 48; fire('window:scroll'); tick();
assert.equal(canvases[0].style.transform, 'translateY(' + (-48*p.scrollFactor) + 'px)');
assert.equal(canvases[1].style.transform, canvases[0].style.transform);
assert.equal(reads, initialReads, 'Scroll must only reuse cached geometry');
const initialPass=clears; window.scrollY = 180; fire('window:scroll'); tick();
assert.ok(clears > initialPass, 'Crossing a strip must repaint continuous world coordinates');

engine.setPaused(true); assert.equal(jobs.size, 0);
let count = clears; for (let i = 0; i < 120; i++) tick(); assert.equal(clears, count);
engine.setPaused(false); assert.equal(jobs.size, 1); tick();
hidden = true; fire('document:visibilitychange'); assert.equal(jobs.size, 0);
count = clears; tick(); assert.equal(clears, count);
hidden = false; fire('document:visibilitychange'); tick();
// A queued frame can observe the new media preference before the change event.
reduced = true; tick();
assert.equal(engine.stats().state, 'static', 'A pending frame must settle into reduced motion');
assert.equal(jobs.size, 0);
fire('media:change'); assert.equal(jobs.size, 0); assert.equal(engine.stats().state, 'static');
count = clears; for (let i = 0; i < 120; i++) tick(); assert.equal(clears, count);
window.scrollY += 12; fire('window:scroll'); tick();
assert.equal(canvases[0].style.transform, 'translateY(' + -(window.scrollY % p.overscan) + 'px)');
assert.equal(jobs.size, 0, 'Reduced motion scroll must settle without an animation loop');
reduced = false; fire('media:change'); tick();
width = 3440; height = 1440; gutter = width * .3;
for (let i = 0; i < 20; i++) ros.at(-1).fn();
assert.ok(jobs.size <= 2, 'Resize must coalesce with the single animation frame');
tick(); tick(); assert.ok(engine.stats().pixels <= p.maxPixels); assert.ok(engine.stats().squares <= 6000);
ios.at(-1).fn([{ isIntersecting: false }]); assert.equal(jobs.size, 0); assert.equal(engine.stats().state, 'paused');
count = clears; tick(); assert.equal(clears, count);
engine.dispose(); assert.equal(jobs.size, 0); assert.equal(listeners.size, 0); assert.equal(observersDisposed, 2);
assert.ok(canvases.every(c => c.width * c.height === 1));
// Unavailable Canvas and opening the menu with reduced motion must stay functional.
for (const mode of ['unavailable', 'reduced', 'dialog']) {
  available = mode !== 'unavailable'; reduced = mode === 'reduced';
  engine = runtime.mountSideSquares(section, viewport, mode === 'dialog');
  ios.at(-1).fn([{ isIntersecting: true }]);
  assert.equal(jobs.size, 0); engine.dispose(); assert.equal(listeners.size, 0);
}
const css = await readFile('src/styles/menu.css', 'utf8');
const component = await readFile('src/components/menu/MenuSideSquares.tsx', 'utf8');
assert.equal((component.match(/maxWidth: SIDE_SQUARES.maxFieldWidth/g) || []).length, 2, 'Canvas allocation must stop at the visible field width');
assert.ok(css.includes('background:#090909')); assert.ok(css.includes('width:var(--vr-gutter)'));
assert.ok(!css.includes('menu-dot')); assert.ok(!css.includes('.menu-art:hover'));
await assert.rejects(access('src/components/menu/dot-grid'));
await assert.rejects(access('src/components/menu/MenuDotGrid.tsx'));
const baseline = await readFile('src/styles/clean.css', 'utf8');
for (const rule of ['--vr-gutter: 10vw; --vr-content: 80vw', '--vr-gutter:15vw; --vr-content:70vw', '--vr-gutter:20vw; --vr-content:60vw', '--vr-gutter:30vw; --vr-content:40vw']) assert.ok(baseline.includes(rule));
console.log('SIDE_SQUARES_LAYOUTS ' + JSON.stringify(layouts));
console.log('BLINKING_SQUARES_OK — aligned rows/columns; fine squares and independent 2.6–6.5s twinkle; stable seeded occupancy; controlled density falloff; complete field at capped size; 10/15/20/30% side confinement; scroll-linked tile motion without per-frame layout reads; 20Hz idle paint cap; one clock; bounded pixels/squares/fills; hidden/offscreen/dialog pause; reduced-motion static frame; complete cleanup.');
