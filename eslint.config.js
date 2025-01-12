import { defineConfig } from 'eslint-define-config';
import typescriptParser from '@typescript-eslint/parser';
import * as typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
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
  },
]);

