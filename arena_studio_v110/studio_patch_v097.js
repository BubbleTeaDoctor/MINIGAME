
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.7';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.threshold_reward_once_per_turn = {
    ...(data.templates.threshold_reward_once_per_turn || {}),
    label: '阈值触发奖励',
    desc: '每回合首次达到阈值时获得奖励。',
    fields: [
      ['thresholdType','阈值类型','thresholdType'],
      ['thresholdValue','阈值数值','number'],
      ['rewardList','奖励列表','reward-list'],
      ['oncePerTurn','每回合一次','boolean']
    ]
  };

  data.templates.damage_then_multi_buff = {
    ...(data.templates.damage_then_multi_buff || {}),
    label: '造成伤害后获得多重增益',
    desc: '先造成基础伤害；若原始伤害达到阈值，则按 rewardList 获得多个增益。',
    fields: [
      ['baseDamage','基础伤害','text'],
      ['range','距离','number'],
      ['target','目标类型','target'],
      ['threshold','造成伤害阈值','number'],
      ['rewardList','奖励列表','reward-list']
    ]
  };

  data.templateDefaults.threshold_reward_once_per_turn = Object.assign({
    thresholdType: 'dealt_damage',
    thresholdValue: 1,
    rewardList: [{ type: 'gain_block', value: '1d4', origin: '职业被动' }],
    oncePerTurn: true
  }, data.templateDefaults.threshold_reward_once_per_turn || {});

  data.templateDefaults.damage_then_multi_buff = Object.assign({
    baseDamage: '1d6',
    range: 1,
    target: 'enemy',
    threshold: 1,
    rewardList: [{ type: 'gain_block', value: '1d4', origin: '职业技能' }]
  }, data.templateDefaults.damage_then_multi_buff || {});
})();
