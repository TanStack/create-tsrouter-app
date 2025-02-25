import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/demo/convex')({
  component: App,
})

function Products() {
  const products = useQuery(api.products.get)

  return (
    <ul>
      {(products || []).map((p) => (
        <li key={p._id}>
          {p.title} - {p.price}
        </li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <div className="p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Products />
      </Suspense>
    </div>
  )
}
