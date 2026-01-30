import { createFileRoute } from '@tanstack/solid-router'
import { createQuery } from '@tanstack/solid-query'

export const Route = createFileRoute('/demo/tanstack-query')({
  component: App,
})

function App() {
  const peopleQuery = createQuery(() => ({
    queryKey: ['people'],
    queryFn: () =>
      Promise.resolve([{ name: 'John Doe' }, { name: 'Jane Doe' }]),
    initialData: [],
  }))

  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">People list from Swapi</h1>
      <ul>{peopleQuery.data?.map((person) => <li>{person.name}</li>)}</ul>
    </div>
  )
}

export default App
