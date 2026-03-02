# Project Structure

This document details the complete folder structure and organization of the InvestGrade IQ monorepo, following Feature-Driven Architecture with Single Responsibility Principle.

## Monorepo Overview

The project is organized as a monorepo with clear separation between applications and shared packages:

```
investgradeiq-apps/
├── apps/                    # Application layer
│   ├── admin/              # Admin dashboard application  
│   └── cit-compass/        # CIT Compass application
├── packages/                # Shared packages
│   ├── ui/                 # UI component library
│   ├── utils/              # Shared utilities
│   ├── types/              # Shared TypeScript types
│   ├── eslint-config/      # ESLint configuration
│   ├── typescript-config/  # TypeScript configuration
│   └── prettier-config/    # Prettier configuration
└── docs/                   # Documentation (this folder)
```

## 1. Application Core (`apps/admin/`)

The main React application following **Single Responsibility Principle**. The structure prioritizes **small, focused files** grouped by **domain feature**.

```text
apps/admin/
├── public/                     # Static assets (images, fonts, favicon)
├── src/
│   ├── routes/                 # App-wide routing definitions
│   │
│   ├── shared/                 # Shared Application Code
│   │   ├── components/         # APPLICATION-SPECIFIC shared components
│   │   │   ├── layout/         # Layout components with focused responsibilities
│   │   │   │   ├── index.ts    # 📁 Exports only
│   │   │   │   └── AuthenticatedLayout.tsx
│   │   │   └── index.ts        # 📁 Exports only
│   │   ├── providers/          # Context providers
│   │   │   ├── index.ts        # 📁 Exports only
│   │   │   └── UserProvider.tsx
│   │   └── auth/               # Shared auth utilities
│   │       ├── api/
│   │       │   ├── index.ts    # 📁 Exports only
│   │       │   └── userProfile.ts   # User profile API calls
│   │       ├── hooks/
│   │       │   ├── index.ts    # 📁 Exports only
│   │       │   └── query/
│   │       │       └── useUserProfile.ts
│   │       └── types/
│   │           └── index.ts    # 📁 Exports only
│   │
│   ├── features/               # 🎯 THE CORE: Business logic grouped by domain
│   │   └── organizations/      # Feature: Organization Management
│   │       ├── api/            # API layer - SRP applied
│   │       │   ├── index.ts    # 📁 Exports only
│   │       │   ├── organizationsApi.ts      # 🔍 GET operations only
│   │       │   ├── organizationMutations.ts # ✏️ POST/PUT/DELETE only
│   │       │   └── organizationUsersApi.ts  # 👥 User operations only
│   │       ├── hooks/          # React hooks - SRP applied
│   │       │   ├── index.ts    # 📁 Exports only  
│   │       │   ├── useOrganizationQueries.ts   # 🔍 Query hooks only
│   │       │   ├── useOrganizationMutations.ts # ✏️ Mutation hooks only
│   │       │   └── useOrganizationUsers.ts     # 👥 User hooks only
│   │       ├── components/     # UI components
│   │       │   ├── index.ts    # 📁 Exports only
│   │       │   ├── ManageOrganizationDetails.tsx
│   │       │   ├── OrganizationDataTab.tsx
│   │       │   ├── OrganizationUsersTab.tsx
│   │       │   ├── CitAccessDetailsTab.tsx
│   │       │   └── OrganizationManagement.tsx
│   │       ├── types/          # TypeScript definitions
│   │       │   └── index.ts    # 📁 Exports only
│   │       └── index.ts        # 📁 Feature public API
│   │
│   ├── pages/                  # Page components that compose features
│   │   ├── organizations/
│   │   │   ├── OrganizationsPage.tsx
│   │   │   └── organization-detail/
│   │   │       └── OrganizationDetailPage.tsx
│   │   └── ComponentTestPage.tsx
│   │
│   ├── hooks/                  # 🪝 Global hooks - SRP applied
│   │   ├── index.ts            # 📁 Exports only
│   │   ├── useUser.ts          # Core user context hook
│   │   ├── useUserProfile.ts   # User profile utilities
│   │   └── useUserLoading.ts   # User loading state
│   │
│   ├── lib/                    # 🛠️ Library configurations - SRP applied  
│   │   ├── index.ts            # 📁 Exports only
│   │   ├── apiClient.ts        # HTTP client configuration
│   │   └── queryClient.ts      # React Query configuration
│   │
│   ├── config/                 # ⚙️ Configuration - SRP applied
│   │   ├── index.ts            # 📁 Exports only
│   │   ├── env.ts              # Environment variables
│   │   └── authOidc.ts         # OIDC configuration
│   │
│   ├── types/                  # 📋 Global TypeScript types
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── organization.ts
│   │
│   └── main.tsx                # Application Entry Point
│
├── .env                        # Local Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 2. Shared UI Library (`packages/ui/`)

**Strategy 2: Scoped Barrels** - Simple and developer-friendly import pattern. These components contain **no business logic** and follow **atomic design principles**.

```text
packages/ui/
├── index.ts                    # 📁 Main exports - scoped barrels only
│                              # export * from "./atoms";
│                              # export * from "./molecules";
├── atoms/                      # Basic building blocks
│   ├── index.ts               # 📁 Atom exports only
│   ├── Button.tsx             # Single responsibility: Button component
│   ├── Input.tsx              # Single responsibility: Input component
│   ├── Card.tsx               # Single responsibility: Card component
│   ├── Alert.tsx              # Single responsibility: Alert component
│   ├── Badge.tsx              # Single responsibility: Badge component
│   ├── Form.tsx               # Single responsibility: Form context
│   ├── Tabs.tsx               # Single responsibility: Tabs component
│   └── Select.tsx             # Single responsibility: Select component
├── molecules/                  # Composed components
│   ├── index.ts               # 📁 Molecule exports only
│   ├── form/                  # Form-related molecules
│   │   ├── index.ts           # 📁 Form molecule exports only
│   │   ├── FormInput.tsx      # Single responsibility: Form input
│   │   ├── FormCheckbox.tsx   # Single responsibility: Form checkbox
│   │   ├── FormPasswordInput.tsx # Single responsibility: Password input
│   │   ├── StyledFormInput.tsx   # Single responsibility: Styled input
│   │   └── StyledSelectInput.tsx # Single responsibility: Styled select
│   ├── table/                 # Table-related molecules  
│   │   ├── index.ts           # 📁 Table molecule exports only
│   │   ├── DataTable.tsx      # Single responsibility: Data table
│   │   └── TableOptionsMenus.tsx # Single responsibility: Table menus
│   └── Tabs.tsx               # Single responsibility: App tabs
├── lib/
│   └── utils.ts               # Single responsibility: Utility functions
├── hooks/
│   └── useToast.ts           # Single responsibility: Toast hook
├── package.json
└── tsconfig.json

