// Placeholder images for testing the pipeline without a model or key.
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {}

// 1x1 grey PNG used when sharp is missing.
const TINY = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNoAAAAggCBd81ytgAAAABJRU5ErkJggg==", "base64");

export async function generate({ prompt, width, height, seed }) {
  if (!sharp) return TINY;
  const hue = (seed * 47) % 360;
  const label = prompt.slice(0, 60).replace(/[<&>]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="hsl(${hue},40%,85%)"/><text x="50%" y="50%" font-size="${Math.round(width / 28)}" text-anchor="middle" font-family="sans-serif" fill="#333">${label}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
