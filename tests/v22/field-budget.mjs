import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

// Regression for the observed same-Symbol reactivation bug. Runs the real
// module arbiter, not a duplicate of its selection algorithm.
export async function verifyFieldBudget() {
  const source = await readFile('src/components/effects/useFieldBudget.ts', 'utf8');
  const start = source.indexOf('type Candidate');
  const end = source.indexOf('export function useFieldBudget');
  assert.ok(start >= 0 && end > start, 'Decorative field arbiter missing');
  const frames = new Map(); let sequence = 1;
  const api = runInNewContext(`${stripTypeScriptTypes(source.slice(start, end))}\n({candidates,schedule})`, {
    requestAnimationFrame(fn) { const id = sequence++; frames.set(id, fn); return id; },
  });
  const flush = () => { const pending = [...frames.values()]; frames.clear(); for (const fn of pending) fn(); };
  const hero = Symbol('hero'), info = Symbol('info');
  const states = { hero: false, info: false };
  api.candidates.set(hero, { area: 100, set: value => { states.hero = value; } });
  api.candidates.set(info, { area: 50, set: value => { states.info = value; } });
  api.schedule(); api.schedule();
  assert.equal(frames.size, 1, 'Field selection schedules duplicate frames');
  flush();
  assert.deepEqual(states, { hero: true, info: false });
  api.candidates.delete(hero); api.schedule();
  // The same hook instance returns before the pending choice runs.
  states.hero = false;
  api.candidates.set(hero, { area: 100, set: value => { states.hero = value; } });
  api.schedule(); flush();
  assert.equal(states.hero, true, 'Reactivated winning field remains without a canvas');
  api.candidates.get(info).area = 200;
  api.schedule(); flush();
  assert.deepEqual(states, { hero: false, info: true }, 'More than one decorative field owns the canvas budget');
  api.candidates.clear(); api.schedule(); flush();
  assert.equal(frames.size, 0, 'Empty field budget keeps a loop alive');
  console.log('FIELD_BUDGET_REACTIVATION_PASS');
}
