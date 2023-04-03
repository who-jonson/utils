import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import glob from 'fast-glob';
import consola from 'consola';
import { defineConfig } from 'rollup';
import Dts from 'rollup-plugin-dts';
import Vue from '@vitejs/plugin-vue';
import alias from '@rollup/plugin-alias';
import postcss from 'rollup-plugin-postcss';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import externals from 'rollup-plugin-node-externals';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { Options as EsbuildOptions } from 'rollup-plugin-esbuild';
import type { InputOption, OutputOptions, RollupOptions } from 'rollup';
import { cjsShimPlugin } from './plugins';

const DEFAULT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.js',
  '.jsx',
  '.json'
];

const GLOBALS = {
  'vue': 'Vue',
  'fuse.js': 'Fuse',
  'vue-demi': 'VueDemi',
  'resumablejs': 'Resumable'
};

const cwd = process.cwd();
const logger = consola.withTag('@whoj/utils');
const { dependencies, name, peerDependencies, version } = fs.readJSONSync(path.resolve(cwd, 'package.json'), 'utf8');
const tsconfig = path.resolve(__dirname, '../tsconfig.build.json');
export const banner = `/**
 * @license MIT
 * @module ${name}@${version}
 * @copyright (c) ${new Date().getFullYear()} Jonson B.
 */
`;

const globalNames = {
  '@whoj/utils': 'WhojUtils',
  '@whoj/utils-vue': 'WhojUtils.Vue',
  '@whoj/utils-core': 'WhojUtils.Core'
};

const plugins = (noExternal = false, opt: EsbuildOptions = {}) => [
  alias({
    entries: [
      { find: /^node:(.+)$/, replacement: '$1' },
      { find: /^vue$/, replacement: 'vue-demi' }
    ]
  }),
  !noExternal && externals(),
  nodeResolve({
    extensions: DEFAULT_EXTENSIONS
  }),
  postcss({
    inject: true
  }),
  Vue({
    isProduction: false,
    reactivityTransform: true
  }),
  esbuild({
    tsconfig,
    target: 'esnext',
    legalComments: 'eof',
    define: {
      'import.meta.vitest': 'undefined',
      'import.meta.DEV': JSON.stringify(!!process.env.DEV),
      'import.meta.env.PROD': JSON.stringify(!!process.env.PROD)
    },
    loaders: {
      '.ts': 'ts',
      '.js': 'js',
      '.tsx': 'tsx',
      '.jsx': 'jsx',
      '.vue': 'ts'
    },
    ...opt
  }),
  commonjs({
    extensions: DEFAULT_EXTENSIONS
  }),
  cjsShimPlugin({})
];

