import { config } from "@repo/eslint-config";

export default [
  ...config,
  {
    ignores: ["dist/**", "node_modules/**"]
  }
];