import whoj from '@whoj/eslint-config';
import testingLibrary from 'eslint-plugin-testing-library';

export default whoj(
  {
    env: {
      node: true
    },

    ignores: [
      '**/fixtures',
      '**/dist/components/',
      '**/package.json',
      '/src/templates/plugin.js',
      '**/_typed-scss.ts',
      '**/*.test.ts'
    ],

    jsonc: false,
    markdown: false,
    // customize the stylistic rules
    stylistic: {
      commaDangle: 'never',
      indent: 2,
      quotes: 'single',
      semi: true
    },
    tooling: true,
    type: 'lib',

    typescript: {
      overrides: {
        'ts/ban-ts-comment': 'off',
        'ts/explicit-function-return-type': ['off'],
        'ts/method-signature-style': 'off',
        'ts/no-empty-object-type': 'off',
        'ts/no-explicit-any': 'off',
        'ts/no-unsafe-function-type': ['off'],
        'ts/no-unused-expressions': 'off',
        'ts/no-unused-vars': 'warn'
      }
    },

    yaml: false
  },
  {
    rules: {
      'eqeqeq': 'warn',
      'import/order': 'off',
      'jsdoc/require-returns-check': ['off'],
      'jsdoc/require-returns-description': ['off'],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-useless-escape': 'off',
      'node/prefer-global/buffer': ['off'],
      'node/prefer-global/process': ['off'],
      'perfectionist/sort-classes': ['off'],

      'quotes': ['error', 'single'],
      'require-await': 'warn',

      'semi': [2, 'always'],

      'style/comma-dangle': ['error', 'never'],
      'style/spaced-comment': 'off'
    }
  },
  {
    files: [
      '**/packages/**/*.test.[jt]s?(x)',
      '**/test/**/*.test.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)'
    ],

    ...testingLibrary.configs['flat/vue']
  }
);
