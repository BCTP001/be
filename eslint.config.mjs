import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    ignores: [
      "src/infrastructure/generated/*",
      "codegen.ts",
      "dist",
      "node_modules",
      "docker/local.pgdata",
    ],
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-control-regex": 0,
    },
  },
];
