// Writes index.html in the output folder: every image with its prompt, for quick review.
import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export async function writeContactSheet(outDir, entries) {
  const cards = entries
    .map((e) => {
      const src = relative(outDir, e.file);
      return `<figure><img src="${esc(src)}" loading="lazy" alt="${esc(e.name)}"><figcaption><b>${esc(e.name)}</b> <span>${esc(e.type)} · v${e.variant} · seed ${e.seed}</span><details><summary>Prompt</summary>${esc(e.prompt)}</details></figcaption></figure>`;
    })
    .join("\n");
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>img-gen results</title>
<style>:root{color-scheme:light dark;font:14px system-ui}body{margin:16px;background:Canvas;color:CanvasText}main{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}figure{margin:0;border:1px solid #8884;border-radius:10px;overflow:hidden}img{width:100%;aspect-ratio:1;object-fit:contain;background:#fff}figcaption{padding:8px;display:grid;gap:4px}span{opacity:.7;font-size:12px}details{font-size:12px;opacity:.8}</style>
<h1>img-gen results (${entries.length})</h1><main>${cards}</main>`;
  const file = join(outDir, "index.html");
  await writeFile(file, html);
  return file;
}
