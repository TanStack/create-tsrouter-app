# Contributing

## Setup

```bash
gh repo clone TanStack/cli
cd cli
pnpm install
pnpm build
```

## Development

```bash
pnpm dev  # Build and watch all packages
```

### Testing the CLI

Run from a **peer directory** (not inside the monorepo):

```bash
# Create an app
node ../cli/packages/cli/dist/index.js create my-app

# With specific package manager
npm_config_user_agent=pnpm node ../cli/packages/cli/dist/index.js create my-app

# With local add-on
node ../cli/packages/cli/dist/index.js create my-app --add-ons http://localhost:9080/info.json
```

### Testing Add-ons Locally

```bash
# In your add-on directory
npx serve .add-on -l 9080

# Create app with local add-on
node ../cli/packages/cli/dist/index.js create my-app --add-ons http://localhost:9080/info.json
```

### Testing Starters Locally

```bash
# In your starter directory
npx serve .starter -l 9080

# Create app with local starter
node ../cli/packages/cli/dist/index.js create my-app --starter http://localhost:9080/starter.json
```

## Dev Watch Mode

Watch framework files and auto-rebuild:

```bash
rm -rf test-app && node packages/cli/dist/index.js create \
  --dev-watch ./packages/create/src/frameworks/react \
  test-app --add-ons shadcn
```

## Developing Create UI

The UI requires running three things:

```bash
# Terminal 1: Watch mode for packages
pnpm dev

# Terminal 2: API server (from empty directory)
CTA_DISABLE_UI=true node ../cli/packages/cli/dist/index.js create --ui

# Terminal 3: React dev server
cd packages/create-ui && pnpm dev:ui
```

Navigate to `http://localhost:3000` to see the UI connected to the API at `http://localhost:8080`.

## Submitting Changes

1. Run tests: `pnpm test`
2. Run build: `pnpm build`
3. Create a PR with a clear description

## Project Structure

```
packages/
├── cli/           # @tanstack/cli - CLI commands
├── create/        # @tanstack/create - Engine + frameworks
└── create-ui/     # @tanstack/create-ui - Visual builder
```

## Useful Scripts

```bash
pnpm build          # Build all packages
pnpm test           # Run tests
pnpm dev            # Watch mode
pnpm cleanNodeModules  # Clean all node_modules
```
