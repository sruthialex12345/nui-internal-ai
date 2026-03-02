# Styling Guidelines (Tailwind + Shadcn)

This document outlines our styling approach using Tailwind CSS and Shadcn/UI components, focusing on maintainable, consistent, and scalable styling practices.

## Core Styling Philosophy

- **Utility-first**: Use Tailwind utility classes for all styling
- **No CSS Modules**: Avoid `.module.css` files to prevent dual-styling systems
- **Component variants**: Use `cva` for systematic component state management
- **Semantic tokens**: Use design system tokens instead of hardcoded values
- **Automated tooling**: Leverage automated class sorting and conflict resolution

## The `cn()` Utility

Always wrap class names in the `cn()` utility function:

```typescript
import { cn } from '@/lib/utils';

// ✅ Correct usage
<div className={cn("bg-blue-500 text-white p-4", className)}>
  Content
</div>

// ❌ Wrong - no conflict resolution
<div className="bg-blue-500 text-white p-4">
  Content
</div>
```

### Why cn() is Required
The `cn()` utility combines:
- **clsx**: Conditional class logic
- **tailwind-merge**: Conflict resolution

```typescript
// Example of conflict resolution
cn("bg-red-500", "bg-blue-500") // Returns: "bg-blue-500"
cn("p-4", "px-8") // Returns: "p-4 px-8" (no conflict)
cn("p-4", "p-8") // Returns: "p-8" (later wins)
```

This ensures that when components accept a `className` prop, it properly overrides default styles:

```typescript
// Component with default styles
export function Button({ className, ...props }: ButtonProps) {
  return (
    <button 
      className={cn("bg-blue-500 hover:bg-blue-600 text-white", className)}
      {...props}
    />
  );
}

// Usage - className overrides default
<Button className="bg-red-500">  {/* Red background wins */}
  Custom Button
</Button>
```

## Component Variants with CVA

Use `cva` (Class Variance Authority) for defining component states instead of manual `if/else` logic:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

// ✅ Good: Using cva for variants
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
         VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// ❌ Bad: Manual if/else logic  
export function Button({ variant, size, className, ...props }: ButtonProps) {
  let variantClasses = "bg-primary text-primary-foreground";
  
  if (variant === "destructive") {
    variantClasses = "bg-destructive text-destructive-foreground";
  } else if (variant === "outline") {
    variantClasses = "border border-input bg-background";
  }
  
  let sizeClasses = "h-10 px-4 py-2";
  if (size === "sm") {
    sizeClasses = "h-9 px-3";
  } else if (size === "lg") {
    sizeClasses = "h-11 px-8";
  }
  
  return (
    <button 
      className={cn("inline-flex items-center", variantClasses, sizeClasses, className)}
      {...props}
    />
  );
}
```

## Semantic Tokens vs Hardcoded Values

### ✅ Use Semantic Design Tokens

```typescript
// ✅ Good: Semantic tokens (support dark mode automatically)
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Secondary text</p>
  <button className="bg-accent hover:bg-accent/80">Button</button>
</div>

// ✅ Good: Standard Tailwind semantic colors
<div className="bg-slate-100 dark:bg-slate-800">
  <p className="text-slate-600 dark:text-slate-300">Text</p>
</div>
```

### ❌ Avoid Hardcoded Hex Values

```typescript
// ❌ Bad: Hardcoded hex values (no dark mode support)
<div className="bg-[#1e293b] text-[#f8fafc]">
  <p className="text-[#64748b]">Text</p>
</div>

// ❌ Bad: Arbitrary values without semantic meaning
<div className="bg-[#ff6b6b] text-[#ffffff]">
  Content
</div>
```

### Design Tokens Configuration

The semantic tokens are defined in `globals.css`:

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    
    /* ... more tokens */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    /* ... dark mode overrides */
  }
}
```

## Class Organization & Sorting

### Automated Sorting
The project uses `prettier-plugin-tailwindcss` which automatically sorts classes on save:

```typescript
// Before save (random order)
<div className="text-white hover:bg-blue-600 p-4 bg-blue-500 rounded-md">

// After save (sorted automatically)  
<div className="rounded-md bg-blue-500 p-4 text-white hover:bg-blue-600">
```

