import fs from 'fs-extra';
import path from 'node:path';
import glob from 'fast-glob';
import minimist from 'minimist';

async function beforeBuild() {
  const files = glob.sync('*.ts', {
    cwd: path.resolve(import.meta.dirname, '../../core/src'),
    ignore: ['*.test.ts']
  }).reduce((obj, entry) => {
    const name = entry.replace(/\.ts$/, '');
    return {
      ...obj,
      [`src/core/${entry}`]: `export * from '@whoj/utils-core${name === 'index' ? '' : `/${name}`}';`
    };
  }, {} as Record<string, string>);

  // console.log();

  if (!fs.existsSync(path.join(import.meta.dirname, '..', 'src/core'))) {
    await fs.mkdir(
      path.join(import.meta.dirname, '..', 'src/core'),
      { recursive: true }
    );
  }

  await Promise.all(
    Object.entries(files).map(([name, code]) => fs.writeFile(
      path.join(import.meta.dirname, '..', name),
      code
    ))
  );
}

(async (args) => {
  if (args.pre) {
    await beforeBuild();
  }
})(minimist(process.argv.slice(2)));
