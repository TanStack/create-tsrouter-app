import type { AddOn } from './add-ons.js'
import type { CODE_ROUTER, FILE_ROUTER } from './constants.js'
import type { PackageManager } from './package-manager.js'

export type Framework = 'solid' | 'react'

export interface Options {
  framework: Framework
  projectName: string
  typescript: boolean
  tailwind: boolean
  packageManager: PackageManager
  mode: typeof CODE_ROUTER | typeof FILE_ROUTER
  addOns: boolean
  chosenAddOns: Array<AddOn>
  git: boolean
  variableValues: Record<string, string | number | boolean>
}

export interface CliOptions {
  template?: 'typescript' | 'javascript' | 'file-router'
  framework?: Framework
  tailwind?: boolean
  packageManager?: PackageManager
  projectName?: string
  git?: boolean
  addOns?: Array<string> | boolean
  listAddOns?: boolean
}
