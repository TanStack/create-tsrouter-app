import { useContext, useEffect, useRef } from 'react'
import { useStore } from 'zustand'

import type { SetupStep } from '../hooks/use-webcontainer-store'
import { WebContainerContext } from './web-container-provider'

export function WebContainerPreview() {
  const containerStore = useContext(WebContainerContext)
  if (!containerStore) {
    throw new Error('WebContainerContext not found')
  }

  const webContainer = useStore(containerStore, (state) => state.webContainer)
  const setupStep = useStore(containerStore, (state) => state.setupStep)
  const statusMessage = useStore(containerStore, (state) => state.statusMessage)
  const terminalOutput = useStore(
    containerStore,
    (state) => state.terminalOutput,
  )
  const error = useStore(containerStore, (state) => state.error)
  const previewUrl = useStore(containerStore, (state) => state.previewUrl)
  const startDevServer = useStore(
    containerStore,
    (state) => state.startDevServer,
  )
  const setTerminalOutput = useStore(
    containerStore,
    (state) => state.setTerminalOutput,
  )

  // Auto-scroll terminal to bottom when new output arrives
  const terminalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const getStepIcon = (step: SetupStep) => {
    switch (step) {
      case 'mounting':
        return '📁'
      case 'installing':
        return '📦'
      case 'starting':
        return '🚀'
      case 'ready':
        return '✅'
      case 'error':
        return '❌'
    }
  }

  const getStepColor = (step: SetupStep) => {
    switch (step) {
      case 'error':
        return 'text-red-500'
      case 'ready':
        return 'text-green-500'
      default:
        return 'text-blue-500'
    }
  }

  if (!webContainer) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Initializing WebContainer...
          </div>
        </div>
      </div>
    )
  }

  if (setupStep === 'error') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-lg font-medium text-red-600 mb-2">
            Setup Failed
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (setupStep !== 'ready' || !previewUrl) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        {/* Progress Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{getStepIcon(setupStep)}</div>
            <div className={`font-medium ${getStepColor(setupStep)}`}>
              {statusMessage}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex gap-4 text-sm">
            <div
              className={`flex items-center gap-1 ${
                setupStep === 'mounting'
                  ? 'text-blue-500'
                  : setupStep === 'installing' ||
                      setupStep === 'starting' ||
                      setupStep === 'ready'
                    ? 'text-green-500'
                    : 'text-gray-400'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              Mount Files
            </div>
            <div
              className={`flex items-center gap-1 ${
                setupStep === 'installing'
                  ? 'text-blue-500'
                  : setupStep === 'starting' || setupStep === 'ready'
                    ? 'text-green-500'
                    : 'text-gray-400'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              Install Dependencies
            </div>
            <div
              className={`flex items-center gap-1 ${
                setupStep === 'starting'
                  ? 'text-blue-500'
                  : setupStep === 'ready'
                    ? 'text-green-500'
                    : 'text-gray-400'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              Start Server
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg h-full overflow-y-auto">
            {terminalOutput.length > 0 ? (
              terminalOutput.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-gray-500">Waiting for output...</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show the running application with persistent terminal
  return (
    <div className="flex flex-col h-full">
      {/* iframe with the running app - 75% height */}
      <div style={{ height: '75%' }}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Application Preview"
            onLoad={() => console.log('Iframe loaded successfully')}
            onError={(e) => console.error('Iframe load error:', e)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {setupStep === 'ready'
                  ? 'Preview not available'
                  : statusMessage}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal output - 25% height */}
      <div
        className="border-t border-gray-200 dark:border-gray-700 bg-black text-green-400 flex flex-col"
        style={{ height: '25%' }}
      >
        <div className="p-2 border-b border-gray-700 bg-gray-900 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-xs font-medium text-gray-300">
              Terminal Output
            </div>
            {setupStep === 'ready' && previewUrl && (
              <div className="text-xs text-green-500">● Server Running</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {previewUrl && (
              <button
                onClick={() => window.open(previewUrl, '_blank')}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Open in New Tab
              </button>
            )}
            <button
              onClick={startDevServer}
              disabled={!webContainer}
              className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              🔄 Restart
            </button>
            <button
              onClick={() => setTerminalOutput([])}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <div
          ref={terminalRef}
          className="font-mono text-xs p-2 flex-1 overflow-y-auto overflow-x-hidden"
        >
          {terminalOutput.length > 0 ? (
            terminalOutput.map((line, index) => (
              <div
                key={index}
                className="mb-1 leading-tight whitespace-pre-wrap break-words"
              >
                {line}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No output yet...</div>
          )}
        </div>
      </div>
    </div>
  )
}
