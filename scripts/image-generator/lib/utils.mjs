export const slugify = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-|-$/g, "");

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

/** Runs fn, retrying with growing delays. Errors marked `fatal` (bad key, bad request) stop at once. */
export async function withRetry(fn, { retries, delayMs, label }) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.fatal || attempt > retries) throw err;
      const wait = delayMs * 2 ** (attempt - 1);
      console.warn(`  ↻ ${label}: ${err.message} (retry ${attempt}/${retries} in ${wait / 1000}s)`);
      await sleep(wait);
    }
  }
}

/** Runs async tasks with at most `limit` in flight. */
export async function pool(items, limit, worker) {
  const results = [];
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, limit) }, run));
  return results;
}

/** fetch with timeout; throws a readable error, fatal for 400/401/403/404. */
export async function request(url, init, timeoutMs) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 400);
    const err = new Error(`HTTP ${res.status}: ${body}`);
    err.fatal = [400, 401, 403, 404].includes(res.status);
    throw err;
  }
  return res;
}

export async function download(url, timeoutMs) {
  const res = await request(url, {}, timeoutMs);
  return Buffer.from(await res.arrayBuffer());
}

export function requireKey(cfg, name, envName) {
  if (!cfg.apiKey) fail(`${name} needs an API key. Add ${envName}=... to scripts/image-generator/.env.local`);
}
