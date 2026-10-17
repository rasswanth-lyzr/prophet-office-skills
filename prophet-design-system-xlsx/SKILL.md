---
name: prophet-design-system-xlsx
description: "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .xltx, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. New spreadsheets are styled with the Prophet (prophet.com) design system by default. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."
license: Proprietary. LICENSE.txt has complete terms
---

# XLSX creation, editing, and analysis

| Task | Approach |
|---|---|
| **Create** or **edit** with formulas/formatting | `openpyxl` — see gotchas below |
| **Bulk data** in or out | `pandas` (`read_excel`, `to_excel`) |
| **Quick look** at a sheet | `markitdown file.xlsx` — `## SheetName` per sheet; reads `.xlsm` too. No cell coordinates, so don't plan edits from it |
| **Read** a model (formulas *and* values) | two `load_workbook` passes — see gotchas |

> `openpyxl`, `pandas`, and `markitdown` are preinstalled — do not run `pip install` first; write the script and import directly. Only if an import fails (or the `markitdown` command is missing): `pip install` the missing package.

> Script paths below are relative to this skill's directory.

## Prophet design system (default for new files)

**Applies** to every workbook you create, unless the user asks for another brand or style.
**Does not apply** when editing an existing workbook or filling a template — its conventions win
(see Requirements below). Read `brand/DESIGN_SYSTEM.md` before styling; it is the source of truth.

Use `brand/prophet_xlsx.py` (openpyxl; resolves its assets relative to itself). Runnable example:
`python brand/example_workbook.py out.xlsx` then `python scripts/recalc.py out.xlsx`.

```python
import sys; sys.path.insert(0, "/abs/path/to/xlsx/brand")
from openpyxl import Workbook
import prophet_xlsx as px

wb = Workbook(); px.apply_defaults(wb)                   # Graphik 10pt workbook default
ws = wb.active
r = px.title_block(ws, "Digital experience outlook", subtitle="Illustrative", eyebrow="Experience & Innovation")
px.header_row(ws, r, "A", "G")                           # black fill, white Graphik Medium
px.body_style(ws, f"A{r+1}:G{r+4}", px.NUMBER_FORMATS["currency"])
px.total_row(ws, r+5, "A", "G", px.NUMBER_FORMATS["currency"])
px.apply_model_colors(ws, f"B{r+1}:G{r+5}")              # input/formula/link text colors
px.mark_key(ws["B5"])                                    # key assumption fill
px.style_chart(chart, title="Revenue ($k)")              # palette, hairline grid, no border
px.finish_sheet(ws, freeze=f"A{r+1}")                    # no gridlines, widths, tab, footer
```

| Element | Spec |
|---|---|
| Font | `Graphik` (body), `Graphik Light` (titles), `Graphik Medium` (eyebrows, headers), `Graphik Semibold` (totals, item titles); fallback `Arial` (Office can't embed a fallback) |
| Eyebrow | UPPERCASE `Graphik Medium` 9pt `334AFF` above the title and above each table |
| Sheet title / subtitle | `Graphik Light` 20pt `000000` / `Graphik` 10pt `606060`; no fills |
| Header row | fill `000000`, `Graphik Medium` 10pt `FFFFFF`, text left, numbers right, height ~22 |
| Body | `Graphik` 10pt `0A0A0A`; hairline bottom border `E5E5E5`; no vertical borders, no zebra |
| Total row | `Graphik Semibold` 10pt, thin `000000` top border |
| Notes / sources | `Graphik` 8pt `606060` |
| Sheet | gridlines hidden, panes frozen below the header, tab color `000000` (or `334AFF`); optional black wordmark top-left (`px.add_wordmark`) |
| Charts | flat, no 3D/gradients/shadows; series `334AFF`, `000000`, `8037D0`, `C214B9`, `4888FF`, `B4B4B4`; gridlines `E5E5E5`; axis text 9pt `606060`; data labels on; legend bottom |
| Accents | one lead accent (`334AFF`); never `22FFAB`/`DEFF00` text on white; `DEFF00` only as a fill with black text |

**QA renders:** LibreOffice can't see Graphik, so alias it to Arial before converting to PDF —
`mkdir -p ~/.config/fontconfig/conf.d && cp brand/99-prophet-graphik.conf ~/.config/fontconfig/conf.d/` —
otherwise it falls back to a serif. Graphik runs 1–8% wider than Arial: leave ~10% slack in column
widths (`finish_sheet` already adds it).

## Requirements for every output

- **Prophet font** (`Graphik` family; Arial fallback) throughout new workbooks, unless the user says otherwise — see the Prophet section above.
- **Zero formula errors.** Never ship while `recalc.py` reports `errors_found`. If you think an error predates you, prove it: load the *original* with `data_only=True` and look at that cell. An error you introduced looks exactly like one you inherited.
- **Use formulas, never hardcoded results.** Write `sheet['B10'] = '=SUM(B2:B9)'`, not the Python-computed total. The sheet must recalculate when its inputs change.
- **Follow the user's spec literally.** Exact tab names, exact column headers, and the formula they spelled out. A redesign that computes something else fails, however elegant.
- **Document every assumption and hardcoded number** where the reader will see it — a cell comment, or an adjacent cell at a table's end. Cite a real source when one exists (`Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]`); when the number came from the user, say so plainly.
- **A workbook *you create* for someone to fill in** needs a short legend naming which cells to edit, and one example row of realistic values showing the expected format. Never add such a row to a file you were asked to edit.
- **Editing an existing file: match its conventions exactly.** They override every guideline here. Find its designated input cells first — a distinct font color, fill, or shading marks them — write only there, and leave every existing formula untouched.

## Recalculate (mandatory whenever the file contains formulas)

openpyxl writes formulas as strings with **no cached values**. Until you recalculate, every
formula cell reads back as `None` to anything reading cached values — `pandas`,
`load_workbook(data_only=True)`, and most previewers.

```bash
python scripts/recalc.py output.xlsx [timeout_seconds]   # default 30
```

LibreOffice computes every formula, the file is **rewritten in place**, and you get JSON:
`status` (`success` | `errors_found`), `total_formulas`, `total_errors`, and an
`error_summary` naming up to 100 cells per error type (`locations_truncated` says how many it
withheld — trust `total_errors`, not the length of the list). Fix what it names and run it
again. **JSON with an `error` key instead of a `status` means nothing was recalculated**, and
only that case exits non-zero — `errors_found` exits 0, so never treat a clean exit as a clean
workbook.

**A green recalc proves your formulas *evaluate*, not that they are *right*.** An off-by-one
range or a reference to the wrong row yields a clean, error-free file with wrong numbers.
Write 2–3 formulas first and check they pull the values you expect, before building out a grid.

**A workbook that links to another file loses those links** if you re-save it with openpyxl and
then recalculate. Such a formula reads `='[1]Returns Analysis'!$B$2` — the `[1]` is an index
into the workbook's external-reference list, naming a *separate file on disk*, not a sheet.
That file is rarely present here, so the cell's cached value is the only thing holding its
data. openpyxl strips that value on save; LibreOffice then has to resolve the reference for
real, fails, writes `#NAME?`, and deletes every link. `recalc.py` refuses to run in that state
— copy those cells' values out of the original before you save over them (`--force` overrides,
and accepts the loss).

