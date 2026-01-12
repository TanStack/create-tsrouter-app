import { setupConvex, ConvexProvider } from 'convex-solidjs'
import type { JSXElement } from 'solid-js'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}
const client = setupConvex(CONVEX_URL)

export default function AppConvexProvider(props: { children: JSXElement }) {
  return <ConvexProvider client={client}>{props.children}</ConvexProvider>
}
