import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // This automatically sends the user from / to /chat
    throw redirect({ to: '/chat' })
  },
})