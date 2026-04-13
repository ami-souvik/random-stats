import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

const trimmedGlobals = Object.fromEntries(
  Object.entries({
    ...globals.browser,
    ...globals.node,
    React: "writable",
  }).map(([key, value]) => [key.trim(), value])
);

export default [
  {
    ignores: [".next/*", "node_modules/*", "dist/*"],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: trimmedGlobals,
    },
    plugins: {
      react: reactPlugin,
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@next/next/no-html-link-for-pages": "off",
      "no-unused-vars": "off",
      "no-undef": "error",
      "no-case-declarations": "off",
      "react/jsx-key": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
