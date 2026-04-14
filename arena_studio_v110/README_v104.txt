无限制角斗场 v104 阈值被动修正

这版只修 threshold_reward_once_per_turn：

1. 编辑器保存时会规范化配置
- thresholdType 统一保存为 dealt_damage
- thresholdValue / threshold / damageThreshold 同步为同一个数值

2. 对局开局时再次规范化规则
- 兼容 effective_damage / 造成伤害 / damage / raw_damage

3. battle log / debug log 继续保留
- 方便定位阈值被动是否真正进入检查链路
