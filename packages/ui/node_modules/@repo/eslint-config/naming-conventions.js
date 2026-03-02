// ESLint plugin for file naming conventions
import path from "path";
import { isExemptFromComponentNaming } from "./component-naming-exceptions.js";

const namingConventions = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce file naming conventions",
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.getFilename();
        const basename = path.basename(filename);
        const ext = path.extname(filename);
        const nameWithoutExt = basename.replace(ext, "");
        
        // Skip node_modules and generated files
        if (filename.includes("node_modules") || filename.includes(".gen.")) {
          return;
        }

        // Component files (.tsx) should be PascalCase
        if (ext === ".tsx") {
          // Check if file is exempt from component naming rules
          const isExempt = isExemptFromComponentNaming(filename);
          
          if (!isExempt && !/^[A-Z][A-Za-z0-9]*$/.test(nameWithoutExt)) {
            context.report({
              node,
              message: `Component file "${basename}" should be PascalCase (e.g., "UserProfile.tsx")`,
            });
          }
        }
        
        // Hook files should start with "use" and be camelCase
        if (ext === ".ts" && nameWithoutExt.startsWith("use")) {
          if (!/^use[A-Z][A-Za-z0-9]*$/.test(nameWithoutExt)) {
            context.report({
              node,
              message: `Hook file "${basename}" should be camelCase starting with "use" (e.g., "useUserProfile.ts")`,
            });
          }
        }
        
        // Utility/lib files should be camelCase
        if (ext === ".ts" && !nameWithoutExt.startsWith("use")) {
          // Check if file is exempt from naming rules
          const isExempt = isExemptFromComponentNaming(filename);
          
          // Skip exempt files from naming convention checks
          if (isExempt) {
            return;
          }
          
          // Special check for kebab-case which should be camelCase
          if (nameWithoutExt.includes("-")) {
            const camelCaseName = nameWithoutExt.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            context.report({
              node,
              message: `TypeScript file '${basename}' uses kebab-case but should use camelCase: '${camelCaseName}.ts'. CLI commands use kebab-case, but TypeScript files use camelCase.`,
            });
            return;
          }
          
          // Allow some common patterns
          const allowedPatterns = [
            "index", "main", "app", "router", "config", 
            /^[a-z][A-Za-z0-9]*$/, // camelCase
            /^[a-z]+\.[a-z]+$/ // like env.local
          ];
          
          const isAllowed = allowedPatterns.some(pattern => {
            if (typeof pattern === "string") return nameWithoutExt === pattern;
            return pattern.test(nameWithoutExt);
          });
          
          if (!isAllowed) {
            context.report({
              node,
              message: `TypeScript file "${basename}" should be camelCase (e.g., "apiClient.ts")`,
            });
          }
        }

        // Story files should be PascalCase.stories.tsx
        if (basename.includes(".stories.")) {
          const storyName = nameWithoutExt.replace(".stories", "");
          if (!/^[A-Z][A-Za-z0-9]*$/.test(storyName)) {
            context.report({
              node,
              message: `Story file "${basename}" should be PascalCase.stories.tsx (e.g., "UserProfile.stories.tsx")`,
            });
          }
        }
      },
    };
  },
};

export default {
  rules: {
    "naming-conventions": namingConventions,
  },
};