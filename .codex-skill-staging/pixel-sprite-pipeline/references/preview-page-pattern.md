# Preview Page Pattern

Use this structure when building a standalone sprite preview:

- Load the concept sheet and optional projectile sheet.
- Define `animations = [{ key, label }]`.
- Define `sourceFrames` as explicit `[x0, y0, x1, y1]` windows whenever the sheet is irregular.
- Define `sourceBaselines` per action.
- Define optional `sourceAnchorX` per action or per frame when effects widen the frame.
- Draw every frame onto a fixed-size canvas using:

```js
const dx = canvas.width / 2 - rect.anchorX * zoom;
const dy = canvas.height * baselineRatio - rect.anchorY * zoom;
ctx.drawImage(sheet, rect.sx, rect.sy, rect.sw, rect.sh, dx, dy, rect.sw * zoom, rect.sh * zoom);
```

Avoid:

- Centering the crop with `(canvas.width - drawW) / 2` when frame widths vary.
- Recomputing foot baseline from the lowest pixel every frame.
- Assuming generated sheets obey the requested grid.
