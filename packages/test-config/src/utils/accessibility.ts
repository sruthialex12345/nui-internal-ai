import { expect } from 'vitest'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend expect with accessibility matchers
expect.extend(toHaveNoViolations)

// Test accessibility of a rendered component
export async function expectAccessible(container: Element): Promise<void> {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Test specific accessibility rules
export async function testA11y(
  container: Element, 
  options?: {
    rules?: Record<string, { enabled: boolean }>
    tags?: string[]
  }
): Promise<any> {
  const results = await axe(container, {
    rules: {
      // Common rules to test
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
      ...options?.rules
    }
  })
  
  return results
}

// Helper to test keyboard navigation
export const testKeyboardNavigation = async (
  _element: Element,
  keys: string[] = ['Tab', 'Enter', 'Space', 'ArrowDown', 'ArrowUp', 'Escape']
): Promise<Record<string, boolean>> => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  
  const results: Record<string, boolean> = {}
  
  for (const key of keys) {
    try {
      await user.keyboard(`{${key}}`)
      results[key] = true
    } catch (error) {
      results[key] = false
    }
  }
  
  return results
}

// Common accessibility test patterns
export const a11yTestPatterns = {
  // Test form accessibility
  testForm: async (container: Element): Promise<any> => {
    const results = await testA11y(container, {
      rules: {
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'required-attr': { enabled: true }
      }
    })
    return results
  },

  // Test button accessibility  
  testButton: async (container: Element): Promise<any> => {
    const results = await testA11y(container, {
      rules: {
        'button-name': { enabled: true },
        'focusable-element': { enabled: true }
      }
    })
    return results
  },

  // Test navigation accessibility
  testNavigation: async (container: Element): Promise<any> => {
    const results = await testA11y(container, {
      rules: {
        'landmark-one-main': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true }
      }
    })
    return results
  }
}