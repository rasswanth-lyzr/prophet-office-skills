---
name: prophet-design-system-pptx
description: "Use this skill any time a .pptx or .potx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx or .potx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates (.potx), layouts, speaker notes, or comments. Trigger whenever the user mentions \"deck,\" \"slides,\" \"presentation,\" or references a .pptx or .potx filename, regardless of what they plan to do with the content afterward. If a .pptx or .potx file needs to be opened, created, or touched, use this skill. New decks follow Prophet's design system by default."
license: Proprietary. LICENSE.txt has complete terms
---

# prophet-design-system-pptx — PPTX creation, editing, and analysis (Prophet design system)

A `.pptx` is a ZIP archive of XML files. Choose your approach by task:

| Task | Approach |
|---|---|
| **Create** a new deck | Write a `pptxgenjs` script — see gotchas below |
| **Edit** an existing deck, or build from a template | unzip → edit `ppt/slides/slideN.xml` → zip |
| **Read** content | `markitdown deck.pptx` (one block per slide under `<!-- Slide number: N -->` markers); visual grid: `python scripts/thumbnail.py deck.pptx` |

## Scripts

Paths are relative to this skill's directory. Everything else is plain Python, `node`, or shell.

| Script | What it does |
|---|---|
| `scripts/thumbnail.py deck.pptx [prefix]` | Labeled grid of every slide, for picking template layouts. `.pptx` only. Pass `prefix` — it defaults to `thumbnails`, which overwrites the grids of any other deck done in the same directory |
| `scripts/add_slide.py unpacked/ slide2.xml [--after slideN.xml]` | Duplicate a slide (or a `slideLayoutN.xml`) with all the package bookkeeping. Also takes a `.pptx` directly with `-o out.pptx` |
| `scripts/clean.py unpacked/` | Delete slides, media, and rels no longer referenced. Run **after** `<p:sldIdLst>` is final |
| `scripts/office/validate.py deck.pptx [--original src.pptx]` | Schema, relationship, content-type, chart and slide checks; each failure names its fix. Pass `--original` for any template-derived deck — it baselines the schema checks against the template, so the template's own XSD errors don't read as yours |
| `scripts/office/soffice.py --headless --convert-to pdf deck.pptx` | LibreOffice wrapper — bare `soffice` hangs in this sandbox |

## Creating with pptxgenjs — gotchas

`pptxgenjs` is preinstalled — do not run `npm install` first; write the script and `require('pptxgenjs')` directly. Only if that require fails: `npm install pptxgenjs`. The model knows the API; these are the footguns:

