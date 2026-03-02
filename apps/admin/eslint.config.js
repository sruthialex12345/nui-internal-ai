import { config } from '@repo/eslint-config';
import react from '@repo/eslint-config/react';

export default [
  ...config,
  ...react,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];