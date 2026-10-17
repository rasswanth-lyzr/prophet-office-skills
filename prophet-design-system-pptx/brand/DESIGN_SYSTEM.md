# Prophet Design System — for documents, decks, PDFs and spreadsheets

Derived from the live sites https://prophet.com/ and https://prophet.com/services/experience-innovation/
(computed CSS, WordPress color presets, and rendered page screenshots, captured 2026-10-17).
Translated from web to Office/PDF output. Where the web gives no direct answer, the rule is marked *(derived)*.

---

## 1. Brand character

- **"Uncommon growth."** Confident, editorial, modern consultancy. Large, airy, *light-weight* headlines; very few words.
- **High-contrast canvas.** Pure black and pure white do the heavy lifting; vivid digital accents (electric blue, neon green, magenta, purple) are used sparingly and with intent.
- **Hard edges.** Square corners on every box, button and image. The only round shapes are portrait crops and geometric illustration.
- **Flat geometry, no gradients, no drop shadows** in layouts. Illustration is bold flat shapes (asterisk, semicircles, circles, rounded-rect "pills") in accent colors.
- **Left-aligned, generous whitespace.** Headline left, supporting paragraph right is the signature section layout.

## 2. Color

### Core (≈ 80–90% of any page)

| Token | Hex | Use |
|---|---|---|
| `black` | `000000` | Hero/cover/closing backgrounds, nav/footer, primary text on light |
| `ink` | `0A0A0A` | Body text on white (softer than pure black) |
| `white` | `FFFFFF` | Content backgrounds, text on dark |
| `gray-light` | `DADADA` | Neutral band background (e.g. client logos), table zebra *(derived)* |
| `gray-hairline` | `E5E5E5` | Hairline rules, card outlines, gridlines |
| `gray-mid` | `B4B4B4` | Disabled, chart secondary series, rules on black |
| `gray-dark` | `606060` | Captions, footnotes, secondary text on white |

### Accents (≈ 10–20%; pick ONE lead accent per piece)

| Token | Hex | Web use observed | Office/PDF use |
|---|---|---|---|
| `blue` | `334AFF` | Eyebrow labels on white, line icons, "Growth" pillar, research banner bg | Lead accent on white pages; chart primary series; icons |
| `green` | `22FFAB` | Primary CTA button (black text), links/eyebrows on black, "Marketing" pillar | Accent on **black only** (text) or as a fill with black text. Never green text on white |
| `magenta` | `C214B9` | "AI" pillar, illustration | Third pillar / highlight; illustration |
| `purple` | `8037D0` | Full-bleed feature band ("Our Experts"), promo headlines | Full-bleed statement/section bands with white text |
| `red` | `FF0053` | Promo accent | Sparing alert/negative value only |
| `yellow` | `DEFF00` | Promo accent | Sparing highlight fill with black text; never text on white |
| `light-blue` | `4888FF` | Illustration | Chart/illustration secondary |
| `lavender` | `887BFF` | Illustration | Chart/illustration secondary |
| `mint` | `A4EDD6` | Illustration | Soft fill, chart tertiary |
| `navy` | `002668` | Text accent | Deep alternative to black for charts/tables |

**Pillar coding** (homepage solution cards): Growth = `blue`, Marketing = `green`, Augmented Intelligence = `magenta`. Use this mapping whenever content is split into three workstreams/pillars.

**Contrast rules**
- On white: text in `ink`, `black`, `blue`, `purple`, `navy`, `gray-dark`. Never `green`, `yellow`, `mint`, `lavender` text.
- On black: text in `white`, `green`, `gray-mid`. Never `blue`/`navy`/`purple` text.
- On `purple`/`magenta`/`blue` fills: white text only.
- On `green`/`yellow`/`mint` fills: black text only.

**Chart palette order** *(derived)*: `334AFF`, `000000`, `8037D0`, `C214B9`, `4888FF`, `B4B4B4`. On black backgrounds: `22FFAB`, `FFFFFF`, `887BFF`, `C214B9`, `4888FF`. Highlight a single bar in the lead accent and keep the rest `B4B4B4` when making one point.

## 3. Typography

**Typeface: Graphik** (Commercial Type) — the only face on the site, in ExtraLight / Light / Regular / Medium / Semibold / Bold.

| Context | Font names to write | Fallback |
|---|---|---|
| PPTX / DOCX / XLSX | `Graphik Light`, `Graphik`, `Graphik Medium`, `Graphik Semibold` | `Arial` (declared fallback; the site falls back to Helvetica) |
| PDF (embedded) | Graphik if installed on the machine, else `Helvetica` family | — |

Weight is the hierarchy device, not size alone: **big + light** for headlines, **small + medium/semibold** for labels.

