#!/usr/bin/env python
"""Normalize the AI-generated necromancer atlas into runtime strips.

The source is a non-standard image-generation atlas. This script only removes
the chroma background, crops explicit source windows, and anchors frames into
the modern 320x208 runtime profile. It does not procedurally redraw the model.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "assets" / "sprites" / "necro-new-preview" / "raw"
PREVIEW_DIR = ROOT / "assets" / "sprites" / "necro-new-preview"
OUT_DIR = ROOT / "assets" / "sprites" / "necro-new"
SRC = RAW_DIR / "necro-ai-atlas.png"

FRAME_W = 320
FRAME_H = 208
TARGET_ANCHOR = (160, 178)
SCALE = 1.03

WINDOWS = {
    "idle": [
        (34, 20, 170, 172),
        (190, 20, 322, 172),
        (346, 20, 480, 172),
        (506, 20, 642, 172),
        (664, 20, 804, 172),
        (506, 20, 642, 172),
    ],
    "run": [
        (31, 181, 171, 333),
        (185, 188, 351, 332),
        (360, 189, 525, 332),
        (539, 189, 694, 332),
        (713, 197, 877, 333),
        (897, 191, 1030, 332),
        (1075, 191, 1211, 332),
    ],
    "attack": [
        (20, 341, 186, 477),
        (191, 335, 369, 477),
        (380, 338, 562, 477),
        (578, 338, 777, 477),
        (784, 340, 966, 477),
        (963, 341, 1155, 477),
        (1144, 341, 1288, 477),
        (1144, 341, 1288, 477),
    ],
    "attack-heavy": [
        (20, 482, 184, 636),
        (205, 475, 361, 636),
        (399, 479, 559, 636),
        (590, 475, 769, 638),
        (781, 487, 1040, 638),
        (1052, 487, 1262, 638),
        (1278, 482, 1479, 636),
        (1278, 482, 1479, 636),
    ],
    "cast": [
        (35, 640, 186, 785),
        (246, 640, 428, 789),
        (462, 640, 656, 792),
        (670, 640, 854, 790),
        (670, 640, 854, 790),
    ],
    "hurt": [
        (41, 779, 175, 892),
        (197, 779, 332, 892),
    ],
    "death": [
        (36, 890, 194, 998),
        (205, 902, 361, 998),
        (359, 929, 547, 998),
        (550, 928, 742, 998),
        (738, 916, 910, 998),
        (925, 934, 1095, 998),
        (1135, 931, 1270, 998),
        (1325, 949, 1451, 998),
        (1325, 949, 1451, 998),
    ],
}


def is_bg(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    magenta = (r > 155 and b > 145 and g < 105 and r - g > 60 and b - g > 55)
    edge_magenta = (r > 120 and b > 120 and g < 115 and r - g > 32 and b - g > 32)
    return magenta or edge_magenta


def remove_connected_chroma(cell: Image.Image) -> Image.Image:
    image = cell.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        idx = y * width + x
        if seen[idx] or not is_bg(pixels[x, y]):
            return
        seen[idx] = 1
        queue.append((x, y))

    for x in range(width):
        push(x, 0)
        push(x, height - 1)
    for y in range(height):
        push(0, y)
        push(width - 1, y)

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if not a:
                continue
            if r > 135 and b > 135 and g < 120 and r - g > 35 and b - g > 35:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    return image.getchannel("A").getbbox() or (0, 0, image.width, image.height)


def component_bboxes(image: Image.Image) -> list[tuple[int, tuple[int, int, int, int]]]:
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    seen = bytearray(width * height)
    components: list[tuple[int, tuple[int, int, int, int]]] = []
    for yy in range(height):
        for xx in range(width):
            idx = yy * width + xx
            if seen[idx] or pixels[xx, yy] <= 18:
                continue
            queue = [(xx, yy)]
            seen[idx] = 1
            count = 0
            min_x = max_x = xx
            min_y = max_y = yy
            while queue:
                x, y = queue.pop()
                count += 1
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        nidx = ny * width + nx
                        if not seen[nidx] and pixels[nx, ny] > 18:
                            seen[nidx] = 1
                            queue.append((nx, ny))
            components.append((count, (min_x, min_y, max_x + 1, max_y + 1)))
    components.sort(reverse=True)
    return components


def largest_component_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    comps = component_bboxes(image)
    return comps[0][1] if comps else alpha_bbox(image)


def detect_anchor(image: Image.Image, row_name: str) -> tuple[int, int]:
    left, _top, right, bottom = largest_component_bbox(image)
    if row_name == "death":
        return ((left + right) // 2, bottom - 1)
    alpha = image.getchannel("A").load()
    xs: list[int] = []
    for y in range(max(0, bottom - 14), bottom):
        for x in range(left, right):
            if alpha[x, y] > 18:
                xs.append(x)
    if not xs:
        return ((left + right) // 2, bottom - 1)
    xs.sort()
    return (xs[len(xs) // 2], bottom - 1)


def normalize_cell(cell: Image.Image, row_name: str) -> Image.Image:
    transparent = remove_connected_chroma(cell)
    bbox = alpha_bbox(transparent)
    cropped = transparent.crop(bbox)
    scale = SCALE
    if row_name in {"attack-heavy", "death"}:
        scale = 0.95
    elif row_name == "cast":
        scale = 0.98
    scaled = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.NEAREST,
    )
    anchor_x, anchor_y = detect_anchor(scaled, row_name)
    out = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    dx = TARGET_ANCHOR[0] - anchor_x
    dy = TARGET_ANCHOR[1] - anchor_y
    out.alpha_composite(scaled, (round(dx), round(dy)))
    return out


def build_strip(atlas: Image.Image, row_name: str) -> Image.Image:
    windows = WINDOWS[row_name]
    strip = Image.new("RGBA", (FRAME_W * len(windows), FRAME_H), (0, 0, 0, 0))
    raw_w = max(x1 - x0 for x0, _y0, x1, _y1 in windows)
    raw_h = max(y1 - y0 for _x0, y0, _x1, y1 in windows)
    raw_strip = Image.new("RGBA", (raw_w * len(windows), raw_h), (0, 0, 0, 0))
    for idx, window in enumerate(windows):
        cell = atlas.crop(window)
        raw_strip.alpha_composite(cell.convert("RGBA"), (idx * raw_w, 0))
        frame = normalize_cell(cell, row_name)
        strip.alpha_composite(frame, (idx * FRAME_W, 0))
    raw_strip.save(RAW_DIR / f"{row_name}-raw-row.png")
    return strip


def build_contact_sheet(actions: dict[str, tuple[int, Image.Image]]) -> Image.Image:
    thumb_w, thumb_h = 160, 104
    label_h = 16
    rows = []
    for name, (frames, strip) in actions.items():
        row = Image.new("RGBA", (thumb_w * 9, thumb_h + label_h), (14, 17, 18, 255))
        draw = ImageDraw.Draw(row)
        draw.text((8, 3), f"{name} - {frames} frames / {FRAME_W}x{FRAME_H}", fill=(226, 235, 226, 255))
        for frame_idx in range(frames):
            frame = strip.crop((frame_idx * FRAME_W, 0, (frame_idx + 1) * FRAME_W, FRAME_H))
            thumb = frame.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
            row.alpha_composite(thumb, (frame_idx * thumb_w, label_h))
        rows.append(row)
    out = Image.new("RGBA", (thumb_w * 9, sum(row.height for row in rows)), (14, 17, 18, 255))
    y = 0
    for row in rows:
        out.alpha_composite(row, (0, y))
        y += row.height
    return out


def validate(actions: dict[str, tuple[int, Image.Image]]) -> None:
    for name, (frames, strip) in actions.items():
        expected = (FRAME_W * frames, FRAME_H)
        if strip.size != expected:
            raise RuntimeError(f"{name}: expected {expected}, got {strip.size}")
        for frame_idx in range(frames):
            frame = strip.crop((frame_idx * FRAME_W, 0, (frame_idx + 1) * FRAME_W, FRAME_H))
            if frame.getchannel("A").getbbox() is None:
                raise RuntimeError(f"{name}: empty frame {frame_idx}")


def report(name: str, strip: Image.Image, frames: int) -> None:
    print(f"{name}: {strip.width}x{strip.height} frames={frames} frame={strip.width // frames}x{strip.height}")
    for idx in range(frames):
        frame = strip.crop((idx * FRAME_W, 0, (idx + 1) * FRAME_W, FRAME_H))
        print(f"  {idx}: bbox={frame.getchannel('A').getbbox()}")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    atlas = Image.open(SRC).convert("RGBA")
    actions: dict[str, tuple[int, Image.Image]] = {}
    for name in ("idle", "run", "attack", "attack-heavy", "cast", "hurt", "death"):
        strip = build_strip(atlas, name)
        strip.save(OUT_DIR / f"{name}.png")
        actions[name] = (len(WINDOWS[name]), strip)
        report(name, strip, len(WINDOWS[name]))
    actions["idle"][1].crop((0, 0, FRAME_W, FRAME_H)).save(PREVIEW_DIR / "necro-new-model.png")
    build_contact_sheet(actions).save(PREVIEW_DIR / "necro-new-contact-sheet.png")
    validate(actions)
    print(f"wrote {OUT_DIR}")
    print(f"wrote {PREVIEW_DIR / 'necro-new-contact-sheet.png'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
