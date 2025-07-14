# Add-on Authoring for the CTA Framework for Solid

# Available Integrations

These are the available integration points for the Solid Framework.

## header-user

Integrates into the `Header` component shared by all routes. These components are placed in the right hand side of the header bar.

The code is always integrated into the `src/components/Header.(tsx|jsx)` file.

### Examples

Code in `assets/src/components/my-header.tsx`:

```ts
export default function MyHeader() {
  return <div>Header User</div>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "header-user",
    "jsName": "MyHeader",
    "path": "src/components/my-header.tsx"
  },
]
```

## layout

Handles injecting a component into the layout of the page:

The code is integrated into these locations with these application architectures:

- `code-router` - In the `src/main.tsx` (or `src/main.jsx`) file
- `file-router` - In the `src/__root.tsx` file
- `file-router` with `start` - In the `src/main.tsx` file

### Examples

Code in `assets/src/components/my-layout.tsx`:

```ts
export default function MyLayout() {
  return <div>Hi from MyLayout!</div>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "layout",
    "jsName": "MyLayout",
    "path": "src/components/my-layout.tsx"
  },
]
```

## provider

Handles placing UI style provider wrappers into the right spot in three different applicatin setups:

The code is integrated into these locations with these application architectures:

- `code-router` - In the `src/main.tsx` (or `src/main.jsx`) file
- `file-router` - In the `src/__root.tsx` file
- `file-router` with `start` - In the `src/main.tsx` file

### Examples

Code in `assets/src/components/my-provider.tsx`:

```ts
export default function MyProvider({ children }: { children: JSX.Element }) {
  return <SomeKindOfProvider>{children}</SomeKindOfProvider>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "provider",
    "jsName": "MyProvider",
    "path": "src/components/my-provider.tsx"
  },
]
```

# Routes

If your add-on creates routes you need to specify those in the `info.json` file.

This example will define a route at `/demo/my-demo-route` that will be rendered by the `DemoMyDemoRoute` component. There will be a `Demo Route` link in the header to this route.

```json
"routes": [
  {
    "url": "/demo/my-demo-route",
    "name": "Demo Route",
    "path": "src/routes/demo.my-demo-route.tsx",
    "jsName": "DemoMyDemoRoute"
  }
],
```

If you don't want a header link you can omit the `url` and `name` properties.

```json
"routes": [
  {
    "path": "src/routes/demo.my-hidden-demo-route.tsx",
    "jsName": "DemoMyHiddenDemoRoute"
  }
],
```

You **MUST** specify routes in the `info.json` file if your add-on supports the `code-router` mode. This is because the `code-routers` setup needs to import the routes in order to add them to the router.

By convension you should prefix demo routes with `demo` to make it clear that they are demo routes so they can be easily identified and removed.

# Add-on Options

The CTA framework supports configurable add-ons through an options system that allows users to customize add-on behavior during creation. This enables more flexible and reusable add-ons that can adapt to different use cases.

## Overview

Add-on options allow developers to create configurable add-ons where users can select from predefined choices that affect:
- Which files are included in the generated project
- Template variable values used during file generation
- Package dependencies that get installed
- Configuration file contents

## Configuration Format

Options are defined in the `info.json` file using the following schema:

```json
{
  "name": "My Add-on",
  "description": "A configurable add-on",
  "options": {
    "optionName": {
      "type": "select",
      "label": "Display Label",
      "description": "Optional description shown to users",
      "default": "defaultValue",
      "options": [
        { "value": "option1", "label": "Option 1" },
        { "value": "option2", "label": "Option 2" }
      ]
    }
  }
}
```

### Option Types

#### Select Options

The `select` type allows users to choose from a predefined list of options:

```json
"database": {
  "type": "select",
  "label": "Database Provider",
  "description": "Choose your database provider",
  "default": "postgres",
  "options": [
    { "value": "postgres", "label": "PostgreSQL" },
    { "value": "mysql", "label": "MySQL" },
    { "value": "sqlite", "label": "SQLite" }
  ]
}
```

**Properties:**
- `type`: Must be `"select"`
- `label`: Display text shown to users
- `description`: Optional help text
- `default`: Default value that must match one of the option values
- `options`: Array of value/label pairs

## Template Usage

Option values are available in EJS templates through the `addOnOption` variable:

```ejs
<!-- Access option value -->
<% if (addOnOption.myAddOnId.database === 'postgres') { %>
  PostgreSQL specific code
<% } %>

<!-- Use option value in output -->
const driver = '<%= addOnOption.myAddOnId.database %>'
```

The structure is: `addOnOption.{addOnId}.{optionName}`

## Conditional Files

Use filename prefixes to include files only when specific option values are selected:

