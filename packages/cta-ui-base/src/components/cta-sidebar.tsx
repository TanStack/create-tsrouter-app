import { useApplicationMode, useReady } from '../store/project'

import SelectedAddOns from './sidebar-items/add-ons'
import RunAddOns from './sidebar-items/run-add-ons'
import RunCreateApp from './sidebar-items/run-create-app'
import ProjectName from './sidebar-items/project-name'
import ModeSelector from './sidebar-items/mode-selector'
import TypescriptSwitch from './sidebar-items/typescript-switch'
import StarterDialog from './sidebar-items/starter'
import SidebarGroup from './sidebar-items/sidebar-group'

export function AppSidebar() {
  const ready = useReady()
  const mode = useApplicationMode()

  return (
    <div className="flex flex-col gap-2">
      {ready && (
        <>
          {mode === 'setup' && (
            <SidebarGroup>
              <ProjectName />
              <ModeSelector />
              <TypescriptSwitch />
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
      <div className="mt-5">
        <RunAddOns />
        <RunCreateApp />
      </div>
    </div>
  )
}
