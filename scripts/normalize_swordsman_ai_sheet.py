#!/usr/bin/env python
"""Normalize the AI-generated swordsman sprite sheet into runtime strips."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "sprites" / "swordsman-preview" / "swordsman-ai-source.png"
ATTACK_SOURCE = ROOT / "assets" / "sprites" / "swordsman-preview" / "swordsman-ai-attack-row.png"
CAST_SOURCE = ROOT / "assets" / "sprites" / "swordsman-preview" / "swordsman-ai-cast-row.png"
OUT_DIR = ROOT / "assets" / "sprites" / "swordsman-new"
PREVIEW_DIR = ROOT / "assets" / "sprites" / "swordsman-preview"

FRAME_W = 320
FRAME_H = 208
BASELINE_Y = 178
TARGET_CENTER_X = 138
GREEN_TOLERANCE = 58


@dataclass(frozen=True)
class RowSpec:
    name: str
    frames: int
    max_height: int = 150
    boxes: tuple[tuple[int, int, int, int], ...] = ()
    source: str = "main"
    component_filters: tuple[str, ...] = ()


ROWS = [
    RowSpec("idle", 6, 150, (
        (59, 16, 179, 157),
        (216, 16, 342, 157),
        (377, 16, 501, 157),
        (549, 16, 663, 157),
        (698, 16, 811, 157),
        (549, 16, 663, 157),
    ), "main", ()),
    RowSpec("run", 7, 150, (
        (0, 165, 180, 300),
        (180, 165, 365, 300),
        (365, 165, 550, 300),
        (550, 165, 740, 300),
        (740, 165, 935, 300),
        (935, 165, 1105, 300),
        (1105, 165, 1275, 300),
    ), "main", ()),
    RowSpec("attack", 8, 150, (
        (41, 221, 240, 454),
        (306, 219, 490, 452),
        (561, 230, 768, 451),
        (832, 228, 1115, 449),
        (1146, 227, 1405, 448),
        (1411, 247, 1643, 442),
        (1692, 222, 1891, 456),
        (1943, 220, 2146, 456),
    ), "attack", ()),
    RowSpec("attack-heavy", 8, 155, (
        (0, 445, 225, 615),
        (216, 462, 340, 598),
        (350, 455, 520, 615),
        (520, 455, 715, 615),
        (715, 455, 900, 615),
        (900, 455, 1070, 615),
        (1070, 455, 1285, 615),
        (1285, 455, 1536, 615),
    ), "main", ("left-main", "largest")),
    RowSpec("cast", 5, 165, (
        (57, 241, 397, 611),
        (464, 129, 794, 611),
        (887, 108, 1269, 611),
        (1275, 84, 1693, 623),
        (1740, 260, 2122, 611),
    ), "cast", ()),
    RowSpec("hurt", 2, 120, (
        (0, 765, 145, 875),
        (145, 765, 290, 875),
    ), "main", ()),
    RowSpec("death", 9, 125, (
        (0, 888, 165, 1015),
        (165, 888, 330, 1015),
        (330, 888, 485, 1015),
        (485, 888, 645, 1015),
        (645, 888, 810, 1015),
        (810, 888, 1015, 1015),
        (1015, 888, 1185, 1015),
        (1185, 888, 1355, 1015),
        (1355, 888, 1536, 1015),
    ), "main", ()),
]


def is_key(r: int, g: int, b: int, a: int) -> bool:
    if a == 0:
        return True
    return (
        g > 110 and g - r > GREEN_TOLERANCE and g - b > GREEN_TOLERANCE
    ) or (
        g > 70 and r < 135 and b < 135 and g - r > 24 and g - b > 24
    )


def key_to_alpha(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if is_key(r, g, b, a):
                pixels[x, y] = (0, 0, 0, 0)
            elif g > r + 28 and g > b + 28:
                pixels[x, y] = (r, max(0, g - 45), b, a)
    return img


def alpha_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    bbox = img.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError("empty crop")
    return bbox


def connected_components(img: Image.Image) -> list[tuple[int, int, int, int, int, list[tuple[int, int]]]]:
    alpha = img.getchannel("A")
    width, height = img.size
    seen = bytearray(width * height)
    components = []
    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if seen[idx] or alpha.getpixel((x, y)) <= 8:
                continue
            stack = [(x, y)]
            seen[idx] = 1
            pixels = []
            minx = maxx = x
            miny = maxy = y
            while stack:
                cx, cy = stack.pop()
                pixels.append((cx, cy))
                minx = min(minx, cx)
                maxx = max(maxx, cx)
                miny = min(miny, cy)
                maxy = max(maxy, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        nidx = ny * width + nx
                        if not seen[nidx] and alpha.getpixel((nx, ny)) > 8:
                            seen[nidx] = 1
                            stack.append((nx, ny))
            if len(pixels) > 12:
                components.append((minx, miny, maxx + 1, maxy + 1, len(pixels), pixels))
    return components


def filter_components(img: Image.Image, mode: str) -> Image.Image:
    comps = connected_components(img)
    if not comps:
        return img
    if mode == "largest":
        keep = {id(max(comps, key=lambda c: c[4]))}
    elif mode == "left-main":
        large = [c for c in comps if c[4] > 400]
        keep_comp = min(large or comps, key=lambda c: (c[0] + c[2]) / 2)
        keep = {id(keep_comp)}
    else:
        return img

    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    src = img.load()
    dst = out.load()
    for comp in comps:
        if id(comp) not in keep:
            continue
        for x, y in comp[5]:
            dst[x, y] = src[x, y]
    return out


def crop_box(sheet: Image.Image, box: tuple[int, int, int, int], component_filter: str = "") -> Image.Image:
    left, top, right, bottom = box
    pad = 0
    crop = sheet.crop((
        max(0, left - pad),
        max(0, top - pad),
        min(sheet.width, right + pad),
        min(sheet.height, bottom + pad),
    ))
    if component_filter:
        crop = filter_components(crop, component_filter)
    bbox = alpha_bbox(crop)
    return crop.crop(bbox)


def place_runtime(crop: Image.Image, max_height: int) -> Image.Image:
    bbox = alpha_bbox(crop)
    crop = crop.crop(bbox)
    scale = min(1.0, (FRAME_W - 42) / crop.width, max_height / crop.height)
    new_size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    resized = crop.resize(new_size, Image.Resampling.LANCZOS)
    bbox = alpha_bbox(resized)
    left, top, right, bottom = bbox
    center_x = (left + right) / 2
    x = round(TARGET_CENTER_X - center_x)
    y = round(BASELINE_Y - bottom)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    frame.alpha_composite(resized, (x, y))
    return frame


def build_strip(sheet: Image.Image, spec: RowSpec) -> Image.Image:
    if len(spec.boxes) != spec.frames:
        raise RuntimeError(f"{spec.name}: expected {spec.frames} boxes, got {len(spec.boxes)}")
    filters = spec.component_filters + ("",) * spec.frames
    frames = [
        place_runtime(crop_box(sheet, box, filters[index]), spec.max_height)
        for index, box in enumerate(spec.boxes)
    ]
    strip = Image.new("RGBA", (FRAME_W * spec.frames, FRAME_H), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * FRAME_W, 0))
    return strip


def make_contact_sheet(strips: dict[str, Image.Image]) -> Image.Image:
    label_h = 24
    width = FRAME_W * 8
    height = (FRAME_H + label_h) * len(strips)
    contact = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(contact)
    for row, (name, strip) in enumerate(strips.items()):
        y = row * (FRAME_H + label_h)
        d.rectangle((0, y, width, y + label_h - 1), fill=(12, 14, 22, 255))
        d.text((8, y + 5), name, fill=(230, 235, 248, 255))
        contact.alpha_composite(strip.crop((0, 0, min(width, strip.width), FRAME_H)), (0, y + label_h))
    return contact


def validate(strip: Image.Image, spec: RowSpec) -> None:
    expected = (FRAME_W * spec.frames, FRAME_H)
    if strip.size != expected:
        raise RuntimeError(f"{spec.name}: expected {expected}, got {strip.size}")
    for index in range(spec.frames):
        frame = strip.crop((index * FRAME_W, 0, (index + 1) * FRAME_W, FRAME_H))
        if not frame.getchannel("A").getbbox():
            raise RuntimeError(f"{spec.name}: empty frame {index + 1}")


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")
    attack_source = Image.open(ATTACK_SOURCE).convert("RGBA")
    cast_source = Image.open(CAST_SOURCE).convert("RGBA")
    keyed_sources = {
        "main": key_to_alpha(source),
        "attack": key_to_alpha(attack_source),
        "cast": key_to_alpha(cast_source),
    }
    keyed_sources["main"].save(PREVIEW_DIR / "swordsman-ai-source-alpha.png")
    keyed_sources["attack"].save(PREVIEW_DIR / "swordsman-ai-attack-row-alpha.png")
    keyed_sources["cast"].save(PREVIEW_DIR / "swordsman-ai-cast-row-alpha.png")

    strips: dict[str, Image.Image] = {}
    for spec in ROWS:
        strip = build_strip(keyed_sources[spec.source], spec)
        validate(strip, spec)
        strip.save(OUT_DIR / f"{spec.name}.png")
        strips[spec.name] = strip
        print(f"{spec.name}: {strip.width}x{strip.height}")

    make_contact_sheet(strips).save(PREVIEW_DIR / "swordsman-sheet-preview.png")
    print(f"source={SOURCE}")
    print(f"wrote={OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
