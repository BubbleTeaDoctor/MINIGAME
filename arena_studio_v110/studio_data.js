
window.DEFAULT_STUDIO_DATA = {
  version: "0.7.9",
  templates: {
    direct_damage: { label: "直接伤害", desc: "对单体造成伤害，可附带状态。", fields: [["damage","伤害骰","text"],["range","距离","number"],["target","目标类型","text"],["spell","是否法术","boolean"],["straight","是否直线","boolean"]] },
    self_buff: { label: "自身增益", desc: "默认永久存在，直到被消耗。现在也支持闪避、反击、额外职业卡次数、受击随机位移、受伤自疗、受击缴械。", fields: [["buffBasic","普攻加值","number"],["bonusDie","额外骰子","text"],["heal","恢复数值","text"],["block","格挡骰","text"],["dodgeNext","闪避下一次伤害","boolean"],["counterDamage","反击固定伤害","text"],["counterUseTakenDamage","反击=所受伤害","boolean"],["classSkillCapDelta","职业技能额外次数","number"],["reactiveMoveTrigger","随机位移触发时机","reactiveMoveTrigger"],["reactiveMoveMaxDistance","随机位移最大距离(0=不限)","number"],["healOnDamaged","受伤后自疗","text"],["disarmAttackerOnHit","被攻击后缴械回合","number"],["consumeOn","何时消耗","text"],["durationTurns","持续回合","number"],["basicAttackCapDelta","普攻次数改变量","number"]] },
    teleport: { label: "位移/传送", desc: "移动到指定距离内空位。", fields: [["range","位移距离","number"],["target","目标类型","text"]] },
    aoe: { label: "范围伤害", desc: "对范围内多个目标生效。", fields: [["damage","伤害骰","text"],["range","施法距离","number"],["radius","半径","number"],["spell","是否法术","boolean"]] },
    dash_hit: { label: "冲锋并攻击", desc: "贴近目标后造成伤害。", fields: [["damage","伤害骰","text"],["range","冲锋距离","number"],["gainBlock","获得格挡","text"],["buffBasic","下次普攻加值","number"]] },
    dual_mode: { label: "双模式技能", desc: "一张卡在使用时弹出两个模式供选择。", fields: [["modes","模式列表","modes"]] },
    insert_negative_card_into_target_deck: { label: "埋炸弹/插负面牌", desc: "向目标牌库加入负面牌。", fields: [["insertCardKey","插入牌 key","text"],["insertCount","数量","number"],["triggerCondition","触发条件","text"],["shuffleIntoDeck","是否洗入牌库","boolean"]] },
    threshold_reward_once_per_turn: { label: "阈值触发奖励", desc: "每回合首次达到阈值时获得奖励。", fields: [["thresholdType","阈值类型","text"],["thresholdValue","阈值数值","number"],["rewardList","奖励列表","json"],["oncePerTurn","每回合一次","boolean"]] },
    movement_threshold_restricts_bucket: { label: "移动阈值限制技能", desc: "超过阈值后限制特定技能桶。", fields: [["threshold","阈值","number"],["affectedBuckets","受影响桶","json"],["timing","触发时机","text"],["exceptionBuckets","例外技能桶","json"]] },
    control_bonus_on_basic_attack: { label: "受控目标追加伤害", desc: "普攻命中受控目标时额外造成伤害。", fields: [["requiredTargetState","目标状态","json"],["bonusDamage","追加伤害","text"],["attackType","攻击类型","text"]] },
    heal_counter_bonus: { label: "累计治疗触发", desc: "累计治疗次数后获得额外恢复。", fields: [["counterName","计数器名称","text"],["triggerEvery","每多少次触发","number"],["bonusHeal","额外治疗","text"]] },
    weapon_basic_inflicts_status: { label: "普攻附带状态", desc: "普通攻击附带 DOT 或状态。", fields: [["statusType","状态类型","text"],["statusValue","状态数值","text"],["durationTurns","持续回合","number"]] },
    activated_token_scaling_block: { label: "已激活 token 提供格挡", desc: "按 token 数量提供格挡。", fields: [["tokenType","token 类型","text"],["ratio","比例","number"],["rounding","取整方式","text"],["rewardType","奖励类型","text"]] },
    life_for_card_draw_once_per_turn: { label: "支付生命抽牌", desc: "每回合可支付生命额外抽牌。", fields: [["lifeCost","生命消耗","number"],["drawCount","抽牌数量","number"],["oncePerTurn","每回合一次","boolean"]] },
    skip_basic_attack_then_gain_bonus: { label: "未普攻获得增益", desc: "本回合未普攻，则下次获得伤害加成。", fields: [["checkAt","检查时机","text"],["bonusType","加成类型","text"],["bonusValue","加成数值","number"],["consumeOn","何时消耗","text"]] }
  },
  statuses: {
    none: { label: "无" },
    dot_damage_over_time: { label: "DOT", fields: [["damagePerTick","每跳伤害","text"],["tickTiming","触发时机","text"],["durationTurns","持续回合","number"],["stackRule","叠加规则","text"]] },
    slow_status: { label: "减速", fields: [["moveMultiplier","移动倍率","number"],["rounding","取整方式","text"],["durationTurns","持续回合","number"]] },
    control_status: { label: "控制", fields: [["controlType","控制类型","text"],["durationTurns","持续回合","number"],["isControlTag","是否控制标签","boolean"]] },
    negative_card_trigger_on_draw: { label: "抽到触发负面牌", fields: [["onDrawEffect","抽到时效果","text"],["damage","伤害骰","text"],["showInPreview","是否展示","boolean"]] }
  },
  templateDefaults: {
    direct_damage: { damage: "1d6", range: 1, target: "enemy", spell: false, straight: false },
    self_buff: { buffBasic: 0, bonusDie: "", heal: "", block: "", dodgeNext: false, counterDamage: "", counterUseTakenDamage: false, classSkillCapDelta: 0, reactiveMoveTrigger: "", reactiveMoveMaxDistance: 0, healOnDamaged: "", disarmAttackerOnHit: 0, consumeOn: "next_basic_attack", durationTurns: null, basicAttackCapDelta: 0 },
    teleport: { range: 3, target: "tile" },
    aoe: { damage: "2d4", range: 2, radius: 1, spell: true },
    dash_hit: { damage: "1d6", range: 3, gainBlock: "", buffBasic: 0 },
    dual_mode: { modes: [{ name: "模式1", templateRef: "direct_damage", damage: "1d6", range: 1, consumeOn: "" }, { name: "模式2", templateRef: "self_buff", buffBasic: 2, consumeOn: "next_basic_attack" }] },
    insert_negative_card_into_target_deck: { insertCardKey: "bomb_token", insertCount: 1, triggerCondition: "on_hit", shuffleIntoDeck: true },
    threshold_reward_once_per_turn: { thresholdType: "effective_damage", thresholdValue: 4, rewardList: [{ type: "gain_block", value: 2 }], oncePerTurn: true },
    movement_threshold_restricts_bucket: { threshold: 3, affectedBuckets: ["class_or_guardian"], timing: "after_move_before_class_skill", exceptionBuckets: ["weapon_or_accessory"] },
    control_bonus_on_basic_attack: { requiredTargetState: ["slow"], bonusDamage: "1d4", attackType: "basic_attack" },
    heal_counter_bonus: { counterName: "heal_count", triggerEvery: 4, bonusHeal: "1d6" },
    weapon_basic_inflicts_status: { statusType: "burn", statusValue: "1d4", durationTurns: 2 },
    activated_token_scaling_block: { tokenType: "undead_token", ratio: 0.5, rounding: "ceil", rewardType: "gain_block_each_turn" },
    life_for_card_draw_once_per_turn: { lifeCost: 4, drawCount: 1, oncePerTurn: true },
    skip_basic_attack_then_gain_bonus: { checkAt: "end_of_turn", bonusType: "flat_damage", bonusValue: 5, consumeOn: "next_basic_attack_or_class_skill" }
  },
  ruleDefaults: { drawPerTurn: 3, meleeMove: 5, rangedMove: 3, buckets: { class_or_guardian: 1, weapon_or_accessory: 1, move: 1, basic_attack: 1, block: 1 } },
  weaponLibrary: {
    greatsword: { key: "greatsword", name: "巨剑", basic: { name: "巨剑普攻", damage: "2d6", range: 1, straight: false, type: "近战" }, cards: ["greatsword_crush","weapon_charge"] },
    longbow: { key: "longbow", name: "长弓", basic: { name: "长弓普攻", damage: "1d6", range: 6, straight: true, type: "远程直线" }, cards: ["bow_pin","bow_step"] },
    dagger: { key: "dagger", name: "匕首", basic: { name: "匕首普攻", damage: "2d4", range: 1, straight: false, type: "近战" }, cards: ["dagger_step","dagger_poison"] }
  },
  accessoryLibrary: {
    lincoln: { key: "lincoln", name: "林肯法球", cards: ["acc_nullify"] },
    trapbag: { key: "trapbag", name: "口袋陷阱", cards: ["acc_trap"] },
    hope: { key: "hope", name: "希望曙光", cards: ["acc_hope"] }
  },
  cardLibrary: {
    greatsword_crush: { name: "碾压打击", source: "武器技能", template: "direct_damage", config: { damage: "1d6+1", range: 1, target: "enemy" }, text: "近战造成 1D6+1 伤害。" },
    weapon_charge: { name: "武器冲锋", source: "武器技能", template: "dash_hit", config: { damage: "1d6", range: 3, buffBasic: 0 }, text: "冲向目标造成 1D6 伤害。" },
    bow_pin: { name: "钉刺射击", source: "武器技能", template: "direct_damage", config: { damage: "1d4", range: 6, target: "enemy", straight: true, apply: { slow: 1 } }, text: "直线 1D4 伤害并减速。" },
    bow_step: { name: "滑步", source: "武器技能", template: "teleport", config: { range: 2, target: "tile" }, text: "移动到 2 格内空位。" },
    dagger_step: { name: "滑步", source: "武器技能", template: "teleport", config: { range: 2, target: "tile" }, text: "移动到 2 格内空位。" },
    dagger_poison: { name: "毒刃", source: "武器技能", template: "direct_damage", config: { damage: "1d4", range: 1, target: "enemy", applyTemplate: "dot_damage_over_time", applyConfig: { damagePerTick: "1d4", tickTiming: "turn_start", durationTurns: 2, stackRule: "refresh_duration" } }, text: "造成 1D4 伤害并附带 DOT。" },
    acc_nullify: { name: "法术无效", source: "饰品技能", template: "self_buff", config: { consumeOn: "next_spell_hit", durationTurns: null }, text: "抵消下一次法术。" },
    acc_trap: { name: "尖刺陷阱", source: "饰品技能", template: "insert_negative_card_into_target_deck", config: { insertCardKey: "trap_token", insertCount: 1, triggerCondition: "place_on_tile", shuffleIntoDeck: false }, text: "在地图上放置陷阱。" },
    acc_hope: { name: "曙光", source: "饰品技能", template: "self_buff", config: { heal: 4, block: "2", consumeOn: "immediate" }, text: "恢复 4 并获得 2 格挡。" },
    trap_token: { name: "陷阱触发", source: "负面牌", template: "direct_damage", config: { damage: "2d6", range: 0, target: "self" }, text: "触发陷阱，受到 2D6 伤害。", negativeOnDraw: true },
    necro_bomb_token: { name: "骨炸弹", source: "负面牌", template: "direct_damage", config: { damage: "2d6", range: 0, target: "self" }, text: "抽到即爆炸并减速。", negativeOnDraw: true }
  },
  professions: {
    warrior: {
      key: "warrior", name: "战士", hp: 65, move: 5, movePreset: "melee",
      passives: {
        warrior_passive: { name: "战士被动", template: "threshold_reward_once_per_turn", config: { thresholdType: "effective_damage", thresholdValue: 4, rewardList: [{ type: "gain_block", value: 2 }], oncePerTurn: true } }
      },
      cards: {
        warrior_charge: { name: "冲锋", source: "职业技能", template: "dash_hit", config: { damage: "1d6", range: 3, buffBasic: 2, target: "enemy" }, text: "冲向目标并造成 1D6 伤害；下次普攻 +2。" },
        warrior_rage: { name: "暴怒/强力射击", source: "职业技能", template: "dual_mode", config: { modes: [{ name: "暴怒", templateRef: "self_buff", buffBasic: 3, consumeOn: "next_basic_attack" }, { name: "强力射击", templateRef: "self_buff", buffBasic: 3, consumeOn: "next_basic_attack" }] }, text: "双模式增益技能。" },
        warrior_throw: { name: "英勇投掷/二连斩", source: "职业技能", template: "dual_mode", config: { modes: [{ name: "英勇投掷", templateRef: "direct_damage", damage: "2d3", range: 3, target: "enemy", buffBasic: 1 }, { name: "二连斩", templateRef: "self_buff", basicAttackCapDelta: 1, consumeOn: "end_of_turn" }] }, text: "双模式攻击/增益技能。" },
        warrior_execute: { name: "斩杀", source: "职业技能", template: "direct_damage", config: { damage: "4d4", range: 1, target: "enemy" }, text: "近战造成 4D4 伤害。" },
        warrior_hamstring: { name: "断筋", source: "职业技能", template: "direct_damage", config: { damage: "1d4", range: 1, target: "enemy", apply: { slow: 1 } }, text: "1D4 伤害并减速。" }
      }
    },
    mage: {
      key: "mage", name: "法师", hp: 45, move: 3, movePreset: "ranged",
      passives: {
        mage_passive: { name: "法师被动", template: "movement_threshold_restricts_bucket", config: { threshold: 3, affectedBuckets: ["class_or_guardian"], timing: "after_move_before_class_skill", exceptionBuckets: ["weapon_or_accessory"] } }
      },
      cards: {
        mage_fireball: { name: "火球", source: "职业技能", template: "direct_damage", config: { damage: "1d8", range: 5, target: "enemy", spell: true, apply: { burn: 2 } }, text: "1D8 伤害并点燃。" },
        mage_nova: { name: "冰霜新星", source: "职业技能", template: "aoe", config: { damage: "2d4", range: 2, radius: 1, spell: true, apply: { slow: 1 } }, text: "范围伤害并减速。" },
        mage_blink: { name: "闪现", source: "职业技能", template: "teleport", config: { range: 4, target: "tile" }, text: "传送 4 格。" },
        mage_lightning: { name: "雷击", source: "职业技能", template: "direct_damage", config: { damage: "1d12+4", range: 5, target: "enemy", spell: true }, text: "造成 1D12+4 伤害。" },
        mage_phase: { name: "相位转移", source: "职业技能", template: "dual_mode", config: { modes: [{ name: "相位转移", templateRef: "teleport", range: 3, target: "tile" }, { name: "法术无效", templateRef: "self_buff", consumeOn: "next_spell_hit" }] }, text: "位移或获得法术无效。" }
      }
    },
    rogue: {
      key: "rogue", name: "盗贼", hp: 55, move: 5, movePreset: "melee",
      passives: {
        rogue_passive: { name: "盗贼被动", template: "control_bonus_on_basic_attack", config: { requiredTargetState: ["slow", "disarm", "sheep"], bonusDamage: "1d4", attackType: "basic_attack" } }
      },
      cards: {
        rogue_ambush: { name: "偷袭", source: "职业技能", template: "direct_damage", config: { damage: "1d4", range: 1, target: "enemy", conditionalBonus: { condition: "moved_this_turn", bonusDamage: "1d4" } }, text: "已移动则额外 1D4。" },
        rogue_disarm: { name: "缴械", source: "职业技能", template: "direct_damage", config: { damage: "1d6", range: 1, target: "enemy", apply: { disarm: 1 } }, text: "造成 1D6 并缴械。" },
        rogue_assassinate: { name: "刺杀", source: "职业技能", template: "direct_damage", config: { damage: "2d8", range: 1, target: "enemy", conditionalBonus: { condition: "target_controlled", bonusFlat: 2 } }, text: "受控目标额外 +2。" },
        rogue_step: { name: "瞬步", source: "职业技能", template: "teleport", config: { range: 4, target: "tile" }, text: "传送 4 格。" },
        rogue_bloodmix: { name: "血腥合剂", source: "职业技能", template: "self_buff", config: { heal: "1d6", bonusDie: "1d4", consumeOn: "next_basic_attack" }, text: "恢复并强化下次普攻。" },
        rogue_feast: { name: "杀戮盛宴", source: "职业技能", template: "direct_damage", config: { damage: "1d6", range: 6, target: "enemy", conditionalBonus: { condition: "target_hp_lte", threshold: 15, bonusDamage: "1d6" } }, text: "低血目标额外伤害。" }
      }
    },
    priest: {
      key: "priest", name: "牧师", hp: 55, move: 3, movePreset: "ranged",
      passives: { priest_passive: { name: "牧师被动", template: "heal_counter_bonus", config: { counterName: "heal_count", triggerEvery: 4, bonusHeal: "1d6" } } },
      cards: {
        priest_heal: { name: "治疗", source: "职业技能", template: "self_buff", config: { heal: "1d8", consumeOn: "immediate" }, text: "恢复 1D8。" },
        priest_pain: { name: "痛苦", source: "职业技能", template: "direct_damage", config: { damage: "1d4", range: 5, target: "enemy", spell: true, applyTemplate: "dot_damage_over_time", applyConfig: { damagePerTick: "1d4", tickTiming: "turn_start", durationTurns: 2, stackRule: "refresh_duration" } }, text: "伤害并附带 DOT。" }
      }
    },
    shaman: {
      key: "shaman", name: "萨满", hp: 60, move: 3, movePreset: "ranged",
      passives: { shaman_passive: { name: "萨满被动", template: "weapon_basic_inflicts_status", config: { statusType: "burn", statusValue: "1d4", durationTurns: 2 } } },
      cards: {
        shaman_shock: { name: "震击", source: "职业技能", template: "direct_damage", config: { damage: "1d6", range: 4, target: "enemy", spell: true, applyTemplate: "slow_status", applyConfig: { moveMultiplier: 0.5, rounding: "ceil", durationTurns: 1 } }, text: "伤害并减速。" },
        shaman_windfury: { name: "风怒", source: "职业技能", template: "self_buff", config: { basicAttackCapDelta: 1, consumeOn: "end_of_turn", durationTurns: 1 }, text: "本回合多一次普攻。" }
      }
    },
    necro: {
      key: "necro", name: "死灵法师", hp: 60, move: 3, movePreset: "ranged",
      passives: { necro_passive: { name: "死灵法师被动", template: "activated_token_scaling_block", config: { tokenType: "undead_token", ratio: 0.5, rounding: "ceil", rewardType: "gain_block_each_turn" } } },
      cards: {
        necro_bomb: { name: "埋骨炸弹", source: "职业技能", template: "insert_negative_card_into_target_deck", config: { insertCardKey: "necro_bomb_token", insertCount: 1, triggerCondition: "on_hit", shuffleIntoDeck: true }, text: "命中后向对方牌库塞入炸弹牌。" }
      }
    },
    warlock: {
      key: "warlock", name: "术士", hp: 55, move: 3, movePreset: "ranged",
      passives: { warlock_passive: { name: "术士被动", template: "life_for_card_draw_once_per_turn", config: { lifeCost: 4, drawCount: 1, oncePerTurn: true } } },
      cards: {
        lock_corrode: { name: "腐蚀", source: "职业技能", template: "direct_damage", config: { damage: "1d4", range: 5, target: "enemy", spell: true, applyTemplate: "dot_damage_over_time", applyConfig: { damagePerTick: "1d4", tickTiming: "turn_start", durationTurns: 3, stackRule: "refresh_duration" } }, text: "伤害并附带 DOT。" }
      }
    }
  }
};
