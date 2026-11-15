import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

// Runs the actual controller extracted from Navigation, with deterministic DOM
// geometry/events. This is a scheduler/lifecycle test, not browser automation.
export async function verifyChromeSignal() {
  const source = await readFile('src/components/Navigation.tsx', 'utf8');
  const start = source.indexOf('type PagePosition');
  const end = source.indexOf('export function Header');
  assert.ok(start >= 0 && end > start, 'Shared chrome controller not found');
  const code = stripTypeScriptTypes(source.slice(start, end));
  const windowEvents = new Map(), documentEvents = new Map(), frames = new Map();
  const windowOptions = new Map(), observers = [];
  let nextFrame = 1, rectReads = 0;
  const positions = { menu: 1000, gallery: 4000, dove: 8000 };
  const eventTarget = (events, options = new Map()) => ({
    addEventListener(type, listener, config) {
      if (!events.has(type)) events.set(type, new Set());
      events.get(type).add(listener); options.set(type, config);
    },
    removeEventListener(type, listener) { events.get(type)?.delete(listener); },
  });
  const dispatch = (events, type) => { for (const listener of events.get(type) || []) listener({ type }); };
  const window = { ...eventTarget(windowEvents, windowOptions), scrollY: 0, innerHeight: 900 };
  let finishFonts;
  const document = {
    ...eventTarget(documentEvents), hidden: false, body: { id: 'body' },
    documentElement: { scrollHeight: 10000 },
    fonts: { ready: new Promise(resolve => { finishFonts = resolve; }) },
    getElementById(id) {
      return id in positions ? { id, getBoundingClientRect() { rectReads++; return { top: positions[id] - window.scrollY }; } } : null;
    },
  };
  const context = {
    window, document,
    requestAnimationFrame(fn) { const id = nextFrame++; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
      observe(node) { this.targets.push(node); }
      disconnect() { this.disconnected = true; }
    },
  };
  const subscribe = runInNewContext(`${code}\nsubscribePagePosition`, context);
  const tick = () => {
    const pending = [...frames.values()]; frames.clear();
    for (const fn of pending) fn(1);
    assert.equal(frames.size, 0, 'Chrome controller schedules a perpetual frame loop');
  };
  const a = [], b = [], late = [];
  const stopA = subscribe(p => a.push(p));
  const stopB = subscribe(p => b.push(p));
  assert.equal(windowEvents.get('scroll').size, 1, 'Duplicate shared scroll listeners');
  assert.equal(windowOptions.get('scroll').passive, true);
  assert.equal(observers.length, 1);
  assert.equal(observers[0].targets.length, 4, 'Body and three section landmarks must be observed');
  assert.equal(frames.size, 1);
  tick();
  assert.equal(rectReads, 3);
  assert.equal(a.at(-1).active, 'home');
  assert.equal(b.at(-1).progress, 0);
  assert.equal(a.at(-1).minimumProgress, 24 / 900);

  window.scrollY = 1800;
  for (let i = 0; i < 5; i++) dispatch(windowEvents, 'scroll');
  assert.equal(frames.size, 1, 'Scroll burst was not coalesced');
  tick();
  assert.equal(rectReads, 3, 'Scrolling unexpectedly forces layout measurements');
  assert.equal(a.at(-1).active, 'menu');
  assert.equal(a.at(-1).progress, 1800 / 9100);

  window.innerHeight = 700;
  document.documentElement.scrollHeight = 9000;
  dispatch(windowEvents, 'resize'); tick();
  assert.equal(rectReads, 6, 'Resize did not refresh cached geometry');
  assert.equal(a.at(-1).progress, 1800 / 8300);
  const stopLate = subscribe(p => late.push(p));
  assert.equal(late.length, 1, 'Late subscribers do not receive current position');
  assert.equal(late[0].active, 'menu');

  dispatch(windowEvents, 'scroll');
  document.hidden = true; dispatch(documentEvents, 'visibilitychange');
  assert.equal(frames.size, 0, 'Pending frame survives hidden document');
  dispatch(windowEvents, 'scroll');
  assert.equal(frames.size, 0, 'Hidden page schedules chrome work');
  document.hidden = false; dispatch(documentEvents, 'visibilitychange'); tick();
  assert.equal(rectReads, 9);

  stopA(); stopB();
  assert.equal(windowEvents.get('scroll').size, 1, 'Controller stopped while a subscriber remains');
  stopLate();
  for (const listeners of [...windowEvents.values(), ...documentEvents.values()]) assert.equal(listeners.size, 0, 'Controller leaked an event listener');
  assert.equal(observers[0].disconnected, true, 'ResizeObserver not disconnected');
  assert.equal(frames.size, 0);
  finishFonts(); await Promise.resolve();
  assert.equal(frames.size, 0, 'Late font resolution restarted a disposed controller');

  const restarted = [];
  const stopRestarted = subscribe(p => restarted.push(p));
  assert.equal(restarted.length, 0, 'New subscription received stale disposed state');
  tick();
  assert.equal(restarted.at(-1).active, 'menu');
  stopRestarted(); await Promise.resolve();
  assert.equal(frames.size, 0);
  console.log('CHROME_SIGNAL_BEHAVIOR_PASS');
}
