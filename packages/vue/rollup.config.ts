import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import Vue from 'unplugin-vue';
import externals from 'rollup-plugin-node-externals';

const entries = [
  'src/index.ts'
];

const plugins = [
  alias({
    entries: [
      { find: /^node:(.+)$/, replacement: '$1' }
    ]
  }),
  externals({
    builtins: false
  }),
  resolve({
    preferBuiltins: true
  }),
  json(),
  commonjs(),
  Vue.rollup({
    reactivityTransform: true,
    isProduction: true
  }),
  esbuild({
    target: 'node14'
  })
];

function buildEntries() {
  return entries.map(input => ({
    input,
    output: [
      {
        file: input.replace('src/', 'dist/').replace('.ts', '.mjs'),
        format: 'esm',
        sourcemap: true,
        generatedCode: {
          constBindings: true
        }
      },
      {
        file: input.replace('src/', 'dist/').replace('.ts', '.cjs'),
        format: 'cjs',
        sourcemap: true,
        generatedCode: {
          constBindings: true
        }
      }
    ],
    external: [],
    plugins
  }));
}

function dtsBuildEntries() {
  return entries.map(input => ({
    input,
    output: {
      file: input.replace('src/', 'dist/').replace('.ts', '.d.ts'),
      format: 'esm'
    },
    external: [],
    plugins: [
      dts({ respectExternal: true })
    ]
  }));
}

export default [
  ...buildEntries(),
  ...dtsBuildEntries()
];
