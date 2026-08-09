import type { Options as EsbuildOptions } from 'rollup-plugin-esbuild';
import type { InputOption, OutputOptions, RollupOptions } from 'rollup';

import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'node:path';
import glob from 'fast-glob';
import consola from 'consola';
import Dts from 'rollup-plugin-dts';
import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'rollup';
import alias from '@rollup/plugin-alias';
import postcss from 'rollup-plugin-postcss';
import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import { cjsShimPlugin, fixImportHellRollup, resolveEmptyExports } from './plugins';

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
  'fuse.js': 'Fuse',
  'resumablejs': 'Resumable',
  'vue': 'Vue'
};

const cwd = process.cwd();
const logger = consola.withTag('@whoj/utils');
export const { dependencies, name, peerDependencies, version } = fs.readJSONSync(path.resolve(cwd, 'package.json'), 'utf8');
export const tsconfig = path.resolve(__dirname, '../tsconfig.build.json');
export const banner = `/**
 * @license MIT
 * @module ${name}@${version}
 * @copyright (c) ${new Date().getFullYear()} Jonson B.
 */
`;

const globalNames = {
  '@whoj/utils': 'Whoj.Utils',
  '@whoj/utils-core': 'Whoj.Utils.Core',
  '@whoj/utils-php': 'Whoj.Utils.Php',
  '@whoj/utils-vue': 'Whoj.Utils.Vue'
};

function plugins(opt: EsbuildOptions = {}) {
  return [
    alias({
      entries: [
        { find: /^node:(.+)$/, replacement: '$1' }
        // {
        //   find: /^@whoj\/utils-(core|types|php|vue)$/,
        //   replacement: path.join(__dirname, '..', 'packages/$1/src')
        // }
      ]
    }),
    nodeResolve({
      extensions: DEFAULT_EXTENSIONS
    }),
    postcss({
      inject: true
    }),
    Vue({
      isProduction: false
    }),
    esbuild({
      define: {
        'import.meta.DEV': JSON.stringify(!!process.env.DEV),
        'import.meta.env.PROD': JSON.stringify(!!process.env.PROD),
        'import.meta.vitest': 'undefined'
      },
      legalComments: 'eof',
      loaders: {
        '.js': 'js',
        '.jsx': 'jsx',
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.vue': 'ts'
      },
      target: 'esnext',
      tsconfig,
      ...opt
    }),
    commonjs({
      extensions: DEFAULT_EXTENSIONS
    }),
    cjsShimPlugin({}),
    fixImportHellRollup()
  ];
}

