// Prophet design-system helpers for the `docx` npm library (CommonJS).
// Usage: const B = require("/abs/path/to/docx/skill/brand/prophet_docx.js");
// Assets resolve relative to this file, so the script can live anywhere.
const fs = require("fs");
const path = require("path");

// Resolve `docx`/`sharp` from the calling script first (then cwd, NODE_PATH/global, this folder),
// so the helper and the caller share one copy of the library.
function load(name) {
  const from = [require.main && require.main.filename ? path.dirname(require.main.filename) : process.cwd(), process.cwd(), __dirname];
  return require(require.resolve(name, { paths: from }));
}
const {
  Paragraph, TextRun, ImageRun, Footer, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  AlignmentType, LevelFormat, Tab, TabStopType, PageNumber, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom,
  TextWrappingType, VerticalAlign,
} = load("docx");

const ASSETS = path.join(__dirname, "assets");
const LOGO_RATIO = 105 / 13; // prophet-logo-*.png is 2100×260

const C = {
  black: "000000", ink: "0A0A0A", white: "FFFFFF",
  grayLight: "DADADA", hairline: "E5E5E5", grayMid: "B4B4B4", grayDark: "606060",
  blue: "334AFF", green: "22FFAB", magenta: "C214B9", purple: "8037D0", red: "FF0053", yellow: "DEFF00",
  lightBlue: "4888FF", lavender: "887BFF", mint: "A4EDD6", navy: "002668",
};
const F = { light: "Graphik Light", reg: "Graphik", med: "Graphik Medium", semi: "Graphik Semibold", fallback: "Arial" };

// US Letter, 0.9" margins (DXA: 1440 = 1").
const PAGE = {
  size: { width: 12240, height: 15840 },
  margin: { top: 1296, right: 1296, bottom: 1296, left: 1296, header: 720, footer: 720 },
};
const CONTENT_WIDTH = PAGE.size.width - PAGE.margin.left - PAGE.margin.right; // 9648
const PX = 96; // docx ImageRun transformation unit: pixels at 96 dpi
const pt = (n) => n * 2; // half-points for TextRun.size

const font = (name) => ({ ascii: name, hAnsi: name, cs: name, eastAsia: name });

function documentStyles() {
  const heading = (id, name, outlineLevel, run, paragraph) => ({
    id, name, basedOn: "Normal", next: "Normal", quickFormat: true,
    run: { bold: false, italics: false, color: C.black, ...run },
    paragraph: { outlineLevel, keepNext: true, keepLines: true, ...paragraph },
  });
  return {
    default: {
      document: {
        run: { font: font(F.reg), size: pt(10.5), color: C.ink },
        paragraph: { spacing: { before: 0, after: 160, line: 300 } },
      },
    },
    paragraphStyles: [
      heading("Title", "Title", undefined, { font: font(F.light), size: pt(40) }, { spacing: { before: 0, after: 240, line: 250 } }),
      heading("Heading1", "Heading 1", 0, { font: font(F.light), size: pt(28) }, { spacing: { before: 0, after: 240, line: 264 } }),
      heading("Heading2", "Heading 2", 1, { font: font(F.light), size: pt(19) }, { spacing: { before: 360, after: 160, line: 264 } }),
      heading("Heading3", "Heading 3", 2, { font: font(F.semi), size: pt(12) }, { spacing: { before: 240, after: 80 } }),
      { id: "Lead", name: "Lead", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: font(F.light), size: pt(14), color: C.ink }, paragraph: { spacing: { after: 240, line: 312 } } },
      { id: "Caption", name: "Caption", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: font(F.reg), size: pt(8), color: C.grayDark, italics: false, bold: false }, paragraph: { spacing: { before: 80, after: 160, line: 240 } } },
      { id: "Eyebrow", name: "Eyebrow", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: font(F.med), size: pt(9), color: C.blue, characterSpacing: 15 }, paragraph: { keepNext: true, spacing: { before: 0, after: 120, line: 240 } } },
    ],
  };
}

function numbering() {
  const indent = (left) => ({ paragraph: { indent: { left, hanging: 280 } } });
  return {
    config: [{
      reference: "prophet-bullets",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: indent(360) },
        { level: 1, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT, style: indent(720) },
      ],
    }],
  };
}

