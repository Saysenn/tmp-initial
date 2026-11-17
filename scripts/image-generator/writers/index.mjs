// Prompt writers turn an item into the subject part of the prompt.
// The style's `base` text is always added after it unchanged, so every image shares the same look.
import { createAnthropic } from "../lib/anthropic.mjs";
import { CONFIG } from "../config.mjs";
import { fail, request } from "../lib/utils.mjs";
import { fillTemplate } from "./template.mjs";

const SYSTEM = `You write the subject line of a prompt for an image generation model.
Describe only what is in the picture: the object, its packaging, shape, material, colors and the text printed on it.
Do not describe lighting, background, camera or style; those are added separately.
Keep real brand names and product names exactly as given. One paragraph, at most 60 words, no lists, no quotes, no preamble.`;

const userMsg = (item, draft) => `Item: ${JSON.stringify(item)}\nDraft: ${draft}\nWrite the subject line.`;
const clean = (text) => text.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^["'\s]+|["'\s]+$/g, "").trim();

const TYPES = {
  template: () => async (item, style) => fillTemplate(style.types?.[item.type] ?? style.types?.default ?? "{name}", item),

  "openai-chat": (cfg) => async (item, style) => {
    const draft = fillTemplate(style.types?.[item.type] ?? "{name}", item);
    const res = await request(
      `${cfg.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `${userMsg(item, draft)} /no_think` }],
        }),
      },
      CONFIG.timeoutMs,
    );
    const text = clean((await res.json()).choices?.[0]?.message?.content ?? "");
    return text || draft;
  },

  anthropic: (cfg) => {
    const client = createAnthropic(cfg.apiKey);
    return async (item, style) => {
      const draft = fillTemplate(style.types?.[item.type] ?? "{name}", item);
      const msg = await (await client).messages.create({
        model: cfg.model,
        max_tokens: 16000,
        output_config: { effort: cfg.effort },
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg(item, draft) }],
      });
      if (msg.stop_reason === "refusal") return draft;
      return clean(msg.content.filter((b) => b.type === "text").map((b) => b.text).join(" ")) || draft;
    };
  },
};

export function getWriter(name) {
  const cfg = CONFIG.writers[name];
  if (!cfg) fail(`Unknown prompt writer "${name}". Pick one of: ${Object.keys(CONFIG.writers).join(", ")}`);
  if (cfg.type !== "template" && !cfg.apiKey) fail(`Prompt writer "${name}" needs an API key in scripts/image-generator/.env.local`);
  return { name, cfg, write: TYPES[cfg.type](cfg) };
}
