
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;

  data.version = "0.8.0";

  data.templates.mark_target_for_bonus = {
    label: "标记目标",
    desc: "对目标施加标记，供后续技能额外结算。",
    fields: [["markType","标记类型","text"],["range","距离","number"],["consumeOn","何时消耗","text"]]
  };
  data.templates.bonus_if_target_marked = {
    label: "标记目标额外收益",
    desc: "若目标被标记，则获得额外伤害或收益。",
    fields: [["baseDamage","基础伤害","text"],["range","距离","number"],["bonusDamage","额外伤害","number"],["consumeMark","是否消耗标记","boolean"]]
  };

  data.templateDefaults.mark_target_for_bonus = { markType: "normal", range: 5, consumeOn: "until_triggered" };
  data.templateDefaults.bonus_if_target_marked = { baseDamage: "2d8", range: 5, bonusDamage: 2, consumeMark: true };

  // Add more weapon/accessory choices without changing stable frame
  data.weaponLibrary.warhammer = { key: "warhammer", name: "战锤", basic: { name: "战锤普攻", damage: "2d5", range: 1, straight: false, type: "近战" }, cards: ["hammer_break","weapon_charge"] };
  data.weaponLibrary.wand = { key: "wand", name: "魔杖", basic: { name: "魔杖普攻", damage: "1d4", range: 4, straight: true, type: "远程直线" }, cards: ["wand_burst","bow_step"] };
  data.weaponLibrary.twin_blades = { key: "twin_blades", name: "双刃", basic: { name: "双刃普攻", damage: "2d4", range: 1, straight: false, type: "近战" }, cards: ["twin_flurry","dagger_step"] };
  data.weaponLibrary.totem = { key: "totem", name: "图腾", basic: { name: "图腾普攻", damage: "1d4", range: 3, straight: true, type: "远程直线" }, cards: ["totem_shock","bow_step"] };

  data.accessoryLibrary.blood_phial = { key: "blood_phial", name: "嗜血药剂", cards: ["acc_blood_phial"] };
  data.accessoryLibrary.time_rewind = { key: "time_rewind", name: "时光倒流", cards: ["acc_time_rewind"] };
  data.accessoryLibrary.void_core = { key: "void_core", name: "虚空核心", cards: ["acc_void_core"] };
  data.accessoryLibrary.holy_icon = { key: "holy_icon", name: "圣徽", cards: ["acc_holy_icon"] };

  Object.assign(data.cardLibrary, {
    hammer_break: { name: "破甲重击", source: "武器技能", template: "direct_damage", config: { damage: "1d8", range: 1, target: "enemy" }, text: "近战造成 1D8 伤害。" },
    wand_burst: { name: "魔力迸发", source: "武器技能", template: "direct_damage", config: { damage: "1d6", range: 4, target: "enemy", straight: true, spell: true }, text: "直线造成 1D6 法术伤害。" },
    twin_flurry: { name: "乱舞", source: "武器技能", template: "self_buff", config: { basicAttackCapDelta: 1, consumeOn: "end_of_turn", durationTurns: 1 }, text: "本回合额外获得一次普攻。" },
    totem_shock: { name: "图腾震击", source: "武器技能", template: "direct_damage", config: { damage: "1d4", range: 4, target: "enemy", apply: { slow: 1 } }, text: "造成 1D4 伤害并减速。" },

    acc_blood_phial: { name: "嗜血药剂", source: "饰品技能", template: "self_buff", config: { heal: "1d6", bonusDie: "1d4", consumeOn: "next_basic_attack" }, text: "恢复 1D6，并让下次普攻额外造成 1D4。" },
    acc_time_rewind: { name: "时光倒流", source: "饰品技能", template: "teleport", config: { range: 3, target: "tile" }, text: "位移到 3 格内空地。" },
    acc_void_core: { name: "虚空核心", source: "饰品技能", template: "direct_damage", config: { damage: "1d6", range: 4, target: "enemy", spell: true }, text: "造成 1D6 法术伤害。" },
    acc_holy_icon: { name: "圣徽", source: "饰品技能", template: "self_buff", config: { heal: 4, block: 2, consumeOn: "immediate" }, text: "恢复 4 生命并获得 2 格挡。" }
  });

  data.professions.swordsman = {
    key: "swordsman", name: "剑客", hp: 55, move: 5, movePreset: "melee",
    passives: {
      swordsman_passive: { name: "剑客被动", template: "skip_basic_attack_then_gain_bonus", config: { checkAt: "end_of_turn", bonusType: "flat_damage", bonusValue: 5, consumeOn: "next_basic_attack_or_class_skill" } }
    },
    cards: {
      sword_parry: { name: "见切", source: "职业技能", template: "self_buff", config: { block: "1d6", consumeOn: "manual" }, text: "获得 1D6 格挡。" },
      sword_read: { name: "看破", source: "职业技能", template: "mark_target_for_bonus", config: { markType: "normal", range: 4, consumeOn: "until_triggered" }, text: "标记一名目标。" },
      sword_flash: { name: "一闪", source: "职业技能", template: "dash_hit", config: { damage: "1d6", range: 3 }, text: "冲锋并造成 1D6 伤害。" },
      sword_drawdash: { name: "纳刀疾驰", source: "职业技能", template: "teleport", config: { range: 3, target: "tile" }, text: "位移到 3 格内空位。" },
      sword_finish: { name: "居合终结", source: "职业技能", template: "bonus_if_target_marked", config: { baseDamage: "2d8", range: 4, bonusDamage: 2, consumeMark: true }, text: "若目标被标记，则造成更高伤害并移除标记。" }
    }
  };

  data.professions.hunter = {
    key: "hunter", name: "猎人", hp: 52, move: 3, movePreset: "ranged",
    passives: {
      hunter_passive: { name: "猎人被动", template: "threshold_reward_once_per_turn", config: { thresholdType: "marked_hit", thresholdValue: 1, rewardList: [{ type: "gain_flat_damage", value: 2 }], oncePerTurn: true } }
    },
    cards: {
      hunter_mark: { name: "猎人印记", source: "职业技能", template: "mark_target_for_bonus", config: { markType: "normal", range: 6, consumeOn: "until_triggered" }, text: "标记一名目标。" },
      hunter_aimed: { name: "瞄准射击", source: "职业技能", template: "bonus_if_target_marked", config: { baseDamage: "1d8", range: 6, bonusDamage: 2, consumeMark: false }, text: "若目标被标记，额外 +2 伤害。" },
      hunter_arcane: { name: "奥术射击", source: "职业技能", template: "direct_damage", config: { damage: "1d6+1", range: 5, target: "enemy", spell: true }, text: "造成 1D6+1 法术伤害。" },
      hunter_disengage: { name: "逃脱", source: "职业技能", template: "teleport", config: { range: 3, target: "tile" }, text: "位移到 3 格内空位。" },
      hunter_snare: { name: "束缚射击", source: "职业技能", template: "direct_damage", config: { damage: "1d4", range: 5, target: "enemy", apply: { slow: 1 } }, text: "造成 1D4 伤害并减速。" },
      hunter_kill: { name: "杀戮命令", source: "职业技能", template: "bonus_if_target_marked", config: { baseDamage: "2d8", range: 5, bonusDamage: 2, consumeMark: true }, text: "对被标记目标造成高额伤害。" }
    }
  };
})();
