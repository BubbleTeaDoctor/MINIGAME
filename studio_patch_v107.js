
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.10.7';

  data.templates = data.templates || {};
  data.templateDefaults = data.templateDefaults || {};

  data.templates.insert_negative_card_into_target_deck = Object.assign({}, data.templates.insert_negative_card_into_target_deck || {}, {
    label: '埋炸弹/插负面牌',
    desc: '在一定距离内指定目标，并向目标牌库加入负面牌。',
    fields: [
      ['range','距离','number'],
      ['insertCardKey','插入负面牌','negative-card-select'],
      ['insertCount','数量','number'],
      ['triggerCondition','触发条件','triggerCondition'],
      ['shuffleIntoDeck','是否洗入牌库','boolean']
    ]
  });

  data.templateDefaults.insert_negative_card_into_target_deck = Object.assign({
    range: 4,
    insertCardKey: '',
    insertCount: 1,
    triggerCondition: 'on_hit',
    shuffleIntoDeck: true
  }, data.templateDefaults.insert_negative_card_into_target_deck || {});
})();
