
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '1.0.1';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.threshold_reward_once_per_turn = Object.assign({}, data.templates.threshold_reward_once_per_turn || {}, {
    label: '阈值触发奖励',
    desc: '每回合首次达到阈值时获得奖励。支持“造成伤害”阈值，并可直接返还普攻次数。',
    fields: [
      ['thresholdType','阈值类型','thresholdType'],
      ['thresholdValue','阈值数值','number'],
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
})();
