# Available Commands

This document lists all available scripts and commands for managing the InvestGrade IQ monorepo.

## Development Commands

### Starting Applications
- **`pnpm dev:cit`** - `turbo run dev --filter=@investgradeiq/cit-compass`
  - Starts the CIT Compass development server
- **`pnpm dev:admin`** - `turbo run dev --filter=@investgradeiq/admin`
  - Starts the Admin app development server

### Building Applications
- **`pnpm build`** - `turbo run build`
  - Builds all applications for production
- **`pnpm check:types`** - `turbo run typecheck`
  - Runs TypeScript validation across the entire project

## Code Quality Commands

### Formatting
- **`pnpm check:format`** - `prettier --check "**/*.{ts,tsx,md,json}"`
  - Checks if files obey formatting rules without modifying them
  - Returns exit code 1 if any files need formatting
- **`pnpm fix:format`** - `prettier --write "**/*.{ts,tsx,md,json}"`
  - Automatically formats files using Prettier configuration
  - Modifies files in place to match formatting rules

### Linting
The project uses ESLint for code quality enforcement. Linting commands should be run from individual packages or apps as configured in their respective `package.json` files.

## Package Management Commands

### Cleanup Commands
- **`pnpm reset:modules`** - `rimraf node_modules pnpm-lock.yaml .turbo dist ...`
  - Removes all `node_modules` directories recursively
  - Removes `pnpm-lock.yaml` and build artifacts
  - Removes `.turbo` cache directory
  - Use when experiencing dependency issues

- **`pnpm reset:full`** - `pnpm store prune && npm run reset:modules && pnpm install`
  - Performs a complete clean and fresh installation
  - Prunes the pnpm store of unused packages
  - Removes all dependencies and reinstalls from scratch
  - Use for severe dependency corruption or major updates

### Installation
- **`pnpm install`** - Standard package installation
- **`pnpm install --frozen-lockfile`** - Install exact versions from lockfile (CI/production)

## Versioning & Release Commands

### Changesets Workflow
- **`pnpm changeset`** - `changeset`
  - Interactive tool to create a changeset for versioning packages
  - Prompts for affected packages and change type (patch/minor/major)
  - Creates markdown files in `.changeset/` directory

- **`pnpm version`** - `changeset version`
  - Bumps package versions based on pending changesets
  - Updates `CHANGELOG.md` files
  - Removes consumed changeset files
  - Should be run before merging to main branch

- **`pnpm release`** - `changeset publish`
  - Publishes packages to registry (usually skipped for internal packages)
  - Only needed for packages intended for external consumption

## Turbo Commands

### Cache Management
- **`turbo daemon status`** - Check if Turbo daemon is running
- **`turbo daemon stop`** - Stop the Turbo daemon
- **`turbo prune --scope=<app>`** - Create a pruned subset for specific app
- **`turbo clean`** - Remove all build artifacts and cache

### Running Tasks
- **`turbo run <task>`** - Run a task across all packages
- **`turbo run <task> --filter=<package>`** - Run task for specific package
- **`turbo run <task> --parallel`** - Run tasks in parallel (for independent tasks)

## Environment-Specific Commands

### Development
```bash
# Start all development servers
pnpm dev:cit
pnpm dev:admin

# Watch for changes and rebuild
pnpm dev --filter=<package>
```

### Production Build
```bash
# Clean build
pnpm reset:modules
pnpm install --frozen-lockfile
pnpm build

# Verify types
pnpm check:types
```

### CI/CD Pipeline
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run all checks
pnpm check:format
pnpm check:types
pnpm build

# Version packages (release pipeline)
pnpm version
pnpm release
```

## Troubleshooting Commands

### Common Issues
```bash
# Dependency issues
pnpm reset:full

# TypeScript issues
pnpm check:types
rm -rf dist/ && pnpm build

# Cache issues
turbo clean
pnpm reset:modules

# Lock file corruption
rm pnpm-lock.yaml
pnpm install
```

### Performance Debugging
```bash
# Analyze bundle size
turbo run build -- --analyze

# Check task execution times
turbo run build --dry-run

# Profile build performance
turbo run build --profile
```