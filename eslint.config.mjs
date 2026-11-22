// @ts-check
// A subset of Home Assistant frontend's eslint.config.mjs: the same plugin set and
// project rules, without the rules that guard its own app structure.

import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { configs as litConfigs } from "eslint-plugin-lit";
import { configs as wcConfigs } from "eslint-plugin-wc";
import { configs as a11yConfigs } from "eslint-plugin-lit-a11y";

export default tseslint.config(
  js.configs.recommended,
  eslintConfigPrettier,
  litConfigs["flat/all"],
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  wcConfigs["flat/recommended"],
  a11yConfigs.recommended,
  {
    plugins: { "unused-imports": unusedImports },
    languageOptions: {
      globals: { ...globals.browser },
      parser: tseslint.parser,
      sourceType: "module",
    },
    rules: {
      "array-callback-return": ["error", { allowImplicit: true }],
      "consistent-return": "error",
      curly: ["error", "multi-line"],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-lonely-if": "error",
      "no-unneeded-ternary": ["error", { defaultAssignment: false }],
      "no-useless-return": "error",
      "one-var": ["error", "never"],
      "prefer-arrow-callback": "error",
      "prefer-exponentiation-operator": "error",
      "prefer-object-spread": "error",
      "no-bitwise": "error",
      "no-console": "error",
      "no-restricted-globals": [2, "event"],
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "lit/attribute-names": "off",
      "lit/no-template-arrow": "off",
      "lit/no-template-map": "off",
      "wc/guard-super-call": "off",
    },
  },
  { ignores: ["dist/", "node_modules/", "coverage/"] }
);
