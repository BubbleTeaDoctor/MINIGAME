无限制角斗场 v092（基于 v091a 稳定线）

这版只在 v091a 上增量补这些内容：
1. 编辑器：
   - 可直接修改卡牌描述 text
   - 可直接修改职业被动描述 text
   - 双模式编辑中的 templateRef 改成下拉菜单
   - 补充更多 FIELD_OPTIONS（如 until_triggered、next_basic_attack_or_class_skill、refresh_duration）
2. 新模板：
   - damage_then_multi_buff
   - damage_roll_grant_card
3. 萨满：
   - 风暴打击改成触发型：造成伤害后掷 1d6，3+ 获得一张风暴打击并返还职业卡行动桶
4. 地图碰撞：
   - 尖刺柱现在视为阻挡地块
   - 人物仍占据地块，不能穿过
   - 传送/黑洞牵引/移动都不会落到尖刺柱上

说明：
这版仍然以 arena_studio_v091a_index_link_fix_bundle 为稳定基线。
