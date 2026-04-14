(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.8.1';
  Object.assign(data.templates, {
    summon_token_into_self_deck: { label: '召唤并激活 token', desc: '使用后激活召唤物计数。', fields: [['tokenType','token 类型','text'],['insertCount','数量','number']] },
    consume_all_activated_tokens_for_burst: { label: '消耗召唤物爆发', desc: '消耗已激活召唤物并对目标造成爆发伤害。', fields: [['baseDamage','基础伤害','text'],['range','距离','number'],['bonusByTokenType','按 token 追加','json']] }
  });
  Object.assign(data.templateDefaults, {
    summon_token_into_self_deck: { tokenType: 'skeleton', insertCount: 1 },
    consume_all_activated_tokens_for_burst: { baseDamage: '2d4', range: 5, bonusByTokenType: { skeleton: '1d4', bone_dragon: '1d8' } }
  });
  data.ruleDefaults.mapRadius = 6;
  Object.assign(data.professions.priest.cards, {
    priest_smite: { name: '惩戒', source: '职业技能', template: 'direct_damage', config: { damage: '1d6', range: 4, target: 'enemy', spell: true }, text: '造成 1D6 法术伤害。' },
    priest_stance: { name: '神圣立场', source: '职业技能', template: 'self_buff', config: { block: '1d6', buffBasic: 2 }, text: '获得格挡并让下次普攻 +2。' },
    priest_shield: { name: '护盾术', source: '职业技能', template: 'self_buff', config: { block: '1d8' }, text: '获得 1D8 格挡。' }
  });
  data.professions.priest.move = 5; data.professions.priest.movePreset = 'melee';
  Object.assign(data.professions.shaman.cards, {
    shaman_avatar: { name: '化身', source: '职业技能', template: 'self_buff', config: { block: '1d6', heal: '1d4' }, text: '获得格挡并恢复生命。' },
    shaman_earthshield: { name: '大地之盾', source: '职业技能', template: 'self_buff', config: { block: '1d8' }, text: '获得 1D8 格挡。' },
    shaman_bloodlust: { name: '嗜血术', source: '职业技能', template: 'self_buff', config: { buffBasic: 3 }, text: '下次普攻 +3。' }
  });
  data.professions.shaman.move = 4;
  Object.assign(data.professions.necro.cards, {
    necro_skeleton: { name: '召唤骷髅', source: '职业技能', template: 'summon_token_into_self_deck', config: { tokenType: 'skeleton', insertCount: 1 }, text: '激活一个骷髅。' },
    necro_bonedragon: { name: '召唤骨龙', source: '职业技能', template: 'summon_token_into_self_deck', config: { tokenType: 'bone_dragon', insertCount: 1 }, text: '激活一个骨龙。' },
    necro_burst: { name: '亡灵爆发', source: '职业技能', template: 'consume_all_activated_tokens_for_burst', config: { baseDamage: '2d4', range: 5, bonusByTokenType: { skeleton: '1d4', bone_dragon: '1d8' } }, text: '消耗召唤物对目标造成爆发伤害。' },
    necro_shield: { name: '骨盾', source: '职业技能', template: 'self_buff', config: { block: '1d8' }, text: '获得 1D8 格挡。' },
    necro_spear: { name: '骨矛', source: '职业技能', template: 'direct_damage', config: { damage: '1d10', range: 5, target: 'enemy', spell: true }, text: '造成 1D10 法术伤害。' }
  });
  data.professions.necro.move = 4;
  Object.assign(data.professions.warlock.cards, {
    lock_soulfire: { name: '灵魂火', source: '职业技能', template: 'direct_damage', config: { damage: '2d8', range: 4, target: 'enemy', spell: true }, text: '造成 2D8 法术伤害。' },
    lock_nightdash: { name: '暗夜冲刺', source: '职业技能', template: 'dash_hit', config: { damage: '1d6', range: 3 }, text: '冲向目标并造成 1D6 伤害。' },
    lock_leech: { name: '吸血', source: '职业技能', template: 'direct_damage', config: { damage: '1d5', range: 4, target: 'enemy' }, text: '造成 1D5 伤害。' },
    lock_shadowflame: { name: '暗影烈焰', source: '职业技能', template: 'aoe', config: { damage: '1d12', range: 4, radius: 1, spell: true }, text: '对范围造成 1D12 伤害。' }
  });
  data.professions.warlock.move = 5; data.professions.warlock.movePreset = 'melee';
})();
