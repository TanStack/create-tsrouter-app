---
id: quick-start
title: Quick Start
---

## Create a Project

```bash
npx @tanstack/cli create my-app
```

Interactive prompts guide you through project name, package manager, and add-on selection.

## Non-Interactive

```bash
# Defaults only (TanStack Start + file-router)
npx @tanstack/cli create my-app -y

# With add-ons
npx @tanstack/cli create my-app --add-ons tanstack-query,clerk,drizzle

# Router-only SPA (no SSR)
npx @tanstack/cli create my-app --router-only
```

## Run the Project

```bash
cd my-app
pnpm dev
# Open http://localhost:3000
```

## Environment Variables

Some add-ons require API keys. After creation:

```bash
cp .env.example .env
# Edit .env with your values
```

## Project Structure

```
my-app/
├── src/
│   ├── routes/          # File-based routing
│   │   ├── __root.tsx   # Root layout
│   │   └── index.tsx    # Home page
│   └── integrations/    # Add-on integration code
├── .tanstack.json       # CLI config
└── .env.example         # Required env vars
```

## Next Steps

- [CLI Reference](./cli-reference.md) - All options
- [Add-ons](./add-ons.md) - Available add-ons
