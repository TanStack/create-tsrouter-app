---
id: add-ons
title: Add-ons
---

Add-ons extend your project with auth, databases, deployment, and more.

```bash
tanstack create my-app --add-ons tanstack-query,clerk,drizzle
```

## Discover Add-ons

```bash
# List all available add-ons
tanstack create --list-add-ons

# Show details for a specific add-on (dependencies, options, conflicts)
tanstack create --addon-details clerk
```

## What Add-ons Provide

- **Files**: Source code in `src/integrations/`, demo routes in `src/routes/demo/`
- **Dependencies**: Merged into `package.json`
- **Hooks**: Code injection (providers, Vite plugins, devtools)
- **Env vars**: Added to `.env.example`

## Create Custom Add-ons

See [Creating Add-ons](./creating-add-ons.md).
