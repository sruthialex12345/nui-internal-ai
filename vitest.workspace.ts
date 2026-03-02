import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Packages with tests
  'packages/ui',
  'packages/components', 
  'packages/utils',
  'packages/test-config',
  
  // Apps with tests (when ready)
  // 'apps/admin',
  // 'apps/cit-compass',
  
  // Individual package configs
  {
    extends: './packages/test-config/vitest.config.ts',
    test: {
      name: 'integration',
      include: ['tests/**/*.test.{js,ts,tsx}'],
      environment: 'jsdom'
    }
  }
])