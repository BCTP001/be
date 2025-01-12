const { defineConfig } = require('eslint-define-config');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    ignores: ['codegen.ts'],
  },
 {
  files: ['*.ts', '*.tsx'],
  rules: {

  },
  ignores: ['codegen.ts'],
},
]);

