from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random

FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts/"

W, H = 3600, 5400
img = Image.new("RGB", (W, H), (4, 4, 6))
draw = ImageDraw.Draw(img)

random.seed(42)

# ── BACKGROUND: deep graphite gradient ──────────────────────────────────────
bg = Image.new("RGB", (W, H))
bg_draw = ImageDraw.Draw(bg)
for y in range(H):
    t = y / H
    r = int(4 + t * 8)
    g = int(4 + t * 6)
    b = int(6 + t * 14)
    bg_draw.line([(0, y), (W, y)], fill=(r, g, b))
img.paste(bg)
draw = ImageDraw.Draw(img)

# ── SUBTLE NOISE TEXTURE ──────────────────────────────────────────────────
noise_layer = Image.new("RGB", (W, H), 0)
noise_draw = ImageDraw.Draw(noise_layer)
for _ in range(280000):
    x = random.randint(0, W - 1)
    y = random.randint(0, H - 1)
    v = random.randint(0, 22)
    noise_draw.point((x, y), fill=(v, v, v))
img = Image.blend(img, noise_layer, 0.06)
draw = ImageDraw.Draw(img)

# ── CENTRAL GLOW — horizontal band behind car ─────────────────────────────
glow_layer = Image.new("RGB", (W, H), 0)
gd = ImageDraw.Draw(glow_layer)
# Wide horizontal radial glow at vertical center
cx, cy = W // 2, int(H * 0.46)
for i in range(90, 0, -1):
    alpha = int(i * 0.7)
    rx = int(W * 0.82 * (i / 90))
    ry = int(H * 0.14 * (i / 90))
    gd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry],
               fill=(alpha // 12, alpha // 8, alpha // 3))
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(260))
img = Image.blend(img, glow_layer, 0.75)
draw = ImageDraw.Draw(img)

# ── BLUEPRINT GRID ────────────────────────────────────────────────────────
GRID_COL = (18, 30, 60, 100)  # RGBA-ish but we use alpha blend trick
grid_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd2 = ImageDraw.Draw(grid_layer)

CELL = 120
for x in range(0, W, CELL):
    gd2.line([(x, 0), (x, H)], fill=(20, 45, 90, 55), width=1)
for y in range(0, H, CELL):
    gd2.line([(0, y), (W, y)], fill=(20, 45, 90, 55), width=1)
for x in range(0, W, CELL * 5):
    gd2.line([(x, 0), (x, H)], fill=(28, 60, 120, 90), width=2)
for y in range(0, H, CELL * 5):
    gd2.line([(0, y), (W, y)], fill=(28, 60, 120, 90), width=2)

base_rgba = img.convert("RGBA")
base_rgba = Image.alpha_composite(base_rgba, grid_layer)
img = base_rgba.convert("RGB")
draw = ImageDraw.Draw(img)

