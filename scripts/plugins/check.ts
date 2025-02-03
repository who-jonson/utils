import path from 'node:path';
import type { Plugin } from 'rollup';
import { createUnplugin } from 'unplugin';
import { existsSync, appendFileSync } from 'node:fs';
import { lstat, readdir, readFile, writeFile } from 'node:fs/promises';

export function resolveEmptyExports(_opts?: any): Plugin {
  return {
    name: 'rollup-plugin-checker',
    writeBundle(options, op) {
      for (const [file, out] of Object.entries(op)) {
        if (out.type !== 'asset' && out.isEntry && !out.exports.length) {
          appendFileSync(
            path.resolve(process.cwd(), (options.file || `${options.dir}/${file}`)),
            `\n${file.endsWith('.mjs') ? 'export ' : 'module.exports = '}{};\n`,
            'utf-8'
          );
        }
      }
    }
  };
}

function transform(content: string) {
  return content
    .replace(/import '.*';/g, '')
    .replace(/import ".*";/g, '')
    .replace(/^require\('.*'\);/gm, '')
    .replace(/^require\(".*"\);/gm, '')
    .replace(/\n\s*\n/g, '\n');
}
async function processFiles(dir: string) {
  if (!existsSync(dir)) {
    return;
  }
  return (await readdir(dir))
    .map(async (entryName) => {
      const currentPath = `${dir}/${entryName}`;

      if ((await lstat(currentPath)).isDirectory()) {
        return processFiles(currentPath);
      }

      if (!['.mjs', '.cjs'].includes(path.extname(currentPath))) {
        return;
      }

      const content = await readFile(currentPath, 'utf8');

      const result = transform(content);

      if (!result) {
        return;
      }

      await writeFile(currentPath, result);
    });
}

export const fixImportHell = createUnplugin(({ dir }: { dir?: (outDir: string) => string } = {}) => {
  let outDir = '';
  return {
    name: 'fix-import-hell',
    esbuild: {
      setup(build) {
        if (build.initialOptions.outdir) {
          outDir = dir?.(build.initialOptions.outdir) || build.initialOptions.outdir;
        }
      }
    },

    vite: {
      configResolved: (config) => {
        outDir = dir?.(config.build.outDir) || config.build.outDir;
      }
    },

    rollup: {
      outputOptions: (_options) => {
        _options.dir && (outDir = (dir?.(_options.dir) || _options.dir));
      }
    },

    webpack: ({ options: _options }) => {
      _options.output.path && (outDir = (dir?.(_options.output.path) || _options.output.path));
    },

    closeBundle: () => processFiles(outDir)
  };
});

export function fixImportHellVite(opt?: { dir?: (outDir: string) => string }) {
  return fixImportHell.vite(opt);
}
export function fixImportHellRollup(opt?: { dir?: (outDir: string) => string }) {
  return fixImportHell.rollup(opt);
}
