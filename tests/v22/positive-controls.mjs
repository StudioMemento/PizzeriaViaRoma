import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { digest, verifyFrozenFiles, verifyMenuHtml, verifyNewCss } from './freeze-contract.mjs';

export async function runPositiveControls(fixture) {
  // Exercise the actual file checker against copies, never mutate project files.
  const temp = await mkdtemp(path.join(tmpdir(), 'viaroma-v22-freeze-'));
  try {
    const sample = 'src/components/Menu.tsx';
    const bytes = await readFile(sample);
    await mkdir(path.dirname(path.join(temp, sample)), { recursive: true });
    await writeFile(path.join(temp, sample), bytes);
    const hashes = { [sample]: digest(bytes) };
    await verifyFrozenFiles(temp, hashes);
    await writeFile(path.join(temp, sample), Buffer.concat([bytes, Buffer.from('\n/* unauthorized menu change */\n')]));
    await assert.rejects(verifyFrozenFiles(temp, hashes), /Frozen V21 file changed/);
  } finally { await rm(temp, { recursive: true, force: true }); }

  const baseline = await readFile('tests/v22/menu-v21.html', 'utf8');
  verifyMenuHtml(baseline, fixture.menuHtmlSha256);
  for (const changed of [
    baseline.replace('Marinara Classica', 'Pizza non autorizzata'),
    baseline.replace('6,50', '7,50'),
    baseline.replace('/assets/menu/classiche.webp', '/assets/menu/different.webp'),
    baseline.replace('class="menu-head', 'class="new-layout menu-head'),
  ]) {
    assert.notEqual(changed, baseline, 'Positive-control mutation did not apply');
    assert.throws(() => verifyMenuHtml(changed, fixture.menuHtmlSha256), /DOM changed/);
  }

  for (const selector of ['body.v22-ready #home h1', ':is(#social,#dove) .lead', '#social .a + .b', '.vr-social > h2', '.site-top .lang button']) {
    verifyNewCss(`${selector}{color:white}`, 'allowed-control.css', fixture);
  }
  for (const selector of [':root', 'body.v22-ready', '.lead', '#menu h2', '#home,#menu', ':not(#home) h2', '#home + #menu', 'body.v22-ready :is(#social,#menu) p', '.vr-atmosphere']) {
    assert.throws(() => verifyNewCss(`${selector}{color:red}`, 'rejected-control.css', fixture), /CSS can affect frozen menu/);
  }
  if (fixture.existingKeyframes.length) {
    assert.throws(() => verifyNewCss(`@keyframes ${fixture.existingKeyframes[0]}{to{opacity:0}}`, 'keyframe-control.css', fixture), /Existing keyframes overridden/);
  }
  return 20;
}
