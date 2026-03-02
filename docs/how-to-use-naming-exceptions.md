# How to Use Component Naming Exceptions

## 🚀 Quick Start

The exceptions are now **automatically integrated** into your existing ESLint configuration! No additional setup required.

## ✅ Already Configured

Your `packages/eslint-config/naming-conventions.js` has been updated to use the exceptions automatically. The following files are now exempt from PascalCase rules:

### 🛣️ **Framework Files** (Auto-exempted)
```bash
# TanStack Router files
apps/admin/src/routes/$.tsx                    ✅ Exempt
apps/admin/src/routes/__root.tsx              ✅ Exempt  
apps/admin/src/routes/_authenticated.tsx      ✅ Exempt
apps/cit-compass/src/routes/index.tsx         ✅ Exempt

# Entry points
apps/admin/src/main.tsx                       ✅ Exempt
apps/cit-compass/src/main.tsx                 ✅ Exempt
```

### 🧪 **Test Files** (Auto-exempted)
```bash
packages/ui/atoms/Button.test.tsx             ✅ Exempt
packages/test-config/src/utils/render.tsx     ✅ Exempt
```

### 📖 **Storybook Files** (Auto-exempted)
```bash
packages/ui/stories/Button.stories.tsx        ✅ Exempt
packages/ui/stories/Input.stories.tsx         ✅ Exempt
```

## 🔧 How It Works

### 1. **Automatic Detection**
The ESLint rule now calls `isExemptFromComponentNaming(filename)` to check if a file should be exempt:

```javascript
// In naming-conventions.js
if (ext === ".tsx") {
  const isExempt = isExemptFromComponentNaming(filename);
  
  if (!isExempt && !/^[A-Z][A-Za-z0-9]*$/.test(nameWithoutExt)) {
    // Report PascalCase violation
  }
}
```

### 2. **Pattern Matching**
The exceptions use glob patterns to match files:

```javascript
// These patterns are automatically checked
"**/routes/**/*.{ts,tsx,js,jsx}"     // All route files
"**/*.test.{ts,tsx,js,jsx}"          // All test files  
"**/*.stories.{ts,tsx,js,jsx}"       // All story files
"**/main.{ts,tsx,js,jsx}"            // Entry points
```

## 📝 Adding Custom Exceptions

### Option 1: Update the Exception Configuration
Edit `packages/eslint-config/component-naming-exceptions.js`:

```javascript
export const componentNamingExceptions = [
  // Existing patterns...
  
  // Add your custom patterns
  "**/my-special-dir/**/*.{ts,tsx}",    // Custom directory
  "**/*.config.{ts,tsx}",              // Config files
  "**/utils/**/*.{ts,tsx}",            // Utility files
];
```

### Option 2: Add Specific Files
```javascript
export const specificFileExceptions = [
  // Existing files...
  
  // Add specific files
  "apps/my-app/src/special-file.tsx",
  "packages/my-package/src/helper.tsx",
];
```

## 🧪 Testing the Configuration

### Check if a file is exempt:
```javascript
import { isExemptFromComponentNaming } from './packages/eslint-config/component-naming-exceptions.js';

// Test examples
console.log(isExemptFromComponentNaming('apps/admin/src/routes/index.tsx'));     // true
console.log(isExemptFromComponentNaming('packages/ui/atoms/Button.test.tsx'));  // true  
console.log(isExemptFromComponentNaming('apps/admin/src/components/MyComponent.tsx')); // false
```

### Run ESLint to see it in action:
```bash
# Should show no PascalCase violations for exempt files
pnpm lint
```

## 📋 Current Exception Categories

| Pattern | Example Files | Status |
|---------|---------------|---------|
| **Routes** | `routes/index.tsx`, `routes/__root.tsx` | ✅ Auto-exempt |
| **Tests** | `Button.test.tsx`, `render.tsx` | ✅ Auto-exempt |
| **Stories** | `Button.stories.tsx` | ✅ Auto-exempt |
| **Entry** | `main.tsx`, `index.tsx` | ✅ Auto-exempt |
| **Generated** | `routeTree.gen.ts` | ✅ Auto-exempt |
| **Config** | `vite.config.ts` | ✅ Auto-exempt |

## 🎯 What Still Requires PascalCase

Regular component files in these directories:
- `src/components/` → `MyComponent.tsx` ✅
- `src/pages/` → `HomePage.tsx` ✅  
- `src/features/*/components/` → `UserProfile.tsx` ✅
- `packages/ui/atoms/` → `Button.tsx` ✅

## 🚀 No Action Required

The integration is complete! Your ESLint will now:
- ✅ **Allow** all legitimate framework files
- ✅ **Allow** test and story files  
- ✅ **Enforce** PascalCase on actual components
- ✅ **Future-proof** for new framework files

Just continue coding as normal - the exceptions handle everything automatically! 🎉