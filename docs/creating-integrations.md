---
id: creating-integrations
title: Creating Integrations
---

Integrations add files, dependencies, and code hooks to generated projects.

## Quick Start

```bash
# 1. Create base project
tanstack create my-integration-dev -y

# 2. Add your code
#    - src/integrations/my-feature/
#    - src/routes/demo/my-feature.tsx
#    - Update package.json

# 3. Extract integration
tanstack integration init

# 4. Edit .integration/info.json

# 5. Compile
tanstack integration compile

# 6. Test
tanstack create test --integrations my-feature --integrations-path ./.integration
```

## Structure

```
my-integration/
├── info.json        # Metadata (required)
├── package.json     # Dependencies (optional)
└── assets/          # Files to copy
    └── src/
        ├── integrations/my-feature/
        └── routes/demo/my-feature.tsx
```

## info.json

Required fields:

```json
{
  "name": "My Feature",
  "description": "What it does",
  "type": "integration",
  "phase": "integration",
  "category": "tooling",
  "modes": ["file-router"]
}
```

| Field | Values |
|-------|--------|
| `type` | `integration`, `toolchain`, `deployment`, `example` |
| `phase` | `setup`, `integration`, `example` |
| `category` | `tanstack`, `auth`, `database`, `orm`, `deploy`, `tooling`, `monitoring`, `api`, `i18n`, `cms`, `other` |

Optional fields:

```json
{
  "dependsOn": ["tanstack-query"],
  "conflicts": ["other-feature"],
  "envVars": [{ "name": "API_KEY", "description": "...", "required": true }],
  "gitignorePatterns": ["*.cache"]
}
```

## Hooks

Inject code into generated projects:

```json
{
  "hooks": [
    {
      "type": "root-provider",
      "jsName": "MyProvider",
      "path": "src/integrations/my-feature/provider.tsx"
    }
  ]
}
```

| Type | Location | Use |
|------|----------|-----|
| `root-provider` | Wraps app in `__root.tsx` | Context providers |
| `vite-plugin` | `vite.config.ts` | Vite plugins |
| `devtools` | After app in `__root.tsx` | Devtools |
| `entry-client` | `entry-client.tsx` | Client init |

## Demo Routes

```json
{
  "routes": [
    {
      "url": "/demo/my-feature",
      "name": "My Feature Demo",
      "path": "src/routes/demo/my-feature.tsx"
    }
  ]
}
```

## Integration Options

Let users configure the integration:

```json
{
  "options": {
    "database": {
      "type": "select",
      "label": "Database",
      "options": [
        { "value": "postgres", "label": "PostgreSQL" },
        { "value": "sqlite", "label": "SQLite" }
      ],
      "default": "postgres"
    }
  }
}
```

Access in EJS templates:

```ejs
<% if (integrationOption['my-feature']?.database === 'postgres') { %>
// PostgreSQL code
<% } %>
```

## EJS Templates

Files ending in `.ejs` are processed. Available variables:

| Variable | Type | Description |
|----------|------|-------------|
| `projectName` | string | Project name |
| `typescript` | boolean | TS enabled |
| `tailwind` | boolean | Tailwind enabled |
| `integrationEnabled` | object | `{ [id]: boolean }` |
| `integrationOption` | object | `{ [id]: options }` |

File patterns:

| Pattern | Result |
|---------|--------|
| `file.ts` | Copied as-is |
| `file.ts.ejs` | EJS processed |
| `_dot_gitignore` | Becomes `.gitignore` |
| `file.ts.append` | Appended to existing |

## Distribution

Host on GitHub or npm, then:

```bash
tanstack create my-app --integrations-path ./path/to/integrations
```

To add to official catalog: PR to `integrations/` folder.
