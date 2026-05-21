
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '1.0.0';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.threshold_reward_once_per_turn = Object.assign({}, data.templates.threshold_reward_once_per_turn || {}, {
    label: '阈值触发奖励',
    desc: '达到阈值时获得奖励，可设置每回合一次。',
    fields: [
      ['thresholdType','阈值类型','thresholdType'],
      ['thresholdValue','阈值数值','number'],
      ['rewardList','奖励列表','reward-list'],
      ['oncePerTurn','每回合一次','boolean']
    ]
  });

  data.templates.damage_then_multi_buff = Object.assign({}, data.templates.damage_then_multi_buff || {}, {
    label: '造成伤害后获得多重增益',
    desc: '若原始伤害达到阈值，则按奖励列表获得多个增益。',
    fields: [
      ['threshold','造成伤害阈值','number'],
      ['target','目标类型','target'],
      ['rewardList','奖励列表','reward-list'],
      ['oncePerTurn','每回合一次','boolean']
    ]
  });

  data.templateDefaults.threshold_reward_once_per_turn = Object.assign({
    thresholdType: 'dealt_damage',
    thresholdValue: 3,
    rewardList: [{ type: 'extra_basic_cap', value: 1, cardKey:'', origin:'' }],
    oncePerTurn: true
  }, data.templateDefaults.threshold_reward_once_per_turn || {});

  data.templateDefaults.damage_then_multi_buff = Object.assign({
    threshold: 3,
    target: 'enemy',
    rewardList: [{ type: 'extra_basic_cap', value: 1, cardKey:'', origin:'' }],
    oncePerTurn: true
  }, data.templateDefaults.damage_then_multi_buff || {});
})();
