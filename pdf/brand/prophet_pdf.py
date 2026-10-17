"""Prophet design-system helpers for reportlab: palette, fonts, styles, brand drawing + flowables.

    import sys; sys.path.insert(0, "/absolute/path/to/pdf/brand")
    import prophet_pdf as P
    P.register_fonts()          # Graphik if installed (CFF faces converted once to TTF), else Helvetica
    S = P.styles()              # display, h1, h2, lead, body, eyebrow, item, small, caption, th

See example_report.py for cover / body / back-cover page templates. Spec: DESIGN_SYSTEM.md.
"""
import glob
import os
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Flowable

ASSETS = Path(__file__).resolve().parent / "assets"
LOGO_RATIO = 105 / 13

PALETTE = {
    "black": "#000000", "ink": "#0A0A0A", "white": "#FFFFFF",
    "gray_light": "#DADADA", "hairline": "#E5E5E5", "gray_mid": "#B4B4B4", "gray_dark": "#606060",
    "blue": "#334AFF", "green": "#22FFAB", "magenta": "#C214B9", "purple": "#8037D0",
    "red": "#FF0053", "yellow": "#DEFF00", "light_blue": "#4888FF", "lavender": "#887BFF",
    "mint": "#A4EDD6", "navy": "#002668",
}
CHART_COLORS = ["blue", "black", "purple", "magenta", "light_blue", "gray_mid"]  # keys into C, in order
C = {k: HexColor(v) for k, v in PALETTE.items()}

# Logical weight -> (Graphik style name, Helvetica fallback)
WEIGHTS = {"light": ("Light", "Helvetica"), "regular": ("Regular", "Helvetica"),
           "medium": ("Medium", "Helvetica-Bold"), "semibold": ("Semibold", "Helvetica-Bold")}
FONT = {}  # logical weight -> registered reportlab font name

_SEARCH = [
    os.environ.get("PROPHET_FONT_DIR", ""),
    "~/Library/Fonts", "/Library/Fonts", "/System/Library/Fonts",
    "/System/Library/AssetsV2/com_apple_MobileAsset_Font*/*/AssetData",
    "/usr/share/fonts", "/usr/local/share/fonts", "~/.fonts", "~/.local/share/fonts",
]
_CACHE = Path(os.environ.get("PROPHET_FONT_CACHE", "~/.cache/prophet-fonts")).expanduser()


def _find_graphik():
    """Return {style: (path, ttc_index)} for every Graphik face found on this machine."""
    from fontTools.ttLib import TTCollection, TTFont as FTFont
    found = {}
    for root in filter(None, _SEARCH):
        for d in glob.glob(os.path.expanduser(root)):
            for p in glob.glob(os.path.join(d, "**", "Graphik*"), recursive=True):
                ext = p.lower().rsplit(".", 1)[-1]
                fonts = (list(enumerate(TTCollection(p).fonts)) if ext == "ttc"
                         else [(0, FTFont(p, lazy=True))] if ext in ("otf", "ttf") else [])
                for idx, f in fonts:
                    ps = f["name"].getDebugName(6) or ""  # e.g. Graphik-Light
                    style = ps.split("-", 1)[-1] if "-" in ps else "Regular"
                    found.setdefault(style, (p, idx))
    return found


def _as_truetype(path, idx, style):
    """reportlab embeds TrueType outlines only; convert CFF faces once into the cache."""
    from fontTools.pens.cu2quPen import Cu2QuPen
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.ttLib import TTFont as FTFont, newTable
    out = _CACHE / f"Graphik-{style}.ttf"
    if out.exists():
        return out
    f = FTFont(path, fontNumber=idx)
    if "glyf" not in f:
        order = f.getGlyphOrder()
        gs = f.getGlyphSet()
        glyf = newTable("glyf")
        glyf.glyphOrder, glyf.glyphs = order, {}
        for name in order:
            pen = TTGlyphPen(gs)
            gs[name].draw(Cu2QuPen(pen, 1.0, reverse_direction=True))
            glyf.glyphs[name] = pen.glyph()
        f["glyf"], f["loca"] = glyf, newTable("loca")
        del f["CFF "]
        for t in ("VORG",):
            if t in f:
                del f[t]
        maxp = newTable("maxp")
        maxp.tableVersion = 0x00010000
        for a in ("maxZones", "maxTwilightPoints", "maxStorage", "maxFunctionDefs", "maxInstructionDefs",
                  "maxStackElements", "maxSizeOfInstructions", "maxComponentElements"):
            setattr(maxp, a, 1 if a == "maxZones" else 0)
        f["maxp"] = maxp
        post = f["post"]
        post.formatType, post.extraNames, post.mapping, post.glyphOrder = 2.0, [], {}, order
        f.sfntVersion = "\x00\x01\x00\x00"
    _CACHE.mkdir(parents=True, exist_ok=True)
    f.save(out)
    return out


