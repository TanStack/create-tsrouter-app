# TanStack Application Builders

This monorepo contains the code for the TanStack Application Builders.

# How to Use

There are two ways to create apps with TSRouter: CLI and UI.

## Build a TanStack App with the CTA CLI

In your terminal, run the following command and walk through a series of options to create a Tanstack application:

```bash
npx create-tsrouter-app@latest
```

## Build a TanStack App with the CTA UI

You can use the UI to visually roll your own app locally as well. The CTA UI provides both a web server and a React app. You need to run the CLI in "API" model and then the React app in dev mode.

### 1. Start the API Server in Dev Mode

Run the CLI in empty directory in app creation mode:

```bash
CTA_DISABLE_UI=true node ../create-tsrouter-app/cli/create-tsrouter-app/dist/index.js --ui
```

If this is working you will see the following output:

```
Create TanStack API is running on http://localhost:8080
```

Note that it say "Create TanStack **API**" and not "Create TanStack **App**". This is important. This means that the CLI is providing API endpoints, but **not** serving the static build files of the React app.

### 2. Start the React App

With the API server running, open a separate terminal in your root directory (**create-tsrouter-app**) and start the React app in dev mode:

```bash
cd packages/cta-ui
pnpm dev:ui
```

Navigate to `http://localhost:3000` and see the React app connected to the API server on `http://localhost:8080`.

# How to Contribute

For more information on how to contribute to the project, please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
