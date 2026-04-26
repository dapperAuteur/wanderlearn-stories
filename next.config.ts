import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A-Frame is loaded via dynamic import with ssr:false inside the scene
  // route. It mutates window/document at module load and cannot run
  // server-side. Marking it external keeps the bundler from trying to
  // pre-evaluate it during SSR builds.
  serverExternalPackages: ["aframe"],
};

export default nextConfig;
