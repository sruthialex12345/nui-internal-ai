# Import Patterns & Best Practices

This document outlines the recommended import patterns and best practices for maintaining clean, scalable code organization across the InvestGrade IQ monorepo.

## Core Import Strategy: Scoped Barrels

We use **Strategy 2: Scoped Barrels** for a simple, consistent, and developer-friendly import experience with zero cognitive overhead.

### ✅ Scoped Barrel Pattern (Recommended)

```typescript
// Simple and consistent - zero decisions needed
import { Button, Card, Input, Alert } from '@repo/ui/atoms';
import { FormInput, DataTable, Tabs } from '@repo/ui/molecules';
import { fetchOrganizations, createOrganization } from '@/features/organizations/api';
import { useFetchOrganizations } from '@/features/organizations/hooks';
```

### Benefits
- **Zero cognitive overhead**: Developers don't need to decide which barrel to use
- **AI-friendly**: Easy for AI assistants to generate correct imports
- **Consistent**: Same pattern across all packages and features
- **Scalable**: Works well as the codebase grows

## Import Hierarchy & Rules

### 1. Feature Boundaries

**✅ Correct: Import from feature's public API**
```typescript
import { OrganizationManagement } from '@/features/organizations';
import { ManageOrganizationDetails } from '@/features/organizations/components';

// Feature structure allows these imports:
// features/organizations/index.ts exports from components/
// features/organizations/components/index.ts exports ManageOrganizationDetails
```

**❌ Incorrect: Direct import from internal file**
```typescript
import { OrganizationDataTab } from '@/features/organizations/components/OrganizationDataTab';
```

**Why this is wrong:**
- Breaks encapsulation - internal files are private
- Prevents features from refactoring their internal structure
- Creates tight coupling to implementation details

### 2. Cross-Feature Communication

**❌ Features cannot import from other features**
```typescript
// Inside features/organizations/
import { UserCard } from '@/features/users/UserCard'; // ❌ Not allowed
```

**✅ Use these patterns instead:**

#### Option 1: Shared Components
```typescript
// Move reusable UI to shared components
import { UserCard } from '@/shared/components';
```

#### Option 2: Page-Level Composition
```typescript
// In OrganizationsPage.tsx
import { OrganizationList } from '@/features/organizations';
import { UserSelector } from '@/features/users';

export function OrganizationsPage() {
  return (
    <div>
      <UserSelector onUserSelect={handleUserSelect} />
      <OrganizationList userId={selectedUser?.id} />
    </div>
  );
}
```

#### Option 3: Global State/Context
```typescript
// Share data via context or global state
import { useUserContext } from '@/shared/providers';
import { useOrganizations } from '@/features/organizations/hooks';

export function SomeComponent() {
  const { user } = useUserContext();
  const { organizations } = useOrganizations(user.id);
  // ...
}
```

### 3. Global Utilities

**✅ Correct: Global utilities can be imported directly**
```typescript
import { useUser, useUserProfile } from '@/hooks';
import { apiClient } from '@/lib';
import { env } from '@/config';
```

Global imports are allowed because they are:
- Shared across the entire application
- Not tied to specific business features
- Designed to be consumed by any part of the app

## Package Import Patterns

### UI Components (Atomic Design)
```typescript
// ✅ Import by atomic level
import { Button, Card, Input } from '@repo/ui/atoms';
import { FormInput, DataTable } from '@repo/ui/molecules';

// ❌ Avoid deep imports
import { Button } from '@repo/ui/atoms/Button';
```

### Utilities and Helpers
```typescript
// ✅ Import by domain
import { formatCurrency, truncateText } from '@repo/utils/string';
import { formatDate, addDays } from '@repo/utils/date';

// ✅ Or from main barrel
import { formatCurrency, formatDate } from '@repo/utils';
```

## Path Aliases

### Absolute Imports with @/ Alias
Always use `@/` to refer to the `src` directory to avoid relative path hell:

