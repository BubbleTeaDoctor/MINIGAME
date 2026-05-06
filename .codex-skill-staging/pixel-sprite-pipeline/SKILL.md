---
name: pixel-sprite-pipeline
description: Generate, normalize, preview, and tune 2D pixel-art character sprite sheets for browser games. Use when Codex needs to create or refine game character sprites, replace an existing model, split generated sprite sheets into animation strips, calibrate frame anchors/baselines, build an external preview page, or create matching projectile/impact effects before wiring assets into the game.
---

# Pixel Sprite Pipeline

## Core Rule

Never treat a generated concept sheet as directly usable until it passes frame-grid, transparency, and anchor validation. Preview outside the game first, then ask before replacing existing runtime assets.

## Workflow

1. Inspect the current target sprite profile before generation:
   - Read manifest/profile data and runtime animation declarations.
   - Record frame width, frame height, scale, action names, frame counts, and file layout.
   - Open at least one current idle/cast/attack strip to match art style and silhouette scale.

2. Generate the new character as a concept sheet:
   - Use the `imagegen` skill/tool for bitmap character art.
   - Prompt for the existing frame size, action rows, frame counts, transparent or chroma-key background, fixed feet baseline, and consistent character identity.
   - Include the requested design details, but do not add unrelated characters or props.

3. Validate the generated sheet before coding against it:
   - Check pixel dimensions and compare them with expected `frameWidth * frames`.
   - Inspect whether the background is true alpha, chroma key, or baked checker.
   - Verify frames are equally spaced. If not, treat it as a concept sheet requiring manual frame windows.
   - Watch for attack/projectile effects crossing into adjacent frames.
   - When removing a baked checker/background, do not delete pixels by global color threshold alone. Use connected-background removal: flood fill from each source frame's borders through background-like pixels, and only make that connected region transparent. This preserves dark robe, hair-shadow, and internal detail pixels that resemble the background color.
   - If connected-background removal still creates holes in dark body parts, generate two masks: a broad/aggressive background mask for a clean silhouette, and a strict/conservative mask for detail preservation. Keep broad foreground, then restore only conservative foreground pixels within a tiny radius of the broad foreground. This repairs horns, sleeves, cape edges, and legs without restoring the whole checkerboard.

4. Build a game-external preview page:
   - Save generated assets under a preview-only directory such as `assets/sprites/<name>-preview/`.
   - Do not edit `game.js`, manifests, or profession mappings yet.
   - Provide animation buttons for every action and speed/zoom controls.
   - If the sheet is irregular, use explicit source frame windows instead of average-grid slicing.
   - Draw onto a fixed canvas with a stable anchor point. Do not center each crop dynamically.

5. Calibrate anchors:
   - Use feet/baseline as the primary anchor, not the crop center.
   - For actions with extended weapons, spell trails, projectiles, or death smoke, set per-action or per-frame `anchorX`.
   - Use fixed per-action `baselineY`; do not infer the baseline from the lowest visible pixel when robes, hair, shadows, or effects can move.
   - Iterate visually in the preview until idle does not drift, run does not bob unintentionally, and attack/cast do not slide.

6. Create matching effects:
   - Add a separate projectile strip for normal/cast attacks when the character fires a spell.
   - Prefer transparent PNG strips with fixed dimensions, e.g. `64x64 * frameCount`.
   - Preview projectile travel independently from the character animation.
   - If needed, add separate impact/hit strips before game integration.

7. Normalize for game integration only after approval:
   - Split irregular concept sheets into action strips with fixed frame dimensions.
   - Remove chroma-key or baked checker backgrounds and validate alpha.
   - Preserve action frame counts expected by the runtime where possible, or update runtime declarations deliberately.
   - Keep old assets unchanged until the user approves replacement.

## Practical Heuristics

- If the image looks like a sprite sheet but frames are not equal-width, do not use `columns = n` slicing.
- If attack slides horizontally, the frame center is probably wrong because the effect widened the frame; anchor to the character's feet.
- If run bobs vertically, the baseline is being recalculated per frame; use a fixed baseline.
- If idle moves forward/back, the frame center is varying; use fixed or per-frame `anchorX`.
- If "hide checker" removes dark robe pixels, switch to connected-background flood fill. Tightening the threshold alone is not reliable for dark fantasy sprites.
- If conservative flood fill leaves checker blocks around the character, merge a broad mask with near-neighbor conservative recovery instead of widening the recovery radius.

## Deliverables

For preview-only work, produce:

- The generated concept sheet copied into the workspace.
- A standalone preview HTML page.
- Any matching projectile/impact strips.
- A short note saying nothing has been wired into the game.

For game-ready work, produce:

- Normalized action strips with true transparency.
- Updated manifest/runtime references only after user approval.
- A browser preview and, after wiring, a game smoke test.
