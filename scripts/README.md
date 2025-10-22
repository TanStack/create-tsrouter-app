# Scripts

## generate-checksums.js

This script generates checksums for the `react-cra` and `solid` frameworks to ensure version bumps when content changes.

### Purpose

The checksum system ensures that when any files in the following directories change, the framework package will have a different build output, triggering proper version bumping:

- `add-ons/`
- `examples/`
- `hosts/`
- `project/`
- `toolchains/`

### How It Works

1. The script recursively scans all files in the specified directories
2. Calculates a SHA-256 hash of all file contents and paths
3. Generates `src/checksum.ts` in each framework with the exported checksum value
4. The checksum is exported from `src/index.ts` and included in the built output

### Integration

The checksum generation runs automatically before each build via the `prebuild` script in:

- `frameworks/react-cra/package.json`
- `frameworks/solid/package.json`

When running `pnpm build` at the root level, the checksums are automatically regenerated for both frameworks before TypeScript compilation.

### Generated Files

- `frameworks/react-cra/src/checksum.ts`
- `frameworks/solid/src/checksum.ts`

**Note:** These generated files should be committed to git as they are part of the package's public API and need to be tracked for proper version management.
