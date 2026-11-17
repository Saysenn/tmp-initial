// Loads the Anthropic SDK only when the Claude writer is used, so the tool runs without it otherwise.
import { fail } from "./utils.mjs";

export async function createAnthropic(apiKey) {
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    return new Anthropic({ apiKey });
  } catch {
    fail("The Claude writer needs the Anthropic SDK: npm i -D @anthropic-ai/sdk");
  }
}
