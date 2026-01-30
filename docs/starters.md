---
id: starters
title: Starters
---

Starters are reusable presets of add-ons. They capture configuration, not code.

## Use a Starter

```bash
tanstack create my-app --starter https://example.com/starter.json
tanstack create my-app --starter ./local-starter.json
```

## Create a Starter

```bash
# 1. Create project with desired add-ons
tanstack create my-preset --add-ons clerk,drizzle,sentry

# 2. Initialize starter
cd my-preset
tanstack starter init

# 3. Edit starter-info.json, then compile
tanstack starter compile

# 4. Use or distribute starter.json
tanstack create new-app --starter ./starter.json
```

## Starter Schema

`starter-info.json`:

```json
{
  "id": "my-saas",
  "name": "SaaS Starter",
  "description": "Auth, database, monitoring",
  "framework": "react",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "addOns": ["clerk", "drizzle", "sentry"],
  "addOnOptions": {
    "drizzle": { "database": "postgres" }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier |
| `name` | Yes | Display name |
| `description` | Yes | Brief description |
| `framework` | Yes | `react` or `solid` |
| `mode` | Yes | `file-router` or `code-router` |
| `typescript` | Yes | Enable TypeScript |
| `tailwind` | Yes | Include Tailwind |
| `addOns` | Yes | Add-on IDs |
| `addOnOptions` | No | Per-add-on config |
| `banner` | No | Image URL for UI |

## Starter vs Add-on

| | Starter | Add-on |
|-|---------|--------|
| Contains code | No | Yes |
| Adds files | No | Yes |
| Configuration preset | Yes | No |
