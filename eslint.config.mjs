import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Copied byte-for-byte from witus-online lib/analytics (INTEGRATE.md step 3:
    // "Do not modify the provider"). Its one synchronous setState runs only when
    // PostHog was already initialized, so it can't cascade. Silence the rule here
    // instead of forking the file, which the conformance checker guards.
    files: ["src/lib/analytics/posthog-provider.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
