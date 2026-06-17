import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

// Lints the Astro site, keeping globals scoped to the runtime each file
// actually runs in. Formatting is owned by the root `prettier --check .` gate,
// so eslint-config-prettier stays last to avoid formatting-rule conflicts.
export default tseslint.config(
  { ignores: ["dist/**", ".astro/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["astro.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...globals.serviceworker },
    },
  },
  {
    rules: {
      eqeqeq: ["error", "always"],
    },
  },
  prettier
);
