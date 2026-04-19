无限制角斗场 v110 卡组编辑器

这版在 v109 稳定线上新增一个独立页面：
- deck_editor.html
- deck_editor.js

用途：
1. 编辑职业卡组：每张职业卡放几张
2. 编辑武器卡组：每张武器卡放几张
3. 编辑饰品卡组：每张饰品卡放几张
4. 编辑职业基础状态：
   - 名称
   - 生命值
   - 移动距离
   - 移动预设
5. 编辑武器基础攻击：
   - 名称
   - 伤害
   - 射程
   - 直线
   - 类型

同时 game.js 已支持新的 deckCounts 结构：
- profession.deckCounts
- weapon.deckCounts
- accessory.deckCounts

旧规则仍兼容：
- 如果没有 deckCounts，则沿用旧逻辑
