# Package Versioning & Release Management

This monorepo uses **[Changesets](https://github.com/changesets/changesets)** for semantic versioning and coordinated releases across packages. This document outlines the complete workflow for managing package versions and releases.

## Package Structure

### Versioned Packages (Tracked by Changesets)
These packages require changesets for version management:

- **`@repo/ui`** - Atomic design system components (Button, Input, Card)
- **`@repo/components`** - Complex business widgets (Sidebar, ProfileWidget)

### Auto-Tracked Dependencies
These packages are automatically versioned when UI packages depend on them:

- **`@repo/eslint-config`** - ESLint configuration (dependency of UI packages)
- **`@repo/typescript-config`** - TypeScript configuration (dependency of UI packages)
- **`@repo/prettier-config`** - Prettier configuration (dependency of UI packages)

### Non-Versioned Packages (Ignored by Changesets)
These packages are consumed directly and don't require formal versioning:

- **`@repo/utils`** - Shared utilities and hooks
- **`@repo/types`** - Shared TypeScript types
- **Apps** - Consumer applications (admin, cit-compass)

## Changesets Workflow

### 1. Making Changes

When you make changes to **UI or Components packages**, you must create a changeset to document the changes and determine the version bump.

```bash
pnpm changeset
```

This command launches an interactive prompt:

```
🦋 Which packages would you like to include?
 ✓ @repo/ui
 ○ @repo/components

🦋 What kind of change is this for @repo/ui?
  ○ patch   - Bug fix (0.1.0 → 0.1.1)
  ○ minor   - New feature (0.1.0 → 0.2.0)  
  ● major   - Breaking change (0.1.0 → 1.0.0)

🦋 Please enter a summary:
> Add new Button variant and remove deprecated size prop
```

### 2. Understanding Version Types

Choose the appropriate version bump:

#### Patch (0.1.0 → 0.1.1)
- Bug fixes
- Documentation updates  
- Internal refactoring with no API changes
- Performance improvements

#### Minor (0.1.0 → 0.2.0)
- New features
- New component variants
- New props (with default values)
- Backward-compatible API additions

#### Major (0.1.0 → 1.0.0)
- Breaking changes
- Removing or renaming props
- Changing default behavior
- Removing components or APIs

### 3. Changeset File Creation

The tool creates a markdown file in `.changeset/` directory:

```markdown
<!-- .changeset/brave-lions-dance.md -->
---
"@repo/ui": major
---

Add new Button variant and remove deprecated size prop

BREAKING CHANGE: The `size` prop has been removed. Use `variant="sm" | "lg"` instead.

Migration:
- Replace `size="small"` with `variant="sm"`
- Replace `size="large"` with `variant="lg"`
```

### 4. Commit the Changeset

Commit the changeset file along with your changes:

```bash
git add .
git commit -m "feat: add new Button variant and remove deprecated size prop"
```

## Release Process

### 1. Version Packages

When ready to release, run the version command to consume all pending changesets:

```bash
pnpm version
```

This command:
- Bumps package versions based on changesets
- Updates `CHANGELOG.md` files
- Removes consumed changeset files
- Updates dependencies that depend on versioned packages

### 2. Review Version Changes

Check the generated changes:

```bash
git diff
```

You should see:
- Updated `package.json` versions
- New entries in `CHANGELOG.md` files
- Deleted changeset files

### 3. Commit Version Changes

```bash
git add .
git commit -m "Version Packages"
```

### 4. Publish Packages (Optional)

For packages that need to be published to npm:

```bash
pnpm release
```

**Note**: For internal monorepo packages, this step is usually skipped since packages are consumed directly from the workspace.

## Best Practices

### Writing Good Changesets

#### ✅ Good Changeset Descriptions
```markdown
---
"@repo/ui": minor
---

Add loading state support to Button component

- Add `loading` prop to show spinner and disable interaction
- Add `loadingText` prop for custom loading text
- Maintain existing button styling during loading state
```

#### ❌ Poor Changeset Descriptions
```markdown
---
"@repo/ui": minor  
---

Button updates
```

### Semantic Versioning Guidelines

#### For UI Components
```typescript
// Minor: Adding optional props
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean; // ← New optional prop (MINOR)
}

// Major: Changing required props or removing props
interface ButtonProps {
  // variant: "primary" | "secondary";  ← Removed (MAJOR)
  type: "button" | "submit"; // ← Now required (MAJOR)
  size?: "sm" | "md" | "lg";
}
```

#### For API Changes
```typescript
// Patch: Bug fixes, no API changes
export function formatDate(date: Date): string {
  // Fixed timezone handling bug
  return date.toLocaleDateString();
}

// Minor: New functions, backward compatible
export function formatDate(date: Date): string { /* existing */ }
export function formatDateTime(date: Date): string { /* new function */ }

// Major: Changing function signatures
export function formatDate(date: Date, options?: FormatOptions): string {
  // Changed signature: added required options parameter
}
```

### When to Create Changesets

#### ✅ Create changesets for:
- Changes to `@repo/ui` components
- Changes to `@repo/components` widgets  
- New features in design system
- Breaking API changes
- Bug fixes in published packages

#### ❌ Don't create changesets for:
- Changes to `@repo/utils` or `@repo/types`
- App-level changes (admin, cit-compass)
- Documentation-only updates
- Internal refactoring with no API impact

#### ⚠️ Config packages auto-bump:
- Changes to `@repo/eslint-config`, `@repo/typescript-config`, `@repo/prettier-config` automatically trigger patch versions when they affect UI packages

## Example Workflows

### Adding a New Component
```bash
# 1. Create new component
echo "export function NewComponent() { return <div>New</div>; }" > packages/ui/atoms/NewComponent.tsx

# 2. Export from index
echo "export { NewComponent } from './NewComponent';" >> packages/ui/atoms/index.ts

# 3. Create changeset
pnpm changeset
# Select: @repo/ui, minor, "Add NewComponent atom"

# 4. Commit changes
git add .
git commit -m "feat: add NewComponent atom"
```

### Making Breaking Changes
```bash
# 1. Make breaking changes to Button component
# Remove deprecated props, change API, etc.

# 2. Create changeset
pnpm changeset
# Select: @repo/ui, major, "Remove deprecated Button props"

# 3. Document migration in changeset
# Edit .changeset/*.md to include migration guide

# 4. Commit changes
git add .
git commit -m "feat!: remove deprecated Button props"
```

### Release Workflow
```bash
# 1. Ensure all changes have changesets
git status

# 2. Version packages
pnpm version

# 3. Review changes
git diff

# 4. Commit version bump
git add .
git commit -m "Version Packages"

# 5. Create PR or merge to main
gh pr create --title "Release: Version Packages"
```

## Troubleshooting

### Common Issues

#### No Changesets Found
```
🦋 No unreleased changesets found.
```
**Solution**: All changes have been released. Create new changesets for new changes.

#### Version Conflicts
```
Error: Version conflict detected
```
**Solution**: Resolve conflicts in `package.json` files manually, then retry.

#### Missing Dependencies
```
Error: Cannot find package dependency
```
**Solution**: Run `pnpm install` and ensure all workspace dependencies are properly configured.

### Changeset Configuration

The project's changeset configuration is in `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@investgradeiq/admin", "@investgradeiq/cit-compass", "@repo/utils", "@repo/types"]
}
```

This configuration:
- Generates automatic changelogs
- Doesn't auto-commit version changes
- Updates internal dependencies with patch bumps
- Ignores apps and utility packages

By following this versioning workflow, we maintain clear release history, proper semantic versioning, and coordinated updates across the monorepo packages.