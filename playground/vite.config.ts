import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: resolve(fileURLToPath(new URL('./', import.meta.url))),
  plugins: [
    vue({})
  ],
  experimental: {
    importGlobRestoreExtension: true
  }
});
