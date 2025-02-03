import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // @ts-ignore
    vue({ reactivityTransform: true })
  ],
  optimizeDeps: {
    exclude: [
      'vue-demi'
    ]
  },
  test: {
    include: [
      '{packages,test}/**/*.{test,spec}.ts'
    ],
    exclude: [
      'playground/**',
      'scripts/**'
    ],
    globals: true,
    setupFiles: [
      // './__tests__/utils/global-variables.ts'
    ]
  }
});
