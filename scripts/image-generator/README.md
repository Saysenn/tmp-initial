# img-gen

Bulk image generator for products, brands, categories and banners. Works with local models or any API.

## Setup (once per project)

1. Copy this folder from tmp-initial to `scripts/image-generator/` in the project.
2. Add to `package.json` scripts: `"img:gen": "node scripts/image-generator/img-gen.mjs"`
3. `cp scripts/image-generator/.env.example scripts/image-generator/.env.local` and fill in only the keys you use.
4. Optional: `npm i -D sharp` for WebP output and resizing (without it you get PNG).

Node 22 or newer. No other packages needed (Claude prompt writing needs `npm i -D @anthropic-ai/sdk`).

## Use

```bash
npm run img:gen -- --list                                   # providers, writers, styles
npm run img:gen -- scripts/image-generator/jobs/example.json --dry-run   # see prompts and cost
npm run img:gen -- scripts/image-generator/jobs/example.json             # make the images
npm run img:gen -- --type product --items "Heinz Ketchup 1L, Tilda Rice 10kg" --count 3
```

Results land in `out/img-gen/` by type, with `index.html` to review them all and `manifest.json` listing every file.

## Switching models

| Want | Do |
| --- | --- |
| Change the default | Set `IMG_PROVIDER=openai` in `.env.local` |
| Use another one once | Add `--provider gemini` |
| Change an API key | Edit `.env.local` |
| Add a new model | Copy an entry in `config.mjs` under `providers`, give it a new name |

Image providers: `mflux` (local Z-Image), `qwen-local` (local Qwen-Image), `local-openai` (any local OpenAI style server), `openai`, `gemini`, `qwen` (hosted Qwen-Image), `replicate`, `mock` (placeholders for testing).

Prompt writers (`--writer`) expand a short name into a detailed description: `template` (free, no model), `qwen-local`, `openai`, `claude`. Claude and Qwen3 write text only; the image provider draws.

## Job files

JSON (`jobs/example.json`) or CSV (`jobs/example.csv`, columns `type,name,brand,details,count,ref`).

Per item: `type` (product, brand, category, banner), `name`, optional `brand`, `details`, `count`, `ref` (reference image path, relative to the job file), `seed`, `slug`.

## Keeping images consistent

- A style (`styles/*.json`) holds the shared look: `base` text added to every prompt, `negative`, `seed`, size, and one template per type.
- Every item uses the same seed set, so lighting and framing stay close across the catalogue.
- Prompts are saved in `prompts.json`, so reruns and extra versions reuse the exact same wording. Use `--fresh-prompts` to rewrite.
- Pass `ref` (a logo or real packshot) to keep a brand's look; providers that support editing use it.

## Reruns

Images that already exist are skipped, so a stopped run can just be started again. `--force` remakes them. Failed requests retry with growing delays (`retries` in `config.mjs`).

## Cleanup

The tool cleans up after itself:
- Temp folders from stopped runs are deleted at the next start.
- Images are written to a `.tmp` name and renamed when complete, so a stopped run never leaves a broken image.
- After a full run (no `--items` or `--limit`), images and saved prompts for items no longer in the job are deleted. Turn this off with `cleanup.pruneStale` in `config.mjs`.

Local models (mflux) wait while another local image job is running, so two models never share RAM (`waitForOthers` in `config.mjs`).
