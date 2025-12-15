import { useState, useEffect } from 'react'

import { useApplicationMode, useReady } from '../store/project'
import { checkAIEnabled, getAIChatEndpoint } from '../lib/api'

import SelectedAddOns from './sidebar-items/add-ons'
import RunAddOns from './sidebar-items/run-add-ons'
import RunCreateApp from './sidebar-items/run-create-app'
import ProjectName from './sidebar-items/project-name'
import ModeSelector from './sidebar-items/mode-selector'
import TypescriptSwitch from './sidebar-items/typescript-switch'
import StarterDialog from './sidebar-items/starter'
import SidebarGroup from './sidebar-items/sidebar-group'
import { AIChatDialog, AISparkleButton } from './ai-chat-dialog'
import { AIVoiceDialog, AIVoiceButton } from './ai-voice-dialog'

export interface SidebarProps {
  slots?: {
    actions: React.ReactNode
  }
}

export const DefaultAppSidebarActions = () => (
  <div className="mt-5">
    <RunAddOns />
    <RunCreateApp />
  </div>
)

const defaultSlots: SidebarProps['slots'] = {
  actions: <DefaultAppSidebarActions />,
}

export function AppSidebar(props: SidebarProps) {
  const ready = useReady()
  const mode = useApplicationMode()
  const slots = Object.assign({}, defaultSlots, props.slots)

  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false)

  useEffect(() => {
    checkAIEnabled().then((enabled) => {
      console.log('[AI Sidebar] AI enabled:', enabled)
      setAiEnabled(enabled)
    })
  }, [])

  return (
    <div className="flex flex-col gap-2">
      {ready && (
        <>
          {mode === 'setup' && (
            <SidebarGroup>
              <ProjectName 
                aiButtons={aiEnabled ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <AISparkleButton onClick={() => setAiDialogOpen(true)} />
                    <AIVoiceButton onClick={() => setVoiceDialogOpen(true)} />
                  </div>
                ) : undefined}
              />
              <ModeSelector />
              <TypescriptSwitch />
            </SidebarGroup>
          )}
          {mode === 'add' && aiEnabled && (
            <SidebarGroup>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">AI Assistant</span>
                <div className="flex items-center gap-1">
                  <AISparkleButton onClick={() => setAiDialogOpen(true)} />
                  <AIVoiceButton onClick={() => setVoiceDialogOpen(true)} />
                </div>
              </div>
            </SidebarGroup>
          )}
          <SidebarGroup>
            <SelectedAddOns />
          </SidebarGroup>
          {mode === 'setup' && (
            <SidebarGroup>
              <StarterDialog />
            </SidebarGroup>
          )}
        </>
      )}
      {slots.actions}
      
      {aiEnabled && (
        <>
          <AIChatDialog
            open={aiDialogOpen}
            onOpenChange={setAiDialogOpen}
            apiEndpoint={getAIChatEndpoint()}
          />
          <AIVoiceDialog
            open={voiceDialogOpen}
            onOpenChange={setVoiceDialogOpen}
            apiEndpoint={getAIChatEndpoint()}
          />
        </>
      )}
    </div>
  )
}
