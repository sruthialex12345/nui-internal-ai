import js from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["package.json", "dist/**", "node_modules/**"],
  },

  // 2. Base Configuration (Equivalent to extends: "eslint:recommended")
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // Equivalent to env: { node: true, es6: true }
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    // No "root: true" needed; Flat Config acts as root by default
  },
];