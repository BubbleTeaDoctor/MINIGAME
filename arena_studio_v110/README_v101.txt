无限制角斗场 v101 阈值被动修正

这版只修一个核心问题：
threshold_reward_once_per_turn 无法实现“造成伤害超过 3 点时，再进行一次普通攻击，每回合一次”。

修正内容：
1. threshold_reward_once_per_turn 现在兼容旧字段：
   - thresholdValue
   - threshold
   - damageThreshold
2. thresholdType 兼容别名：
   - dealt_damage
   - damage
   - raw_damage
   - 造成伤害
3. extra_basic_cap 奖励现在会在被动触发当下，直接返还已消耗的普通攻击次数；
   不只是增加上限。
