# 非标准角色精灵导入标准流程

本文档用于导入不符合现有角色帧表规格的新模型。Paladin/牧师替换是当前参考实现。

## 目标

- 原始素材保存在项目内，运行时只加载归一化后的帧表。
- 每个动作使用固定帧规格、固定缩放、固定脚点锚点。
- 禁止按每帧透明内容居中生成运行时帧表，这会导致攻击、施法、受击和待机时角色身体横向漂移。
- 浏览器加载的图片 URL 必须带 cache 版本号，避免继续使用旧帧表。

## 目录与命名

新角色统一放在：

```text
assets/sprites/<profile>/
assets/sprites/<profile>/raw/
```

原始素材放入 `raw/`，运行时素材输出到 `<profile>/` 根目录。常规动作命名为：

```text
idle.png
run.png
attack.png
cast.png
hurt.png
death.png
```

缺失动作必须在 `SPRITE_PROFILES` 里显式 fallback 到已有动作，不能引用不存在的文件。

## 归一化规则

1. 先记录 raw sheet 的帧数、列数、行数和每帧 raw 尺寸。
2. 选择浏览器友好的 runtime 帧规格，不要直接使用超大 raw sheet。
3. 确认角色锚点。默认使用脚底接触点；如果素材说明指定左脚脚后跟，就以该点为准。
4. 生成 runtime sheet 时按脚点锚定整帧，不按透明 bbox 居中。
5. 输出必须是单行横向帧表，便于当前 `appendNativeSprite()` 裁帧。
6. 生成后检查 bbox 报告。各帧中心不应该全部被强制锁到同一个 x 值。

Paladin 当前参考参数：

```text
runtime frame: 384x260
scale: 0.36
target anchor: 192,253
profile footOffset: 6
cache version: paladinHeelAnchor2
```

Paladin 使用 JS 驱动非循环动作播放，因为它的非标准大帧表在 SVG animate 下容易被重建和跳帧影响。新模型如果出现同类问题，优先复用该路径，而不是继续加大 duration。

## 工具脚本

使用 `scripts/normalize_nonstandard_sprite.py` 生成或 dry-run 单个动作。

dry-run 示例：

```powershell
python scripts/normalize_nonstandard_sprite.py `
  --input assets/sprites/paladin/raw/attack.png `
  --frames 8 --cols 8 --rows 1 `
  --frame-width 384 --frame-height 260 `
  --scale 0.5 `
  --target-anchor 192,253
```

写入示例：

```powershell
python scripts/normalize_nonstandard_sprite.py `
  --input assets/sprites/paladin/raw/attack.png `
  --out assets/sprites/paladin/attack.png `
  --frames 8 --cols 8 --rows 1 `
  --frame-width 384 --frame-height 260 `
  --scale 0.5 `
  --target-anchor 192,253 `
  --write
```

脚本默认使用 `bottom-contact` 自动锚点：在每帧底部接触区域查找脚底接触点。若自动检测不准，使用显式锚点：

```powershell
python scripts/normalize_nonstandard_sprite.py `
  --input assets/sprites/example/raw/attack.png `
  --out assets/sprites/example/attack.png `
  --frames 4 --cols 4 --rows 1 `
  --frame-width 384 --frame-height 260 `
  --scale 0.5 `
  --anchor-mode explicit `
  --anchors "360,407;377,407;402,409;404,410" `
  --write
```

## 接入 `game.js`

在 `SPRITE_PROFILES` 中新增 profile：

```js
example: {
  frameWidth: 384, frameHeight: 260, scale: 0.36, footOffset: 6,
  animations: {
    idle: { file: 'assets/sprites/example/idle.png?v=exampleImport1', frames: 8, duration: 1400, loop: true },
    attack: { file: 'assets/sprites/example/attack.png?v=exampleImport1', frames: 8, duration: 900 },
    cast: { file: 'assets/sprites/example/cast.png?v=exampleImport1', frames: 8, duration: 900 },
    hurt: { file: 'assets/sprites/example/hurt.png?v=exampleImport1', frames: 6, duration: 500 }
  }
}
```

然后在 `PROFESSION_SPRITE_PROFILES` 中把职业映射到该 profile。

注意：`frameWidth/frameHeight/scale` 是 runtime 规格，不是 raw 规格。

## 验证清单

- `node --check game.js`
- `git diff --check`
- 预览 `idle.png`、`attack.png`、`cast.png`、`hurt.png`
- 浏览器中检查待机、移动、攻击、施法、受击、死亡
- 确认脚点稳定，武器和法术特效向外延展时不反向推动身体
- 确认非该角色模型、地图特效和 DiceBox 没有变化

## 常见错误

- 使用透明 bbox 居中：会让宽动作看起来像角色后退。
- 直接使用超大 raw sheet：可能导致浏览器播放异常或性能下降。
- 忘记 cache 参数：浏览器会继续加载旧素材。
- 缺失动作未 fallback：运行时会退回错误动作或默认 idle。
- 只看静态预览不做浏览器烟测：实际 SVG 重建和播放路径可能暴露新问题。
