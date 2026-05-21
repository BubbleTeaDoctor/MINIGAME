(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.10.5';
  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.insert_negative_card_into_target_deck = {
    ...(data.templates.insert_negative_card_into_target_deck || {}),
    label: '埋炸弹/插负面牌',
    desc: '向目标牌库加入可编辑的负面牌。',
    fields: [
      ['insertCardKey','插入负面牌','negative-card-select'],
      ['insertCount','数量','number'],
      ['triggerCondition','触发条件','triggerCondition'],
      ['shuffleIntoDeck','是否洗入牌库','boolean']
    ]
  };

  data.templates.negative_direct_damage = {
    label: '负面牌：直接伤害',
    desc: '抽到即触发，直接对抽牌者造成伤害。',
    fields: [
      ['damage','伤害骰','text'],
      ['showInPreview','展示在预览中','boolean']
    ]
  };
  data.templates.negative_dot = {
    label: '负面牌：DOT',
    desc: '抽到即施加持续伤害。',
    fields: [
      ['damagePerTick','每跳伤害','text'],
      ['tickTiming','触发时机','tickTiming'],
      ['durationTurns','持续回合','durationTurns'],
      ['showInPreview','展示在预览中','boolean']
    ]
  };
  data.templates.negative_control = {
    label: '负面牌：控制',
    desc: '抽到即施加控制状态。',
    fields: [
      ['controlType','控制类型','controlType'],
      ['controlDuration','控制回合','durationTurns'],
      ['showInPreview','展示在预览中','boolean']
    ]
  };
  data.templates.negative_mixed = {
    label: '负面牌：混合效果',
    desc: '抽到即触发直接伤害、DOT 和控制的组合。',
    fields: [
      ['damage','直接伤害','text'],
      ['damagePerTick','每跳伤害','text'],
      ['tickTiming','DOT 触发时机','tickTiming'],
      ['durationTurns','DOT 持续回合','durationTurns'],
      ['controlType','控制类型','controlType'],
      ['controlDuration','控制回合','durationTurns'],
      ['showInPreview','展示在预览中','boolean']
    ]
  };

  data.templateDefaults.insert_negative_card_into_target_deck = Object.assign({
    insertCardKey: 'trap_token', insertCount: 1, triggerCondition: 'on_hit', shuffleIntoDeck: true
  }, data.templateDefaults.insert_negative_card_into_target_deck || {});
  data.templateDefaults.negative_direct_damage = { damage: '2d6', showInPreview: true };
  data.templateDefaults.negative_dot = { damagePerTick: '1d4', tickTiming: 'turn_start', durationTurns: '2', showInPreview: true };
  data.templateDefaults.negative_control = { controlType: 'disarm', controlDuration: '1', showInPreview: true };
  data.templateDefaults.negative_mixed = { damage: '1d4', damagePerTick: '1d4', tickTiming: 'turn_start', durationTurns: '2', controlType: 'slow', controlDuration: '1', showInPreview: true };

  Object.entries(data.cardLibrary || {}).forEach(([k, card]) => {
    if (card?.source === '负面牌' || card?.negativeOnDraw || String(card?.template || '').startsWith('negative_')) {
      card.source = '负面牌';
      card.negativeOnDraw = true;
    }
  });
})();