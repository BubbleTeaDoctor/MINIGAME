#!/usr/bin/env python
"""Extract the generated shaman concept sheet into runtime sprite strips.

The source sheet is a chroma-key concept image. This script removes the key,
extracts the visible frames by action row, and normalizes every action into the
same 320x208 frame size used by the current elf-warlock model.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image


FRAME_W = 320
FRAME_H = 208
TARGET_ANCHOR = (160, 177)
SOURCE = Path("assets/sprites/shaman-preview/shaman-sheet-preview.png")
OUT_DIR = Path("assets/sprites/shaman-new")
PREVIEW_DIR = Path("assets/sprites/shaman-preview")


@dataclass(frozen=True)
class ActionSpec:
    name: str
    row: tuple[int, int]
    centers: tuple[int, ...]
    out_frames: int
    source_indices: tuple[int, ...] | None = None
    windows: tuple[tuple[int, int], ...] | None = None
    placement: str = "anchor"


ATTACK_WINDOWS = (
    (45, 266),
    (278, 459),
    (468, 668),
    (688, 900),
    (914, 1104),
    (1118, 1308),
    (1320, 1502),
    (1510, 1720),
)

DEATH_WINDOWS = (
    (60, 220),
    (260, 440),
    (468, 622),
    (650, 832),
    (884, 1068),
    (1110, 1262),
    (1290, 1458),
    (1490, 1720),
)

SPECS = [
    ActionSpec("idle", (30, 159), (151, 372, 592, 816, 1038), 6, (0, 1, 2, 3, 4, 3)),
    ActionSpec("run", (189, 315), (148, 351, 554, 760, 977, 1181, 1384), 7),
    ActionSpec("attack", (343, 459), (), 8, windows=ATTACK_WINDOWS),
    ActionSpec("attack-heavy", (343, 459), (), 8, windows=ATTACK_WINDOWS),
    ActionSpec("cast", (495, 614), (145, 362, 554, 772, 981), 5),
    ActionSpec("hurt", (641, 741), (127, 310), 2),
    ActionSpec("death", (770, 861), (), 5, (0, 1, 2, 3, 4), windows=DEATH_WINDOWS, placement="center-bottom"),
]


def foreground_mask(img: Image.Image) -> np.ndarray:
    data = np.asarray(img.convert("RGBA"))
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    a = data[:, :, 3]
    magenta_score = ((r.astype(np.int16) + b.astype(np.int16)) // 2) - g.astype(np.int16)
    chroma = (r > 145) & (b > 145) & (g < 125) & (magenta_score > 80) & (np.abs(r.astype(np.int16) - b.astype(np.int16)) < 105)
    return (~chroma) & (a > 0)


def alpha_from_chroma(img: Image.Image) -> Image.Image:
    data = np.array(img.convert("RGBA"))
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    magenta_score = ((r.astype(np.int16) + b.astype(np.int16)) // 2) - g.astype(np.int16)
    chroma = (r > 145) & (b > 145) & (g < 125) & (magenta_score > 80) & (np.abs(r.astype(np.int16) - b.astype(np.int16)) < 105)
    data[chroma, 3] = 0
    return Image.fromarray(data, "RGBA")


def frame_intervals(centers: tuple[int, ...], width: int) -> list[tuple[int, int]]:
    intervals: list[tuple[int, int]] = []
    for index, center in enumerate(centers):
        left = 0 if index == 0 else (centers[index - 1] + center) // 2
        right = width if index == len(centers) - 1 else (center + centers[index + 1]) // 2
        intervals.append((left, right))
    return intervals


def bbox_for(mask: np.ndarray, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = box
    sub = mask[y0:y1, x0:x1]
    ys, xs = np.where(sub)
    if len(xs) == 0:
        return box
    pad = 8
    return (
        max(0, x0 + int(xs.min()) - pad),
        max(0, y0 + int(ys.min()) - pad),
        min(mask.shape[1], x0 + int(xs.max()) + 1 + pad),
        min(mask.shape[0], y0 + int(ys.max()) + 1 + pad),
    )


def detect_anchor(mask: np.ndarray, box: tuple[int, int, int, int]) -> tuple[int, int]:
    x0, y0, x1, y1 = box
    sub = mask[y0:y1, x0:x1]
    ys, xs = np.where(sub)
    if len(xs) == 0:
        return ((x0 + x1) // 2, y1 - 1)
    bottom = int(ys.max())
    band = (ys >= max(0, bottom - 8))
    band_xs = xs[band]
    if len(band_xs) == 0:
        return (x0 + int(np.median(xs)), y0 + bottom)
    # Median lower pixels keep the anchor on the feet, ignoring wide spell arcs.
    return (x0 + int(np.median(band_xs)), y0 + bottom)


def normalize_frame(source: Image.Image, mask: np.ndarray, interval: tuple[int, int], row: tuple[int, int]) -> Image.Image:
    x0, x1 = interval
    y0, y1 = row
    box = bbox_for(mask, (x0, y0, x1, y1))
    anchor = detect_anchor(mask, box)
    crop = source.crop(box)

    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    dx = TARGET_ANCHOR[0] - (anchor[0] - box[0])
    dy = TARGET_ANCHOR[1] - (anchor[1] - box[1])
    frame.alpha_composite(crop, (dx, dy))
    return frame


def normalize_frame_center_bottom(source: Image.Image, mask: np.ndarray, interval: tuple[int, int], row: tuple[int, int]) -> Image.Image:
    x0, x1 = interval
    y0, y1 = row
    box = bbox_for(mask, (x0, y0, x1, y1))
    crop = source.crop(box)
    alpha_bbox = crop.getchannel("A").getbbox()
    if not alpha_bbox:
        return Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))

    left, top, right, bottom = alpha_bbox
    content_center = (left + right) // 2
    content_bottom = bottom
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    dx = TARGET_ANCHOR[0] - content_center
    dy = TARGET_ANCHOR[1] - content_bottom
    frame.alpha_composite(crop, (dx, dy))
    return frame


def make_strip(source: Image.Image, mask: np.ndarray, spec: ActionSpec) -> Image.Image:
    intervals = list(spec.windows or frame_intervals(spec.centers, source.width))
    if spec.placement == "center-bottom":
        frames = [normalize_frame_center_bottom(source, mask, interval, spec.row) for interval in intervals]
    else:
        frames = [normalize_frame(source, mask, interval, spec.row) for interval in intervals]
    indices = spec.source_indices or tuple(range(len(frames)))
    selected = [frames[index] for index in indices]
    if len(selected) != spec.out_frames:
        raise ValueError(f"{spec.name}: expected {spec.out_frames} frames, got {len(selected)}")

    strip = Image.new("RGBA", (FRAME_W * spec.out_frames, FRAME_H), (0, 0, 0, 0))
    for index, frame in enumerate(selected):
        strip.alpha_composite(frame, (index * FRAME_W, 0))
    return strip


def save_contact_sheet() -> None:
    rows = [
        ("idle", 6),
        ("run", 7),
        ("attack", 8),
        ("attack-heavy", 8),
        ("cast", 5),
        ("hurt", 2),
        ("death", 5),
    ]
    thumb_w = 112
    thumb_h = 73
    sheet = Image.new("RGBA", (thumb_w * 9, thumb_h * len(rows)), (18, 16, 14, 255))
    for row, (name, frames) in enumerate(rows):
        strip = Image.open(OUT_DIR / f"{name}.png").convert("RGBA")
        for frame in range(frames):
            crop = strip.crop((frame * FRAME_W, 0, (frame + 1) * FRAME_W, FRAME_H))
            thumb = crop.resize((thumb_w, thumb_h), Image.Resampling.NEAREST)
            sheet.alpha_composite(thumb, (frame * thumb_w, row * thumb_h))
    sheet.save(PREVIEW_DIR / "shaman-contact.png")


def report_strip(path: Path, frames: int) -> None:
    img = Image.open(path).convert("RGBA")
    print(f"{path} {img.width}x{img.height} frames={frames} frame={img.width // frames}x{img.height}")


def main() -> int:
    raw = Image.open(SOURCE).convert("RGBA")
    source = alpha_from_chroma(raw)
    mask = np.asarray(source.getchannel("A")) > 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    for spec in SPECS:
        strip = make_strip(source, mask, spec)
        out = OUT_DIR / f"{spec.name}.png"
        strip.save(out)
        report_strip(out, spec.out_frames)

    save_contact_sheet()
    print(f"{PREVIEW_DIR / 'shaman-contact.png'} saved")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
