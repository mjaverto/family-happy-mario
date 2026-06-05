import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**"],
  },
  js.configs.recommended,
  {
    // Node tooling: build/test scripts and ESM config files.
    files: ["scripts/**/*.{js,mjs}", "*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.browser },
    },
    rules: {
      // Game uses globals shared across <script> files; cross-file refs
      // would otherwise trip no-undef.
      "no-undef": "off",
      "no-unused-vars": "warn",
      "no-empty": "warn",
      // var-based, function-scoped game code re-declares loop temporaries
      // across blocks; this is legal JS, so warn rather than error.
      "no-redeclare": "warn",
    },
  },
];
