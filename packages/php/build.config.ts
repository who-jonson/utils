import { defineBuildConfig } from 'unbuild';

// const inputs = fg.glob.sync('**/*.ts', {
//   absolute: false,
//   cwd: path.resolve('./src')
// }).map(file => ({
//   input: `src/${file}`,
//   builder: 'rollup',
//   name: file.replace(/.ts$/, '')
// }));

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: [
    { input: 'src/', builder: 'mkdist', ext: 'js', format: 'esm' }
  ],
  failOnWarn: false,
  rollup: {
    alias: {
      entries: [
        { find: /^node:(.+)$/, replacement: '$1' }
      ]
    },
    dts: {
      tsconfig: '../../tsconfig.build.json',
      compilerOptions: {
        composite: false,
        customConditions: ['develop']
      }
    },
    emitCJS: true,
    cjsBridge: true,
    commonjs: {
      include: [/node_modules/]
    },
    esbuild: {
      target: 'esnext',
      treeShaking: true,
      platform: 'node',
      legalComments: 'eof'
    },
    replace: {
      'import.meta.vitest': 'undefined'
    },
    resolve: {
      preferBuiltins: true
    }
  }
  // hooks: {
  //   'rollup:options': (ctx, options) => {
  //     const { output } = options;
  //     options.shimMissingExports = true;
  //     options.makeAbsoluteExternalsRelative = 'ifRelativeSource';
  //     for (const entry of flattenArrayable(output)) {
  //       entry.exports = 'auto';
  //       // @ts-ignore
  //       entry.generatedCode.constBindings = true;
  //       entry.externalLiveBindings = true;
  //       entry.chunkFileNames = ({ isDynamicEntry }) => `_${isDynamicEntry ? 'chunks' : 'shared'}/[name].${/es|module/.test(entry.format!) ? 'mjs' : 'cjs'}`;
  //     }
  //   }
  // }
});