const bullet = (text, level = 0) =>
  new Paragraph({ numbering: { reference: "prophet-bullets", level }, spacing: { after: 100 }, children: [new TextRun(text)] });

// UPPERCASE Medium label above a heading. blue on white; pass C.green on black, C.white on purple.
function eyebrow(text, color = C.blue, opts = {}) {
  return new Paragraph({
    style: "Eyebrow", pageBreakBefore: !!opts.pageBreakBefore,
    children: [new TextRun({ text: text.toUpperCase(), color })],
  });
}

const logoPng = (color) => fs.readFileSync(path.join(ASSETS, `prophet-logo-${color}.png`));

function logo(color = "black", heightIn = 0.11) {
  return new ImageRun({
    type: "png", data: logoPng(color),
    transformation: { width: heightIn * LOGO_RATIO * PX, height: heightIn * PX },
    altText: { name: "Prophet", title: "Prophet", description: "Prophet wordmark" },
  });
}

// Small black wordmark left, page number right in gray-dark. No rules, no bars.
// A right tab stop at the margin rather than PositionalTab: LibreOffice ignores <w:ptab>.
function footer() {
  return new Footer({
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
      children: [
        logo("black", 0.11),
        new TextRun({
          font: font(F.reg), size: pt(8), color: C.grayDark,
          children: [new Tab(), PageNumber.CURRENT],
        }),
      ],
    })],
  });
}

// SVG (y-down, inches * dpi) of the Experience & Innovation mark: magenta asterisk, light-blue bowl, purple dome.
function heroMarkSvg(cx, top, size) {
  const arm = size * 0.26, r = size * 0.46, cy = top + size / 2, y0 = top + size;
  const arms = [0, 45, 90, 135].map((rot) =>
    `<rect x="${-arm / 2}" y="${-size / 2}" width="${arm}" height="${size}" fill="#${C.magenta}" transform="translate(${cx} ${cy}) rotate(${rot})"/>`).join("");
  const bowl = `<path d="M ${cx - r} ${y0} A ${r} ${r} 0 0 0 ${cx + r} ${y0} Z" fill="#${C.lightBlue}"/>`;
  const dome = `<path d="M ${cx - r} ${y0 + 2 * r} A ${r} ${r} 0 0 1 ${cx + r} ${y0 + 2 * r} Z" fill="#${C.purple}"/>`;
  return arms + bowl + dome;
}

// Full-page black cover art (PNG): white wordmark top-left, hero mark in the upper right, clear of the text.
async function coverArt(dpi = 200) {
  const sharp = load("sharp");
  const W = 8.5 * dpi, H = 11 * dpi, m = (PAGE.margin.left / 1440) * dpi;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#${C.black}"/>${heroMarkSvg(6.5 * dpi, 1.9 * dpi, 1.65 * dpi)}</svg>`;
  const logoH = Math.round(0.24 * dpi);
  const logoBuf = await sharp(logoPng("white")).resize({ height: logoH }).png().toBuffer();
  return sharp(Buffer.from(svg))
    .composite([{ input: logoBuf, left: Math.round(m), top: Math.round(m) }])
    .png().toBuffer();
}

// Section 1: full-bleed black cover (no footer). Put content in later sections via contentSection().
async function coverSection({ eyebrow: kicker = "", title, subtitle = "", date = "" }) {
  const art = new ImageRun({
    type: "png", data: await coverArt(),
    transformation: { width: 8.5 * PX, height: 11 * PX },
    altText: { name: "Cover", title: "Cover", description: "Black cover with Prophet wordmark and geometric mark" },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
      behindDocument: true, allowOverlap: true, lockAnchor: true,
      wrap: { type: TextWrappingType.NONE },
    },
  });
  const white = (text, f, size, extra = {}) => new TextRun({ text, font: font(f), size: pt(size), color: C.white, ...extra });
  const children = [
    // Anchor paragraph; its space-after drops the eyebrow to ~6" from the top edge.
    new Paragraph({ spacing: { before: 0, after: 6900, line: 240 }, children: [art] }),
    new Paragraph({ style: "Eyebrow", children: [new TextRun({ text: kicker.toUpperCase(), color: C.green })] }),
    new Paragraph({ style: "Title", indent: { right: 1700 }, children: [white(title, F.light, 40)] }),
  ];
  if (subtitle) children.push(new Paragraph({ spacing: { before: 360, after: 60 }, children: [white(subtitle, F.light, 12)] }));
  if (date) children.push(new Paragraph({ spacing: { before: subtitle ? 0 : 360, after: 0 }, children: [new TextRun({ text: date, font: font(F.reg), size: pt(9), color: C.grayMid })] }));
  return { properties: { page: PAGE }, children };
}

