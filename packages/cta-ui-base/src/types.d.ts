import type {
  StatusStepType,
  AddOnOption,
  AddOnOptions,
} from '@tanstack/cta-engine'

export type ApplicationMode = 'add' | 'setup' | 'none'

export type StarterInfo = {
  url: string
  id: string
  name: string
  description: string
  version: string
  author: string
  license: string
  mode: string
  typescript: boolean
  tailwind: boolean
  banner?: string
  dependsOn?: Array<string>
}

// Files

export type DryRunOutput = {
  files: Record<string, string>
  commands: Array<{
    command: string
    args: Array<string>
  }>
  deletedFiles: Array<string>
}

export type AddOnInfo = {
  id: string
  name: string
  description: string
  type: 'add-on' | 'example' | 'starter' | 'toolchain' | 'deployment'
  modes: Array<string>
  smallLogo?: string
  priority?: number
  logo?: string
  link: string
  dependsOn?: Array<string>
  options?: AddOnOptions
}

export type FileClass =
  | 'unchanged'
  | 'added'
  | 'modified'
  | 'deleted'
  | 'overwritten'

export type FileTreeItem = TreeDataItem & {
  contents: string
  fullPath: string
  fileClass: FileClass | undefined
  originalFile?: string
  modifiedFile?: string
}

export type Registry = {
  starters: Array<{
    name: string
    description: string
    url: string
    banner?: string
  }>
  'add-ons': Array<{
    name: string
    description: string
    url: string
  }>
}

export type InitialData = {
  supportedModes: Record<
    string,
    {
      displayName: string
      description: string
      forceTypescript: boolean
    }
  >
  options: SerializedOptions
  output: GeneratorOutput
  localFiles: Record<string, string>
  addOns: Record<string, Array<AddOnInfo>>
  applicationMode: ApplicationMode
  showDeploymentOptions?: boolean
  forcedRouterMode?: string
  forcedAddOns?: Array<string>
  registry?: Registry | undefined
}

export type EventItem = {
  msgType: 'start'
  id: string
  type: StatusStepType
  message: string
}
export type EventFinish = {
  msgType: 'finish'
  id: string
  message: string
}

export type StreamEvent = EventItem | EventFinish

export type StreamItem = {
  id: string
  icon: typeof FileIcon
  message: string
}
