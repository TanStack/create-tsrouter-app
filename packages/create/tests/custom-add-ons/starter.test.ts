import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fs, vol } from 'memfs'

import { readOrGenerateStarterInfo } from '../../src/custom-add-ons/starter.js'

vi.mock('node:fs', () => fs)
vi.mock('node:fs/promises', () => fs.promises)

beforeEach(() => {
  vol.reset()
})

describe('readOrGenerateStarterInfo', () => {
  it('should read the starter info', async () => {
    const starterInfo = await readOrGenerateStarterInfo({
      framework: 'test',
      version: 1,
      starter: undefined,
      projectName: 'test',
      mode: 'code-router',
      typescript: true,
      tailwind: true,
      git: true,
      chosenAddOns: [],
    })
    expect(starterInfo.id).toEqual('test-starter')
  })

  it('should read the starter info', async () => {
    fs.mkdirSync(process.cwd(), { recursive: true })
    fs.writeFileSync(
      'starter-info.json',
      JSON.stringify({
        framework: 'test',
        version: 1,
        chosenAddOns: [],
        starter: undefined,
        name: 'test-starter',
        mode: 'code-router',
        typescript: true,
        tailwind: true,
        git: true,
      }),
    )
    const starterInfo = await readOrGenerateStarterInfo({
      framework: 'test',
      version: 1,
      chosenAddOns: [],
      starter: undefined,
      projectName: 'test',
      mode: 'code-router',
      typescript: true,
      tailwind: true,
      git: true,
    })
    expect(starterInfo.name).toEqual('test-starter')
  })
})
