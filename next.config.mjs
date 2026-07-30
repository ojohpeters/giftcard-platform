import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Using .mjs rather than .ts: Next 16 fails to load a TypeScript next.config
 * in this environment (the dev server exits silently). JS config loads fine.
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  // Pin the workspace root so Next stops picking ~/package-lock.json.
  turbopack: { root: projectRoot },
  // Strip console.* (except errors/warnings) from production bundles.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Allow next/image to optimize remote brand/flag artwork. Tighten these
  // patterns to your actual asset hosts in production.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