# ── CAR SILHOUETTE ────────────────────────────────────────────────────────
def draw_car(draw, ox, oy, scale=1.0):
    s = scale
    # Main body — sleek sports coupe profile
    body = [
        (ox + 220*s, oy + 280*s),   # front nose
        (ox + 320*s, oy + 180*s),   # front hood rise
        (ox + 520*s, oy + 80*s),    # windshield base front
        (ox + 680*s, oy + 10*s),    # roof peak
        (ox + 960*s, oy + 60*s),    # rear roofline
        (ox + 1100*s, oy + 150*s),  # rear pillar
        (ox + 1200*s, oy + 240*s),  # rear deck
        (ox + 1220*s, oy + 280*s),  # rear bumper top
        (ox + 1240*s, oy + 330*s),  # rear
        (ox + 1100*s, oy + 350*s),  # rear underbody
        (ox + 980*s, oy + 360*s),   # rear wheel arch center
        (ox + 840*s, oy + 380*s),   # rear wheel arch base
        (ox + 760*s, oy + 350*s),   # rear wheel arch
        (ox + 620*s, oy + 350*s),   # underbody center
        (ox + 480*s, oy + 360*s),   # front wheel arch
        (ox + 380*s, oy + 380*s),   # front wheel base
        (ox + 280*s, oy + 360*s),   # front wheel arch top
        (ox + 180*s, oy + 330*s),   # front bumper
        (ox + 160*s, oy + 295*s),   # front lower
        (ox + 220*s, oy + 280*s),   # close
    ]
    # Body fill
    draw.polygon(body, fill=(14, 14, 18))
    # Body outline — chrome highlight
    draw.polygon(body, outline=(90, 110, 160), width=3)

    # WINDSHIELD
    ws = [
        (ox + 530*s, oy + 85*s),
        (ox + 690*s, oy + 18*s),
        (ox + 870*s, oy + 55*s),
        (ox + 720*s, oy + 90*s),
    ]
    draw.polygon(ws, fill=(20, 30, 55))
    draw.polygon(ws, outline=(60, 90, 180, 180), width=2)

    # REAR WINDOW
    rw = [
        (ox + 870*s, oy + 55*s),
        (ox + 960*s, oy + 65*s),
        (ox + 1080*s, oy + 155*s),
        (ox + 960*s, oy + 130*s),
    ]
    draw.polygon(rw, fill=(16, 24, 44))
    draw.polygon(rw, outline=(50, 75, 150), width=2)

    # WHEEL ARCH FRONT
    wax, way = ox + 380*s, oy + 350*s
    wr = 95*s
    draw.ellipse([wax-wr, way-wr, wax+wr, way+wr], fill=(8, 8, 12), outline=(70, 90, 150), width=3)
    # Rim detail
    draw.ellipse([wax-wr*0.72, way-wr*0.72, wax+wr*0.72, way+wr*0.72], outline=(50, 70, 130), width=2)
    draw.ellipse([wax-wr*0.28, way-wr*0.28, wax+wr*0.28, way+wr*0.28], fill=(28, 35, 60))
    for angle_deg in range(0, 360, 45):
        rad = math.radians(angle_deg)
        x1 = wax + math.cos(rad) * wr * 0.32
        y1 = way + math.sin(rad) * wr * 0.32
        x2 = wax + math.cos(rad) * wr * 0.70
        y2 = way + math.sin(rad) * wr * 0.70
        draw.line([(x1, y1), (x2, y2)], fill=(55, 75, 140), width=3)

    # WHEEL ARCH REAR
    wax2, way2 = ox + 900*s, oy + 350*s
    draw.ellipse([wax2-wr, way2-wr, wax2+wr, way2+wr], fill=(8, 8, 12), outline=(70, 90, 150), width=3)
    draw.ellipse([wax2-wr*0.72, way2-wr*0.72, wax2+wr*0.72, way2+wr*0.72], outline=(50, 70, 130), width=2)
    draw.ellipse([wax2-wr*0.28, way2-wr*0.28, wax2+wr*0.28, way2+wr*0.28], fill=(28, 35, 60))
    for angle_deg in range(0, 360, 45):
        rad = math.radians(angle_deg)
        x1 = wax2 + math.cos(rad) * wr * 0.32
        y1 = way2 + math.sin(rad) * wr * 0.32
        x2 = wax2 + math.cos(rad) * wr * 0.70
        y2 = way2 + math.sin(rad) * wr * 0.70
        draw.line([(x1, y1), (x2, y2)], fill=(55, 75, 140), width=3)

    # HEADLIGHT — front
    hl = [(ox + 200*s, oy + 270*s), (ox + 200*s, oy + 295*s),
          (ox + 310*s, oy + 260*s), (ox + 320*s, oy + 240*s)]
    draw.polygon(hl, fill=(160, 190, 255))
    # headlight glow stroke
    draw.polygon(hl, outline=(200, 220, 255), width=2)

    # TAIL LIGHT
    tl = [(ox + 1170*s, oy + 250*s), (ox + 1230*s, oy + 260*s),
          (ox + 1235*s, oy + 295*s), (ox + 1170*s, oy + 300*s)]
    draw.polygon(tl, fill=(120, 40, 40))
    draw.polygon(tl, outline=(200, 80, 80), width=2)

    # DOOR LINE
    draw.line([(ox + 550*s, oy + 95*s), (ox + 1050*s, oy + 175*s)], fill=(45, 65, 120), width=2)

    # SIDE SKIRT highlight
    draw.line([(ox + 200*s, oy + 325*s), (ox + 1200*s, oy + 300*s)], fill=(35, 55, 100), width=2)
    draw.line([(ox + 200*s, oy + 328*s), (ox + 1200*s, oy + 303*s)], fill=(20, 35, 70), width=1)

    return body

# Draw shadow
shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow_layer)
sx, sy = int(W * 0.10), int(H * 0.44)
sc = 2.3
shadow_pts = []
for i in range(20):
    angle = math.pi * i / 19
    r = int(W * 0.42)
    ry2 = int(H * 0.025)
    shadow_pts.append((sx + int(r * math.cos(angle)), sy + int(ry2 * math.sin(angle))))
for i in range(19, -1, -1):
    angle = math.pi * i / 19
    shadow_pts.append((sx + int(r * math.cos(angle)), sy))
