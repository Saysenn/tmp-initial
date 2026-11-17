// Fills "{name}" style placeholders. A part in [square brackets] is dropped when any placeholder in it is empty,
// so "Photo of {name}[, by {brand}]" works with or without a brand.
const fill = (text, item) => text.replace(/\{(\w+)\}/g, (_, k) => item[k] ?? "");

export function fillTemplate(template, item) {
  return fill(
    template.replace(/\[([^\]]*)\]/g, (_, part) => ([...part.matchAll(/\{(\w+)\}/g)].every(([, k]) => item[k]) ? part : "")),
    item,
  )
    .replace(/\s+/g, " ")
    .trim();
}
