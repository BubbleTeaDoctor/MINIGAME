# 职业设计补全 v0.8.0

本文档补全四个已有职业：牧师、萨满、死灵法师、木士，并从零设计一个全新职业：猎人。

统一前提：
- 每个职业标准牌组 = 11 张功能牌 + 4 张格挡牌 = 15 张
- 当前行动经济：
  - 每回合 1 次职业/守护神技能
  - 每回合 1 次武器/饰品技能
  - 每回合 1 次移动
  - 每回合 1 次普通攻击
  - 每回合抽 3 张，空牌库时洗回弃牌堆
- 未写明持续时间的 buff，默认永久直到被消耗
- 近战职业默认移动 5，远程/施法职业默认移动 3

---

## 1. 牧师 Priest

### 职业定位
治疗、护盾、持续神圣/暗影消耗、节奏运营。

### 基础属性
- 生命：54
- 移动：3
- 格挡牌：4 张 1D4 格挡

### 核心机制：信念 Faith
- 当你使用牧师职业牌产生“治疗”或“授予格挡”时，获得 1 点 Faith，最多 3 点。
- 每回合第一次使用牧师职业牌时，可以选择消耗全部 Faith 强化该牌：
  - 若该牌为伤害牌：额外 +Faith 点伤害
  - 若该牌为治疗牌：额外 +Faith 点治疗
  - 若该牌为护盾牌：额外 +Faith 点格挡
- 结算后 Faith 清零。

### 被动
- 维持原本手感，但更职业化：
  - 每当你完成一次治疗或授予格挡，获得 1 点 Faith（最多 3）
  - 每回合第一次牧师职业牌可消耗全部 Faith 强化

### 技能卡组（11）
1. 惩戒 Smite ×2  
   - 直伤模板
   - 4 格，1D8 神圣伤害
   - 若消耗 Faith，则额外 +Faith 伤害

2. 治疗 Heal ×2  
   - 治疗模板
   - 4 格，恢复 1D8 生命
   - 若消耗 Faith，则额外 +Faith 治疗

3. 痛苦 Pain ×2  
   - 直伤 + DOT 模板
   - 5 格，造成 1D4 暗影伤害
   - 并附加 DOT：每回合开始 1D4，持续 2 回合

4. 神圣护盾 Holy Shield ×2  
   - 护盾模板
   - 4 格，使目标获得 1D8 格挡
   - 若消耗 Faith，则额外 +Faith 格挡

5. 沉默 Silence ×1  
   - 控制模板
   - 4 格，造成 1D4 伤害，并使目标下回合不能使用职业/守护神技能

6. 圣化 Sanctify ×2  
   - AOE 混合模板
   - 施法距离 2，半径 1
   - 区域内敌人受到 1D6 神圣伤害，自己恢复 1D6 生命

### 设计特色
- 不是单纯奶妈，而是“用护盾和治疗蓄能，再把关键一张职业牌强化”
- 神圣与暗影并存，兼具续航与压制

---

## 2. 萨满 Shaman

### 职业定位
元素附魔、武器强化、节奏爆发、状态压制。

### 基础属性
- 生命：58
- 移动：3
- 格挡牌：4 张 1D4 格挡

### 核心机制：武器附魔 Imbue
- 萨满可以给自己的“接下来若干次普通攻击”附加元素效果。
- 元素附魔默认不按回合结束消失，而是按“攻击次数”消耗。

### 被动
- 每回合第一次普通攻击附带 1D4 点燃，持续 2 回合。

### 技能卡组（11）
1. 震击 Shock ×3  
   - 直伤 + 减速模板
   - 4 格，1D6 伤害，并减速 1 回合

2. 风怒 Windfury ×2  
   - 武器附魔模板（新概念）
   - 你的接下来 2 次普通攻击各额外造成 1D4 伤害
   - 且本回合普通攻击次数 +1

3. 火舌 Flametongue ×2  
   - 武器附魔模板
   - 你的接下来 2 次普通攻击额外附加 1D6 点燃伤害

4. 大地之盾 Earth Shield ×2  
   - 护盾模板
   - 自己获得 1D8 格挡
   - 在格挡被打掉前，第一次受到攻击时反弹 1D4 伤害

5. 嗜血术 Bloodlust ×2  
   - 团队/自身强化模板（当前 1v1 先按自身）
   - 自己接下来 2 次普通攻击 +2 伤害
   - 并额外获得 1 格移动直到下回合开始

