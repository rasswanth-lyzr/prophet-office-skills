// Prophet design-system helpers for pptxgenjs. Spec: brand/DESIGN_SYSTEM.md.
// Usage: const brand = require("/abs/path/to/pptx/brand/prophet_pptx.js");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "assets");

const C = {
  black: "000000", ink: "0A0A0A", white: "FFFFFF",
  grayLight: "DADADA", hairline: "E5E5E5", grayMid: "B4B4B4", grayDark: "606060",
  blue: "334AFF", green: "22FFAB", magenta: "C214B9", purple: "8037D0",
  red: "FF0053", yellow: "DEFF00", lightBlue: "4888FF", lavender: "887BFF", mint: "A4EDD6", navy: "002668",
};
// Graphik weights; PowerPoint falls back to Arial-like metrics when Graphik is missing.
const F = { light: "Graphik Light", reg: "Graphik", med: "Graphik Medium", semi: "Graphik Semibold" };
const CHART_COLORS = [C.blue, C.black, C.purple, C.magenta, C.lightBlue, C.grayMid];
const CHART_COLORS_DARK = [C.green, C.white, C.lavender, C.magenta, C.lightBlue];
const W = 13.333, H = 7.5, M = 0.6; // LAYOUT_WIDE, margin
const LOGO_RATIO = 105 / 13;

function setup(pres, { title } = {}) {
  pres.layout = "LAYOUT_WIDE";
  pres.company = "Prophet";
  if (title) pres.title = title;
  pres.theme = { headFontFace: F.light, bodyFontFace: F.reg };
  return pres;
}

const _logoCache = {};
function logo(color = "black") {
  if (!_logoCache[color]) {
    _logoCache[color] = "image/png;base64," + fs.readFileSync(path.join(ASSETS, `prophet-logo-${color}.png`)).toString("base64");
  }
  return _logoCache[color];
}
function addLogo(slide, { x = M, y = 0.55, h = 0.24, color = "white" } = {}) {
  slide.addImage({ data: logo(color), x, y, w: h * LOGO_RATIO, h });
}

