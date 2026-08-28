"""Gera grid 3x3 Instagram da logo FACTO com borda neural."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "brand" / "facto-logo.png"
OUT = ROOT / "docs" / "instagram" / "grid-logo"
DESKTOP = Path.home() / "Desktop" / "FACTO-instagram-grid"

TILE, N = 1080, 3
CANVAS = TILE * N
BG = (8, 8, 9)
GOLD = (144, 139, 106)
GOLD_MID = (176, 168, 122)
GOLD_HI = (220, 210, 165)
CYAN = (120, 190, 210)  # pulso de IA, pontual


def trim_dark(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size

    def dark(a: tuple) -> bool:
        r, g, b, al = a
        return al < 10 or (r < 30 and g < 30 and b < 30)

    ys = [y for y in range(h) if any(not dark(px[x, y]) for x in range(0, w, 3))]
    xs = [x for x in range(w) if any(not dark(px[x, y]) for y in range(0, h, 3))]
    if not xs or not ys:
        return im
    return im.crop(
        (max(0, min(xs) - 6), max(0, min(ys) - 6), min(w, max(xs) + 6), min(h, max(ys) + 6))
    )


def ring(inset: float, n: int, rng: random.Random, jitter: float) -> list[tuple[float, float]]:
    x0 = y0 = inset
    x1 = y1 = CANVAS - inset
    wlen, hlen = x1 - x0, y1 - y0
    per = 2 * (wlen + hlen)
    pts = []
    for i in range(n):
        t = (i / n) * per
        if t < wlen:
            p = (x0 + t, y0)
        elif t < wlen + hlen:
            p = (x1, y0 + (t - wlen))
        elif t < 2 * wlen + hlen:
            p = (x1 - (t - wlen - hlen), y1)
        else:
            p = (x0, y1 - (t - 2 * wlen - hlen))
        pts.append((p[0] + rng.uniform(-jitter, jitter), p[1] + rng.uniform(-jitter, jitter)))
    return pts


def dist(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def main() -> None:
    rng = random.Random(42)
    OUT.mkdir(parents=True, exist_ok=True)

    glow = Image.new("RGB", (CANVAS, CANVAS), BG)
    gdraw = ImageDraw.Draw(glow)

    margin, inner = 42, 200

    layers = [
        ring(margin + 22, 90, rng, 18),
        ring(margin + 70, 84, rng, 22),
        ring((margin + inner) * 0.55, 88, rng, 18),
        ring(inner - 18, 96, rng, 12),
    ]
    # núcleos nos cantos (sinapses densas)
    for cx, cy in [
        (140, 140),
        (CANVAS - 140, 140),
        (140, CANVAS - 140),
        (CANVAS - 140, CANVAS - 140),
    ]:
        for _ in range(14):
            ang = rng.random() * math.tau
            rad = rng.uniform(12, 110)
            layers[0].append((cx + math.cos(ang) * rad, cy + math.sin(ang) * rad))

    # impulsos só no anel da borda
    for i in range(48):
        ang = (i / 48) * math.tau + 0.08
        r0, r1 = inner - 4, CANVAS / 2 - margin - 4
        x0 = CANVAS / 2 + math.cos(ang) * r0
        y0 = CANVAS / 2 + math.sin(ang) * r0
        x1 = CANVAS / 2 + math.cos(ang) * r1
        y1 = CANVAS / 2 + math.sin(ang) * r1
        gdraw.line([(x0, y0), (x1, y1)], fill=GOLD_MID, width=2)

    all_pts = [p for L in layers for p in L]
    for p in all_pts:
        near = sorted((dist(p, q), q) for q in all_pts if q is not p)[:5]
        for d, q in near:
            if d < 175:
                w = 4 if d < 45 else 3 if d < 85 else 2
                col = GOLD_HI if d < 50 else GOLD_MID if d < 110 else GOLD
                gdraw.line([p, q], fill=col, width=w)

    for p in all_pts:
        r = 7 if rng.random() < 0.15 else 4 if rng.random() < 0.45 else 3
        col = CYAN if rng.random() < 0.12 else GOLD_HI
        gdraw.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=col)

    glow_blur = glow.filter(ImageFilter.GaussianBlur(10))
    base = Image.blend(glow, glow_blur, 0.62)

    d = ImageDraw.Draw(base)
    d.rounded_rectangle(
        [inner + 10, inner + 10, CANVAS - inner - 10, CANVAS - inner - 10],
        radius=22,
        fill=BG,
    )
    d.rounded_rectangle([margin - 6, margin - 6, CANVAS - margin + 6, CANVAS - margin + 6], radius=40, outline=GOLD, width=8)
    d.rounded_rectangle([margin + 16, margin + 16, CANVAS - margin - 16, CANVAS - margin - 16], radius=32, outline=GOLD_MID, width=3)
    d.rounded_rectangle([inner, inner, CANVAS - inner, CANVAS - inner], radius=24, outline=GOLD_HI, width=5)

    # cantos tipo HUD / circuito
    tick = 70
    for ox, oy, sx, sy in [
        (margin, margin, 1, 1),
        (CANVAS - margin, margin, -1, 1),
        (margin, CANVAS - margin, 1, -1),
        (CANVAS - margin, CANVAS - margin, -1, -1),
    ]:
        d.line([(ox, oy), (ox + sx * tick, oy)], fill=GOLD_HI, width=5)
        d.line([(ox, oy), (ox, oy + sy * tick)], fill=GOLD_HI, width=5)
        d.ellipse([ox - 6, oy - 6, ox + 6, oy + 6], fill=CYAN)

    # logo
    logo = trim_dark(Image.open(SRC))
    box = inner + 28
    max_w, max_h = CANVAS - 2 * box, CANVAS - 2 * box
    scale = min(max_w / logo.width, max_h / logo.height)
    nw, nh = int(logo.width * scale), int(logo.height * scale)
    logo_r = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    x, y = (CANVAS - nw) // 2, (CANVAS - nh) // 2
    base.paste(logo_r, (x, y), logo_r)

    base.save(OUT / "00-preview-grid-completo.png", "PNG", optimize=True)
    DESKTOP.mkdir(parents=True, exist_ok=True)
    base.save(DESKTOP / "00-preview-grid-completo.png", "PNG", optimize=True)

    order_lines = [
        "Publique NESTA ORDEM (Instagram: o mais novo fica no canto superior esquerdo).",
        "",
    ]
    for r in range(N):
        for c in range(N):
            i = r * N + c + 1
            tile = base.crop((c * TILE, r * TILE, (c + 1) * TILE, (r + 1) * TILE))
            name = f"tile-{i}-linha{r + 1}-coluna{c + 1}.png"
            tile.save(OUT / name, "PNG", optimize=True)
            tile.save(DESKTOP / name, "PNG", optimize=True)

    post_order = list(reversed(range(1, 10)))
    for step, n in enumerate(post_order, 1):
        r = (n - 1) // 3 + 1
        c = (n - 1) % 3 + 1
        src_name = f"tile-{n}-linha{r}-coluna{c}.png"
        pub = f"{step:02d}-publicar-{src_name}"
        data = (OUT / src_name).read_bytes()
        (OUT / pub).write_bytes(data)
        (DESKTOP / pub).write_bytes(data)
        order_lines.append(f"{step}. {pub}")
    (OUT / "LEIA-ME-ORDEM-DE-POST.txt").write_text("\n".join(order_lines), encoding="utf-8")
    (DESKTOP / "LEIA-ME-ORDEM-DE-POST.txt").write_text("\n".join(order_lines), encoding="utf-8")
    print("OK", OUT)
    print("Desktop", DESKTOP)


if __name__ == "__main__":
    main()
