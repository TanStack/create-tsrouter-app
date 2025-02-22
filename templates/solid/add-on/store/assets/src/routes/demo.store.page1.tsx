import { createFileRoute } from '@tanstack/solid-router'
import { useStore } from '@tanstack/solid-store'

import { store } from '../lib/demo-store'

export const Route = createFileRoute('/demo/store/page1')({
  component: App,
})

function App() {
  const count = useStore(store, (state) => state.count)

  return (
    <div class="p-4 flex flex-col gap-2">
      <p class="text-2xl">Global Count: {count()}</p>
      <button
        onClick={() => {
          store.setState((state) => ({
            count: state.count + 1,
          }))
        }}
        class="mt-4 inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Increment count
      </button>
    </div>
  )
}

export default App
