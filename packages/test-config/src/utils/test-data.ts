// Test data factories for consistent test data generation

export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'user',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockOrganization = (overrides = {}) => ({
  id: '1', 
  name: 'Test Organization',
  slug: 'test-org',
  description: 'A test organization',
  logo: 'https://example.com/logo.jpg',
  settings: {
    theme: 'light',
    notifications: true
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  data,
  success: true,
  message: 'Success',
  timestamp: new Date().toISOString(),
  ...overrides
})

export const createMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  perPage = 10,
  total?: number
) => ({
  data: items,
  pagination: {
    page,
    perPage,
    total: total ?? items.length,
    totalPages: Math.ceil((total ?? items.length) / perPage),
    hasNextPage: page * perPage < (total ?? items.length),
    hasPrevPage: page > 1
  },
  success: true,
  message: 'Success'
})

// Form data helpers
export const createMockFormData = (fields: Record<string, any>) => {
  const formData = new FormData()
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, item)
      })
    } else {
      formData.append(key, String(value))
    }
  })
  
  return formData
}

// Error response factories
export const createMockError = (
  message = 'Something went wrong',
  code = 'UNKNOWN_ERROR',
  status = 500
) => ({
  error: {
    message,
    code,
    status,
    timestamp: new Date().toISOString()
  },
  success: false
})

export const createMockValidationError = (
  field: string,
  message = 'This field is required'
) => ({
  error: {
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    status: 422,
    details: {
      [field]: [message]
    }
  },
  success: false
})

// Generate arrays of test data
export const generateMockUsers = (count = 5) => 
  Array.from({ length: count }, (_, index) => 
    createMockUser({
      id: String(index + 1),
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`
    })
  )

export const generateMockOrganizations = (count = 3) =>
  Array.from({ length: count }, (_, index) =>
    createMockOrganization({
      id: String(index + 1),
      name: `Organization ${index + 1}`,
      slug: `org-${index + 1}`
    })
  )