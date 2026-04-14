
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.10.6';
  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.insert_negative_card_into_target_deck = {
    ...(data.templates.insert_negative_card_into_target_deck || {}),
    label: '埋炸弹/插负面牌',
    desc: '在一定距离内指定目标，并向目标牌库加入负面牌。',
    fields: [
      ['range','距离','number'],
      ['insertCardKey','插入负面牌','negative-card-select'],
      ['insertCount','数量','number'],
      ['triggerCondition','触发条件','triggerCondition'],
      ['shuffleIntoDeck','是否洗入牌库','boolean']
    ]
  };

  data.templateDefaults.insert_negative_card_into_target_deck = Object.assign({
    range: 4,
    insertCardKey: '',
    insertCount: 1,
    triggerCondition: 'on_hit',
    shuffleIntoDeck: true
  }, data.templateDefaults.insert_negative_card_into_target_deck || {});

  data.templates.create_map_token = {
    label: '在地图上创造 Token',
    desc: '在指定地块放置陷阱、永久柱体或自动炮塔。',
    fields: [
      ['range','放置距离','number'],
      ['tokenName','Token 名称','text'],
      ['tokenKind','Token 类型','tokenKind'],
      ['durationTurns','持续回合','durationTurns'],
      ['damage','伤害','text'],
      ['insertCardKey','插入负面牌','negative-card-select'],
      ['insertCount','插入数量','number'],
      ['attackRange','炮塔射程','number'],
      ['controlType','控制效果','controlType'],
      ['controlDuration','控制回合','number'],
      ['blocking','阻挡碰撞','boolean']
    ]
  };

  data.templateDefaults.create_map_token = {
    range: 3,
    tokenName: '陷阱',
    tokenKind: 'trap_once_negative',
    durationTurns: 2,
    damage: '2d6',
    insertCardKey: '',
    insertCount: 1,
    attackRange: 4,
    controlType: '',
    controlDuration: 1,
    blocking: false
  };

  // Example built-ins
  data.cardLibrary = data.cardLibrary || {};
  if (!data.cardLibrary.example_floor_trap) {
    data.cardLibrary.example_floor_trap = {
      name: '地雷陷阱',
      source: '职业技能',
      template: 'create_map_token',
      config: {
        range: 3,
        tokenName: '地雷',
        tokenKind: 'trap_once_negative',
        durationTurns: 3,
        damage: '1d6',
        insertCardKey: '',
        insertCount: 1,
        attackRange: 4,
        controlType: 'slow',
        controlDuration: 1,
        blocking: false
      },
      text: '在地图上放置一个一次性陷阱，敌人进入时会触发。'
    };
  }
})();
