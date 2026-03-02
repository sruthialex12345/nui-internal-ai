# Single Responsibility Principle (SRP) Guidelines

The Single Responsibility Principle is a core architectural guideline that keeps our codebase maintainable, testable, and scalable. This document provides detailed guidelines for applying SRP effectively.

## Overview

**Single Responsibility Principle**: Each file, function, and component should have one reason to change.

## File Size Guidelines

### Recommended Sizes
- **Small files (preferred)**: 50-100 lines
- **Medium files (acceptable)**: 100-200 lines  
- **Large files (needs refactoring)**: 200+ lines

### When to Split Files
Consider splitting when you see:
- Multiple distinct concerns in one file
- Functions that could be grouped separately
- Code that's tested in completely different ways
- Logic that changes for different reasons

## Responsibilities by File Type

### API Files

Split API operations by their nature and responsibility:

```typescript
// ✅ organizationsApi.ts - Only GET operations
export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get('/organizations');
  return response.data;
};

export const fetchOrganizationById = async (id: string): Promise<Organization> => {
  const response = await apiClient.get(`/organizations/${id}`);
  return response.data;
};

// ✅ organizationMutations.ts - Only POST/PUT/DELETE operations  
export const createOrganization = async (data: CreateOrgRequest): Promise<Organization> => {
  const response = await apiClient.post('/organizations', data);
  return response.data;
};

export const updateOrganization = async (
  id: string, 
  data: UpdateOrgRequest
): Promise<Organization> => {
  const response = await apiClient.put(`/organizations/${id}`, data);
  return response.data;
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await apiClient.delete(`/organizations/${id}`);
};
```

### Hook Files

Separate hooks by their purpose and data they manage:

```typescript
// ✅ useOrganizationQueries.ts - Only query hooks
export const useFetchOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  });
};

export const useFetchOrganizationById = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id,
  });
};

// ✅ useOrganizationMutations.ts - Only mutation hooks
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgRequest }) =>
      updateOrganization(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};
```

### Component Files

One component per file, with focused responsibilities:

```typescript
// ✅ OrganizationCard.tsx - Single responsibility: Display organization card
interface OrganizationCardProps {
  organization: Organization;
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
}

export function OrganizationCard({ organization, onEdit, onDelete }: OrganizationCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{organization.name}</h3>
          <p className="text-muted-foreground">{organization.description}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(organization)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(organization)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ❌ Bad: Multiple components in one file
export function OrganizationCard() { /* ... */ }
export function OrganizationList() { /* ... */ }  // Should be separate file
export function OrganizationForm() { /* ... */ }  // Should be separate file
```

### Utility Files

Group utilities by their domain and purpose:

```typescript
// ✅ stringFormatters.ts - Only string formatting utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

// ✅ stringValidators.ts - Only string validation utilities  
export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasUpper && hasLower && hasNumber && hasSymbol;
};
```

## Common Anti-Patterns

### ❌ God Files
Files that do everything:

```typescript
// ❌ organizationUtils.ts (500+ lines)
export const fetchOrganizations = async () => { /* ... */ };
export const createOrganization = async () => { /* ... */ };
export const useOrganizations = () => { /* ... */ };
export const OrganizationCard = () => { /* ... */ };
export const formatOrgName = () => { /* ... */ };
export const validateOrgData = () => { /* ... */ };
// ... 50 more functions
```

**Fix**: Split into focused files by responsibility.

### ❌ Mixed Concerns
Combining unrelated functionality:

```typescript
// ❌ userAuth.ts - Auth + Profile + Preferences
export const login = () => { /* auth logic */ };
export const updateProfile = () => { /* profile logic */ };
export const savePreferences = () => { /* preferences logic */ };
```

**Fix**: Split into `auth.ts`, `profile.ts`, and `preferences.ts`.

### ❌ Logic in Index Files
Barrel files with implementation:

```typescript
// ❌ index.ts with logic
export const fetchUsers = async () => { /* implementation */ };
export * from './userTypes';
```

**Fix**: Move implementation to dedicated file, keep only exports in index.

## Benefits of SRP

### 🔍 Easier Testing
```typescript
// ✅ Easy to test individual concerns
describe('stringFormatters', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
  });
});

// ✅ Clear test focus
describe('useOrganizationQueries', () => {
  it('fetches organizations successfully', () => {
    // Test only query logic
  });
});
```

### 🐛 Faster Debugging
- Stack traces point to specific, focused files
- Easier to isolate and reproduce issues
- Less cognitive overhead when reading code

### 👥 Better Collaboration
- Multiple developers can work on different files simultaneously
- Reduced merge conflicts
- Clear ownership of specific responsibilities

### 📦 Better Tree Shaking
```typescript
// ✅ Import only what you need
import { formatCurrency } from '@/utils/stringFormatters';
import { useFetchOrganizations } from '@/features/organizations/hooks/useOrganizationQueries';

// Bundle only includes the specific functions used
```

### 🧠 Reduced Cognitive Load
- Each file has a clear, single purpose
- Easier to understand and modify
- Less mental context switching

### 🔄 Easier Refactoring
- Changes are isolated and predictable
- Safe to modify without affecting unrelated code
- Clear boundaries for testing changes

## Migration Strategy

### Step 1: Identify Large Files
```bash
# Find files over 200 lines
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -20
```

### Step 2: Identify Responsibilities
Look for different concerns in the file:
- Different types of operations (queries vs mutations)
- Different domains (user vs organization)  
- Different layers (API vs UI vs business logic)

### Step 3: Extract Focused Files
```typescript
// Before: userHooks.ts (5 different hooks, 150 lines)
export const useUser = () => { /* ... */ };
export const useUserProfile = () => { /* ... */ };
export const useUserLoading = () => { /* ... */ };
export const useUserPreferences = () => { /* ... */ };
export const useUserNotifications = () => { /* ... */ };

// After: Split into focused files
// useUser.ts (20 lines) - Core user context
// useUserProfile.ts (30 lines) - Profile management
// useUserPreferences.ts (25 lines) - User preferences
// useUserNotifications.ts (30 lines) - Notification management

// hooks/index.ts (exports only)
export * from './useUser';
export * from './useUserProfile';  
export * from './useUserPreferences';
export * from './useUserNotifications';
```

### Step 4: Update Imports
Change imports to use the new structure:

```typescript
// Before
import { useUser, useUserProfile } from '@/hooks/userHooks';

// After
import { useUser } from '@/hooks/useUser';
import { useUserProfile } from '@/hooks/useUserProfile';
// or
import { useUser, useUserProfile } from '@/hooks';
```

### Step 5: Test and Verify
- Run all tests to ensure nothing breaks
- Check that imports resolve correctly
- Verify build still works

By following SRP, we create a codebase that is easier to understand, modify, and scale as our application grows.