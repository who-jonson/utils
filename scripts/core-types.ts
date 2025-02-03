import fs from 'fs-extra';
import path from 'node:path';
import { name } from './rollup.config';

(async () => {
  if (name === '@whoj/utils-core') {
    const exp = [
      'ConsistsOnlyOf',
      'IsUpper',
      'IsLower',
      'CapitalizedWords',
      'PascalCase',
      'CamelCase',
      'StringDigit'
    ].map(e => `type ${e}`).join(', ');
    let code = await fs.promises.readFile(path.resolve(process.cwd(), 'dist', 'index.d.ts'), 'utf8');
    code = code.replace('export { type', `export { ${exp}, type`);
    await fs.promises.writeFile(path.resolve(process.cwd(), 'dist', 'index.d.ts'), code, 'utf8');
  }
})();
