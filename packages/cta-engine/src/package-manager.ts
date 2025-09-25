import type { Environment } from './types.js'

export const SUPPORTED_PACKAGE_MANAGERS = [
  'npm',
  'yarn',
  'pnpm',
  'bun',
  'deno',
] as const
export type PackageManager = (typeof SUPPORTED_PACKAGE_MANAGERS)[number]
export const DEFAULT_PACKAGE_MANAGER: PackageManager = 'npm'

export function getPackageManager(): PackageManager | undefined {
  const userAgent = process.env.npm_config_user_agent

  if (userAgent === undefined) {
    return DEFAULT_PACKAGE_MANAGER
  }

  const packageManager = SUPPORTED_PACKAGE_MANAGERS.find((manager) =>
    userAgent.startsWith(manager),
  )

  return packageManager
}

export function getPackageManagerScriptCommand(
  packagerManager: PackageManager,
  args: Array<string> = [],
) {
  switch (packagerManager) {
    case 'yarn':
      return { command: 'yarn', args: ['run', ...args] }
    case 'pnpm':
      return { command: 'pnpm', args: [...args] }
    case 'bun':
      return { command: 'bun', args: ['--bun', 'run', ...args] }
    case 'deno':
      return { command: 'deno', args: ['task', ...args] }
    default:
      return { command: 'npm', args: ['run', ...args] }
  }
}

export function getPackageManagerExecuteCommand(
  packagerManager: PackageManager,
  pkg: string,
  args: Array<string> = [],
) {
  switch (packagerManager) {
    case 'yarn':
      return { command: 'yarn', args: ['dlx', pkg, ...args] }
    case 'pnpm':
      return { command: 'pnpx', args: [pkg, ...args] }
    case 'bun':
      return { command: 'bunx', args: ['--bun', pkg, ...args] }
    case 'deno':
      return { command: 'deno', args: ['run', `npm:${pkg}`, ...args] }
    default:
      return { command: 'npx', args: [pkg, ...args] }
  }
}

export function getPackageManagerInstallCommand(
  packagerManager: PackageManager,
  pkg?: string,
  isDev: boolean = false,
) {
  if (pkg) {
    switch (packagerManager) {
      case 'yarn':
      case 'pnpm':
        return {
          command: packagerManager,
          args: ['add', pkg, isDev ? '--dev' : ''],
        }
      default:
        return {
          command: packagerManager,
          args: ['install', pkg, isDev ? '-D' : ''],
        }
    }
  } else {
    return {
      command: packagerManager,
      args: ['install'],
    }
  }
}

export function packageManagerInstall(
  environment: Environment,
  cwd: string,
  packagerManager: PackageManager,
  pkg?: string,
) {
  const { command, args: commandArgs } = getPackageManagerInstallCommand(
    packagerManager,
    pkg,
  )
  return environment.execute(command, commandArgs, cwd)
}

export function packageManagerExecute(
  environment: Environment,
  cwd: string,
  packagerManager: PackageManager,
  pkg: string,
  args: Array<string>,
) {
  const { command, args: commandArgs } = getPackageManagerExecuteCommand(
    packagerManager,
    pkg,
    args,
  )
  return environment.execute(command, commandArgs, cwd)
}
