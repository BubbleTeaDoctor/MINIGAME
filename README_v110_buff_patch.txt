v110 buff patch

已新增到 self_buff / 双模式中的增益字段：
1. dodgeNext = 闪避下一次伤害
2. counterDamage = 反击固定伤害
3. counterUseTakenDamage = 反击等于本次实际受伤
4. classSkillCapDelta = 本回合额外职业技能卡次数
5. reactiveMoveTrigger = on_targeted / on_damaged
6. reactiveMoveMaxDistance = 随机位移最大距离，0 表示不限
7. healOnDamaged = 受伤后自疗
8. disarmAttackerOnHit = 被攻击后缴械对手若干回合

运行时已支持：
- 闪避会抵消下一次伤害
- 反击会在实际受伤后结算
- 额外职业卡次数会临时突破回合限制，并在回合结束清空
- on_targeted 随机位移会在被选为目标时触发，若脱离射程/直线则攻击落空
- on_damaged 随机位移会在实际受伤后触发
- 受伤自疗会在受伤后立刻恢复
- 被攻击后缴械会在实际受伤后施加给攻击者
- 负面牌与范围伤害也会走新的伤害结算流程
