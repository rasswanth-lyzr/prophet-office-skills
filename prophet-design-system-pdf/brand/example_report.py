"""Reference report: cover, summary, pillars + table, chart + stat, back cover.
Run: python brand/example_report.py out.pdf"""
import sys
from pathlib import Path

from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (BaseDocTemplate, Frame, NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import prophet_pdf as P  # noqa: E402

USING_GRAPHIK = P.register_fonts()
S = P.styles()
C, F = P.C, P.FONT
PW, PH = letter
M = 64  # ~0.9" margins
CW = PW - 2 * M
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "prophet-example.pdf")


def cover(c, doc):
    c.saveState()
    c.setFillColor(C["black"]); c.rect(0, 0, PW, PH, stroke=0, fill=1)
    P.draw_logo(c, M, PH - M - 14, 14, "white")
    P.draw_hero_mark(c, PW - M - 80, PH - 150, 120)
    c.setFillColor(C["green"]); c.setFont(F["medium"], 9)
    c.drawString(M, 360, "EXPERIENCE & INNOVATION")
    p = Paragraph("Innovating experiences, designing growth", S["display"])
    _, h = p.wrap(CW * 0.78, 300)
    p.drawOn(c, M, 345 - h)
    c.setFillColor(C["white"]); c.setFont(F["light"], 12)
    c.drawString(M, M + 30, "Capabilities overview")
    c.setFillColor(C["gray_mid"]); c.setFont(F["regular"], 9)
    c.drawString(M, M + 12, "October 2026")
    c.restoreState()


def body(c, doc):
    c.saveState()
    P.draw_logo(c, M, 36, 8, "black")
    c.setFillColor(C["gray_dark"]); c.setFont(F["regular"], 8)
    c.drawRightString(PW - M, 37, str(doc.page))
    c.restoreState()


def back(c, doc):
    c.saveState()
    c.setFillColor(C["black"]); c.rect(0, 0, PW, PH, stroke=0, fill=1)
    p = Paragraph("Let’s reimagine experiences together", S["display"])
    _, h = p.wrap(CW * 0.8, 300)
    p.drawOn(c, M, PH * 0.62 - h)
    c.setFillColor(C["white"]); c.setFont(F["light"], 12)
    y = PH * 0.62 - h - 34
    for line in ("Ready to create innovative experiences that captivate customers",
                 "and fuel growth? Let’s transform your products, services and journeys."):
        c.drawString(M, y, line); y -= 17
    # Primary button: green fill, black Medium label, square corners
    c.setFillColor(C["green"]); c.rect(M, y - 40, 120, 30, stroke=0, fill=1)
    c.setFillColor(C["black"]); c.setFont(F["medium"], 10)
    c.drawCentredString(M + 60, y - 29, "Get in touch")
    P.draw_logo(c, M, M, 12, "white")
    c.setFillColor(C["gray_mid"]); c.setFont(F["regular"], 8)
    c.drawRightString(PW - M, M + 2, "prophet.com")
    c.restoreState()


def chart():
    d = Drawing(CW * 0.62, 230)
    bc = VerticalBarChart()
    bc.x, bc.y, bc.width, bc.height = 10, 28, CW * 0.62 - 20, 165
    bc.data = [(100, 112, 127, 141, 158), (100, 103, 106, 108, 111)]
    bc.categoryAxis.categoryNames = ["2022", "2023", "2024", "2025", "2026"]
    bc.categoryAxis.labels.fontName = F["regular"]; bc.categoryAxis.labels.fontSize = 8
    bc.categoryAxis.labels.fillColor = C["gray_dark"]
    bc.categoryAxis.strokeColor = C["hairline"]; bc.categoryAxis.visibleTicks = False
    bc.valueAxis.valueMin, bc.valueAxis.valueMax, bc.valueAxis.valueStep = 0, 175, 25
    bc.valueAxis.visible = False
    bc.valueAxis.visibleGrid = True; bc.valueAxis.gridStrokeColor = C["hairline"]; bc.valueAxis.gridStrokeWidth = 0.5
    bc.bars[0].fillColor, bc.bars[1].fillColor = C["blue"], C["gray_mid"]
    bc.bars.strokeColor = None
    bc.barSpacing, bc.groupSpacing = 2, 14
    bc.barLabelFormat = "%d"; bc.barLabels.nudge = 7
    bc.barLabels.fontName = F["regular"]; bc.barLabels.fontSize = 7.5; bc.barLabels.fillColor = C["ink"]
    d.add(bc)
    for i, (name, col) in enumerate((("Experience leaders", "blue"), ("Everyone else", "gray_mid"))):
        x = 10 + i * 120
        d.add(Rect(x, 212, 8, 8, fillColor=C[col], strokeColor=None))
        d.add(String(x + 13, 213, name, fontName=F["regular"], fontSize=8, fillColor=C["ink"]))
    return d


