import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const excluded = new Set(['dist', 'node_modules', '.git']);
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  await cp(join(root, entry.name), join(out, entry.name), { recursive: true });
}
console.log('V10 static build ready:', out);
