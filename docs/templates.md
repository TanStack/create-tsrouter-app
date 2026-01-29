---
id: templates
title: Templates
---

Templates are reusable presets of integrations. They capture configuration, not code.

## Use a Template

```bash
tanstack create my-app --template https://example.com/template.json
tanstack create my-app --template ./local-template.json
```

## Create a Template

```bash
# 1. Create project with desired integrations
tanstack create my-preset --integrations clerk,drizzle,sentry

# 2. Initialize template
cd my-preset
tanstack template init

# 3. Edit template-info.json, then compile
tanstack template compile

# 4. Use or distribute template.json
tanstack create new-app --template ./template.json
```

## Template Schema

`template-info.json`:

```json
{
  "id": "my-saas",
  "name": "SaaS Starter",
  "description": "Auth, database, monitoring",
  "framework": "react",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "integrations": ["clerk", "drizzle", "sentry"],
  "integrationOptions": {
    "drizzle": { "database": "postgres" }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier |
| `name` | Yes | Display name |
| `description` | Yes | Brief description |
| `framework` | Yes | `react` |
| `mode` | Yes | `file-router` or `code-router` |
| `typescript` | Yes | Enable TypeScript |
| `tailwind` | Yes | Include Tailwind |
| `integrations` | Yes | Integration IDs |
| `integrationOptions` | No | Per-integration config |
| `banner` | No | Image URL for UI |

## Template vs Integration

| | Template | Integration |
|-|----------|-------------|
| Contains code | No | Yes |
| Adds files | No | Yes |
| Configuration preset | Yes | No |
