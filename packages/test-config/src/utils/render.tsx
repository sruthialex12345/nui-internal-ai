import React, { ReactElement, ReactNode } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialEntries?: string[]
  wrapper?: React.ComponentType<{ children: ReactNode; queryClient?: QueryClient }>
}

function AllTheProviders({ 
  children, 
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    }
  })
}: {
  children: ReactNode
  queryClient?: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export function render(
  ui: ReactElement,
  {
    queryClient,
    wrapper: Wrapper = AllTheProviders,
    ...options
  }: CustomRenderOptions = {}
) {
  const utils = rtlRender(ui, {
    wrapper: (props) => <Wrapper {...props} queryClient={queryClient} />,
    ...options,
  })

  return {
    ...utils,
    // Add custom utilities
    rerender: (newUi: ReactElement, newOptions?: CustomRenderOptions) =>
      render(newUi, { container: utils.container, ...newOptions }),
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'