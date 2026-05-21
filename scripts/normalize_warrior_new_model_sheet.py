#!/usr/bin/env python
"""Normalize the model-generated warrior sprite sheet into runtime strips.

This script does not draw the character. It only removes the chroma-key
background from the generated model sheet, extracts action frames, anchors them
by the feet, and writes fixed 320x208 transparent strips.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "sprites" / "warrior-new" / "raw" / "warrior-new-model-sheet.png"
OUT_DIR = ROOT / "assets" / "sprites" / "warrior-new"
PREVIEW_DIR = ROOT / "assets" / "sprites" / "warrior-new-preview"
PREVIEW_HTML = ROOT / "preview-warrior-new.html"

FRAME_W = 320
FRAME_H = 208
TARGET_ANCHOR = (160, 179)
SCALE = 1.12


@dataclass(frozen=True)
class ActionSpec:
    name: str
    row: tuple[int, int]
    centers: tuple[int, ...]
    out_frames: int
    source_indices: tuple[int, ...] | None = None
    windows: tuple[tuple[int, int], ...] | None = None


SPECS = [
    ActionSpec("idle", (25, 143), (), 6, (0, 1, 2, 3, 4, 3), ((45, 215), (220, 385), (395, 555), (560, 725), (730, 895))),
    ActionSpec("run", (178, 277), (), 7, windows=((20, 175), (190, 350), (380, 535), (560, 720), (745, 900), (920, 1080), (1095, 1255))),
    ActionSpec("attack", (443, 547), (), 8, windows=((25, 205), (200, 365), (380, 575), (580, 775), (775, 1005), (1005, 1170), (1185, 1360), (1350, 1520))),
    ActionSpec("attack-heavy", (590, 685), (), 8, windows=((35, 205), (220, 400), (390, 590), (600, 800), (805, 980), (970, 1140), (1145, 1315), (1310, 1520))),
    ActionSpec("cast", (712, 826), (), 5, windows=((20, 165), (200, 355), (390, 545), (590, 745), (775, 925))),
    ActionSpec("hurt", (835, 940), (), 2, windows=((35, 165), (195, 335))),
    ActionSpec("death", (925, 1002), (), 9, (0, 1, 2, 3, 4, 5, 6, 6, 6), ((190, 335), (380, 535), (555, 725), (735, 925), (925, 1120), (1120, 1320), (1320, 1480))),
]


def alpha_from_green(img: Image.Image) -> Image.Image:
    data = np.array(img.convert("RGBA"))
    r = data[:, :, 0].astype(np.int16)
    g = data[:, :, 1].astype(np.int16)
    b = data[:, :, 2].astype(np.int16)
    a = data[:, :, 3]

    key = (g > 135) & (r < 120) & (b < 120) & (g > r * 1.35) & (g > b * 1.35)
    edge_key = (g > 105) & (r < 150) & (b < 150) & (g > r + 45) & (g > b + 45)
    data[key | edge_key, 3] = 0

    # Despill remaining antialias pixels without touching the red sword glow.
    fringe = (data[:, :, 3] > 0) & (g > r + 25) & (g > b + 25)
    data[fringe, 1] = np.maximum(data[fringe, 0], data[fringe, 2])
    return Image.fromarray(data, "RGBA")


def intervals_from_centers(centers: tuple[int, ...], width: int) -> list[tuple[int, int]]:
    intervals: list[tuple[int, int]] = []
    for i, center in enumerate(centers):
        left = 0 if i == 0 else (centers[i - 1] + center) // 2
        right = width if i == len(centers) - 1 else (center + centers[i + 1]) // 2
        intervals.append((left, right))
    return intervals


def padded_bbox(img: Image.Image, pad: int = 10) -> tuple[int, int, int, int] | None:
    bbox = img.getchannel("A").getbbox()
    if not bbox:
        return None
    l, t, r, b = bbox
    return (max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, b + pad))


def detect_anchor(crop: Image.Image) -> tuple[int, int]:
    alpha = np.asarray(crop.getchannel("A"))
    ys, xs = np.where(alpha > 0)
    if len(xs) == 0:
        return (crop.width // 2, crop.height - 1)
    bottom = int(ys.max())
    lower = ys >= max(0, bottom - 8)
    lower_xs = xs[lower]
    if len(lower_xs) == 0:
        return (int(np.median(xs)), bottom)
    # Median of lower pixels keeps attacks anchored near the feet instead of
    # following wide sword trails.
    return (int(np.median(lower_xs)), bottom)


def normalize_source_frame(source: Image.Image, row: tuple[int, int], interval: tuple[int, int], action: str) -> Image.Image:
    x0, x1 = interval
    y0, y1 = row
    cell = source.crop((x0, y0, x1, y1 + 1))
    box = padded_bbox(cell, 10)
    if not box:
        return Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    crop = cell.crop(box)
    anchor = detect_anchor(crop)

    scale = SCALE
    if action == "death":
        scale = 1.06
    max_w = FRAME_W - 10
    max_h = FRAME_H - 6
    scale = min(scale, max_w / crop.width, max_h / crop.height)
    new_size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    resized = crop.resize(new_size, Image.Resampling.NEAREST)
    scaled_anchor = (round(anchor[0] * scale), round(anchor[1] * scale))

    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    dx = TARGET_ANCHOR[0] - scaled_anchor[0]
    dy = TARGET_ANCHOR[1] - scaled_anchor[1]
    frame.alpha_composite(resized, (dx, dy))
    return frame


def make_strip(source: Image.Image, spec: ActionSpec) -> Image.Image:
    intervals = list(spec.windows or intervals_from_centers(spec.centers, source.width))
    frames = [normalize_source_frame(source, spec.row, interval, spec.name) for interval in intervals]
    indices = spec.source_indices or tuple(range(len(frames)))
    selected = [frames[i] for i in indices]
    if len(selected) != spec.out_frames:
        raise RuntimeError(f"{spec.name}: expected {spec.out_frames}, got {len(selected)}")
    strip = Image.new("RGBA", (FRAME_W * spec.out_frames, FRAME_H), (0, 0, 0, 0))
    for i, frame in enumerate(selected):
        strip.alpha_composite(frame, (i * FRAME_W, 0))
    return strip


def make_contact_sheet(strips: dict[str, Image.Image]) -> Image.Image:
    label_h = 24
    width = FRAME_W * 8
    rows = []
    for name, strip in strips.items():
        row = Image.new("RGBA", (width, FRAME_H + label_h), (8, 8, 8, 255))
        d = ImageDraw.Draw(row)
        d.rectangle((0, 0, width, label_h - 1), fill=(18, 14, 15, 255))
        d.text((8, 5), f"{name} - {strip.width // FRAME_W} frames / {FRAME_W}x{FRAME_H}", fill=(238, 226, 208, 255))
        row.alpha_composite(strip.crop((0, 0, min(width, strip.width), FRAME_H)), (0, label_h))
        rows.append(row)
    out = Image.new("RGBA", (width, sum(r.height for r in rows)), (8, 8, 8, 255))
    y = 0
    for row in rows:
        out.alpha_composite(row, (0, y))
        y += row.height
    return out


def write_preview_html() -> None:
    action_rows = ",\n      ".join(
        f'{{ key: "{spec.name}", label: "{spec.name.replace("-", " ").title()}", frames: {spec.out_frames} }}'
        for spec in SPECS
    )
    PREVIEW_HTML.write_text(
        f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Warrior New Sprite Preview</title>
  <style>
    :root {{ color-scheme: dark; --bg:#100d0d; --panel:#1b1415; --line:#55352f; --ink:#f7ead6; --muted:#b89e8b; --gold:#ffc76b; --red:#ff442c; }}
    * {{ box-sizing: border-box; }}
    body {{ margin:0; min-height:100vh; font-family:"Segoe UI",Arial,sans-serif; background:radial-gradient(circle at 18% 14%,rgba(255,70,36,.12),transparent 30%),linear-gradient(180deg,#130e0e,#090708); color:var(--ink); }}
    main {{ width:min(1240px,calc(100vw - 32px)); margin:0 auto; padding:28px 0; display:grid; grid-template-columns:minmax(320px,430px) minmax(0,1fr); gap:18px; align-items:start; }}
    h1 {{ margin:0 0 14px; font-size:20px; font-weight:750; letter-spacing:0; }}
    .stage,.controls,.sheet {{ border:1px solid var(--line); background:rgba(27,20,21,.92); box-shadow:0 18px 44px rgba(0,0,0,.28); }}
    .stage,.sheet {{ padding:14px; }}
    .viewport {{ width:100%; aspect-ratio:1/1; display:grid; place-items:center; background:linear-gradient(45deg,#211719 25%,transparent 25%),linear-gradient(-45deg,#211719 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#211719 75%),linear-gradient(-45deg,transparent 75%,#211719 75%),#120d0f; background-position:0 0,0 12px,12px -12px,-12px 0; background-size:24px 24px; border:1px solid var(--line); image-rendering:pixelated; }}
    canvas {{ display:block; width:min(94%,520px); height:auto; image-rendering:pixelated; }}
    .meta {{ display:flex; justify-content:space-between; gap:12px; margin-top:12px; color:var(--muted); font-size:13px; }}
    .controls {{ margin-top:14px; padding:14px; display:grid; gap:12px; }}
    .actions {{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }}
    button {{ min-height:38px; border:1px solid var(--line); background:#2a1d1d; color:var(--ink); font:inherit; cursor:pointer; }}
    button.active {{ border-color:var(--gold); color:#150807; background:linear-gradient(135deg,var(--gold),var(--red)); font-weight:750; }}
    label {{ display:grid; gap:6px; color:var(--muted); font-size:13px; }}
    input[type="range"] {{ width:100%; }}
    .sheet {{ overflow:hidden; }}
    .sheet img {{ display:block; width:100%; height:auto; image-rendering:pixelated; border:1px solid var(--line); margin-bottom:12px; }}
    .note {{ color:var(--muted); font-size:13px; line-height:1.5; margin:0; }}
    @media (max-width:860px) {{ main {{ grid-template-columns:1fr; }} .actions {{ grid-template-columns:repeat(2,1fr); }} }}
  </style>
</head>
<body>
  <main>
    <section>
      <div class="stage">
        <h1>Model Generated Warrior Preview</h1>
        <div class="viewport"><canvas id="preview" width="640" height="416"></canvas></div>
        <div class="meta"><span id="animName">idle</span><span id="frameInfo">frame 1 / 6</span></div>
      </div>
      <div class="controls">
        <div class="actions" id="actions"></div>
        <label>Speed <span id="fpsValue">8 FPS</span><input id="fps" type="range" min="2" max="18" value="8"></label>
        <label>Zoom <span id="zoomValue">1.00x</span><input id="zoom" type="range" min="70" max="160" value="100"></label>
      </div>
    </section>
    <section class="sheet">
      <img src="assets/sprites/warrior-new-preview/warrior-new-contact-sheet.png?v=warriorModel1" alt="warrior model generated contact sheet">
      <img src="assets/sprites/warrior-new/raw/warrior-new-model-sheet.png?v=warriorModel1" alt="raw model generated sheet">
      <p class="note">Preview only. These runtime strips are normalized from the model-generated image sheet into fixed 320x208 transparent frames. The game profession mapping has not been changed.</p>
    </section>
  </main>
  <script>
    const frameW={FRAME_W}, frameH={FRAME_H}, assetVersion="warriorModel1";
    const animations=[
      {action_rows}
    ];
    const images={{}};
    for (const anim of animations) {{ const img=new Image(); img.src=`assets/sprites/warrior-new/${{anim.key}}.png?v=${{assetVersion}}`; images[anim.key]=img; }}
    const canvas=document.getElementById("preview"), ctx=canvas.getContext("2d"), actionsEl=document.getElementById("actions");
    const fpsInput=document.getElementById("fps"), zoomInput=document.getElementById("zoom"), fpsValue=document.getElementById("fpsValue"), zoomValue=document.getElementById("zoomValue");
    const animName=document.getElementById("animName"), frameInfo=document.getElementById("frameInfo");
    let current=animations[0], frame=0, lastTick=0;
    function setAnimation(anim) {{ current=anim; frame=0; for (const b of actionsEl.querySelectorAll("button")) b.classList.toggle("active", b.dataset.key===anim.key); draw(); }}
    for (const anim of animations) {{ const b=document.createElement("button"); b.type="button"; b.textContent=anim.label; b.dataset.key=anim.key; b.addEventListener("click",()=>setAnimation(anim)); actionsEl.appendChild(b); }}
    function draw() {{ const img=images[current.key]; if(!img.complete||!img.naturalWidth) return; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.imageSmoothingEnabled=false; const zoom=Number(zoomInput.value)/100; const w=frameW*zoom,h=frameH*zoom; const x=Math.round((canvas.width-w)/2), y=Math.round((canvas.height-h)/2); ctx.drawImage(img,frame*frameW,0,frameW,frameH,x,y,w,h); animName.textContent=current.key; frameInfo.textContent=`frame ${{frame+1}} / ${{current.frames}}`; }}
    function tick(ts) {{ const interval=1000/Number(fpsInput.value); if(ts-lastTick>=interval) {{ frame=(frame+1)%current.frames; lastTick=ts; }} draw(); requestAnimationFrame(tick); }}
    fpsInput.addEventListener("input",()=>fpsValue.textContent=`${{fpsInput.value}} FPS`);
    zoomInput.addEventListener("input",()=>{{ zoomValue.textContent=`${{(Number(zoomInput.value)/100).toFixed(2)}}x`; draw(); }});
    setAnimation(animations[0]); requestAnimationFrame(tick);
  </script>
</body>
</html>
""",
        encoding="utf-8",
    )