def build():
    doc = BaseDocTemplate(str(OUT), pagesize=letter, leftMargin=M, rightMargin=M, topMargin=M, bottomMargin=M + 10,
                          title="Experience & Innovation — Prophet design system sample", author="Prophet")
    full = Frame(0, 0, PW, PH, id="full")
    main = Frame(M, M + 10, CW, PH - 2 * M - 10, id="main", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate("cover", [full], onPage=cover),
                          PageTemplate("body", [main], onPage=body),
                          PageTemplate("back", [full], onPage=back)])

    st = [NextPageTemplate("body"), PageBreak()]

    # Page 2 — summary, headline-left / body-right split, purple statement band
    st += [Paragraph("EXECUTIVE SUMMARY", S["eyebrow"]),
           Paragraph("Designing what’s next, now powered by AI", S["h1"]),
           Paragraph("From human-centered experiences to breakthrough products, Prophet helps businesses design "
                     "what’s next. We craft captivating customer journeys, develop AI-enabled personas and tools, "
                     "create integrated services and build innovative business models that unlock new value.", S["lead"]),
           Spacer(1, 18)]
    split = Table([[Paragraph("How we can help", P.ParagraphStyle("h2flush", parent=S["h2"], spaceBefore=0)),
                    [Paragraph("We launch new products, services and experiences that challenge existing business "
                               "models. Our solutions combine human-centered design with AI-driven innovation to "
                               "accelerate in-market impact.", S["body"]),
                     Paragraph("Whether designing a digital platform, deploying generative AI for faster insight or "
                               "transforming a service offering, we create experiences that captivate customers, "
                               "drive loyalty and fuel growth.", S["body"])]]],
                  colWidths=[CW * 0.42, CW * 0.58])
    split.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                               ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0)]))
    st += [split, Spacer(1, 40)]
    band_style = P.ParagraphStyle("band", parent=S["h1"], textColor=C["white"], fontSize=22, leading=28)
    st += [P.Band("“Experiences that captivate customers, drive loyalty and fuel growth.”", band_style,
                  fill="purple", left_bleed=M, page_width=PW, height=150),
           Spacer(1, 36),
           Paragraph("WHAT THIS MEANS FOR YOU", S["eyebrow"]),
           Paragraph("Customer expectations reset with every best-in-class experience they meet, in any category. "
                     "Organizations that design around real human needs, and move from insight to launch quickly, "
                     "earn loyalty that compounds over time.", S["body"]),
           PageBreak()]

    # Page 3 — pillars + capabilities table
    st += [Paragraph("SOLUTIONS FOR BUSINESS IMPACT", S["eyebrow"]),
           Paragraph("Three pillars of uncommon growth", S["h1"])]
    gap = 12
    cw3 = (CW - 2 * gap) / 3
    pillars = [("Growth", "Strategy, GTM, transformation", "blue"),
               ("Marketing", "Brands, demand, campaigns", "green"),
               ("Augmented intelligence", "AI impact, insights, agents", "magenta")]
    row = [P.PillarCard(t, b, col, cw3, 60, S) for t, b, col in pillars]
    pt = Table([row], colWidths=[cw3 + gap, cw3 + gap, cw3])
    pt.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    st += [pt, Spacer(1, 30), Paragraph("Capabilities", S["h2"])]
    data = [["Capability", "What we do", "Typical outcome"],
            ["Experience strategy and design", "Design human-centered experiences that captivate customers", "Journey blueprint"],
            ["Service design", "Create integrated and relevant services that drive value", "Service model"],
            ["Product creation", "Shape future-ready products with digital innovation and AI", "Product concept, MVP"],
            ["Business model innovation", "Innovate business models to unlock untapped value", "Business case"],
            ["Website creation", "Design an innovative online experience that drives growth", "Digital platform"],
            ["GenAI go-to-market innovation", "Launch products and services powered by genAI", "Launch plan"]]
    cells = [[Paragraph(c, S["th"]) for c in data[0]]] + \
            [[Paragraph(r[0], S["item"]), Paragraph(r[1], S["small"]), Paragraph(r[2], S["small"])] for r in data[1:]]
    t = Table(cells, colWidths=[CW * 0.32, CW * 0.46, CW * 0.22], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["black"]),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, C["hairline"]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    st += [t, PageBreak()]

    # Page 4 — chart + stat
    st += [Paragraph("WHY EXPERIENCE MATTERS", S["eyebrow"]),
           Paragraph("Experience leaders pull away every year", S["h1"]),
           Paragraph("Indexed revenue growth, 2022 = 100", S["small"]), Spacer(1, 10)]
    stat_num = P.ParagraphStyle("stat", parent=S["display"], textColor=C["blue"], fontSize=60, leading=62)
    stat = [Paragraph("1.4×", stat_num), Spacer(1, 6),
            Paragraph("faster indexed revenue growth for experience leaders, 2022–2026", S["body"])]
    ct = Table([[chart(), stat]], colWidths=[CW * 0.64, CW * 0.36])
    ct.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (1, 0), (1, 0), 30)]))
    st += [ct, Spacer(1, 6), Paragraph("Illustrative data for design demonstration.", S["caption"]), Spacer(1, 30),
           Paragraph("Implications", S["h2"]),
           Paragraph("The gap widens because experience leaders reinvest learning into the next release. Treat "
                     "experience as an operating capability, not a project, and measure it like revenue.", S["body"]),
           NextPageTemplate("back"), PageBreak(), Spacer(1, 1)]
    doc.build(st)
    print("wrote", OUT, "| fonts:", "Graphik" if USING_GRAPHIK else "Helvetica fallback")


if __name__ == "__main__":
    build()
