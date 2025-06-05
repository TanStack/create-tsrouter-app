import CodeMirror from '@uiw/react-codemirror'
import CodeMirrorMerge from 'react-codemirror-merge'

import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'

import { githubDarkInit } from '@uiw/codemirror-theme-github'

const theme = githubDarkInit({
  settings: {
    background: 'oklch(0.07 0.005 285.823)',
    foreground: '#c9d1d9',
    gutterBackground: 'oklch(0.22 0.005 285.823)',
  },
})

export default function FileViewer({
  originalFile,
  modifiedFile,
  filePath,
}: {
  originalFile?: string
  modifiedFile: string
  filePath: string
}) {
  function getLanguage(file: string) {
    if (file.endsWith('.js') || file.endsWith('.jsx')) {
      return javascript({ jsx: true })
    }
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      return javascript({ typescript: true, jsx: true })
    }
    if (file.endsWith('.json')) {
      return json()
    }
    if (file.endsWith('.css')) {
      return css()
    }
    if (file.endsWith('.html')) {
      return html()
    }
    return javascript()
  }
  const language = getLanguage(filePath)

  if (!originalFile || originalFile === modifiedFile) {
    return (
      <CodeMirror
        value={modifiedFile}
        theme={theme}
        height="100vh"
        width="100%"
        readOnly
        extensions={[language]}
        className="text-lg"
      />
    )
  }
  return (
    <CodeMirrorMerge orientation="a-b" theme={theme} className="text-lg">
      <CodeMirrorMerge.Original value={originalFile} extensions={[language]} />
      <CodeMirrorMerge.Modified value={modifiedFile} extensions={[language]} />
    </CodeMirrorMerge>
  )
}
