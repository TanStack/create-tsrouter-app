---
id: quick-start
title: Quick Start
---

## Create a Project

```bash
npx @tanstack/cli create my-app
```

Interactive prompts guide you through project name, package manager, and integration selection.

## Non-Interactive

```bash
# Defaults only
npx @tanstack/cli create my-app -y

# With integrations
npx @tanstack/cli create my-app --integrations tanstack-query,clerk,drizzle
```

## Run the Project

```bash
cd my-app
pnpm dev
# Open http://localhost:3000
```

## Environment Variables

Some integrations require API keys. After creation:

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
│   └── integrations/    # Integration code
├── .tanstack.json       # CLI config
└── .env.example         # Required env vars
```

## Next Steps

- [CLI Reference](./cli-reference.md) - All options
- [Integrations](./integrations.md) - Available integrations