### 设计特色
- 萨满的核心不是法术直伤本身，而是“先附魔，再靠武器/普攻结算爆发”
- 与不同武器搭配时会有很不一样的表现

### 新概念模板建议
- weapon_imbue_for_next_n_attacks
  - fields: imbueEffect, attackCount, extraDamage, applyStatus, bonusMove, bonusAttackCap

---

## 3. 死灵法师 Necromancer

### 职业定位
亡灵累积、牌库感染、炸弹、延迟爆发。

### 基础属性
- 生命：60
- 移动：3
- 格挡牌：4 张 1D4 格挡

### 核心机制：亡灵激活 + 埋骨炸弹
- 部分技能会把“亡灵牌”洗入自己的牌库，抽到后转为已激活亡灵，放入展示区。
- 已激活亡灵会增强你的防御和部分法术。
- 另一部分技能会把“炸弹牌”洗入对手牌库，对手抽到即爆炸。

### 被动
- 回合开始时，按你已激活亡灵数量获得格挡：ceil(亡灵数 / 2)

### 技能卡组（11）
1. 召唤骷髅 ×2  
   - 插牌模板
   - 向自己的牌库洗入 1 张 undead_skeleton_token
   - 抽到后转为 1 个已激活亡灵

2. 召唤骨龙 ×1  
   - 插牌模板
   - 向自己的牌库洗入 1 张 undead_bonedragon_token
   - 抽到后转为 2 个已激活亡灵

3. 骨矛 Bone Spear ×2  
   - 直伤模板
   - 5 格，1D10 伤害

4. 亡灵爆发 Grave Burst ×2  
   - AOE 模板
   - 施法距离 3，半径 1，造成 2D4 伤害
   - 若你有至少 2 个已激活亡灵，则额外 +1D4

5. 骨盾 Bone Shield ×2  
   - 护盾模板
   - 自己获得 1D8 格挡

6. 埋骨炸弹 Grave Bomb ×2  
   - 负面插牌模板
   - 4 格，命中后向对方牌库洗入 1 张 necro_bomb_token
   - 对方抽到时：造成 2D6 伤害，并减速 1 回合

### 设计特色
- 这套职业的强度不完全在“手里这张牌”，而在“你之前往牌库里埋了什么”
- 会形成明显的延迟启动和感染压制手感

### 新概念模板建议
1. insert_summon_token_into_self_deck
   - 把 token 洗入自己牌库，抽到后进入展示区并视为激活
2. activated_token_scaling_spell_bonus
   - 按展示区 token 数量强化职业牌
3. insert_negative_card_into_target_deck
4. negative_card_trigger_on_draw

---

## 4. 木士 Warlock

### 职业定位
以血换牌、诅咒、吸血、持续压制。

### 基础属性
- 生命：56
- 移动：3
- 格挡牌：4 张 1D4 格挡

### 核心机制：灵魂碎片 Soul Shard
- 当任意单位因你的职业 DOT 受到伤害时，你获得 1 枚 Soul Shard，最多 3。
- 你的部分职业牌可以消耗 Soul Shard 获得强化。

### 被动
- 每回合一次，你可以失去 4 点生命，额外抽 1 张牌。

### 技能卡组（11）
1. 灵魂火 Soul Fire ×2  
   - 直伤模板
   - 4 格，1D10 伤害
   - 若消耗 1 枚 Soul Shard，则额外 +1D4

2. 暗夜冲刺 Night Rush ×2  
   - 位移模板
   - 传送到 4 格内空位
   - 若消耗 1 枚 Soul Shard，则下次职业牌 +2 伤害

3. 腐蚀 Corrode ×2  
   - 直伤 + DOT 模板
   - 5 格，1D4 伤害
   - 并附加 DOT：每回合开始 1D4，持续 3 回合

4. 吸血 Drain Life ×2  
   - 直伤 + 吸血模板
   - 4 格，1D6 伤害
   - 造成的有效伤害中，一半（向上取整）转化为治疗

5. 暗影烈焰 Shadowflame ×2  
   - AOE + DOT 模板
   - 施法距离 2，半径 1，造成 2D6 伤害
   - 被命中的目标附加 DOT：每回合开始 1D4，持续 2 回合

