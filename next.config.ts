import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

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
};

export default withSerwist(nextConfig);