- **Set `pres.layout` before adding slides.** The default canvas is `LAYOUT_16x9` = **10" × 5.625"**, not 13.3" wide. Coordinates past the edge are written, not clamped — the shape just isn't on the slide. (`LAYOUT_WIDE` is 13.3" × 7.5".)
- **Hex colors: never `#`, never 8 digits.** `color: "FF0000"`. Both `"#FF0000"` and alpha baked into the hex (`"00000020"`) **corrupt the file**. For translucency: `transparency: 0-100` on fills and images, `opacity: 0.0-1.0` on shadows — each is silently ignored on the other.
- **pptxgenjs mutates option objects in place** (converts values to EMU on first use). Never share one `shadow`/options object across two `add*` calls — build a fresh object each time.
- **Shadow `offset` must be ≥ 0** — a negative offset corrupts the file. To cast a shadow upward, use `angle: 270` with a positive offset.
- **`letterSpacing` is silently ignored** — the real option is `charSpacing`.
- **Lists:** `bullet: true` on each item, never a literal `•` (renders double bullets). Set `breakLine: true` on every array item except the last. Space bulleted paragraphs with `paraSpaceAfter`, not `lineSpacing` (huge gaps).
- **One `new pptxgen()` per output file** — never reuse an instance.
- **`rectRadius` only works on `ROUNDED_RECTANGLE`**, not `RECTANGLE`.
- **Gradient fills aren't supported** — use a gradient image as the background instead.
- **Text boxes have built-in internal padding** — set `margin: 0` whenever text must align with a shape, line, or icon at the same x.
- **Speaker notes go in `slide.addNotes("...")`** (plain text, once per slide), never in a text box on the slide.
- **Keep charts native.** Use `addChart()` for everything PowerPoint can chart (pass an array of `{type, data, options}` for combos). For PowerPoint-native features the library doesn't expose (trendlines, error bars), compute the extra series yourself or post-process the generated OOXML — do not fall back to a rendered image. Only chart types PowerPoint has no native form for (Sankey, network, chord) go in as images.
- **Default charts render bare** — no title, no data labels, dated palette. Set `showTitle` + `title`, `showValue: true` + `dataLabelPosition`, `chartColors: [...]` from your palette, and quiet the frame (`catAxisLabelColor`/`valAxisLabelColor`, `valGridLine: { color, size }`, `catGridLine: { style: "none" }`, `showLegend: false` for a single series).
- **On a stacked bar or column chart, `dataLabelPosition` must be `ctr`, `inEnd`, or `inBase`.** `outEnd` **corrupts the file**.
- **A combo series using `secondaryValAxis`/`secondaryCatAxis` needs both `valAxes` and `catAxes` on the chart options, two entries each.** Without them pptxgenjs writes axis *ids* it never declares, and PowerPoint **discards that chart** and reports the file as corrupt. Supplying only `valAxes` is not enough.
- **After `writeFile()`, run `python scripts/office/validate.py deck.pptx`.** It reports the two chart faults above and the slide-XML defects PowerPoint refuses, and names the fix for each. Fix them in your generator, not by hand-editing the packed XML.
- **Never reorder the children of `<p:presentation>`.** pptxgenjs writes `<p:notesMasterIdLst>` right after `<p:sldIdLst>` and points both masters at one theme part. PowerPoint reads that happily — move the element and the same deck becomes unopenable.
- **Icons:** render `react-icons` to SVG (`ReactDOMServer.renderToStaticMarkup`), rasterize with `sharp` at ≥256px, and insert via `addImage({ data: "image/png;base64," + buf.toString("base64") })` — the `image/png;base64,` prefix is required (`react-icons`, `react`, `react-dom`, and `sharp` are preinstalled — `npm install react-icons react react-dom sharp` only if a require fails).

## Editing existing decks and templates

