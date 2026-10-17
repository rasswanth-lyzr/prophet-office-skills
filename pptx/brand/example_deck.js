// Reference deck: one slide per Prophet layout recipe. Run: node brand/example_deck.js out.pptx
const pptxgen = require("pptxgenjs");
const tb = require("react-icons/tb");
const B = require("./prophet_pptx.js");
const { C, F, W, H, M } = B;

async function main(out = "prophet-example.pptx") {
  const pres = B.setup(new pptxgen(), { title: "Experience & Innovation — capabilities overview" });

  // 1 Cover — black, green eyebrow, display headline, hero mark
  let s = pres.addSlide();
  s.background = { color: C.black };
  B.addLogo(s, { color: "white" });
  B.eyebrow(s, "Experience & Innovation", { y: 2.05, color: C.green });
  B.title(s, "Innovating experiences, designing growth", { y: 2.45, w: 7.4, h: 2.9, size: 56, color: C.white });
  B.body(s, "Capabilities overview  ·  October 2026", { y: 5.7, w: 7, h: 0.4, color: C.white });
  B.heroMark(pres, s, 10.3, 1.15, 2.0);

  // 2 Section intro — headline left / body right, black statement band below
  s = pres.addSlide();
  B.eyebrow(s, "Product & experience design", { y: 1.2 });
  B.title(s, "How we can help", { y: 1.6, w: 5.2, h: 1.0, size: 36 });
  s.addText([
    { text: "We launch new products, services and experiences that challenge existing business models.", options: { breakLine: true, paraSpaceAfter: 14 } },
    { text: "Our solutions combine human-centered design with AI-driven innovation to create new products, services, business models and experiences that accelerate in-market impact." },
  ], { x: 6.9, y: 1.6, w: 5.8, h: 2.2, margin: 0, fontFace: F.light, fontSize: 16, color: C.ink, valign: "top", lineSpacingMultiple: 1.25 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.55, w: W, h: H - 4.55, fill: { color: C.black }, line: { type: "none" } });
  B.title(s, "“From human-centered experiences to breakthrough products, Prophet helps businesses design what’s next — now powered by AI.”", { y: 5.0, w: 9.5, h: 1.3, size: 24, color: C.white });
  B.arrow(s, M, 6.55, { color: C.white });
  B.footer(s, 2, { dark: true });

  // 3 Capability grid — blue monoline icons, no boxes
  s = pres.addSlide();
  B.eyebrow(s, "Capabilities");
  B.title(s, "Six ways we design what’s next");
  const items = [
    [tb.TbAffiliate, "Experience strategy and design", "Design human-centered experiences that captivate customers"],
    [tb.TbRoute, "Service design", "Create integrated and relevant services that drive value"],
    [tb.TbPresentation, "Product creation", "Shape future-ready products that integrate digital innovation and AI"],
    [tb.TbHierarchy2, "Business model innovation", "Innovate business models to unlock untapped value"],
    [tb.TbBulb, "Website creation", "Design an innovative online experience that drives growth"],
    [tb.TbCompass, "GenAI go-to-market innovation", "Launch transformative products, services and experiences, powered by genAI"],
  ];
  const colW = (W - 2 * M - 2 * 0.5) / 3;
  for (let i = 0; i < items.length; i++) {
    const [Ico, t, d] = items[i];
    const x = M + (i % 3) * (colW + 0.5), y = 2.15 + Math.floor(i / 3) * 2.35;
    s.addImage({ data: await B.icon(Ico), x, y, w: 0.55, h: 0.55 });
    s.addText(t, { x, y: y + 0.75, w: colW, h: 0.35, margin: 0, fontFace: F.semi, fontSize: 16, color: C.black, valign: "top" });
    B.body(s, d, { x, y: y + 1.15, w: colW - 0.2, h: 0.75, size: 14 });
  }
  B.footer(s, 3);

  // 4 Pillars — color-coded cards
  s = pres.addSlide();
  B.eyebrow(s, "Solutions for business impact");
  B.title(s, "Three pillars of uncommon growth");
  const cols = [
    ["Growth solutions", "In a world of uncertainty, growth isn’t optional.", C.blue, ["Growth strategy", "Go-to-market innovation", "Brand-led business transformation"]],
    ["Marketing solutions", "Demand results, deliver impact.", C.green, ["Build, launch and grow brands", "Marketing transformation", "Demand marketing"]],
    ["Augmented intelligence", "Don’t just read about AI transformation; live it.", C.magenta, ["AI-driven commercial impact", "Augmented insights", "Agentic deployment"]],
  ];
  const gap = 0.4, pw = (W - 2 * M - 2 * gap) / 3;
  cols.forEach(([head, sub, color, list], i) => {
    const x = M + i * (pw + gap);
    B.title(s, head, { x, y: 2.05, w: pw, h: 0.45, size: 22 });
    B.body(s, sub, { x, y: 2.55, w: pw, h: 0.6, size: 13, color: C.grayDark });
    list.forEach((t, j) => B.pillarCard(pres, s, { x, y: 3.4 + j * 1.05, w: pw, text: t, color }));
  });
  B.footer(s, 4);

  // 5 Statement band — full-bleed purple, numbered steps
  s = pres.addSlide();
  s.background = { color: C.purple };
  B.eyebrow(s, "How we work", { color: C.white });
  B.title(s, "From insight to in-market impact", { color: C.white });
  const steps = [
    ["01", "Discover", "Uncover unmet customer needs with human-centered research and AI-enabled personas."],
    ["02", "Define", "Frame the opportunity and the business model that unlocks new value."],
    ["03", "Design", "Prototype journeys, services and products, and test them with real customers."],
    ["04", "Deliver", "Launch, measure and scale what works, from pilot to platform."],
  ];
  const sw = (W - 2 * M - 3 * 0.4) / 4;
  steps.forEach(([n, t, d], i) => {
    const x = M + i * (sw + 0.4);
    s.addShape("line", { x, y: 2.6, w: sw, h: 0, line: { color: C.white, width: 0.75 } });
    B.title(s, n, { x, y: 2.85, w: sw, h: 0.9, size: 54, color: C.white });
    s.addText(t, { x, y: 3.95, w: sw, h: 0.4, margin: 0, fontFace: F.semi, fontSize: 18, color: C.white, valign: "top" });
    B.body(s, d, { x, y: 4.45, w: sw, h: 1.4, size: 14, color: C.white });
  });
  B.footer(s, 5, { dark: true });

  // 6 Native chart + big stat
  s = pres.addSlide();
  B.eyebrow(s, "Why experience matters");
  B.title(s, "Experience leaders pull away every year");
  const labels = ["2022", "2023", "2024", "2025", "2026"];
  s.addChart(pres.charts.BAR, [
    { name: "Experience leaders", labels, values: [100, 112, 127, 141, 158] },
    { name: "Everyone else", labels, values: [100, 103, 106, 108, 111] },
  ], B.chartOptions({ x: M, y: 1.95, w: 7.9, h: 4.6, barDir: "col", dataLabelPosition: "outEnd", chartColors: [C.blue, C.grayMid], showLegend: true, legendPos: "t" }));
  B.title(s, "1.4×", { x: 9.2, y: 2.2, w: 3.5, h: 1.3, size: 80, color: C.blue });
  B.body(s, "faster indexed revenue growth for experience leaders, 2022–2026", { x: 9.2, y: 3.6, w: 3.3, h: 0.9, size: 14 });
  s.addText("Illustrative data. Index: 2022 = 100.", { x: M, y: 6.62, w: 8, h: 0.25, margin: 0, fontFace: F.reg, fontSize: 9, color: C.grayDark });
  B.footer(s, 6);

  // 7 Case study — black, client eyebrow, Light headline, arrow, image slot right
  s = pres.addSlide();
  s.background = { color: C.black };
  B.eyebrow(s, "Our work", { color: C.green });
  s.addText("CVS HEALTH", { x: M, y: 2.2, w: 4.5, h: 0.3, margin: 0, fontFace: F.med, fontSize: 12, charSpacing: 1, color: C.white });
  B.title(s, "Helping CVS Kidney Care transform to disrupt the renal care industry", { y: 2.6, w: 4.6, h: 2.0, size: 28, color: C.white });
  B.arrow(s, M, 4.9, { color: C.white });
  B.pillField(pres, s, { x: 5.75, y: 0.6, w: W - M - 5.75, h: 5.9 }); // replace with a photo when one is available
  B.footer(s, 7, { dark: true });

  // 8 Closing — white, big Light headline, green button, rings
  s = pres.addSlide();
  B.title(s, "Let’s reimagine experiences together", { y: 1.2, w: 7.2, h: 2.85, size: 54 });
  B.body(s, "Ready to create innovative experiences that captivate customers and fuel growth? Let’s transform your products, services and customer journey.", { y: 4.35, w: 6.6, h: 0.9 });
  B.button(s, "Get in touch", { y: 5.75 });
  B.rings(pres, s);
  B.footer(s, 8);

  await pres.writeFile({ fileName: out });
  console.log("wrote", out);
}
main(process.argv[2]).catch((e) => { console.error(e); process.exit(1); });
