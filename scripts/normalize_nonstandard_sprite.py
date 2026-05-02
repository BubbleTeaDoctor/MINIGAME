#!/usr/bin/env python
"""Normalize a non-standard character sprite sheet into runtime frames.

Default mode is dry-run: it prints frame bounds and anchor data without writing.
Use --write with --out to produce a single-row runtime sheet.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image


ALPHA_THRESHOLD = 8


@dataclass(frozen=True)
class Anchor:
    x: int
    y: int


def parse_anchor(value: str) -> Anchor:
    try:
        raw_x, raw_y = value.split(",", 1)
        return Anchor(int(raw_x.strip()), int(raw_y.strip()))
    except Exception as exc:  # noqa: BLE001 - argparse needs a compact error.
        raise argparse.ArgumentTypeError(f"Invalid anchor '{value}', expected x,y") from exc


def parse_anchor_list(value: str, expected: int) -> list[Anchor]:
    anchors = [parse_anchor(part) for part in value.split(";") if part.strip()]
    if len(anchors) != expected:
        raise argparse.ArgumentTypeError(f"Expected {expected} anchors, got {len(anchors)}")
    return anchors


def alpha_bbox(frame: Image.Image) -> tuple[int, int, int, int] | None:
    return frame.getchannel("A").getbbox()


def detect_bottom_contact_anchor(frame: Image.Image, band: int) -> Anchor:
    """Use the rightmost non-transparent pixel in the bottom contact band.

    For the current right-facing character sheets, this matches the planted
    visible heel/contact point better than transparent-content centering.
    """

    alpha = frame.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return Anchor(frame.width // 2, frame.height - 1)
    left, _top, right, bottom = bbox
    pixels = alpha.load()
    xs: list[int] = []
    for y in range(max(0, bottom - band), bottom):
        for x in range(frame.width):
            if pixels[x, y] > ALPHA_THRESHOLD:
                xs.append(x)
    if not xs:
        return Anchor((left + right - 1) // 2, bottom - 1)
    return Anchor(max(xs), bottom - 1)


def frame_iter(sheet: Image.Image, frames: int, cols: int, rows: int) -> Iterable[tuple[int, Image.Image]]:
    frame_w = sheet.width // cols
    frame_h = sheet.height // rows
    for index in range(frames):
        col = index % cols
        row = index // cols
        box = (col * frame_w, row * frame_h, (col + 1) * frame_w, (row + 1) * frame_h)
        yield index, sheet.crop(box)


def resample_filter() -> int:
    return Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS


def build_runtime_sheet(args: argparse.Namespace, sheet: Image.Image, anchors: list[Anchor]) -> Image.Image:
    source_frame_w = sheet.width // args.cols
    source_frame_h = sheet.height // args.rows
    scaled_w = round(source_frame_w * args.scale)
    scaled_h = round(source_frame_h * args.scale)
    output = Image.new("RGBA", (args.frame_width * args.frames, args.frame_height), (0, 0, 0, 0))

    for index, frame in frame_iter(sheet, args.frames, args.cols, args.rows):
        scaled = frame.resize((scaled_w, scaled_h), resample_filter())
        anchor = anchors[index]
        dx = round(args.target_anchor.x - anchor.x * args.scale)
        dy = round(args.target_anchor.y - anchor.y * args.scale)
        output.alpha_composite(scaled, (index * args.frame_width + dx, dy))
    return output


def report_sheet(label: str, sheet: Image.Image, frames: int) -> None:
    frame_w = sheet.width // frames
    print(f"{label}: sheet={sheet.width}x{sheet.height} frame={frame_w}x{sheet.height}")
    for index in range(frames):
        frame = sheet.crop((index * frame_w, 0, (index + 1) * frame_w, sheet.height))
        bbox = alpha_bbox(frame)
        if not bbox:
            print(f"  frame {index}: empty")
            continue
        left, top, right, bottom = bbox
        center_x = (left + right - 1) / 2
        print(f"  frame {index}: bbox=({left},{top},{right - 1},{bottom - 1}) centerX={center_x:.1f}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Raw sprite sheet path")
    parser.add_argument("--out", type=Path, help="Output runtime sheet path; required with --write")
    parser.add_argument("--frames", required=True, type=int, help="Total frame count to export")
    parser.add_argument("--cols", required=True, type=int, help="Raw sheet column count")
    parser.add_argument("--rows", required=True, type=int, help="Raw sheet row count")
    parser.add_argument("--frame-width", required=True, type=int, help="Runtime frame width")
    parser.add_argument("--frame-height", required=True, type=int, help="Runtime frame height")
    parser.add_argument("--scale", required=True, type=float, help="Scale from raw frame to runtime frame")
    parser.add_argument("--target-anchor", default="192,253", type=parse_anchor, help="Runtime anchor x,y")
    parser.add_argument(
        "--anchor-mode",
        choices=("bottom-contact", "explicit"),
        default="bottom-contact",
        help="How to choose per-frame anchors",
    )
    parser.add_argument(
        "--anchors",
        help="Explicit per-frame anchors as x,y;x,y;...; required for --anchor-mode explicit",
    )
    parser.add_argument("--contact-band", default=12, type=int, help="Bottom band height for auto anchor detection")
    parser.add_argument("--write", action="store_true", help="Actually write --out; omitted means dry-run only")
    args = parser.parse_args()

    if args.write and not args.out:
        parser.error("--out is required with --write")

    sheet = Image.open(args.input).convert("RGBA")
    expected_frames = args.cols * args.rows
    if args.frames > expected_frames:
        parser.error(f"--frames {args.frames} exceeds raw grid capacity {expected_frames}")

    if args.anchor_mode == "explicit":
        if not args.anchors:
            parser.error("--anchors is required for --anchor-mode explicit")
        anchors = parse_anchor_list(args.anchors, args.frames)
    else:
        anchors = [
            detect_bottom_contact_anchor(frame, args.contact_band)
            for _index, frame in frame_iter(sheet, args.frames, args.cols, args.rows)
        ]

    print(f"input={args.input} raw={sheet.width}x{sheet.height}")
    print("anchors=" + ";".join(f"{anchor.x},{anchor.y}" for anchor in anchors))
    output = build_runtime_sheet(args, sheet, anchors)
    report_sheet("runtime", output, args.frames)

    if args.write:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        output.save(args.out)
        print(f"wrote={args.out}")
    else:
        print("dry-run: no files written; pass --write --out <path> to save")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
