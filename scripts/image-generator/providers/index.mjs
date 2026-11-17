// Factory: picks the image provider by name from config.
// Every provider exports generate({ prompt, negative, width, height, seed, refs }) => Promise<Buffer>
import { CONFIG } from "../config.mjs";
import { fail } from "../lib/utils.mjs";

const TYPES = {
  mflux: () => import("./mflux.mjs"),
  openai: () => import("./openai.mjs"),
  gemini: () => import("./gemini.mjs"),
  dashscope: () => import("./dashscope.mjs"),
  replicate: () => import("./replicate.mjs"),
  mock: () => import("./mock.mjs"),
};

export async function getProvider(name) {
  const cfg = CONFIG.providers[name];
  if (!cfg) fail(`Unknown provider "${name}". Pick one of: ${Object.keys(CONFIG.providers).join(", ")}`);
  const load = TYPES[cfg.type];
  if (!load) fail(`Provider "${name}" has unknown type "${cfg.type}".`);
  const mod = await load();
  await mod.check?.(cfg, name);
  return { name, cfg, generate: (input) => mod.generate(input, cfg) };
}