## Choosing formulas that survive verification

LibreOffice implements fewer functions than Excel, and one it cannot evaluate becomes a
literal `#NAME?` baked into the file you deliver.

- **Prefer Excel-2007-era functions** — `SUMIFS`, `INDEX`, `MATCH`, `IFERROR`, `SUMPRODUCT` — which need no prefix.
- **Six post-2007 functions work, but only with an `_xlfn.` prefix**, because openpyxl writes your formula into the XML verbatim and Excel stores post-2007 names prefixed (its UI hides the prefix): `_xlfn.TEXTJOIN`, `_xlfn.CONCAT`, `_xlfn.IFS`, `_xlfn.SWITCH`, `_xlfn.MAXIFS`, `_xlfn.MINIFS`. Written bare, each yields `#NAME?`.
- **Never use `XLOOKUP`, `XMATCH`, `SORT`, `FILTER`, `UNIQUE`, or `SEQUENCE`.** The runtime's LibreOffice cannot evaluate them under *any* prefix. Newer builds do evaluate them, but they are spilling array functions and an openpyxl-written file has no spill metadata, so only the top-left cell of the range gets a value — and `recalc.py` reports `total_errors: 0` on the truncated result. Use `INDEX`/`MATCH` for lookups, and sort, filter, and de-duplicate in Python before writing the cells.
- A formula LibreOffice could not parse is written back **lowercased** — a quick tell beside a `#NAME?`.

## openpyxl gotchas

- **Reading a model takes two loads.** `data_only=True` yields cached values with the formulas gone; the default yields formula strings with no values. One pass cannot give you both.
- **`data_only=True` is destructive if you save.** That workbook has no formulas left, so saving replaces every one with a literal — permanently.
- **`data_only=True` on a file openpyxl just wrote returns `None` everywhere** — run `recalc.py` first. (A formula whose result is `""` also reads back as `None`.)
- **Merged cells: write the top-left anchor only.** Every other cell in the range is a `MergedCell` whose `.value` is read-only.
- **`.xlsm` loses its macros unless you pass `keep_vba=True`** to `load_workbook`.
- **A sheet name containing a space must be quoted** in a cross-sheet reference: `='Assumptions Inputs'!$B$5`. Unquoted, it evaluates to `#VALUE!`.

## Financial models

Unless the user says otherwise, or the existing file already does something else.

**Color** (Prophet-tuned; constants in `brand/prophet_xlsx.py`): blue text (`334AFF`) for hardcoded
inputs and scenario levers · black (`000000`) for formulas · green (`008000`) for links to another
sheet (not Prophet green `22FFAB`, illegible on white) · red (`FF0053`) for links to another file ·
yellow fill (`DEFF00`) with black text for key assumptions and cells the user should fill in.

**Numbers:** currency `$#,##0`, with the unit named in the header (`Revenue ($mm)`) · zeros
render as `-`, including in percentages (`$#,##0;($#,##0);-`) · negatives in parentheses ·
percentages `0.0%`, **stored as fractions** (`0.15` renders `15.0%`; storing `15` renders
`1500.0%`) · valuation multiples `0.0x` · years as text (`"2024"`, never `2,024`).

**Structure:** every assumption in its own labeled cell, referenced by the formulas that use it
(`=B5*(1+$B$6)`, never `=B5*1.05`) · formulas consistent across every projection period, since a
lone edited cell mid-row is the commonest silent error · guard denominators that can be zero.

## Dependencies

`openpyxl`, `pandas`, `markitdown` (pip, preinstalled — install only if an import fails or the command is missing) · LibreOffice (`soffice`, auto-configured for sandboxed environments via `scripts/office/soffice.py`)