### Recommended Class Order
When writing classes manually, follow this logical order:
1. **Layout**: `flex`, `grid`, `block`, etc.
2. **Positioning**: `absolute`, `relative`, `top`, etc.  
3. **Box model**: `w-`, `h-`, `m-`, `p-`, `border-`, etc.
4. **Typography**: `text-`, `font-`, `leading-`, etc.
5. **Visual**: `bg-`, `shadow-`, `rounded-`, etc.
6. **Interactive**: `hover:`, `focus:`, `active:`, etc.
7. **Responsive**: `sm:`, `md:`, `lg:`, etc.

```typescript
// ✅ Well-organized classes
<div className="
  flex items-center justify-between 
  w-full h-12 px-4 py-2 
  text-sm font-medium text-primary-foreground
  bg-primary border border-primary/20 rounded-md shadow-sm
  hover:bg-primary/90 focus:ring-2 focus:ring-primary/50
  sm:w-auto md:px-6
">
```

## Component Styling Patterns

### Base Component Pattern
```typescript
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      size: {
        sm: "p-3",
        default: "p-6", 
        lg: "p-8",
      },
      variant: {
        default: "border-border",
        elevated: "shadow-lg border-0",
        outlined: "border-2 border-primary/20",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
         VariantProps<typeof cardVariants> {}

export function Card({ className, size, variant, ...props }: CardProps) {
  return (
    <div 
      className={cn(cardVariants({ size, variant, className }))}
      {...props}
    />
  );
}
```

### Responsive Design
```typescript
// ✅ Mobile-first responsive design
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  md:grid-cols-3 md:gap-8  
  lg:grid-cols-4
">
  {/* Cards */}
</div>

// ✅ Responsive text sizing
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

### Dark Mode Support
```typescript
// ✅ Dark mode with semantic tokens (automatic)
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Automatic dark mode</p>
</div>

// ✅ Manual dark mode classes (when needed)
<div className="bg-white dark:bg-slate-900">
  <p className="text-slate-900 dark:text-slate-100">Manual dark mode</p>
</div>
```

## Common Styling Anti-Patterns

### ❌ CSS Modules
```typescript
// ❌ Don't use CSS modules
import styles from './Component.module.css';

<div className={styles.container}>
  <p className={styles.text}>Content</p>
</div>
```

### ❌ Inline Styles
```typescript
// ❌ Avoid inline styles
<div style={{ backgroundColor: '#3b82f6', padding: '16px' }}>
  Content
</div>
```

### ❌ Hardcoded Class Strings
```typescript
// ❌ Don't hardcode variant logic
function Button({ variant, ...props }) {
  const classes = variant === 'primary' 
    ? 'bg-blue-500 text-white' 
    : 'bg-gray-200 text-gray-800';
    
  return <button className={classes} {...props} />;
}
```

### ❌ Conflicting Classes
```typescript
// ❌ Classes that conflict (without cn() resolution)
<div className="p-4 p-8"> {/* Both padding classes applied */}
  
// ✅ Proper conflict resolution
<div className={cn("p-4", "p-8")}> {/* Only p-8 applied */}
```

## Performance Considerations

### Tree Shaking
Tailwind automatically purges unused classes in production. Follow these practices:

```typescript
// ✅ Static class names (included in bundle)
<div className="bg-blue-500 text-white">

// ✅ Dynamic but predictable (included via safelist)
<div className={cn("bg-blue-500", isActive && "bg-blue-700")}>

// ❌ Fully dynamic class names (may be purged)
const color = getRandomColor(); // Returns "bg-red-500" or "bg-green-500"
<div className={color}> {/* Might be purged if not found in code */}
```

### Bundle Size
- Semantic tokens reduce CSS bundle size
- CVA variants are tree-shaken automatically
- Automated class sorting prevents duplication

## Development Workflow

### VSCode Extensions
Recommended extensions for better DX:
- `Tailwind CSS IntelliSense` - Autocomplete and hover info
- `Prettier - Code formatter` - Automatic class sorting

### Configuration Files
```json
// .vscode/settings.json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

This styling approach ensures consistent, maintainable, and scalable styling across the entire application while leveraging the power of Tailwind CSS and modern tooling.