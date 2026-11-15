import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
export async function filesUnder(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? filesUnder(path.join(root, entry.name))
    : [path.join(root, entry.name)]));
  return nested.flat();
}

export async function verifyFrozenFiles(root, hashes) {
  for (const [file, expected] of Object.entries(hashes)) {
    const actual = digest(await readFile(path.join(root, file)));
    assert.equal(actual, expected, `Frozen V21 file changed: ${file}`);
  }
}

export function extractMenu(html) {
  const start = html.search(/<section\b[^>]*\bid="menu"[^>]*>/);
  assert.ok(start >= 0, 'Prerendered menu section missing');
  let depth = 0;
  for (const token of html.slice(start).matchAll(/<\/?section\b[^>]*>/g)) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, start + token.index + token[0].length);
  }
  assert.fail('Prerendered menu section is unbalanced');
}

export function verifyMenuHtml(html, expected) {
  const actual = extractMenu(html);
  assert.equal(digest(actual), expected, 'Prerendered #menu DOM changed from V21');
  return actual;
}

const allowedIds = new Set(['home', 'pizza-slider', 'forno', 'cornicione', 'catshow', 'showrail', 'gallery', 'customer', 'social', 'dove']);
const chromeClasses = ['site-top', 'site-brand', 'lang', 'vr-dock', 'dock-tile', 'dock-label', 'page-edge-blur', 'top-edge', 'bottom-edge', 'scroll-progress'];
const newComponents = ['particles-container', 'particles-canvas', 'vr-atmosphere-v22', 'vr-flat-stage', 'vr-flat-card'];

// Require a positive, explicit non-menu scope. Descendants remain safe; siblings
// of the scope itself do not. Every :is/:where alternative must be safe.
function scopeInCompound(nodes, classes) {
  return nodes.some(node => {
    if (node.type === 'id') return allowedIds.has(node.value) || node.value.startsWith('album-');
    if (node.type === 'class') return classes.has(node.value);
    if (node.type === 'pseudo' && [':is', ':where'].includes(node.value)) {
      return node.nodes?.length && node.nodes.every(selector => safeSelector(selector, classes));
    }
    return false;
  });
}

function safeSelector(selector, classes) {
  let compound = [], scoped = false, inside = false;
  const consume = () => { if (scopeInCompound(compound, classes)) { scoped = true; inside = false; } compound = []; };
  for (const node of selector.nodes) {
    if (node.type !== 'combinator') { compound.push(node); continue; }
    consume();
    const combinator = node.value.trim();
    if (scoped && (!combinator || combinator === '>')) inside = true;
    else if (scoped && !inside) scoped = false;
  }
  consume();
  return scoped;
}

export function verifyNewCss(css, label, fixture) {
  const ast = postcss.parse(css, { from: label });
  const scopes = new Set([...fixture.safeRootClasses, ...chromeClasses, ...newComponents]);
  const previousKeyframes = new Set(fixture.existingKeyframes);
  const errors = [];
  ast.walkAtRules(at => {
    if (['import', 'property', 'font-face', 'page'].includes(at.name.toLowerCase())) errors.push(`Unscoped CSS at-rule in ${label}: @${at.name}`);
    if (/keyframes$/i.test(at.name) && previousKeyframes.has(at.params.trim())) errors.push(`Existing keyframes overridden in ${label}: ${at.params}`);
  });
  ast.walkRules(rule => {
    let parent = rule.parent;
    while (parent) { if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return; parent = parent.parent; }
    selectorParser(selectors => {
      selectors.each(selector => { if (!safeSelector(selector, scopes)) errors.push(`CSS can affect frozen menu or global inheritance in ${label}: ${selector.toString()}`); });
    }).processSync(rule.selector);
  });
  assert.equal(errors.length, 0, errors.join('\n'));
  return ast;
}