export default defineConfig(() => {
  logger.log(`${chalk.yellowBright('Bundling:')} -->> ${chalk.cyanBright.italic(name)} -->>  ${chalk.greenBright.bold(globalNames[name] || '')}`);
  logger.log(`${chalk.yellowBright('tsconfig:')} -->> ${chalk.cyanBright.italic(path.relative(cwd, tsconfig))}`);

  const dtsOnly = name.endsWith('utils-types');

  let input: InputOption = 'src/index.ts';

  const commonOptions: Omit<RollupOptions, 'output'> = {
    external: getExternals(),
    input: 'src/index.ts',
    onwarn: (warning, warn) => {
      if (!['EMPTY_BUNDLE', 'UNKNOWN_OPTION'].includes(warning.code!)) {
        warn(warning);
      }
    }
  };
  const config: RollupOptions[] = [];

  if (!dtsOnly && !name.endsWith('php')) {
    config.push(
      // Iife Build
      {
        ...commonOptions,
        external: ['vue'],
        output: {
          ...outputFileConfig({
            ext: 'global.js',
            format: 'iife',
            input
          }),
          globals: {
            vue: 'Vue'
          }
        }, // @ts-ignore
        plugins: plugins()
      }
      // Esm-Browser Build
      /* {
        ...commonOptions,
        output: {
          ...outputFileConfig({
            input,
            format: 'esm',
            ext: 'esm-browser.js'
          }),
          externalLiveBindings: false
        },
        plugins: plugins()
      } */
    );

    config.push(
      // Iife Build (mini)
      {
        ...commonOptions,
        external: ['vue'],
        output: {
          ...outputFileConfig({
            ext: 'global.min.js',
            format: 'iife',
            input
          }),
          globals: {
            vue: 'Vue'
          }
        }, // @ts-ignore
        plugins: plugins({
          minify: true
        })
      }
    );
  }

  if (!/@whoj\/utils-types/.test(name)) {
    input = glob.sync(
      name.endsWith('php')
        ? ['src/index.ts', 'src/{laravel,serializers}/*.ts']
        : name.endsWith('vue')
          ? ['src/index.ts', 'src/*/index.ts']
          : ['src/*.ts', 'src/*/*.ts'],
      { absolute: false, cwd, ignore: ['**/*.test.*'] }
    ).reduce<{ [entryAlias: string]: string }>((obj, entry) => ({
      ...obj,
      [entry.substring(0, entry.lastIndexOf('.')).replace(/src\//, '')]: entry
    }), {});
  }

  // Node (Esm) Build
  const formats = ['esm'] as const;
  config.push({
    ...commonOptions,
    input,
    makeAbsoluteExternalsRelative: 'ifRelativeSource',
    output: formats.map(format => ({
      ...outputFileConfig({
        ext: format === 'esm' ? 'mjs' : format,
        format,
        input
      }),
      externalLiveBindings: false
    })), // @ts-ignore
    plugins: plugins({
      platform: 'node'
    })
  });

  // DTS Build Config
  config.push({
    ...commonOptions,
    input: makeDtsEntry(input),
    output: (['d.ts', 'd.mts'] as const).map(ext => outputFileConfig({
      ext,
      format: 'esm',
      input
    })),
    plugins: [
      Dts({
        compilerOptions: {
          composite: false,
          customConditions: ['develop']
        },
        respectExternal: /@whoj\/utils-(?:core|types)/.test(name),
        tsconfig
      })
    ]
  });

  // DTS Build Config
  config.push({
    ...commonOptions,
    input: makeDtsEntry('src/index.ts'),
    output: outputFileConfig({
      ext: 'd.ts',
      format: 'esm',
      input
    }),
    plugins: [
      Dts({
        compilerOptions: {
          composite: false,
          customConditions: ['develop']
        },
        respectExternal: /@whoj\/utils-(?:core|types)/.test(name),
        tsconfig
      })
    ]
  });

  return config;
});

interface MakeOutputConfig {
  dir?: string;
  ext: 'cjs' | 'mjs' | 'd.ts' | 'd.cts' | 'd.mts' | 'global.js' | 'global.min.js' | 'esm-browser.js' | 'esm-browser.min.js';
  format?: 'esm' | 'cjs' | 'iife';
  globals?: OutputOptions['globals'];
  input: InputOption;
}

function outputFileConfig({
  dir = 'dist',
  ext,
  format = 'esm',
  globals = {},
  input = 'src/index.ts'
}: MakeOutputConfig): OutputOptions {
  const isIife = format === 'iife';
  const isStr = typeof input === 'string';
  return {
    banner,
    chunkFileNames: isStr
      ? undefined
      : () => {
          // if (isEntry) {
          //   return `_chunks/[name].${ext}`;
          // }
          if (name.endsWith('vue') && format !== 'iife') {
            return `[name].${ext}`;
          }
          return `_/[name].${ext}`;
          // return `${name.replace(/@whoj\//, '')}.[hash].${ext}`;
        },
    dir: !isStr ? dir : undefined,
    entryFileNames: `[name].${ext}`,
    exports: 'auto',
    file: isStr ? `${input.substring(0, input.lastIndexOf('.')).replace('src/', `${dir}/`)}.${ext}` : undefined,
    format,
    freeze: false,
    generatedCode: {
      constBindings: true
    },
    globals: isIife ? Object.assign(globals, GLOBALS) : undefined,
    manualChunks: name.endsWith('vue') && format !== 'iife' ? vueChunks : undefined,
    minifyInternalExports: ext === 'global.min.js',
    name: isIife ? globalNames[name] : undefined,
    plugins: [
      resolveEmptyExports()
    ]
  };
}

function makeDtsEntry(input: InputOption): InputOption {
  logger.info(input);
  return input;
}

export function getExternals(format: OutputOptions['format'] = 'esm') {
  return ['umd', 'iife'].includes(format)
    ? ['vue']
    : [
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
        /@vueuse\//,
        '@whoj/utils',
        '@whoj/utils-core',
        '@whoj/utils-types',
        '@whoj/utils-php',
        '@whoj/utils-vue'
      ].filter(m => name !== m);
}

function vueChunks(id: string) {
  if (/src\/composables/.test(id)) {
    return `composables/${path.basename(id, '.ts')}`;
  }
}
