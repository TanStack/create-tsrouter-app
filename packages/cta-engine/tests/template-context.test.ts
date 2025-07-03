import { describe, expect, it } from 'vitest'

import { createMemoryEnvironment } from '../src/environment.js'
import { createTemplateFile } from '../src/template-file.js'

import type { AddOn, Options } from '../src/types.js'

const simpleOptions = {
  projectName: 'test',
  targetDir: '/test',
  framework: {
    id: 'test',
    name: 'Test',
  },
  chosenAddOns: [],
  packageManager: 'pnpm',
  typescript: true,
  tailwind: true,
  mode: 'file-router',
  addOnOptions: {},
} as unknown as Options

describe('Template Context - Add-on Options', () => {
  it('should provide addOnOption context variable', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile('./test.txt.ejs', 'Database: <%= addOnOption.drizzle.database %>')
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('Database: postgres')
  })

  it('should handle multiple add-on options', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'mysql'
        },
        shadcn: {
          theme: 'slate'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      'Drizzle: <%= addOnOption.drizzle.database %>, shadcn: <%= addOnOption.shadcn.theme %>'
    )
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('Drizzle: mysql, shadcn: slate')
  })

  it('should handle multiple options per add-on', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        'complex-addon': {
          database: 'postgres',
          theme: 'dark',
          port: 5432
        }
      }
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      'DB: <%= addOnOption["complex-addon"].database %>, Theme: <%= addOnOption["complex-addon"].theme %>, Port: <%= addOnOption["complex-addon"].port %>'
    )
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('DB: postgres, Theme: dark, Port: 5432')
  })

  it('should handle conditional logic with addOnOption', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      `<% if (addOnOption.drizzle.database === 'postgres') { %>
PostgreSQL configuration
<% } else if (addOnOption.drizzle.database === 'mysql') { %>
MySQL configuration
<% } else { %>
SQLite configuration
<% } %>`
    )
    environment.finishRun()

    expect(output.files['/test/test.txt'].trim()).toEqual('PostgreSQL configuration')
  })

  it('should handle ignoreFile() with option conditions', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './postgres-config.ts.ejs',
      '<% if (addOnOption.drizzle.database !== "postgres") { ignoreFile() } %>\n// PostgreSQL configuration\nexport const config = "postgres"'
    )
    await templateFile(
      './mysql-config.ts.ejs',
      '<% if (addOnOption.drizzle.database !== "mysql") { ignoreFile() } %>\n// MySQL configuration\nexport const config = "mysql"'
    )
    environment.finishRun()

    expect(output.files['/test/postgres-config.ts']).toBeDefined()
    expect(output.files['/test/postgres-config.ts'].trim()).toEqual('// PostgreSQL configuration\nexport const config = \'postgres\'')
    expect(output.files['/test/mysql-config.ts']).toBeUndefined()
  })

  it('should handle empty addOnOptions', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {}
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      'Options: <%= JSON.stringify(addOnOption) %>'
    )
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('Options: {}')
  })

  it('should handle undefined option values', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: undefined
        }
      }
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      'Database: <%= addOnOption.drizzle.database || "not set" %>'
    )
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('Database: not set')
  })

  it('should work alongside existing template variables', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      projectName: 'my-app',
      chosenAddOns: [
        {
          id: 'drizzle',
          name: 'Drizzle ORM',
        } as AddOn
      ],
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      'Project: <%= projectName %>, Add-ons: <%= Object.keys(addOnEnabled).join(", ") %>, Database: <%= addOnOption.drizzle.database %>'
    )
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('Project: my-app, Add-ons: drizzle, Database: postgres')
  })

  it('should handle nested object access safely', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './test.txt.ejs',
      'Exists: <%= addOnOption.drizzle ? "yes" : "no" %>, Non-existent: <%= addOnOption.nonexistent ? "yes" : "no" %>'
    )
    environment.finishRun()

    expect(output.files['/test/test.txt']).toEqual('Exists: yes, Non-existent: no')
  })

  it('should handle option-based conditional imports', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './db-config.ts.ejs',
      `<% if (addOnOption.drizzle.database === 'postgres') { %>
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
<% } else if (addOnOption.drizzle.database === 'mysql') { %>
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
<% } else if (addOnOption.drizzle.database === 'sqlite') { %>
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
<% } %>

export const db = drizzle(/* connection */)`
    )
    environment.finishRun()

    expect(output.files['/test/db-config.ts']).toContain("import { drizzle } from 'drizzle-orm/postgres-js'")
    expect(output.files['/test/db-config.ts']).toContain("import postgres from 'postgres'")
    expect(output.files['/test/db-config.ts']).not.toContain("import mysql from 'mysql2/promise'")
    expect(output.files['/test/db-config.ts']).not.toContain("import Database from 'better-sqlite3'")
  })

  it('should handle filename prefix stripping', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'postgres'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './__postgres__drizzle.config.ts.ejs',
      '<% if (addOnOption.drizzle.database !== "postgres") { ignoreFile() } %>\n// PostgreSQL Drizzle config\nexport default { driver: "postgres" }'
    )
    await templateFile(
      './__mysql__drizzle.config.ts.ejs',
      '<% if (addOnOption.drizzle.database !== "mysql") { ignoreFile() } %>\n// MySQL Drizzle config\nexport default { driver: "mysql" }'
    )
    environment.finishRun()

    // File should be created with prefix stripped
    expect(output.files['/test/drizzle.config.ts']).toBeDefined()
    expect(output.files['/test/drizzle.config.ts'].trim()).toEqual('// PostgreSQL Drizzle config\nexport default { driver: \'postgres\' }')
    
    // Prefixed filename should not exist
    expect(output.files['/test/__postgres__drizzle.config.ts']).toBeUndefined()
    expect(output.files['/test/__mysql__drizzle.config.ts']).toBeUndefined()
  })

  it('should handle nested directory with prefixed files', async () => {
    const { environment, output } = createMemoryEnvironment()
    const templateFile = createTemplateFile(environment, {
      ...simpleOptions,
      addOnOptions: {
        drizzle: {
          database: 'sqlite'
        }
      }
    })
    environment.startRun()
    await templateFile(
      './src/db/__sqlite__index.ts.ejs',
      '<% if (addOnOption.drizzle.database !== "sqlite") { ignoreFile() } %>\n// SQLite database connection\nexport const db = "sqlite"'
    )
    await templateFile(
      './src/db/__postgres__index.ts.ejs',
      '<% if (addOnOption.drizzle.database !== "postgres") { ignoreFile() } %>\n// PostgreSQL database connection\nexport const db = "postgres"'
    )
    environment.finishRun()

    // SQLite file should be created with prefix stripped
    expect(output.files['/test/src/db/index.ts']).toBeDefined()
    expect(output.files['/test/src/db/index.ts'].trim()).toEqual('// SQLite database connection\nexport const db = \'sqlite\'')
    
    // Prefixed filenames should not exist
    expect(output.files['/test/src/db/__sqlite__index.ts']).toBeUndefined()
    expect(output.files['/test/src/db/__postgres__index.ts']).toBeUndefined()
  })
})