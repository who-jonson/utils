import whoj from '@whoj/eslint-config';
import testingLibrary from 'eslint-plugin-testing-library';

const sortRule = ['error', { type: 'line-length' }];

export default whoj(
  {
    // customize the stylistic rules
    stylistic: {
      indent: 2,
      semi: true,
      quotes: 'single',
      commaDangle: 'never'
    },

    typescript: {
      overrides: {
        'ts/explicit-function-return-type': ['off'],
        'ts/no-unsafe-function-type': ['off'],
        'ts/ban-ts-comment': 'off',
        'ts/no-unused-vars': 'warn',
        'ts/no-explicit-any': 'off',
        'ts/no-empty-object-type': 'off',
        'ts/no-unused-expressions': 'off',
        'ts/method-signature-style': 'off'
      }
    },

    jsonc: false,
    yaml: false,
    type: 'lib',
    tooling: true,
    markdown: false,

    ignores: [
      '**/fixtures',
      '**/dist/components/',
      '**/package.json',
      '/src/templates/plugin.js',
      '**/_typed-scss.ts',
      '**/*.test.ts'
    ],

    env: {
      node: true
    }
  },
  {
    rules: {
      'eqeqeq': 'warn',
      'semi': [2, 'always'],
      'import/order': 'off',
      'require-await': 'warn',
      'no-useless-escape': 'off',
      'quotes': ['error', 'single'],
      'style/comma-dangle': ['error', 'never'],
      'style/spaced-comment': 'off',
      'node/prefer-global/buffer': ['off'],
      'node/prefer-global/process': ['off'],

      'jsdoc/require-returns-check': ['off'],
      'jsdoc/require-returns-description': ['off'],

      'perfectionist/sort-exports': sortRule,
      'perfectionist/sort-named-exports': sortRule,
      'perfectionist/sort-imports': ['off'],
      'perfectionist/sort-named-imports': sortRule,

      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
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
