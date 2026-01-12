# CTA Framework Structure Guide

This document provides comprehensive documentation for creating and understanding CTA (Create TanStack Application) framework content. It covers the structure of base project files, add-ons, toolchains, hosts, examples, and starters.

## Table of Contents

1. [Overview](#overview)
2. [Framework Directory Structure](#framework-directory-structure)
3. [Project Base Structure](#project-base-structure)
4. [Add-On Structure](#add-on-structure)
5. [EJS Template System](#ejs-template-system)
6. [Component Types](#component-types)
7. [Workflow: Creating an Add-On from Project Changes](#workflow-creating-an-add-on-from-project-changes)
8. [Workflow: Converting a Project to an Example](#workflow-converting-a-project-to-an-example)
9. [info.json Complete Reference](#infojson-complete-reference)
10. [Best Practices](#best-practices)

---

## Overview

In the CTA ecosystem, a "framework" is a content package that provides templates and add-ons for the cta-engine. Each framework defines:

- **Base project template**: The foundation files for new projects
- **Add-ons**: Optional feature extensions (authentication, databases, state management)
- **Toolchains**: Development tools (ESLint, Biome, Prettier)
- **Hosts**: Deployment platform integrations (Netlify, Cloudflare)
- **Examples**: Demo implementations showcasing features
- **Starters**: Complete project templates

The cta-engine processes these components to generate customized applications based on user selections.

---

## Framework Directory Structure

Every framework follows this standard structure:

```
framework-name/
├── src/
│   └── index.ts              # Framework registration and configuration
├── dist/                     # Compiled output
├── project/                  # Base project template
│   ├── base/                 # Core template files
│   └── packages.json         # Conditional package dependencies
├── add-ons/                  # Feature add-ons
│   └── {add-on-name}/
├── toolchains/               # Development tools
│   └── {toolchain-name}/
├── hosts/                    # Deployment targets
│   └── {host-name}/
├── examples/                 # Demo implementations
│   └── {example-name}/
├── tests/                    # Test snapshots
├── package.json              # Framework package configuration
└── ADD-ON-AUTHORING.md       # Framework-specific add-on docs
```

---

## Project Base Structure

The `project/` directory contains the foundational template for all generated projects.

### Directory Layout

```
project/
├── base/                     # Core project files
│   ├── package.json          # Base dependencies
│   ├── tsconfig.json.ejs     # TypeScript configuration (templated)
│   ├── vite.config.ts.ejs    # Vite configuration (templated)
│   ├── index.html.ejs        # HTML entry point (templated)
│   ├── README.md.ejs         # Project README (templated)
│   ├── _dot_gitignore        # Git ignore file
│   ├── _dot_vscode/          # VS Code settings
│   │   └── settings.json.ejs
│   ├── public/               # Static assets
│   │   ├── favicon.ico
│   │   ├── logo192.png
│   │   └── manifest.json
│   └── src/
│       ├── main.tsx.ejs      # Application entry
│       ├── App.tsx.ejs       # Main component
│       ├── styles.css.ejs    # Global styles
│       ├── components/
│       │   └── Header.tsx.ejs
│       └── routes/
│           ├── __root.tsx.ejs
│           └── index.tsx.ejs
└── packages.json             # Conditional dependencies
```

### packages.json

The `packages.json` file defines conditional dependencies based on project options:

```json
{
  "typescript": {
    "devDependencies": {
      "@types/react": "^19.0.0",
      "@types/node": "^22.0.0",
      "typescript": "^5.7.0"
    }
  },
  "tailwindcss": {
    "dependencies": {
      "@tailwindcss/vite": "^4.0.0",
      "tailwindcss": "^4.0.0",
      "lucide-react": "^0.400.0"
    }
  },
  "file-router": {
    "dependencies": {
      "@tanstack/router-plugin": "^1.100.0"
    }
  }
}
```

These packages are automatically added when the corresponding option is enabled.

### File Naming Conventions

| Pattern | Description | Example |
|---------|-------------|---------|
| `_dot_` prefix | Converted to `.` (dotfiles) | `_dot_gitignore` → `.gitignore` |
| `.ejs` suffix | Processed as EJS template | `App.tsx.ejs` → `App.tsx` |
| `.append` suffix | Appended to existing file | `_dot_env.local.append` |

---

## Add-On Structure

Add-ons extend applications with new features. Each add-on is a self-contained directory.

### Directory Layout

```
add-on-name/
├── info.json                 # Metadata and configuration (required)
├── package.json              # npm dependencies (required if deps exist)
├── README.md                 # Documentation
├── small-logo.svg            # 128x128 logo for UI
├── logo.svg                  # Full-size logo
└── assets/                   # Files to inject into project
    ├── src/
    │   ├── components/       # UI components
    │   ├── routes/           # Demo routes
    │   ├── integrations/     # Integration components
    │   └── lib/              # Utilities
    ├── vite-plugins/         # Custom Vite plugins
    └── _dot_env.local.append # Environment variables
```

### info.json Structure

The `info.json` file defines the add-on's metadata and behavior:

```json
{
  "name": "My Add-On",
  "description": "Add feature X to your application.",
  "type": "add-on",
  "phase": "add-on",
  "modes": ["file-router", "code-router"],
  "priority": 100,
  "link": "https://docs.example.com",

  "routes": [
    {
      "url": "/demo/my-feature",
      "name": "My Feature",
      "icon": "Sparkles",
      "path": "src/routes/demo.my-feature.tsx",
      "jsName": "MyFeatureDemo"
    }
  ],

  "integrations": [
    {
      "type": "provider",
      "jsName": "MyProvider",
      "path": "src/integrations/my-feature/provider.tsx"
    }
  ],

  "dependsOn": ["tanstack-query"],
  "shadcnComponents": ["button", "card"]
}
```

### Integration Types

Integrations inject code at specific application entry points.

#### header-user

Injects components into the Header (right side).

**Location**: `src/components/Header.(tsx|jsx)`

```json
{
  "integrations": [
    {
      "type": "header-user",
      "jsName": "UserMenu",
      "path": "src/integrations/auth/user-menu.tsx"
    }
  ]
}
```

Component structure:
```tsx
export default function UserMenu() {
  return <div className="user-menu">User controls here</div>
}
```

#### provider

Wraps the application with context providers.

**Locations**:
- `code-router`: `src/main.tsx`
- `file-router`: `src/routes/__root.tsx`
- `file-router` with `start`: `src/main.tsx`

```json
{
  "integrations": [
    {
      "type": "provider",
      "jsName": "ThemeProvider",
      "path": "src/integrations/theme/provider.tsx"
    }
  ]
}
```

Component structure:
```tsx
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
```

#### root-provider

Advanced provider with exported context (used by TanStack Query).

```json
{
  "integrations": [
    {
      "type": "root-provider",
      "jsName": "QueryProvider",
      "path": "src/integrations/query/provider.tsx"
    }
  ]
}
```

Component structure:
```tsx
export function getContext() {
  return {
    queryClient: new QueryClient()
  }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

#### layout

Injects a layout wrapper component.

```json
{
  "integrations": [
    {
      "type": "layout",
      "jsName": "DashboardLayout",
      "path": "src/components/dashboard-layout.tsx"
    }
  ]
}
```

#### vite-plugin

Injects Vite plugins into the build configuration.

**Approach A: File-based**
```json
{
  "integrations": [
    {
      "type": "vite-plugin",
      "jsName": "sentryPlugin",
      "path": "vite-plugins/sentry.ts"
    }
  ]
}
```

**Approach B: Inline**
```json
{
  "integrations": [
    {
      "type": "vite-plugin",
      "import": "import { sentryVitePlugin } from '@sentry/vite-plugin'",
      "code": "sentryVitePlugin({ org: 'my-org', project: 'my-project' })"
    }
  ]
}
```

#### devtools

Injects developer tools components.

```json
{
  "integrations": [
    {
      "type": "devtools",
      "jsName": "MyDevtools",
      "path": "src/lib/my-devtools.tsx"
    }
  ]
}
```

### Routes

Routes define pages that your add-on provides:

```json
{
  "routes": [
    {
      "url": "/demo/clerk",
      "name": "Auth Demo",
      "icon": "LogIn",
      "path": "src/routes/demo.clerk.tsx",
      "jsName": "ClerkDemo"
    }
  ]
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `url` | No | URL path; omit for hidden routes |
| `name` | No | Header link text; omit for no link |
| `icon` | No | Lucide icon name |
| `path` | Yes | Relative path to component file |
| `jsName` | Yes | Exported component name (required for code-router) |
| `children` | No | Nested child routes |

**Convention**: Prefix demo routes with `demo.` for easy identification and removal.

### Add-On Options

Options allow user customization during project creation:

```json
{
  "options": {
    "database": {
      "type": "select",
      "label": "Database Provider",
      "description": "Choose your database",
      "default": "postgres",
      "options": [
        { "value": "postgres", "label": "PostgreSQL" },
        { "value": "mysql", "label": "MySQL" },
        { "value": "sqlite", "label": "SQLite" }
      ]
    }
  }
}
```

Access in templates via `addOnOption.{addOnId}.{optionName}`:

```ejs
<% if (addOnOption.prisma.database === 'postgres') { %>
import pg from 'pg'
<% } %>
```

### package.json

Add-on dependencies in standard npm format:

```json
{
  "dependencies": {
    "@clerk/react": "^5.0.0",
    "@clerk/tanstack-start": "^0.1.0"
  },
  "devDependencies": {
    "@types/some-package": "^1.0.0"
  }
}
```

---

## EJS Template System

Files ending in `.ejs` are processed through the EJS templating engine before being written to the project.

### When to Use .ejs

Use `.ejs` extension when the file needs:
- Conditional logic based on options
- Dynamic content substitution
- Conditional imports or exports
- File generation that depends on user choices

**Do NOT use `.ejs`** for static files that never change.

### Available Template Variables

#### Project Configuration

| Variable | Type | Description |
|----------|------|-------------|
| `packageManager` | `'npm' \| 'yarn' \| 'pnpm' \| 'bun' \| 'deno'` | Selected package manager |
| `projectName` | `string` | Project directory name |
| `typescript` | `boolean` | TypeScript enabled |
| `tailwind` | `boolean` | Tailwind CSS enabled |

#### File Extension Helpers

| Variable | Type | Description |
|----------|------|-------------|
| `js` | `'ts' \| 'js'` | Script file extension |
| `jsx` | `'tsx' \| 'jsx'` | JSX file extension |

#### Router Mode

| Variable | Type | Description |
|----------|------|-------------|
| `fileRouter` | `boolean` | Using file-based routing |
| `codeRouter` | `boolean` | Using code-based routing |

#### Add-On Information

| Variable | Type | Description |
|----------|------|-------------|
| `addOnEnabled` | `Record<string, boolean>` | Map of enabled add-on IDs |
| `addOnOption` | `Record<string, Record<string, any>>` | Add-on option values |
| `addOns` | `Array<AddOn>` | Full add-on objects |
| `routes` | `Array<Route>` | All routes from enabled add-ons |
| `integrations` | `Array<Integration>` | All integrations from enabled add-ons |

### Helper Functions

#### ignoreFile()

Skips file generation when called. Use for conditional file inclusion:

```ejs
<% if (addOnOption.prisma.database !== 'postgres') { ignoreFile() } %>
// This file only exists for PostgreSQL
import pg from 'pg'
```

#### getPackageManagerAddScript(packageName, isDev?)

Returns the command to add a package:

```ejs
Run: <%= getPackageManagerAddScript('lodash') %>
// npm: "npm install lodash"
// pnpm: "pnpm add lodash"
// yarn: "yarn add lodash"
```

#### getPackageManagerRunScript(scriptName, args?)

Returns the command to run a script:

```ejs
Run: <%= getPackageManagerRunScript('dev') %>
// npm: "npm run dev"
// pnpm: "pnpm run dev"
```

#### relativePath(targetPath, stripExtension?)

Calculates relative import path:

```ejs
import { utils } from '<%= relativePath('./src/lib/utils') %>'
```

#### integrationImportContent(integration) / integrationImportCode(integration)

Used internally for generating integration imports.

### Special File Patterns

#### Dotfile Pattern: `_dot_`

Files prefixed with `_dot_` become dotfiles:

```
_dot_gitignore     → .gitignore
_dot_env.local     → .env.local
_dot_vscode/       → .vscode/
```

#### Append Pattern: `.append`

Files with `.append` suffix merge into existing files:

```
_dot_env.local.append.ejs → appends to .env.local
```

#### Option Prefix: `__option__`

Files prefixed with `__option__` are only included if that option is selected:

```
__postgres__schema.prisma → only included if database option is 'postgres'
```

### Template Examples

#### Conditional TypeScript

```ejs
<% if (typescript) { %>
interface Props {
  name: string
}
<% } %>

export default function Component(<% if (typescript) { %>{ name }: Props<% } else { %>{ name }<% } %>) {
  return <div>{name}</div>
}
```

#### Conditional Imports

```ejs
<% if (addOnEnabled.clerk) { %>
import { useAuth } from '@clerk/react'
<% } %>

<% if (addOnEnabled['tanstack-query']) { %>
import { useQuery } from '@tanstack/react-query'
<% } %>
```

#### Router Mode Handling

```ejs
<% if (fileRouter) { %>
// File-based routing setup
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo')({
  component: Demo,
})
<% } else { %>
// Code-based routing - exported directly
<% } %>

export default function Demo() {
  return <div>Demo Page</div>
}
```

---

## Component Types

### Toolchains

Development tools for code quality and formatting.

| Property | Value |
|----------|-------|
| `type` | `"toolchain"` |
| `phase` | `"setup"` |
| `priority` | `0-10` |

Example toolchains: ESLint, Biome, Prettier

```json
{
  "name": "Biome",
  "description": "Fast linter and formatter",
  "type": "toolchain",
  "phase": "setup",
  "priority": 2,
  "modes": ["code-router", "file-router"],
  "link": "https://biomejs.dev"
}
```

### Hosts (Deployments)

Hosting platform integrations.

| Property | Value |
|----------|-------|
| `type` | `"deployment"` |
| `phase` | `"add-on"` |
| `priority` | `170-200` |

Example hosts: Netlify, Cloudflare, Nitro

```json
{
  "name": "Netlify",
  "description": "Deploy to Netlify",
  "type": "deployment",
  "phase": "add-on",
  "priority": 180,
  "modes": ["file-router", "code-router"],
  "integrations": [
    {
      "type": "vite-plugin",
      "import": "import netlify from '@netlify/vite-plugin-tanstack-start'",
      "code": "netlify()"
    }
  ]
}
```

### Add-Ons

Feature extensions.

| Property | Value |
|----------|-------|
| `type` | `"add-on"` |
| `phase` | `"add-on"` |
| `priority` | `26-150` |

### Examples

Demo implementations applied last (can overwrite files).

| Property | Value |
|----------|-------|
| `type` | `"example"` |
| `phase` | `"example"` |

```json
{
  "name": "TanChat",
  "description": "AI chat example",
  "type": "example",
  "phase": "example",
  "modes": ["file-router"],
  "dependsOn": ["start", "store"],
  "routes": [
    {
      "url": "/demo/chat",
      "name": "Chat",
      "icon": "MessageSquare",
      "path": "src/routes/demo.chat.tsx",
      "jsName": "ChatDemo"
    }
  ]
}
```

### Starters

Complete project templates.

| Property | Value |
|----------|-------|
| `type` | `"starter"` |

Additional required fields:
- `framework`: Framework ID (e.g., `"react-cra"`)
- `mode`: Router mode (e.g., `"file-router"`)
- `typescript`: Boolean
- `tailwind`: Boolean
- `banner`: Path to banner image

```json
{
  "name": "Blog Starter",
  "type": "starter",
  "framework": "react-cra",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "dependsOn": ["shadcn", "start"],
  "banner": ".starter/banner.png"
}
```

### Comparison Table

| Aspect | Toolchain | Host | Add-On | Example | Starter |
|--------|-----------|------|--------|---------|---------|
| type | toolchain | deployment | add-on | example | starter |
| phase | setup | add-on | add-on | example | - |
| priority | 0-10 | 170-200 | 26-150 | - | - |
| Routes | No | No | Often | Often | No |
| Integrations | No | vite-plugin | Multiple | Multiple | No |
| Applied order | First | After add-ons | Middle | Last | Template |

---

## Workflow: Creating an Add-On from Project Changes

This workflow helps you extract changes from an existing project into a reusable add-on.

### Quick Checklist

- [ ] Generate a baseline project with the same options (framework, mode, TypeScript, Tailwind)
- [ ] Identify all changed/added files compared to baseline
- [ ] Create add-on directory structure (`info.json`, `package.json`, `assets/`)
- [ ] Extract new dependencies to add-on's `package.json`
- [ ] Move/copy changed files to `assets/` preserving directory structure
- [ ] Identify integration points (providers, routes, header components)
- [ ] Convert files to `.ejs` if they need templating
- [ ] Define routes in `info.json` for any new pages
- [ ] Define integrations in `info.json` for providers/plugins
- [ ] Test with CTA CLI

### Step-by-Step Guide

#### Step 1: Generate Baseline Project

Create a fresh project with identical options to compare against:

```bash
# Generate baseline with same options as your project
npx create-tsrouter-app@latest baseline-project \
  --framework react-cra \
  --mode file-router \
  --typescript \
  --tailwind
```

#### Step 2: Identify Changes

Compare your project against the baseline:

```bash
# Find new/changed files
diff -rq baseline-project/ my-project/ | grep -v node_modules | grep -v dist

# Or use git if your project is versioned
git diff --name-only <initial-commit>
```

Categorize changes into:
- **New files**: Files that don't exist in baseline
- **Modified files**: Files that exist but have changes
- **New dependencies**: Packages added to package.json
- **Configuration changes**: Changes to vite.config, tsconfig, etc.

#### Step 3: Create Add-On Directory

```bash
mkdir -p my-addon/assets
touch my-addon/info.json
touch my-addon/package.json
```

#### Step 4: Create info.json

Start with basic metadata:

```json
{
  "name": "My Feature",
  "description": "Adds feature X to your application.",
  "type": "add-on",
  "phase": "add-on",
  "modes": ["file-router"],
  "priority": 100,
  "link": "https://your-docs.com"
}
```

#### Step 5: Extract Dependencies

Copy new dependencies from your project's `package.json`:

```json
{
  "dependencies": {
    "new-library": "^1.0.0"
  },
  "devDependencies": {
    "@types/new-library": "^1.0.0"
  }
}
```

#### Step 6: Move Files to Assets

Copy changed files preserving structure:

```bash
# Example: copying a new component
cp my-project/src/components/MyFeature.tsx my-addon/assets/src/components/

# Example: copying a new route
cp my-project/src/routes/demo.feature.tsx my-addon/assets/src/routes/
```

#### Step 7: Identify Integration Points

Look for patterns that need integration:

**Provider wrapping the app?** → Add `provider` integration
```json
{
  "integrations": [
    {
      "type": "provider",
      "jsName": "MyProvider",
      "path": "src/components/my-provider.tsx"
    }
  ]
}
```

**Header component?** → Add `header-user` integration

**Vite plugin?** → Add `vite-plugin` integration

**New route/page?** → Add to `routes` array

#### Step 8: Add EJS Templating (If Needed)

If a file needs conditional logic:

1. Rename: `MyComponent.tsx` → `MyComponent.tsx.ejs`
2. Add template logic:

```ejs
<% if (typescript) { %>
interface Props {
  value: string
}
<% } %>

export default function MyComponent(<% if (typescript) { %>{ value }: Props<% } else { %>{ value }<% } %>) {
  return <div>{value}</div>
}
```

#### Step 9: Configure Routes

Add any pages to info.json:

```json
{
  "routes": [
    {
      "url": "/demo/my-feature",
      "name": "My Feature",
      "icon": "Star",
      "path": "src/routes/demo.my-feature.tsx",
      "jsName": "MyFeatureDemo"
    }
  ]
}
```

#### Step 10: Test

Test your add-on with CTA:

```bash
# Serve add-on locally
npx serve my-addon -l 9080

# Create project with local add-on
npx create-tsrouter-app@latest test-project \
  --add-ons http://localhost:9080/info.json
```

---

## Workflow: Converting a Project to an Example

Examples showcase specific features and are applied last, allowing them to overwrite files.

### Quick Checklist

- [ ] Identify the base framework and project structure
- [ ] Compare project with `frameworks/{framework}/project/base`
- [ ] Identify all delta files (new and changed)
- [ ] Determine required add-on dependencies
- [ ] Create example directory with `info.json`
- [ ] Set `type: "example"` and `phase: "example"`
- [ ] Configure `dependsOn` array with required add-ons
- [ ] Move delta files to `assets/`
- [ ] Define demo routes and integrations
- [ ] Test with CTA CLI

### Step-by-Step Guide

#### Step 1: Understand Your Project's Base

Identify which add-ons your project uses:

```bash
# Check package.json for add-on dependencies
cat my-project/package.json | grep -E "@clerk|@tanstack/query|trpc"
```

Map dependencies to add-on IDs:
- `@clerk/react` → `clerk`
- `@tanstack/react-query` → `tanstack-query`
- `@trpc/client` → `trpc`

#### Step 2: Get Base Project Files

The base project files are in `frameworks/{framework}/project/base/`.

```bash
# List base files
ls -la frameworks/react-cra/project/base/
```

#### Step 3: Find Delta Files

Compare your project structure to identify unique files:

```bash
# Files in your project but not in base
find my-project/src -type f | sort > my-files.txt
find frameworks/react-cra/project/base/src -type f | sort > base-files.txt
comm -23 my-files.txt base-files.txt
```

Focus on:
- New components in `src/components/`
- New routes in `src/routes/`
- New utilities in `src/lib/`
- New integrations
- Modified configuration files

#### Step 4: Create Example Structure

```bash
mkdir -p my-example/assets
touch my-example/info.json
touch my-example/package.json
```

#### Step 5: Configure info.json

```json
{
  "name": "My Example",
  "description": "Demonstrates feature X with Y and Z.",
  "type": "example",
  "phase": "example",
  "modes": ["file-router"],
  "dependsOn": ["start", "tanstack-query", "clerk"],
  "routes": [
    {
      "url": "/demo/example",
      "name": "Example",
      "icon": "Sparkles",
      "path": "src/routes/demo.example.tsx",
      "jsName": "ExampleDemo"
    }
  ],
  "integrations": [
    {
      "type": "header-user",
      "jsName": "ExampleHeader",
      "path": "src/components/example-header.tsx"
    }
  ]
}
```

Key differences from add-ons:
- `type` is `"example"`
- `phase` is `"example"`
- `dependsOn` lists all required add-ons

#### Step 6: Copy Delta Files

Only copy files unique to your example:

```bash
# Copy custom components
cp -r my-project/src/components/example-* my-example/assets/src/components/

# Copy demo routes
cp my-project/src/routes/demo.example.tsx my-example/assets/src/routes/

# Copy any custom utilities
cp -r my-project/src/lib/example/ my-example/assets/src/lib/
```

#### Step 7: Add Any Additional Dependencies

If your example needs packages beyond what add-ons provide:

```json
{
  "dependencies": {
    "extra-library": "^1.0.0"
  }
}
```

#### Step 8: Configure Integrations

If your example adds header components or other integrations:

```json
{
  "integrations": [
    {
      "type": "header-user",
      "jsName": "MyExampleControls",
      "path": "src/components/example-controls.tsx"
    },
    {
      "type": "devtools",
      "jsName": "ExampleDevtools",
      "path": "src/lib/example-devtools.tsx"
    }
  ]
}
```

#### Step 9: Test

```bash
# Place in examples directory
cp -r my-example frameworks/react-cra/examples/

# Build framework
cd frameworks/react-cra && pnpm build

# Test
npx create-tsrouter-app@latest test-project \
  --example my-example
```

---

## info.json Complete Reference

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Unique identifier (auto-generated from directory name) |
| `name` | `string` | Yes | Display name shown in CLI/UI |
| `description` | `string` | Yes | Short description for selection menus |
| `author` | `string` | No | Author name/email |
| `version` | `string` | No | Semantic version |
| `link` | `string` | No | URL to documentation |
| `license` | `string` | No | License type |
| `warning` | `string` | No | Warning message shown to users |

### Type and Lifecycle

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `enum` | Yes | `"add-on"`, `"example"`, `"starter"`, `"toolchain"`, `"deployment"` |
| `phase` | `enum` | Yes* | `"setup"` or `"add-on"` (*not required for starters) |
| `priority` | `number` | No | Execution order (lower runs first) |
| `modes` | `string[]` | Yes* | `["file-router"]`, `["code-router"]`, or both (*not required for starters) |
| `default` | `boolean` | No | Enable by default |

### Routes

```json
{
  "routes": [
    {
      "url": "/path",           // Optional: URL path
      "name": "Display Name",   // Optional: Header link text
      "icon": "IconName",       // Optional: Lucide icon
      "path": "src/routes/...", // Required: File path
      "jsName": "ComponentName",// Required: Export name
      "children": []            // Optional: Nested routes
    }
  ]
}
```

### Integrations

```json
{
  "integrations": [
    {
      "type": "header-user | provider | root-provider | layout | vite-plugin | devtools",
      "jsName": "ComponentName",    // Component/function name
      "path": "src/path/to/file",   // File path
      "import": "import x from 'y'",// Alternative: import statement
      "code": "functionCall()"      // Alternative: inline code
    }
  ]
}
```

### Dependencies

| Field | Type | Description |
|-------|------|-------------|
| `dependsOn` | `string[]` | Required add-on IDs |
| `shadcnComponents` | `string[]` | Shadcn UI components to install |
| `packageAdditions` | `object` | Additional package.json entries |

```json
{
  "dependsOn": ["start", "tanstack-query"],
  "shadcnComponents": ["button", "card", "form"],
  "packageAdditions": {
    "dependencies": { "pkg": "^1.0.0" },
    "devDependencies": { "dev-pkg": "^1.0.0" },
    "scripts": { "custom": "command" }
  }
}
```

### Options

```json
{
  "options": {
    "optionName": {
      "type": "select",
      "label": "Display Label",
      "description": "Help text",
      "default": "defaultValue",
      "options": [
        { "value": "val1", "label": "Label 1" },
        { "value": "val2", "label": "Label 2" }
      ]
    }
  }
}
```

### Special Steps

| Field | Type | Description |
|-------|------|-------------|
| `addOnSpecialSteps` | `string[]` | Steps when add-on is added |
| `createSpecialSteps` | `string[]` | Steps during project creation |
| `postInitSpecialSteps` | `string[]` | Steps after initialization |
| `deletedFiles` | `string[]` | Files to remove from base project |

Available steps: `"rimraf-node-modules"`, `"post-init-script"`

### Visual Assets

| Field | Type | Description |
|-------|------|-------------|
| `smallLogo` | `string` | Path to small logo (128x128) |
| `logo` | `string` | Path to full logo |
| `banner` | `string` | Path to banner image (starters) |
| `readme` | `string` | Markdown content |

### Starter-Specific Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `framework` | `string` | Yes | Framework ID |
| `mode` | `string` | Yes | Router mode |
| `typescript` | `boolean` | Yes | TypeScript enabled |
| `tailwind` | `boolean` | Yes | Tailwind enabled |

### Command Execution

```json
{
  "command": {
    "command": "npx",
    "args": ["shadcn@latest", "init", "-y"]
  }
}
```

---

## Best Practices

### Naming Conventions

- **Add-on IDs**: Use kebab-case (`tanstack-query`, `clerk-auth`)
- **Demo routes**: Prefix with `demo.` (`demo.feature.tsx`)
- **Example components**: Prefix with `example-` (`example-header.tsx`)
- **Integration files**: Place in `src/integrations/{addon-name}/`

### File Organization

```
add-on/
├── info.json                    # Always at root
├── package.json                 # Dependencies at root
├── README.md                    # Documentation
├── small-logo.svg               # For UI display
└── assets/
    ├── src/
    │   ├── components/          # Reusable components
    │   ├── routes/              # Demo routes (demo.*.tsx)
    │   ├── integrations/        # Provider/integration components
    │   │   └── {addon-name}/
    │   └── lib/                 # Utilities
    ├── vite-plugins/            # Vite plugin files
    └── _dot_env.local.append    # Environment variables
```

### Priority Guidelines

| Range | Use Case | Examples |
|-------|----------|----------|
| 0-10 | Toolchains | ESLint (0), Biome (2) |
| 20-30 | Core libraries | Start (26), Query (25), tRPC (27) |
| 30-50 | UI foundations | Shadcn (30), Form (44) |
| 100-150 | Feature add-ons | Clerk (150), Sentry (120) |
| 170-200 | Deployment | Netlify (180), Cloudflare (200) |

### Testing Recommendations

1. **Test all modes**: Verify both `file-router` and `code-router` if supported
2. **Test with/without TypeScript**: Ensure JS output works
3. **Test with/without Tailwind**: Check styling fallbacks
4. **Test combinations**: Verify add-on works with other add-ons
5. **Test options**: Try all option combinations

### Documentation Guidelines

1. **README.md**: Include usage instructions and configuration
2. **Link field**: Point to official library documentation
3. **Description**: Be concise but informative
4. **Warning field**: Use for important setup requirements (API keys, etc.)

### Common Pitfalls

1. **Missing jsName in routes**: Required for code-router mode
2. **Forgetting .ejs extension**: Templates won't be processed
3. **Wrong phase**: Use `"setup"` only for toolchains
4. **Circular dependencies**: Use priority to resolve
5. **Missing modes**: Add-on won't appear for unsupported modes
6. **Hardcoded file extensions**: Use `<%= jsx %>` instead of `.tsx`
