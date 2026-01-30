# TanStack CLI

## Quick Reference

```bash
# Create TanStack Start app (default)
npx @tanstack/cli create my-app

# Create Router-only SPA (no SSR)
npx @tanstack/cli create my-app --router-only

# With add-ons
npx @tanstack/cli create my-app --add-ons clerk,drizzle,tanstack-query

# Add to existing project
npx @tanstack/cli add clerk drizzle

# List available add-ons
npx @tanstack/cli create --list-add-ons
```

## Monorepo Structure

```
cli/
├── packages/
│   ├── cli/           # @tanstack/cli - Main CLI
│   ├── create/        # @tanstack/create - Core engine + frameworks
│   │   └── src/frameworks/
│   │       ├── react/     # React framework + add-ons
│   │       └── solid/     # Solid framework + add-ons
│   └── create-ui/     # @tanstack/create-ui - Web UI
└── cli-aliases/       # Deprecated wrappers (create-tsrouter-app, etc.)
```

## Development

```bash
pnpm install && pnpm build    # Setup
pnpm dev                       # Watch mode

# Test from peer directory (not inside monorepo)
node ../cli/packages/cli/dist/index.js create my-app
```

## Key Terminology

| Term | Definition | CLI Flag |
|------|------------|----------|
| Add-on | Plugin that extends apps (auth, DB, etc) | `--add-ons` |
| Starter | Reusable preset of add-ons (config only) | `--starter` |
| Framework | React or Solid | `--framework` |
| Mode | `file-router` (default) or `code-router` | `--router-only` for code-router SPA |

## CLI Commands

| Command | Description |
|---------|-------------|
| `tanstack create [name]` | Create TanStack Start app |
| `tanstack add [add-ons]` | Add to existing project |
| `tanstack add-on init/compile` | Create custom add-on |
| `tanstack starter init/compile` | Create custom starter |
| `tanstack mcp [--sse]` | Start MCP server |
| `tanstack pin-versions` | Pin TanStack packages |

## Create Options

| Flag | Description |
|------|-------------|
| `--add-ons <ids>` | Comma-separated add-on IDs |
| `--router-only` | SPA without TanStack Start (no SSR) |
| `--framework <name>` | React or Solid |
| `--toolchain <id>` | Toolchain (use `--list-add-ons` to see options) |
| `--deployment <id>` | Deployment target (use `--list-add-ons` to see options) |
| `--starter <url>` | Use starter preset |
| `--no-tailwind` | Skip Tailwind |
| `--no-git` | Skip git init |
| `--no-install` | Skip npm install |
| `-y` | Accept defaults |
| `-f, --force` | Overwrite existing |
| `--ui` | Launch visual builder |

## EJS Template Variables

| Variable | Type | Description |
|----------|------|-------------|
| `projectName` | string | Project name |
| `typescript` | boolean | TypeScript enabled |
| `tailwind` | boolean | Tailwind enabled |
| `fileRouter` | boolean | File-based routing |
| `codeRouter` | boolean | Code-based routing |
| `addOnEnabled` | object | `{ [id]: boolean }` |
| `addOnOption` | object | `{ [id]: options }` |
| `packageManager` | string | npm/pnpm/yarn/bun/deno |
| `js` | string | `ts` or `js` |
| `jsx` | string | `tsx` or `jsx` |

## Testing Add-ons Locally

```bash
# Serve add-on
npx serve .add-on -l 9080

# Use in create
node packages/cli/dist/index.js create test --add-ons http://localhost:9080/info.json
```

## MCP Server Config

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

## Key Files

| File | Purpose |
|------|---------|
| `packages/cli/src/cli.ts` | CLI command definitions |
| `packages/create/src/frameworks/` | Framework implementations |
| `packages/create/src/app-*.ts` | App creation logic |
| `.tanstack.json` | Generated project config |
