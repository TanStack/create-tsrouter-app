import type { SerializedOptions } from '@tanstack/cta-engine'

export type ServerEnvironment = {
  projectPath: string
  mode: 'add' | 'setup'
  options?: SerializedOptions
  addOns?: Array<string>
  forcedRouterMode?: string
  forcedAddOns?: Array<string>
  registry?: string
  showDeploymentOptions?: boolean
}

const serverEnvironment: ServerEnvironment = {
  projectPath: '',
  mode: 'add',
  options: {} as SerializedOptions,
  addOns: [],
  forcedRouterMode: undefined,
  forcedAddOns: undefined,
  registry: undefined,
  showDeploymentOptions: false,
}

export function setServerEnvironment(options: Partial<ServerEnvironment>) {
  Object.assign(serverEnvironment, options)
}

export const getShowDeploymentOptions = () => serverEnvironment.showDeploymentOptions

export const getProjectPath = () => serverEnvironment.projectPath

export const getApplicationMode = () => serverEnvironment.mode

export const getProjectOptions = () => serverEnvironment.options!

export const getForcedRouterMode = () => serverEnvironment.forcedRouterMode

export const getForcedAddOns = () => serverEnvironment.forcedAddOns || []

export const getRegistry = () => serverEnvironment.registry
