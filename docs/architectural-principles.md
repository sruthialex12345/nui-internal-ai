# Core Architectural Principles

This document outlines the fundamental principles that guide the InvestGrade IQ frontend architecture. These principles ensure scalability, maintainability, and developer productivity.

## 🎯 Single Responsibility Principle (SRP)

- **One responsibility per file**: Each file should have a single, focused purpose
- **Barrel exports only**: Index files should only contain exports, no logic
- **Small, focused functions**: 50-100 lines preferred, 200+ lines require splitting
- **Easy to test**: Small files are easier to unit test and debug

### Benefits
- 🔍 **Easier Testing**: Small, focused functions are easier to unit test
- 🐛 **Faster Debugging**: Issues are easier to locate in focused files
- 👥 **Better Collaboration**: Multiple developers can work on different files simultaneously
- 📦 **Better Tree Shaking**: Import only what you need
- 🧠 **Reduced Cognitive Load**: Each file has a clear, single purpose
- 🔄 **Easier Refactoring**: Changes are isolated and predictable

## 🏗️ Feature-Driven Architecture

- **Co-located by domain**: Related functionality lives together
- **Strict boundaries**: Features are isolated and cannot directly import from each other
- **Public APIs**: Only index files are importable from outside a feature

### Why Feature-Driven?
- Keeps related code together for easier maintenance
- Allows teams to own specific business domains
- Enables independent development and testing
- Simplifies code discovery and navigation

## 📦 Scoped Barrel Imports

- **Strategy 2: Scoped Barrels**: Simple `@repo/ui/atoms` and `@repo/ui/molecules` pattern
- **Zero cognitive overhead**: Developers don't need to decide which barrel to use
- **AI-friendly**: Easy for AI assistants to generate correct imports

### Import Examples
```typescript
// ✅ Simple scoped imports - zero decisions needed
import { Button, Card, Input } from '@repo/ui/atoms';
import { FormInput, DataTable } from '@repo/ui/molecules';
```

## 🔒 Strict Boundaries

### 1. Feature Isolation
- Features should not import directly from other features
- Prevents tight coupling between business domains
- If you delete a feature, other features should not break

### 2. Layer Hierarchy
- Shared/Global components cannot import from Features
- "Dumb" UI components should not know about complex business logic
- Data flows down via props, events flow up via callbacks

### 3. Public API Enforcement
- You can only import from the `index.ts` of a feature
- Internal files are private implementation details
- Allows features to refactor internally without breaking consumers

## 🎯 File Size Guidelines

- **Small files (preferred)**: 50-100 lines
- **Medium files (acceptable)**: 100-200 lines  
- **Large files (needs refactoring)**: 200+ lines

When files exceed 200 lines, consider:
- Extracting reusable utilities
- Splitting by responsibility
- Creating focused sub-components
- Moving logic to custom hooks

## 🧪 Testing Strategy

- **Co-located tests**: `component.test.tsx` next to `component.tsx`
- **Small, testable functions**: Easier to unit test
- **Mock boundaries clearly**: Test one responsibility at a time
- **Test behavior, not implementation**: Focus on what the code does, not how

These principles work together to create a codebase that is easy to understand, modify, and scale as your application grows.