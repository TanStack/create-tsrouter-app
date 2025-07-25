# Routes and Integrations in CTA Engine

This document explains how the routes and integrations systems work in the Create TanStack Application (CTA) engine. These two concepts are fundamental to how add-ons extend and enhance generated applications.

## Table of Contents

1. [Overview](#overview)
2. [Routes System](#routes-system)
3. [Integrations System](#integrations-system)
4. [Implementation Details](#implementation-details)
5. [Add-on Examples](#add-on-examples)
6. [Creating Custom Add-ons](#creating-custom-add-ons)

## Overview

The CTA engine uses two primary mechanisms for add-ons to extend applications:

- **Routes**: Demo pages and API endpoints that showcase add-on functionality
- **Integrations**: Components and providers that integrate into the application's structure

Both systems work together to provide a seamless way for add-ons to enhance applications without manual configuration.

## Routes System

### What are Routes?

Routes are demo pages or API endpoints that add-ons provide to showcase their functionality. They are automatically registered with the TanStack Router when an add-on is selected during app creation.

### Route Structure

Routes are defined in an add-on's `info.json` file:

```json
{
  "routes": [
    {
      "url": "/demo/tanstack-query",
      "name": "TanStack Query",
      "path": "src/routes/demo.tanstack-query.tsx",
      "jsName": "TanStackQueryDemo"
    }
  ]
}
```

#### Route Properties

- **url** (optional): The URL path where the route will be accessible
- **name** (optional): Display name for navigation links
- **path**: File path relative to the add-on's assets directory
- **jsName**: JavaScript/TypeScript identifier used when importing the route

### How Routes are Processed

1. **Collection Phase**: During app generation, the template engine collects all routes from selected add-ons:

```typescript
// From template-file.ts
const routes: Array<Required<AddOn>['routes'][number]> = []
for (const addOn of options.chosenAddOns) {
  if (addOn.routes) {
    routes.push(...addOn.routes)
  }
}
```

2. **Template Processing**: Routes are made available to EJS templates via the `routes` variable

3. **Router Integration**: Routes are integrated differently based on the routing mode:

#### Code Router Mode

In code router mode, routes are imported and registered directly in `main.tsx`:

```typescript
// Import route components
<% for(const route of routes) { %>
import <%= route.jsName %> from "<%= relativePath(route.path) %>";
<% } %>

// Register routes with the router
const routeTree = rootRoute.addChildren([
  indexRoute<%= routes.map(route => `, ${route.jsName}(rootRoute)`).join('') %>
]);
```

#### File Router Mode

In file router mode, route files are copied to the appropriate location in the routes directory, and the TanStack Router file-based routing system automatically discovers them.

### Route File Format

Route files use the TanStack Router format and are automatically templatized to work in both routing modes:

```typescript
// Original route file
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/my-feature')({
  component: MyFeatureDemo,
})

// After templatization (EJS)
import { <% if (fileRouter) { %>createFileRoute<% } else { %>createRoute<% } %> } from '@tanstack/react-router'

<% if (codeRouter) { %>
import type { RootRoute } from '@tanstack/react-router'

export default (parentRoute: RootRoute) => createRoute({
  path: '/demo/my-feature',
  component: MyFeatureDemo,
  getParentRoute: () => parentRoute,
})
<% } else { %>
export const Route = createFileRoute('/demo/my-feature')({
  component: MyFeatureDemo,
})
<% } %>
```

## Integrations System

### What are Integrations?

Integrations are components and providers that need to be injected into specific locations within the application structure. They allow add-ons to wrap the application with providers, add layout components, or inject UI elements into the header.

### Integration Types

The CTA engine supports four types of integrations:

#### 1. Provider Integration

Wraps the application or router with a context provider:

```json
{
  "type": "provider",
  "jsName": "ClerkProvider",
  "path": "src/integrations/clerk/provider.tsx"
}
```

Providers are rendered in the root layout, wrapping the router outlet:

```tsx
<% for(const integration of integrations.filter(i => i.type === 'provider')) { %>
  <<%= integration.jsName %>>
<% } %>
    <Outlet />
<% for(const integration of integrations.filter(i => i.type === 'provider').reverse()) { %>
  </<%= integration.jsName %>>
<% } %>
```

#### 2. Root Provider Integration

Special providers that wrap the entire application and provide context to the router:

```json
{
  "type": "root-provider",
  "path": "src/integrations/tanstack-query/root-provider.tsx",
  "jsName": "TanStackQueryProvider"
}
```

Root providers must export:
- `Provider`: React component that wraps the app
- `getContext()`: Function that returns context for the router

```tsx
// Import root providers
<% for(const integration of integrations.filter(i => i.type === 'root-provider')) { %>
import * as <%= integration.jsName %> from "<%= relativePath(integration.path) %>";
<% } %>

// Add context to router
const router = createRouter({
  routeTree,
  context: {
    <% for(const integration of integrations.filter(i => i.type === 'root-provider')) { %>
      ...<%= integration.jsName %>.getContext(),
    <% } %>
  },
})

// Wrap the application
<% for(const integration of integrations.filter(i => i.type === 'root-provider')) { %>
  <<%= integration.jsName %>.Provider>
<% } %>
    <RouterProvider router={router} />
<% for(const integration of integrations.filter(i => i.type === 'root-provider').reverse()) { %>
  </<%= integration.jsName %>.Provider>
<% } %>
```

#### 3. Layout Integration

Components that are rendered alongside the router outlet (e.g., devtools):

```json
{
  "type": "layout",
  "path": "src/integrations/tanstack-query/layout.tsx",
  "jsName": "TanStackQueryLayout"
}
```

Layout components are rendered after the outlet:

```tsx
<Outlet />
<% for(const integration of integrations.filter(i => i.type === 'layout')) { %>
  <<%= integration.jsName %> />
<% } %>
```

#### 4. Header User Integration

Components that are injected into the application header (e.g., user menus):

```json
{
  "type": "header-user",
  "jsName": "ClerkHeader",
  "path": "src/integrations/clerk/header-user.tsx"
}
```

Header user components are rendered in the header component:

```tsx
<% if (integrations.filter(i => i.type === 'header-user').length > 0) { %>
  <div>
    <% for(const integration of integrations.filter(i => i.type === 'header-user')) { %>
      <<%= integration.jsName %> />
    <% } %>
  </div>
<% } %>
```

## Implementation Details

### Type Definitions

The TypeScript types for routes and integrations are defined in `types.ts`:

```typescript
// Integration type definition
export const IntegrationSchema = z.object({
  type: z.string(),
  path: z.string(),
  jsName: z.string(),
})

// Add-on schema includes both routes and integrations
export const AddOnInfoSchema = AddOnBaseSchema.extend({
  routes: z.array(
    z.object({
      url: z.string().optional(),
      name: z.string().optional(),
      path: z.string(),
      jsName: z.string(),
    }),
  ).optional(),
  integrations: z.array(IntegrationSchema).optional(),
  // ... other properties
})
```

### Template Processing

The template engine (`template-file.ts`) makes routes and integrations available to all EJS templates:

```typescript
// Collect integrations from all add-ons
const integrations: Array<Required<AddOn>['integrations'][number]> = []
for (const addOn of options.chosenAddOns) {
  if (addOn.integrations) {
    for (const integration of addOn.integrations) {
      integrations.push(integration)
    }
  }
}

// Collect routes from all add-ons
const routes: Array<Required<AddOn>['routes'][number]> = []
for (const addOn of options.chosenAddOns) {
  if (addOn.routes) {
    routes.push(...addOn.routes)
  }
}

// Make available to templates
const templateValues = {
  // ... other values
  integrations,
  routes,
  // ... other values
}
```

### Navigation Generation

The Header component automatically generates navigation links for all routes that have both `url` and `name` properties:

```tsx
<% for(const addOn of addOns) {
  for(const route of (addOn?.routes||[])?.filter(r => r.url && r.name)) { %>
    <div className="px-2 font-bold">
      <Link to="<%= route.url %>"><%= route.name %></Link>
    </div>
<% } } %>
```

## Add-on Examples

### TanStack Query Add-on

This add-on demonstrates both routes and integrations:

```json
{
  "name": "Query",
  "description": "Integrate TanStack Query into your application.",
  "routes": [
    {
      "url": "/demo/tanstack-query",
      "name": "TanStack Query",
      "path": "src/routes/demo.tanstack-query.tsx",
      "jsName": "TanStackQueryDemo"
    }
  ],
  "integrations": [
    {
      "type": "root-provider",
      "path": "src/integrations/tanstack-query/root-provider.tsx",
      "jsName": "TanStackQueryProvider"
    },
    {
      "type": "layout",
      "path": "src/integrations/tanstack-query/layout.tsx",
      "jsName": "TanStackQueryLayout"
    }
  ]
}
```

### Clerk Authentication Add-on

This add-on uses provider and header integrations:

```json
{
  "name": "Clerk",
  "description": "Add Clerk authentication to your application.",
  "routes": [
    {
      "url": "/demo/clerk",
      "name": "Clerk",
      "path": "src/routes/demo.clerk.tsx",
      "jsName": "ClerkDemo"
    }
  ],
  "integrations": [
    {
      "type": "header-user",
      "jsName": "ClerkHeader",
      "path": "src/integrations/clerk/header-user.tsx"
    },
    {
      "type": "provider",
      "jsName": "ClerkProvider",
      "path": "src/integrations/clerk/provider.tsx"
    }
  ]
}
```

## Creating Custom Add-ons

### Best Practices for Routes

1. **Naming Convention**: Use descriptive names prefixed with `demo.` for demo routes
2. **Path Structure**: Place route files in `assets/src/routes/`
3. **Component Naming**: Use PascalCase for `jsName` (e.g., `MyFeatureDemo`)
4. **URL Pattern**: Use `/demo/feature-name` for demo routes

### Best Practices for Integrations

1. **Provider Integrations**:
   - Use for wrapping parts of the app with context
   - Keep providers focused on a single concern
   - Don't add UI elements in providers

2. **Root Provider Integrations**:
   - Use when you need to provide context to the router
   - Always export both `Provider` and `getContext()`
   - Initialize any required clients or stores

3. **Layout Integrations**:
   - Use for developer tools or persistent UI elements
   - Keep layout components lightweight
   - Position them appropriately (devtools, tooltips, etc.)

4. **Header User Integrations**:
   - Use for user-specific UI in the header
   - Keep components small and focused
   - Consider responsive design

### File Structure

Organize your add-on files consistently:

```
my-addon/
├── info.json
├── package.json
├── assets/
│   ├── src/
│   │   ├── routes/
│   │   │   └── demo.my-feature.tsx
│   │   └── integrations/
│   │       └── my-feature/
│   │           ├── provider.tsx
│   │           └── layout.tsx
│   └── _dot_env.local.append
```

### Testing Your Add-on

1. Create a test project with your add-on
2. Verify routes appear in navigation
3. Check that integrations are properly injected
4. Test in both file-router and code-router modes
5. Ensure TypeScript types work correctly

### Integration Dependencies

If your integrations depend on other add-ons, use the `dependsOn` field:

```json
{
  "dependsOn": ["tanstack-query", "start"]
}
```

This ensures required add-ons are included when your add-on is selected.