sd.polygon(shadow_pts, fill=(0, 0, 0, 180))
shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(55))
img = img.convert("RGBA")
img = Image.alpha_composite(img, shadow_layer)
img = img.convert("RGB")
draw = ImageDraw.Draw(img)

# Draw car
ox = int(W * 0.10)
oy = int(H * 0.335)
sc = 2.28
draw_car(draw, ox, oy, sc)

# ── RIM LIGHT on car body ──────────────────────────────────────────────────
rim_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
rd = ImageDraw.Draw(rim_layer)
# top rim highlight line
rd.line([(ox + int(220*sc), oy + int(280*sc)),
         (ox + int(320*sc), oy + int(180*sc)),
         (ox + int(520*sc), oy + int(80*sc)),
         (ox + int(680*sc), oy + int(10*sc)),
         (ox + int(960*sc), oy + int(60*sc)),
         (ox + int(1100*sc), oy + int(150*sc)),
         (ox + int(1200*sc), oy + int(240*sc))],
        fill=(80, 120, 255, 180), width=4)
rim_layer = rim_layer.filter(ImageFilter.GaussianBlur(12))
img = img.convert("RGBA")
img = Image.alpha_composite(img, rim_layer)
img = img.convert("RGB")
draw = ImageDraw.Draw(img)

# ── BLUEPRINT ANNOTATION LINES ────────────────────────────────────────────
CYAN = (60, 140, 255)
CYAN2 = (40, 100, 200)
ACCENT = (100, 180, 255)

# Horizontal datum line through car
car_mid_y = int(H * 0.455)
draw.line([(80, car_mid_y), (W - 80, car_mid_y)], fill=(25, 55, 110), width=1)

