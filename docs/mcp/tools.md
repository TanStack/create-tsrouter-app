---
id: mcp-tools
title: MCP Tools Reference
---

## Project Creation Tools

### listTanStackIntegrations

Returns available integrations for project scaffolding.

**Parameters:** None

**Response:**

```typescript
interface Integration {
  id: string           // e.g., "tanstack-query"
  name: string         // e.g., "TanStack Query"
  description: string
  category: string     // "tanstack", "auth", "database", etc.
  dependsOn: string[]  // Required integrations
  conflicts: string[]  // Incompatible integrations
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
| `integrations` | string[] | No | `[]` |
| `integrationOptions` | object | No | `{}` |
| `tailwind` | boolean | No | `true` |
| `packageManager` | string | No | `"pnpm"` |

**Example:**

```json
{
  "projectName": "my-app",
  "targetDir": "/Users/me/projects/my-app",
  "integrations": ["tanstack-query", "clerk", "drizzle"],
  "integrationOptions": {
    "drizzle": { "database": "postgres" }
  }
}
```

**Integration Options:**

```json
// Drizzle
{ "drizzle": { "database": "postgres" | "mysql" | "sqlite" } }

// Prisma
{ "prisma": { "database": "postgresql" | "mysql" | "sqlite" | "mongodb" } }
```

---

## Documentation Tools

### tanstack_list_libraries

Lists TanStack libraries with metadata, frameworks, and documentation URLs.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `group` | string | No | Filter by group: `state`, `headlessUI`, `performance`, `tooling` |

**Example Response:**

```json
{
  "group": "All Libraries",
  "count": 12,
  "libraries": [
    {
      "id": "query",
      "name": "TanStack Query",
      "tagline": "Powerful asynchronous state management...",
      "frameworks": ["react", "solid", "vue", "svelte", "angular"],
      "latestVersion": "v5",
      "docsUrl": "https://tanstack.com/query/latest/docs/framework/react/overview",
      "githubUrl": "https://github.com/tanstack/query"
    }
  ]
}
```

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
  "path": "framework/react/guide/data-loading",
  "version": "latest"
}
```

**Response:**

```json
{
  "title": "Data Loading",
  "content": "# Data Loading\n\nTanStack Router provides...",
  "url": "https://tanstack.com/router/latest/docs/framework/react/guide/data-loading",
  "library": "TanStack Router",
  "version": "v1"
}
```

---

### tanstack_search_docs

Searches TanStack documentation via Algolia.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `library` | string | No | Filter to specific library |
| `framework` | string | No | Filter to specific framework (e.g., `react`, `vue`) |
| `limit` | number | No | Max results (default: 10, max: 50) |

**Example:**

```json
{
  "query": "useQuery mutations",
  "library": "query",
  "framework": "react",
  "limit": 5
}
```

**Response:**

```json
{
  "query": "useQuery mutations",
  "totalHits": 42,
  "results": [
    {
      "title": "Mutations",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/mutations",
      "snippet": "...use mutations to modify data on the server...",
      "library": "query",
      "breadcrumb": ["TanStack Query", "React", "Guides", "Mutations"]
    }
  ]
}
```

---

### tanstack_ecosystem

Browse ecosystem partners by category or library.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | Filter by category (see below) |
| `library` | string | No | Filter by TanStack library (e.g., `start`, `query`) |

**Categories:**
- `database` - PostgreSQL, real-time DBs, ORMs
- `auth` - Authentication providers
- `deployment` - Hosting and deployment platforms
- `monitoring` - Error tracking and monitoring
- `cms` - Content management systems
- `api` - API management tools
- `data-grid` - Data grid components
- `code-review` - Code review tools
- `learning` - Educational resources

**Example:**

```json
{
  "category": "database",
  "library": "start"
}
```

**Response:**

```json
{
  "query": { "category": "database", "library": "start" },
  "count": 4,
  "partners": [
    {
      "id": "neon",
      "name": "Neon",
      "tagline": "Serverless Postgres",
      "description": "Serverless PostgreSQL with instant branching...",
      "category": "database",
      "categoryLabel": "Databases",
      "url": "https://neon.tech",
      "libraries": ["start", "router"]
    }
  ]
}
```

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
  integrations: ['tanstack-query', 'clerk']
})
```
