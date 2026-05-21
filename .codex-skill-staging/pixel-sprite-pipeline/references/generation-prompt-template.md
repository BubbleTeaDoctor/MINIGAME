# Generation Prompt Template

Use this template for character generation:

```text
Use case: stylized-concept
Asset type: 2D browser game pixel-art sprite sheet
Primary request: <character description>
Canvas/layout: fixed <frameWidth>x<frameHeight> frame grid, rows for <actions>, exact frame counts <counts>. Keep every frame centered on the same feet baseline with consistent character scale. No labels, numbers, text, UI, or border.
Animation acting: describe idle/run/attack/cast/hurt/death clearly.
Style/medium: polished 2D pixel art, crisp silhouette, dark outline, limited palette, matches existing game assets.
Background: true transparent if available, otherwise flat chroma key for removal. No baked checkerboard.
Constraints: same character design in every frame, no adjacent-frame overlap, no camera movement, no drifting baseline, no watermark.
```

After generation, inspect the result. If it fails grid or transparency requirements, keep it as a concept sheet and normalize manually before game use.
