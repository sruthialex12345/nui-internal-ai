/**
 * ESLint Component Naming Exceptions Configuration
 * 
 * This file defines patterns for files that should be exempt from the 
 * PascalCase component naming convention rule.
 * 
 * Categories of exceptions:
 * 1. Framework/tooling files (routes, entries, configs)
 * 2. Test files (.test.tsx, .spec.tsx)
 * 3. Story files (.stories.tsx)
 * 4. Utility files (index.tsx, render.tsx)
 * 5. Special framework files (main.tsx, app.tsx at root level)
 */


export const componentNamingExceptions = [
  // TanStack Router files (use framework-specific naming)
  "**/routes/**/*.{ts,tsx,js,jsx}",
  "**/src/routes/**/*.{ts,tsx,js,jsx}",
  
  "**/main.{ts,tsx,js,jsx}",
  "**/index.{ts,tsx,js,jsx}",
  
  // Test files
  "**/*.test.{ts,tsx,js,jsx}",
  "**/*.spec.{ts,tsx,js,jsx}",
  "**/__tests__/**/*.{ts,tsx,js,jsx}",
  
  // Storybook story files
  "**/*.stories.{ts,tsx,js,jsx}",
  "**/*.story.{ts,tsx,js,jsx}",
  "**/stories/**/*.{ts,tsx,js,jsx}",
  
  // Test utilities and helpers
  "**/test-config/**/render.{ts,tsx,js,jsx}",
  "**/src/utils/render.{ts,tsx,js,jsx}",
  "**/src/test-utils/**/*.{ts,tsx,js,jsx}",
  
  // Configuration files
  "**/eslint.config.{ts,js}",
  "**/vite.config.{ts,js}",
  "**/tailwind.config.{ts,js}",
  "**/vitest.config.{ts,js}",
  
  // Generated files
  "**/routeTree.gen.{ts,tsx}",
  "**/*.gen.{ts,tsx}",
  "**/*.generated.{ts,tsx}",
];

export const specificFileExceptions = [
  // Test utilities
  "packages/test-config/src/utils/render.tsx",
  
  "apps/admin/src/main.tsx",
  "apps/cit-compass/src/main.tsx",
  
  "apps/admin/src/routeTree.gen.ts",
  "apps/cit-compass/src/routeTree.gen.ts",
];

// Directories where PascalCase should NOT be enforced
export const exemptDirectories = [
  "**/routes/**",
  "**/stories/**", 
  "**/__tests__/**",
  "**/test/**",
  "**/tests/**",
  "**/.storybook/**",
];

/**
 * Get all exception patterns combined
 */
export function getAllExceptionPatterns() {
  return [
    ...componentNamingExceptions,
    ...specificFileExceptions,
    ...exemptDirectories,
  ];
}

/**
 * Check if a file path should be exempt from PascalCase component naming
 * @param {string} filePath - The file path to check
 * @returns {boolean} - True if the file should be exempt
 */
export function isExemptFromComponentNaming(filePath) {
  const patterns = getAllExceptionPatterns();
  
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  return patterns.some(pattern => {
    // Handle exact matches first
    if (pattern === normalizedPath) {
      return true;
    }
    
    // Convert glob pattern to regex
    let regexPattern = pattern
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\*\*/g, '.*') // ** matches any path
      .replace(/\*/g, '[^/]*') // * matches any filename part
      .replace(/\{([^}]+)\}/g, '($1)') // {ts,tsx} becomes (ts|tsx)
      .replace(/,/g, '|'); // comma to OR
    
    // Ensure pattern matches from start or after a path separator
    if (!regexPattern.startsWith('.*')) {
      regexPattern = '(^|/)' + regexPattern;
    }
    
    // Ensure pattern matches to end
    regexPattern += '$';
    
    const regex = new RegExp(regexPattern);
    return regex.test(normalizedPath);
  });
}

export default {
  componentNamingExceptions,
  specificFileExceptions,
  exemptDirectories,
  getAllExceptionPatterns,
  isExemptFromComponentNaming,
};