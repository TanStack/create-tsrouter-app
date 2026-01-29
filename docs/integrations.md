---
id: integrations
title: Integrations
---

Integrations add features to your project: auth, databases, deployment, etc.

```bash
tanstack create my-app --integrations tanstack-query,clerk,drizzle
```

## Available Integrations

### TanStack

| ID | Description |
|----|-------------|
| `tanstack-query` | Data fetching, caching, sync |
| `tanstack-form` | Type-safe form state |
| `tanstack-table` | Headless tables |
| `tanstack-store` | Global state |
| `tanstack-virtual` | List virtualization |
| `tanstack-db` | Client-side reactive DB |
| `tanstack-pacer` | Rate limiting utilities |
| `ai` | AI chat/completion |

### Auth

| ID | Description | Conflicts |
|----|-------------|-----------|
| `clerk` | Hosted auth + components | `better-auth`, `workos` |
| `better-auth` | Self-hosted auth | `clerk`, `workos` |
| `workos` | Enterprise SSO/SCIM | `clerk`, `better-auth` |

### Database/ORM

| ID | Description | Conflicts |
|----|-------------|-----------|
| `drizzle` | TypeScript ORM | `prisma`, `convex` |
| `prisma` | Node.js ORM | `drizzle`, `convex` |
| `convex` | Realtime fullstack platform | `drizzle`, `prisma`, `neon` |
| `neon` | Serverless Postgres | `convex` |

### Deployment

| ID | Description | Conflicts |
|----|-------------|-----------|
| `vercel` | Vercel deployment | `netlify`, `cloudflare` |
| `netlify` | Netlify deployment | `vercel`, `cloudflare`, `nitro` |
| `cloudflare` | Cloudflare Workers | `vercel`, `netlify`, `nitro` |
| `nitro` | Universal server engine | `netlify`, `cloudflare` |

### Tooling

| ID | Description | Conflicts |
|----|-------------|-----------|
| `eslint` | ESLint + Prettier | `biome` |
| `biome` | Fast linter/formatter | `eslint` |
| `shadcn` | Radix UI + Tailwind components | - |
| `storybook` | Component development | - |

### API

| ID | Description | Requires |
|----|-------------|----------|
| `trpc` | Type-safe APIs | `tanstack-query` |
| `orpc` | Type-safe RPC + OpenAPI | `tanstack-query` |

### Other

| ID | Description |
|----|-------------|
| `sentry` | Error monitoring |
| `paraglide` | Type-safe i18n |
| `strapi` | Headless CMS |
| `mcp` | MCP server for AI agents |

## What Integrations Provide

- **Files**: Source code in `src/integrations/`, demo routes in `src/routes/demo/`
- **Dependencies**: Merged into `package.json`
- **Hooks**: Code injection (providers, Vite plugins, devtools)
- **Env vars**: Added to `.env.example`

## Create Custom Integrations

See [Creating Integrations](./creating-integrations.md).
