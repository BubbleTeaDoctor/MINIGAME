#!/usr/bin/env python
"""Normalize the generated elf hunter raw atlas into fixed runtime strips.

The raw atlas is generated as an 8-column non-runtime concept sheet. This
script keeps explicit row windows, removes only connected chroma background
inside each source cell, and anchors every frame to the feet baseline before
writing the 320x208 runtime strips.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "assets" / "sprites" / "elf-hunter"
RAW_DIR = SPRITE_DIR / "raw"
SRC = RAW_DIR / "hunter-sprite-atlas-v2.png"

FRAME_W = 320
FRAME_H = 208
TARGET_ANCHOR = (160, 178)
SCALE = 1.06

WINDOWS = {
    "idle": [
        (64, 18, 240, 190),
        (248, 18, 420, 190),
        (430, 18, 594, 190),
        (603, 18, 772, 190),
        (778, 18, 944, 190),
        (934, 18, 1094, 190),
    ],
    "run": [
        (50, 220, 242, 360),
        (232, 218, 438, 360),
        (432, 216, 624, 360),
        (620, 216, 806, 360),
        (800, 220, 986, 360),
        (988, 220, 1164, 360),
        (1160, 222, 1344, 360),
    ],
    "attack": [
        (58, 368, 232, 540),
        (228, 368, 430, 540),
        (420, 360, 632, 540),
        (616, 360, 826, 540),
        (812, 368, 986, 540),
        (976, 384, 1176, 540),
        (1172, 386, 1472, 540),
        (1172, 386, 1472, 540),
    ],
    "cast": [
        (52, 548, 220, 710),
        (240, 548, 430, 710),
        (436, 548, 624, 710),
        (626, 548, 822, 710),
        (626, 548, 822, 710),
    ],
    "hurt": [
        (54, 718, 190, 852),
        (228, 720, 370, 852),
    ],
    "death": [
        (30, 872, 214, 1008),
        (190, 890, 396, 1008),
        (370, 898, 570, 1008),
        (560, 908, 780, 1008),
        (760, 920, 972, 1008),
        (940, 930, 1160, 1008),
        (1132, 938, 1314, 1008),
        (1308, 944, 1488, 1008),
        (1308, 944, 1488, 1008),
    ],
}


def is_bg(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    return r > 165 and b > 150 and g < 125 and r - g > 70 and b - g > 55


def remove_connected_chroma(cell: Image.Image) -> Image.Image:
    image = cell.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if seen[index] or not is_bg(pixels[x, y]):
            return
        seen[index] = 1
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

    # Despill any antialiased edge pixels that survived the flood fill.
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if not a:
                continue
            if r > 130 and b > 130 and g < 110 and r - g > 45 and b - g > 45:
                pixels[x, y] = (0, 0, 0, 0)
            elif r > 95 and b > 95 and g < 115 and r - g > 22 and b - g > 22:
                pixels[x, y] = (min(r, 78), min(g, 56), min(b, 86), max(0, a - 70))
    return image


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return (0, 0, image.width, image.height)
    return bbox


def largest_component_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    seen = bytearray(width * height)
    best_count = 0
    best_bbox = alpha_bbox(image)
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
            if count > best_count:
                best_count = count
                best_bbox = (min_x, min_y, max_x + 1, max_y + 1)
    return best_bbox


def remove_small_components(image: Image.Image, *, min_pixels: int) -> Image.Image:
    result = image.copy()
    alpha = result.getchannel("A")
    pixels = alpha.load()
    width, height = result.size
    seen = bytearray(width * height)
    erase: list[tuple[int, int]] = []
    for yy in range(height):
        for xx in range(width):
            idx = yy * width + xx
            if seen[idx] or pixels[xx, yy] <= 18:
                continue
            queue = [(xx, yy)]
            component: list[tuple[int, int]] = []
            seen[idx] = 1
            while queue:
                x, y = queue.pop()
                component.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        nidx = ny * width + nx
                        if not seen[nidx] and pixels[nx, ny] > 18:
                            seen[nidx] = 1
                            queue.append((nx, ny))
            if len(component) < min_pixels:
                erase.extend(component)
    rgba = result.load()
    for x, y in erase:
        rgba[x, y] = (0, 0, 0, 0)
    return result


def detect_anchor(frame: Image.Image, *, row_name: str) -> tuple[int, int]:
    bbox = largest_component_bbox(frame)
    left, _top, right, bottom = bbox
    if row_name == "run":
        return ((left + right - 1) // 2, bottom - 1)
    alpha = frame.getchannel("A").load()
    xs: list[int] = []
    for y in range(max(0, bottom - 14), bottom):
        for x in range(left, right):
            if alpha[x, y] > 18:
                xs.append(x)
    if not xs:
        return ((left + right) // 2, bottom - 1)
    xs.sort()
    return (xs[len(xs) // 2], bottom - 1)


def normalize_frame(cell: Image.Image, *, row_name: str) -> Image.Image:
    transparent = remove_connected_chroma(cell)
    if row_name == "run":
        transparent = remove_small_components(transparent, min_pixels=220)
    bbox = alpha_bbox(transparent)
    cropped = transparent.crop(bbox)

    # Death frames include horizontal bodies and particles; keep them a little
    # smaller so the fall stays inside the same warlock-sized runtime frame.
    local_scale = SCALE
    if row_name == "death":
        local_scale = 0.98
    elif row_name == "run":
        local_scale = 1.0
    scaled = cropped.resize(
        (max(1, round(cropped.width * local_scale)), max(1, round(cropped.height * local_scale))),
        Image.Resampling.NEAREST,
    )
    anchor_x, anchor_y = detect_anchor(scaled, row_name=row_name)
    out = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    dx = TARGET_ANCHOR[0] - anchor_x
    dy = TARGET_ANCHOR[1] - anchor_y
    out.alpha_composite(scaled, (round(dx), round(dy)))
    return out


def build_strip(atlas: Image.Image, row_name: str) -> Image.Image:
    windows = WINDOWS[row_name]
    output = Image.new("RGBA", (FRAME_W * len(windows), FRAME_H), (0, 0, 0, 0))
    raw_w = max(x1 - x0 for x0, _y0, x1, _y1 in windows)
    raw_h = max(y1 - y0 for _x0, y0, _x1, y1 in windows)
    raw_strip = Image.new("RGBA", (raw_w * len(windows), raw_h), (0, 0, 0, 0))
    for out_index, window in enumerate(windows):
        cell = atlas.crop(window)
        raw_strip.alpha_composite(cell.convert("RGBA"), (out_index * raw_w, 0))
        frame = normalize_frame(cell, row_name=row_name)
        output.alpha_composite(frame, (out_index * FRAME_W, 0))
    raw_strip.save(RAW_DIR / f"{row_name}-raw-row.png")
    return output


def build_projectile() -> Image.Image:
    frames = 8
    size = 64
    sheet = Image.new("RGBA", (size * frames, size), (0, 0, 0, 0))
    for i in range(frames):
        frame = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        pix = frame.load()
        y = 34 - (i % 2)
        tip_x = 59
        tip_y = 26 - (i % 2)
        tail_x = 15
        tail_y = y
        for x in range(tail_x, tip_x - 3):
            t = (x - tail_x) / (tip_x - tail_x)
            yy = round(tail_y + (tip_y - tail_y) * t)
            for oy in (0, 1):
                pix[x, yy + oy] = (234, 196, 82, 255)
            if x % 5 == 0:
                pix[x, yy - 1] = (255, 235, 137, 220)
            if x < 42 and x % 2 == 0:
                trail_y = yy + 5 + ((x + i) % 3)
                pix[x - 9, trail_y] = (116, 230, 88, 140)
                pix[x - 13, trail_y + 1] = (75, 176, 68, 85)
        # Arrow head stays inside the 64x64 frame to avoid browser-edge clipping.
        head = [(tip_x, tip_y), (tip_x - 9, tip_y - 5), (tip_x - 6, tip_y), (tip_x - 11, tip_y + 6)]
        for x, y2 in head:
            if 0 <= x < size and 0 <= y2 < size:
                pix[x, y2] = (255, 239, 154, 255)
        for x in range(tip_x - 10, tip_x + 1):
            upper = round(tip_y - (tip_x - x) * 0.55)
            lower = round(tip_y + (tip_x - x) * 0.6)
            if 0 <= x < size:
                if 0 <= upper < size:
                    pix[x, upper] = (255, 239, 154, 255)
                if 0 <= lower < size:
                    pix[x, lower] = (255, 214, 91, 245)
        # Feather fletching.
        for x, y2 in [(tail_x, tail_y), (tail_x - 5, tail_y - 4), (tail_x - 5, tail_y + 5), (tail_x + 4, tail_y + 1)]:
            if 0 <= x < size and 0 <= y2 < size:
                pix[x, y2] = (233, 238, 203, 220)
        sheet.alpha_composite(frame, (i * size, 0))
    return sheet


def report(name: str, image: Image.Image, frames: int) -> None:
    print(f"{name}: sheet={image.width}x{image.height} frame={image.width // frames}x{image.height}")
    for i in range(frames):
        frame = image.crop((i * (image.width // frames), 0, (i + 1) * (image.width // frames), image.height))
        bbox = frame.getchannel("A").getbbox()
        print(f"  frame {i}: bbox={bbox}")


def main() -> int:
    atlas = Image.open(SRC).convert("RGBA")
    if atlas.size != (1536, 1024):
        raise RuntimeError(f"unexpected atlas size {atlas.size}; expected 1536x1024")
    for row_name, windows in WINDOWS.items():
        strip = build_strip(atlas, row_name)
        strip.save(SPRITE_DIR / f"{row_name}.png")
        report(row_name, strip, len(windows))
    projectile = build_projectile()
    projectile.save(SPRITE_DIR / "projectile.png")
    report("projectile", projectile, 8)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
