import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <main>
      <Outlet /> {/* THIS IS THE MOST IMPORTANT LINE */}
    </main>
  ),
})