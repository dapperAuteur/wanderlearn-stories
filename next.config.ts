import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Only register the SW in production. Dev iteration is faster
  // without it caching half-built routes.
  disable: process.env.NODE_ENV !== "production",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  // A-Frame is loaded via dynamic import with ssr:false inside the scene
  // route. It mutates window/document at module load and cannot run
  // server-side. Marking it external keeps the bundler from trying to
  // pre-evaluate it during SSR builds.
  serverExternalPackages: ["aframe"],

  // PostHog ingest is proxied through our own origin (witus-online
  // lib/analytics/INTEGRATE.md step 2) so ad blockers don't drop events.
  // PostHog's endpoints use trailing slashes, which Next would 308 before the
  // rewrite runs, so trailing-slash redirects are off app-wide.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // /static first: assets come from a different upstream host than ingest.
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
};

// Sentry's build plugin wraps outermost so it sees the final webpack config.
// Safe with no Sentry env set: without SENTRY_AUTH_TOKEN it simply skips
// source-map upload (you get minified stack traces), and the runtime SDK stays
// inert without a DSN. org/project/authToken come from env so nothing secret is
// committed here. The collector is Better Stack via the Sentry protocol.
export default withSentryConfig(withSerwist(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    // Drops the SDK's own debug logging from the bundle. This replaces the
    // deprecated top-level `disableLogger` option.
    treeshake: { removeDebugLogging: true },
  },
});
