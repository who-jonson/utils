import Vue from '@vitejs/plugin-vue';
import type { Plugin } from 'rollup';
import { defineBuildConfig } from 'unbuild';
import Postcss from 'rollup-plugin-postcss';
import { flattenArrayable } from '@whoj/utils-core';

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    { input: 'src/index', builder: 'rollup', name: 'index' },
    { input: 'src/fusejs/index', builder: 'rollup', name: 'fusejs' },
    { input: 'src/ripple/index', builder: 'rollup', name: 'ripple' },
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
  },
  hooks: {
    'rollup:options': async (ctx, options) => {
      options.plugins = (options.plugins || []) as unknown as Plugin[];
      options.plugins.unshift(...[
        Postcss({
          inject: true
        }),
        Vue({
          isProduction: false,
          reactivityTransform: true
        })
      ]);
      const { output } = options;
      options.shimMissingExports = true;
      options.makeAbsoluteExternalsRelative = 'ifRelativeSource';
      for (const entry of flattenArrayable(output)) {
        entry.exports = 'auto';
        // @ts-ignore
        entry.generatedCode.constBindings = true;
        entry.externalLiveBindings = true;
        entry.chunkFileNames = ({ isDynamicEntry }) => `_${isDynamicEntry ? 'chunks' : 'shared'}/[name].${/(es|esm|module)/.test(entry.format!) ? 'mjs' : 'cjs'}`;
      }
    }
  }
});
