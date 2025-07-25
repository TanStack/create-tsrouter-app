# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build Commands
```bash
# Build all packages (runs in parallel)
pnpm build

# Run development mode with watch (builds everything in watch mode)
pnpm dev

# Clean all node_modules
pnpm cleanNodeModules
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific framework tests
cd frameworks/react-cra && pnpm test
cd frameworks/solid && pnpm test

# Test coverage in packages
cd packages/cta-engine && pnpm test:coverage
```

### Development Workflow
```bash
# 1. Install dependencies
pnpm install

# 2. Build everything
pnpm build

# 3. Create a test application (from outside the monorepo)
node [path-to-repo]/cli/create-tsrouter-app/dist/index.js my-app

# 4. Run in development mode
pnpm dev
```

### Publishing (CI Only)
```bash
pnpm cipublish
```

## Architecture

This is a monorepo for TanStack application builders, using pnpm workspaces and Nx for orchestration.

### Key Concepts

- **CTA (Create TanStack Application)**: The core system for creating TanStack applications
- **Frameworks**: Technology-specific implementations (React, Solid, etc.)
- **Add-ons**: Plugins that extend application capabilities (e.g., tanstack-query, clerk, sentry)
- **Starters**: Pre-configured application templates with modern defaults
- **Code Router vs File Router**: Two routing modes - code-based or file-based routing

### Project Structure

- **cli/**: CLI applications (create-tsrouter-app, create-tanstack, create-start-app)
  - Each CLI delegates to @tanstack/cta-cli for core functionality
  
- **packages/**: Core packages
  - **cta-cli**: Command line interface logic
  - **cta-engine**: Core engine for app generation and modification
  - **cta-ui**: Web UI for interactive app creation
  - **cta-ui-base**: Shared UI components
  
- **frameworks/**: Framework implementations
  - **react-cra**: React framework support
  - **solid**: Solid framework support
  - Each contains add-ons, toolchains, and project templates

### Template System

Uses EJS templating with these key variables:
- `typescript`, `tailwind`: Boolean flags
- `js`, `jsx`: File extensions based on TypeScript setting
- `fileRouter`, `codeRouter`: Routing mode flags
- `addOnEnabled`: Object of enabled add-ons
- `packageManager`: npm, yarn, or pnpm

### Add-on System

Add-ons modify the generated application by:
1. Adding dependencies via package.json
2. Copying asset files
3. Providing demo routes
4. Integrating with the build system

Custom add-ons can be created as JSON files and loaded via URL.

### Testing Add-ons and Starters

```bash
# Serve add-on/starter locally
npx static-server

# Test add-on
node [repo]/cli/create-tsrouter-app/dist/index.js app-test --add-ons http://localhost:9080/add-on.json

# Test starter
node [repo]/cli/create-tsrouter-app/dist/index.js app-test --starter http://localhost:9080/starter.json
```

### UI Development

The UI runs as both a web server and React app:

```bash
# 1. Start API server (from empty directory)
CTA_DISABLE_UI=true node ../create-tsrouter-app/cli/create-tsrouter-app/dist/index.js --ui

# 2. Start React dev server
cd packages/cta-ui && pnpm dev:ui

# 3. Run monorepo in watch mode
pnpm dev
```

## Key Implementation Details

- All workspace dependencies use `workspace:*` protocol
- EJS templates use special naming: `_dot_` prefix becomes `.` in output
- Add-ons can provide demo routes that integrate with the router
- The engine uses memfs for virtual file system operations during generation
- Special steps system handles post-generation tasks (e.g., shadcn setup)