# Architecture Rules & ESLint Enforcement

This document outlines the architectural rules that are enforced by ESLint to maintain code quality and architectural consistency across the InvestGrade IQ monorepo.

## Rule Categories

We enforce a strict hierarchy to prevent spaghetti code and maintain **Single Responsibility Principle**. These rules are guarded by **ESLint** and will cause build failures if violated.

## 1. Single Responsibility Principle

### Rule
Each file should have one clear responsibility and stay focused.

### Why
- Smaller files are easier to test, debug, and maintain
- Reduces cognitive load when reading code
- Enables better tree shaking and bundling
- Improves collaboration by reducing merge conflicts

### Examples
```typescript
// ✅ Good: One responsibility per file
organizationsApi.ts    → Only GET operations for organizations
organizationMutations.ts → Only POST/PUT/DELETE operations
useOrganizationQueries.ts → Only query hooks for organizations

// ❌ Bad: Multiple responsibilities in one file
organizationsApi.ts → queries + mutations + types + validation (173 lines)
```

### ESLint Error Messages
```
❌ File is too large (200+ lines). Consider splitting by responsibility.
❌ Multiple concerns detected in single file. Each file should have one responsibility.
```

## 2. Barrel Export Pattern

### Rule
Index files should only contain exports, never logic or implementations.

### Why
- Clean separation between public API and implementation
- Allows internal refactoring without breaking consumers
- Makes it clear what the public interface is
- Enables better code splitting

### Examples
```typescript
// ✅ Good: Pure exports in index.ts
export * from './organizationsApi';
export * from './organizationMutations';
export { type Organization } from './types';

// ❌ Bad: Logic in index.ts
export const fetchUsers = async () => { 
  const response = await fetch('/users');
  return response.json();
};
```

### ESLint Error Messages
```
❌ Index files should only contain exports. Move implementation to separate file.
❌ No logic allowed in barrel export files.
```

## 3. Feature Isolation

### Rule
Features should not import directly from other features.

### Why
- Prevents tight coupling between business domains
- Enables independent feature development
- Allows features to be deleted without breaking others
- Improves code organization and maintainability

### The Error
```typescript
// ❌ Incorrect: Direct feature import
import { UserCard } from '@/features/users/UserCard'  // inside features/organizations
```

### The Fix
Use one of these approaches:
1. **Shared components**: Move reusable UI to `src/shared/components`
2. **Page composition**: Handle cross-feature logic at the page level
3. **Global state**: Use context or state management for shared data

```typescript
// ✅ Option 1: Shared component
import { UserCard } from '@/shared/components';

// ✅ Option 2: Page-level composition
// In OrganizationsPage.tsx
import { OrganizationList } from '@/features/organizations';
import { UserSelector } from '@/features/users';
```

### ESLint Error Messages
```
🚫 Feature Boundary Violation: Cannot import from other features directly.
   Features should be isolated. Use shared components or page-level composition instead.
```

## 4. Layer Hierarchy

### Rule
Shared/Global components cannot import from Features.

### Why
- Keeps "dumb" UI components pure and reusable
- Prevents business logic from leaking into shared components
- Maintains clear separation of concerns
- Enables component library extraction

### The Error
```typescript
// ❌ Incorrect: Shared component importing feature logic  
import { useOrganizations } from '@/features/organizations'  // inside src/shared/components
```

### The Fix
Pass data down via props instead:

```typescript
// ✅ Shared component accepts props
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card>
      <p>{user.name}</p>
      <Button onClick={() => onEdit(user)}>Edit</Button>
    </Card>
  );
}

// ✅ Feature provides the logic
export function UserManagement() {
  const { users } = useUsers();
  const { editUser } = useEditUser();
  
  return (
    <div>
      {users.map(user => 
        <UserCard key={user.id} user={user} onEdit={editUser} />
      )}
    </div>
  );
}
```

### ESLint Error Messages
```
🚫 Shared Component Violation: Shared components cannot import from features or app layer.
   Keep shared components pure - they should only accept props and render UI.
```

## 5. Public API Enforcement (Boundaries)

### Rule
You can only import from the `index.ts` of a feature. Internal files are private.

### Why
- Allows features to refactor internal structure without breaking consumers
- Creates clear public APIs for features
- Prevents accidental coupling to internal implementation details
- Enables better encapsulation

### The Error
```typescript
// ❌ Incorrect: Direct import from internal file
import { OrganizationDataTab } from '@/features/organizations/components/OrganizationDataTab'
```

### The Fix
Export the component in the feature's index.ts:

```typescript
// features/organizations/components/index.ts
export { OrganizationDataTab } from './OrganizationDataTab';

// features/organizations/index.ts  
export * from './components';
export * from './hooks';
export * from './api';

// ✅ Correct: Import from public API
import { OrganizationDataTab } from '@/features/organizations/components'
// or
import { OrganizationDataTab } from '@/features/organizations'
```

### ESLint Error Messages
```
🚫 Feature Boundary Violation: Cannot import 'OrganizationDataTab.tsx' directly. 
   Please export it in the feature's index.ts file and import from there instead. 
   This ensures clean separation between features.
```

## 6. Package Boundaries

### Rule
Applications can consume packages, but packages cannot consume from applications.

### Why
- Maintains clear dependency direction
- Prevents circular dependencies
- Enables package reusability across applications
- Supports monorepo scaling

### Examples
```typescript
// ✅ App importing from package
import { Button } from '@repo/ui/atoms';

// ❌ Package importing from app  
import { useUser } from '@investgradeiq/admin/hooks'; // Inside @repo/ui
```

## Disabling Rules

In rare cases where you need to disable a rule, use ESLint disable comments with justification:

```typescript
// ❌ Don't do this without justification
// eslint-disable-next-line feature-boundaries

// ✅ Acceptable with justification  
// eslint-disable-next-line feature-boundaries -- Legacy component, will be refactored in JIRA-123
import { LegacyUserCard } from '@/features/legacy-users/components/UserCard';
```

## Configuring ESLint

The rules are configured in the root `.eslintrc.js` and individual package configurations. Key plugins include:

- `@typescript-eslint` - TypeScript-specific rules
- `eslint-plugin-boundaries` - Architectural boundary enforcement
- Custom rules for SRP and barrel exports

## Common Violations & Solutions

| Violation | Problem | Solution |
|-----------|---------|----------|
| Large files | File > 200 lines | Split by responsibility |
| Cross-feature imports | Direct feature imports | Use shared components or page composition |
| Logic in index | Implementation in barrel | Move to separate focused file |
| Deep imports | Importing from internal files | Export via index.ts |
| Circular deps | Two-way dependencies | Refactor to unidirectional flow |

These rules work together to maintain a scalable, maintainable architecture that supports team collaboration and code quality.