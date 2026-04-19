无限制角斗场 v107 编辑器入口补丁

这版基于 v106 继续补：
1. insert_negative_card_into_target_deck 的距离字段真正接进编辑器模板
2. 修正 v104-v106 补丁脚本加载顺序，确保编辑器能看到最新模板字段
3. 编辑器新增：
   - 新建武器 / New Weapon
   - 新建饰品 / New Accessory
4. 新建武器会生成默认 basic attack 结构
5. 新建饰品会生成空 cards 列表，方便继续添加饰品卡
