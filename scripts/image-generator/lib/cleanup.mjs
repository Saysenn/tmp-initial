// Removes what a run no longer needs: half-written files, temp folders from killed runs,
// and images for items that are no longer in the job.
import { readdir, rm, rmdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)), { path, dir: true });
    else out.push({ path, dir: false });
  }
  return out;
}

/** Temp folders left by killed local runs, older than maxAgeMs. */
export async function cleanTempDirs(maxAgeMs) {
  const base = tmpdir();
  let removed = 0;
  for (const name of await readdir(base).catch(() => [])) {
    if (!name.startsWith("img-gen-")) continue;
    const path = join(base, name);
    const { mtimeMs } = await stat(path).catch(() => ({ mtimeMs: Date.now() }));
    if (Date.now() - mtimeMs > maxAgeMs) {
      await rm(path, { recursive: true, force: true });
      removed++;
    }
  }
  return removed;
}

/**
 * Deletes files in the image folders that belong to no current task, plus *.tmp leftovers and empty folders.
 * @param {string} outDir
 * @param {string[]} folders  image folders the tool owns (products, brands, ...)
 * @param {Set<string>} keepBases  task base paths (without extension) that are still wanted
 */
export async function pruneOutputs(outDir, folders, keepBases) {
  const removed = [];
  for (const folder of folders) {
    for (const { path, dir } of await walk(join(outDir, folder))) {
      if (dir) {
        await rmdir(path).catch(() => {}); // only succeeds when empty
        continue;
      }
      const base = path.replace(/\.tmp$/, "").replace(/(-\d+)?\.(webp|avif|png)$/, "");
      const keep = !path.endsWith(".tmp") && (keepBases.has(base) || keepBases.has(path.replace(/\.(webp|avif|png)$/, "")));
      if (!keep) {
        await rm(path, { force: true });
        removed.push(relative(outDir, path));
      }
    }
  }
  return removed;
}
