import { defineBuildConfig } from 'unbuild';
import type { BuildConfig as C } from 'unbuild';

export default function unbuild(entries: Required<C['entries']>, config?: Omit<C, 'entries'>) {
  return defineBuildConfig({
    declaration: true,
    clean: true,
    entries,
    rollup: {
      alias: {
        entries: [
          { find: /^node:(.+)$/, replacement: '$1' }
        ]
      },
      dts: {
        respectExternal: true
      },
      emitCJS: true,
      esbuild: {
        target: 'node14',
        treeShaking: true
      },
      replace: {
        'import.meta.vitest': 'undefined'
      },
      resolve: {
        preferBuiltins: true
      }
    },
    ...(config || {})
  });
}
