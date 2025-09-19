import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";

// Ultra-simple ESLint config with proper TypeScript support
export default [
  {
    // Just ignore everything that causes problems
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "*.config.js",
      "*.config.mjs",
      "next-env.d.ts", // Ignore the problematic file
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      // Only the most basic rules to catch actual errors
      "no-unused-vars": "off", // Turn off for TypeScript files
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
