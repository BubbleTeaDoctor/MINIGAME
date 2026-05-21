#!/usr/bin/env python
"""Generate the preview-only mage-new pixel sprite set.

The output uses the larger modern sprite profile size shared by the priest /
warlock imports: fixed 320x208 runtime frames, true transparency, and a stable
feet baseline. The art is drawn procedurally so the set can be regenerated and
tuned without touching game runtime code.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "assets" / "sprites" / "mage-new"
PREVIEW_DIR = ROOT / "assets" / "sprites" / "mage-new-preview"
PREVIEW_HTML = ROOT / "preview-mage-new.html"
SOURCE_DIR = ROOT / "assets" / "sprites" / "elf-warlock"

LOW_W = 160
LOW_H = 104
SCALE = 2
FRAME_W = LOW_W * SCALE
FRAME_H = LOW_H * SCALE
BASELINE = 94
ANCHOR_X = 80

COLORS = {
    "outline": (8, 10, 22, 255),
    "deep": (13, 18, 42, 255),
    "robe": (20, 31, 68, 255),
    "robe2": (14, 19, 44, 255),
    "blue": (28, 78, 164, 255),
    "blue_hi": (42, 166, 232, 255),
    "ice": (128, 224, 255, 255),
    "ice_dim": (55, 120, 210, 220),
    "gold": (204, 157, 78, 255),
    "gold_hi": (247, 214, 132, 255),
    "skin": (232, 186, 172, 255),
    "skin_shadow": (165, 102, 117, 255),
    "hair": (221, 238, 255, 255),
    "hair_shadow": (98, 160, 226, 255),
    "hair_dark": (54, 92, 155, 255),
    "fire": (255, 91, 33, 255),
    "fire_hi": (255, 222, 98, 255),
    "violet": (153, 95, 255, 255),
    "hurt": (255, 85, 108, 255),
}


def new_frame() -> Image.Image:
    return Image.new("RGBA", (LOW_W, LOW_H), (0, 0, 0, 0))


def upscale(img: Image.Image) -> Image.Image:
    return img.resize((img.width * SCALE, img.height * SCALE), Image.Resampling.NEAREST)


def rect(draw: ImageDraw.ImageDraw, xy, color: str | tuple[int, int, int, int]) -> None:
    draw.rectangle(xy, fill=COLORS[color] if isinstance(color, str) else color)


def line(draw: ImageDraw.ImageDraw, xy, color: str | tuple[int, int, int, int], width: int = 1) -> None:
    draw.line(xy, fill=COLORS[color] if isinstance(color, str) else color, width=width)


def poly(draw: ImageDraw.ImageDraw, points, color: str | tuple[int, int, int, int]) -> None:
    draw.polygon(points, fill=COLORS[color] if isinstance(color, str) else color)


def ellipse(draw: ImageDraw.ImageDraw, xy, color: str | tuple[int, int, int, int]) -> None:
    draw.ellipse(xy, fill=COLORS[color] if isinstance(color, str) else color)


def diamond(draw: ImageDraw.ImageDraw, cx: int, cy: int, rx: int, ry: int, color: str) -> None:
    poly(draw, [(cx, cy - ry), (cx + rx, cy), (cx, cy + ry), (cx - rx, cy)], color)


def sparkle(draw: ImageDraw.ImageDraw, cx: int, cy: int, color: str = "ice") -> None:
    line(draw, [(cx - 2, cy), (cx + 2, cy)], color)
    line(draw, [(cx, cy - 2), (cx, cy + 2)], color)
    rect(draw, (cx, cy, cx, cy), "ice")


def magic_ring(draw: ImageDraw.ImageDraw, cx: int, cy: int, radius: int, color: str, phase: float) -> None:
    steps = 18
    for i in range(steps):
        if i % 3 == 1:
            continue
        a = phase + i * math.tau / steps
        x = round(cx + math.cos(a) * radius)
        y = round(cy + math.sin(a) * radius * 0.62)
        rect(draw, (x, y, x + 1, y + 1), color)


def draw_staff(draw: ImageDraw.ImageDraw, x: int, y: int, sway: int, glow: int = 0) -> None:
    top = y - 50 + sway
    bottom = BASELINE + 4
    line(draw, [(x, top + 13), (x - 2, bottom)], "outline", 3)
    line(draw, [(x, top + 13), (x - 2, bottom)], (41, 35, 50, 255), 1)
    line(draw, [(x - 5, top + 16), (x + 5, top + 16)], "gold", 1)
    ellipse(draw, (x - 8, top + 5, x + 8, top + 21), "gold")
    ellipse(draw, (x - 6, top + 7, x + 6, top + 19), "outline")
    diamond(draw, x, top + 13, 5 + glow, 8 + glow, "ice")
    diamond(draw, x, top + 13, 2, 4, "blue_hi")
    diamond(draw, x + 9, top + 24, 3, 6, "ice_dim")
    line(draw, [(x + 7, top + 17), (x + 9, top + 22)], "gold")
    if glow:
        sparkle(draw, x + 13, top + 9, "ice")


def draw_mage(
    img: Image.Image,
    frame: int,
    action: str,
    *,
    body_dx: int = 0,
    body_dy: int = 0,
    arm_raise: int = 0,
    arm_forward: int = 0,
    staff_sway: int = 0,
    hair_sway: int = 0,
    robe_sway: int = 0,
    hurt: bool = False,
    fade: float = 1.0,
) -> None:
    draw = ImageDraw.Draw(img, "RGBA")
    cx = ANCHOR_X + body_dx
    floor = BASELINE + body_dy
    shoulder_y = floor - 44
    head_y = floor - 63
    staff_x = cx - 29 + staff_sway
    alpha = max(0, min(255, round(255 * fade)))

    def ca(name: str) -> tuple[int, int, int, int]:
        r, g, b, a = COLORS[name]
        return (r, g, b, min(a, alpha))

    # Shadow and contact are stable so frame playback does not slide.
    ellipse(draw, (cx - 24, BASELINE - 2, cx + 22, BASELINE + 4), (0, 0, 0, min(74, alpha)))

    if action != "death" or frame < 7:
        draw_staff(draw, staff_x, floor - 4, staff_sway // 2, 1 if action in {"cast", "attack", "attack-heavy"} else 0)

    # Hair mass behind the body, based on the current portrait's long pale blue hair.
    poly(
        draw,
        [
            (cx - 12, head_y + 9),
            (cx - 30 - hair_sway, head_y + 27),
            (cx - 23 - hair_sway, floor - 8),
            (cx + 18 + hair_sway, floor - 12),
            (cx + 20 + hair_sway, head_y + 21),
        ],
        ca("hair_shadow"),
    )
    poly(
        draw,
        [
            (cx - 5, head_y + 5),
            (cx - 23 - hair_sway, head_y + 22),
            (cx - 18 - hair_sway, floor - 17),
            (cx + 20 + hair_sway, floor - 20),
            (cx + 13, head_y + 14),
        ],
        ca("hair"),
    )
    line(draw, [(cx - 10, head_y + 11), (cx - 26 - hair_sway, floor - 14)], ca("hair_dark"))
    line(draw, [(cx + 4, head_y + 13), (cx + 21 + hair_sway, floor - 19)], ca("hair_shadow"))

    # Legs and boots.
    poly(draw, [(cx - 9, floor - 20), (cx - 4, floor - 3), (cx - 10, floor), (cx - 16, floor - 17)], ca("outline"))
    poly(draw, [(cx + 5, floor - 20), (cx + 13, floor - 1), (cx + 5, floor + 1), (cx, floor - 17)], ca("outline"))
    rect(draw, (cx - 10, floor - 2, cx - 1, floor + 1), ca("gold"))
    rect(draw, (cx + 4, floor - 1, cx + 14, floor + 2), ca("gold"))

    # Robe silhouette: dark navy with blue inner panels and gold trim.
    poly(
        draw,
        [
            (cx - 14, shoulder_y + 11),
            (cx - 24 - robe_sway, floor - 2),
            (cx - 6, floor - 7),
            (cx, floor - 21),
            (cx + 14 + robe_sway, floor - 2),
            (cx + 25 + robe_sway, floor - 8),
            (cx + 14, shoulder_y + 9),
        ],
        ca("outline"),
    )
    poly(
        draw,
        [
            (cx - 12, shoulder_y + 13),
            (cx - 19 - robe_sway, floor - 7),
            (cx - 5, floor - 10),
            (cx, floor - 24),
            (cx + 12 + robe_sway, floor - 7),
            (cx + 20 + robe_sway, floor - 12),
            (cx + 11, shoulder_y + 11),
        ],
        ca("robe"),
    )
    poly(draw, [(cx - 4, shoulder_y + 18), (cx - 7, floor - 12), (cx + 4, floor - 17), (cx + 4, shoulder_y + 18)], ca("blue"))
    line(draw, [(cx - 13, shoulder_y + 16), (cx - 20 - robe_sway, floor - 7)], ca("gold"))
    line(draw, [(cx + 11, shoulder_y + 15), (cx + 20 + robe_sway, floor - 12)], ca("gold"))
    line(draw, [(cx - 2, shoulder_y + 19), (cx - 4, floor - 13)], ca("gold_hi"))
    rect(draw, (cx - 7, shoulder_y + 12, cx + 8, shoulder_y + 24), ca("robe2"))
    rect(draw, (cx - 5, shoulder_y + 13, cx + 5, shoulder_y + 22), ca("deep"))
    diamond(draw, cx, shoulder_y + 20, 3, 4, "blue_hi")

    # Sleeves and casting hand.
    left_hand = (cx - 19, shoulder_y + 29)
    right_hand = (cx + 21 + arm_forward, shoulder_y + 28 - arm_raise)
    poly(draw, [(cx - 11, shoulder_y + 15), (left_hand[0] - 3, left_hand[1] + 1), (left_hand[0] + 3, left_hand[1] + 5), (cx - 4, shoulder_y + 23)], ca("outline"))
    poly(draw, [(cx + 10, shoulder_y + 16), (right_hand[0] - 5, right_hand[1] + 5), (right_hand[0] + 3, right_hand[1] + 9), (cx + 5, shoulder_y + 23)], ca("outline"))
    poly(draw, [(cx + 11, shoulder_y + 18), (right_hand[0] - 4, right_hand[1] + 5), (right_hand[0] + 1, right_hand[1] + 7), (cx + 5, shoulder_y + 24)], ca("robe"))
    rect(draw, (left_hand[0], left_hand[1], left_hand[0] + 3, left_hand[1] + 3), ca("skin"))
    rect(draw, (right_hand[0], right_hand[1], right_hand[0] + 4, right_hand[1] + 3), ca("skin"))

    # Head, ears, hair fringe, ornaments.
    ellipse(draw, (cx - 8, head_y + 11, cx + 8, head_y + 27), ca("skin"))
    rect(draw, (cx - 7, head_y + 21, cx + 7, head_y + 29), ca("skin"))
    poly(draw, [(cx - 8, head_y + 18), (cx - 17, head_y + 15), (cx - 9, head_y + 22)], ca("skin"))
    poly(draw, [(cx + 8, head_y + 18), (cx + 16, head_y + 15), (cx + 8, head_y + 22)], ca("skin"))
    rect(draw, (cx - 4, head_y + 20, cx - 2, head_y + 21), "blue_hi")
    rect(draw, (cx + 4, head_y + 20, cx + 6, head_y + 21), "blue_hi")
    poly(draw, [(cx - 10, head_y + 12), (cx + 3, head_y + 7), (cx + 13, head_y + 14), (cx + 6, head_y + 15), (cx - 5, head_y + 18)], ca("hair"))
    line(draw, [(cx + 8, head_y + 11), (cx + 13, head_y + 17)], ca("hair_shadow"))
    diamond(draw, cx - 8, head_y + 11, 2, 3, "blue_hi")
    line(draw, [(cx - 9, head_y + 10), (cx - 12, head_y + 7)], ca("gold"))
    rect(draw, (cx + 6, head_y + 31, cx + 10, head_y + 34), ca("gold"))

    if hurt:
        rect(draw, (cx - 17, head_y + 4, cx + 20, floor - 2), (255, 60, 95, 48))
        line(draw, [(cx - 24, head_y + 19), (cx - 18, head_y + 14)], "hurt", 1)
        line(draw, [(cx + 24, head_y + 22), (cx + 30, head_y + 16)], "hurt", 1)


def draw_attack_fx(draw: ImageDraw.ImageDraw, frame: int, heavy: bool = False) -> None:
    t = frame / 7
    cx = 102 + round(t * 24)
    cy = 50 - round(math.sin(t * math.pi) * 8)
    radius = 4 + frame // 2 + (3 if heavy else 0)
    color = "fire" if heavy or frame >= 4 else "ice"
    hi = "fire_hi" if color == "fire" else "ice"
    magic_ring(draw, cx, cy, radius + 3, color, t * math.tau)
    ellipse(draw, (cx - radius, cy - radius, cx + radius, cy + radius), color)
    ellipse(draw, (cx - max(1, radius // 2), cy - max(1, radius // 2), cx + radius // 2, cy + radius // 2), hi)
    for i in range(4):
        sparkle(draw, cx + round(math.cos(i + t) * (radius + 8)), cy + round(math.sin(i + t) * (radius + 5)), hi)


def draw_cast_fx(draw: ImageDraw.ImageDraw, frame: int) -> None:
    t = frame / 4
    magic_ring(draw, 105, 48, 14 + frame, "ice", t * math.tau)
    magic_ring(draw, 105, 48, 8 + frame, "violet", -t * math.tau)
    diamond(draw, 105, 48, 5, 7, "ice")
    if frame >= 2:
        magic_ring(draw, 80, 91, 18, "ice_dim", t * math.tau)


def build_action(action: str, frames: int) -> Image.Image:
    source_name = "attack" if action == "attack-heavy" else action
    source_path = SOURCE_DIR / f"{source_name}.png"
    if source_path.exists():
        return build_from_warlock_source(action, source_path, frames)

    low_strip = Image.new("RGBA", (LOW_W * frames, LOW_H), (0, 0, 0, 0))
    for frame in range(frames):
        img = new_frame()
        draw = ImageDraw.Draw(img, "RGBA")
        if action == "idle":
            bob = round(math.sin(frame / frames * math.tau) * 1)
            draw_mage(img, frame, action, body_dy=bob, staff_sway=round(math.sin(frame / frames * math.tau) * 1), hair_sway=round(math.sin(frame / frames * math.tau) * 2), robe_sway=round(math.cos(frame / frames * math.tau) * 1))
            if frame in {1, 4}:
                sparkle(draw, 111, 39, "ice")
        elif action == "run":
            phase = frame / frames * math.tau
            dx = round(math.sin(phase) * 2)
            bob = 1 if frame % 2 else 0
            draw_mage(img, frame, action, body_dx=dx, body_dy=bob, staff_sway=-round(math.sin(phase) * 3), hair_sway=-round(math.sin(phase) * 3), robe_sway=round(math.sin(phase) * 3))
            line(draw, [(55 - dx, BASELINE + 2), (43 - dx, BASELINE + 2)], (67, 130, 205, 100), 1)
        elif action == "attack":
            raise_amt = min(10, frame * 2) if frame < 5 else max(0, 16 - frame * 2)
            forward = min(18, frame * 4)
            draw_mage(img, frame, action, arm_raise=raise_amt, arm_forward=forward, staff_sway=-2, hair_sway=1, robe_sway=2)
            draw_attack_fx(draw, frame, False)
        elif action == "attack-heavy":
            raise_amt = min(14, frame * 2)
            forward = min(23, frame * 4)
            draw_mage(img, frame, action, arm_raise=raise_amt, arm_forward=forward, staff_sway=-3, hair_sway=2, robe_sway=3)
            draw_attack_fx(draw, frame, True)
            if frame >= 4:
                line(draw, [(114, 54), (143, 41)], "fire_hi", 2)
                line(draw, [(113, 57), (145, 63)], "fire", 1)
        elif action == "cast":
            draw_mage(img, frame, action, body_dy=-1 if frame in {1, 3} else 0, arm_raise=12, arm_forward=9, staff_sway=-1, hair_sway=2, robe_sway=1)
            draw_cast_fx(draw, frame)
        elif action == "hurt":
            draw_mage(img, frame, action, body_dx=-2 + frame, body_dy=1, staff_sway=3, hurt=True)
        elif action == "death":
            if frame < 5:
                draw_mage(img, frame, action, body_dx=-frame * 2, body_dy=frame * 4, staff_sway=frame * 2, hair_sway=frame, robe_sway=-frame, fade=1.0)
            else:
                fade = max(0.15, 1 - (frame - 4) * 0.18)
                draw_mage(img, frame, action, body_dx=-8, body_dy=20, staff_sway=8, hair_sway=4, robe_sway=-4, fade=fade)
                for i in range(frame - 3):
                    sparkle(draw, 72 + i * 7, 70 - i * 5, "ice")
        low_strip.alpha_composite(img, (frame * LOW_W, 0))
    return upscale(low_strip)


def shift_to_mage_palette(frame: Image.Image, action: str) -> Image.Image:
    """Repaint the warlock source toward the current mage portrait palette."""

    out = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    pixels = frame.load()
    dst = out.load()
    for y in range(frame.height):
        for x in range(frame.width):
            r, g, b, a = pixels[x, y]
            if a <= 4:
                continue
            nr, ng, nb = r, g, b

            # Bright hair and skin stay recognizable, with a colder blue cast.
            if r > 176 and g > 168 and b > 170:
                nr = min(255, int(r * 0.96 + 18))
                ng = min(255, int(g * 0.98 + 20))
                nb = min(255, int(b * 1.04 + 24))
            elif r > 130 and g > 78 and b > 70 and r > b + 18:
                nr = min(255, int(r * 1.03))
                ng = min(255, int(g * 0.98))
                nb = min(255, int(b * 0.96))
            # Purple magic and robe accents become arcane blue.
            elif b > 72 and r > 48 and b >= g + 22:
                intensity = max(r, b)
                nr = int(18 + intensity * 0.18)
                ng = int(58 + intensity * 0.52)
                nb = min(255, int(126 + intensity * 0.62))
            # Dark robes move from purple-black to black/navy.
            elif b > r and b > 28:
                nr = int(r * 0.68)
                ng = int(g * 0.88 + 8)
                nb = min(255, int(b * 1.15 + 10))
            # Some existing warm trim is pushed toward antique gold.
            elif r > 110 and g > 78 and b < 90:
                nr = min(255, int(r * 1.08 + 24))
                ng = min(255, int(g * 1.05 + 18))
                nb = max(46, int(b * 0.72))

            dst[x, y] = (nr, ng, nb, a)
    return out


def draw_crystal_staff(draw: ImageDraw.ImageDraw, bbox: tuple[int, int, int, int], frame_index: int, action: str) -> None:
    left, top, _right, bottom = bbox
    x = left + 25 + round(math.sin(frame_index * 0.8) * 1)
    y1 = max(18, top - 13)
    y2 = min(200, bottom + 12)
    line(draw, [(x, y1 + 22), (x - 8, y2)], "outline", 4)
    line(draw, [(x, y1 + 22), (x - 8, y2)], (39, 33, 45, 255), 2)
    line(draw, [(x - 12, y1 + 22), (x + 12, y1 + 22)], "gold", 2)
    ellipse(draw, (x - 15, y1 + 5, x + 15, y1 + 35), "gold")
    ellipse(draw, (x - 10, y1 + 10, x + 10, y1 + 30), "outline")
    diamond(draw, x, y1 + 20, 8, 13, "ice")
    diamond(draw, x, y1 + 20, 4, 7, "blue_hi")
    diamond(draw, x + 18, y1 + 40, 5, 10, "ice_dim")
    line(draw, [(x + 12, y1 + 28), (x + 18, y1 + 36)], "gold", 2)
    if action in {"attack", "attack-heavy", "cast"}:
        magic_ring(draw, x, y1 + 20, 18 + frame_index % 3, "ice", frame_index * 0.7)


def draw_gold_trim(draw: ImageDraw.ImageDraw, bbox: tuple[int, int, int, int]) -> None:
    left, top, right, bottom = bbox
    cx = (left + right) // 2
    torso_top = top + 43
    hem = bottom - 10
    line(draw, [(cx - 8, torso_top), (cx - 18, hem)], "gold", 1)
    line(draw, [(cx + 8, torso_top), (cx + 18, hem)], "gold", 1)
    diamond(draw, cx, torso_top + 15, 4, 6, "blue_hi")
    rect(draw, (cx - 3, bottom - 8, cx + 3, bottom - 5), "gold_hi")


def draw_mage_fx(draw: ImageDraw.ImageDraw, bbox: tuple[int, int, int, int], frame_index: int, action: str) -> None:
    _left, top, right, bottom = bbox
    if action == "attack":
        t = frame_index / 7
        cx = min(300, right + 8 + round(t * 18))
        cy = top + 45 - round(math.sin(t * math.pi) * 9)
        magic_ring(draw, cx, cy, 12 + frame_index, "ice", t * math.tau)
        diamond(draw, cx, cy, 6 + frame_index // 2, 8 + frame_index // 2, "ice")
        sparkle(draw, cx + 17, cy - 8, "ice")
    elif action == "attack-heavy":
        t = frame_index / 7
        cx = min(304, right + 12 + round(t * 16))
        cy = top + 46 - round(math.sin(t * math.pi) * 7)
        magic_ring(draw, cx, cy, 14 + frame_index, "fire", t * math.tau)
        ellipse(draw, (cx - 9, cy - 9, cx + 9, cy + 9), "fire")
        ellipse(draw, (cx - 4, cy - 4, cx + 4, cy + 4), "fire_hi")
        if frame_index >= 4:
            line(draw, [(cx + 6, cy), (min(319, cx + 38), cy - 12)], "fire_hi", 2)
            line(draw, [(cx + 3, cy + 6), (min(319, cx + 34), cy + 13)], "fire", 2)
    elif action == "cast":
        cx = min(285, right - 8)
        cy = top + 45
        magic_ring(draw, cx, cy, 20 + frame_index * 3, "ice", frame_index * 0.9)
        magic_ring(draw, cx, cy, 12 + frame_index * 2, "violet", -frame_index * 0.8)
        for i in range(3):
            sparkle(draw, cx - 14 + i * 13, cy - 22 + (i % 2) * 5, "ice")
        magic_ring(draw, (bbox[0] + bbox[2]) // 2, bottom + 3, 28, "ice_dim", frame_index * 0.5)
    elif action == "hurt":
        left, _top, _right, _bottom = bbox
        line(draw, [(left - 6, top + 20), (left + 8, top + 4)], "hurt", 2)
        line(draw, [(right + 3, top + 31), (right + 16, top + 17)], "hurt", 2)


def build_from_warlock_source(action: str, source_path: Path, frames: int) -> Image.Image:
    source = Image.open(source_path).convert("RGBA")
    source_frames = source.width // FRAME_W
    if source.height != FRAME_H or source_frames < frames:
        raise RuntimeError(f"{source_path} is not a {FRAME_W}x{FRAME_H} source strip")

    strip = Image.new("RGBA", (FRAME_W * frames, FRAME_H), (0, 0, 0, 0))
    for index in range(frames):
        frame = source.crop((index * FRAME_W, 0, (index + 1) * FRAME_W, FRAME_H))
        repainted = shift_to_mage_palette(frame, action)
        bbox = repainted.getchannel("A").getbbox()
        if bbox:
            draw = ImageDraw.Draw(repainted, "RGBA")
            draw_mage_fx(draw, bbox, index, action)
        strip.alpha_composite(repainted, (index * FRAME_W, 0))
    return strip


def build_projectile() -> Image.Image:
    frames = 8
    low = Image.new("RGBA", (64 * frames, 64), (0, 0, 0, 0))
    for frame in range(frames):
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, "RGBA")
        cx = 32 + round(math.sin(frame * 0.8) * 2)
        cy = 32
        radius = 8 + (frame % 3)
        for r in range(radius + 8, radius, -3):
            magic_ring(draw, cx, cy, r, "ice_dim", frame * 0.7 + r)
        ellipse(draw, (cx - radius, cy - radius, cx + radius, cy + radius), "ice")
        ellipse(draw, (cx - 4, cy - 4, cx + 4, cy + 4), "blue_hi")
        line(draw, [(cx - 25, cy), (cx - 11, cy)], (47, 127, 233, 150), 2)
        sparkle(draw, cx + 15, cy - 6, "ice")
        low.alpha_composite(img, (frame * 64, 0))
    return low


def build_basic_projectile() -> Image.Image:
    frames = 8
    low = Image.new("RGBA", (64 * frames, 64), (0, 0, 0, 0))
    for frame in range(frames):
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, "RGBA")
        pulse = frame % 4
        cx = 34 + round(math.sin(frame * 0.9) * 2)
        cy = 32
        line(draw, [(cx - 29, cy), (cx - 12, cy)], (56, 139, 240, 128), 2)
        line(draw, [(cx - 24, cy - 4), (cx - 11, cy - 2)], (112, 224, 255, 108), 1)
        ellipse(draw, (cx - 9 - pulse, cy - 7, cx + 8, cy + 7), (38, 106, 218, 220))
        ellipse(draw, (cx - 6, cy - 5, cx + 5 + pulse, cy + 5), "ice")
        diamond(draw, cx + 1, cy, 4, 6, "blue_hi")
        sparkle(draw, cx + 14, cy - 6, "ice")
        if frame % 2 == 0:
            sparkle(draw, cx - 15, cy + 7, "ice_dim")
        low.alpha_composite(img, (frame * 64, 0))
    return low


def build_impact() -> Image.Image:
    frames = 6
    low = Image.new("RGBA", (96 * frames, 96), (0, 0, 0, 0))
    for frame in range(frames):
        img = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img, "RGBA")
        r = 8 + frame * 6
        cx = cy = 48
        magic_ring(draw, cx, cy, r, "ice", frame * 0.8)
        magic_ring(draw, cx, cy, max(4, r - 9), "violet", -frame * 0.7)
        for i in range(8):
            a = i * math.tau / 8 + frame * 0.35
            x = round(cx + math.cos(a) * r)
            y = round(cy + math.sin(a) * r * 0.7)
            sparkle(draw, x, y, "ice" if i % 2 else "violet")
        low.alpha_composite(img, (frame * 96, 0))
    return low


def build_model_preview(idle_strip: Image.Image) -> Image.Image:
    return idle_strip.crop((0, 0, FRAME_W, FRAME_H))


def build_contact_sheet(actions: dict[str, tuple[int, Image.Image]]) -> Image.Image:
    gap = 8
    label_h = 16
    thumb_scale = 0.5
    width = 960
    rows = []
    font_color = (230, 238, 255, 255)
    for name, (frames, strip) in actions.items():
        h = round(FRAME_H * thumb_scale) + label_h + gap
        row = Image.new("RGBA", (width, h), (12, 16, 33, 255))
        d = ImageDraw.Draw(row, "RGBA")
        d.text((8, 2), f"{name} - {frames} frames / {FRAME_W}x{FRAME_H}", fill=font_color)
        for i in range(min(frames, 8)):
            frame = strip.crop((i * FRAME_W, 0, (i + 1) * FRAME_W, FRAME_H))
            frame = frame.resize((round(FRAME_W * thumb_scale), round(FRAME_H * thumb_scale)), Image.Resampling.NEAREST)
            x = 8 + i * (round(FRAME_W * thumb_scale) + 6)
            row.alpha_composite(frame, (x, label_h))
        rows.append(row)
    out = Image.new("RGBA", (width, sum(r.height for r in rows)), (12, 16, 33, 255))
    y = 0
    for row in rows:
        out.alpha_composite(row, (0, y))
        y += row.height
    return out


def write_preview_html(actions: dict[str, tuple[int, Image.Image]]) -> None:
    action_rows = ",\n      ".join(
        f'{{ key: "{name}", label: "{name.replace("-", " ").title()}", frames: {frames}, duration: {duration} }}'
        for name, (frames, _strip, duration) in {
            "idle": (6, actions["idle"][1], 980),
            "run": (7, actions["run"][1], 660),
            "attack": (8, actions["attack"][1], 620),
            "attack-heavy": (8, actions["attack-heavy"][1], 720),
            "cast": (5, actions["cast"][1], 620),
            "hurt": (2, actions["hurt"][1], 320),
            "death": (9, actions["death"][1], 900),
        }.items()
    )
    PREVIEW_HTML.write_text(
        f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mage New Sprite Preview</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #101522;
      --panel: #171e2e;
      --panel2: #202a40;
      --ink: #eef6ff;
      --muted: #9fb5ca;
      --line: #31415b;
      --ice: #8ee9ff;
      --gold: #d4a75e;
      --fire: #ff7a3b;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", Arial, sans-serif;
      background:
        radial-gradient(circle at 20% 12%, rgba(142, 233, 255, .13), transparent 31%),
        radial-gradient(circle at 86% 20%, rgba(255, 122, 59, .12), transparent 28%),
        var(--bg);
      color: var(--ink);
    }}
    main {{
      width: min(1240px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0;
      display: grid;
      grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
      gap: 18px;
      align-items: start;
    }}
    h1 {{ margin: 0 0 14px; font-size: 20px; font-weight: 750; letter-spacing: 0; }}
    .stage, .controls, .sheet {{
      border: 1px solid var(--line);
      background: rgba(23, 30, 46, .9);
      box-shadow: 0 18px 44px rgba(0, 0, 0, .24);
    }}
    .stage {{ padding: 18px; }}
    .viewport {{
      width: 100%;
      aspect-ratio: 1 / 1;
      display: grid;
      place-items: center;
      background:
        linear-gradient(45deg, #20293b 25%, transparent 25%),
        linear-gradient(-45deg, #20293b 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #20293b 75%),
        linear-gradient(-45deg, transparent 75%, #20293b 75%),
        #141b2a;
      background-position: 0 0, 0 12px, 12px -12px, -12px 0;
      background-size: 24px 24px;
      border: 1px solid var(--line);
      image-rendering: pixelated;
    }}
    canvas {{
      display: block;
      width: min(94%, 520px);
      height: auto;
      image-rendering: pixelated;
    }}
    #basicProjectilePreview, #projectilePreview, #impactPreview {{ width: min(96%, 512px); height: auto; }}
    .meta {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
      color: var(--muted);
      font-size: 13px;
    }}
    .controls {{
      margin-top: 14px;
      padding: 14px;
      display: grid;
      gap: 12px;
    }}
    .actions {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }}
    button {{
      min-height: 38px;
      border: 1px solid var(--line);
      background: var(--panel2);
      color: var(--ink);
      font: inherit;
      cursor: pointer;
    }}
    button.active {{
      border-color: var(--ice);
      color: #07101c;
      background: linear-gradient(135deg, var(--ice), var(--gold), var(--fire));
      font-weight: 750;
    }}
    label {{ display: grid; gap: 6px; color: var(--muted); font-size: 13px; }}
    input[type="range"] {{ width: 100%; }}
    .sheet {{ padding: 14px; overflow: hidden; }}
    .sheet img {{
      display: block;
      width: 100%;
      height: auto;
      image-rendering: pixelated;
      border: 1px solid var(--line);
      margin-bottom: 12px;
    }}
    .note {{ color: var(--muted); font-size: 13px; line-height: 1.5; margin: 0; }}
    @media (max-width: 860px) {{ main {{ grid-template-columns: 1fr; }} }}
  </style>
</head>
<body>
  <main>
    <section>
      <div class="stage">
        <h1>Blue Crystal Mage Preview</h1>
        <div class="viewport">
          <canvas id="preview" width="640" height="416" aria-label="mage animation preview"></canvas>
        </div>
        <div class="meta">
          <span id="animName">idle</span>
          <span id="frameInfo">frame 1 / 6</span>
        </div>
      </div>
      <div class="controls">
        <div class="actions" id="actions"></div>
        <label>
          Speed <span id="fpsValue">8 FPS</span>
          <input id="fps" type="range" min="2" max="18" value="8">
        </label>
        <label>
          Zoom <span id="zoomValue">1.00x</span>
          <input id="zoom" type="range" min="70" max="160" value="100">
        </label>
      </div>
      <div class="stage" style="margin-top: 14px;">
        <h1>Projectile / Impact</h1>
        <div class="viewport" style="aspect-ratio: 4 / 1;">
          <canvas id="basicProjectilePreview" width="512" height="128" aria-label="basic attack projectile preview"></canvas>
        </div>
        <div class="viewport" style="aspect-ratio: 4 / 1; margin-top: 10px;">
          <canvas id="projectilePreview" width="512" height="128" aria-label="projectile preview"></canvas>
        </div>
        <div class="viewport" style="aspect-ratio: 4 / 1; margin-top: 10px;">
          <canvas id="impactPreview" width="512" height="128" aria-label="impact preview"></canvas>
        </div>
        <div class="meta"><span>basic bolt / spell bolt / impact</span><span>8 / 8 / 6 frames</span></div>
      </div>
    </section>
    <section class="sheet">
      <img src="assets/sprites/mage-new-preview/mage-new-contact-sheet.png" alt="mage-new sprite contact sheet">
      <img src="assets/sprites/mage-new/cast.png" alt="mage-new cast strip">
      <p class="note">Preview only. Assets are generated as fixed {FRAME_W}x{FRAME_H} transparent strips under assets/sprites/mage-new and are not wired into game.js yet.</p>
    </section>
  </main>
  <script>
    const frameW = {FRAME_W};
    const frameH = {FRAME_H};
    const animations = [
      {action_rows}
    ];
    const images = {{}};
    for (const anim of animations) {{
      const img = new Image();
      img.src = `assets/sprites/mage-new/${{anim.key}}.png?v=mageNewPreview2`;
      images[anim.key] = img;
    }}
    const basicProjectile = new Image();
    basicProjectile.src = "assets/sprites/mage-new/basic-projectile.png?v=mageNewPreview2";
    const projectile = new Image();
    projectile.src = "assets/sprites/mage-new/projectile.png?v=mageNewPreview2";
    const impact = new Image();
    impact.src = "assets/sprites/mage-new/impact.png?v=mageNewPreview2";

    const canvas = document.getElementById("preview");
    const ctx = canvas.getContext("2d");
    const basicProjectileCanvas = document.getElementById("basicProjectilePreview");
    const basicProjectileCtx = basicProjectileCanvas.getContext("2d");
    const projectileCanvas = document.getElementById("projectilePreview");
    const projectileCtx = projectileCanvas.getContext("2d");
    const impactCanvas = document.getElementById("impactPreview");
    const impactCtx = impactCanvas.getContext("2d");
    const actionsEl = document.getElementById("actions");
    const fpsInput = document.getElementById("fps");
    const zoomInput = document.getElementById("zoom");
    const fpsValue = document.getElementById("fpsValue");
    const zoomValue = document.getElementById("zoomValue");
    const animName = document.getElementById("animName");
    const frameInfo = document.getElementById("frameInfo");
    let current = animations[0];
    let frame = 0;
    let lastTick = 0;

    function setAnimation(anim) {{
      current = anim;
      frame = 0;
      for (const button of actionsEl.querySelectorAll("button")) {{
        button.classList.toggle("active", button.dataset.key === anim.key);
      }}
      draw();
    }}

    for (const anim of animations) {{
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = anim.label;
      button.dataset.key = anim.key;
      button.addEventListener("click", () => setAnimation(anim));
      actionsEl.appendChild(button);
    }}

    function draw() {{
      const img = images[current.key];
      if (!img.complete || !img.naturalWidth) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      const zoom = Number(zoomInput.value) / 100;
      const w = frameW * zoom;
      const h = frameH * zoom;
      const x = Math.round((canvas.width - w) / 2);
      const y = Math.round((canvas.height - h) / 2);
      ctx.drawImage(img, frame * frameW, 0, frameW, frameH, x, y, w, h);
      animName.textContent = current.key;
      frameInfo.textContent = `frame ${{frame + 1}} / ${{current.frames}}`;
    }}

    function drawStripPreview(ctx, img, frameW, frameH, frames, frameIndex) {{
      if (!img.complete || !img.naturalWidth) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.imageSmoothingEnabled = false;
      const zoom = 1.45;
      const w = frameW * zoom;
      const h = frameH * zoom;
      const x = Math.round((ctx.canvas.width - w) / 2);
      const y = Math.round((ctx.canvas.height - h) / 2);
      ctx.drawImage(img, frameIndex * frameW, 0, frameW, frameH, x, y, w, h);
    }}

    function tick(timestamp) {{
      const fps = Number(fpsInput.value);
      const interval = 1000 / fps;
      if (timestamp - lastTick >= interval) {{
        frame = (frame + 1) % current.frames;
        lastTick = timestamp;
      }}
      draw();
      const fxFrame = Math.floor(timestamp / interval) % 8;
      drawStripPreview(basicProjectileCtx, basicProjectile, 64, 64, 8, fxFrame);
      drawStripPreview(projectileCtx, projectile, 64, 64, 8, fxFrame);
      drawStripPreview(impactCtx, impact, 96, 96, 6, fxFrame % 6);
      requestAnimationFrame(tick);
    }}

    fpsInput.addEventListener("input", () => {{
      fpsValue.textContent = `${{fpsInput.value}} FPS`;
    }});
    zoomInput.addEventListener("input", () => {{
      zoomValue.textContent = `${{(Number(zoomInput.value) / 100).toFixed(2)}}x`;
      draw();
    }});
    setAnimation(animations[0]);
    requestAnimationFrame(tick);
  </script>
</body>
</html>
""",
        encoding="utf-8",
    )


