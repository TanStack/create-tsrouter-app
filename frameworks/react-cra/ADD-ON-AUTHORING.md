# Add-on Authoring for the CTA Framework for React CRA

# Available Integrations

These are the available integration points for the React CRA Template System.

## header-user

Integrates into the `Header` component shared by all routes. These components are placed in the right hand side of the header bar.

The code is always integrated into the `src/components/Header.(tsx|jsx)` file.

### Examples

Code in `assets/src/components/my-header.tsx`:

```ts
export default function MyHeader() {
  return <div>Header User</div>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "header-user",
    "jsName": "MyHeader",
    "path": "src/components/my-header.tsx"
  },
]
```

## layout

Handles injecting a component into the layout of the page:

The code is integrated into these locations with these application architectures:

- `code-router` - In the `src/main.tsx` (or `src/main.jsx`) file
- `file-router` - In the `src/__root.tsx` file
- `file-router` with `start` - In the `src/main.tsx` file

### Examples

Code in `assets/src/components/my-layout.tsx`:

```ts
export default function MyLayout() {
  return <div>Hi from MyLayout!</div>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "layout",
    "jsName": "MyLayout",
    "path": "src/components/my-layout.tsx"
  },
]
```

## provider

Handles placing UI style provider wrappers into the right spot in three different applicatin setups:

The code is integrated into these locations with these application architectures:

- `code-router` - In the `src/main.tsx` (or `src/main.jsx`) file
- `file-router` - In the `src/__root.tsx` file
- `file-router` with `start` - In the `src/main.tsx` file

### Examples

Code in `assets/src/components/my-provider.tsx`:

```ts
export default function MyProvider({ children }: { children: React.ReactNode }) {
  return <SomeKindOfProvider>{children}</SomeKindOfProvider>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "provider",
    "jsName": "MyProvider",
    "path": "src/components/my-provider.tsx"
  },
]
```

## root-provider

This is a complex integration that handles both a provider component and context. The only example we have of this is the integration for TanStack Query.

The code is integrated into these locations with these application architectures:

- `code-router` - In the `src/main.tsx` (or `src/main.jsx`) file
- `file-router` - In the `src/__root.tsx` file
- `file-router` with `start` - In the `src/main.tsx` file

### Examples

Code in `assets/src/components/my-root-provider.tsx`:

```ts
export function getContext() {
  return {
    someAdditionalContext: {
      someAdditionalContextValue: "someAdditionalContextValue",
    },
  }
}

export default function MyRootProvider({ children }: { children: React.ReactNode }) {
  return <SomeKindOfProvider>{children}</SomeKindOfProvider>
}
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "root-provider",
    "jsName": "MyRootProvider",
    "path": "src/components/my-root-provider.tsx"
  },
]
```

## vite-plugin

The code is integrated into `src/vite.config.ts`

### Examples

Code in `assets/vite-plugins/netlify.ts`:

```ts
import netlify from '@netlify/vite-plugin-tanstack-start'

export default netlify()
```

Configuration in `info.json`:

```json
"integrations": [
  {
    "type": "vite-plugin",
    "jsName": "netlify",
    "path": "vite-plugins/netlify.ts"
  },
]
```

# Routes

If your add-on creates routes you need to specify those in the `info.json` file.

This example will define a route at `/demo/my-demo-route` that will be rendered by the `DemoMyDemoRoute` component. There will be a `Demo Route` link in the header to this route.

```json
"routes": [
  {
    "url": "/demo/my-demo-route",
    "name": "Demo Route",
    "path": "src/routes/demo.my-demo-route.tsx",
    "jsName": "DemoMyDemoRoute"
  }
],
```

If you don't want a header link you can omit the `url` and `name` properties.

```json
"routes": [
  {
    "path": "src/routes/demo.my-hidden-demo-route.tsx",
    "jsName": "DemoMyHiddenDemoRoute"
  }
],
```

You **MUST** specify routes in the `info.json` file if your add-on supports the `code-router` mode. This is because the `code-routers` setup needs to import the routes in order to add them to the router.

By convension you should prefix demo routes with `demo` to make it clear that they are demo routes so they can be easily identified and removed.