# Usage Examples:
# ✅ Simple scoped imports - zero decisions needed
import { Button, Card, Input } from '@repo/ui/atoms';
import { FormInput, DataTable } from '@repo/ui/molecules';
```

## 3. Shared Utils Library (`packages/utils/`)

Reusable utilities organized by responsibility.

```text
packages/utils/
├── index.ts                   # 📁 Main exports only
├── string/
│   ├── index.ts              # 📁 String utility exports only
│   ├── formatters.ts         # Single responsibility: String formatting
│   └── validators.ts         # Single responsibility: String validation
├── date/
│   ├── index.ts              # 📁 Date utility exports only
│   ├── formatters.ts         # Single responsibility: Date formatting
│   └── calculations.ts       # Single responsibility: Date calculations
└── react/
    ├── index.ts              # 📁 React utility exports only
    ├── hooks.ts              # Single responsibility: Custom hooks
    └── query.ts              # Single responsibility: Query utilities
```

## File Organization Principles

### 📁 Index Files (Barrel Pattern)
- **Purpose**: Export public APIs only, no implementation
- **Content**: Only `export` statements
- **Why**: Clean separation between public interface and internal implementation

### 🎯 Feature Structure
Each feature follows the same internal structure:
- `api/` - Data fetching and mutations
- `hooks/` - React hooks specific to the feature
- `components/` - UI components for the feature
- `types/` - TypeScript definitions
- `index.ts` - Public API exports

### 🔒 Boundary Enforcement
- Features cannot import from other features directly
- Shared components cannot import from features
- Only `index.ts` files can be imported from outside a folder
- Pages compose features and handle cross-feature communication

### 📊 Naming Patterns
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`
- API files: `domainApi.ts` or `domainMutations.ts`
- Pages: `PascalCasePage.tsx`
- Folders: `kebab-case`

This structure ensures that:
1. Code is easy to find and navigate
2. Related functionality is co-located
3. Dependencies flow in one direction
4. Features can be developed independently
5. The codebase scales without becoming unwieldy