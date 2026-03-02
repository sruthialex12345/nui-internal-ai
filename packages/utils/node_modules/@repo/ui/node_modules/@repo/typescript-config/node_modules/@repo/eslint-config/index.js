import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import boundariesConfig from "./boundaries.js";
import namingConventionsPlugin from "./naming-conventions.js";

export const config = [
  eslint.configs.recommended,
 ...tseslint.configs.recommended,
 boundariesConfig,
 {
    plugins: {
      "custom": namingConventionsPlugin,
    },
    "rules": {
      "no-restricted-syntax": [
          "error",
          {
            "selector": "CallExpression[callee.object.name='console'][callee.property.name=/^(log|info|debug|trace|warn|error)$/]",
            "message": "Direct console usage is disabled. Please import { logger } from '@/lib/logger'."
          }
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "custom/naming-conventions": "error"
    },
  }
];