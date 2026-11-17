// Saves a generated image as WebP/AVIF plus smaller copies. Falls back to the raw PNG when sharp isn't installed.
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("! sharp not installed: images are saved as PNG without resizing (npm i -D sharp to fix).");
}

export const outputExt = (format) => (sharp ? format : "png");

/** @returns {Promise<string[]>} the files written */
export async function saveImage(buffer, basePath, { format, quality, sizes }) {
  await mkdir(dirname(basePath), { recursive: true });
  if (!sharp) {
    await writeFile(`${basePath}.png`, buffer);
    return [`${basePath}.png`];
  }
  const files = [];
  const encode = (img) => (format === "avif" ? img.avif({ quality }) : format === "png" ? img.png() : img.webp({ quality }));
  // Smaller copies first and the main file last, each written to .tmp then renamed,
  // so a stopped run never leaves a half-written image that looks finished.
  const write = async (img, file) => {
    await encode(img).toFile(`${file}.tmp`);
    await rename(`${file}.tmp`, file);
    files.push(file);
  };
  for (const w of sizes) await write(sharp(buffer).resize({ width: w, withoutEnlargement: true }), `${basePath}-${w}.${format}`);
  await write(sharp(buffer), `${basePath}.${format}`);
  return files;
}