```typescript
// ✅ Correct: Absolute imports
import { useUser } from '@/hooks/useUser';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@repo/ui/atoms';

// ❌ Incorrect: Relative imports
import { useUser } from '../../../hooks/useUser';
import { apiClient } from '../../lib/apiClient';
```

### Path Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Configuration Imports

### Environment Variables
Never use `process.env` directly in components. Use centralized config:

**❌ Incorrect:**
```typescript
fetch(process.env.VITE_API_URL + '/users')
```

**✅ Correct:**
```typescript
import { env } from "@/config/env";
fetch(env.API_URL + "/users");
```

### Centralized Configuration
```typescript
// config/env.ts
export const env = {
  API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
  AUTH_DOMAIN: process.env.VITE_AUTH_DOMAIN || 'auth.localhost',
  // ... other env vars
} as const;
```

## Import Organization & Order

### Recommended Import Order
```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal packages (@repo/*)
import { Button, Card } from '@repo/ui/atoms';
import { FormInput } from '@repo/ui/molecules';

// 3. Internal app code (@/*)
import { useUser } from '@/hooks';
import { apiClient } from '@/lib';
import { OrganizationCard } from '@/features/organizations/components';

// 4. Relative imports (if any)
import './Component.styles.css';
```

### Grouping and Spacing
```typescript
// External libraries
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// UI components
import { Button, Card, Input, Alert } from '@repo/ui/atoms';
import { FormInput, DataTable } from '@repo/ui/molecules';

// App utilities and hooks
import { useUser, useToast } from '@/hooks';
import { apiClient } from '@/lib';
import { env } from '@/config';

// Feature-specific imports
import { useFetchOrganizations, useCreateOrganization } from '@/features/organizations/hooks';
import { OrganizationCard } from '@/features/organizations/components';

// Types (if importing separately)
import type { Organization, User } from '@/types';
```

## Common Anti-Patterns

### ❌ Deep Imports
```typescript
// Don't bypass the barrel exports
import { Button } from '@repo/ui/atoms/Button';
import { FormInput } from '@repo/ui/molecules/form/FormInput';
```

### ❌ Circular Dependencies
```typescript
// featuresA/index.ts
import { FeatureB } from '../featureB';

// featureB/index.ts  
import { FeatureA } from '../featureA'; // ❌ Circular dependency
```

### ❌ Mixed Concerns in Imports
```typescript
// Don't mix UI, API, and business logic imports in one barrel
export { Button } from './Button';           // UI
export { fetchUsers } from './api';          // API  
export { calculateTotal } from './business'; // Logic
```

### ❌ Side Effect Imports in Barrels
```typescript
// ❌ Don't include side effects in barrel exports
import './global.css'; // Side effect
export { Component } from './Component';
```

## TypeScript Import Best Practices

### Type-Only Imports
```typescript
// ✅ Use type-only imports when possible
import type { Organization, User } from '@/types';
import type { ComponentProps } from 'react';

// ✅ Mixed imports
import { useState, type FC } from 'react';
```

### Re-exports
```typescript
// ✅ Re-export types in feature indices
export type { Organization } from './types';
export type { OrganizationCardProps } from './components/OrganizationCard';
```

## Performance Considerations

### Bundle Splitting
```typescript
// ✅ Import only what you need for better tree shaking
import { formatCurrency } from '@repo/utils/string';

// ❌ Importing entire module when you only need one function
import * as stringUtils from '@repo/utils/string';
const formatted = stringUtils.formatCurrency(amount);
```

### Lazy Loading
```typescript
// ✅ Lazy load features for better code splitting
const OrganizationsPage = lazy(() => import('@/pages/organizations/OrganizationsPage'));
```

## IDE Configuration

### VSCode Settings
```json
{
  "typescript.preferences.organizeImports": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### ESLint Rules
The project includes ESLint rules to enforce these import patterns:
- `import/order` - Enforces import ordering
- `@typescript-eslint/consistent-type-imports` - Enforces type-only imports
- Custom rules for feature boundaries and barrel imports

By following these import patterns, we maintain a clean, scalable codebase that is easy to navigate and refactor as it grows.