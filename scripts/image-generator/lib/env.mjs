// The only file that reads environment variables. Loads .env.local (then .env) from the tool folder.
// Values already set in the shell win.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const TOOL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const name of [".env.local", ".env"]) {
  const file = join(TOOL_DIR, name);
  if (existsSync(file)) process.loadEnvFile(file);
}

export const env = process.env;
