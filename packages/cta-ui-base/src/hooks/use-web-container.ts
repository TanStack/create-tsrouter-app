import { useContext } from 'react'
import { WebContainerContext } from '../components/web-container-provider'

export function useWebContainer() {
  const webContainer = useContext(WebContainerContext)
  return webContainer
}
