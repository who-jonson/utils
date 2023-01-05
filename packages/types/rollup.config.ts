import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';

const entries = [
  'src/index.ts'
];

const plugins = [
  alias({
    entries: [
      { find: /^node:(.+)$/, replacement: '$1' }
    ]
  }),
  resolve({
    preferBuiltins: true
  }),
  json(),
  commonjs(),
  esbuild()
];

function buildEntries() {
  return entries.map(input => ({
    input,
    output: [
      {
        file: input.replace('src/', 'dist/').replace('.ts', '.js'),
        format: 'esm'
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