export default defineConfig(() => {
  logger.log(`${chalk.yellowBright('Bundling:')} -->> ${chalk.cyanBright.italic(name)} -->>  ${chalk.greenBright.bold(globalNames[name] || '')}`);
  logger.log(`${chalk.yellowBright('tsconfig:')} -->> ${chalk.cyanBright.italic(path.relative(cwd, tsconfig))}`);

  const dtsOnly = name.endsWith('utils-types');

  let input: InputOption = 'src/index.ts';

  const commonOptions: Omit<RollupOptions, 'output'> = {
    input: 'src/index.ts',
    external: ['vue', 'vue-demi', 'fuse.js', 'resumablejs'],
    onwarn: (warning, warn) => {
      if (!['EMPTY_BUNDLE', 'UNKNOWN_OPTION'].includes(warning.code!)) {
        warn(warning);
      }
    }
  };
  const config: RollupOptions[] = [];

  if (!dtsOnly) {
    config.push(
      // Iife Build
      {
        ...commonOptions,
        output: {
          ...outputFileConfig({
            input,
            ext: 'global.js',
            format: 'iife'
          }),
          globals: {
            'vue': 'Vue',
            'fuse.js': 'Fuse',
            'vue-demi': 'VueDemi',
            'resumablejs': 'Resumable'
          }
        },
        plugins: plugins(true)
      },
      // Esm-Browser Build
      {
        ...commonOptions,
        treeshake: true,
        output: {
          ...outputFileConfig({
            input,
            format: 'esm',
            ext: 'esm-browser.js'
          }),
          externalLiveBindings: false
        },
        plugins: plugins(true)
      }
    );
  }

  if (!/@whoj\/utils-(core|types)/.test(name)) {
    input = glob.sync(
      name.endsWith('vue')
        ? ['src/index.ts', 'src/*/index.ts']
        : 'src/*.ts', { cwd, absolute: false }
    ).reduce<{ [entryAlias: string]: string }>((obj, entry) => ({
      ...obj,
      [entry.substring(0, entry.lastIndexOf('.')).replace(/src\//, '')]: entry
    }), {});
  }

  // Node (Cjs, Esm) Build
  const formats = dtsOnly ? ['esm'] as const : ['cjs', 'esm'] as const;
  config.push({
    ...commonOptions,
    input,
    treeshake: true,
    output: formats.map(format => ({
      ...outputFileConfig({
        input,
        format,
        ext: format === 'esm' ? 'mjs' : format
      }),
      externalLiveBindings: false
    })),
    plugins: plugins(false, {
      platform: 'node'
    }),
    makeAbsoluteExternalsRelative: 'ifRelativeSource'
  });

  // DTS Build Config
  config.push({
    ...commonOptions,
    input: makeDtsEntry(input),
    plugins: [
      Dts({
        tsconfig,
        compilerOptions: {
          composite: false,
          customConditions: ['develop']
        },
        respectExternal: /@whoj\/utils-core$/.test(name)
      })
    ],
    output: outputFileConfig({
      input,
      ext: 'd.ts',
      format: 'esm'
    })
  });

  return config;
});

interface MakeOutputConfig {
  dir?: string;
  input: InputOption;
  format?: 'esm' | 'cjs' | 'iife';
  globals?: OutputOptions['globals'];
  ext: 'cjs' | 'mjs' | 'd.ts' | 'global.js' | 'esm-browser.js';
}

function outputFileConfig({
  ext,
  globals = {},
  dir = 'dist',
  format = 'esm',
  input = 'src/index.ts'
}: MakeOutputConfig): OutputOptions {
  const isIife = format === 'iife';
  const isStr = typeof input === 'string';
  return {
    banner,
    format,
    exports: 'auto',
    freeze: false,
    generatedCode: {
      constBindings: true
    },
    sourcemap: true,
    dir: !isStr ? dir : undefined,
    minifyInternalExports: false,
    entryFileNames: `[name].${ext}`,
    chunkFileNames: isStr ? undefined : ({ isDynamicEntry }) => `_${isDynamicEntry ? 'chunks' : 'shared'}/[name].${ext}`,
    name: isIife ? globalNames[name] : undefined,
    globals: isIife ? Object.assign(globals, GLOBALS) : undefined,
    file: isStr ? `${input.substring(0, input.lastIndexOf('.')).replace('src/', `${dir}/`)}.${ext}` : undefined
  };
}

function makeDtsEntry(input: InputOption): InputOption {
  logger.info(input);
  return input;
}

/**
 * @returns {(RegExp|string)[]}
 */
export const getExternals = () => ([
  ...Object.keys({ ...(dependencies || {}), ...(peerDependencies || {}) }),
  'chalk',
  'consola',
  'fs',
  'ufo',
  'url',
  'acorn',
  'glob',
  'mlly',
  'path',
  'pathe',
  'process',
  'fast-glob',
  'pkg-types',
  'jsonc-parser',
  'child_process',
  'fs-extra',
  'nuxt3',
  'vue',
  'debug',
  'execa',
  /node:/,
  /@vue\//,
  /@whoj\//,
  /@vueuse\//
]);

