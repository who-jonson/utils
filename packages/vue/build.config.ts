import { defineBuildConfig } from 'unbuild';
import { flattenArrayable } from '@whoj/utils-core';

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    { input: 'src/index', builder: 'rollup', name: 'index' },
    { input: 'src/fusejs/index', builder: 'rollup', name: 'fusejs' },
    { input: 'src/ripple/index', builder: 'rollup', name: 'ripple' },
    { input: 'src/tsprop/index', builder: 'rollup', name: 'prop' },
    { input: 'src/composables/index', builder: 'rollup', name: 'composables' },
    { input: 'src/img-fallback/index', builder: 'rollup', name: 'img-fallback' }
  ],
  failOnWarn: false,
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
  },
  hooks: {
    'rollup:options': async (ctx, options) => {
      const { output } = options;
      options.shimMissingExports = true;
      for (const entry of flattenArrayable(output)) {
        entry.exports = 'named';
        // @ts-ignore
        entry.generatedCode.constBindings = true;
        entry.preserveModules = true;
      }
    }
  }
});
