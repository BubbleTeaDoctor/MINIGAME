无限制角斗场 v103 阈值被动与日志导出修正

这版修两类问题：

1. threshold_reward_once_per_turn 仍不触发
- 新增 getProfessionPassives(player) 明确从当前职业的 passives 里读取被动
- applyDamageTriggeredPassives 现在会把进入检查、被动列表、阈值比较结果写入 battle log 和 debug log
- 若没有读到任何职业被动，会直接在战斗日志显示“没有可检查的职业被动”

2. 日志导出
- 新增按钮：
  - 导出战斗日志
  - 导出运行诊断
- 运行诊断会导出：
  - 当前规则副本 ID / 名称
  - 当前玩家与双方状态
  - 当前职业被动配置
  - battleLog
  - debugLog
  - window error / unhandledrejection 记录

建议：
如果武僧被动还是不触发，请把“运行诊断”导出的 JSON 发回来。
