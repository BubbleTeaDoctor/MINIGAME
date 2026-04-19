
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.1';

  // Continue adding content on top of the v090 stable frame.
  Object.assign(data.cardLibrary, {
    // Hunter
    hunter_explosive: {
      name: '爆裂射击',
      source: '职业技能',
      template: 'aoe',
      config: { damage: '1d8', range: 5, radius: 1, spell: false },
      text: '对目标点周围 1 格造成 1D8 伤害。'
    },
    hunter_tracking: {
      name: '追踪射击',
      source: '职业技能',
      template: 'mark_target_for_bonus',
      config: { markType: 'tracking', range: 6, consumeOn: 'until_triggered' },
      text: '为目标施加追踪标记。'
    },
    hunter_camouflage: {
      name: '伪装',
      source: '职业技能',
      template: 'self_buff',
      config: { block: '1d6', buffBasic: 2, consumeOn: 'next_basic_attack' },
      text: '获得 1D6 格挡，并让下次普攻 +2。'
    },

    // Priest
    priest_holyfire: {
      name: '神圣之火',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d8', range: 5, target: 'enemy', spell: true, apply: { burn: 1 } },
      text: '造成 1D8 法术伤害并附带点燃。'
    },
    priest_barrier: {
      name: '光辉壁垒',
      source: '职业技能',
      template: 'self_buff',
      config: { block: '1d10', consumeOn: 'manual' },
      text: '获得 1D10 格挡。'
    },
    priest_radiance: {
      name: '圣光照耀',
      source: '职业技能',
      template: 'self_buff',
      config: { heal: '1d6', block: '1d4', consumeOn: 'immediate' },
      text: '恢复 1D6 并获得 1D4 格挡。'
    },

    // Shaman
    shaman_thunderstorm: {
      name: '雷暴',
      source: '职业技能',
      template: 'aoe',
      config: { damage: '1d8', range: 4, radius: 1, spell: true },
      text: '对范围造成 1D8 法术伤害。'
    },
    shaman_stormstrike: {
      name: '风暴打击',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d8', range: 1, target: 'enemy' },
      text: '近战造成 1D8 伤害。'
    },
    shaman_ancestral: {
      name: '先祖指引',
      source: '职业技能',
      template: 'self_buff',
      config: { heal: '1d4', bonusDie: '1d4', consumeOn: 'next_basic_attack' },
      text: '恢复 1D4，并让下次普攻额外造成 1D4。'
    },

    // Necromancer
    necro_deathcoil: {
      name: '死亡缠绕',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d8', range: 5, target: 'enemy', spell: true },
      text: '造成 1D8 法术伤害。'
    },
    necro_boneprison: {
      name: '骨牢',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d4', range: 4, target: 'enemy', spell: true, apply: { slow: 1 } },
      text: '造成 1D4 法术伤害并减速。'
    },
    necro_harvest: {
      name: '灵魂收割',
      source: '职业技能',
      template: 'bonus_if_target_marked',
      config: { baseDamage: '1d10', range: 5, bonusDamage: 2, consumeMark: false },
      text: '若目标已被标记或诅咒，则额外造成 2 点伤害。'
    },

    // Warlock
    lock_shadowbolt: {
      name: '暗影箭',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d10', range: 5, target: 'enemy', spell: true },
      text: '造成 1D10 法术伤害。'
    },
    lock_demonskin: {
      name: '恶魔之肤',
      source: '职业技能',
      template: 'self_buff',
      config: { block: '1d8', consumeOn: 'manual' },
      text: '获得 1D8 格挡。'
    },
    lock_agony: {
      name: '痛楚诅咒',
      source: '职业技能',
      template: 'direct_damage',
      config: {
        damage: '1d4',
        range: 5,
        target: 'enemy',
        spell: true,
        applyTemplate: 'dot_damage_over_time',
        applyConfig: { damagePerTick: '1d4', tickTiming: 'turn_start', durationTurns: 3, stackRule: 'refresh_duration' }
      },
      text: '造成 1D4 伤害并附带持续伤害。'
    },

    // Swordsman
    sword_riposte: {
      name: '反击架势',
      source: '职业技能',
      template: 'self_buff',
      config: { block: '1d8', buffBasic: 2, consumeOn: 'next_basic_attack' },
      text: '获得 1D8 格挡，下次普攻 +2。'
    },
    sword_shadowstep: {
      name: '影踏',
      source: '职业技能',
      template: 'teleport',
      config: { range: 4, target: 'tile' },
      text: '位移到 4 格内空位。'
    },

    // Weapon extra skills
    hammer_quake: {
      name: '震地',
      source: '武器技能',
      template: 'aoe',
      config: { damage: '1d6', range: 2, radius: 1, spell: false },
      text: '对近距离范围造成 1D6 伤害。'
    },
    wand_shield: {
      name: '奥术护盾',
      source: '武器技能',
      template: 'self_buff',
      config: { block: '1d6', consumeOn: 'manual' },
      text: '获得 1D6 格挡。'
    },
    twin_dash: {
      name: '双刃突进',
      source: '武器技能',
      template: 'dash_hit',
      config: { damage: '1d6', range: 3, buffBasic: 1 },
      text: '冲锋并造成 1D6 伤害，下次普攻 +1。'
    },
    totem_barrier: {
      name: '图腾屏障',
      source: '武器技能',
      template: 'self_buff',
      config: { block: '1d6', consumeOn: 'manual' },
      text: '获得 1D6 格挡。'
    },

    // Accessory extra skills
    acc_blood_surge: {
      name: '沸血',
      source: '饰品技能',
      template: 'self_buff',
      config: { buffBasic: 2, heal: '1d4', consumeOn: 'next_basic_attack' },
      text: '恢复 1D4，并让下次普攻 +2。'
    },
    acc_time_echo: {
      name: '时间回响',
      source: '饰品技能',
      template: 'self_buff',
      config: { block: '1d6', consumeOn: 'manual' },
      text: '获得 1D6 格挡。'
    },
    acc_void_blast: {
      name: '虚空爆破',
      source: '饰品技能',
      template: 'aoe',
      config: { damage: '1d6', range: 4, radius: 1, spell: true },
      text: '对范围造成 1D6 法术伤害。'
    },
    acc_holy_guard: {
      name: '圣光守护',
      source: '饰品技能',
      template: 'self_buff',
      config: { block: '1d8', heal: '1d4', consumeOn: 'immediate' },
      text: '恢复 1D4，并获得 1D8 格挡。'
    }
  });

  if (data.professions.hunter) Object.assign(data.professions.hunter.cards, {
    hunter_explosive: data.cardLibrary.hunter_explosive,
    hunter_tracking: data.cardLibrary.hunter_tracking,
    hunter_camouflage: data.cardLibrary.hunter_camouflage
  });

  if (data.professions.priest) Object.assign(data.professions.priest.cards, {
    priest_holyfire: data.cardLibrary.priest_holyfire,
    priest_barrier: data.cardLibrary.priest_barrier,
    priest_radiance: data.cardLibrary.priest_radiance
  });

  if (data.professions.shaman) Object.assign(data.professions.shaman.cards, {
    shaman_thunderstorm: data.cardLibrary.shaman_thunderstorm,
    shaman_stormstrike: data.cardLibrary.shaman_stormstrike,
    shaman_ancestral: data.cardLibrary.shaman_ancestral
  });

  if (data.professions.necro) Object.assign(data.professions.necro.cards, {
    necro_deathcoil: data.cardLibrary.necro_deathcoil,
    necro_boneprison: data.cardLibrary.necro_boneprison,
    necro_harvest: data.cardLibrary.necro_harvest
  });

  if (data.professions.warlock) Object.assign(data.professions.warlock.cards, {
    lock_shadowbolt: data.cardLibrary.lock_shadowbolt,
    lock_demonskin: data.cardLibrary.lock_demonskin,
    lock_agony: data.cardLibrary.lock_agony
  });

  if (data.professions.swordsman) Object.assign(data.professions.swordsman.cards, {
    sword_riposte: data.cardLibrary.sword_riposte,
    sword_shadowstep: data.cardLibrary.sword_shadowstep
  });

  if (data.weaponLibrary.warhammer && !data.weaponLibrary.warhammer.cards.includes('hammer_quake')) data.weaponLibrary.warhammer.cards.push('hammer_quake');
  if (data.weaponLibrary.wand && !data.weaponLibrary.wand.cards.includes('wand_shield')) data.weaponLibrary.wand.cards.push('wand_shield');
  if (data.weaponLibrary.twin_blades && !data.weaponLibrary.twin_blades.cards.includes('twin_dash')) data.weaponLibrary.twin_blades.cards.push('twin_dash');
  if (data.weaponLibrary.totem && !data.weaponLibrary.totem.cards.includes('totem_barrier')) data.weaponLibrary.totem.cards.push('totem_barrier');

  if (data.accessoryLibrary.blood_phial && !data.accessoryLibrary.blood_phial.cards.includes('acc_blood_surge')) data.accessoryLibrary.blood_phial.cards.push('acc_blood_surge');
  if (data.accessoryLibrary.time_rewind && !data.accessoryLibrary.time_rewind.cards.includes('acc_time_echo')) data.accessoryLibrary.time_rewind.cards.push('acc_time_echo');
  if (data.accessoryLibrary.void_core && !data.accessoryLibrary.void_core.cards.includes('acc_void_blast')) data.accessoryLibrary.void_core.cards.push('acc_void_blast');
  if (data.accessoryLibrary.holy_icon && !data.accessoryLibrary.holy_icon.cards.includes('acc_holy_guard')) data.accessoryLibrary.holy_icon.cards.push('acc_holy_guard');
})();
