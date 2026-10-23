import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

// Secrets live in the repo-root .env.local (git-ignored). Next would only
// load web/.env.local on its own. Do not log these values.
const rootEnvPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
if (fs.existsSync(rootEnvPath)) {
  for (const line of fs.readFileSync(rootEnvPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) {
      continue;
    }
    const [, name, raw] = match;
    if (process.env[name] === undefined) {
      process.env[name] = raw.replace(/^["']|["']$/g, "");
    }
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
