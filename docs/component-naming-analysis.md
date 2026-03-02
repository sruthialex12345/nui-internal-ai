# Component PascalCase Naming Analysis

## Overview
This document analyzes all TypeScript/JSX component files in the project to identify violations of the PascalCase naming convention and provide recommendations for exceptions vs. renaming.

## Summary of Findings

### ✅ Files Already Following PascalCase (67 files)
All component files in the following directories are correctly named:
- `apps/admin/src/components/` - 1 file
- `apps/admin/src/features/*/components/` - 5 files  
- `apps/admin/src/pages/` - 3 files
- `apps/admin/src/shared/components/` - 1 file
- `apps/admin/src/shared/providers/` - 1 file
- `apps/cit-compass/src/components/` - 1 file
- `apps/cit-compass/src/pages/` - 4 files
- `apps/cit-compass/src/shared/components/` - 1 file
- `apps/cit-compass/src/shared/providers/` - 1 file
- `packages/components/src/` - 3 files
- `packages/ui/atoms/` - 19 files
- `packages/ui/molecules/` - 7 files

### 🚫 Files That Should Be Exceptions (21 files)

#### Framework & Routing Files (14 files)
**Should remain as-is** - These follow framework conventions:
```
apps/admin/src/routes/$.tsx
apps/admin/src/routes/__root.tsx  
apps/admin/src/routes/_authenticated.tsx
apps/admin/src/routes/_authenticated/admin.tsx
apps/admin/src/routes/_authenticated/organizations/$orgId.tsx
apps/admin/src/routes/_authenticated/organizations/index.tsx
apps/admin/src/routes/index.tsx
apps/cit-compass/src/routes/$.tsx
apps/cit-compass/src/routes/__root.tsx
apps/cit-compass/src/routes/_authenticated.tsx
apps/cit-compass/src/routes/_authenticated/admin.tsx
apps/cit-compass/src/routes/_authenticated/dashboard.tsx
apps/cit-compass/src/routes/_authenticated/profile.tsx
apps/cit-compass/src/routes/index.tsx
```

#### Application Entry Points (2 files)
**Should remain as-is** - Standard entry point naming:
```
apps/admin/src/main.tsx
apps/cit-compass/src/main.tsx
```

#### Test Files (1 file)
**Should remain as-is** - Testing convention:
```
packages/ui/atoms/Button.test.tsx
```

#### Storybook Files (8 files)
**Should remain as-is** - Storybook convention:
```
packages/ui/stories/Alert.stories.tsx
packages/ui/stories/Badge.stories.tsx
packages/ui/stories/Button.stories.tsx
packages/ui/stories/Card.stories.tsx
packages/ui/stories/Checkbox.stories.tsx
packages/ui/stories/FormInput.stories.tsx
packages/ui/stories/Input.stories.tsx
packages/ui/stories/Label.stories.tsx
```

### ⚠️ Files That Need Attention (1 file)

#### Test Utility File
```
packages/test-config/src/utils/render.tsx
```
**Recommendation**: Add to exceptions list as this is a test utility, not a component.

## Exception Configuration

A new configuration file has been created: `packages/eslint-config/component-naming-exceptions.js`

This configuration covers:
- **TanStack Router files** (routes directory)
- **Test files** (*.test.tsx, *.spec.tsx)
- **Storybook files** (*.stories.tsx)
- **Entry points** (main.tsx, index.tsx)
- **Utility files** (render.tsx in test-config)
- **Generated files** (*.gen.tsx)

## Implementation Recommendations

### 1. Update ESLint Configuration
Modify your ESLint rule to use the exception patterns:

```javascript
// In your ESLint config
import { getAllExceptionPatterns } from './packages/eslint-config/component-naming-exceptions.js';

export default [
  {
    rules: {
      // Your existing component naming rule
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
        },
        // Add exception for component files
        {
          selector: 'function',
          format: ['PascalCase'],
          filter: {
            regex: getAllExceptionPatterns().join('|'),
            match: false,
          },
        },
      ],
    },
  },
];
```

### 2. No Files Need Renaming
**All current "violations" are legitimate exceptions** that follow framework or tooling conventions.

### 3. Future Guidelines
For new component files:
- **✅ Use PascalCase**: `MyComponent.tsx`
- **✅ Exception patterns are handled automatically**
- **❌ Avoid camelCase**: `myComponent.tsx` (unless it's in an exception directory)

## File Categories Summary

| Category | Count | Action Required |
|----------|-------|----------------|
| ✅ Valid PascalCase Components | 67 | None |
| 🚫 Framework Files (Routes) | 14 | Add to exceptions |
| 🚫 Entry Points | 2 | Add to exceptions |
| 🚫 Test Files | 1 | Add to exceptions |
| 🚫 Storybook Files | 8 | Add to exceptions |
| ⚠️ Test Utilities | 1 | Add to exceptions |
| **Total Files Analyzed** | **93** | **Configure exceptions only** |

## Conclusion

The project has excellent naming convention compliance. All apparent "violations" are actually files that should legitimately be exempt from the PascalCase component rule due to framework conventions or file types.

**Next Steps:**
1. Integrate the exception configuration into your ESLint setup
2. No file renaming is required
3. The configuration will automatically handle future framework files

**Zero breaking changes needed** - this is purely an ESLint configuration enhancement.