// OpenAI Images API, or any server with the same /images routes (set baseUrl).
// With reference images it uses /images/edits so logos and packaging stay the same.
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { CONFIG } from "../config.mjs";
import { download, request, requireKey } from "../lib/utils.mjs";

export const check = (cfg, name) => requireKey(cfg, name, "OPENAI_API_KEY (or LOCAL_IMAGE_KEY)");

const sizeFor = (w, h) => (w > h ? "1536x1024" : h > w ? "1024x1536" : "1024x1024");

export async function generate({ prompt, width, height, refs }, cfg) {
  const headers = { Authorization: `Bearer ${cfg.apiKey}` };
  const size = cfg.size || sizeFor(width, height);
  let res;
  if (refs?.length) {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("size", size);
    if (cfg.model) form.append("model", cfg.model);
    if (cfg.quality) form.append("quality", cfg.quality);
    for (const ref of refs) form.append("image[]", new Blob([await readFile(ref)], { type: "image/png" }), basename(ref));
    res = await request(`${cfg.baseUrl}/images/edits`, { method: "POST", headers, body: form }, CONFIG.timeoutMs);
  } else {
    const body = { prompt, size, n: 1, ...(cfg.model && { model: cfg.model }), ...(cfg.quality && { quality: cfg.quality }) };
    res = await request(
      `${cfg.baseUrl}/images/generations`,
      { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body) },
      CONFIG.timeoutMs,
    );
  }
  const item = (await res.json()).data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) return download(item.url, CONFIG.timeoutMs);
  throw new Error("No image in the response");
}
