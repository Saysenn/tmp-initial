// Google Gemini image models. Reference images are sent inline.
import { readFile } from "node:fs/promises";
import { CONFIG } from "../config.mjs";
import { request, requireKey } from "../lib/utils.mjs";

export const check = (cfg, name) => requireKey(cfg, name, "GEMINI_API_KEY");

export async function generate({ prompt, width, height, refs }, cfg) {
  const parts = [{ text: `${prompt}\nAspect ratio ${width}:${height}.` }];
  for (const ref of refs ?? []) parts.push({ inline_data: { mime_type: "image/png", data: (await readFile(ref)).toString("base64") } });
  const res = await request(
    `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.apiKey },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ["IMAGE"] } }),
    },
    CONFIG.timeoutMs,
  );
  const json = await res.json();
  const img = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const data = img?.inlineData?.data ?? img?.inline_data?.data;
  if (!data) throw new Error(`No image in the response (${json.candidates?.[0]?.finishReason ?? "unknown"})`);
  return Buffer.from(data, "base64");
}
