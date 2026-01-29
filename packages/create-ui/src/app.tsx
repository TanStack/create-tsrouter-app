import { AppSidebar } from './components/create-sidebar'
import { AppHeader } from './components/header'
import { BackgroundAnimation } from './components/background-animation'
import FileNavigator from './components/file-navigator'
import StartupDialog from './components/startup-dialog'
import { CreateProvider } from './components/create-provider'

export interface RootComponentProps {
  slots?: Partial<{
    header: React.ReactNode
    sidebar: React.ReactNode
    fileNavigator: React.ReactNode
    startupDialog: React.ReactNode
  }>
}

export const defaultSlots: RootComponentProps['slots'] = {
  header: <AppHeader />,
  sidebar: <AppSidebar />,
  fileNavigator: <FileNavigator />,
  startupDialog: <StartupDialog />,
}

export default function RootComponent(props: RootComponentProps) {
  const slots = Object.assign({}, defaultSlots, props.slots)

  return (
    <CreateProvider>
      <main className="min-w-[1280px]">
        <BackgroundAnimation />
        <div className="min-h-dvh p-2 sm:p-4 space-y-2 sm:space-y-4 @container">
          {slots.header}
          <div className="flex flex-row">
            <div className="w-1/3 @8xl:w-1/4 pr-2">
              {slots.sidebar}
            </div>
            <div className="w-2/3 @8xl:w-3/4 pl-2">
              {slots.fileNavigator}
            </div>
          </div>
        </div>
        {slots.startupDialog}
      </main>
    </CreateProvider>
  )
}
