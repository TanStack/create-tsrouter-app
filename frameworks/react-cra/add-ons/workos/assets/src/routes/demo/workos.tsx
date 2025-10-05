import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'

export const Route = createFileRoute('/demo/workos')({
  ssr: false,
  component: App,
})

function App() {
  const { user, isLoading, signIn, signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700/50">
          <p className="text-gray-400 text-center">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700/50">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            User Profile
          </h1>

          <div className="space-y-6">
            {/* Profile Picture */}
            {user.profilePictureUrl && (
              <div className="flex justify-center">
                <img
                  src={user.profilePictureUrl}
                  alt={`Avatar of ${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-lg"
                />
              </div>
            )}

            {/* User Information */}
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <label className="text-gray-400 text-sm font-medium block mb-1">
                  First Name
                </label>
                <p className="text-white text-lg">{user.firstName || 'N/A'}</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <label className="text-gray-400 text-sm font-medium block mb-1">
                  Last Name
                </label>
                <p className="text-white text-lg">{user.lastName || 'N/A'}</p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <label className="text-gray-400 text-sm font-medium block mb-1">
                  Email
                </label>
                <p className="text-white text-lg break-all">
                  {user.email || 'N/A'}
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <label className="text-gray-400 text-sm font-medium block mb-1">
                  User ID
                </label>
                <p className="text-gray-300 text-sm font-mono break-all">
                  {user.id || 'N/A'}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          WorkOS Authentication
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Sign in to view your profile information
        </p>
        <button
          onClick={() => signIn()}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign In with AuthKit
        </button>
      </div>
    </div>
  )
}
