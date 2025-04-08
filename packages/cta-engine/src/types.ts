import type { CODE_ROUTER, FILE_ROUTER } from './constants.js'
import type { PackageManager } from './package-manager.js'
import type { ToolChain } from './toolchain.js'

export type Framework = 'solid' | 'react'

export type TemplateOptions = 'typescript' | 'javascript' | 'file-router'

export type Mode = typeof CODE_ROUTER | typeof FILE_ROUTER

export interface Options {
  framework: Framework
  projectName: string
  typescript: boolean
  tailwind: boolean
  packageManager: PackageManager
  toolchain: ToolChain
  mode: Mode
  addOns: boolean
  chosenAddOns: Array<AddOn>
  git: boolean
  variableValues: Record<string, string | number | boolean>
  overlay?: AddOn | undefined
}

export interface CliOptions {
  template?: TemplateOptions
  framework?: Framework
  tailwind?: boolean
  packageManager?: PackageManager
  toolchain?: ToolChain
  projectName?: string
  git?: boolean
  addOns?: Array<string> | boolean
  listAddOns?: boolean
  mcp?: boolean
  mcpSse?: boolean
  overlay?: string
  targetDir?: string
}

export type Environment = {
  startRun: () => void
  finishRun: () => void
  getErrors: () => Array<string>

  appendFile: (path: string, contents: string) => Promise<void>
  copyFile: (from: string, to: string) => Promise<void>
  writeFile: (path: string, contents: string) => Promise<void>
  execute: (command: string, args: Array<string>, cwd: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>

  readFile: (path: string, encoding?: BufferEncoding) => Promise<string>
  exists: (path: string) => boolean
  readdir: (path: string) => Array<string>
  isDirectory: (path: string) => boolean
}

type BooleanVariable = {
  name: string
  default: boolean
  description: string
  type: 'boolean'
}

type NumberVariable = {
  name: string
  default: number
  description: string
  type: 'number'
}

type StringVariable = {
  name: string
  default: string
  description: string
  type: 'string'
}

export type Variable = BooleanVariable | NumberVariable | StringVariable

export type AddOn = {
  id: string
  name: string
  description: string
  type: 'add-on' | 'example' | 'overlay'
  link: string
  templates: Array<string>
  routes: Array<{
    url: string
    name: string
  }>
  packageAdditions: {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    scripts?: Record<string, string>
  } & {
    [key: string]: Record<string, string>
  }
  command?: {
    command: string
    args?: Array<string>
  }
  readme?: string
  phase: 'setup' | 'add-on'
  shadcnComponents?: Array<string>
  warning?: string
  dependsOn?: Array<string>
  variables?: Array<Variable>

  files?: Record<string, string>
  deletedFiles?: Array<string>
}

export type Overlay = AddOn & {
  type: 'overlay'
  version: string
  author: string
  link: string
  license: string
  mode: Mode
  framework: Framework
  typescript: boolean
  tailwind: boolean
}
