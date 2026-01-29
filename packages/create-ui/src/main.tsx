import ReactDOM from 'react-dom/client'

import './styles.css'

import RootComponent from './index'

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RootComponent />)
}
