---
id: creating-add-ons
title: Creating Add-ons
---

Add-ons add files, dependencies, and code hooks to generated projects.

## Quick Start

```bash
# 1. Create base project
tanstack create my-addon-dev -y

# 2. Add your code
#    - src/integrations/my-feature/
#    - src/routes/demo/my-feature.tsx
#    - Update package.json

# 3. Extract add-on
tanstack add-on init

# 4. Edit .add-on/info.json

# 5. Compile
tanstack add-on compile

# 6. Test locally
npx serve .add-on -l 9080
tanstack create test --add-ons http://localhost:9080/info.json
```

## Structure

```
.add-on/
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
  "type": "add-on",
  "phase": "add-on",
  "category": "tooling",
  "modes": ["file-router"]
}
```

| Field | Values |
|-------|--------|
| `type` | `add-on`, `toolchain`, `deployment`, `example` |
| `phase` | `setup`, `add-on`, `example` |
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

## Hooks (Integrations)

Inject code into generated projects:

```json
{
  "integrations": [
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
| `provider` | Same, but simpler | Basic providers |
| `vite-plugin` | `vite.config.ts` | Vite plugins |
| `devtools` | After app in `__root.tsx` | Devtools |
| `header-user` | Header component | User menu, auth UI |
| `layout` | Layout wrapper | Dashboard layouts |

## Demo Routes

```json
{
  "routes": [
    {
      "url": "/demo/my-feature",
      "name": "My Feature Demo",
      "path": "src/routes/demo/my-feature.tsx",
      "jsName": "MyFeatureDemo"
    }
  ]
}
```

## Add-on Options

Let users configure the add-on:

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
<% if (addOnOption['my-feature']?.database === 'postgres') { %>
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
| `addOnEnabled` | object | `{ [id]: boolean }` |
| `addOnOption` | object | `{ [id]: options }` |

File patterns:

| Pattern | Result |
|---------|--------|
| `file.ts` | Copied as-is |
| `file.ts.ejs` | EJS processed |
| `_dot_gitignore` | Becomes `.gitignore` |
| `file.ts.append` | Appended to existing |

## Distribution

Host on GitHub, npm, or any URL:

```bash
tanstack create my-app --add-ons https://example.com/my-addon/info.json
```
