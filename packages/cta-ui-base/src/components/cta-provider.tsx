import { useManager } from '../store/project'
import { Toaster } from './toaster'

import { QueryProvider } from './query-provider'

function InternalHandler({ children }: { children: React.ReactNode }) {
  useManager()
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

export function CTAProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <InternalHandler>{children}</InternalHandler>
    </QueryProvider>
  )
}
