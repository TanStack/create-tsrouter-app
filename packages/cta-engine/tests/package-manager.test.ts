import { describe, expect, it } from 'vitest'

import {
  getPackageManagerExecuteCommand,
  getPackageManagerInstallCommand,
  getPackageManagerScriptCommand,
} from '../src/package-manager.js'
import { formatCommand } from '../src/utils.js'

describe('getPackageManagerScriptCommand', () => {
  it('yarn', () => {
    expect(formatCommand(getPackageManagerScriptCommand('yarn', ['dev']))).toBe(
      'yarn run dev',
    )
  })
  it('pnpm', () => {
    expect(formatCommand(getPackageManagerScriptCommand('pnpm', ['dev']))).toBe(
      'pnpm dev',
    )
  })
  it('bun', () => {
    expect(formatCommand(getPackageManagerScriptCommand('bun', ['dev']))).toBe(
      'bun --bun run dev',
    )
  })
  it('deno', () => {
    expect(formatCommand(getPackageManagerScriptCommand('deno', ['dev']))).toBe(
      'deno task dev',
    )
  })
  it('npm', () => {
    expect(formatCommand(getPackageManagerScriptCommand('npm', ['dev']))).toBe(
      'npm run dev',
    )
  })
})

describe('getPackageManagerExecuteCommand', () => {
  it('yarn', () => {
    expect(
      formatCommand(
        getPackageManagerExecuteCommand('yarn', 'shadcn', ['add', 'button']),
      ),
    ).toBe('yarn dlx shadcn add button')
  })
  it('pnpm', () => {
    expect(
      formatCommand(
        getPackageManagerExecuteCommand('pnpm', 'shadcn', ['add', 'button']),
      ),
    ).toBe('pnpx shadcn add button')
  })
  it('bun', () => {
    expect(
      formatCommand(
        getPackageManagerExecuteCommand('bun', 'shadcn', ['add', 'button']),
      ),
    ).toBe('bunx --bun shadcn add button')
  })
  it('deno', () => {
    expect(
      formatCommand(
        getPackageManagerExecuteCommand('deno', 'shadcn', ['add', 'button']),
      ),
    ).toBe('deno run npm:shadcn add button')
  })
  it('npm', () => {
    expect(
      formatCommand(
        getPackageManagerExecuteCommand('npm', 'shadcn', ['add', 'button']),
      ),
    ).toBe('npx shadcn add button')
  })
})

describe('getPackageManagerInstallCommand', () => {
  it('yarn install', () => {
    expect(formatCommand(getPackageManagerInstallCommand('yarn'))).toBe(
      'yarn install',
    )
  })
  it('pnpm install', () => {
    expect(formatCommand(getPackageManagerInstallCommand('pnpm'))).toBe(
      'pnpm install',
    )
  })
  it('bun install', () => {
    expect(formatCommand(getPackageManagerInstallCommand('bun'))).toBe(
      'bun install',
    )
  })
  it('deno install', () => {
    expect(formatCommand(getPackageManagerInstallCommand('deno'))).toBe(
      'deno install',
    )
  })
  it('npm install', () => {
    expect(formatCommand(getPackageManagerInstallCommand('npm'))).toBe(
      'npm install',
    )
  })

  it('yarn install radix-ui', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('yarn', 'radix-ui')),
    ).toBe('yarn add radix-ui')
  })
  it('pnpm install radix-ui', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('pnpm', 'radix-ui')),
    ).toBe('pnpm add radix-ui')
  })
  it('bun install radix-ui', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('bun', 'radix-ui')),
    ).toBe('bun install radix-ui')
  })
  it('deno install radix-ui', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('deno', 'radix-ui')),
    ).toBe('deno install radix-ui')
  })
  it('npm install radix-ui', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('npm', 'radix-ui')),
    ).toBe('npm install radix-ui')
  })

  it('yarn install vitest in dev mode', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('yarn', 'vitest', true)),
    ).toBe('yarn add vitest --dev')
  })
  it('pnpm install vitest in dev mode', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('pnpm', 'vitest', true)),
    ).toBe('pnpm add vitest --dev')
  })
  it('bun install vitest in dev mode', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('bun', 'vitest', true)),
    ).toBe('bun install vitest -D')
  })
  it('deno install vitest in dev mode', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('deno', 'vitest', true)),
    ).toBe('deno install vitest -D')
  })
  it('npm install vitest in dev mode', () => {
    expect(
      formatCommand(getPackageManagerInstallCommand('npm', 'vitest', true)),
    ).toBe('npm install vitest -D')
  })
})
