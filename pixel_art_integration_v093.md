# Pixel Art Integration v0.9.3

本文件定义像素风素材在 Studio 主包中的技术接入规范。

---

## 1. 核心目标

后期切换到 2D 像素风后，必须保证：
- 像素图不被浏览器模糊插值
- 地图、角色、状态、特效分层清楚
- 技能 overlay 不遮挡角色与格子辨识
- 动画帧切换后仍保持整数倍缩放

一句话：
**先保证清晰，再保证好看。**

---

## 2. 推荐目录结构

```text
assets/
  board/
    tiles/
    overlays/
    hazards/
  units/
    warrior/
    mage/
    rogue/
    swordsman/
    priest/
    shaman/
    necro/
    warlock/
    hunter/
  summons/
    skeleton/
    bone_dragon/
  ui/
    card_frames/
    icons/
    panels/
    fonts/
  fx/
    hit/
    cast/
    projectile/
    status/
```

---

## 3. 推荐命名规范

### 地图
- `tile_plain_a.png`
- `tile_plain_b.png`
- `tile_black_hole.png`
- `tile_spike_a.png`
- `overlay_move.png`
- `overlay_attack.png`
- `overlay_cast.png`
- `overlay_aoe.png`
- `overlay_dash_landing.png`

### 单位
- `warrior_idle_0.png`
- `warrior_idle_1.png`
- `warrior_attack_0.png`
- `mage_cast_0.png`
- `hunter_idle_0.png`

### 状态 / 展示区
- `icon_burn.png`
- `icon_slow.png`
- `icon_mark_normal.png`
- `icon_mark_empowered.png`
- `icon_skeleton.png`
- `icon_bone_dragon.png`
- `icon_necro_bomb.png`

### UI
- `card_frame_common.png`
- `card_source_profession.png`
- `card_source_weapon.png`
- `card_source_accessory.png`
- `card_source_guardian.png`
- `card_source_negative.png`

---

## 4. 显示与缩放规范

### 浏览器 / Canvas / DOM 显示要求
必须使用最近邻缩放：

CSS 建议：
```css
.pixel-art {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

### 缩放规则
- 优先使用整数倍缩放
- 不建议 1.25x、1.5x 这类非整数倍
- 推荐：2x / 3x / 4x

### 逻辑尺寸和绘制尺寸分离
建议：
- 逻辑 tile size：48
- 美术绘制 tile：64 或 72
- 角色 sprite：48 或 64
- UI 图标：16 / 24 / 32

原因：
- 逻辑碰撞和高亮继续按 48 左右的规则格工作
- 美术可以适度溢出格边，画面会更丰富

---

## 5. 推荐渲染层级

从下到上建议分层：

1. `board_base`
- 普通地格

2. `board_hazard`
- 黑洞、尖刺、陷阱底层

3. `board_overlay`
- 移动高亮、攻击高亮、AOE 预览、落点预览

4. `units`
- 玩家与敌方单位本体

5. `unit_fx`
- 角色施法、命中、小型特效

6. `status_icons`
- 单位头顶或侧边状态 chip

7. `floating_numbers`
- 伤害数字、治疗数字

8. `ui_panels`
- 手牌、日志、展示区、状态面板

### 特别注意
- overlay 必须在单位下方或半透明叠层，不可吃掉角色轮廓
- status icon 不能盖住角色本体关键 silhouette

---

## 6. 棋盘与单位对位规范

### 推荐锚点
- 地格 sprite 锚点：中心底对齐
- 单位 sprite 锚点：脚底中心对齐到 hex 中心偏下

### 为什么这样做
如果单位完全中心摆放，容易显得漂浮。稍微偏下更像站在地上。

### Dash / Teleport 预览
- 冲锋落点高亮使用独立 overlay
- 传送目标高亮与移动高亮复用同一套 tile overlay

---

## 7. 动画接入规范

### 建议的最小动画字段
每个单位后期可以统一按：
```json
{
  "idle": ["idle_0", "idle_1"],
  "move": ["move_0", "move_1", "move_2", "move_3"],
  "attack": ["attack_0", "attack_1", "attack_2", "attack_3"],
  "cast": ["cast_0", "cast_1", "cast_2", "cast_3"],
  "hit": ["hit_0", "hit_1"],
  "death": ["death_0", "death_1", "death_2"]
}
```

### 早期 demo 可降级
如果资源不够，第一阶段只要：
- `idle`
- `attack`
- `cast`

---

## 8. UI 与卡牌接入规范

### 手牌
每张卡需要支持这些图层：
1. 卡框
2. 来源标签
3. 模板标签
4. 名称
5. 数值/文本
6. 双模式角标

### 来源标签必须保留
这是你前面特别指出过的问题，所以美术接入时必须预留：
- 职业技能
- 武器技能
- 饰品技能
- 守护神技能
- 负面牌

### 双模式卡
- 建议额外加一个 `MODE` 或“双模式”角标小徽记
- 真正选择模式仍使用按钮，不要只靠美术提示

---

## 9. 展示区与状态图标规范

### 展示区
对于死灵法师和猎人，展示区必须能承载：
- 骷髅数量
- 骨龙数量
- 埋骨炸弹
- 普通猎印 / 强化猎印（可在单位状态区显示）

### 推荐显示方式
- 图标 + 数字计数
- 不用长文字
- 数字应可直接刷新

### 状态 icon 推荐优先级
优先做：
- burn
- slow
- disarm
- sheep
- root
- stun
- silence
- shield
- mark_normal
- mark_empowered

---

## 10. 数据与素材绑定建议

后期建议新增一个统一索引文件，例如：

```json
{
  "units": {
    "warrior": {
      "idle": ["assets/units/warrior/warrior_idle_0.png", "assets/units/warrior/warrior_idle_1.png"],
      "attack": ["..."]
    }
  },
  "icons": {
    "burn": "assets/ui/icons/icon_burn.png",
    "mark_normal": "assets/ui/icons/icon_mark_normal.png"
  },
  "board": {
    "plain": ["assets/board/tiles/tile_plain_a.png", "assets/board/tiles/tile_plain_b.png"],
    "black_hole": "assets/board/hazards/tile_black_hole.png"
  }
}
```

这样以后：
- 换美术不需要改逻辑
- 逻辑只认 key
- 资源映射只认文件路径

---

## 11. 技术接入顺序建议

### 第一步
先接静态素材：
- 地格
- 高亮 overlay
- 职业占位图
- 状态 icon
- 展示区 icon

### 第二步
再接低帧动画：
- idle
- attack
- cast

### 第三步
最后接复杂 FX：
- 黑洞脉冲
- 召唤激活
- 标记应用 / 消耗
- 大范围爆发

原因：
先把静态资源接进去，游戏观感会立即提升，而且不依赖完整动画系统。

---

## 12. 当前项目最适合的技术结论

当前最合理的路线不是立刻做大量完整像素动画，而是：

1. 先把逻辑主包稳定下来
2. 先接第一批静态像素素材
3. 再逐步把单位动画和技能特效补进去

一句话总结：
**先接静态像素底，再逐步动画化。**