Pick layouts first: `python scripts/thumbnail.py template.pptx template-thumbs` writes a labeled grid of every slide and prints the file(s) it created — `template-thumbs.jpg`, split into `template-thumbs-N.jpg` past 12 slides. **Always pass that second argument, named after the deck.** It defaults to `thumbnails`, so two decks thumbnailed in one directory silently overwrite each other's grids — the first deck's are simply gone (template analysis only — visual QA needs the full-resolution renders from [Converting to Images](#converting-to-images); it only accepts `.pptx`, so copy a `.potx` to a `.pptx` name first). Use it with `markitdown` to map each content section onto a template slide, and vary the layouts — don't put every section on the same title-and-bullets slide.

```bash
python3 -c "import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall('unpacked')" deck.pptx
python scripts/add_slide.py unpacked/ slide2.xml --after slide2.xml   # duplicate a slide (or slideLayoutN.xml); prints the new slide's path
# reorder / delete slides = edit <p:sldIdLst> in ppt/presentation.xml
python scripts/clean.py unpacked/                                     # after deletions: removes orphaned slides, media, rels
# edit slide content in ppt/slides/slideN.xml
(cd unpacked && rm -f ../out.pptx && zip -Xr ../out.pptx .)           # zip from INSIDE the dir; rm first or deleted parts survive
python scripts/office/validate.py out.pptx --original deck.pptx
```

- **Do all structural work — add, delete, reorder — before editing any slide's content.** `add_slide.py` copies a slide file verbatim, so duplicating after you edit clones the edited content; and `clean.py` deletes any slide missing from `<p:sldIdLst>`, including one you just wrote.
- **Never copy a slide file by hand** — `add_slide.py` does every registration a new slide needs and reports what it made (`Created ppt/slides/slide17.xml from slide2.xml`). It also works directly on a file: `add_slide.py deck.pptx slide2.xml -o out.pptx` — **pass `-o`, or it rewrites the input deck in place.** A duplicated slide still *references* its source's chart/SmartArt/embedded-object parts rather than cloning them, so editing one slide's chart changes the other's.
- **If you use `python-pptx`**, three things it won't do: duplicate a slide (its only entry point is `add_slide(layout)`), preserve formatting through `text_frame.text = "..."` (that collapses the paragraph to a single unstyled run — assign `run.text` instead), or read the SVG/EMF most template art uses (`add_picture` raises `UnidentifiedImageError`).
- Legacy `.ppt` must be converted first: `python scripts/office/soffice.py --headless --convert-to pptx file.ppt`. `.potx` templates unpack and pack identically — keep the `.potx` extension on the output.
- To reuse a template icon or image, duplicate a slide or layout that already contains it.

When filling in a template:

- If you script an XML transform, parse with `defusedxml.minidom` — round-tripping OOXML through `xml.etree.ElementTree` rewrites namespace prefixes and corrupts the deck.
- **Template slots ≠ source items.** If the template shows 4 team members and you have 3, delete the 4th member's entire group (image + text boxes), not just its text — then check for orphaned visuals in QA.
- One `<a:p>` per list item — never concatenate items into a single paragraph. Copy the sibling `<a:pPr>` to preserve spacing, and put `b="1"` on the `<a:rPr>` of titles, section headers, and inline labels (`Status:`, `Owner:`).
- Let bullets inherit from the layout; only add `<a:buChar>`, `<a:buAutoNum>` (numbered), or `<a:buNone>` to override — never a literal `•` in the text.
- Text with leading or trailing spaces needs `xml:space="preserve"` on its `<a:t>`.

## Prophet design system (default for new decks)

Every deck you **create** follows Prophet's design system. **Read `brand/DESIGN_SYSTEM.md` before building** — it is the source of truth for color, type, layout, components and voice.

- **Applies:** any new deck, including decks built from scratch for content the user supplies.
- **Does not apply:** the user names another brand or supplies their own template/theme; or you are editing an existing deck — then that deck's styling wins, and you only add content in its conventions.

### Use the helper

`brand/prophet_pptx.js` carries the tokens and the signature components; `brand/example_deck.js` builds one slide per layout recipe below — read it and copy from it.

```js
const pptxgen = require("pptxgenjs");
const B = require("/absolute/path/to/this/skill/brand/prophet_pptx.js");
const { C, F, W, H, M } = B;                       // palette, Graphik font names, 13.33×7.5 canvas, 0.6" margin
const pres = B.setup(new pptxgen(), { title: "…" }); // LAYOUT_WIDE + Graphik theme fonts
const s = pres.addSlide();
B.eyebrow(s, "Capabilities");                      // UPPERCASE Medium 11pt, blue on white
B.title(s, "Six ways we design what’s next");       // Graphik Light 32pt
B.footer(s, 3);                                    // small wordmark left, slide number right
```

Helpers: `addLogo`, `eyebrow`, `title`, `body`, `footer`, `arrow` (thin → CTA), `button` (green, square), `pillarCard`, `heroMark` (asterisk/bowl/dome cover mark), `pillField` (green pills on blue, image-slot stand-in), `rings`, `icon` (react-icons monoline, rasterized in blue), `chartOptions` (fresh brand chart options per call — pptxgenjs mutates option objects).

### Layout recipes

| Slide | Background | Composition |
|---|---|---|
| Cover | `000000` | White wordmark top-left; green eyebrow; display title Graphik Light 54–60pt white; subtitle Light 16pt; `heroMark` right half |
| Section intro | `FFFFFF` | Eyebrow + Light 36pt headline left (≈5/12), Light 16pt body right (≈6/12), top-aligned; optional black band with a Light 24pt quote and arrow |
| Capability grid | `FFFFFF` | 3×2 items: blue monoline icon (no circle), Semibold 16pt title, Light 14pt description; no boxes |
| Pillars | `FFFFFF` | Up to 3 columns of `pillarCard`s; left bar color = pillar (blue growth, green marketing, magenta AI) |
| Statement / process | `8037D0` full bleed | White eyebrow + title; numbered steps "01" Light 54pt, thin white rule above each |
| Data | `FFFFFF` | Takeaway as the title; native chart via `chartOptions`; big stat Light 72–80pt in blue to the right |
| Case study | `000000` | Green eyebrow; client name UPPERCASE Medium white; Light 28pt headline; arrow; large image (or `pillField`) right |
| Closing | `FFFFFF` or `000000` | Light 54pt headline, short body, green `button`, `rings` or `heroMark` |

Sandwich structure: black cover → white content with one purple or black band for emphasis → closing. Change the band, never put a box on a box.

### Type (Graphik; PowerPoint falls back to an Arial-like face where Graphik is missing)

| Element | Font | Size |
|---|---|---|
| Display (cover, closing) | `Graphik Light` | 54–60pt |
| Slide title | `Graphik Light` | 32–36pt — never bold |
| Sub-head / column head | `Graphik Light` | 22–24pt |
| Item / card title | `Graphik Semibold` | 15–18pt |
| Eyebrow | `Graphik Medium`, UPPERCASE, `charSpacing: 1` | 11–12pt |
| Body | `Graphik Light` | 14–16pt |
| Button / link | `Graphik Medium` | 12–14pt |
| Caption, footnote, slide number | `Graphik` | 9–10pt, `606060` (white slides) / `B4B4B4` (dark) |

Left-align everything except button labels. Sentence case for titles. Never use Aptos or any other face for Prophet decks.

### Color rules

- Black `000000` and white `FFFFFF` carry the deck; **one lead accent per slide**. Blue `334AFF` leads on white, green `22FFAB` on black, purple `8037D0` for full-bleed bands, magenta `C214B9` for illustration and the third pillar.
- On white: text in black/ink/blue/purple/gray-dark only — **never green, yellow, mint or lavender text**. On black: white, green or `B4B4B4` text — never blue/purple text. On purple/magenta/blue fills: white text. On green/yellow fills: black text.
- Charts: `B.CHART_COLORS` (`334AFF`, `000000`, `8037D0`, `C214B9`, `4888FF`, `B4B4B4`); to make one point, highlight the key series in blue and set the rest to `B4B4B4`. Hairline gridlines, no axis line, data labels on.

### Spacing

- 0.6" margins; eyebrow at y≈0.6", title at y≈0.95"; content from y≈2.0"; footer at y≈7.08".
- Gaps from the scale 0.3" / 0.4" / 0.5"; use one value consistently per slide.
- ≤ ~40 words of body per slide. Whitespace is part of the brand.

### Avoid

- Gradients, shadows, bevels, 3D charts, rounded corners on boxes/images/buttons (rounded shapes only inside illustrations like `pillField`).
- Accent lines under titles; header/footer color bars; generic stock palettes; cream/beige backgrounds.
- Edge stripes on cards — **except** the Prophet pillar card's left bar, which is a brand component.
- Icons inside colored circles; bold or all-caps titles; centered body text; italics for emphasis.
- Repeating the same layout on consecutive slides — rotate through the recipes.
- Text-only slides — every slide carries an icon, chart, band, card set or illustration.
- Low-contrast pairs (see color rules); text that overflows its box; forgetting `margin: 0` when aligning text with shapes or lines.

### QA fonts

Font names you write into the .pptx are rendered by the user's PowerPoint; your QA renders via LibreOffice, which has no Graphik and falls back to a serif — every preview would be misleading. Before rendering, alias Graphik to Arial:

```bash
mkdir -p ~/.config/fontconfig/conf.d && cp brand/99-prophet-graphik.conf ~/.config/fontconfig/conf.d/
```

Graphik runs 1–8% wider than Arial (Light ≈ +1%, Semibold ≈ +8%), so size every text box with **~10% slack** and trust that slack over the preview's apparent fit. When another brand applies, prefer fonts that render true-to-width in QA (Arial, Calibri, Cambria, Times New Roman) unless that brand mandates otherwise.

## QA (Required)

Your first render usually has a few real issues — overlaps, overflow, misalignment. Find and fix those, re-render only the slides you changed, and stop.

### Content QA

```bash
markitdown output.pptx
```

Check for missing content, typos, wrong order.

**When using templates, check for leftover placeholder text:**

```bash
markitdown output.pptx | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert|this.*(page|slide).*layout"
```

If grep returns results, fix them before declaring success.

### File QA (required)

```bash
python scripts/office/validate.py output.pptx                      # built from scratch
python scripts/office/validate.py output.pptx --original src.pptx  # built from a template
```

**If the deck came from a template, always pass `--original`.** A template may itself
contain parts the XSD rejects, so a bare run can report failures you never caused — and
a genuine regression can hide among them. `--original` baselines
the schema and slide checks against the template, suppressing errors it already had.
The structural checks — relationships, content types, charts — ignore `--original` and
report template-inherited problems either way, so read those on their own merits.

pptxgenjs emits chart XML PowerPoint refuses to open, and every other tool
accepts: python-pptx opens those decks, LibreOffice renders them, the XSD
passes them. Every failure names its fix. Fix it in the generator and rebuild.

### Visual QA

Convert the slides to images (see [Converting to Images](#converting-to-images)) and inspect every one. After staring at the generating code you tend to see what you expect rather than what rendered, so look at the images fresh (a subagent works well for this if you have one). User-visible defects to look for:

- **Text overflow or text cut off at a box or slide boundary — check this first.** It is the most common defect and always user-visible. (Graphik previews as Arial per [QA fonts](#qa-fonts), so the preview is approximate: trust the ~10% slack you left, not its apparent fit.)
- Overlapping elements (text through shapes, lines through words, stacked elements)
- Source citations or footers colliding with content above
- Elements too close (< 0.3" gaps) or cards/sections nearly touching
- Uneven gaps (large empty area in one place, cramped in another)
- Insufficient margin from slide edges (< 0.6" on Prophet decks)
- Columns or similar elements not aligned consistently
- Low-contrast text (e.g., green text on white, blue text on black)
- Template decoration mispositioned after text replacement — e.g., a title underline positioned for one line, but the replaced title wrapped to two
- Low-contrast icons (e.g., dark icons on dark backgrounds without a contrasting circle)
- Text boxes too narrow causing excessive wrapping
- Leftover placeholder content
- Prophet brand breaks (new decks): headline set bold or not in Graphik Light; missing eyebrow on content slides; missing footer wordmark/slide number; more than one lead accent on a slide; rounded corners, shadows or gradients; serif fallback showing (the font alias wasn't installed — install it and re-render)

## Converting to Images

Convert presentations to individual slide images for visual inspection:

```bash
mkdir -p ~/.config/fontconfig/conf.d && cp brand/99-prophet-graphik.conf ~/.config/fontconfig/conf.d/   # once per environment
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
rm -f slide-*.jpg
pdftoppm -jpeg -r 150 output.pdf slide
ls -1 "$PWD"/slide-*.jpg
```

**Pass the absolute paths printed above directly to the view tool.** The `rm` clears stale images from prior runs. `pdftoppm` zero-pads based on page count: `slide-1.jpg` for decks under 10 pages, `slide-01.jpg` for 10-99, `slide-001.jpg` for 100+.

**After fixes, rerun the convert, `rm`, `pdftoppm` and `ls` commands** — the PDF must be regenerated from the edited `.pptx` before `pdftoppm` can reflect your changes.

## Dependencies

`pptxgenjs` (npm, preinstalled — install only if `require('pptxgenjs')` fails) · `react-icons`, `react`, `react-dom`, `sharp` (npm, preinstalled — used by `brand/prophet_pptx.js` icons) · `markitdown[pptx]`, `Pillow`, `defusedxml`, `lxml` (pip — text dump, thumbnail, clean, validate) · LibreOffice (`soffice`, auto-configured for sandboxed environments via `scripts/office/soffice.py`) · `pdftoppm` (Poppler) · Prophet brand assets and spec in `brand/`
