无限制角斗场 v095 规则与编辑器补丁

这版修复与新增：
1. 风暴打击编辑生效兜底
   - 开局时会把 profession.cards 同步回 cardLibrary
   - 避免旧 cardLibrary 覆盖职业卡编辑结果
2. 尖刺柱重排
   - 尖刺柱之间距离拉大
3. 尖刺危险区显示
   - 尖刺周围 1 格会在棋盘上显示危险区标记
4. 变身模板补全
   - 新增 durationTurns
   - 支持 end_of_turn + 持续回合数
5. 术士支付生命值抽卡
   - 游戏工具栏新增职业被动按钮（适用于术士当前被动）
6. 伤害字段支持“武器伤害”
   - 编辑器里 damage / baseDamage / bonusDamage / damagePerTick 都可以选 weapon_damage
7. rewardList 奖励类型补全
   - 新增 bonus_die / extra_basic_cap / spell_immune 等选项
