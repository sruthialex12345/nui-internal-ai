// Jest-DOM matchers for TypeScript
import '@testing-library/jest-dom'

// Re-export all test utilities for easy importing
export * from './render'
export * from './mocks'
export * from './accessibility'
export * from './test-data'

// Common test helpers
export { vi, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
export type { MockedFunction } from 'vitest'

// Re-export testing library utilities
export { 
  screen, 
  fireEvent, 
  waitFor, 
  waitForElementToBeRemoved,
  within,
  getByRole,
  queryByRole,
  findByRole
} from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'