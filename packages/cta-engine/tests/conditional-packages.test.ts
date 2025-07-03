import { describe, expect, it } from 'vitest'

import { createPackageJSON, mergePackageJSON } from '../src/package-json.js'
import type { Options, Framework } from '../src/types.js'

describe('Conditional Package Dependencies', () => {
  const baseFramework = {
    basePackageJSON: {
      version: '1.0.0',
      type: 'module'
    },
    optionalPackages: {}
  } as unknown as Framework

  const baseOptions = {
    projectName: 'test-app',
    framework: baseFramework,
    mode: 'file-router',
    typescript: true,
    tailwind: false,
    packageManager: 'pnpm',
    chosenAddOns: [],
    addOnOptions: {}
  } as unknown as Options

  describe('EJS Template Processing', () => {
    it('should process packageTemplate with conditional dependencies', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'drizzle',
            name: 'Drizzle ORM',
            packageTemplate: `{
              "dependencies": {
                "drizzle-orm": "^0.29.0"<% if (addOnOption.drizzle.database === 'postgres') { %>,
                "postgres": "^3.4.0"<% } %><% if (addOnOption.drizzle.database === 'mysql') { %>,
                "mysql2": "^3.6.0"<% } %><% if (addOnOption.drizzle.database === 'sqlite') { %>,
                "better-sqlite3": "^8.7.0"<% } %>
              },
              "devDependencies": {<% if (addOnOption.drizzle.database === 'postgres') { %>
                "@types/postgres": "^3.0.0"<% } %><% if (addOnOption.drizzle.database === 'mysql') { %>
                "@types/mysql2": "^3.0.0"<% } %><% if (addOnOption.drizzle.database === 'sqlite') { %>
                "@types/better-sqlite3": "^7.6.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {
          drizzle: {
            database: 'postgres'
          }
        }
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.dependencies).toEqual({
        'drizzle-orm': '^0.29.0',
        'postgres': '^3.4.0'
      })
      expect(packageJSON.devDependencies).toEqual({
        '@types/postgres': '^3.0.0'
      })
      // MySQL and SQLite dependencies should not be included
      expect(packageJSON.dependencies).not.toHaveProperty('mysql2')
      expect(packageJSON.dependencies).not.toHaveProperty('better-sqlite3')
      expect(packageJSON.devDependencies).not.toHaveProperty('@types/mysql2')
      expect(packageJSON.devDependencies).not.toHaveProperty('@types/better-sqlite3')
    })

    it('should handle different database options correctly', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'drizzle',
            name: 'Drizzle ORM',
            packageTemplate: `{
              "dependencies": {
                "drizzle-orm": "^0.29.0"<% if (addOnOption.drizzle.database === 'postgres') { %>,
                "postgres": "^3.4.0"<% } %><% if (addOnOption.drizzle.database === 'mysql') { %>,
                "mysql2": "^3.6.0"<% } %><% if (addOnOption.drizzle.database === 'sqlite') { %>,
                "better-sqlite3": "^8.7.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {
          drizzle: {
            database: 'mysql'
          }
        }
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.dependencies).toEqual({
        'drizzle-orm': '^0.29.0',
        'mysql2': '^3.6.0'
      })
      // PostgreSQL and SQLite dependencies should not be included
      expect(packageJSON.dependencies).not.toHaveProperty('postgres')
      expect(packageJSON.dependencies).not.toHaveProperty('better-sqlite3')
    })

    it('should handle SQLite option correctly', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'drizzle',
            name: 'Drizzle ORM',
            packageTemplate: `{
              "dependencies": {
                "drizzle-orm": "^0.29.0"<% if (addOnOption.drizzle.database === 'postgres') { %>,
                "postgres": "^3.4.0"<% } %><% if (addOnOption.drizzle.database === 'mysql') { %>,
                "mysql2": "^3.6.0"<% } %><% if (addOnOption.drizzle.database === 'sqlite') { %>,
                "better-sqlite3": "^8.7.0"<% } %>
              },
              "devDependencies": {<% if (addOnOption.drizzle.database === 'sqlite') { %>
                "@types/better-sqlite3": "^7.6.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {
          drizzle: {
            database: 'sqlite'
          }
        }
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.dependencies).toEqual({
        'drizzle-orm': '^0.29.0',
        'better-sqlite3': '^8.7.0'
      })
      expect(packageJSON.devDependencies).toEqual({
        '@types/better-sqlite3': '^7.6.0'
      })
    })

    it('should handle multiple add-ons with options', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'drizzle',
            name: 'Drizzle ORM',
            packageTemplate: `{
              "dependencies": {
                "drizzle-orm": "^0.29.0"<% if (addOnOption.drizzle.database === 'postgres') { %>,
                "postgres": "^3.4.0"<% } %>
              }
            }`
          },
          {
            id: 'auth',
            name: 'Authentication',
            packageTemplate: `{
              "dependencies": {<% if (addOnOption.auth.provider === 'auth0') { %>
                "@auth0/nextjs-auth0": "^3.0.0"<% } %><% if (addOnOption.auth.provider === 'supabase') { %>
                "@supabase/supabase-js": "^2.0.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {
          drizzle: {
            database: 'postgres'
          },
          auth: {
            provider: 'auth0'
          }
        }
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.dependencies).toEqual({
        'drizzle-orm': '^0.29.0',
        'postgres': '^3.4.0',
        '@auth0/nextjs-auth0': '^3.0.0'
      })
      expect(packageJSON.dependencies).not.toHaveProperty('@supabase/supabase-js')
    })

    it('should handle complex conditional logic', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'ui',
            name: 'UI Library',
            packageTemplate: `{
              "dependencies": {<% if (addOnOption.ui.library === 'chakra') { %>
                "@chakra-ui/react": "^2.0.0",
                "@emotion/react": "^11.0.0",
                "@emotion/styled": "^11.0.0"<% } else if (addOnOption.ui.library === 'mui') { %>
                "@mui/material": "^5.0.0",
                "@emotion/react": "^11.0.0",
                "@emotion/styled": "^11.0.0"<% } else if (addOnOption.ui.library === 'mantine') { %>
                "@mantine/core": "^7.0.0",
                "@mantine/hooks": "^7.0.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {
          ui: {
            library: 'mantine'
          }
        }
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.dependencies).toEqual({
        '@mantine/core': '^7.0.0',
        '@mantine/hooks': '^7.0.0'
      })
      // Other UI library dependencies should not be included
      expect(packageJSON.dependencies).not.toHaveProperty('@chakra-ui/react')
      expect(packageJSON.dependencies).not.toHaveProperty('@mui/material')
    })

    it('should handle scripts conditionally', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'testing',
            name: 'Testing Setup',
            packageTemplate: `{
              "scripts": {<% if (addOnOption.testing.framework === 'jest') { %>
                "test": "jest",
                "test:watch": "jest --watch"<% } else if (addOnOption.testing.framework === 'vitest') { %>
                "test": "vitest",
                "test:ui": "vitest --ui"<% } %>
              },
              "devDependencies": {<% if (addOnOption.testing.framework === 'jest') { %>
                "jest": "^29.0.0",
                "@types/jest": "^29.0.0"<% } else if (addOnOption.testing.framework === 'vitest') { %>
                "vitest": "^1.0.0",
                "@vitest/ui": "^1.0.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {
          testing: {
            framework: 'vitest'
          }
        }
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.scripts).toEqual({
        'test': 'vitest',
        'test:ui': 'vitest --ui'
      })
      expect(packageJSON.devDependencies).toEqual({
        'vitest': '^1.0.0',
        '@vitest/ui': '^1.0.0'
      })
      // Jest-specific scripts and dependencies should not be included
      expect(packageJSON.scripts).not.toHaveProperty('test:watch')
      expect(packageJSON.devDependencies).not.toHaveProperty('jest')
      expect(packageJSON.devDependencies).not.toHaveProperty('@types/jest')
    })

    it('should fallback to packageAdditions on template error', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'broken',
            name: 'Broken Template',
            packageTemplate: `{
              "dependencies": {
                "valid-package": "^1.0.0"
                <% this will cause a syntax error %>
              }
            }`,
            packageAdditions: {
              dependencies: {
                'fallback-package': '^1.0.0'
              }
            }
          }
        ],
        addOnOptions: {}
      }

      const packageJSON = createPackageJSON(options)

      // Should use fallback packageAdditions
      expect(packageJSON.dependencies).toEqual({
        'fallback-package': '^1.0.0'
      })
      expect(packageJSON.dependencies).not.toHaveProperty('valid-package')
    })

    it('should handle empty or missing addOnOptions', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'simple',
            name: 'Simple Add-on',
            packageTemplate: `{
              "dependencies": {
                "always-included": "^1.0.0"<% if (addOnOption.simple && addOnOption.simple.feature) { %>,
                "conditional-package": "^1.0.0"<% } %>
              }
            }`
          }
        ],
        addOnOptions: {} // No options for this add-on
      }

      const packageJSON = createPackageJSON(options)

      expect(packageJSON.dependencies).toEqual({
        'always-included': '^1.0.0'
      })
      expect(packageJSON.dependencies).not.toHaveProperty('conditional-package')
    })

    it('should preserve dependency sorting after template processing', () => {
      const options = {
        ...baseOptions,
        chosenAddOns: [
          {
            id: 'sorting-test',
            name: 'Sorting Test',
            packageTemplate: `{
              "dependencies": {
                "z-package": "^1.0.0",
                "a-package": "^1.0.0",
                "m-package": "^1.0.0"
              }
            }`
          }
        ],
        addOnOptions: {}
      }

      const packageJSON = createPackageJSON(options)
      const dependencyKeys = Object.keys(packageJSON.dependencies)

      // Dependencies should be sorted alphabetically
      expect(dependencyKeys).toEqual(['a-package', 'm-package', 'z-package'])
    })
  })

  describe('mergePackageJSON', () => {
    it('should merge dependencies correctly', () => {
      const base = {
        dependencies: {
          'react': '^18.0.0',
          'lodash': '^4.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0'
        }
      }

      const overlay = {
        dependencies: {
          'axios': '^1.0.0',
          'lodash': '^4.17.0' // Should override
        },
        devDependencies: {
          'jest': '^29.0.0'
        }
      }

      const result = mergePackageJSON(base, overlay)

      expect(result.dependencies).toEqual({
        'react': '^18.0.0',
        'lodash': '^4.17.0', // Overridden version
        'axios': '^1.0.0'
      })
      expect(result.devDependencies).toEqual({
        'typescript': '^5.0.0',
        'jest': '^29.0.0'
      })
    })

    it('should handle missing sections gracefully', () => {
      const base = {
        dependencies: {
          'react': '^18.0.0'
        }
      }

      const overlay = {
        devDependencies: {
          'jest': '^29.0.0'
        }
      }

      const result = mergePackageJSON(base, overlay)

      expect(result.dependencies).toEqual({
        'react': '^18.0.0'
      })
      expect(result.devDependencies).toEqual({
        'jest': '^29.0.0'
      })
    })
  })
})