// Section with the standard footer; starts on a new page.
function contentSection(children) {
  return { properties: { page: PAGE }, footers: { default: footer() }, children };
}

const NONE = { style: BorderStyle.NONE, size: 0, color: "auto" };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const line = (size, color) => ({ style: BorderStyle.SINGLE, size, color });

// Black header row + white Medium text, hairline horizontal rules, no vertical rules.
// rows: arrays of strings. opts.align: per-column "left"|"right" (numbers right). opts.rowHeader: first column Semibold.
function table(headers, rows, columnWidthsDxa, opts = {}) {
  const widths = columnWidthsDxa || headers.map(() => Math.floor(CONTENT_WIDTH / headers.length));
  const total = widths.reduce((a, b) => a + b, 0);
  const align = (i) => ((opts.align || [])[i] === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT);
  const margins = { top: 120, bottom: 120, left: 140, right: 140 };
  const cell = (text, i, header) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    margins,
    verticalAlign: VerticalAlign.TOP,
    shading: header ? { type: ShadingType.CLEAR, color: "auto", fill: C.black } : undefined,
    borders: { top: NONE, left: NONE, right: NONE, bottom: header ? NONE : line(4, C.hairline) },
    children: [new Paragraph({
      alignment: align(i), spacing: { before: 0, after: 0, line: 260 },
      children: [new TextRun({
        text: String(text),
        font: font(header ? F.med : (i === 0 && opts.rowHeader !== false ? F.semi : F.reg)),
        size: pt(header ? 9 : 9.5), color: header ? C.white : C.ink,
      })],
    })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    borders: NO_BORDERS,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, i, false)) })),
    ],
  });
}

// Statement band: content-width purple block with white Light text.
function pullQuote(text, fill = C.purple) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    borders: NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill },
      margins: { top: 560, bottom: 560, left: 560, right: 1400 },
      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
      children: [new Paragraph({
        spacing: { before: 0, after: 0, line: 288 },
        children: [new TextRun({ text, font: font(F.light), size: pt(18), color: C.white })],
      })],
    })] })],
  });
}

// Up to three pillar cards: hairline gray outline, 6pt left bar in the pillar color
// (blue = growth, green = marketing, magenta = AI). Gaps are borderless spacer columns.
function pillarCards(cards) {
  const gap = 240, n = cards.length;
  const cardW = Math.floor((CONTENT_WIDTH - gap * (n - 1)) / n);
  const defaults = [C.blue, C.green, C.magenta];
  const widths = [], cells = [];
  cards.forEach(({ title, body, color }, i) => {
    if (i) {
      widths.push(gap);
      cells.push(new TableCell({ width: { size: gap, type: WidthType.DXA }, borders: { top: NONE, bottom: NONE, left: NONE, right: NONE }, children: [new Paragraph({ spacing: { after: 0 } })] }));
    }
    widths.push(cardW);
    const hair = line(6, C.grayMid);
    cells.push(new TableCell({
      width: { size: cardW, type: WidthType.DXA },
      margins: { top: 200, bottom: 220, left: 260, right: 200 },
      borders: { left: line(48, color || defaults[i % 3]), top: hair, right: hair, bottom: hair },
      children: [
        new Paragraph({ spacing: { before: 0, after: 60, line: 264 }, children: [new TextRun({ text: title, font: font(F.semi), size: pt(11), color: C.black })] }),
        new Paragraph({ spacing: { before: 0, after: 0, line: 264 }, children: [new TextRun({ text: body, font: font(F.reg), size: pt(9), color: C.grayDark })] }),
      ],
    }));
  });
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    borders: NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: cells })],
  });
}

module.exports = {
  C, F, PAGE, CONTENT_WIDTH, LOGO_RATIO, ASSETS,
  documentStyles, numbering, bullet, eyebrow, logo, footer, coverArt, coverSection, contentSection,
  table, pullQuote, pillarCards,
};
