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
  type: 'add-on' | 'example' | 'starter' | 'toolchain'
  modes: Array<'code-router' | 'file-router'>
  smallLogo?: string
  logo?: string
  link: string
  dependsOn?: Array<string>
  options?: Record<string, any>
}
