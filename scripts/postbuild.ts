import type { InlineConfig } from 'vite';

import mri from 'mri';
import { build } from 'vite';
import { resolve } from 'pathe';
import Vue from '@vitejs/plugin-vue';

(async (root: string, { name, vue }) => {
  const config = <InlineConfig>{
    build: {
      emptyOutDir: false,
      lib: {
        entry: 'src/index.ts',
        fileName: format => format === 'iife' ? 'index.global.js' : 'index.esm-browser.js',
        formats: ['es', 'iife'],
        name
      },
      outDir: resolve(root, 'dist'),

      rollupOptions: {
        external: ['vue', 'fuse.js', 'resumablejs'],
        output: {
          globals: {
            'fuse.js': 'Fuse',
            'resumablejs': 'Resumable',
            'vue': 'Vue'
          }
        }
      }
    },
    resolve: {
      alias: [
        { find: /^node:(.+)$/, replacement: '$1' }
      ]
    },
    root
  };

  if (vue) {
    config.plugins = config.plugins || [];
    config.plugins.push(Vue({
      isProduction: true,
      reactivityTransform: true
    }));
  }

  await build(config);
})(process.cwd(), mri(process.argv.slice(2)));
