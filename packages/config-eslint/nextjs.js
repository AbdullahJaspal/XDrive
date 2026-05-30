import base from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
];
