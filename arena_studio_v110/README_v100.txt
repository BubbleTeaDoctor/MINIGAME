无限制角斗场 v100 编辑器与被动修正

这版修复：
1. rewardList 的“奖励类型”现在会显示为真正的下拉菜单。
   根因是 makeInput 只检查 key，不检查 type；rewardList 里 key=type，所以之前一直退回文本框。
2. cardKey 增加了空值选项（空）。
3. damage_roll_grant_card 的“返还普通攻击次数”修正为真正减少 basicSpent，而不是写错字段。
4. 新增自动被动触发：
   - threshold_reward_once_per_turn
   - damage_then_multi_buff
   现在可以用于“武僧：造成超过 3 点伤害时，本回合再获得一次普通攻击”这种被动。

推荐武僧被动配置：
- 模板：threshold_reward_once_per_turn
- 阈值类型：造成伤害
- 阈值数值：3
- 奖励列表：extra_basic_cap = 1
- 每回合一次：true
