import type { Plugin } from 'rollup';

import Vue from '@vitejs/plugin-vue';
import { defineBuildConfig } from 'unbuild';
import Postcss from 'rollup-plugin-postcss';
import { flattenArrayable } from '@whoj/utils-core';

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: [
    { builder: 'rollup', input: 'src/index', name: 'index' },
    { builder: 'rollup', input: 'src/fusejs/index', name: 'fusejs' },
    { builder: 'rollup', input: 'src/ripple/index', name: 'ripple' },
    { builder: 'rollup', input: 'src/composables/index', name: 'composables' },
    { builder: 'rollup', input: 'src/img-fallback/index', name: 'img-fallback' }
  ],
  failOnWarn: false,
  hooks: {
    'rollup:options': async (ctx, options) => {
      options.plugins = (options.plugins || []) as unknown as Plugin[];
      options.plugins.unshift(...[
        Postcss({
          inject: true
        }),
        Vue({
          isProduction: false
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
        entry.chunkFileNames = ({ isDynamicEntry }) => `_${isDynamicEntry ? 'chunks' : 'shared'}/[name].${/es|module/.test(entry.format!) ? 'mjs' : 'cjs'}`;
      }
    }
  },
  rollup: {
    alias: {
      entries: [
        { find: /^node:(.+)$/, replacement: '$1' }
      ]
    },
    cjsBridge: true,
    commonjs: {
      include: [/node_modules/]
    },
    dts: {
      compilerOptions: {
        composite: false,
        customConditions: ['develop']
      },
      tsconfig: '../../tsconfig.build.json'
    },
    emitCJS: true,
    esbuild: {
      legalComments: 'eof',
      platform: 'node',
      target: 'esnext',
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
