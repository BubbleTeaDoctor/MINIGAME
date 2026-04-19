
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.9';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.threshold_reward_once_per_turn = Object.assign({}, data.templates.threshold_reward_once_per_turn || {}, {
    label: '阈值触发奖励',
    desc: '达到阈值时获得奖励。',
    fields: [
      ['thresholdType','阈值类型','thresholdType'],
      ['thresholdValue','阈值数值','number'],
      ['rewardList','奖励列表','reward-list'],
      ['oncePerTurn','每回合一次','boolean']
    ]
  });

  data.templates.damage_then_multi_buff = Object.assign({}, data.templates.damage_then_multi_buff || {}, {
    label: '造成伤害后获得多重增益',
    desc: '若造成伤害达到阈值，则按奖励列表获得多个增益。',
    fields: [
      ['threshold','造成伤害阈值','number'],
      ['target','目标类型','target'],
      ['rewardList','奖励列表','reward-list']
    ]
  });

  data.templates.damage_roll_grant_card = Object.assign({}, data.templates.damage_roll_grant_card || {}, {
    label: '造成伤害后掷骰触发补牌',
    desc: '造成伤害后掷骰，满足阈值时补入指定卡牌并可返还行动。',
    fields: [
      ['damage','伤害','text'],
      ['range','距离','number'],
      ['target','目标类型','target'],
      ['procDie','触发骰','text'],
      ['threshold','触发阈值','number'],
      ['grantedCardKey','获得卡牌','card-key-select'],
      ['grantedOrigin','卡牌来源','origin'],
      ['refundBucket','返还行动','refundBucket']
    ]
  });

  data.templateDefaults.threshold_reward_once_per_turn = Object.assign({
    thresholdType: 'dealt_damage',
    thresholdValue: 1,
    rewardList: [{ type: 'gain_block', value: '1d4', cardKey:'', origin:'' }],
    oncePerTurn: true
  }, data.templateDefaults.threshold_reward_once_per_turn || {});

  data.templateDefaults.damage_then_multi_buff = Object.assign({
    threshold: 1,
    target: 'enemy',
    rewardList: [{ type: 'gain_block', value: '1d4', cardKey:'', origin:'' }]
  }, data.templateDefaults.damage_then_multi_buff || {});

  data.templateDefaults.damage_roll_grant_card = Object.assign({
    damage: '1d6',
    range: 1,
    target: 'enemy',
    procDie: '1d6',
    threshold: 4,
    grantedCardKey: '',
    grantedOrigin: '',
    refundBucket: ''
  }, data.templateDefaults.damage_roll_grant_card || {});
})();
