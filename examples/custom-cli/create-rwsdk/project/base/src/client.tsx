import { initClientNavigation } from 'rwsdk/client'
import { initRealtimeClient } from 'rwsdk/realtime/client'

const { handleResponse } = initClientNavigation()

// Initialize realtime client with pathname as key
initRealtimeClient({
  key: window.location.pathname,
  handleResponse,
})