6. 黑暗契约 Dark Pact ×1  
   - 资源模板
   - 失去 4 点生命，抽 2 张牌，并获得 1 枚 Soul Shard

### 设计特色
- 木士比牧师更极端，是典型的“先亏血再靠吸血和卡差把局面拉回来”
- 诅咒和 DOT 是主要赢法之一

### 新概念模板建议
- gain_resource_when_dot_ticks
  - fields: resourceType, maxValue, gainAmount, triggerTiming
- spend_resource_to_empower_class_skill
  - fields: resourceType, spendAmount, bonusDamage, bonusEffect
- life_payment_for_draw

---

## 5. 全新职业：猎人 Hunter

### 职业定位
标记、追猎、陷阱、远程斩杀。

### 基础属性
- 生命：52
- 移动：3
- 格挡牌：4 张 1D4 格挡

### 核心机制：猎印 Mark
- 部分猎人技能会给目标施加“猎印”。
- 被标记的目标在第一次受到你的普通攻击、职业伤害牌或陷阱伤害时，会触发“猎印收益”，然后标记被移除。

### 被动：追猎本能
- 每回合第一次你命中被标记目标时：
  - 额外造成 +2 伤害
  - 并抽 1 张牌
  - 然后移除该目标身上的猎印

### 技能卡组（11）
1. 猎人印记 Hunter's Mark ×2  
   - 新模板：mark_target_for_bonus
   - 6 格，给目标施加猎印，持续直到被触发或目标被击败

2. 瞄准射击 Aimed Shot ×2  
   - 直伤模板
   - 6 格，1D8 伤害
   - 若目标带有猎印，则额外 +1D6

3. 奥术射击 Arcane Shot ×2  
   - 直伤模板
   - 5 格，1D6+1 伤害
   - 若目标带有猎印，则改为 1D10+1

4. 逃脱 Disengage ×2  
   - 位移模板
   - 向 3 格内空位位移
   - 若你与任一敌人相邻，则额外再移动 1 格

5. 束缚陷阱 Snare Trap ×2  
   - 陷阱模板
   - 在 3 格内放置陷阱
   - 首个踩中的目标受到 1D4 伤害，并定身 1 回合

6. 杀戮命令 Kill Command ×1  
   - 终结模板
   - 5 格，造成 2D8 伤害
   - 若目标带有猎印，则额外 +2，并抽 1 张牌

### 设计特色
- 猎人不靠站桩拼脸，而是“先印记，再用射击或陷阱兑现”
- 既有远程压制，又有控制区域的能力
- 和长弓、匕首、甚至陷阱饰品都会有很强联动

### 猎人的新概念模板
1. mark_target_for_bonus
- label: 标记目标
- description: 给目标施加一种可被后续攻击/陷阱消耗的标记
- fields:
  - markType
  - durationMode (until_consumed / turn_limited)
  - durationTurns
  - consumeOn

2. bonus_if_target_marked
- label: 若目标被标记则获得额外收益
- fields:
  - bonusDamage
  - bonusDraw
  - bonusMove
  - consumeMark

3. trap_with_mark_interaction
- label: 陷阱与标记联动
- fields:
  - damage
  - applyControl
  - ifTargetMarkedBonus

4. move_then_attack_if_marked
- label: 若目标被标记则位移或补刀
- fields:
  - moveDistance
  - bonusDamage
  - consumeMark

---

## 6. 模板层总结建议
为了后续编辑器更强，建议把本次设计抽成以下高复用模板：

### 现有模板可直接复用
- direct_damage
- self_buff
- teleport
- aoe
- dash_hit
- insert_negative_card_into_target_deck
- negative_card_trigger_on_draw
- dot_damage_over_time
- slow_status
- control_status

### 建议新增模板
1. mark_target_for_bonus
2. bonus_if_target_marked
3. weapon_imbue_for_next_n_attacks
4. insert_summon_token_into_self_deck
5. activated_token_scaling_spell_bonus
6. gain_resource_when_dot_ticks
7. spend_resource_to_empower_class_skill
8. silence_bucket_lock

---

## 7. 推荐优先实现顺序
1. 牧师与萨满
- 因为逻辑最直接，模板复用高

2. 木士
- 因为 DOT、吸血、以血换牌可以顺手完善资源模板

3. 死灵法师
- 因为涉及 token、展示区、埋炸弹，系统改动最大

4. 猎人
- 作为全新职业，等标记模板做好后一次性接入
