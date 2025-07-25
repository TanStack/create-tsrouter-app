import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import {
  registerFramework,
  scanAddOnDirectories,
  scanProjectDirectory,
} from '@tanstack/cta-engine'
import type { ZodTypeAny } from 'zod'

export function createFrameworkDefinition(): any {
  const baseDirectory = dirname(dirname(fileURLToPath(import.meta.url)))

  // Define custom properties for Solid framework
  const customProperties = {
    routes: z
      .array(
        z.object({
          url: z.string().optional(),
          name: z.string().optional(),
          path: z.string(),
          jsName: z.string(),
        }),
      )
      .optional(),
    integrations: z
      .array(
        z.object({
          type: z.enum(['provider', 'root-provider', 'layout', 'header-user']),
          path: z.string(),
          jsName: z.string(),
        }),
      )
      .optional(),
  } as Record<string, ZodTypeAny>

  const addOns = scanAddOnDirectories(
    [
      join(baseDirectory, 'add-ons'),
      join(baseDirectory, 'toolchains'),
      join(baseDirectory, 'examples'),
    ],
    { customProperties },
  )

  const { files, basePackageJSON, optionalPackages } = scanProjectDirectory(
    join(baseDirectory, 'project'),
    join(baseDirectory, 'project/base'),
  )

  const framework = {
    id: 'solid',
    name: 'Solid',
    description: 'Solid templates for Tanstack Router Applications',
    version: '0.1.0',
    customProperties,
    base: files,
    addOns,
    basePackageJSON,
    optionalPackages,
    supportedModes: {
      'code-router': {
        displayName: 'Code Router',
        description: 'TanStack Router using code to define the routes',
        forceTypescript: true,
      },
      'file-router': {
        displayName: 'File Router',
        description: 'TanStack Router using files to define the routes',
        forceTypescript: true,
      },
    },
  }

  return framework
}

export function register() {
  registerFramework(createFrameworkDefinition())
}