function eyebrow(slide, text, { x = M, y = 0.6, w = 8, color = C.blue } = {}) {
  slide.addText(text.toUpperCase(), { x, y, w, h: 0.3, margin: 0, fontFace: F.med, fontSize: 11, charSpacing: 1, color, valign: "top" });
}
function title(slide, text, { x = M, y = 0.95, w = 10, h = 0.8, size = 32, color = C.black } = {}) {
  slide.addText(text, { x, y, w, h, margin: 0, fontFace: F.light, fontSize: size, color, valign: "top", lineSpacingMultiple: size >= 48 ? 0.95 : 1.0 });
}
function body(slide, text, { x = M, y = 2.0, w = 6, h = 2, size = 16, color = C.ink } = {}) {
  slide.addText(text, { x, y, w, h, margin: 0, fontFace: F.light, fontSize: size, color, valign: "top", lineSpacingMultiple: 1.2 });
}
function footer(slide, n, { dark = false } = {}) {
  slide.addImage({ data: logo(dark ? "white" : "black"), x: M, y: H - 0.42, w: 0.16 * LOGO_RATIO, h: 0.16 });
  if (n != null) {
    slide.addText(String(n), { x: W - M - 1, y: H - 0.47, w: 1, h: 0.25, margin: 0, align: "right", fontFace: F.reg, fontSize: 9, color: dark ? C.grayMid : C.grayDark });
  }
}
// Long thin open-head arrow CTA.
function arrow(slide, x, y, { color = C.black, len = 0.5 } = {}) {
  slide.addShape("line", { x, y, w: len, h: 0, line: { color, width: 1, endArrowType: "arrow" } });
}
// Primary button: green fill, black Medium label, square corners.
function button(slide, text, { x = M, y, w = 2.0, h = 0.5 } = {}) {
  slide.addText(text, { x, y, w, h, margin: 0, align: "center", valign: "middle", fontFace: F.med, fontSize: 14, color: C.black, fill: { color: C.green } });
}
// Pillar card: white, hairline outline, 0.08" left bar in the pillar color (blue growth / green marketing / magenta AI).
function pillarCard(pres, slide, { x, y, w, h = 0.8, text, color = C.blue, size = 15 }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.white }, line: { color: C.grayMid, width: 0.75 } });
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h, fill: { color }, line: { type: "none" } });
  slide.addText(text, { x: x + 0.35, y, w: w - 0.5, h, margin: 0, fontFace: F.semi, fontSize: size, color: C.black, valign: "middle" });
}
// Experience & Innovation hero: magenta 8-arm asterisk over a light-blue bowl and a purple dome.
// Total height ≈ 1.92 × size. cx = horizontal center, top = top of the asterisk.
function heroMark(pres, slide, cx, top, size) {
  const arm = size * 0.26;
  for (const rot of [0, 45, 90, 135]) {
    slide.addShape(pres.shapes.RECTANGLE, { x: cx - arm / 2, y: top, w: arm, h: size, rotate: rot, fill: { color: C.magenta }, line: { type: "none" } });
  }
  const d = size * 0.92, by = top + size;
  slide.addShape(pres.shapes.PIE, { x: cx - d / 2, y: by - d / 2, w: d, h: d, angleRange: [0, 180], fill: { color: C.lightBlue }, line: { type: "none" } });
  slide.addShape(pres.shapes.PIE, { x: cx - d / 2, y: by + d / 2, w: d, h: d, angleRange: [180, 360], fill: { color: C.purple }, line: { type: "none" } });
}
// Green "pill chain" on a blue field (research-banner motif). Use as an image-slot stand-in.
function pillField(pres, slide, { x, y, w, h, cell = 1.2, path: steps = [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2], [4, 2], [4, 3]] }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.blue }, line: { type: "none" } });
  for (const [cx, cy] of steps) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.7 + cx * cell, y: y + 0.9 + cy * cell, w: cell, h: cell, rectRadius: cell * 0.42, fill: { color: C.green }, line: { type: "none" } });
  }
}
// Flattened "extruded rings" (closing-page motif): blue ellipses with a green offset edge.
function rings(pres, slide, { cy = 3.75, items = [[8.3, 1.25], [9.45, 0.95], [10.4, 0.7], [11.15, 0.4], [11.75, 1.25]] } = {}) {
  for (const [x, r] of items) {
    slide.addShape(pres.shapes.OVAL, { x: x + 0.12, y: cy - r, w: r * 0.75, h: r * 2, fill: { color: C.green }, line: { type: "none" } });
    slide.addShape(pres.shapes.OVAL, { x, y: cy - r, w: r * 0.75, h: r * 2, fill: { color: C.blue }, line: { type: "none" } });
  }
}

// Thin monoline icon (react-icons, e.g. require("react-icons/tb").TbCompass) rasterized in brand blue.
async function icon(Comp, color = C.blue, px = 256) {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const sharp = require("sharp");
  const svg = renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: px, strokeWidth: 1.25 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

// Fresh chart options each call (pptxgenjs mutates option objects). Pass overrides to extend.
function chartOptions(overrides = {}, { dark = false } = {}) {
  const text = dark ? C.white : C.ink, axis = dark ? C.grayMid : C.grayDark;
  return {
    chartColors: (dark ? CHART_COLORS_DARK : CHART_COLORS).slice(),
    showValue: true, dataLabelFontFace: F.reg, dataLabelFontSize: 10, dataLabelColor: text,
    catAxisLabelColor: axis, catAxisLabelFontFace: F.reg, catAxisLabelFontSize: 11, catAxisLineShow: false,
    valAxisHidden: true, valGridLine: { color: dark ? "333333" : C.hairline, size: 0.5 }, catGridLine: { style: "none" },
    showLegend: false, legendFontFace: F.reg, legendFontSize: 11, legendColor: text,
    showTitle: false, barGapWidthPct: 60,
    ...overrides,
  };
}

module.exports = {
  C, F, W, H, M, LOGO_RATIO, CHART_COLORS, CHART_COLORS_DARK, ASSETS,
  setup, logo, addLogo, eyebrow, title, body, footer, arrow, button, pillarCard, heroMark, pillField, rings, icon, chartOptions,
};
