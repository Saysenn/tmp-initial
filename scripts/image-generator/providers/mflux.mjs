// Local image models on Apple silicon through the mflux CLI (Z-Image, Qwen-Image, FLUX, ...).
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { CONFIG } from "../config.mjs";
import { fail, sleep } from "../lib/utils.mjs";

const run = promisify(execFile);

export async function check(cfg) {
  try {
    await run(cfg.command, ["--help"], { timeout: 30_000 });
  } catch {
    fail(`"${cfg.command}" not found. Install mflux: uv tool install mflux`);
  }
}

/** True while another mflux image job runs on this machine (ours are never running at this point). */
async function othersRunning() {
  try {
    await run("pgrep", ["-f", "mflux-generate"]);
    return true;
  } catch {
    return false; // pgrep exits 1 when nothing matches
  }
}

/** Two local models at once overflow RAM and both stall, so take turns with other jobs. */
async function waitForTurn(cfg) {
  if (!cfg.waitForOthers || !(await othersRunning())) return;
  console.log("  … another local image job is running, waiting for it to finish");
  while (await othersRunning()) await sleep(cfg.waitPollMs ?? 15_000);
}

export async function generate({ prompt, negative, width, height, seed, refs }, cfg) {
  await waitForTurn(cfg);
  const dir = await mkdtemp(join(tmpdir(), "img-gen-"));
  const out = join(dir, "out.png");
  const args = ["--prompt", prompt, "--width", String(width), "--height", String(height), "--seed", String(seed), "--output", out];
  if (cfg.model) args.push("--model", cfg.model);
  if (cfg.quantize) args.push("--quantize", String(cfg.quantize));
  if (cfg.steps) args.push("--steps", String(cfg.steps));
  if (cfg.lowRam) args.push("--low-ram");
  if (negative && cfg.negative !== false) args.push("--negative-prompt", negative);
  if (refs?.[0]) args.push("--image-path", refs[0], "--image-strength", String(cfg.refStrength ?? 0.4));
  try {
    await run(cfg.command, args, { timeout: cfg.timeoutMs ?? CONFIG.timeoutMs, killSignal: "SIGKILL", maxBuffer: 64 * 1024 * 1024 });
    return await readFile(out);
  } catch (err) {
    if (err.killed) {
      const e = new Error(`timed out after ${Math.round((cfg.timeoutMs ?? CONFIG.timeoutMs) / 60_000)} min. Close other heavy apps or raise timeoutMs in config.mjs`);
      e.fatal = true; // retrying a slow local run only wastes time
      throw e;
    }
    const lines = (err.stderr || err.message || "").split(/[\r\n]+/).filter((l) => l.trim() && !/it\/s\]|UserWarning|warn_ignored/.test(l));
    throw new Error(`mflux failed: ${lines.slice(-2).join(" ").slice(0, 300)}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
