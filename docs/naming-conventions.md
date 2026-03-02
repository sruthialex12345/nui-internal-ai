# File Naming Conventions

To maintain consistency and scalability across the monorepo, we enforce strict file naming conventions. These rules are automatically enforced by ESLint.

## File Type Conventions

### 1. Component Files (.tsx)
```
PascalCase.tsx
```
**Examples:**
- ✅ `UserProfile.tsx`, `Button.tsx`, `OrganizationCard.tsx`
- ❌ `userProfile.tsx`, `button.tsx`, `organization-card.tsx`

**Why:** Component files should match the component name and follow React conventions.

### 2. TypeScript Utilities (.ts)
```
camelCase.ts
```
**Examples:**
- ✅ `apiClient.ts`, `queryClient.ts`, `userUtils.ts`, `authHelpers.ts`
- ❌ `api-client.ts`, `ApiClient.ts`, `user_utils.ts`

**Why:** Non-component TypeScript files should use camelCase for consistency with JavaScript naming.

### 3. React Hooks (.ts)
```
useCamelCase.ts
```
**Examples:**
- ✅ `useUserProfile.ts`, `useAuth.ts`, `useLocalStorage.ts`
- ❌ `useUserProfile.tsx`, `use-auth.ts`, `userProfileHook.ts`

**Why:** Hooks should always start with "use" and be .ts files (no JSX), following React conventions.

### 4. API Files (.ts)
```
domainApi.ts or domainMutations.ts
```
**Examples:**
- ✅ `organizationsApi.ts`, `organizationMutations.ts`, `organizationUsersApi.ts`
- ❌ `api.ts`, `organizationAPI.ts`, `org-mutations.ts`

**Why:** API files should clearly indicate their domain and operation type.

### 5. Type Definition Files (.ts)
```
camelCase.ts or domain.ts
```
**Examples:**
- ✅ `userTypes.ts`, `apiTypes.ts`, `user.ts`, `organization.ts`
- ❌ `User.ts`, `user-types.ts`, `types.ts`

**Why:** Type files should be descriptive and use camelCase for consistency.

### 6. Page Components (.tsx)
```
PascalCasePage.tsx
```
**Examples:**
- ✅ `OrganizationsPage.tsx`, `UserProfilePage.tsx`, `DashboardPage.tsx`
- ❌ `organizations.tsx`, `organizationsPage.tsx`, `Organizations.tsx`

**Why:** Page components should be clearly identifiable and follow the "Page" suffix convention.

## Folder Naming

### 7. Folder Names
```
kebab-case
```
**Examples:**
- ✅ `user-profile/`, `organization-detail/`, `auth-components/`
- ❌ `userProfile/`, `organizationdetail/`, `auth_components/`

**Why:** Folder names should be URL-safe and consistent across the file system.

## Specific File Patterns

### API Layer Organization
```
features/organizations/api/
├── index.ts                      # Barrel exports
├── organizationsApi.ts           # GET operations only
├── organizationMutations.ts      # POST/PUT/DELETE operations  
└── organizationUsersApi.ts       # User-related operations
```

### Hook Organization
```
features/organizations/hooks/
├── index.ts                      # Barrel exports
├── useOrganizationQueries.ts     # Query hooks only
├── useOrganizationMutations.ts   # Mutation hooks only
└── useOrganizationUsers.ts       # User-related hooks
```

### Component Organization
```
features/organizations/components/
├── index.ts                      # Barrel exports
├── OrganizationCard.tsx          # Single component
├── OrganizationList.tsx          # Single component
└── forms/                        # Grouped by subdomain
    ├── index.ts                  # Form component exports
    ├── OrganizationForm.tsx
    └── OrganizationEditForm.tsx
```

## Special Files

### Configuration Files
- `env.ts` - Environment configuration
- `authOidc.ts` - OIDC configuration
- `apiClient.ts` - HTTP client setup
- `queryClient.ts` - React Query setup

### Index Files (Barrel Exports)
- Always named `index.ts`
- Should only contain export statements
- No logic or implementation allowed

### Test Files
- `ComponentName.test.tsx` - Component tests
- `functionName.test.ts` - Utility function tests
- `hookName.test.ts` - Custom hook tests

## ESLint Enforcement

The naming conventions are automatically enforced by ESLint. If you violate these rules, you'll see errors like:

### Common Error Messages
```bash
❌ Component file "userProfile.tsx" should be PascalCase (e.g., "UserProfile.tsx")

❌ Hook file "use-auth.ts" should be camelCase starting with "use" (e.g., "useAuth.ts")

❌ TypeScript file "api-client.ts" should be camelCase (e.g., "apiClient.ts")

❌ Page component "organizations.tsx" should end with "Page" (e.g., "OrganizationsPage.tsx")

❌ Folder name "userProfile" should be kebab-case (e.g., "user-profile")
```

## Domain-Specific Patterns

### Business Features
Follow the domain name in the filename:
- `organizationsApi.ts` (not `orgApi.ts`)
- `userManagement.ts` (not `userMgmt.ts`)
- `OrganizationCard.tsx` (not `OrgCard.tsx`)

### UI Components
Use descriptive names that indicate purpose:
- `FormInput.tsx` (not `Input.tsx` in forms folder)
- `DataTable.tsx` (not `Table.tsx`)
- `ConfirmDialog.tsx` (not `Dialog.tsx`)

### Utility Functions
Group by purpose and use descriptive names:
- `stringFormatters.ts` - String formatting utilities
- `dateCalculations.ts` - Date calculation utilities
- `apiHelpers.ts` - API-related helper functions

## Migration from Old Naming

If you encounter files that don't follow these conventions:

1. **Rename the file** to follow the convention
2. **Update all imports** that reference the old filename
3. **Run tests** to ensure nothing breaks
4. **Commit the rename** as a separate commit for better git history

Example migration:
```bash
# Before
src/components/user-card.tsx
src/hooks/use-user-data.ts

# After  
src/components/UserCard.tsx
src/hooks/useUserData.ts
```

## Benefits of Consistent Naming

1. **Predictability**: Developers can guess file names without searching
2. **IDE Support**: Better autocomplete and file navigation
3. **Tool Integration**: Consistent names work better with build tools
4. **Code Review**: Easier to spot naming issues in PRs
5. **Refactoring**: Automated refactoring tools work more reliably

These naming conventions ensure that our codebase remains organized, searchable, and maintainable as it grows.