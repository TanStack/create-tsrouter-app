# TanStack Application Builders (CTA) - Claude Code Assistant

## Project Overview

This monorepo contains the TanStack Application Builders (CTA - Create TanStack Application), a comprehensive tool for creating modern React and Solid applications with TanStack Router and TanStack Start.

## Quick Start

```bash
# Create a new TanStack Router app
npx create-tsrouter-app@latest my-app

# Create a new TanStack Start app (SSR)
npx create-start-app@latest my-app

# Alternative CLI names (all create TanStack Router apps)
npx create-tanstack@latest my-app
npx create-tanstack-app@latest my-app
```

## Monorepo Structure

```
create-tsrouter-app/
├── cli/                    # CLI applications
│   ├── create-start-app/   # TanStack Start CLI
│   ├── create-tanstack/    # TanStack Router CLI (alias)
│   ├── create-tanstack-app/ # TanStack Router CLI (alias)
│   └── create-tsrouter-app/ # TanStack Router CLI (main)
├── packages/               # Core packages
│   ├── cta-cli/           # CLI interface
│   ├── cta-engine/        # Core engine
│   ├── cta-ui/            # Web UI components
│   └── cta-ui-base/       # Base UI components
├── frameworks/             # Framework implementations
│   ├── react-cra/         # React CRA framework
│   └── solid/             # Solid framework
└── examples/              # Example projects and starters
```

## Core Packages

### @tanstack/cta-cli

- **Purpose**: Main CLI interface for the application builder
- **Key Dependencies**: `@clack/prompts`, `commander`, `express`, `chalk`
- **Scripts**: `build`, `dev`, `test`, `test:watch`, `test:coverage`

### @tanstack/cta-engine

- **Purpose**: Core business logic and file generation engine
- **Key Dependencies**: `ejs`, `execa`, `memfs`, `prettier`, `zod`
- **Features**: Template processing, project generation, validation

### @tanstack/cta-ui

- **Purpose**: Web interface for the application builder
- **Key Dependencies**: `react`, `tailwindcss`, `next-themes`, `sonner`
- **Scripts**: `build:ui`, `dev:ui` (React dev server)

## CLI Applications

### create-start-app

- **Purpose**: Creates TanStack Start applications (SSR)
- **Features**: Server-side rendering, React/Solid support, Vite build system
- **Usage**: `npx create-start-app@latest my-app`

### create-tsrouter-app (and aliases)

- **Purpose**: Creates TanStack Router applications (client-side routing)
- **Features**: File-based routing, TypeScript/JavaScript, React/Solid support
- **Usage**: `npx create-tsrouter-app@latest my-app`

## Framework Support

### React CRA Framework

- **Location**: `frameworks/react-cra/`
- **Add-ons**: Clerk, Shadcn, Neon, TanStack Query, tRPC, Form, Store, etc.
- **Toolchains**: Biome, ESLint + Prettier
- **Examples**: Blog starter, E-commerce starter, TanChat

### Solid Framework

- **Location**: `frameworks/solid/`
- **Add-ons**: Solid UI, TanStack Query, Form, Store, etc.
- **Toolchains**: Biome, ESLint + Prettier
- **Examples**: TanChat

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
node cli/create-tsrouter-app/dist/index.js my-app

# Test with local add-ons
node cli/create-tsrouter-app/dist/index.js my-app --add-ons http://localhost:9080/add-on.json

# Test with local starters
node cli/create-tsrouter-app/dist/index.js my-app --starter http://localhost:9080/starter.json
```

### Developing CTA UI

```bash
# Start API server
CTA_DISABLE_UI=true node cli/create-tsrouter-app/dist/index.js --ui

# Start React dev server
cd packages/cta-ui && pnpm dev:ui

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

- **Blog Starter**: TanStack Router blog with file-based routing
- **E-commerce Starter**: AI-powered chat application
- **Resume Starter**: Professional resume template
- **TanChat**: AI chat application with Claude integration

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

# Test specific framework
cd frameworks/react-cra && pnpm test

# Test with coverage
pnpm test:coverage
```

## Contributing

1. Clone: `gh repo clone TanStack/create-tsrouter-app`
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
- **Versioning**: All packages share the same version (currently 0.16.5)

## Important Files

- `package.json`: Root package configuration and workspace setup
- `pnpm-workspace.yaml`: Workspace configuration
- `nx.json`: Nx configuration for task orchestration
- `ARCHITECTURE.md`: Detailed architecture documentation
- `CONTRIBUTING.md`: Contribution guidelines

## License

MIT Licensed - see LICENSE file for details
