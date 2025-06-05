import { describe, expect, it } from 'vitest'

import { createPackageJSON } from '../src/package-json.js'

import type { Options, Framework } from '../src/types.js'

describe('createPackageJSON', () => {
  it('should create a package.json', () => {
    const packageJSON = createPackageJSON({
      chosenAddOns: [
        {
          packageAdditions: {
            scripts: {
              dev: 'file-router dev',
            },
          },
        },
      ],
      mode: 'file-router',
      typescript: true,
      tailwind: true,
      projectName: 'test',
      framework: {
        basePackageJSON: {},
        optionalPackages: {
          typescript: {
            devDependencies: {
              typescript: '^5.0.0',
            },
          },
          tailwindcss: {
            dependencies: {
              tailwindcss: '^3.0.0',
            },
          },
          'file-router': {
            dependencies: {
              'file-router': '^1.0.0',
            },
          },
        },
      } as unknown as Framework,
    } as unknown as Options)

    const expected = {
      name: 'test',
      dependencies: {
        'file-router': '^1.0.0',
        tailwindcss: '^3.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
      scripts: {
        dev: 'file-router dev',
      },
    }

    // Use JSON.stringify to test sorting order of dependencies
    expect(JSON.stringify(packageJSON)).toEqual(JSON.stringify(expected))
  })
})
