---
id: examples
title: Examples
---

Common integration combinations.

## Starters

```bash
# Minimal
tanstack create my-app -y --no-tailwind

# SaaS
tanstack create my-app --integrations clerk,drizzle,neon,sentry,tanstack-query

# Dashboard
tanstack create my-app --integrations tanstack-query,tanstack-table,tanstack-form,shadcn

# AI App
tanstack create my-app --integrations ai,tanstack-query

# API-First
tanstack create my-app --integrations trpc,tanstack-query,drizzle,neon

# Enterprise
tanstack create my-app --integrations workos,drizzle,neon,sentry,eslint
```

## Stack Choices

**Database:**
```bash
--integrations drizzle,neon    # Postgres + Drizzle
--integrations prisma          # Prisma ORM
--integrations convex          # Realtime platform
```

**Auth:**
```bash
--integrations clerk           # Hosted auth
--integrations workos          # Enterprise SSO
--integrations better-auth     # Self-hosted
```

**Deploy:**
```bash
--integrations vercel
--integrations cloudflare
--integrations netlify
--integrations nitro           # Any platform
```

## Recipes

### Authenticated Dashboard

```bash
tanstack create admin --integrations clerk,tanstack-query,tanstack-table,drizzle,neon,shadcn
cd admin
cp .env.example .env
# Add CLERK_* and DATABASE_URL to .env
pnpm db:push
pnpm dev
```

### Realtime App

```bash
tanstack create realtime --integrations convex,tanstack-query
cd realtime
npx convex dev  # Creates project, adds CONVEX_URL
pnpm dev
```

## CI/CD

### GitHub Actions

```yaml
name: Create Project
on:
  workflow_dispatch:
    inputs:
      name:
        required: true
jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - run: npx @tanstack/cli create ${{ inputs.name }} --integrations tanstack-query -y
```

### Docker

```dockerfile
FROM node:20-slim
RUN npm install -g @tanstack/cli pnpm
RUN tanstack create app -y --integrations tanstack-query
WORKDIR /app
RUN pnpm install && pnpm build
CMD ["pnpm", "start"]
```
