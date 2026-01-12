import {
  FileNavigator,
  StartupDialog,
  CTAProvider,
  SelectedAddOns,
  RunAddOns,
  RunCreateApp,
  ProjectName,
  TypescriptSwitch,
  SidebarGroup,
  useApplicationMode,
  useReady,
} from '@tanstack/cta-ui-base'

import { Header } from './custom-header'

function AppSidebar() {
  const ready = useReady()
  const mode = useApplicationMode()

  return (
    <div className="flex flex-col gap-2">
      {ready && (
        <>
          {mode === 'setup' && (
            <SidebarGroup>
              <ProjectName />
              <TypescriptSwitch />
              <SelectedAddOns />
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

export default function App() {
  return (
    <CTAProvider>
      <main className="min-w-[1280px]">
        <div className="min-h-dvh p-2 sm:p-4 space-y-2 sm:space-y-4 @container">
          <Header />
          <div className="flex flex-row">
            <div className="w-1/3 @8xl:w-1/4 pr-2">
              <AppSidebar />
            </div>
            <div className="w-2/3 @8xl:w-3/4 pl-2">
              <FileNavigator />
            </div>
          </div>
        </div>
        <StartupDialog />
      </main>
    </CTAProvider>
  )
}
