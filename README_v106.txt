无限制角斗场 v106 Token / Trap / Turret 补丁

这版基于 v105 继续补：
1. insert_negative_card_into_target_deck 新增距离字段
2. 新模板 create_map_token
   - trap_once_negative：一次性陷阱，触发后可插入负面牌
   - permanent_pillar：永久柱体，会阻挡并形成危险区
   - auto_turret：自动炮塔，持续若干回合自动攻击
3. 游戏层支持地图 token
   - 放置
   - 渲染
   - 进入触发
   - 回合开始炮塔自动攻击
