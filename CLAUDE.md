# TanStack CLI - Claude Code Assistant

## Project Overview

This monorepo contains the TanStack CLI (`@tanstack/cli`), a comprehensive tool for creating modern React and Solid applications with TanStack Router and TanStack Start.

## Quick Start

```bash
# Create a new TanStack app (recommended)
npx @tanstack/cli@latest create my-app

# Legacy CLI aliases (deprecated, will show warning)
npx create-tsrouter-app@latest my-app
npx create-start-app@latest my-app
npx create-tanstack@latest my-app
npx create-tanstack-app@latest my-app
```

## CLI Commands

```bash
tanstack create [project-name] [options]  # Create a new TanStack app
tanstack add [add-ons...]                 # Add add-ons to existing project
tanstack add-on init|compile              # Manage custom add-ons
tanstack starter init|compile             # Manage custom starters
tanstack mcp [--sse]                      # Start MCP server
tanstack pin-versions                     # Pin package versions
tanstack --version                        # Show version
```

## Monorepo Structure

```
cli/
├── packages/
│   ├── cli/                # @tanstack/cli - Main CLI with subcommands
│   ├── create/             # @tanstack/create - Core engine + frameworks
│   │   └── src/
│   │       └── frameworks/
│   │           ├── react-cra/  # React framework
│   │           └── solid/      # Solid framework
│   └── create-ui/          # @tanstack/create-ui - Web UI components
├── cli-aliases/            # Deprecated thin wrapper CLIs
│   ├── create-tsrouter-app/
│   ├── create-start-app/
│   ├── create-tanstack/
│   ├── create-tanstack-app/
│   └── ts-create-start/
└── examples/               # Example projects and custom CLIs
```

## Core Packages

### @tanstack/cli

- **Purpose**: Main CLI interface with subcommands
- **Binary**: `tanstack`
- **Key Dependencies**: `@clack/prompts`, `commander`, `express`, `chalk`
- **Features**: `create`, `add`, `add-on`, `starter`, `mcp`, `pin-versions` subcommands

### @tanstack/create

- **Purpose**: Core engine, frameworks, add-ons, and starters
- **Key Dependencies**: `ejs`, `execa`, `memfs`, `prettier`, `zod`
- **Features**: Template processing, project generation, validation
- **Contains**: React and Solid frameworks with all add-ons

### @tanstack/create-ui

- **Purpose**: Web interface for the application builder
- **Key Dependencies**: `react`, `tailwindcss`, `next-themes`, `sonner`
- **Scripts**: `build:ui`, `dev:ui` (React dev server)

## Development Scripts

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode (watch all packages)
pnpm dev

# Run tests
pnpm test

# Clean node_modules
pnpm cleanNodeModules
```

## Key Development Commands

### Building Example Apps

```bash
# Build with CLI (outside monorepo)
node packages/cli/dist/index.js create my-app

# Test with local add-ons
node packages/cli/dist/index.js create my-app --add-ons http://localhost:9080/add-on.json

# Test with local starters
node packages/cli/dist/index.js create my-app --starter http://localhost:9080/starter.json
```

### Developing Create UI

```bash
# Start API server
CTA_DISABLE_UI=true node packages/cli/dist/index.js create --ui

# Start React dev server
cd packages/create-ui && pnpm dev:ui

# Run monorepo in watch mode
pnpm dev
```

## Add-ons and Starters

### Popular Add-ons

- **Clerk**: Authentication integration
- **Shadcn**: UI component library
- **Neon**: PostgreSQL database integration
- **TanStack Query**: Data fetching
- **tRPC**: Type-safe APIs
- **Form**: Form handling
- **Store**: State management

### Example Starters

- **Events**: Conference/events website
- **Resume**: Professional resume template

## EJS Template Variables

The system uses EJS templates with these variables:

- `packageManager`: npm, yarn, pnpm, bun, deno
- `projectName`: Project name
- `typescript`: TypeScript enabled
- `tailwind`: Tailwind CSS enabled
- `fileRouter`: File-based routing
- `codeRouter`: Code-based routing
- `addOnEnabled`: Enabled add-ons object
- `addOns`: Array of enabled add-ons
- `routes`: Array of routes from add-ons

## Testing

```bash
# Run all tests
pnpm test

# Test specific package
cd packages/create && pnpm test

# Test with coverage
pnpm test:coverage
```

## Contributing

1. Clone: `gh repo clone TanStack/cli`
2. Install: `pnpm install`
3. Build: `pnpm build`
4. Develop: `pnpm dev`
5. Test: `pnpm test`

## Architecture Notes

- **Monorepo**: Uses pnpm workspaces and Nx for task orchestration
- **Package Manager**: Requires pnpm@9.15.5
- **Node Version**: Requires Node.js (see .nvmrc if available)
- **Build System**: TypeScript compilation, Vite for UI
- **Testing**: Vitest for unit tests, ESLint for linting

## Important Files

- `package.json`: Root package configuration and workspace setup
- `pnpm-workspace.yaml`: Workspace configuration
- `nx.json`: Nx configuration for task orchestration
- `ARCHITECTURE.md`: Detailed architecture documentation
- `CONTRIBUTING.md`: Contribution guidelines

## License

MIT Licensed - see LICENSE file for details
