import baseConfig from '@repo/tailwind-config/tailwind.config.js';

export default {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
};