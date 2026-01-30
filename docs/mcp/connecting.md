---
id: mcp-connecting
title: Connecting AI Clients
---

The TanStack CLI MCP server runs locally via stdio (default) or HTTP/SSE.

## Claude Desktop

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

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Restart Claude Desktop after editing.

## Claude Code

```bash
claude mcp add tanstack -- npx @tanstack/cli mcp
```

## Cursor

Add to your Cursor MCP config:

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

## VS Code (Copilot)

Add to `.vscode/mcp.json` or VS Code settings:

```json
{
  "servers": {
    "tanstack": {
      "command": "npx",
      "args": ["@tanstack/cli", "mcp"]
    }
  }
}
```

## Other MCP Clients

For any MCP client supporting stdio transport:

- **Command:** `npx`
- **Args:** `["@tanstack/cli", "mcp"]`

Or with global install:

- **Command:** `tanstack`
- **Args:** `["mcp"]`

## HTTP/SSE Mode

For clients preferring HTTP:

```bash
tanstack mcp --sse
```

Connect to `http://localhost:8080/sse`.

## MCP Inspector

Test the server interactively:

```bash
npx @modelcontextprotocol/inspector -- npx @tanstack/cli mcp
```

## Verifying Connection

After connecting, ask your AI assistant:

> "List all available TanStack libraries"

You should see output from `tanstack_list_libraries` showing Query, Router, Table, and other libraries.
