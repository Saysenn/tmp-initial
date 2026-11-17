// img-gen settings. Every setting lives here; keys come from .env.local next to this file.
// To switch model: change IMG_PROVIDER in .env.local, or pass --provider <name>.
// To add a model: copy one entry under `providers` and give it a new name.
import { env } from "./lib/env.mjs";

export const CONFIG = {
  // Defaults used when the job file or command line doesn't say otherwise.
  provider: env.IMG_PROVIDER || "mflux",
  writer: env.PROMPT_WRITER || "template",
  style: "packshot",
  outDir: "out/img-gen",
  count: 1,

  // Output files. Sizes are extra smaller copies (width in px) next to the main image.
  output: { format: "webp", quality: 82, sizes: [600, 300] },
  // "folders": products/<name>/<name>.webp, "flat": products/<name>.webp
  layout: "folders",
  // Folder name per item type
  folders: { product: "products", brand: "brands", category: "categories", site: "site", banner: "banners" },

  // Cleanup: temp folders from stopped runs older than this are deleted at start.
  // pruneStale deletes images of items removed from the job after every full run.
  cleanup: { tempMaxAgeMs: 2 * 60 * 60_000, pruneStale: true },

  // Reliability
  retries: 3,
  retryDelayMs: 2000,
  timeoutMs: 10 * 60_000,

  // Image makers. `type` picks the code in providers/, the rest is that provider's settings.
  // costPerImage is a rough USD estimate used by --dry-run; edit it to match your plan.
  providers: {
    // Local, free. Runs on this Mac through mflux (Apple silicon).
    mflux: {
      type: "mflux",
      command: env.MFLUX_COMMAND || "mflux-generate-z-image-turbo",
      // Already 4-bit, ~6 GB download. Leave quantize empty for pre-quantized models.
      model: env.MFLUX_MODEL || "mflux-community/z-image-turbo-mflux-q4",
      quantize: null,
      steps: 9,
      lowRam: true,
      negative: false, // Z-Image Turbo ignores negative prompts
      timeoutMs: 30 * 60_000, // local runs are slow when RAM is busy
      waitForOthers: true, // take turns with other local image jobs instead of sharing RAM
      concurrency: 1,
      costPerImage: 0,
    },
    // Local Qwen-Image through mflux. Needs a large download and lots of RAM.
    "qwen-local": {
      type: "mflux",
      command: "mflux-generate-qwen",
      model: env.QWEN_IMAGE_MODEL || "",
      quantize: 4,
      steps: 20,
      lowRam: true,
      timeoutMs: 60 * 60_000,
      waitForOthers: true,
      concurrency: 1,
      costPerImage: 0,
    },
    openai: {
      type: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      quality: "medium",
      concurrency: 3,
      costPerImage: 0.04,
    },
    // Any local server with an OpenAI style /v1/images/generations route.
    "local-openai": {
      type: "openai",
      baseUrl: env.LOCAL_IMAGE_URL || "http://localhost:8080/v1",
      apiKey: env.LOCAL_IMAGE_KEY || "local",
      model: env.LOCAL_IMAGE_MODEL || "",
      concurrency: 1,
      costPerImage: 0,
    },
    gemini: {
      type: "gemini",
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
      concurrency: 3,
      costPerImage: 0.04,
    },
    // Hosted Qwen-Image from Alibaba Cloud.
    qwen: {
      type: "dashscope",
      baseUrl: env.DASHSCOPE_URL || "https://dashscope-intl.aliyuncs.com",
      apiKey: env.DASHSCOPE_API_KEY,
      model: env.DASHSCOPE_IMAGE_MODEL || "qwen-image",
      concurrency: 2,
      costPerImage: 0.035,
    },
    replicate: {
      type: "replicate",
      apiKey: env.REPLICATE_API_TOKEN,
      model: env.REPLICATE_IMAGE_MODEL || "qwen/qwen-image",
      concurrency: 2,
      costPerImage: 0.03,
    },
    // Test run: makes plain placeholder images, no model or key needed.
    mock: { type: "mock", concurrency: 4, costPerImage: 0 },
  },

  // Prompt writers. They turn a short item ("Heinz Ketchup 1L") into a detailed prompt.
  // Claude and Qwen write text only; the image provider above draws the picture.
  writers: {
    template: { type: "template" },
    // Your local Qwen through mlx_lm.server, LM Studio or Ollama (all OpenAI style).
    "qwen-local": {
      type: "openai-chat",
      baseUrl: env.LOCAL_LLM_URL || "http://localhost:8090/v1",
      apiKey: env.LOCAL_LLM_KEY || "local",
      model: env.LOCAL_LLM_MODEL || "mlx-community/Qwen3-4B-4bit",
    },
    openai: {
      type: "openai-chat",
      baseUrl: "https://api.openai.com/v1",
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_TEXT_MODEL || "gpt-5-mini",
    },
    // Needs: npm i @anthropic-ai/sdk
    claude: {
      type: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.ANTHROPIC_MODEL || "claude-opus-5-5",
      effort: "low",
    },
  },
};
