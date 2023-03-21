import mri from 'mri';
import { build } from 'vite';
import { resolve } from 'pathe';
import Vue from '@vitejs/plugin-vue';
import type { InlineConfig } from 'vite';

(async (root: string, { name, vue }) => {
  const config = <InlineConfig>{
    root,
    build: {
      outDir: resolve(root, 'dist'),
      emptyOutDir: false,
      lib: {
        name,
        entry: 'src/index.ts',
        formats: ['es', 'iife'],
        fileName: format => format === 'iife' ? 'index.global.js' : 'index.esm-browser.js'
      },

      rollupOptions: {
        external: ['vue', 'fuse.js', 'resumablejs'],
        output: {
          globals: {
            'vue': 'Vue',
            'fuse.js': 'Fuse',
            'resumablejs': 'Resumable'
          }
        }
      }
    },
    resolve: {
      alias: [
        { find: /^node:(.+)$/, replacement: '$1' }
      ]
    }
  };

  if (vue) {
    config.plugins = config.plugins || [];
    config.plugins.push(Vue({
      reactivityTransform: true,
      isProduction: true
    }));
  }

  await build(config);
})(process.cwd(), mri(process.argv.slice(2)));
