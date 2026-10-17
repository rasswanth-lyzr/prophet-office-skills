// Prophet-branded Word report built with brand/prophet_docx.js.
// Run: node brand/example_doc.js [out.docx]   (needs `docx` and `sharp` resolvable, e.g. NODE_PATH)
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");
const B = require(path.join(__dirname, "prophet_docx.js"));
const { C, CONTENT_WIDTH } = B;

const out = process.argv[2] || "./prophet-example.docx";
const h = (level, text) => new Paragraph({ heading: level, children: [new TextRun(text)] });
const p = (text, opts = {}) => new Paragraph({ ...opts, children: [new TextRun(text)] });
const spacer = (after) => new Paragraph({ spacing: { before: 0, after, line: 240 } });

async function main() {
  const cover = await B.coverSection({
    eyebrow: "Experience & Innovation",
    title: "Innovating experiences, designing growth",
    subtitle: "Capabilities overview",
    date: "October 2026",
  });

  const body = [
    // Executive summary
    B.eyebrow("Executive summary"),
    h(HeadingLevel.HEADING_1, "Designing what’s next, now powered by AI"),
    p("From human-centered experiences to breakthrough products, Prophet helps businesses design what’s next. We craft captivating customer journeys, develop AI-enabled personas and tools, create integrated services and build innovative business models that unlock new value.", { style: "Lead" }),
    h(HeadingLevel.HEADING_2, "How we can help"),
    p("We launch new products, services and experiences that challenge existing business models. Our solutions combine human-centered design with AI-driven innovation to create new products, services, business models and experiences that accelerate in-market impact."),
    p("Whether designing a digital platform, deploying generative AI for faster insight or transforming a service offering, we create experiences that captivate customers, drive loyalty and fuel growth."),
    spacer(200),
    B.pullQuote("“Experiences that captivate customers, drive loyalty and fuel growth.”"),
    spacer(200),
    h(HeadingLevel.HEADING_3, "What this means for you"),
    p("Customer expectations reset with every best-in-class experience they meet, in any category. Organizations that design around real human needs, and move from insight to launch quickly, earn loyalty that compounds over time."),

    // Pillars + capabilities
    B.eyebrow("Solutions for business impact", C.blue, { pageBreakBefore: true }),
    h(HeadingLevel.HEADING_1, "Three pillars of uncommon growth"),
    B.pillarCards([
      { title: "Growth", body: "Growth strategy, go-to-market innovation, brand-led business transformation", color: C.blue },
      { title: "Marketing", body: "Build, launch and grow brands; marketing transformation; demand marketing", color: C.green },
      { title: "Augmented intelligence", body: "AI-driven commercial impact, augmented insights, agentic deployment", color: C.magenta },
    ]),
    h(HeadingLevel.HEADING_2, "Capabilities"),
    B.table(
      ["Capability", "What we do", "Typical outcome"],
      [
        ["Experience strategy and design", "Design human-centered experiences that captivate customers", "Journey blueprint"],
        ["Service design", "Create integrated and relevant services that drive value", "Service model"],
        ["Product creation", "Shape future-ready products with digital innovation and AI", "Product concept, MVP"],
        ["Business model innovation", "Innovate business models to unlock untapped value", "Business case"],
        ["Website creation", "Design an innovative online experience that drives growth", "Digital platform"],
        ["GenAI go-to-market innovation", "Launch products and services powered by genAI", "Launch plan"],
      ],
      [3088, 4440, 2120], // sums to CONTENT_WIDTH (9648)
    ),

    // Next steps
    B.eyebrow("Next steps", C.blue, { pageBreakBefore: true }),
    h(HeadingLevel.HEADING_1, "How we would start"),
    p("A focused first phase moves from insight to a testable concept quickly, then scales what works.", { style: "Lead" }),
    h(HeadingLevel.HEADING_2, "Phase one"),
    B.bullet("Immerse in customer needs through research, data and AI-enabled personas"),
    B.bullet("Map the end-to-end journey and size the moments that matter most"),
    B.bullet("Prototype priority experiences and test them with real customers"),
    B.bullet("Shape the business case and launch plan for the concepts that win"),
    h(HeadingLevel.HEADING_2, "Indicative plan"),
    B.table(
      ["Workstream", "Focus", "Weeks"],
      [
        ["Discover", "Research, analytics, AI-enabled personas", "1–4"],
        ["Design", "Journeys, service blueprint, prototypes", "5–9"],
        ["Deliver", "Business case, roadmap, launch plan", "10–12"],
      ],
      [2800, 5048, 1800],
      { align: ["left", "left", "right"] },
    ),
    p("Illustrative timeline for design demonstration.", { style: "Caption" }),
  ];

  const doc = new Document({
    creator: "Prophet",
    title: "Experience & Innovation — capabilities overview",
    styles: B.documentStyles(),
    numbering: B.numbering(),
    sections: [cover, B.contentSection(body)],
  });
  fs.writeFileSync(out, await Packer.toBuffer(doc));
  console.log("wrote", out, `(content width ${CONTENT_WIDTH} DXA)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
