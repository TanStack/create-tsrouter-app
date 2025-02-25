import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'

import type { JSX } from 'solid-js'

const queryClient = new QueryClient()

export default function AppTanstackQueryProvider(props: {
  children: JSX.Element
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
