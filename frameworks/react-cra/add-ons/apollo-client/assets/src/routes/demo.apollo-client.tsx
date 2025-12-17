import { gql, TypedDocumentNode } from '@apollo/client'
import { useReadQuery } from '@apollo/client/react'
import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

// Example GraphQL query - replace with your own schema
const EXAMPLE_QUERY: TypedDocumentNode<{
  posts: { id: string; title: string; content: string }
}> = gql`
  query ExampleQuery {
    posts {
      id
      title
      content
    }
  }
`

export const Route = createFileRoute('/demo/apollo-client')({
  component: RouteComponent,
  loader: ({ context: { preloadQuery } }) => {
    // Preload the query in the loader for optimal performance
    const queryRef = preloadQuery(EXAMPLE_QUERY, {
      variables: {},
    })
    return {
      queryRef,
    }
  },
})

function RouteComponent() {
  const { queryRef } = Route.useLoaderData()
  const { data } = useReadQuery(queryRef)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Apollo Client Demo</h2>
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Apollo Client is configured!</p>
        <p className="text-sm mt-2">
          This demo uses{' '}
          <code className="bg-blue-200 px-1 rounded">preloadQuery</code> in the
          loader and{' '}
          <code className="bg-blue-200 px-1 rounded">useReadQuery</code> in the
          component for optimal streaming SSR performance.
        </p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Query Result:</h3>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>📝 Next steps:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>
            Configure your GraphQL endpoint in{' '}
            <code className="bg-gray-200 px-1 rounded">src/router.tsx</code>
          </li>
          <li>Replace the example query with your actual GraphQL schema</li>
          <li>
            Learn more:{' '}
            <a
              href="https://www.apollographql.com/docs/react"
              className="text-blue-600 hover:underline"
            >
              Apollo Client Docs
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
