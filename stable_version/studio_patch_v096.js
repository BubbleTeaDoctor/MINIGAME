
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.6';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  // Fill richer reward editor options for threshold and multi-buff templates.
  if (data.templates.damage_then_multi_buff) {
    data.templates.damage_then_multi_buff.fields = [
      ['damage','伤害骰','text'],
      ['range','距离','number'],
      ['target','目标类型','target'],
      ['threshold','触发阈值','number'],
      ['rewardList','奖励列表','reward-list']
    ];
  }
  if (data.templates.grant_multiple_buffs) {
    data.templates.grant_multiple_buffs.fields = [
      ['rewardList','奖励列表','reward-list'],
      ['consumeOn','何时消耗','consumeOn']
    ];
  }
  if (data.templates.transform_basic_attack) {
    data.templates.transform_basic_attack.fields = [
      ['attackName','变身后普攻名称','text'],
      ['damage','变身后伤害骰','text'],
      ['range','变身后距离','number'],
      ['straight','是否直线','boolean'],
      ['consumeOn','何时结束','consumeOn'],
      ['durationTurns','持续回合','durationTurns'],
      ['block','额外格挡','text'],
      ['apply','附带效果','json']
    ];
  }
})();
