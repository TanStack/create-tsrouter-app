import { expect, test, beforeAll } from 'vitest'

import {
  createApp,
  createMemoryEnvironment,
  finalizeAddOns,
  getFrameworkById,
} from '@tanstack/cta-engine'

import type { AddOn, Options } from '@tanstack/cta-engine'

import { cleanupOutput } from './test-utilities.js'

import { register as registerSolid } from '../src/index.js'

beforeAll(async () => {
  registerSolid()
})

async function createSolidOptions(
  projectName: string,
  addOns?: Array<string>,
): Promise<Options> {
  const framework = getFrameworkById('solid')!

  let chosenAddOns: Array<AddOn> = []
  let mode = 'code-router'
  if (addOns) {
    mode = 'file-router'
    chosenAddOns = await finalizeAddOns(framework, mode, addOns)
  }

  return {
    framework,
    addOns: !!chosenAddOns.length,
    chosenAddOns,
    git: true,
    mode,
    packageManager: 'npm',
    projectName,
    targetDir: `/foo/bar/baz/${projectName}`,
    tailwind: false,
    typescript: false,
    variableValues: {},
  } as Options
}

test('code router in javascript on npm', async () => {
  const projectName = 'TEST'
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createSolidOptions(projectName)),
  }
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/solid/solid-cr-js-npm.json',
  )
})

test('code router in typescript on npm', async () => {
  const projectName = 'TEST'
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createSolidOptions(projectName)),
    typescript: true,
  }
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/solid/solid-cr-ts-npm.json',
  )
})

test('file router on npm', async () => {
  const projectName = 'TEST'
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createSolidOptions(projectName)),
    mode: 'file-router',
    typescript: true,
  }
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/solid/solid-fr-ts-npm.json',
  )
})

test('file router with tailwind on npm', async () => {
  const projectName = 'TEST'
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createSolidOptions(projectName)),
    mode: 'file-router',
    typescript: true,
    tailwind: true,
  }
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/solid/solid-fr-ts-tw-npm.json',
  )
})

test('file router with add-on start on npm', async () => {
  const projectName = 'TEST'
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createSolidOptions(projectName, ['start'])),
    tailwind: true,
    typescript: true,
  }
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/solid/solid-cr-ts-start-npm.json',
  )
})
