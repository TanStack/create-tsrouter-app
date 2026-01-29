---
id: cli-reference
title: CLI Reference
---

## tanstack create

Create a new TanStack Start project.

```bash
tanstack create [project-name] [options]
```

| Option | Description |
|--------|-------------|
| `--integrations <ids>` | Comma-separated integration IDs |
| `--template <url>` | Template URL or local path |
| `--package-manager <pm>` | `npm`, `pnpm`, `yarn`, `bun`, `deno` |
| `--no-tailwind` | Skip Tailwind CSS |
| `--no-git` | Skip git init |
| `--no-install` | Skip dependency install |
| `-y, --yes` | Use defaults, skip prompts |
| `--target-dir <path>` | Custom output directory |
| `--integrations-path <path>` | Local integrations (dev) |

```bash
# Examples
tanstack create my-app -y
tanstack create my-app --integrations clerk,drizzle,tanstack-query
tanstack create my-app --template https://example.com/template.json
```

---

## tanstack integration

Create custom integrations from existing projects.

### init

Extract integration from current project:

```bash
tanstack integration init
```

Creates `.integration/` folder with `info.json` and `assets/`.

### compile

Rebuild after changes:

```bash
tanstack integration compile
```

See [Creating Integrations](./creating-integrations.md) for full guide.

---

## tanstack template

Create reusable project presets.

### init

```bash
tanstack template init
```

Creates `template-info.json` and `template.json`.

### compile

```bash
tanstack template compile
```

See [Templates](./templates.md) for full guide.

---

## tanstack mcp

Start MCP server for AI agents.

```bash
tanstack mcp [options]
```

| Option | Description |
|--------|-------------|
| `--sse` | HTTP/SSE mode (default: stdio) |
| `--port <n>` | SSE port (default: 8080) |

See [MCP Server](./mcp/overview.md) for setup.

---

## Configuration

Projects include `.tanstack.json`:

```json
{
  "version": 1,
  "projectName": "my-app",
  "framework": "react",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "packageManager": "pnpm",
  "chosenIntegrations": ["tanstack-query", "clerk"]
}
```

Used by `integration init` and `template init` to detect changes.
