import { expect, test, beforeAll } from 'vitest'

import {
  createApp,
  createMemoryEnvironment,
  finalizeAddOns,
  getFrameworkById,
} from '@tanstack/cta-engine'

import type { AddOn, Options } from '@tanstack/cta-engine'

import { register as registerReactCra } from '../src/index.js'

import { cleanupOutput } from './test-utilities.js'

beforeAll(async () => {
  await registerReactCra()
})

async function createReactOptions(
  addOns: Array<string> = [],
  projectName: string = 'TEST',
) {
  const framework = getFrameworkById('react-cra')!

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
  const { environment, output } = createMemoryEnvironment()
  const options = await createReactOptions()
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/cr-js-npm.json',
  )
})

test('code router with form add-on on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = await createReactOptions(['form'])
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/cr-js-form-npm.json',
  )
})

test('code router in typescript on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions()),
    typescript: true,
  }
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/cr-ts-npm.json',
  )
})

test('file router on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions()),
    mode: 'file-router',
    typescript: true,
  } as Options
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/fr-ts-npm.json',
  )
})

test('file router on npm with biome', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions(['biome'])),
    mode: 'file-router',
    typescript: true,
  } as Options
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/fr-ts-biome-npm.json',
  )
})

test('file router with tailwind on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions()),
    mode: 'file-router',
    typescript: true,
    tailwind: true,
  } as Options
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/fr-ts-tw-npm.json',
  )
})

test('file router with add-on start on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions(['start'])),
    tailwind: true,
    typescript: true,
  } as Options
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/cr-ts-start-npm.json',
  )
})

test('file router with add-on start on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions(['start', 'tanstack-query'])),
    tailwind: true,
    typescript: true,
  } as Options
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/cr-ts-start-tanstack-query-npm.json',
  )
})

test('file router with add-on start and apollo-client on npm', async () => {
  const { environment, output } = createMemoryEnvironment()
  const options = {
    ...(await createReactOptions(['start', 'apollo-client'])),
    tailwind: true,
    typescript: true,
  } as Options
  await createApp(environment, options)
  const cleanedOutput = cleanupOutput(options, output)
  await expect(JSON.stringify(cleanedOutput, null, 2)).toMatchFileSnapshot(
    './snapshots/react-cra/cr-ts-start-apollo-client-npm.json',
  )
})
