# Illustration Foundation Guide
### For: Korean Word-Guessing App (2D, Cute Cartoon / Kawaii Style)

This document is a **style foundation** — use it as the base context whenever you prompt an AI image generator, so all 500 word illustrations stay visually consistent.

---

## 1. Core Art Direction

- **Format:** 2D flat/vector-style illustration (not 3D render, not photorealistic)
- **Style:** Cute cartoon / kawaii — soft, friendly, rounded shapes
- **Line work:** Clean, consistent outline weight (medium-thick, slightly rounded corners), single outline color (dark brown or dark navy, not pure black)
- **Shading:** Minimal flat shading — soft single-direction highlight or subtle two-tone shading only. No complex gradients, no photorealistic lighting
- **Proportions:** Slightly chibi/simplified — objects and characters are a bit "squishy," rounded, and oversized in cute details (eyes, cheeks, small details) relative to realistic proportions
- **Background:** Transparent or plain single flat color, no scene/environment clutter — the object/subject should be the sole focus, centered
- **Mood:** Warm, friendly, playful, approachable — appropriate for a casual language-learning game

## 2. Color Palette

| Swatch | Name | Hex | Role |
|---|---|---|---|
| 🟣 | Purple | `#6C51CC` | Accent — saturated pop for standout details (crowns, highlights, small props) |
| 🟡 | Yellow | `#FFD465` | Base — warm fill for food, fur, light surfaces |
| 🔵 | Navy | `#28324A` | Outline — the single outline/line-art color used on every asset (replaces plain black) |
| ⚪ | Cream | `#FFF8E8` | Background — flat background fill / lightest base tone |
| 🌸 | Soft pink | `#FFB7B8` | Base — cheeks, blush, soft skin/petal tones |
| 🟢 | Mint green | `#A9E5C3` | Base — cool fill for plants, water, cool-toned objects |

- **Base palette** (fill colors): Yellow, Soft pink, Mint green, plus Cream for backgrounds — mix and match per subject, 2–3 base tones per illustration
- **Accent color**: Purple is the one saturated "pop" color per illustration — used sparingly for a single standout detail, not as a base fill
- **Outline color**: Navy (`#28324A`) is used for all line work across all 500 assets — do not substitute pure black or brown
- Keep palette limited per image (4–6 colors max, drawn from this set) to stay clean and consistent across all 500 assets
- Blush/cheek accents always use Soft pink at reduced opacity (~70%), regardless of the subject's base color

## 3. Composition Rules

- Single subject per image, centered, filling ~70–80% of canvas
- Square canvas (1:1) recommended for consistent grid/card display in-app
- No text, no Korean/English letters baked into the image
- No drop shadows except a very soft, simple "contact shadow" ellipse beneath the subject if grounding is needed
- Consistent camera angle: front-facing or 3/4 view for objects; front-facing for characters/animals

## 4. Category-Specific Guidelines

| Category | Notes |
|---|---|
| **Things (objects)** | Everyday items simplified to their most recognizable silhouette; add a tiny cute detail (e.g. a sparkle, a small smile) only if it doesn't hurt recognizability |
| **Food** | Slightly glossy/appetizing highlight; can include a small steam/sparkle effect for hot food; keep proportions chunky and appealing |
| **Places** | Since places are large, illustrate as a simplified iconic landmark/building silhouette rather than a full scene — single structure, centered, no background scenery |
| **People / Family (siblings, etc.)** | Simple, gender-neutral-friendly chibi character design; consistent character proportions (large head, small body) across all "people" words so the set feels like one family/cast |
| **Animals** | Front-facing or 3/4 view, big expressive eyes, soft rounded bodies, minimal fur/texture detail |
| **Plants** | Simplified leaf/petal shapes, rounded pot or root base if applicable, avoid overly botanical detail |

## 5. Consistency Anchors (repeat these in every AI prompt)

Use this as your reusable "base prompt" block, then append the specific word/subject:

```
Cute 2D kawaii flat illustration, [SUBJECT], centered composition,
simple rounded shapes, clean medium outline in navy (#28324A),
minimal flat shading with soft highlight, color palette using
cream (#FFF8E8), yellow (#FFD465), soft pink (#FFB7B8), and mint
green (#A9E5C3) as base tones with purple (#6C51CC) as a single
accent pop, plain transparent background, no text, no scenery,
friendly and playful mood, square 1:1 canvas
```

Example filled in:
```
Cute 2D kawaii flat illustration, a red apple, centered composition,
simple rounded shapes, clean medium outline in navy (#28324A),
minimal flat shading with soft highlight, color palette using
cream (#FFF8E8), yellow (#FFD465), soft pink (#FFB7B8), and mint
green (#A9E5C3) as base tones with purple (#6C51CC) as a single
accent pop, plain transparent background, no text, no scenery,
friendly and playful mood, square 1:1 canvas
```

## 6. Do's and Don'ts

**Do:**
- Keep every subject instantly recognizable at small size (icons will likely be shown small in-app)
- Reuse the same outline weight, color, and shading style across all 500 words
- Keep backgrounds transparent/plain for easy UI placement

**Don't:**
- Mix styles (e.g. don't let some images be more detailed/realistic than others)
- Add background scenery, text, or watermarks
- Use harsh black outlines or photorealistic shading
- Overcomplicate "places" or "people" categories with full scenes or multiple characters

## 7. Production Notes

- Generate a handful of test images first (1 per category) to lock the exact style before batch-generating all 500
- Save the finalized "base prompt" string once your test images look right, then only swap out the `[SUBJECT]` for each word
- Consider naming/exporting files by category + word (e.g. `animal_cat.png`, `food_apple.png`) for easy asset management in the app

## 8. Image Generation Workflow

Use this workflow when generating images from the vocabulary batch files:

1. Read the batch JSON and use each entry's English `en` value as the subject.
2. Preserve the exact `image` value as the PNG filename. Do not invent alternate
   spellings, translations, or numbering.
3. Add a short visual qualifier when a word is ambiguous. For example, use
   "a physical greeting card" for `Card` or "a paper letter in an envelope" for
   `Letter`.
4. For occupations and family roles, generate one chibi person representing the
   role. Use a simple visual prop or outfit only when it improves recognition.
5. For abstract or easily confused words, choose the most concrete beginner-level
   interpretation and keep the subject isolated.
6. Generate each image independently rather than generating image grids or
   sprite sheets. Every output must be a standalone square PNG.
7. Review every image at small display size. Regenerate images that are unclear,
   contain multiple competing subjects, include text, or visibly drift from the
   foundation style.
8. Before completing a batch, verify that it contains exactly 20 PNGs and that
   every filename matches its source JSON entry.

### Prompt Template

Use the consistency anchor as the first part of every prompt, then append the
specific subject and any necessary visual qualifier:

```text
[Consistency anchor], clearly depicting [ENGLISH WORD] as [VISUAL QUALIFIER].
The subject must be instantly recognizable at icon size.
```

Use this negative instruction for every generation:

```text
No words, letters, numbers, Korean writing, labels, logos, watermark, border,
photorealism, 3D rendering, realistic background, scenery, collage, or extra
unrelated objects.
```

### Batch Output Rules

- Batch-specific generation directories use `public/batch-[number]/`, such as
  `public/batch-07/`.
- Keep generated files flat inside the assigned batch directory; do not create
  one folder per word.
- Agents generating different batches may run concurrently, but each agent must
  write only to its assigned batch directory.
- When publishing to R2, upload files to the flat `images/<filename>` prefix and
  do not include the local batch directory in the object key.
