import { AppSidebar } from './components/cta-sidebar'
import { AppHeader } from './components/header'
import { BackgroundAnimation } from './components/background-animation'
import FileNavigator from './components/file-navigator'
import StartupDialog from './components/startup-dialog'
import { CTAProvider } from './components/cta-provider'

export default function RootComponent() {
  return (
    <CTAProvider>
      <main className="min-w-[1280px]">
        <BackgroundAnimation />
        <div className="min-h-dvh p-2 sm:p-4 space-y-2 sm:space-y-4 @container">
          <AppHeader />
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
