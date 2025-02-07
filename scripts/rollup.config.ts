import path from 'node:path';
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
import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { Options as EsbuildOptions } from 'rollup-plugin-esbuild';
import type { InputOption, OutputOptions, RollupOptions } from 'rollup';
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
  'vue': 'Vue',
  'fuse.js': 'Fuse',
  'vue-demi': 'VueDemi',
  'resumablejs': 'Resumable'
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
  '@whoj/utils-php': 'Whoj.Utils.Php',
  '@whoj/utils-vue': 'Whoj.Utils.Vue',
  '@whoj/utils-core': 'Whoj.Utils.Core'
};

function plugins(opt: EsbuildOptions = {}) {
  return [
    alias({
      entries: [
        { find: /^node:(.+)$/, replacement: '$1' },
        { find: /^vue$/, replacement: 'vue-demi' },
        {
          find: /^@whoj\/utils-(core|types|php|vue)$/,
          replacement: path.join(__dirname, '..', 'packages/$1/src')
        }
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
    input: 'src/index.ts',
    external: getExternals(),
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
        external: ['vue', 'vue-demi'],
        output: {
          ...outputFileConfig({
            input,
            ext: 'global.js',
            format: 'iife'
          }),
          globals: {
            'vue': 'Vue',
            'vue-demi': 'VueDemi'
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
        external: ['vue', 'vue-demi'],
        output: {
          ...outputFileConfig({
            input,
            format: 'iife',
            ext: 'global.min.js'
          }),
          globals: {
            'vue': 'Vue',
            'vue-demi': 'VueDemi'
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
          : 'src/*.ts',
      { cwd, absolute: false, ignore: ['**/*.test.*'] }
    ).reduce<{ [entryAlias: string]: string }>((obj, entry) => ({
      ...obj,
      [entry.substring(0, entry.lastIndexOf('.')).replace(/src\//, '')]: entry
    }), {});
  }

  // Node (Cjs, Esm) Build
  const formats = ['cjs', 'esm'] as const;
  config.push({
    ...commonOptions,
    input,
    output: formats.map(format => ({
      ...outputFileConfig({
        input,
        format,
        ext: format === 'esm' ? 'mjs' : format
      }),
      externalLiveBindings: false
    })), // @ts-ignore
    plugins: plugins({
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
        respectExternal: /@whoj\/utils-(?:core|types)/.test(name)
      })
    ],
    output: (['d.ts', 'd.cts', 'd.mts'] as const).map(ext => outputFileConfig({
      input,
      ext,
      format: ext !== 'd.cts' ? 'esm' : 'cjs'
    }))
  });

  // DTS Build Config
  config.push({
    ...commonOptions,
    input: makeDtsEntry('src/index.ts'),
    plugins: [
      Dts({
        tsconfig,
        compilerOptions: {
          composite: false,
          customConditions: ['develop']
        },
        respectExternal: /@whoj\/utils-(?:core|types)/.test(name)
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
  ext: 'cjs' | 'mjs' | 'd.ts' | 'd.cts' | 'd.mts' | 'global.js' | 'global.min.js' | 'esm-browser.js' | 'esm-browser.min.js';
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
    dir: !isStr ? dir : undefined,
    minifyInternalExports: ext === 'global.min.js',
    entryFileNames: `[name].${ext}`,
    name: isIife ? globalNames[name] : undefined,
    globals: isIife ? Object.assign(globals, GLOBALS) : undefined,
    file: isStr ? `${input.substring(0, input.lastIndexOf('.')).replace('src/', `${dir}/`)}.${ext}` : undefined,
    plugins: [
      resolveEmptyExports()
    ],
    manualChunks: name.endsWith('vue') && format !== 'iife' ? vueChunks : undefined,
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
        }
  };
}

function makeDtsEntry(input: InputOption): InputOption {
  logger.info(input);
  return input;
}

export function getExternals(format: OutputOptions['format'] = 'esm') {
  return ['iife', 'umd'].includes(format)
    ? ['vue', 'vue-demi']
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
