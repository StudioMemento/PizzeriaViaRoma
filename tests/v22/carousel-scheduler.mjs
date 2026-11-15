import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

// Execute the production hook with deterministic hook slots, observers and
// clocks. The simulated DOM tests scheduling and drag contracts, not visuals.
export async function verifyCarouselScheduler() {
  const source = await readFile('src/hooks/useCarousel.ts', 'utf8');
  const dragSource = await readFile('src/hooks/useDrag.ts', 'utf8');
  const hookCode = source.slice(source.indexOf('export function useCarousel')).replace('export function', 'function');
  const wrapCode = dragSource.slice(dragSource.indexOf('export const wrap')).replace('export const', 'const');
  const slots = [], effects = [], raf = new Map(), timers = new Map(), intersections = [], resizes = [];
  const docListeners = new Map(), motionListeners = new Set();
  let cursor = 0, renderNeeded = false, clock = 0, serial = 1, hook, result;
  const equalDeps = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const hooks = {
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useState(initial) {
      const index = cursor++;
      const slot = slots[index] ||= { value: initial };
      slot.set ||= value => { const next = typeof value === 'function' ? value(slot.value) : value; if (!Object.is(next, slot.value)) { slot.value = next; renderNeeded = true; } };
      return [slot.value, slot.set];
    },
    useCallback(fn, deps) {
      const index = cursor++, old = slots[index];
      if (!old || !equalDeps(old.deps, deps)) slots[index] = { fn, deps };
      return slots[index].fn;
    },
    useEffect(fn, deps) {
      const index = cursor++, old = slots[index];
      if (!old || !equalDeps(old.deps, deps)) { slots[index] = { deps, cleanup: old?.cleanup }; effects.push({ index, fn }); }
    },
  };
  class Element {
    constructor() {
      this.dataset = {}; this.properties = new Map(); this.classes = new Set(); this.capture = new Set();
      this.style = { setProperty: (key, value) => this.properties.set(key, value), zIndex: '' };
      this.classList = { add: value => this.classes.add(value), remove: value => this.classes.delete(value), contains: value => this.classes.has(value) };
    }
    closest() { return null; }
    setPointerCapture(id) { this.capture.add(id); }
    hasPointerCapture(id) { return this.capture.has(id); }
    releasePointerCapture(id) { this.capture.delete(id); }
  }
  const cards = Array.from({ length: 12 }, () => Object.assign(new Element(), { offsetWidth: 290 }));
  const stage = Object.assign(new Element(), { clientWidth: 390, querySelectorAll: () => cards });
  const root = { contains: node => node === stage || cards.includes(node) };
  const media = { matches: false, addEventListener: (_, fn) => motionListeners.add(fn), removeEventListener: (_, fn) => motionListeners.delete(fn) };
  const document = {
    hidden: false, activeElement: null, querySelector: () => null,
    addEventListener(type, fn) { if (!docListeners.has(type)) docListeners.set(type, new Set()); docListeners.get(type).add(fn); },
    removeEventListener(type, fn) { docListeners.get(type)?.delete(fn); },
  };
  const context = {
    ...hooks, Element, document, performance: { now: () => clock },
    getComputedStyle: () => ({ getPropertyValue: () => '0' }),
    requestAnimationFrame(fn) { const id = serial++; raf.set(id, fn); return id; },
    cancelAnimationFrame(id) { raf.delete(id); },
    window: {
      matchMedia: () => media,
      setTimeout(fn, delay) { const id = serial++; timers.set(id, { fn, at: clock + delay }); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
    IntersectionObserver: class {
      constructor(fn, options = {}) { this.fn = fn; this.options = options; this.disconnected = false; intersections.push(this); }
      observe(node) { this.node = node; }
      disconnect() { this.disconnected = true; }
    },
    ResizeObserver: class {
      constructor(fn) { this.fn = fn; this.disconnected = false; resizes.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
  };
  hook = runInNewContext(`${stripTypeScriptTypes(`${wrapCode}\n${hookCode}`)}\nuseCarousel`, context);
  const commit = () => {
    let passes = 0;
    do {
      assert.ok(++passes < 8, 'Hook schedules a render loop');
      renderNeeded = false; cursor = 0;
      result = hook(12, 700, .5);
      result.rootRef.current = root; result.stageRef.current = stage;
      for (const { index, fn } of effects.splice(0)) { slots[index].cleanup?.(); slots[index].cleanup = fn(); }
    } while (renderNeeded);
  };
  const frame = (elapsed = 16) => {
    clock += elapsed;
    for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.fn(); }
    const pending = [...raf.values()]; raf.clear();
    for (const fn of pending) fn(clock);
    if (renderNeeded) commit();
  };
  const settle = () => { for (let i = 0; i < 180 && raf.size; i++) frame(); assert.equal(raf.size, 0, 'Paused carousel keeps scheduling frames'); };
  const emit = type => { for (const fn of docListeners.get(type) || []) fn(); };
  commit();
  assert.equal(raf.size, 0, 'Offscreen carousel schedules a frame');
  assert.equal(timers.size, 0);
  assert.equal(cards.filter((_, i) => result.isLoaded(i)).length, 0, 'Offscreen carousel requests image sources');
  const near = intersections.find(observer => observer.options.rootMargin);
  const visible = intersections.find(observer => !observer.options.rootMargin);
  near.fn([{ isIntersecting: true }]); if (renderNeeded) commit();
  const loaded = cards.filter((_, i) => result.isLoaded(i)).length;
  assert.ok(loaded > 0 && loaded < cards.length, 'Near viewport activation does not limit image requests');
  visible.fn([{ isIntersecting: true }]); frame();
  assert.equal(raf.size, 0, 'Stationary carousel has a continuous loop');
  assert.equal(timers.size, 1, 'Autoplay deadline is not scheduled');
  const before = cards[0].properties.get('--slide-x');
  frame(750); for (let i = 0; i < 20; i++) frame();
  assert.notEqual(cards[0].properties.get('--slide-x'), before, 'Autoplay does not move visible content');
  assert.equal(stage.dataset.carouselMoving, 'true');
  result.rootBind.onPointerEnter({ pointerType: 'mouse' }); settle();
  assert.equal(timers.size, 0, 'Hover pause retains a wake timer');
  const hovered = cards[0].properties.get('--slide-x'); frame(5000);
  assert.equal(cards[0].properties.get('--slide-x'), hovered);
  result.rootBind.onPointerLeave({ pointerType: 'mouse' }); frame();
  assert.equal(timers.size, 1, 'Pointer leave does not restore autoplay deadline');
  result.setPaused(true); commit(); settle();
  assert.equal(timers.size, 0, 'Explicit pause retains an autoplay timer');
  result.setPaused(false); commit(); frame();
  media.matches = true; for (const fn of motionListeners) fn(); if (renderNeeded) commit(); settle();
  assert.equal(timers.size, 0, 'Reduced motion schedules autoplay');

  const event = (x, y) => ({ button: 0, pointerId: 1, clientX: x, clientY: y, currentTarget: stage, target: stage });
  result.bind.onPointerDown(event(220, 100));
  result.bind.onPointerMove(event(80, 102)); frame();
  assert.equal(stage.hasPointerCapture(1), true);
  result.bind.onPointerCancel(event(80, 102)); settle();
  assert.equal(stage.hasPointerCapture(1), false, 'Cancelled drag keeps pointer capture');
  assert.equal(stage.classList.contains('is-dragging'), false);
  result.bind.onPointerDown(event(220, 100));
  result.bind.onPointerMove(event(221, 135));
  assert.equal(stage.hasPointerCapture(1), false, 'Vertical intent captured the pointer');
  let prevented = 0;
  result.bind.onClickCapture({ preventDefault() { prevented++; }, stopPropagation() {} });
  assert.equal(prevented, 0, 'Cancelled/vertical drag suppresses next legitimate click');
  visible.fn([{ isIntersecting: false }]);
  assert.equal(raf.size, 0); assert.equal(timers.size, 0);
  document.hidden = true; emit('visibilitychange');
  assert.equal(raf.size, 0); assert.equal(timers.size, 0);
  for (const slot of slots) slot?.cleanup?.();
  assert.equal(raf.size, 0); assert.equal(timers.size, 0);
  assert.ok(intersections.every(observer => observer.disconnected));
  assert.ok(resizes.every(observer => observer.disconnected));
  assert.equal(motionListeners.size, 0);
  for (const listeners of docListeners.values()) assert.equal(listeners.size, 0);
  console.log('CAROUSEL_SCHEDULER_BEHAVIOR_PASS');
}
