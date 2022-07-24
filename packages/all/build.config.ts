import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    'src/index'
  ],
  rollup: {
    alias: {
      entries: [
        { find: /^node:(.+)$/, replacement: '$1' }
      ]
    },
    dts: {
      respectExternal: true
    },
    emitCJS: true,
    esbuild: {
      target: 'node14',
      treeShaking: true
    },
    replace: {
      'import.meta.vitest': 'undefined'
    },
    resolve: {
      preferBuiltins: true
    }
  }
});