def alpha_bbox(frame: Image.Image) -> tuple[int, int, int, int] | None:
    return frame.getchannel("A").getbbox()


def validate_outputs(actions: dict[str, tuple[int, Image.Image]]) -> None:
    for name, (frames, strip) in actions.items():
        expected = (FRAME_W * frames, FRAME_H)
        if strip.size != expected:
            raise RuntimeError(f"{name}: expected {expected}, got {strip.size}")
        for index in range(frames):
            frame = strip.crop((index * FRAME_W, 0, (index + 1) * FRAME_W, FRAME_H))
            if alpha_bbox(frame) is None:
                raise RuntimeError(f"{name}: frame {index} is empty")


def main() -> int:
    SPRITE_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    specs = {
        "idle": 6,
        "run": 7,
        "attack": 8,
        "attack-heavy": 8,
        "cast": 5,
        "hurt": 2,
        "death": 9,
    }
    actions: dict[str, tuple[int, Image.Image]] = {}
    for name, frames in specs.items():
        strip = build_action(name, frames)
        strip.save(SPRITE_DIR / f"{name}.png")
        actions[name] = (frames, strip)

    projectile = build_projectile()
    projectile.save(SPRITE_DIR / "projectile.png")
    basic_projectile = build_basic_projectile()
    basic_projectile.save(SPRITE_DIR / "basic-projectile.png")
    impact = build_impact()
    impact.save(SPRITE_DIR / "impact.png")

    model = build_model_preview(actions["idle"][1])
    model.save(PREVIEW_DIR / "mage-new-model.png")
    contact = build_contact_sheet(actions)
    contact.save(PREVIEW_DIR / "mage-new-contact-sheet.png")
    write_preview_html(actions)
    validate_outputs(actions)

    print(f"wrote {SPRITE_DIR}")
    print(f"wrote {PREVIEW_DIR}")
    print(f"wrote {PREVIEW_HTML}")
    print(f"profile frame={FRAME_W}x{FRAME_H} anchor={ANCHOR_X * SCALE},{BASELINE * SCALE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
