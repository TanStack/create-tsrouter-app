---
id: mcp-overview
title: MCP Server
---

The TanStack CLI includes a Model Context Protocol (MCP) server that enables AI assistants to:
- Create TanStack Start projects with add-ons
- Search and fetch TanStack documentation
- Explore the TanStack ecosystem (partners, libraries)

## Claude Desktop Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "tanstack": {
      "command": "npx",
      "args": ["@tanstack/cli", "mcp"]
    }
  }
}
```

Restart Claude Desktop. Then try:

> "Create a TanStack Start project called 'my-app' with Clerk auth and Drizzle ORM"

Or:

> "How do I use loaders in TanStack Router?"

## Manual Start

```bash
# Stdio (default, for MCP clients)
tanstack mcp

# HTTP/SSE
tanstack mcp --sse
```

## Tools

### Project Creation

| Tool | Description |
|------|-------------|
| `listTanStackAddOns` | Get available add-ons for project creation |
| `createTanStackApplication` | Create a new TanStack Start project |

### Documentation & Ecosystem

| Tool | Description |
|------|-------------|
| `tanstack_list_libraries` | List TanStack libraries with metadata |
| `tanstack_doc` | Fetch a documentation page by library and path |
| `tanstack_search_docs` | Search documentation via Algolia |
| `tanstack_ecosystem` | Browse ecosystem partners by category or library |

See [Tools Reference](./tools.md) for parameters and examples.
