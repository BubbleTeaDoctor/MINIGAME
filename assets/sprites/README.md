# Sprite Assets

These sprite sheets are local project copies prepared for the arena battle view.

For non-standard character sheets, follow `IMPORT_WORKFLOW.md` before replacing a runtime model. The workflow documents the Paladin import path: keep raw sheets under `assets/sprites/<profile>/raw/`, normalize runtime sheets with a fixed foot/heel anchor, avoid transparent-content centering, and add a cache version to runtime URLs.

- `knight-blue` and `knight-rose` come from `FREE_Knight 2D Pixel Art`, using the `Outline/120x80_PNGSheets` variants.
- `samurai` comes from `FREE_Samurai 2D Pixel Art v1.2`.
- `severed-fang`, `evil-wizard`, `blind-huntress`, `duskborne-elf`, `duskborne-demonkin`, and `battle-maid` are local project copies from `E:/minigame/素材`.
- `paladin` is the current reference implementation for importing a non-standard sheet into a stable runtime frame size.

The Samurai package includes a license that allows personal/commercial game use and modification, but forbids resale as a standalone asset pack and NFT use.

The Knight package did not include a license/readme in the downloaded folder. Confirm the original download page license before public release or commercial distribution.

The newly staged character sheets are prototype runtime assets. Confirm each downloaded pack's original license before public release or commercial distribution.