def validate_strip(name: str, strip: Image.Image, frames: int) -> None:
    if strip.size != (FRAME_W * frames, FRAME_H):
        raise RuntimeError(f"{name}: invalid size {strip.size}")
    for i in range(frames):
        frame = strip.crop((i * FRAME_W, 0, (i + 1) * FRAME_W, FRAME_H))
        if frame.getchannel("A").getbbox() is None:
            raise RuntimeError(f"{name}: empty frame {i}")


def main() -> int:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    stale_combo = OUT_DIR / "attack-combo.png"
    if stale_combo.exists():
        stale_combo.unlink()

    source = alpha_from_green(Image.open(SOURCE))
    source.save(PREVIEW_DIR / "warrior-new-model-alpha.png")

    strips: dict[str, Image.Image] = {}
    for spec in SPECS:
        strip = make_strip(source, spec)
        validate_strip(spec.name, strip, spec.out_frames)
        strip.save(OUT_DIR / f"{spec.name}.png")
        strips[spec.name] = strip
        print(f"{spec.name}: {strip.width}x{strip.height} frames={spec.out_frames}")

    strips["idle"].crop((0, 0, FRAME_W, FRAME_H)).save(PREVIEW_DIR / "warrior-new-model.png")
    make_contact_sheet(strips).save(PREVIEW_DIR / "warrior-new-contact-sheet.png")
    write_preview_html()
    print(f"wrote {OUT_DIR}")
    print(f"wrote {PREVIEW_DIR}")
    print(f"wrote {PREVIEW_HTML}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
