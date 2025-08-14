import RootComponent from './app'

import { AppSidebar } from './components/cta-sidebar'
import { AppHeader } from './components/header'
import { BackgroundAnimation } from './components/background-animation'
import { Toaster } from './components/toaster'
import FileNavigator from './components/file-navigator'
import StartupDialog from './components/startup-dialog'
import { QueryProvider } from './components/query-provider'
import { CTAProvider } from './components/cta-provider'
import SelectedAddOns from './components/sidebar-items/add-ons'
import RunAddOns from './components/sidebar-items/run-add-ons'
import RunCreateApp from './components/sidebar-items/run-create-app'
import ProjectName from './components/sidebar-items/project-name'
import ModeSelector from './components/sidebar-items/mode-selector'
import TypescriptSwitch from './components/sidebar-items/typescript-switch'
import StarterDialog from './components/sidebar-items/starter'
import SidebarGroup from './components/sidebar-items/sidebar-group'

import { useApplicationMode, useManager, useReady } from './store/project'

export {
  FileNavigator,
  AppSidebar,
  AppHeader,
  BackgroundAnimation,
  Toaster,
  StartupDialog,
  QueryProvider,
  CTAProvider,
  SelectedAddOns,
  RunAddOns,
  RunCreateApp,
  ProjectName,
  ModeSelector,
  TypescriptSwitch,
  StarterDialog,
  SidebarGroup,
  useApplicationMode,
  useManager,
  useReady,
}

export default RootComponent