import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() || randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
  maximumFileSizeToCacheInBytes: 512 * 1024,
  globPatterns: [
    ".next/static/chunks/**/*.js",
    ".next/static/chunks/**/*.css",
    ".next/static/media/**/*",
  ],
  globIgnores: [
    "**/node_modules/**",
    "**/.git/**",
    "**/graphify-out/**",
    "**/.cursor/**",
    "public/fonts/**",
    "**/*.map",
    "**/*.zip",
    "**/*.eot",
    "**/*.ttf",
    "**/*.woff",
    "**/*.{png,jpg,jpeg,gif,webp,svg,ico}",
  ],
});
