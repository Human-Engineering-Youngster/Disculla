import prettier from "eslint-config-prettier";
import boundariesPlugin from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import lint from "typescript-eslint";

export default lint.config(
  ...lint.configs.recommended,
  prettier,

  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
      boundaries: boundariesPlugin,
    },

    settings: {
      "boundaries/elements": [
        {
          type: "shared",
          pattern: "src/shared/**/*",
        },
        {
          type: "features",
          pattern: "src/features/**/*",
        },
        {
          type: "app",
          pattern: "src/app/**/*",
        },
      ],
      "boundaries/ignore": ["**/*.test.*"],
    },

    rules: {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",

      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: [
            {
              pattern: "react**",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "@shared/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@features/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
        },
      ],

      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "features",
              allow: ["shared"],
              message: "Features can only import from shared. Use @shared/* imports.",
            },
            {
              from: "app",
              allow: ["features", "shared"],
              message: "App can import from features and shared.",
            },
            {
              from: "shared",
              allow: ["shared"],
              message: "Shared can only import from shared. No features imports allowed.",
            },
          ],
        },
      ],
    },
  }
);
