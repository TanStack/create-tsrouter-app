# Apollo Client Integration

This add-on integrates Apollo Client with TanStack Start to provide modern streaming SSR support for GraphQL data fetching.

## Dependencies

The following packages are automatically installed:

- `@apollo/client` - Apollo Client core
- `@apollo/client-integration-tanstack-start` - TanStack Start integration
- `graphql` - GraphQL implementation

## Configuration

### 1. GraphQL Endpoint

Configure your GraphQL API endpoint in `src/router.tsx`:

```tsx
// Configure Apollo Client
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'https://your-graphql-api.example.com/graphql', // Update this!
  }),
})
```

You can use environment variables by creating a `.env.local` file:

```bash
VITE_GRAPHQL_ENDPOINT=https://your-api.com/graphql
```

The default configuration already uses this pattern:

```tsx
uri: import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  'https://your-graphql-api.example.com/graphql'
```

## Usage Patterns

### Pattern 1: Loader with preloadQuery (Recommended for SSR)

Use `preloadQuery` in route loaders for optimal streaming SSR performance:

```tsx
import { gql, TypedDocumentNode } from '@apollo/client'
import { useReadQuery } from '@apollo/client/react'
import { createFileRoute } from '@tanstack/react-router'

const MY_QUERY: TypedDocumentNode<{
  posts: { id: string; title: string; content: string }[]
}> = gql`
  query GetData {
    posts {
      id
      title
      content
    }
  }
`

export const Route = createFileRoute('/my-route')({
  component: RouteComponent,
  loader: ({ context: { preloadQuery } }) => {
    const queryRef = preloadQuery(MY_QUERY, {
      variables: {},
    })
    return { queryRef }
  },
})

function RouteComponent() {
  const { queryRef } = Route.useLoaderData()
  const { data } = useReadQuery(queryRef)

  return <div>{/* render your data */}</div>
}
```

### Pattern 2: useSuspenseQuery

Use `useSuspenseQuery` directly in components with automatic suspense support:

```tsx
import { gql, TypedDocumentNode } from '@apollo/client'
import { useSuspenseQuery } from '@apollo/client/react'
import { createFileRoute } from '@tanstack/react-router'

const MY_QUERY: TypedDocumentNode<{
  posts: { id: string; title: string }[]
}> = gql`
  query GetData {
    posts {
      id
      title
    }
  }
`

export const Route = createFileRoute('/my-route')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useSuspenseQuery(MY_QUERY)

  return <div>{/* render your data */}</div>
}
```

### Pattern 3: Manual Refetching

```tsx
import { useQueryRefHandlers, useReadQuery } from '@apollo/client/react'

function MyComponent() {
  const { queryRef } = Route.useLoaderData()
  const { refetch } = useQueryRefHandlers(queryRef)
  const { data } = useReadQuery(queryRef)

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {/* render data */}
    </div>
  )
}
```

## Important Notes

### SSR Optimization

The integration automatically handles:

- Query deduplication across server and client
- Streaming SSR with `@defer` directive support
- Proper cache hydration

## Learn More

- [Apollo Client Documentation](https://www.apollographql.com/docs/react)
- [@apollo/client-integration-tanstack-start](https://www.npmjs.com/package/@apollo/client-integration-tanstack-start)

## Demo

Visit `/demo/apollo-client` in your application to see a working example of Apollo Client integration.
