import { describe, expect, test } from 'vitest'

import { createApp } from '../src/create-app.js'
import { finalizeAddOns } from '../src/add-ons.js';
import { cleanupOutput, createTestEnvironment } from './test-utilities.js'

describe('React Templates', () => {
  test('code router in javascript on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'react',
        chosenAddOns: [],
        git: true,
        mode: 'code-router',
        packageManager: 'npm',
        projectName,
        tailwind: false,
        toolchain: 'none',
        typescript: false,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/cr-js-npm.json',
    )
  })

  test('code router in typescript on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'react',
        chosenAddOns: [],
        git: true,
        mode: 'code-router',
        packageManager: 'npm',
        projectName,
        tailwind: false,
        toolchain: 'none',
        typescript: true,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/cr-ts-npm.json',
    )
  })

  test('file router on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'react',
        chosenAddOns: [],
        git: true,
        mode: 'file-router',
        packageManager: 'npm',
        projectName,
        tailwind: false,
        toolchain: 'none',
        typescript: true,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/fr-ts-npm.json',
    )
  })

  test('file router with tailwind on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'react',
        chosenAddOns: [],
        git: true,
        mode: 'file-router',
        packageManager: 'npm',
        projectName,
        tailwind: true,
        toolchain: 'none',
        typescript: true,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/fr-ts-tw-npm.json',
    )
  })

	test('file router with add-on start on npm', async () => {
		const projectName = 'TEST';
    const framework = 'react'
    const template = 'file-router'
		const { environment, output } = createTestEnvironment(projectName);
		await createApp(
			{
				addOns: true,
				framework,
				chosenAddOns: await finalizeAddOns(framework, template, ['start']),
				git: true,
				mode: template,
				packageManager: 'npm',
				projectName,
				tailwind: true,
				toolchain: 'none',
				typescript: true,
				variableValues: {},
			},
			{
				silent: true,
				environment,
			},
		);
		cleanupOutput(output);
		await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
			'./snapshots/cra/cr-ts-start-npm.json',
		);
	});
})

describe('Solid Templates', () => {
  test('code router in javascript on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'solid',
        chosenAddOns: [],
        git: true,
        mode: 'code-router',
        packageManager: 'npm',
        projectName,
        tailwind: false,
        toolchain: 'none',
        typescript: false,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/solid-cr-js-npm.json',
    )
  })

  test('code router in typescript on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'solid',
        chosenAddOns: [],
        git: true,
        mode: 'code-router',
        packageManager: 'npm',
        projectName,
        tailwind: false,
        toolchain: 'none',
        typescript: true,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/solid-cr-ts-npm.json',
    )
  })

  test('file router on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'solid',
        chosenAddOns: [],
        git: true,
        mode: 'file-router',
        packageManager: 'npm',
        projectName,
        tailwind: false,
        toolchain: 'none',
        typescript: true,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/solid-fr-ts-npm.json',
    )
  })

  test('file router with tailwind on npm', async () => {
    const projectName = 'TEST'
    const { environment, output } = createTestEnvironment(projectName)
    await createApp(
      {
        addOns: false,
        framework: 'solid',
        chosenAddOns: [],
        git: true,
        mode: 'file-router',
        packageManager: 'npm',
        projectName,
        tailwind: true,
        toolchain: 'none',
        typescript: true,
        variableValues: {},
      },
      {
        silent: true,
        environment,
      },
    )
    cleanupOutput(output)
    await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
      './snapshots/cra/solid-fr-ts-tw-npm.json',
    )
  })

	test('file router with add-on start on npm', async () => {
		const projectName = 'TEST';
		const framework = 'solid';
		const template = 'file-router';
		const { environment, output } = createTestEnvironment(projectName);
		await createApp(
			{
				addOns: true,
				framework,
				chosenAddOns: await finalizeAddOns(framework, template, ['start']),
				git: true,
				mode: template,
				packageManager: 'npm',
				projectName,
				tailwind: true,
				toolchain: 'none',
				typescript: true,
				variableValues: {},
			},
			{
				silent: true,
				environment,
			},
		);
		cleanupOutput(output);
		await expect(JSON.stringify(output, null, 2)).toMatchFileSnapshot(
			'./snapshots/cra/solid-cr-ts-start-npm.json',
		);
	});
})
