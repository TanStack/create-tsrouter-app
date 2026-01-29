---
id: troubleshooting
title: Troubleshooting
---

## Installation

### Command not found

```bash
# Use npx instead
npx @tanstack/cli create my-app

# Or reinstall globally
npm install -g @tanstack/cli
```

### Permission denied

Use a Node version manager:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
```

### Node too old

Requires Node.js 18+:

```bash
node --version  # Check
nvm install 20  # Upgrade
```

## Project Creation

### Directory exists

```bash
tanstack create my-app-v2              # Different name
tanstack create my-app --target-dir ./new/path  # Different path
```

### Integration fetch failed

Check internet. Or use local:

```bash
git clone https://github.com/TanStack/cli.git
tanstack create my-app --integrations-path ./cli/integrations
```

### Conflicting integrations

Choose one per group:
- ORM: `drizzle` | `prisma` | `convex`
- Auth: `clerk` | `better-auth` | `workos`
- Lint: `eslint` | `biome`
- Deploy: `vercel` | `netlify` | `cloudflare`

## Runtime

### Missing env vars

```bash
cp .env.example .env
# Edit .env with your values
pnpm dev  # Restart
```

### Tailwind not working

Check `.tanstack.json` has `"tailwind": true` and `styles.css` imports `@import 'tailwindcss'`.

## MCP Server

### Claude Desktop not connecting

1. Config location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Config format:
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

3. Restart Claude Desktop completely

### SSE port conflict

```bash
lsof -i :8080                    # Check port
tanstack mcp --sse --port 3001   # Use different port
```

## Getting Help

Include when reporting:
- `npx @tanstack/cli --version`
- `node --version`
- OS and package manager
- Full error message

Links:
- [GitHub Issues](https://github.com/TanStack/cli/issues)
- [Discord](https://tlinz.com/discord)
