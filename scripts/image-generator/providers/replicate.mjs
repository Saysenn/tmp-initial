// Replicate: any image model by "owner/name". Waits for the result, then polls if still running.
import { CONFIG } from "../config.mjs";
import { download, request, requireKey, sleep } from "../lib/utils.mjs";

export const check = (cfg, name) => requireKey(cfg, name, "REPLICATE_API_TOKEN");

export async function generate({ prompt, negative, width, height, seed }, cfg) {
  const headers = { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json", Prefer: "wait" };
  const input = { prompt, seed, width, height, aspect_ratio: width === height ? "1:1" : undefined, negative_prompt: negative || undefined, ...cfg.input };
  let res = await request(`https://api.replicate.com/v1/models/${cfg.model}/predictions`, { method: "POST", headers, body: JSON.stringify({ input }) }, CONFIG.timeoutMs);
  let pred = await res.json();
  const deadline = Date.now() + CONFIG.timeoutMs;
  while (["starting", "processing"].includes(pred.status) && Date.now() < deadline) {
    await sleep(2000);
    res = await request(pred.urls.get, { headers }, CONFIG.timeoutMs);
    pred = await res.json();
  }
  if (pred.status !== "succeeded") throw new Error(`Replicate ${pred.status}: ${pred.error ?? ""}`);
  const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  return download(url, CONFIG.timeoutMs);
}
