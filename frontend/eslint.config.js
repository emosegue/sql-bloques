const js = require('@eslint/js');
const globals = require('globals');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  // ESLint built-in recommended rules
  js.configs.recommended,

  // Project-wide settings
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },

  // Prettier must be last — disables conflicting formatting rules
  prettierRecommended,

  // Ignore build output and config files
  {
    ignores: ['build/**', 'node_modules/**'],
  },
];
