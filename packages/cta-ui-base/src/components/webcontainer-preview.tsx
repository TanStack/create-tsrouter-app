import { useContext, useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

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

  // Show progress dialog during setup (similar to "Creating Your Application")
  if (
    !webContainer ||
    setupStep === 'error' ||
    setupStep !== 'ready' ||
    !previewUrl
  ) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 border-2 border-blue-500">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {setupStep === 'error' ? 'Setup Failed' : 'Preparing Preview'}
          </h2>

          {setupStep === 'error' ? (
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-lg font-medium text-red-600 mb-2">
                An error occurred
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </div>
              <button
                onClick={startDevServer}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                🔄 Retry
              </button>
            </div>
          ) : (
            <>
              {/* Progress Steps */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getStepIcon('mounting')}</div>
                  <div
                    className={`flex-1 ${getStepColor(setupStep === 'mounting' ? 'mounting' : setupStep === 'installing' || setupStep === 'starting' || setupStep === 'ready' ? 'ready' : 'mounting')}`}
                  >
                    Mount Files
                  </div>
                  {(setupStep === 'installing' ||
                    setupStep === 'starting' ||
                    setupStep === 'ready') &&
                    '✓'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getStepIcon('installing')}</div>
                  <div
                    className={`flex-1 ${getStepColor(setupStep === 'installing' ? 'installing' : setupStep === 'starting' || setupStep === 'ready' ? 'ready' : 'mounting')}`}
                  >
                    Install Dependencies
                  </div>
                  {(setupStep === 'starting' || setupStep === 'ready') && '✓'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getStepIcon('starting')}</div>
                  <div
                    className={`flex-1 ${getStepColor(setupStep === 'starting' ? 'starting' : setupStep === 'ready' ? 'ready' : 'mounting')}`}
                  >
                    Start Server
                  </div>
                  {setupStep === 'ready' && '✓'}
                </div>
              </div>

              {/* Current status */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {statusMessage || 'Preparing your application...'}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Show the running application with collapsible terminal
  return (
    <div className="flex flex-col h-full">
      {/* iframe with the running app */}
      <div className="flex-1">
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
                Preview not available
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Terminal output */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-black text-green-400 flex flex-col flex-shrink-0">
        <div
          className="p-2 border-b border-gray-700 bg-gray-900 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
        >
          <div className="flex items-center gap-2 flex-1">
            <button className="text-gray-400 hover:text-gray-200">
              {isTerminalOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <div className="text-xs font-medium text-gray-300">
              Terminal Output
            </div>
            {setupStep === 'ready' && previewUrl && (
              <div className="text-xs text-green-500">● Server Running</div>
            )}
          </div>
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
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
        {isTerminalOpen && (
          <div
            ref={terminalRef}
            className="font-mono text-xs p-2 overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: '200px' }}
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
        )}
      </div>
    </div>
  )
}
