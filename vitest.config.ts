import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // @ts-ignore
    vue({ reactivityTransform: true })
  ],
  test: {
    exclude: [
      'playground/**',
      'scripts/**'
    ],
    globals: true,
    include: [
      '{packages,test}/**/*.{test,spec}.ts'
    ],
    setupFiles: [
      // './__tests__/utils/global-variables.ts'
    ]
  }
});
