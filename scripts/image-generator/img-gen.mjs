#!/usr/bin/env node
// img-gen: bulk image generation with any provider. See README.md.
//   node scripts/image-generator/img-gen.mjs jobs/example.json
//   node scripts/image-generator/img-gen.mjs --type product --items "Heinz Ketchup 1L, Tilda Rice 10kg" --count 2
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { CONFIG } from "./config.mjs";
import { parseCsv } from "./lib/csv.mjs";
import { TOOL_DIR } from "./lib/env.mjs";
import { outputExt, saveImage } from "./lib/image.mjs";
import { cleanTempDirs, pruneOutputs } from "./lib/cleanup.mjs";
import { writeContactSheet } from "./lib/sheet.mjs";
import { fail, pool, slugify, withRetry } from "./lib/utils.mjs";
import { getProvider } from "./providers/index.mjs";
import { getWriter } from "./writers/index.mjs";

const HELP = `
img-gen: make many matching images in one run.

Usage
  img-gen <job.json | job.csv> [options]
  img-gen --type product --items "Name one, Name two" [options]

Options
  --provider <name>     Image model: ${Object.keys(CONFIG.providers).join(", ")}
  --writer <name>       Prompt writer: ${Object.keys(CONFIG.writers).join(", ")}
  --style <name|file>   Look shared by every image (styles/*.json)
  --count <n>           Versions per item
  --out <dir>           Output folder
  --ref <file>          Reference image for every item (logo, packshot)
  --limit <n>           Only the first n items (quick test)
  --concurrency <n>     Requests at once
  --dry-run             Show prompts and cost, make nothing
  --force               Remake images that already exist
  --fresh-prompts       Rewrite prompts instead of reusing saved ones
  --list                Show providers, writers and styles
`;

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    provider: { type: "string" }, writer: { type: "string" }, style: { type: "string" },
    count: { type: "string" }, out: { type: "string" }, ref: { type: "string" },
    type: { type: "string" }, items: { type: "string" }, limit: { type: "string" },
    concurrency: { type: "string" }, "dry-run": { type: "boolean" }, force: { type: "boolean" },
    "fresh-prompts": { type: "boolean" }, list: { type: "boolean" }, help: { type: "boolean", short: "h" },
  },
});

if (opt.help || (!positionals[0] && !opt.items && !opt.list)) {
  console.log(HELP);
  process.exit(0);
}

if (opt.list) {
  const { readdir } = await import("node:fs/promises");
  const styles = (await readdir(join(TOOL_DIR, "styles"))).map((f) => f.replace(/\.json$/, ""));
  const row = (name, c) => `  ${name.padEnd(14)} ${c.type.padEnd(12)} ${c.model || c.command || ""}${c.apiKey === undefined && c.type !== "mflux" && c.type !== "mock" && c.type !== "template" ? "  (no key set)" : ""}`;
  console.log(`\nProviders (default ${CONFIG.provider})\n${Object.entries(CONFIG.providers).map(([n, c]) => row(n, c)).join("\n")}`);
  console.log(`\nPrompt writers (default ${CONFIG.writer})\n${Object.entries(CONFIG.writers).map(([n, c]) => row(n, c)).join("\n")}`);
  console.log(`\nStyles\n  ${styles.join(", ")}\n`);
  process.exit(0);
}

// ---------- Load the job ----------
let job = {};
let jobDir = process.cwd();
if (positionals[0]) {
  const file = resolve(positionals[0]);
  if (!existsSync(file)) fail(`Job file not found: ${file}`);
  jobDir = dirname(file);
  const text = await readFile(file, "utf8");
  job = file.endsWith(".csv") ? { items: parseCsv(text) } : JSON.parse(text);
}
if (opt.items) {
  const extra = opt.items.split(",").map((name) => ({ type: opt.type || "product", name: name.trim() })).filter((i) => i.name);
  job.items = [...(job.items ?? []), ...extra];
}
if (!job.items?.length) fail("No items to make. Add items to the job file or pass --items.");

const settings = {
  provider: opt.provider || job.provider || CONFIG.provider,
  writer: opt.writer || job.writer || CONFIG.writer,
  style: opt.style || job.style || CONFIG.style,
  outDir: resolve(opt.out || job.outDir || CONFIG.outDir),
  count: Number(opt.count || job.count || CONFIG.count),
  output: { ...CONFIG.output, ...job.output },
  layout: job.layout || CONFIG.layout,
  folders: { ...CONFIG.folders, ...job.folders },
};

const stylePath = [settings.style, join(TOOL_DIR, "styles", `${settings.style}.json`)].find((p) => p.endsWith(".json") && existsSync(p));
if (!stylePath) fail(`Style not found: ${settings.style}`);
const style = JSON.parse(await readFile(stylePath, "utf8"));

const refPath = (p) => (isAbsolute(p) ? p : resolve(jobDir, p));
let items = job.items.map((i) => ({ type: "product", ...i }));
if (opt.limit) items = items.slice(0, Number(opt.limit));

