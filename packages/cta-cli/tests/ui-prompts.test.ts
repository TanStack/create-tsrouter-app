import { describe, it, expect, vi } from 'vitest'

import * as clack from '@clack/prompts'

import {
  getProjectName,
  selectAddOns,
  selectGit,
  selectPackageManager,
  selectRouterType,
  selectTailwind,
  selectToolchain,
} from '../src/ui-prompts'

import type { AddOn, Framework } from '@tanstack/cta-engine'

vi.mock('@clack/prompts')

vi.spyOn(process, 'exit').mockImplementation((number) => {
  throw new Error(`process.exit: ${number}`)
})

describe('getProjectName', () => {
  it('should return the project name', async () => {
    vi.spyOn(clack, 'text').mockImplementation(async () => 'my-app')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const projectName = await getProjectName()
    expect(projectName).toBe('my-app')
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'text').mockImplementation(async () => 'Cancelled')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(getProjectName()).rejects.toThrowError(/exit/)
  })
})

describe('selectRouterType', () => {
  it('should select the file router', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () => 'file-router')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const routerType = await selectRouterType()
    expect(routerType).toBe('file-router')
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () => 'Cancelled')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(() => selectRouterType()).rejects.toThrowError(/exit/)
  })
})

describe('selectTailwind', () => {
  it('should select tailwind', async () => {
    vi.spyOn(clack, 'confirm').mockImplementation(async () => true)
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const tailwind = await selectTailwind()
    expect(tailwind).toBe(true)
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'confirm').mockImplementation(async () =>
      Symbol.for('cancel'),
    )
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(selectTailwind()).rejects.toThrowError(/exit/)
  })
})

describe('selectPackageManager', () => {
  it('should select pnpm', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () => 'pnpm')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const packageManager = await selectPackageManager()
    expect(packageManager).toBe('pnpm')
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () =>
      Symbol.for('cancel'),
    )
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(selectPackageManager()).rejects.toThrowError(/exit/)
  })
})

describe('selectAddOns', () => {
  it('should select some add-ons', async () => {
    vi.spyOn(clack, 'multiselect').mockImplementation(async () => ['add-on-1'])
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const packageManager = await selectAddOns(
      {
        getAddOns: () =>
          [
            {
              id: 'add-on-1',
              name: 'Add-on 1',
              description: 'Add-on 1 description',
              type: 'add-on',
              modes: ['file-router'],
            },
          ] as Array<AddOn>,
      } as Framework,
      'file-router',
      'add-on',
      'Select add-ons',
    )
    expect(packageManager).toEqual(['add-on-1'])
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () =>
      Symbol.for('cancel'),
    )
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(
      selectAddOns(
        {
          getAddOns: () =>
            [
              {
                id: 'add-on-1',
                name: 'Add-on 1',
                description: 'Add-on 1 description',
                type: 'add-on',
                modes: ['file-router'],
              },
            ] as Array<AddOn>,
        } as Framework,
        'file-router',
        'add-on',
        'Select add-ons',
      ),
    ).rejects.toThrowError(/exit/)
  })
})

describe('selectGit', () => {
  it('should select git', async () => {
    vi.spyOn(clack, 'confirm').mockImplementation(async () => true)
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const git = await selectGit()
    expect(git).toBe(true)
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'confirm').mockImplementation(async () =>
      Symbol.for('cancel'),
    )
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(selectGit()).rejects.toThrowError(/exit/)
  })
})

describe('selectToolchain', () => {
  it('should select a toolchain', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () => 'biome')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const packageManager = await selectToolchain({
      getAddOns: () =>
        [
          {
            id: 'biome',
            name: 'Biome',
            description: 'Biome description',
            type: 'toolchain',
            modes: ['file-router'],
          },
        ] as Array<AddOn>,
    } as Framework)
    expect(packageManager).toEqual('biome')
  })
  it('should select a toolchain', async () => {
    const selectSpy = vi
      .spyOn(clack, 'select')
      .mockImplementation(async () => 'biome')
    vi.spyOn(clack, 'isCancel').mockImplementation(() => false)

    const packageManager = await selectToolchain(
      {
        getAddOns: () =>
          [
            {
              id: 'biome',
              name: 'Biome',
              description: 'Biome description',
              type: 'toolchain',
              modes: ['file-router'],
            },
          ] as Array<AddOn>,
      } as Framework,
      'biome',
    )
    expect(packageManager).toEqual('biome')
    expect(selectSpy).not.toHaveBeenCalled()
  })

  it('should exit on cancel', async () => {
    vi.spyOn(clack, 'select').mockImplementation(async () =>
      Symbol.for('cancel'),
    )
    vi.spyOn(clack, 'isCancel').mockImplementation(() => true)

    await expect(
      selectToolchain({
        getAddOns: () =>
          [
            {
              id: 'biome',
              name: 'Biome',
              description: 'Biome description',
              type: 'toolchain',
              modes: ['file-router'],
            },
          ] as Array<AddOn>,
      } as Framework),
    ).rejects.toThrowError(/exit/)
  })
})
