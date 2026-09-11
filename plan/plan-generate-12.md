# Generate Batches 07-12

## Objective

Generate the 120 vocabulary illustrations described by `batch-07.json` through
`batch-12.json` using Codex built-in image generation.

## Model Assignment

Use **GPT Luna Fast** for every image-generation



| Agent | Source batch | Output directory | Images |
|---|---|---|---:|
| 1 | `public/word-batches/batch-07.json` | `public/batch-07/` | 20 |
| 2 | `public/word-batches/batch-08.json` | `public/batch-08/` | 20 |
| 3 | `public/word-batches/batch-09.json` | `public/batch-09/` | 20 |
| 4 | `public/word-batches/batch-10.json` | `public/batch-10/` | 20 |
| 5 | `public/word-batches/batch-11.json` | `public/batch-11/` | 20 |
| 6 | `public/word-batches/batch-12.json` | `public/batch-12/` | 20 |

## Generation Requirements

- Use the English `en` value as the image subject.
- Use the exact `image` value from the batch JSON as the output filename.
- Generate square 1:1 PNG images at exactly 250×250 pixels.
- Use a cute 2D kawaii flat illustration style.
- Use clean navy outlines, minimal flat shading, and the palette from
  `plan/illustration-foundation-guide.md`.
- Keep one recognizable centered subject per image.
- Use a transparent or plain cream background.
- Do not include text, letters, Korean writing, watermarks, or scenery.
- Keep people consistent as a friendly chibi cast; use simple gender-neutral
  designs where the word does not specify appearance.

## Verification

After agents finish:

1. Confirm each output directory contains exactly 20 PNG files.
2. Confirm filenames match the `image` fields in its source batch.
3. Confirm the combined output contains 120 files with no duplicate names.
4. Inspect representative images from the `Things` and `Siblings/People`
   categories for consistent style and recognizable subjects.