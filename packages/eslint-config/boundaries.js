import boundaries from "eslint-plugin-boundaries";

export default {
  plugins: {
    boundaries,
  },
  settings: {
    // only check files inside 'src'
    "boundaries/include": ["src/**/*"],

    // (Third party Library)
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: [
          "apps/*/tsconfig.json",
          "packages/*/tsconfig.json",
          "tsconfig.json",
        ],
      },
      node: true,
    },

    // Features
    "boundaries/elements": [
      {
        type: "feature",
        mode: "full",
        // Matches any file deep inside src/features/
        pattern: ["src/features/*/**/*"],
        // Captures the folder name (e.g., 'auth') as a variable
        capture: ["feature"],
      },
      // App Layer
      {
        type: "app-layer",
        mode: "full",
        pattern: [
          "src/*",
          "src/routes/**/*",
          "src/pages/**/*",
          "src/main.tsx",
          "src/App.tsx",
          "src/vite-env.d.ts",
        ],
      },

      // SHARED UI (Dumb Components inside a particular apps)
      {
        type: "shared",
        mode: "full",
        pattern: ["src/shared/**/*"],
      },

      // APP LEVEL UTILS (Pure Logic & Config)
      {
        type: "global-utils",
        mode: "full",
        pattern: [
          "src/config/**/*",
          "src/hooks/**/*",
          "src/lib/**/*",
          "src/stores/**/*",
          "src/types/**/*",
          "src/utils/**/*",
        ],
      },
    ],
  },
  rules: {
    // -------------------------------------------------------------------------
    // RULE A: NO UNKNOWN FILES
    // Every file in src/ must belong to one of the layers above.
    // -------------------------------------------------------------------------
    "boundaries/no-unknown": "error",

    // -------------------------------------------------------------------------
    // RULE B: STRICT DEPENDENCY GRAPH
    // -------------------------------------------------------------------------
    "boundaries/element-types": [
      "error",
      {
        // Allow external libraries (zod, react) by default
        default: "allow",
        rules: [
          // 1. FEATURES: Can only import SAME feature, Shared UI, or Utils
          {
            from: "feature",
            allow: [
              "shared",
              "global-utils",
              ["feature", { feature: "${from.feature}" }], // Allow internal imports
            ],
            disallow: [
              ["feature", { feature: "!${from.feature}" }], // ❌ Block OTHER features
              "app-layer", // ❌ Block App Orchestration
            ],
            message:
              "🚫 Feature Cross-Import Violation: Feature '${from.feature}' cannot import from feature '${target.feature}'. Features should be isolated. Consider using shared components, global state, or URL parameters instead.",
          },

          // 2. SHARED UI: Must be dumb (No Business Logic)
          {
            from: "shared",
            allow: ["shared", "global-utils"],
            disallow: ["feature", "app-layer"],
            message:
              "🚫 Shared Component Violation: Shared components cannot import from features or app layer. Keep shared components pure - they should only accept props and render UI.",
          },

          // 3. GLOBAL UTILS: Must be pure
          {
            from: "global-utils",
            allow: ["global-utils", "shared"],
            disallow: ["feature", "app-layer"],
            message:
              "🚫 Utility Violation: Global utilities and hooks cannot import from features or app layer. Keep utilities pure - they should be reusable across the entire application.",
          },
        ],
      },
    ],

    // -------------------------------------------------------------------------
    // RULE C: PUBLIC API (Index Files)
    // -------------------------------------------------------------------------
    // ... inside rules
    "boundaries/entry-point": [
      "error",
      {
        default: "disallow",
        rules: [
          {
            // Allow all imports within same feature - no internal barrel restrictions
            target: "feature",
            allow: "**/*",
            message: "🚫 Cross-Feature Import Violation: Cannot directly import from other features. Use the feature's public API (index.ts) instead.",
          },
          {
            // Why? - Acts like a third-party library. Consumers shouldn't know about internal styling files.
            target: "shared",
            allow: "index.(ts|tsx)",
            message: "🚫 Shared Component Violation: Cannot import '{{target}}' directly. Please create an index.ts file in the shared folder and export components from there. This keeps shared components properly encapsulated.",
          },
          // -------------------------------------------------------------------
          // This allows you to do avoid barrel imports for utils and app config
          // import env from '@/config/env'
          // Instead of forcing you to create an index.ts for every config file
          // Ok import any file, any folder, or any path inside global-utils or app-layer
          // Why? - Avoids circular deps. "Grab what you need" usage.
          // -------------------------------------------------------------------
          {
            target: "global-utils",
            allow: "**/*",
            message: "Utilities violation.",
          },
          {
            target: "app-layer",
            allow: "**/*",
            message: "App Layer violation.",
          },
        ],
      },
    ],
  },
};
