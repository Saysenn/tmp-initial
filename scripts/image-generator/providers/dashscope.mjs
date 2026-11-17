// Hosted Qwen-Image on Alibaba Cloud (DashScope / Model Studio).
import { CONFIG } from "../config.mjs";
import { download, request, requireKey } from "../lib/utils.mjs";

export const check = (cfg, name) => requireKey(cfg, name, "DASHSCOPE_API_KEY");

export async function generate({ prompt, negative, width, height, seed }, cfg) {
  const res = await request(
    `${cfg.baseUrl}/api/v1/services/aigc/multimodal-generation/generation`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.model,
        input: { messages: [{ role: "user", content: [{ text: prompt }] }] },
        parameters: { size: `${width}*${height}`, seed, negative_prompt: negative || undefined, prompt_extend: false, watermark: false },
      }),
    },
    CONFIG.timeoutMs,
  );
  const json = await res.json();
  const url = json.output?.choices?.[0]?.message?.content?.find((c) => c.image)?.image;
  if (!url) throw new Error(`No image in the response: ${JSON.stringify(json).slice(0, 200)}`);
  return download(url, CONFIG.timeoutMs);
}
