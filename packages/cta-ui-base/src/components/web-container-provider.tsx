import { createContext, useEffect, useState } from 'react'
import { useStore } from 'zustand'
import createWebContainerStore from '../hooks/use-webcontainer-store'

export const WebContainerContext = createContext<ReturnType<
  typeof createWebContainerStore
> | null>(null)

export default function WebContainerProvider({
  children,
  projectFiles,
}: {
  children: React.ReactNode
  projectFiles: Array<{ path: string; content: string }>
}) {
  console.log(
    'WebContainerProvider rendering with',
    projectFiles.length,
    'files',
  )
  const [containerStore] = useState(() => createWebContainerStore(true))

  const updateProjectFiles = useStore(
    containerStore,
    (state) => state.updateProjectFiles,
  )

  useEffect(() => {
    console.log(
      'WebContainerProvider useEffect triggered with',
      projectFiles.length,
      'files',
    )
    updateProjectFiles(projectFiles)
  }, [updateProjectFiles, projectFiles])

  return (
    <WebContainerContext.Provider value={containerStore}>
      {children}
    </WebContainerContext.Provider>
  )
}