| Role | Web (px) | Slides 16:9 (pt) | Documents/PDF (pt) | Weight | Notes |
|---|---|---|---|---|---|
| Display (cover) | 50–70 | 54–60 | 40–48 | Light | Leading 1.0–1.1, sentence case |
| H1 / slide title | 36 | 32–36 | 26–30 | Light | Sentence case, no bold |
| H2 / section | 30 | 24 | 18–20 | Light | |
| Card / item title | 16–21 | 16–18 | 11–12 | Semibold | |
| Eyebrow / kicker | 16 | 11–12 | 8–9 | Medium | UPPERCASE, +0.5–1pt tracking; `blue` on white, `green` on black, `white` on photo/case |
| Body | 16 / 24 | 14–16 | 10–11 / 15–16 | Light (slides), Regular (docs) | Left-aligned, ~0.5px tracking |
| Button / link label | 16 | 12–14 | 9–10 | Medium | Links: UPPERCASE `green` underlined on black |
| Caption / footnote | 12–14 | 9–10 | 7.5–8 | Regular | `gray-dark` on white, `gray-mid` on black |

Never: italics for emphasis in headlines, all-caps headlines, centered body text, bold headlines.

## 4. Layout & grid

- **Margins:** slides 0.6" (16:9, 13.33×7.5"); documents 0.9" sides, 0.9" top/bottom *(derived)*.
- **12-column grid**, generous gutters. Signature split: headline column (≈5/12) left, body column (≈6/12) right, top-aligned.
- **Rhythm via full-bleed bands:** alternate black → white → purple/gray → black. Never put a box on a box; change the band instead.
- **Spacing scale (pt):** 4, 8, 12, 16, 24, 36, 54, 80 — pick from the scale only.
- **Whitespace is the luxury signal**: max ~40 words of body per slide; one idea per slide/section.

## 5. Components

| Component | Spec |
|---|---|
| **Wordmark** | PROPHET logotype (official SVG), white on dark, black on light. Top-left on covers, small bottom-left on content pages. Height ≈ 0.16" on slides footer, 0.22–0.28" on covers. Never recolor to accents, never stretch, clear space ≥ cap height. |
| **Eyebrow** | Uppercase Medium label above every section/slide title. |
| **Primary button** | Rectangle, square corners, `green` fill, black Medium text, padding ≈ 0.6em × 1.7em. |
| **Text link / CTA** | Uppercase Medium `green` with underline (on black); or label + `→`. |
| **Arrow CTA** | Long thin open-head arrow (→), 1pt stroke, ~0.45" long, in text color. Ends case studies, sections, closing pages. |
| **Pillar card** | White fill, 0.75pt `gray-hairline`/`gray-mid` outline, **6pt solid left bar** in pillar color, Semibold title. (Prophet-specific — the one place an edge stripe is on-brand.) |
| **Capability item** | Thin monoline icon in `blue` (no circle/background), Semibold title, Light description. No box. |
| **Statement band** | Full-bleed `purple` (or black) band, white Light text at H1 size. |
| **Case study** | Black band; uppercase Medium client name (white); Light headline; arrow CTA; large image right. |
| **Table** | Header row black fill + white Medium text (or `blue` Medium text, no fill on light pages); body Regular; hairline `E5E5E5` horizontal rules only; no vertical rules; numbers right-aligned. |
| **Chart** | Flat, no 3D, no gradients, no shadows; hairline gridlines `E5E5E5`; axis labels `606060`; data labels on; takeaway as the slide title. |
| **Portrait** | Circle crop, black & white. |
| **Footer** | Small wordmark left, page/slide number right, `gray-dark`; no bars, no rules. |

## 6. Illustration & imagery

- **Geometric marks** (the Experience & Innovation hero): 8-arm asterisk in `magenta`, semicircle "bowl" in `light-blue`, semicircle in `purple`, stacked vertically. Other motifs: rounded "pill"/blob chains in `green` on `blue` (research banner), circles.
- Use 2–3 accents per illustration; place right half of cover/closing slides, never behind text.
- **Photography:** real people, natural light, slightly desaturated; B&W for portraits; full-bleed or hard-edged rectangles. No stock clip-art, no rounded image corners.

## 7. Voice

- Short, declarative, sentence-case headlines; often a pair: "Innovating experiences, designing growth."
- Signature words: *uncommon, growth, relentlessly relevant, transform, human-centered*.
- Em-dashes allowed, no exclamation marks, no emoji.

## 8. Don'ts

Gradients, drop shadows, rounded corners, bevels/3D charts, accent underlines under titles, centered paragraphs, more than one lead accent per page, green/yellow text on white, blue text on black, bold headlines, decorative clip-art icons in colored circles, cream/beige backgrounds.
