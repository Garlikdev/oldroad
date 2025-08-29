// Ultra-simple ESLint config - no complex flat config nonsense
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
    rules: {
      // Only the most basic rules to catch actual errors
      "no-unused-vars": "off", // Turn off for TypeScript files
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
