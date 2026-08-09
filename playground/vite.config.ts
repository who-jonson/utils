import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  experimental: {
    importGlobRestoreExtension: true
  },
  plugins: [
    vue({})
  ],
  root: resolve(fileURLToPath(new URL('./', import.meta.url)))
});
