#!/usr/bin/env python
"""Normalize the AI-generated bone dragon summon atlas.

The source is an AI concept atlas with two rows. This script removes the
connected magenta background, crops explicit frame windows, and writes only
idle/attack strips in the existing 128x128 summon runtime format.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "map" / "summons" / "bone-dragon-new"
RAW_DIR = OUT_DIR / "raw"
PREVIEW_DIR = ROOT / "assets" / "sprites" / "bone-dragon-summon-preview"
SRC = RAW_DIR / "bone-dragon-ai-atlas-v2.png"

FRAME_W = 128
FRAME_H = 128
TARGET_ANCHOR = (64, 116)
MAX_CONTENT_W = 118
MAX_CONTENT_H = 114

WINDOWS = {
    "idle": [
        (35, 90, 280, 385),
        (315, 95, 590, 380),
        (625, 95, 880, 385),
        (920, 100, 1175, 380),
        (1205, 105, 1450, 385),
        (1500, 125, 1765, 385),
    ],
    "attack": [
        (0, 510, 250, 775),
        (240, 500, 500, 755),
        (475, 530, 700, 770),
        (675, 520, 920, 780),
        (910, 500, 1160, 770),
        (1135, 515, 1395, 775),
        (1370, 530, 1600, 765),
        (1570, 520, 1814, 775),
    ],
}


def is_bg(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    return r > 125 and b > 125 and g < 130 and r - g > 28 and b - g > 28


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

    # Remove antialias magenta halos that remain after the connected fill.
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if not a:
                continue
            if r > 125 and b > 115 and g < 130 and r - g > 28 and b - g > 28:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    return image.getchannel("A").getbbox() or (0, 0, image.width, image.height)


def remove_border_fragments(image: Image.Image, *, max_pixels: int = 900) -> Image.Image:
    result = image.copy()
    alpha = result.getchannel("A")
    apix = alpha.load()
    rgba = result.load()
    width, height = result.size
    seen = bytearray(width * height)
    erase: list[tuple[int, int]] = []
    for yy in range(height):
        for xx in range(width):
            idx = yy * width + xx
            if seen[idx] or apix[xx, yy] <= 18:
                continue
            queue = [(xx, yy)]
            seen[idx] = 1
            component: list[tuple[int, int]] = []
            touches_border = False
            while queue:
                x, y = queue.pop()
                component.append((x, y))
                if x <= 1 or y <= 1 or x >= width - 2 or y >= height - 2:
                    touches_border = True
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        nidx = ny * width + nx
                        if not seen[nidx] and apix[nx, ny] > 18:
                            seen[nidx] = 1
                            queue.append((nx, ny))
            if touches_border and len(component) <= max_pixels:
                erase.extend(component)
    for x, y in erase:
        rgba[x, y] = (0, 0, 0, 0)
    return result


def normalize_cell(cell: Image.Image) -> Image.Image:
    transparent = remove_connected_chroma(cell)
    transparent = remove_border_fragments(transparent)
    bbox = alpha_bbox(transparent)
    cropped = transparent.crop(bbox)
    scale = min(MAX_CONTENT_W / cropped.width, MAX_CONTENT_H / cropped.height, 1)
    scaled = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.NEAREST,
    )
    scaled_bbox = alpha_bbox(scaled)
    left, _top, right, bottom = scaled_bbox
    anchor_x = (left + right) // 2
    anchor_y = bottom - 1
    out = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    out.alpha_composite(scaled, (TARGET_ANCHOR[0] - anchor_x, TARGET_ANCHOR[1] - anchor_y))
    return out


def build_strip(atlas: Image.Image, action: str) -> Image.Image:
    windows = WINDOWS[action]
    strip = Image.new("RGBA", (FRAME_W * len(windows), FRAME_H), (0, 0, 0, 0))
    raw_w = max(x1 - x0 for x0, _y0, x1, _y1 in windows)
    raw_h = max(y1 - y0 for _x0, y0, _x1, y1 in windows)
    raw_strip = Image.new("RGBA", (raw_w * len(windows), raw_h), (0, 0, 0, 0))
    for idx, window in enumerate(windows):
        cell = atlas.crop(window)
        raw_strip.alpha_composite(cell.convert("RGBA"), (idx * raw_w, 0))
        frame = normalize_cell(cell)
        strip.alpha_composite(frame, (idx * FRAME_W, 0))
    raw_strip.save(RAW_DIR / f"{action}-raw-row.png")
    return strip


def build_contact_sheet(actions: dict[str, tuple[int, Image.Image]]) -> Image.Image:
    zoom = 2
    label_h = 18
    rows = []
    for name, (frames, strip) in actions.items():
        row = Image.new("RGBA", (FRAME_W * zoom * 8, FRAME_H * zoom + label_h), (14, 16, 18, 255))
        draw = ImageDraw.Draw(row)
        draw.text((8, 3), f"{name} - {frames} frames / {FRAME_W}x{FRAME_H}", fill=(230, 238, 230, 255))
        for idx in range(frames):
            frame = strip.crop((idx * FRAME_W, 0, (idx + 1) * FRAME_W, FRAME_H))
            frame = frame.resize((FRAME_W * zoom, FRAME_H * zoom), Image.Resampling.NEAREST)
            row.alpha_composite(frame, (idx * FRAME_W * zoom, label_h))
        rows.append(row)
    out = Image.new("RGBA", (FRAME_W * zoom * 8, sum(row.height for row in rows)), (14, 16, 18, 255))
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
        for idx in range(frames):
            frame = strip.crop((idx * FRAME_W, 0, (idx + 1) * FRAME_W, FRAME_H))
            if frame.getchannel("A").getbbox() is None:
                raise RuntimeError(f"{name}: empty frame {idx}")


def report(name: str, strip: Image.Image, frames: int) -> None:
    print(f"{name}: {strip.width}x{strip.height} frames={frames} frame={strip.width // frames}x{strip.height}")
    for idx in range(frames):
        frame = strip.crop((idx * FRAME_W, 0, (idx + 1) * FRAME_W, FRAME_H))
        print(f"  {idx}: bbox={frame.getchannel('A').getbbox()}")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    atlas = Image.open(SRC).convert("RGBA")
    actions: dict[str, tuple[int, Image.Image]] = {}
    for action in ("idle", "attack"):
        strip = build_strip(atlas, action)
        strip.save(OUT_DIR / f"{action}.png")
        actions[action] = (len(WINDOWS[action]), strip)
        report(action, strip, len(WINDOWS[action]))
    build_contact_sheet(actions).save(PREVIEW_DIR / "bone-dragon-contact-sheet.png")
    actions["idle"][1].crop((0, 0, FRAME_W, FRAME_H)).save(PREVIEW_DIR / "bone-dragon-model.png")
    validate(actions)
    print(f"wrote {OUT_DIR}")
    print(f"wrote {PREVIEW_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