// ---------- Plan the tasks ----------
const ext = outputExt(settings.output.format);
const tasks = items.flatMap((item) => {
  const slug = slugify(item.slug || item.name);
  const [width, height] = item.width ? [item.width, item.height ?? item.width] : (style.sizes?.[item.type] ?? [style.width, style.height]);
  const count = Number(item.count || settings.count);
  const refs = [item.ref || job.ref || opt.ref].filter(Boolean).map(refPath);
  for (const r of refs) if (!existsSync(r)) fail(`Reference image not found: ${r}`);
  return Array.from({ length: count }, (_, v) => ({
    item, slug, refs, width: Number(width), height: Number(height),
    variant: v + 1,
    seed: Number(item.seed ?? style.seed ?? 1) + v,
    base: join(
      settings.outDir,
      settings.folders[item.type] ?? slugify(item.type),
      ...(settings.layout === "folders" ? [slug] : []),
      count > 1 ? `${slug}-${v + 1}` : slug,
    ),
  }));
});

// ---------- Write prompts (saved so reruns and variants stay identical) ----------
const writer = getWriter(settings.writer);
const promptFile = join(settings.outDir, "prompts.json");
const saved = !opt["fresh-prompts"] && existsSync(promptFile) ? JSON.parse(await readFile(promptFile, "utf8")) : {};
const promptKey = (t) => `${settings.writer}:${style.name}:${t.item.type}/${t.slug}`;

console.log(`\nWriting prompts with "${settings.writer}" for ${items.length} item(s)...`);
const uniqueTasks = [...new Map(tasks.map((t) => [promptKey(t), t])).values()];
await pool(uniqueTasks, writer.cfg.type === "template" ? 8 : 2, async (t) => {
  const key = promptKey(t);
  if (saved[key]) return;
  const subject = t.item.subject || await withRetry(() => writer.write(t.item, style), { retries: CONFIG.retries, delayMs: CONFIG.retryDelayMs, label: t.item.name });
  saved[key] = `${subject}. ${style.bases?.[t.item.type] ?? style.base}`.replace(/\.\./g, ".");
});
await mkdir(settings.outDir, { recursive: true });
await writeFile(promptFile, JSON.stringify(saved, null, 2));
for (const t of tasks) t.prompt = saved[promptKey(t)];

// ---------- Dry run ----------
const providerCfg = CONFIG.providers[settings.provider];
if (!providerCfg) fail(`Unknown provider "${settings.provider}". Run with --list to see them.`);
const todo = tasks.filter((t) => opt.force || !existsSync(`${t.base}.${ext}`));
const cost = (todo.length * (providerCfg.costPerImage ?? 0)).toFixed(2);
console.log(`\nProvider: ${settings.provider} · Style: ${style.name} · ${tasks.length} image(s), ${todo.length} to make, ${tasks.length - todo.length} already done · about $${cost}`);

if (opt["dry-run"]) {
  for (const t of uniqueTasks) console.log(`\n• ${t.item.type} / ${t.item.name}\n  ${t.prompt}`);
  console.log(`\nDry run: nothing made. Output would go to ${settings.outDir}\n`);
  process.exit(0);
}

// ---------- Generate ----------
const staleTemp = await cleanTempDirs(CONFIG.cleanup.tempMaxAgeMs);
if (staleTemp) console.log(`Removed ${staleTemp} temp folder(s) left by stopped runs.`);
const provider = await getProvider(settings.provider);
const concurrency = Number(opt.concurrency || providerCfg.concurrency || 1);
const started = Date.now();
let done = 0, failed = 0;

const results = await pool(todo, concurrency, async (t) => {
  const label = `${t.item.name} v${t.variant}`;
  try {
    const t0 = Date.now();
    const buffer = await withRetry(
      () => provider.generate({ prompt: t.prompt, negative: style.negative, width: t.width, height: t.height, seed: t.seed, refs: t.refs }),
      { retries: CONFIG.retries, delayMs: CONFIG.retryDelayMs, label },
    );
    await saveImage(buffer, t.base, settings.output);
    done++;
    console.log(`  ✓ [${done + failed}/${todo.length}] ${label} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    return true;
  } catch (err) {
    failed++;
    console.error(`  ✖ [${done + failed}/${todo.length}] ${label}: ${err.message}`);
    return false;
  }
});

// ---------- Cleanup: images for items no longer in the job, half-written files ----------
// Only after a full run; --limit and --items runs cover part of the job, so nothing is pruned.
if (CONFIG.cleanup.pruneStale && !opt.limit && !opt.items) {
  const keep = new Set(tasks.map((t) => t.base));
  const removed = await pruneOutputs(settings.outDir, [...new Set(Object.values(settings.folders))], keep);
  if (removed.length) console.log(`Removed ${removed.length} stale file(s): ${removed.slice(0, 5).join(", ")}${removed.length > 5 ? " ..." : ""}`);
  for (const key of Object.keys(saved)) if (!tasks.some((t) => promptKey(t) === key)) delete saved[key];
  await writeFile(promptFile, JSON.stringify(saved, null, 2));
}

// ---------- Manifest and contact sheet ----------
const entries = tasks
  .filter((t) => existsSync(`${t.base}.${ext}`))
  .map((t) => ({ name: t.item.name, type: t.item.type, variant: t.variant, seed: t.seed, prompt: t.prompt, provider: settings.provider, file: `${t.base}.${ext}` }));
await writeFile(join(settings.outDir, "manifest.json"), JSON.stringify(entries, null, 2));
const sheet = await writeContactSheet(settings.outDir, entries);

console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(0)}s: ${done} made, ${failed} failed, ${tasks.length - todo.length} skipped.`);
console.log(`Review: ${sheet}\n`);
if (results.includes(false)) process.exit(1);