def register_fonts():
    """Register Graphik if installed, else fall back to Helvetica. Returns True when Graphik is used."""
    try:
        faces = _find_graphik()
    except Exception:
        faces = {}
    use_graphik = all(style in faces for style, _ in WEIGHTS.values())
    for key, (style, fallback) in WEIGHTS.items():
        if use_graphik:
            name = f"Graphik-{style}"
            pdfmetrics.registerFont(TTFont(name, str(_as_truetype(*faces[style], style))))
            FONT[key] = name
        else:
            FONT[key] = fallback
    return use_graphik


def styles():
    S = {}
    def add(name, font, size, lead, color="ink", **kw):
        S[name] = ParagraphStyle(name, fontName=FONT[font], fontSize=size, leading=lead,
                                 textColor=C[color], alignment=TA_LEFT, **kw)
    add("display", "light", 44, 46, "white")
    add("h1", "light", 28, 32, "black", spaceAfter=14)
    add("h2", "light", 19, 23, "black", spaceBefore=18, spaceAfter=8)
    add("lead", "light", 14, 20, "ink", spaceAfter=12)
    add("body", "regular", 10.5, 15.5, "ink", spaceAfter=8)
    add("eyebrow", "medium", 8.5, 11, "blue", spaceAfter=6)
    add("item", "semibold", 11, 14, "black")
    add("small", "regular", 9, 12.5, "ink")
    add("caption", "regular", 7.5, 10, "gray_dark")
    add("th", "medium", 8.5, 11, "white")
    return S


def draw_logo(c, x, y, height, color="black"):
    c.drawImage(str(ASSETS / f"prophet-logo-{color}.png"), x, y, width=height * LOGO_RATIO, height=height, mask="auto")


def draw_hero_mark(c, cx, top, size):
    """Magenta 8-arm asterisk over a light-blue bowl and a purple dome (Experience & Innovation hero)."""
    arm = size * 0.26
    c.saveState()
    c.setFillColor(C["magenta"])
    for rot in (0, 45, 90, 135):
        c.saveState()
        c.translate(cx, top - size / 2)
        c.rotate(rot)
        c.rect(-arm / 2, -size / 2, arm, size, stroke=0, fill=1)
        c.restoreState()
    r = size * 0.46
    y0 = top - size  # flat edge of the bowl
    c.setFillColor(C["light_blue"])
    c.wedge(cx - r, y0 - r, cx + r, y0 + r, 180, 180, stroke=0, fill=1)
    c.setFillColor(C["purple"])
    c.wedge(cx - r, y0 - 3 * r, cx + r, y0 - r, 0, 180, stroke=0, fill=1)
    c.restoreState()


def draw_arrow(c, x, y, length=26, color="black"):
    c.saveState()
    c.setStrokeColor(C[color])
    c.setLineWidth(0.9)
    c.line(x, y, x + length, y)
    c.line(x + length - 6, y + 5, x + length, y)
    c.line(x + length - 6, y - 5, x + length, y)
    c.restoreState()


class PillarCard(Flowable):
    """White card, hairline outline, 6pt left bar in the pillar color."""
    def __init__(self, title, body, color, width, height=46, styles_=None):
        super().__init__()
        self.title, self.body, self.color, self.width, self.height, self.S = title, body, color, width, height, styles_

    def wrap(self, *_):
        return self.width, self.height

    def draw(self):
        from reportlab.platypus import Paragraph
        c = self.canv
        c.setStrokeColor(C["gray_mid"]); c.setLineWidth(0.6)
        c.rect(0, 0, self.width, self.height, stroke=1, fill=0)
        c.setFillColor(C[self.color]); c.rect(0, 0, 6, self.height, stroke=0, fill=1)
        p = Paragraph(f"{self.title}<br/><font name='{FONT['light']}' size='9' color='{PALETTE['gray_dark']}'>{self.body}</font>", self.S["item"])
        w, h = p.wrap(self.width - 30, self.height)
        p.drawOn(c, 20, (self.height - h) / 2)


class Band(Flowable):
    """Full-bleed colored statement band; extends past the frame to the page edges."""
    def __init__(self, text, style, fill="purple", left_bleed=0, page_width=0, height=120, pad=0):
        super().__init__()
        self.text, self.style, self.fill = text, style, fill
        self.left_bleed, self.page_width, self.height, self.pad = left_bleed, page_width, height, pad

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.height

    def draw(self):
        from reportlab.platypus import Paragraph
        c = self.canv
        c.setFillColor(C[self.fill])
        c.rect(-self.left_bleed, 0, self.page_width, self.height, stroke=0, fill=1)
        p = Paragraph(self.text, self.style)
        _, h = p.wrap(self.width * 0.85, self.height)
        p.drawOn(c, 0, (self.height - h) / 2)
