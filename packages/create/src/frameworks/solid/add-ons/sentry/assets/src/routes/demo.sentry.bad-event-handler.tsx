import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/demo/sentry/bad-event-handler')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => {
          throw new Error('Sentry Frontend Error')
        }}
      >
        Throw error
      </button>
    </div>
  )
}