# Vertical centerline
draw.line([(W // 2, int(H * 0.08)), (W // 2, int(H * 0.85))], fill=(22, 50, 100), width=1)

# Dimension brackets top
bx1 = int(W * 0.10)
bx2 = int(W * 0.90)
by = int(H * 0.27)
draw.line([(bx1, by), (bx2, by)], fill=CYAN2, width=1)
draw.line([(bx1, by - 30), (bx1, by + 30)], fill=CYAN2, width=2)
draw.line([(bx2, by - 30), (bx2, by + 30)], fill=CYAN2, width=2)

# Wheel axis lines
for wx in [int(W * 0.265), int(W * 0.68)]:
    draw.line([(wx, int(H * 0.52)), (wx, int(H * 0.57))], fill=CYAN2, width=1)
    draw.ellipse([wx-6, int(H*0.535)-6, wx+6, int(H*0.535)+6], outline=CYAN2, width=1)

# Wheelbase bracket
wbase_y = int(H * 0.585)
wx1 = int(W * 0.265)
wx2 = int(W * 0.680)
draw.line([(wx1, wbase_y), (wx2, wbase_y)], fill=CYAN2, width=1)
draw.line([(wx1, wbase_y - 15), (wx1, wbase_y + 15)], fill=CYAN2, width=2)
draw.line([(wx2, wbase_y - 15), (wx2, wbase_y + 15)], fill=CYAN2, width=2)

# ── FONTS ─────────────────────────────────────────────────────────────────
try:
    font_title = ImageFont.truetype(FONTS + "BigShoulders-Bold.ttf", 520)
    font_sub   = ImageFont.truetype(FONTS + "WorkSans-Regular.ttf", 62)
    font_mono  = ImageFont.truetype(FONTS + "GeistMono-Regular.ttf", 42)
    font_mono_sm = ImageFont.truetype(FONTS + "GeistMono-Regular.ttf", 30)
    font_small = ImageFont.truetype(FONTS + "WorkSans-Regular.ttf", 40)
    font_tag   = ImageFont.truetype(FONTS + "WorkSans-Bold.ttf", 50)
    font_label = ImageFont.truetype(FONTS + "IBMPlexMono-Regular.ttf", 36)
    font_large_sub = ImageFont.truetype(FONTS + "WorkSans-Regular.ttf", 85)
    font_accent_title = ImageFont.truetype(FONTS + "BigShoulders-Regular.ttf", 200)
except Exception as e:
    print(f"Font error: {e}")
    font_title = font_sub = font_mono = font_small = ImageFont.load_default()
    font_mono_sm = font_tag = font_label = font_large_sub = font_accent_title = font_title

# ── HEADLINE — large behind car ───────────────────────────────────────────
# Draw title at 15% opacity (sits behind car compositionally)
title_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
td = ImageDraw.Draw(title_layer)
title_text = "APEX"
bb = td.textbbox((0, 0), title_text, font=font_title)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
tx = (W - tw) // 2
ty = int(H * 0.28)
td.text((tx, ty), title_text, font=font_title, fill=(255, 255, 255, 32))
img = img.convert("RGBA")
img = Image.alpha_composite(img, title_layer)
img = img.convert("RGB")
draw = ImageDraw.Draw(img)

# ── MODEL DESIGNATION — right side ───────────────────────────────────────
model_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
md2 = ImageDraw.Draw(model_layer)
model_text = "GT—X"
bb = md2.textbbox((0, 0), model_text, font=font_accent_title)
mw, mh = bb[2] - bb[0], bb[3] - bb[1]
md2.text((W - mw - 160, int(H * 0.74)), model_text,
         font=font_accent_title, fill=(60, 140, 255, 120))
img = img.convert("RGBA")
img = Image.alpha_composite(img, model_layer)
img = img.convert("RGB")
draw = ImageDraw.Draw(img)

# ── VERTICAL BRAND NAME — far left ───────────────────────────────────────
brand_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(brand_layer)
brand = "SOLARIS"
# draw vertically
brand_img = Image.new("RGBA", (2000, 200), (0, 0, 0, 0))
b2 = ImageDraw.Draw(brand_img)
b2.text((0, 0), brand, font=ImageFont.truetype(FONTS + "WorkSans-Regular.ttf", 100),
        fill=(200, 220, 255, 160))
brand_rot = brand_img.rotate(90, expand=True)
brand_layer.paste(brand_rot, (55, int(H * 0.18)))
img = img.convert("RGBA")
img = Image.alpha_composite(img, brand_layer)
img = img.convert("RGB")
draw = ImageDraw.Draw(img)

# ── SECTION LABELS top ────────────────────────────────────────────────────
draw.text((int(W * 0.10), int(H * 0.07)),
          "CHROMATIC VELOCITY", font=font_sub, fill=(70, 120, 200))
draw.text((int(W * 0.10), int(H * 0.07) + 75),
          "DESIGN SERIES · 2025", font=font_mono_sm, fill=(40, 75, 140))

# Thin separator line
draw.line([(int(W * 0.10), int(H * 0.075) + 145),
           (int(W * 0.60), int(H * 0.075) + 145)],
          fill=(30, 65, 130), width=1)

# ── TECH SPEC ANNOTATIONS ─────────────────────────────────────────────────
SPEC_X = int(W * 0.78)

specs = [
    ("ENGINE",        "4.0L TWIN TURBO V8"),
    ("OUTPUT",        "720 BHP / 538 kW"),
    ("TORQUE",        "890 Nm @ 3,200 RPM"),
    ("0–100 KM/H",   "2.8 SEC"),
    ("TOP SPEED",     "348 KM/H"),
    ("DRAG COEFF",    "CD 0.21"),
    ("WEIGHT",        "1,420 KG"),
    ("WHEELBASE",     "2,760 mm"),
]

sy_start = int(H * 0.09)
line_h = 90
for i, (label, val) in enumerate(specs):
    sy_ = sy_start + i * line_h
    draw.text((SPEC_X, sy_), label, font=font_label, fill=(40, 80, 160))
    draw.text((SPEC_X, sy_ + 38), val, font=font_mono, fill=(160, 200, 255))
    if i < len(specs) - 1:
        draw.line([(SPEC_X, sy_ + 82), (SPEC_X + 560, sy_ + 82)],
                  fill=(22, 44, 88), width=1)

# ── DIMENSION ANNOTATIONS ─────────────────────────────────────────────────
dim_y = int(H * 0.295)
draw.text(((bx1 + bx2) // 2 - 80, dim_y - 70),
          "4,820 mm", font=font_mono_sm, fill=CYAN2)

wb_label_x = (wx1 + wx2) // 2 - 90
draw.text((wb_label_x, wbase_y + 20), "2,760 mm", font=font_mono_sm, fill=CYAN2)

# ── LOWER TEXT BLOCK ─────────────────────────────────────────────────────
ly = int(H * 0.68)
draw.text((int(W * 0.10), ly), "WHERE MOTION BECOMES",
          font=font_large_sub, fill=(180, 200, 240))
draw.text((int(W * 0.10), ly + 100), "ARCHITECTURE.",
          font=ImageFont.truetype(FONTS + "BigShoulders-Bold.ttf", 100),
          fill=(60, 140, 255))

draw.line([(int(W * 0.10), ly + 210), (int(W * 0.55), ly + 210)],
          fill=(30, 65, 130), width=1)

draw.text((int(W * 0.10), ly + 240),
          "Every surface sculpted by computational fluid dynamics. Every gram weighed",
          font=font_small, fill=(70, 95, 140))
draw.text((int(W * 0.10), ly + 290),
          "against aerodynamic necessity. The result is not compromise — it is synthesis.",
          font=font_small, fill=(70, 95, 140))

# ── HOTSPOT CIRCLES — detail callouts ────────────────────────────────────
def draw_hotspot(draw, cx, cy, label, sub, anchor_x=None):
    """Floating callout dot with line"""
    r = 18
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ACCENT, width=2)
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=ACCENT)
    ax = anchor_x if anchor_x else cx + 120
    ay = cy
    draw.line([(cx + r, cy), (ax, ay)], fill=ACCENT, width=1)
    draw.text((ax + 15, ay - 30), label,
              font=font_label, fill=ACCENT)
    draw.text((ax + 15, ay + 5), sub,
              font=font_mono_sm, fill=(60, 100, 170))

# Headlight hotspot
draw_hotspot(draw,
             int(W * 0.185), int(H * 0.42),
             "LED MATRIX", "72 ELEMENTS · ADAPTIVE",
             anchor_x=int(W * 0.08))

# Roof hotspot
draw_hotspot(draw,
             int(W * 0.50), int(H * 0.367),
             "ACTIVE AERO",
             "CONTINUOUS RAKE ADJUST",
             anchor_x=int(W * 0.53))

# Rear hotspot
draw_hotspot(draw,
             int(W * 0.865), int(H * 0.44),
             "DIFFUSER",
             "CARBON FIBRE · CNC",
             anchor_x=int(W * 0.75))

# ── BOTTOM BAR ───────────────────────────────────────────────────────────
bar_y = int(H * 0.93)
draw.line([(0, bar_y), (W, bar_y)], fill=(22, 44, 88), width=1)

footer_items = [
    (int(W * 0.10), "SOLARIS AUTOMOTIVE"),
    (int(W * 0.36), "REF: GT—X / SRS—25—001"),
    (int(W * 0.62), "PROPRIETARY DESIGN DOCUMENT"),
    (int(W * 0.84), "©2025"),
]
for fx, ft in footer_items:
    draw.text((fx, bar_y + 30), ft, font=font_mono_sm, fill=(35, 65, 120))

# ── COLOR SWATCH STRIP ───────────────────────────────────────────────────
sw_y = int(H * 0.80)
swatches = [
    ((8, 8, 12), "OBSIDIAN"),
    ((28, 38, 75), "VOID BLUE"),
    ((55, 65, 80), "GRAPHITE"),
    ((180, 185, 195), "CHROME"),
    ((60, 140, 255), "PLASMA"),
]
sw_x = int(W * 0.10)
sw_w = 100
sw_h = 50
gap = 130

for i, (col, name) in enumerate(swatches):
    xp = sw_x + i * gap
    draw.rectangle([xp, sw_y, xp + sw_w, sw_y + sw_h], fill=col, outline=(40, 70, 140), width=1)
    draw.text((xp, sw_y + 62), name, font=font_mono_sm, fill=(50, 85, 150))

draw.text((sw_x, sw_y - 55), "FINISH OPTIONS", font=font_label, fill=(50, 85, 150))
draw.line([(sw_x, sw_y - 18), (sw_x + 580, sw_y - 18)], fill=(25, 50, 100), width=1)

# ── FINAL CINEMATIC GLOW at nose of car ───────────────────────────────────
glow2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g2d = ImageDraw.Draw(glow2)
gx = int(W * 0.14)
gy = int(H * 0.435)
for i in range(60, 0, -1):
    a = int(i * 2.0)
    rr = int(280 * i / 60)
    g2d.ellipse([gx - rr, gy - rr // 3, gx + rr, gy + rr // 3],
                fill=(a // 2, int(a // 1.5), min(a * 2, 255), a // 6))
glow2 = glow2.filter(ImageFilter.GaussianBlur(80))
img = img.convert("RGBA")
img = Image.alpha_composite(img, glow2)
img = img.convert("RGB")
draw = ImageDraw.Draw(img)

# ── SECTION NUMBER / SERIES MARKER ───────────────────────────────────────
draw.text((int(W * 0.88), int(H * 0.70)),
          "01", font=ImageFont.truetype(FONTS + "BigShoulders-Bold.ttf", 300),
          fill=(18, 35, 75))

# ── SAVE ──────────────────────────────────────────────────────────────────
out_path = "/home/claude/solaris_gtx_poster.png"
img = img.convert("RGB")
img.save(out_path, "PNG", dpi=(300, 300))
print(f"Saved: {out_path}  ({W}x{H})")