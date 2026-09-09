# Hangeuloo Brand Kit

![Hangeuloo icon](hangeuloo-icon-small.png)

## Brand identity

**Brand name:** Hangeuloo  
**Category:** Korean language learning  
**Website:** https://hangeuloo.oppia.world/  
**Tagline:** Learn Korean, one happy step at a time.

## Brand positioning

Hangeuloo is a cheerful and gamified Korean learning app for learners aged 10–40. It combines vocabulary, Hangul, listening, sentence building, memory practice, and AI interview simulations in a friendly daily learning experience.

## Brand personality

- Friendly
- Cheerful
- Playful
- Encouraging
- Approachable
- Supportive, never intimidating

## Logo and icon

The primary icon uses the Korean consonant **ㅎ** as the central brand symbol. The character is presented as a friendly mascot-like form to connect the visual identity with Hangul learning.

### Clear space

Keep clear space around the icon equal to at least 25% of its width. Do not place text, borders, or other icons inside this area.

### Do

- Use the icon on purple or light neutral backgrounds.
- Keep the icon centered and visually balanced.
- Use rounded containers and soft shadows.
- Preserve the Korean character’s legibility at small sizes.

### Do not

- Stretch or distort the icon.
- Rotate the icon.
- Add heavy outlines or complex effects.
- Place it on a busy background.
- Replace the ㅎ symbol with a different character.

## Color palette

### Primary

| Name | Hex | Usage |
|---|---|---|
| Hangeuloo Purple | `#6840E8` | Primary brand color, main CTA, links |
| Cheerful Violet | `#8B63F6` | Gradient, hover states, highlights |
| Soft Lavender | `#DCD2FF` | Light surfaces, backgrounds, selected states |

### Accent

| Name | Hex | Usage |
|---|---|---|
| Sunshine Yellow | `#FFD95A` | Rewards, stars, streaks, celebration |
| Soft Pink | `#FFB7C9` | Friendly accents, mascot cheeks, supportive states |
| Fresh Mint | `#9BE7C4` | Success states and positive progress |
| Sky Blue | `#91D9FF` | Listening, information, secondary highlights |

### Neutrals

| Name | Hex | Usage |
|---|---|---|
| Ink | `#27233A` | Main text |
| Muted Ink | `#716D82` | Secondary text |
| Cloud | `#F8F7FC` | Page background |
| White | `#FFFFFF` | Cards and content surfaces |

### Recommended gradient

```css
background: linear-gradient(135deg, #8B63F6 0%, #6840E8 100%);
```

## Typography

Recommended font stack:

```css
font-family: "Nunito", "Noto Sans KR", system-ui, sans-serif;
```

- **Nunito**: friendly Latin text and interface labels.
- **Noto Sans KR**: readable Korean Hangul text.
- Use bold rounded headings and comfortable line height for learning content.

## UI style

- Rounded cards, buttons, inputs, badges, and dialogs.
- Recommended border radius: 12–24px.
- Primary buttons should use a strong purple fill and a soft shadow.
- Cards should use white surfaces on a Cloud background.
- Use depth carefully to make interactions feel tactile.

```css
.hangeuloo-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(61, 42, 135, 0.12);
}

.hangeuloo-button-primary {
  border-radius: 999px;
  background: #6840e8;
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(104, 64, 232, 0.28);
}
```

## Illustration and motion

- Use simple rounded shapes and friendly mascot expressions.
- Use stars, hearts, speech bubbles, streak flames, and progress indicators.
- Correct answers may use scale, sparkle, or soft confetti feedback.
- Incorrect answers should feel supportive, not punitive.
- Keep animation short and purposeful.
- Respect `prefers-reduced-motion`.

## Tone of voice

Hangeuloo speaks like a friendly learning companion.

### Use

- “Great job! You remembered 8 words.”
- “Almost there—try listening one more time.”
- “Nice sentence! Let’s practice the particle once more.”

### Avoid

- Shame-based messages.
- Overly formal or academic wording.
- Unclear error messages.
- Promising fluency too quickly.

## Core CTA copy

- **Start today’s practice**
- **Practice vocabulary**
- **Try AI interview**
- **Listen again**
- **Review mistakes**
- **Continue learning**

## Accessibility basics

- Maintain readable contrast between text and colorful backgrounds.
- Never communicate correctness through color alone.
- Provide captions and Hangul transcripts for audio.
- Make all games keyboard accessible where possible.
- Support adjustable audio speed.
- Keep the Korean character ㅎ visible and recognizable at favicon size.

## Asset inventory

- `hangeuloo-icon.png` — primary generated app icon.

Future assets:

- favicon variants;
- monochrome icon;
- transparent-background icon;
- wordmark logo;
- mascot illustrations;
- reward and game-state icons.
