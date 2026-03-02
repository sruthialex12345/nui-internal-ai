import { vi } from 'vitest'

// Mock fetch with customizable responses
export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as any
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      }),
    },
    writable: true,
  })
}

// Mock router for TanStack Router
export const mockRouter = {
  navigate: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

// Mock console methods (useful for testing error boundaries)
export const mockConsole = () => ({
  originalError: console.error,
  originalWarn: console.warn,
  mockError: vi.spyOn(console, 'error').mockImplementation(() => {}),
  mockWarn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  restore: () => {
    console.error = console.error
    console.warn = console.warn
  }
})

// Mock form data for file uploads
export const createMockFile = (
  name = 'test.txt',
  content = 'test content',
  type = 'text/plain'
) => {
  const file = new File([content], name, { type })
  return file
}

// Mock API endpoints
export const createMockApiHandlers = () => {
  return {
    // Example: Mock user profile endpoint
    getUserProfile: (response: any) => 
      mockFetch(response),
    
    // Example: Mock organizations endpoint  
    getOrganizations: (response: any) =>
      mockFetch(response),
      
    // Error responses
    serverError: () => mockFetch({ message: 'Server Error' }, 500),
    notFound: () => mockFetch({ message: 'Not Found' }, 404),
    unauthorized: () => mockFetch({ message: 'Unauthorized' }, 401),
  }
}