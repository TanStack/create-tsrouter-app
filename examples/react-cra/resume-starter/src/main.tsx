import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { createRouter } from './router'

const router = createRouter()

const rootEl = document.getElementById('root')!
ReactDOM.createRoot(rootEl).render(<RouterProvider router={router} />)
