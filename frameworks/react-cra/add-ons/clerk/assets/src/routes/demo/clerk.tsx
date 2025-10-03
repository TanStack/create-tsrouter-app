import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'

export const Route = createFileRoute('/demo/clerk')({
  component: App,
})

function App() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="p-4">Loading...</div>
  }

  if (!isSignedIn) {
    return <div className="p-4">Sign in to view this page</div>
  }

  return <div className="p-4">Hello {user.firstName}!</div>
}
