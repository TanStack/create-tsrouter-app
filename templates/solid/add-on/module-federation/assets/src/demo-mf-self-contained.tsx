import { render } from 'solid-js/web'

function App() {
  return <div>Hello from Solid Self Contained</div>
}

export function DemoMfSelfContained(rootElement: HTMLElement) {
  render(() => <App />, rootElement)
}
