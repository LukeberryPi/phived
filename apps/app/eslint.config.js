import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "**/*.mjs"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
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
  // Formatting is owned by the root `prettier --check .` gate. Keep
  // eslint-config-prettier last so ESLint never fights Prettier.
  prettier,
  {
    rules: {
      "arrow-body-style": ["error", "as-needed"],
    },
  }
);
