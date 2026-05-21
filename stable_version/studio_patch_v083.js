
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.8.3';

  // Extend later-content restoration without changing the stable v0.79 framework
  Object.assign(data.cardLibrary, {
    hunter_snare_token: { name: '束缚陷阱', source: '负面牌', template: 'direct_damage', config: { damage: '2d6', range: 0, target: 'self' }, text: '抽到即触发，受到 2D6 伤害并减速。', negativeOnDraw: true },
    acc_lincoln_guard: { name: '相位护幕', source: '饰品技能', template: 'self_buff', config: { block: '1d6', consumeOn: 'next_spell_hit' }, text: '获得 1D6 格挡，并抵消下一次法术。' },
    acc_trap_spike: { name: '追猎陷阱', source: '饰品技能', template: 'insert_negative_card_into_target_deck', config: { insertCardKey: 'hunter_snare_token', insertCount: 1, triggerCondition: 'on_hit', shuffleIntoDeck: true }, text: '向目标牌库植入束缚陷阱。' },
    acc_hope_guard: { name: '晨光庇护', source: '饰品技能', template: 'self_buff', config: { heal: 3, block: '1d4', consumeOn: 'immediate' }, text: '恢复 3 并获得 1D4 格挡。' },

    hunter_trap: { name: '束缚陷阱', source: '职业技能', template: 'insert_negative_card_into_target_deck', config: { insertCardKey: 'hunter_snare_token', insertCount: 1, triggerCondition: 'on_hit', shuffleIntoDeck: true }, text: '向目标牌库植入束缚陷阱。' },
    hunter_command: { name: '杀戮命令', source: '职业技能', template: 'bonus_if_target_marked', config: { baseDamage: '2d8', range: 5, bonusDamage: 3, consumeMark: true }, text: '对被标记目标造成高额伤害。' },
    hunter_volley: { name: '多重射击', source: '职业技能', template: 'aoe', config: { damage: '1d6', range: 5, radius: 1, spell: false }, text: '对小范围造成 1D6 伤害。' },

    priest_sanctuary: { name: '庇护', source: '职业技能', template: 'self_buff', config: { heal: '1d4', block: '1d6', consumeOn: 'immediate' }, text: '恢复并获得格挡。' },
    priest_judgement: { name: '审判', source: '职业技能', template: 'direct_damage', config: { damage: '1d8', range: 4, target: 'enemy', spell: true }, text: '造成 1D8 法术伤害。' },

    shaman_chain: { name: '闪电链', source: '职业技能', template: 'aoe', config: { damage: '1d6', range: 4, radius: 1, spell: true }, text: '对范围造成 1D6 法术伤害。' },
    shaman_spiritwalk: { name: '灵行', source: '职业技能', template: 'teleport', config: { range: 3, target: 'tile' }, text: '位移到 3 格内空位。' },

    necro_gravebind: { name: '墓缚', source: '职业技能', template: 'direct_damage', config: { damage: '1d4', range: 5, target: 'enemy', spell: true, apply: { slow: 1 } }, text: '造成 1D4 伤害并减速。' },
    necro_legion: { name: '亡者军势', source: '职业技能', template: 'summon_token_into_self_deck', config: { tokenType: 'skeleton', insertCount: 2 }, text: '一次激活两个骷髅。' },

    lock_bloodpact: { name: '血契', source: '职业技能', template: 'self_buff', config: { heal: '1d4', bonusDie: '1d4', consumeOn: 'next_basic_attack' }, text: '恢复并让下次普攻额外造成 1D4。' },
    lock_doom: { name: '厄运', source: '职业技能', template: 'direct_damage', config: { damage: '1d6', range: 5, target: 'enemy', spell: true, apply: { burn: 1 } }, text: '造成 1D6 法术伤害并附带点燃。' },

    sword_focus: { name: '心眼', source: '职业技能', template: 'self_buff', config: { buffBasic: 2, block: '1d4', consumeOn: 'next_basic_attack' }, text: '获得少量格挡，下次普攻 +2。' }
  });

  if (data.accessoryLibrary.lincoln && !data.accessoryLibrary.lincoln.cards.includes('acc_lincoln_guard')) data.accessoryLibrary.lincoln.cards.push('acc_lincoln_guard');
  if (data.accessoryLibrary.trapbag && !data.accessoryLibrary.trapbag.cards.includes('acc_trap_spike')) data.accessoryLibrary.trapbag.cards.push('acc_trap_spike');
  if (data.accessoryLibrary.hope && !data.accessoryLibrary.hope.cards.includes('acc_hope_guard')) data.accessoryLibrary.hope.cards.push('acc_hope_guard');

  Object.assign(data.professions.hunter.cards, {
    hunter_trap: data.cardLibrary.hunter_trap,
    hunter_command: data.cardLibrary.hunter_command,
    hunter_volley: data.cardLibrary.hunter_volley
  });
  Object.assign(data.professions.priest.cards, {
    priest_sanctuary: data.cardLibrary.priest_sanctuary,
    priest_judgement: data.cardLibrary.priest_judgement
  });
  Object.assign(data.professions.shaman.cards, {
    shaman_chain: data.cardLibrary.shaman_chain,
    shaman_spiritwalk: data.cardLibrary.shaman_spiritwalk
  });
  Object.assign(data.professions.necro.cards, {
    necro_gravebind: data.cardLibrary.necro_gravebind,
    necro_legion: data.cardLibrary.necro_legion
  });
  Object.assign(data.professions.warlock.cards, {
    lock_bloodpact: data.cardLibrary.lock_bloodpact,
    lock_doom: data.cardLibrary.lock_doom
  });
  Object.assign(data.professions.swordsman.cards, {
    sword_focus: data.cardLibrary.sword_focus
  });
})();
