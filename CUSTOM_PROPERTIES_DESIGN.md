# Custom Properties Design for CTA Framework

## Overview

This document outlines the design for replacing the hardcoded routes and integrations system with a generic `customProperties` approach using Zod schemas. This will allow framework definitions to declare their own custom properties that can be added to add-ons, providing a more flexible and extensible system.

## Current System Analysis

### Current Implementation
- **Routes**: Hardcoded array of route objects in `AddOnBaseSchema`
- **Integrations**: Hardcoded array of integration objects in `AddOnInfoSchema`
- **Template Processing**: Direct access to `routes` and `integrations` arrays in templates
- **Type Safety**: Fixed TypeScript types for routes and integrations

### Limitations
1. Framework-specific concepts (routes/integrations) are baked into the core engine
2. No flexibility for frameworks to define their own custom properties
3. All frameworks must use the same structure for routes and integrations
4. Cannot easily add new property types without modifying core engine

## Proposed Design

### Core Concept

Replace hardcoded `routes` and `integrations` with a generic `customProperties` system where:
1. Frameworks define their own custom property schemas using Zod
2. Add-ons provide values matching these schemas
3. Templates access properties through a unified interface
4. Type safety is maintained through Zod inference

### Framework Definition Structure

```typescript
// Example: React framework definition
export function createFrameworkDefinition(): FrameworkDefinition {
  return {
    id: 'react-cra',
    name: 'React',
    customProperties: {
      routes: z.array(
        z.object({
          url: z.string().optional(),
          name: z.string().optional(),
          path: z.string(),
          jsName: z.string(),
        })
      ).optional(),
      integrations: z.array(
        z.object({
          type: z.enum(['provider', 'root-provider', 'layout', 'header-user']),
          path: z.string(),
          jsName: z.string(),
        })
      ).optional(),
    },
    // ... rest of definition
  }
}
```

### Type Updates

```typescript
// packages/cta-engine/src/types.ts

import type { ZodTypeAny } from 'zod'

// Update FrameworkDefinition to include customProperties
export type FrameworkDefinition = {
  id: string
  name: string
  description: string
  version: string
  
  // New field for custom property schemas
  customProperties?: Record<string, ZodTypeAny>
  
  base: Record<string, string>
  addOns: Array<AddOn>
  basePackageJSON: Record<string, any>
  optionalPackages: Record<string, any>
  
  supportedModes: Record<
    string,
    {
      displayName: string
      description: string
      forceTypescript: boolean
    }
  >
}

// Remove routes from AddOnBaseSchema
export const AddOnBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  author: z.string().optional(),
  version: z.string().optional(),
  link: z.string().optional(),
  license: z.string().optional(),
  warning: z.string().optional(),
  type: z.enum(['add-on', 'example', 'starter', 'toolchain']),
  command: z
    .object({
      command: z.string(),
      args: z.array(z.string()).optional(),
    })
    .optional(),
  // Remove routes - it will be in customProperties
  packageAdditions: z
    .object({
      dependencies: z.record(z.string(), z.string()).optional(),
      devDependencies: z.record(z.string(), z.string()).optional(),
      scripts: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  shadcnComponents: z.array(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
  smallLogo: z.string().optional(),
  logo: z.string().optional(),
  addOnSpecialSteps: z.array(z.string()).optional(),
  createSpecialSteps: z.array(z.string()).optional(),
})

// Update AddOnInfoSchema to remove integrations
export const AddOnInfoSchema = AddOnBaseSchema.extend({
  modes: z.array(z.string()),
  phase: z.enum(['setup', 'add-on']),
  readme: z.string().optional(),
  // Add customProperties field
  customProperties: z.record(z.string(), z.unknown()).optional(),
})

// Remove the separate Integration schema as it will be framework-specific
// export const IntegrationSchema = z.object({...}) - REMOVE
```

### Add-on Loading and Validation

```typescript
// packages/cta-engine/src/add-on-loader.ts

export async function loadAddOn(
  addOnPath: string,
  framework: Framework
): Promise<AddOn> {
  const info = await loadAddOnInfo(addOnPath)
  
  // Validate custom properties against framework schema
  if (framework.customProperties && info.customProperties) {
    const validatedProperties: Record<string, unknown> = {}
    
    for (const [key, schema] of Object.entries(framework.customProperties)) {
      if (key in info.customProperties) {
        try {
          validatedProperties[key] = schema.parse(info.customProperties[key])
        } catch (error) {
          throw new Error(
            `Invalid custom property "${key}" in add-on "${info.id}": ${error.message}`
          )
        }
      }
    }
    
    info.customProperties = validatedProperties
  }
  
  return {
    ...info,
    getFiles,
    getFileContents,
    getDeletedFiles,
  }
}
```

### Template Processing Updates

