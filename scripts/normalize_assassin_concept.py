#!/usr/bin/env python
"""Normalize the generated assassin concept sheet into runtime sprite strips.

The concept sheet is intentionally treated as source art, not as a runtime
atlas. Each action uses explicit row windows and frame centers, then every
frame is chroma-key cleaned and feet-anchored into the 320x208 modern profile.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "assets" / "sprites" / "assassin-new"
RAW_DIR = SPRITE_DIR / "raw"
PREVIEW_DIR = ROOT / "assets" / "sprites" / "assassin-new-preview"
SOURCE = PREVIEW_DIR / "assassin-concept-sheet.png"

FRAME_W = 320
FRAME_H = 208
TARGET_ANCHOR = (160, 178)


VIOLET = (176, 83, 255, 238)
VIOLET_DARK = (58, 20, 91, 170)
VIOLET_HI = (239, 206, 255, 250)


@dataclass(frozen=True)
class ActionSpec:
    name: str
    row: tuple[int, int]
    centers: tuple[int, ...]
    out_indices: tuple[int, ...]
    placement: str = "anchor"
    windows: tuple[tuple[int, int], ...] | None = None


SPECS = [
    ActionSpec("idle", (0, 188), (141, 345, 551, 771, 991), (0, 1, 2, 3, 4, 3)),
    ActionSpec("run", (184, 335), (132, 340, 537, 720, 897, 1068, 1238, 1410), (0, 1, 2, 3, 4, 5, 6)),
    ActionSpec("attack", (332, 490), (128, 291, 454, 625, 846, 1008, 1208, 1424), (0, 1, 2, 3, 4, 5, 6, 7)),
    ActionSpec(
        "attack-heavy",
        (486, 643),
        (129, 293, 479, 671, 861, 1066, 1266, 1426),
        (0, 1, 2, 3, 4, 5, 6, 7),
        windows=((36, 224), (216, 370), (372, 584), (574, 770), (760, 960), (940, 1198), (1166, 1368), (1336, 1518)),
    ),
    ActionSpec("cast", (640, 780), (118, 308, 531, 773, 1002, 1247), (0, 1, 2, 3, 4)),
    ActionSpec("hurt", (775, 890), (102, 253), (0, 1)),
    ActionSpec("death", (890, 1008), (105, 250, 400, 551, 722, 895, 1065, 1244, 1424), (0, 1, 2, 3, 4, 5, 6, 7, 8), "center-bottom"),
]

ATTACK_PLAN = [
    ("idle", 0, -1, 0, 0.0),
    ("attack-heavy", 0, -4, 0, 0.0),
    ("attack-heavy", 1, -2, 0, 0.15),
    ("attack-heavy", 2, 2, 0, 0.45),
    ("attack", 4, 6, 0, 0.95),
    ("attack", 6, 4, 0, 0.65),
    ("attack", 7, 1, 0, 0.28),
    ("idle", 1, 0, 0, 0.0),
]

HEAVY_ATTACK_PLAN = [
    ("idle", 2, -2, 0, 0.0),
    ("cast", 0, -5, 0, 0.2),
    ("cast", 1, -4, 0, 0.45),
    ("attack-heavy", 4, 1, 0, 0.75),
    ("attack-heavy", 5, -12, 0, 1.15),
    ("attack-heavy", 6, -10, 0, 0.95),
    ("attack-heavy", 7, 3, 0, 0.45),
    ("idle", 3, 0, 0, 0.0),
]


def is_bg(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    return g > 145 and r < 120 and b < 120 and g - r > 50 and g - b > 50


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

    # Clean the bright key fringe left by anti-aliased edges.
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if not a:
                continue
            if g > 120 and g - r > 42 and g - b > 42 and r < 145 and b < 145:
                pixels[x, y] = (max(0, r - 18), min(g, 76), max(0, b - 18), max(0, a - 80))
    return image


def intervals(centers: tuple[int, ...], width: int) -> list[tuple[int, int]]:
    result: list[tuple[int, int]] = []
    for index, center in enumerate(centers):
        left = 0 if index == 0 else (centers[index - 1] + center) // 2
        right = width if index == len(centers) - 1 else (center + centers[index + 1]) // 2
        result.append((left, right))
    return result


def source_intervals(spec: ActionSpec, width: int) -> list[tuple[int, int]]:
    return list(spec.windows or intervals(spec.centers, width))


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return (0, 0, image.width, image.height)
    pad = 8
    return (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(image.width, bbox[2] + pad),
        min(image.height, bbox[3] + pad),
    )


def detect_anchor(image: Image.Image) -> tuple[int, int]:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return (image.width // 2, image.height - 1)
    left, _top, right, bottom = bbox
    pixels = alpha.load()
    xs: list[int] = []
    for y in range(max(0, bottom - 16), bottom):
        for x in range(left, right):
            if pixels[x, y] > 18:
                xs.append(x)
    if not xs:
        return ((left + right) // 2, bottom - 1)
    xs.sort()
    return (xs[len(xs) // 2], bottom - 1)


def normalize_frame(atlas: Image.Image, spec: ActionSpec, interval: tuple[int, int]) -> Image.Image:
    x0, x1 = interval
    y0, y1 = spec.row
    source_cell = atlas.crop((x0, y0, x1, y1))
    transparent = remove_connected_chroma(source_cell)
    crop_box = alpha_bbox(transparent)
    cropped = transparent.crop(crop_box)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    if spec.placement == "center-bottom":
        bbox = cropped.getchannel("A").getbbox()
        if not bbox:
            return frame
        anchor_x = (bbox[0] + bbox[2]) // 2
        anchor_y = bbox[3] - 1
    else:
        anchor_x, anchor_y = detect_anchor(cropped)
    frame.alpha_composite(cropped, (TARGET_ANCHOR[0] - anchor_x, TARGET_ANCHOR[1] - anchor_y))
    return frame


def load_source_frames(atlas: Image.Image) -> dict[str, list[Image.Image]]:
    source_frames: dict[str, list[Image.Image]] = {}
    for spec in SPECS:
        source_frames[spec.name] = [
            normalize_frame(atlas, spec, interval)
            for interval in source_intervals(spec, atlas.width)
        ]
    return source_frames


def shifted_frame(frame: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    out.alpha_composite(frame, (dx, dy))
    return out


def slash_arc(draw: ImageDraw.ImageDraw, *, cx: int, cy: int, radius: int, start: int, end: int, width: int, alpha: float, flip: bool = False) -> None:
    box = (cx - radius, cy - radius, cx + radius, cy + radius)
    colors = [
        (*VIOLET_DARK[:3], round(VIOLET_DARK[3] * alpha)),
        (*VIOLET[:3], round(VIOLET[3] * alpha)),
        (*VIOLET_HI[:3], round(VIOLET_HI[3] * alpha)),
    ]
    offsets = (0, 5, 9)
    for color, offset in zip(colors, offsets):
        local_box = (box[0] + offset, box[1] + offset, box[2] - offset, box[3] - offset)
        local_start, local_end = (180 - end, 180 - start) if flip else (start, end)
        draw.arc(local_box, local_start, local_end, fill=color, width=max(1, width - offset // 2))


def shadow_particles(draw: ImageDraw.ImageDraw, *, frame_index: int, strength: float, heavy: bool) -> None:
    base_y = TARGET_ANCHOR[1] - (10 if heavy else 18)
    count = 10 if heavy else 6
    for i in range(count):
        x = TARGET_ANCHOR[0] + 28 + i * (8 if heavy else 6) + frame_index * 2
        y = base_y - ((i * 7 + frame_index * 5) % 28)
        a = round((100 + i * 8) * strength)
        color = (118, 49, 190, max(0, min(210, a)))
        draw.rectangle((x, y, x + 2, y + 2), fill=color)


def add_attack_fx(frame: Image.Image, frame_index: int, strength: float, *, heavy: bool) -> Image.Image:
    if strength <= 0:
        return frame
    out = frame.copy()
    draw = ImageDraw.Draw(out, "RGBA")
    if heavy:
        draw.line((TARGET_ANCHOR[0] + 16, TARGET_ANCHOR[1] - 40, TARGET_ANCHOR[0] + 94, TARGET_ANCHOR[1] - 72), fill=(*VIOLET_HI[:3], round(150 * strength)), width=2)
        draw.line((TARGET_ANCHOR[0] + 24, TARGET_ANCHOR[1] - 28, TARGET_ANCHOR[0] + 82, TARGET_ANCHOR[1] - 58), fill=(*VIOLET[:3], round(110 * strength)), width=1)
    else:
        slash_arc(draw, cx=TARGET_ANCHOR[0] + 42, cy=TARGET_ANCHOR[1] - 48, radius=60, start=210, end=322, width=9, alpha=strength)
        draw.line((TARGET_ANCHOR[0] + 5, TARGET_ANCHOR[1] - 42, TARGET_ANCHOR[0] + 73, TARGET_ANCHOR[1] - 71), fill=(*VIOLET_HI[:3], round(190 * strength)), width=2)
    shadow_particles(draw, frame_index=frame_index, strength=strength * (0.55 if heavy else 1), heavy=heavy)
    return out


def build_planned_strip(source_frames: dict[str, list[Image.Image]], plan: list[tuple[str, int, int, int, float]], *, heavy: bool) -> Image.Image:
    strip = Image.new("RGBA", (FRAME_W * len(plan), FRAME_H), (0, 0, 0, 0))
    for index, (source_name, source_index, dx, dy, fx_strength) in enumerate(plan):
        base = source_frames[source_name][source_index]
        frame = shifted_frame(base, dx, dy)
        frame = add_attack_fx(frame, index, fx_strength, heavy=heavy)
        strip.alpha_composite(frame, (index * FRAME_W, 0))
    return strip


def save_strip(atlas: Image.Image, spec: ActionSpec) -> None:
    frames = [normalize_frame(atlas, spec, interval) for interval in source_intervals(spec, atlas.width)]
    selected = [frames[index] for index in spec.out_indices]
    strip = Image.new("RGBA", (FRAME_W * len(selected), FRAME_H), (0, 0, 0, 0))
    for index, frame in enumerate(selected):
        strip.alpha_composite(frame, (index * FRAME_W, 0))
    out = SPRITE_DIR / f"{spec.name}.png"
    strip.save(out)
    print(f"{out.relative_to(ROOT)} {strip.width}x{strip.height} frames={len(selected)}")


def save_planned_attacks(source_frames: dict[str, list[Image.Image]]) -> None:
    attack = build_planned_strip(source_frames, ATTACK_PLAN, heavy=False)
    heavy = build_planned_strip(source_frames, HEAVY_ATTACK_PLAN, heavy=True)
    heavy.save(SPRITE_DIR / "attack.png")
    attack.save(SPRITE_DIR / "attack-heavy.png")
    print(f"{(SPRITE_DIR / 'attack.png').relative_to(ROOT)} {heavy.width}x{heavy.height} frames=8 redrawn from heavy plan")
    print(f"{(SPRITE_DIR / 'attack-heavy.png').relative_to(ROOT)} {attack.width}x{attack.height} frames=8 redrawn from attack plan")


def make_model_preview() -> None:
    idle = Image.open(SPRITE_DIR / "idle.png").convert("RGBA")
    first = idle.crop((0, 0, FRAME_W, FRAME_H))
    bbox = first.getchannel("A").getbbox()
    if bbox:
        first = first.crop(bbox)
    first.save(PREVIEW_DIR / "assassin-new-model.png")


def save_contact_sheet() -> None:
    rows = [(spec.name, len(spec.out_indices)) for spec in SPECS]
    thumb_w = 112
    thumb_h = 73
    label_w = 128
    width = label_w + thumb_w * 9
    height = thumb_h * len(rows)
    sheet = Image.new("RGBA", (width, height), (15, 12, 20, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 11)
    except OSError:
        font = ImageFont.load_default()
    for row, (name, frame_count) in enumerate(rows):
        draw.text((8, row * thumb_h + 8), f"{name} - {frame_count}", fill=(225, 232, 238, 255), font=font)
        strip = Image.open(SPRITE_DIR / f"{name}.png").convert("RGBA")
        for frame_index in range(frame_count):
            crop = strip.crop((frame_index * FRAME_W, 0, (frame_index + 1) * FRAME_W, FRAME_H))
            thumb = crop.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
            sheet.alpha_composite(thumb, (label_w + frame_index * thumb_w, row * thumb_h))
    sheet.save(PREVIEW_DIR / "assassin-contact.png")
    print(f"{(PREVIEW_DIR / 'assassin-contact.png').relative_to(ROOT)} saved")


def main() -> int:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    SPRITE_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    atlas = Image.open(SOURCE).convert("RGBA")
    atlas.save(RAW_DIR / "assassin-concept-sheet.png")
    source_frames = load_source_frames(atlas)
    for spec in SPECS:
        if spec.name in {"attack", "attack-heavy"}:
            continue
        save_strip(atlas, spec)
    save_planned_attacks(source_frames)
    make_model_preview()
    save_contact_sheet()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
