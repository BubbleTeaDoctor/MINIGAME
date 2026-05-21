
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.10.9';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};
  data.statuses = data.statuses || {};

  data.templates.insert_negative_card_into_target_deck = Object.assign(
    {},
    data.templates.insert_negative_card_into_target_deck || {},
    {
      label: '埋炸弹/插负面牌',
      desc: '在一定距离内指定目标，并向目标牌库加入负面牌。',
      fields: [
        ['range','距离','number'],
        ['insertCardKey','插入负面牌','negative-card-select'],
        ['insertCount','数量','number'],
        ['triggerCondition','触发条件','triggerCondition'],
        ['shuffleIntoDeck','是否洗入牌库','boolean']
      ]
    }
  );

  data.templateDefaults.insert_negative_card_into_target_deck = Object.assign(
    { range: 4, insertCardKey: '', insertCount: 1, triggerCondition: 'on_hit', shuffleIntoDeck: true },
    data.templateDefaults.insert_negative_card_into_target_deck || {}
  );

  data.templates.create_map_token = Object.assign(
    {},
    data.templates.create_map_token || {},
    {
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
    }
  );

  data.templateDefaults.create_map_token = Object.assign(
    {
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
    },
    data.templateDefaults.create_map_token || {}
  );
})();