```typescript
// packages/cta-engine/src/template-file.ts

export function createTemplateFile(environment: Environment, options: Options) {
  // Collect all custom properties from add-ons
  const customProperties: Record<string, Array<unknown>> = {}
  
  // Initialize arrays for all framework custom properties
  if (options.framework.customProperties) {
    for (const key of Object.keys(options.framework.customProperties)) {
      customProperties[key] = []
    }
  }
  
  // Collect custom properties from each add-on
  for (const addOn of options.chosenAddOns) {
    if (addOn.customProperties) {
      for (const [key, values] of Object.entries(addOn.customProperties)) {
        if (customProperties[key] && Array.isArray(values)) {
          customProperties[key].push(...values)
        } else if (customProperties[key] && !Array.isArray(values)) {
          customProperties[key].push(values)
        }
      }
    }
  }
  
  return async function templateFile(file: string, content: string) {
    const templateValues = {
      // ... existing values
      packageManager: options.packageManager,
      projectName: options.projectName,
      typescript: options.typescript,
      tailwind: options.tailwind,
      js: options.typescript ? 'ts' : 'js',
      jsx: options.typescript ? 'tsx' : 'jsx',
      fileRouter: options.mode === 'file-router',
      codeRouter: options.mode === 'code-router',
      addOnEnabled,
      addOns: options.chosenAddOns,
      
      // Add custom properties dynamically
      ...customProperties,
      
      // Helper functions
      getPackageManagerAddScript,
      getPackageManagerRunScript,
      relativePath: (path: string) => relativePath(file, path),
      ignoreFile: () => {
        throw new IgnoreFileError()
      },
    }
    
    // ... rest of template processing
  }
}
```

## Implementation Plan

### 1. Core Engine Updates
- [ ] Add `customProperties` to `FrameworkDefinition` type
- [ ] Remove `routes` from `AddOnBaseSchema`
- [ ] Remove `integrations` and `IntegrationSchema` from types
- [ ] Add `customProperties` field to `AddOnInfoSchema`
- [ ] Update add-on loader to validate custom properties
- [ ] Update template processor to expose custom properties

### 2. Framework Updates
- [ ] Update React framework to define routes/integrations schemas
- [ ] Update Solid framework similarly
- [ ] Update all framework templates to use customProperties

### 3. Add-on Updates
- [ ] Update all add-on info.json files to use customProperties
- [ ] Update add-on documentation
- [ ] Remove routes/integrations from root level

### 4. Template Updates
- [ ] Update all EJS templates to access properties from customProperties
- [ ] Update navigation generation to use customProperties.routes
- [ ] Update integration rendering to use customProperties.integrations

## Benefits

1. **Extensibility**: Frameworks can define any custom properties they need
2. **Type Safety**: Zod schemas provide runtime validation and TypeScript types
3. **Flexibility**: Different frameworks can have different property structures
4. **Future-Proof**: New property types can be added without core engine changes
5. **Framework-Specific**: Each framework can have its own domain-specific concepts
6. **Clean Architecture**: No framework-specific concepts in core engine

## Example: Framework-Specific Properties

### React Framework
```typescript
customProperties: {
  routes: z.array(
    z.object({
      url: z.string().optional(),
      name: z.string().optional(),
      path: z.string(),
      jsName: z.string(),
    })
  ).optional(),
  integrations: z.array(
    z.object({
      type: z.enum(['provider', 'root-provider', 'layout', 'header-user']),
      path: z.string(),
      jsName: z.string(),
    })
  ).optional(),
  contextProviders: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      wrapperComponent: z.string(),
    })
  ).optional(),
  hooks: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      category: z.enum(['state', 'effect', 'context', 'custom']),
    })
  ).optional(),
}
```

### Solid Framework
```typescript
customProperties: {
  routes: z.array(
    z.object({
      url: z.string().optional(),
      name: z.string().optional(),
      path: z.string(),
      jsName: z.string(),
    })
  ).optional(),
  integrations: z.array(
    z.object({
      type: z.enum(['provider', 'root-provider', 'layout', 'header-user']),
      path: z.string(),
      jsName: z.string(),
    })
  ).optional(),
  signals: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      global: z.boolean(),
    })
  ).optional(),
  stores: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      type: z.enum(['store', 'mutable']),
    })
  ).optional(),
}
```

### Vue Framework (hypothetical)
```typescript
customProperties: {
  routes: z.array(
    z.object({
      url: z.string().optional(),
      name: z.string().optional(),
      path: z.string(),
      jsName: z.string(),
    })
  ).optional(),
  components: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      global: z.boolean(),
    })
  ).optional(),
  composables: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      autoImport: z.boolean(),
    })
  ).optional(),
  plugins: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      options: z.record(z.string(), z.unknown()).optional(),
    })
  ).optional(),
}
```

## Add-on info.json Structure

### Before
```json
{
  "id": "tanstack-query",
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
    }
  ]
}
```

### After
```json
{
  "id": "tanstack-query",
  "name": "Query",
  "description": "Integrate TanStack Query into your application.",
  "customProperties": {
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
      }
    ]
  }
}
```

## Template Access Pattern

### Before
```ejs
<% for(const route of routes) { %>
  <Link to="<%= route.url %>"><%= route.name %></Link>
<% } %>

<% for(const integration of integrations.filter(i => i.type === 'provider')) { %>
  <<%= integration.jsName %>>
<% } %>
```

### After
```ejs
<% for(const route of routes) { %>
  <Link to="<%= route.url %>"><%= route.name %></Link>
<% } %>

<% for(const integration of integrations.filter(i => i.type === 'provider')) { %>
  <<%= integration.jsName %>>
<% } %>
```

The template access remains the same because `customProperties` are spread into the template values, making `routes` and `integrations` available at the top level.

## Testing Strategy

1. **Unit Tests**: Test custom property validation and merging
2. **Integration Tests**: Test full app generation with custom properties
3. **Framework Tests**: Test each framework's custom properties
4. **Template Tests**: Verify templates render correctly with new system
5. **Add-on Tests**: Test all add-ons work with new structure

## Conclusion

The custom properties system provides a flexible, type-safe way for frameworks to extend the add-on system with their own domain-specific concepts. By removing hardcoded framework-specific properties from the core engine, we create a truly extensible system that can adapt to any framework's needs.