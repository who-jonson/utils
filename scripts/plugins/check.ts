import path from 'path';
import fs from 'fs-extra';
import type { Plugin } from 'rollup';

export function resolveEmptyExports(_opts?: any): Plugin {
  return {
    name: 'rollup-plugin-checker',
    writeBundle(options, op) {
      for (const [file, out] of Object.entries(op)) {
        if (out.type !== 'asset' && out.isEntry && !out.exports.length) {
          fs.appendFileSync(
            path.resolve(process.cwd(), (options.file || `${options.dir}/${file}`)),
            `\n${file.endsWith('.mjs') ? 'export ' : 'module.exports = '}{};\n`,
            'utf-8'
          );
        }
      }
    }
  };
}
