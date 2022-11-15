import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    { input: 'src/index', builder: 'rollup', name: 'index' },
    { input: 'src/fusejs/index', builder: 'rollup', name: 'fusejs' },
    { input: 'src/img-fallback/index', builder: 'rollup', name: 'img-fallback' },
    { input: 'src/ripple/index', builder: 'rollup', name: 'ripple' },
    { input: 'src/tsprop/index', builder: 'rollup', name: 'prop' }
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
      target: 'node14'
    },
    replace: {
      'import.meta.vitest': 'undefined'
    },
    resolve: {
      preferBuiltins: true
    }
  }
});
