无限制角斗场 v094 修正补丁

这版修了四件事：
1. 风暴打击编辑后仍不生效：编辑器现在会把职业卡同步写入 cardLibrary，避免同 key 旧定义覆盖。
2. 新增模板 transform_basic_attack：变身后可改变普攻模式、射程、伤害和附带状态。
3. 尖刺柱周围 1 格改为危险区域：进入这些格子同样会受到尖刺伤害。
4. damage_then_multi_buff / grant_multiple_buffs 的编辑器字段补全：
   - damage_then_multi_buff 增加 threshold
   - rewardList 改成可编辑奖励列表，而不是只能手写 JSON。
