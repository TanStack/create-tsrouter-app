import type { PackageManager } from '@tanstack/cta-engine'

export type TemplateOptions = 'typescript' | 'javascript' | 'file-router'

export interface CliOptions {
  template?: TemplateOptions
  framework?: string
  tailwind?: boolean
  packageManager?: PackageManager
  toolchain?: string
  deployment?: string
  projectName?: string
  git?: boolean
  addOns?: Array<string> | boolean
  listAddOns?: boolean
  addonDetails?: string
  mcp?: boolean
  mcpSse?: boolean
  starter?: string
  targetDir?: string
  interactive?: boolean
  ui?: boolean
  devWatch?: string
  install?: boolean
  addOnConfig?: string
  force?: boolean
}
