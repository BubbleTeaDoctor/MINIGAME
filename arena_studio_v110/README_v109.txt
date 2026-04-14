无限制角斗场 v109 模板字段修正

这版修正的是“旧规则副本模板 fields 覆盖新模板 fields”的问题。

结果：
1. insert_negative_card_into_target_deck 现在会真正显示：
   - 距离
   - 插入负面牌
   - 数量
   - 触发条件
   - 是否洗入牌库

2. create_map_token 的字段也会稳定显示

3. 运行时 mergeRulesetDataWithBase 改成：
   - templates / statuses 使用最新 base fields
   - templateDefaults 继续合并旧配置数值
