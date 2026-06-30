// Root ESLint config. Owns linting for the Node ESM build/dev/preview scripts,
// the shared workspace packages, the Bun/Hono server, and the Vite/React task
// app (apps/app) — so the monorepo runs a single ESLint toolchain at one
// version instead of apps/app carrying a duplicate, drifting copy. apps/web
// keeps its own config because its Astro + TypeScript parsing is self-contained
// and declares no duplicate dependencies. Formatting is owned by Prettier
// (`prettier --check .`), so `eslint-config-prettier` stays last to disable
// conflicting formatting rules; `arrow-body-style` is re-enabled for apps/app
// *after* prettier because eslint-config-prettier turns it off by default.
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/.astro/**"] },
  js.configs.recommended,
  {
    files: ["scripts/**/*.mjs", "*.mjs"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["packages/**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      eqeqeq: ["error", "always"],
    },
  },
  {
    // The Bun/Hono server (apps/server) is linted here, against the root
    // ESLint toolchain, so the monorepo keeps a single ESLint major version.
    files: ["apps/server/**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, Bun: "readonly" },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      eqeqeq: ["error", "always"],
    },
  },
  {
    // The Vite/React task app (apps/app). Browser globals + React rules; uses
    // src/ path aliases instead of relative imports.
    files: ["apps/app/**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/self-closing-comp": ["error", { component: true, html: true }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["./", "../"], message: "Use src/ path aliases." },
          ],
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      eqeqeq: ["error", "always"],
    },
  },
  prettier,
  {
    // Re-enable after eslint-config-prettier (which disables it by default).
    files: ["apps/app/**/*.{ts,tsx}"],
    rules: {
      "arrow-body-style": ["error", "as-needed"],
    },
  }
);
