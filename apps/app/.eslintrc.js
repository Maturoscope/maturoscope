/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    '@repo/eslint-config/next.js',
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', '@typescript-eslint'],
  parserOptions: {
    project: true,
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-undeclared-env-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
