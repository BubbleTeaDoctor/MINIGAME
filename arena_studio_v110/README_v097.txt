无限制角斗场 v097 编辑器修正补丁

这版只修编辑器和模板定义层：

1. 阈值触发奖励
- thresholdType 新增：dealt_damage（造成伤害）
- rewardList 改为 reward-list 菜单编辑，而不是 JSON

2. 造成伤害后获得多重增益
- 基础伤害字段改为 baseDamage
- 阈值字段明确为“造成伤害阈值”
- rewardList 改为 reward-list 菜单编辑

3. 奖励列表菜单化补强
- rewardType 继续使用下拉菜单
- cardKey 改成卡牌下拉菜单
- origin 使用下拉菜单

4. 新建职业入口
- 编辑器新增“新建职业 / New Profession”按钮
- 创建后自动生成一个默认被动和一个默认技能，方便继续编辑
