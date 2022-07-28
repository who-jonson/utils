import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    { input: 'src/index', builder: 'rollup', name: 'index' },
    { input: 'src/ripple/index', builder: 'rollup', name: 'ripple' }
    // { input: 'src/ripple/composables', builder: 'rollup', name: 'composables' }
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