```
assets/
├── __postgres__drizzle.config.ts.ejs
├── __mysql__drizzle.config.ts.ejs
├── __sqlite__drizzle.config.ts.ejs
└── src/
    └── db/
        ├── __postgres__index.ts.ejs
        ├── __mysql__index.ts.ejs
        └── __sqlite__index.ts.ejs
```

**Naming Convention:**
- `__optionValue__filename.ext.ejs` - Include only if option matches value
- The prefix is stripped from the final filename
- Use `ignoreFile()` in templates for additional conditional logic

### Template Conditional Logic

Within template files, use `ignoreFile()` to skip file generation:

```ejs
<% if (addOnOption.drizzle.database !== 'postgres') { ignoreFile() } %>
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)
```

## Complete Example: Database Add-on

Here's how you could implement a configurable database add-on for Solid:

### Examples

Configuration in `info.json`:
```json
{
  "name": "Database Integration",
  "description": "Add database support with configurable providers to your Solid application.",
  "modes": ["file-router"],
  "options": {
    "database": {
      "type": "select",
      "label": "Database Provider",
      "description": "Choose your database provider",
      "default": "postgres",
      "options": [
        { "value": "postgres", "label": "PostgreSQL" },
        { "value": "mysql", "label": "MySQL" },
        { "value": "sqlite", "label": "SQLite" }
      ]
    }
  }
}
```

File structure:
```
database/
├── assets/
│   ├── __postgres__db.config.ts.ejs
│   ├── __mysql__db.config.ts.ejs
│   ├── __sqlite__db.config.ts.ejs
│   └── src/
│       ├── db/
│       │   ├── __postgres__connection.ts.ejs
│       │   ├── __mysql__connection.ts.ejs
│       │   └── __sqlite__connection.ts.ejs
│       └── routes/
│           └── demo.database.tsx.ejs
└── package.json.ejs
```

Code in `assets/__postgres__db.config.ts.ejs`:
```ejs
<% if (addOnOption.database.database !== 'postgres') { ignoreFile() } %>
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'myapp',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
}
```

Code in `assets/src/db/__postgres__connection.ts.ejs`:
```ejs
<% if (addOnOption.database.database !== 'postgres') { ignoreFile() } %>
import { Client } from 'pg'
import { dbConfig } from '../db.config'

export const createConnection = () => {
  const client = new Client(dbConfig)
  return client
}
```

Code in `assets/src/routes/demo.database.tsx.ejs`:
```ejs
import { createSignal, onMount } from 'solid-js'

export default function DatabaseDemo() {
  const [status, setStatus] = createSignal('Connecting...')
  
  onMount(async () => {
    try {
      // Database-specific connection logic
      <% if (addOnOption.database.database === 'postgres') { %>
      const { createConnection } = await import('../db/connection')
      const client = createConnection()
      await client.connect()
      setStatus('Connected to PostgreSQL!')
      <% } else if (addOnOption.database.database === 'mysql') { %>
      const { createConnection } = await import('../db/connection')
      const connection = createConnection()
      setStatus('Connected to MySQL!')
      <% } else if (addOnOption.database.database === 'sqlite') { %>
      setStatus('Connected to SQLite!')
      <% } %>
    } catch (error) {
      setStatus(`Connection failed: ${error.message}`)
    }
  })

  return (
    <div>
      <h1>Database Demo</h1>
      <p>Database Type: <%= addOnOption.database.database %></p>
      <p>Status: {status()}</p>
    </div>
  )
}
```

Code in `package.json.ejs`:
```ejs
{
  <% if (addOnOption.database.database === 'postgres') { %>
  "pg": "^8.11.0",
  "@types/pg": "^8.10.0"
  <% } else if (addOnOption.database.database === 'mysql') { %>
  "mysql2": "^3.6.0"
  <% } else if (addOnOption.database.database === 'sqlite') { %>
  "better-sqlite3": "^8.7.0",
  "@types/better-sqlite3": "^7.6.0"
  <% } %>
}
```

## CLI Usage

### Interactive Mode
When using the CLI interactively, users are prompted for each option:

```bash
create-tsrouter-app my-solid-app
# User selects database add-on
# CLI prompts: "Database Integration: Database Provider" with options
```

### Non-Interactive Mode
Options can be specified via JSON configuration:

```bash
create-tsrouter-app my-solid-app --add-ons database --add-on-config '{"database":{"database":"mysql"}}'
```

## Best Practices

1. **Use descriptive labels** - Make option purposes clear to users
2. **Provide sensible defaults** - Choose the most common use case
3. **Group related files** - Use consistent prefixing for option-specific files  
4. **Document options** - Include descriptions to help users understand choices
5. **Test all combinations** - Ensure each option value generates working code
6. **Use validation** - The system validates options against the schema automatically
7. **Consider Solid patterns** - Use Solid-specific patterns like signals and resources
8. **Framework compatibility** - Ensure generated code works with Solid's reactivity system
