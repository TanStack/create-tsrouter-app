---
id: mcp-tools
title: MCP Tools Reference
---

## Project Creation Tools

### listTanStackAddOns

Returns available add-ons for project scaffolding.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `framework` | string | Yes | `React` or `Solid` |

**Response:**

```typescript
interface AddOn {
  id: string           // e.g., "tanstack-query"
  name: string         // e.g., "TanStack Query"
  description: string
  category: string     // "tanstack", "auth", "database", etc.
  dependsOn: string[]  // Required add-ons
  conflicts: string[]  // Incompatible add-ons
  hasOptions: boolean  // Has configurable options
}
```

---

### createTanStackApplication

Creates a new TanStack Start project.

**Parameters:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `projectName` | string | Yes | - |
| `targetDir` | string | Yes | - |
| `framework` | string | Yes | - |
| `cwd` | string | Yes | - |
| `addOns` | string[] | No | `[]` |
| `addOnOptions` | object | No | `{}` |

**Example:**

```json
{
  "projectName": "my-app",
  "targetDir": "/Users/me/projects/my-app",
  "cwd": "/Users/me/projects",
  "framework": "React",
  "addOns": ["tanstack-query", "clerk"]
}
```

Use `listTanStackAddOns` to discover available add-ons and their configuration options.

---

## Documentation Tools

### tanstack_list_libraries

Lists TanStack libraries with metadata, frameworks, and documentation URLs.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `group` | string | No | Filter by group: `state`, `headlessUI`, `performance`, `tooling` |

---

### tanstack_doc

Fetches a documentation page by library and path.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `library` | string | Yes | Library ID (e.g., `query`, `router`, `table`) |
| `path` | string | Yes | Doc path (e.g., `framework/react/overview`) |
| `version` | string | No | Version (e.g., `v5`, `v1`). Defaults to `latest` |

**Example:**

```json
{
  "library": "router",
  "path": "framework/react/guide/data-loading"
}
```

---

### tanstack_search_docs

Searches TanStack documentation.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `library` | string | No | Filter to specific library |
| `framework` | string | No | Filter to specific framework |
| `limit` | number | No | Max results (default: 10, max: 50) |

---

### tanstack_ecosystem

Browse ecosystem partners by category or library.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `library` | string | No | Filter by TanStack library |

---

## Programmatic Usage

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['@tanstack/cli', 'mcp']
})

const client = new Client({ name: 'my-client', version: '1.0.0' }, {})
await client.connect(transport)

// List available add-ons
const addOns = await client.callTool('listTanStackAddOns', {
  framework: 'React'
})

// Search documentation
const results = await client.callTool('tanstack_search_docs', {
  query: 'server functions',
  library: 'start'
})

// Fetch a specific doc page
const doc = await client.callTool('tanstack_doc', {
  library: 'router',
  path: 'framework/react/guide/data-loading'
})

// Create a project
const result = await client.callTool('createTanStackApplication', {
  projectName: 'my-app',
  targetDir: '/path/to/my-app',
  cwd: '/path/to',
  framework: 'React',
  addOns: ['tanstack-query']
})
```
