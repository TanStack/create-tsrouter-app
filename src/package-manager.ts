import type { Environment } from './environment'

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

export function packageManagerExecute(
  environment: Environment,
  packagerManager: PackageManager,
  pkg: string,
  args: Array<string>,
  cwd: string,
) {
  switch (packagerManager) {
    case 'yarn':
      return environment.execute('yarn', ['dlx', pkg, ...args], cwd)
    case 'pnpm':
      return environment.execute('pnpx', [pkg, ...args], cwd)
    case 'bun':
      return environment.execute('bunx', ['--bun', pkg, ...args], cwd)
    case 'deno':
      return environment.execute('deno', ['run', `npm:${pkg}`, ...args], cwd)
    default:
      return environment.execute('npx', [pkg, ...args], cwd)
  }
}
