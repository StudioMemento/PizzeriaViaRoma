import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

export async function loadSideSquares(platform = {}) {
  const root = 'src/components/menu/side-squares/';
  const source = await Promise.all(['preset', 'field', 'controller'].map(async name =>
    (await readFile(root + name + '.ts', 'utf8')).replace(/^import .*;\n/gm, '').replace(/export /g, ''),
  ));
  const scope = vm.createContext(platform);
  vm.runInContext(stripTypeScriptTypes(source[0] + '\nconst preset = SIDE_SQUARES;\n' + source.slice(1).join('\n')), scope);
  scope.preset = vm.runInContext('SIDE_SQUARES', scope);
  return scope;
}
