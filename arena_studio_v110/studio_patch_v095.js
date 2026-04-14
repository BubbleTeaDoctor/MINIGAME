
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.5';

  // New / corrected template definitions
  Object.assign(data.templates, {
    transform_basic_attack: {
      label: '变身并改变普通攻击',
      desc: '使用后改变当前角色的普通攻击模式，可修改射程、伤害、附带效果与持续回合。',
      fields: [
        ['attackName','变身后普攻名称','text'],
        ['damage','变身后伤害骰','text'],
        ['range','变身后距离','number'],
        ['straight','是否直线','boolean'],
        ['consumeOn','何时结束','consumeOn'],
        ['durationTurns','持续回合','durationTurns'],
        ['block','额外格挡','text'],
        ['apply','附带效果','json']
      ]
    },
    pay_life_draw_cards: {
      label: '支付生命并抽卡',
      desc: '支付生命值后抽若干张牌。',
      fields: [['lifeCost','生命代价','number'],['drawCount','抽牌数量','number']]
    }
  });

  Object.assign(data.templateDefaults, {
    transform_basic_attack: {
      attackName: '变身普攻',
      damage: '1d8',
      range: 3,
      straight: false,
      consumeOn: 'end_of_turn',
      durationTurns: 2,
      block: '0',
      apply: {}
    },
    pay_life_draw_cards: {
      lifeCost: 4,
      drawCount: 1
    }
  });

  // Make sure old saved rulesets gain a usable warlock draw option if missing.
  if (data.professions?.warlock?.cards && !data.professions.warlock.cards.lock_life_tap) {
    data.professions.warlock.cards.lock_life_tap = {
      name: '生命分流',
      source: '职业技能',
      template: 'pay_life_draw_cards',
      config: { lifeCost: 4, drawCount: 2 },
      text: '支付 4 点生命并抽 2 张牌。'
    };
  }

  // Do not force-override stormstrike values, but keep the built-in card library synced if present.
  if (data.professions?.shaman?.cards?.shaman_stormstrike) {
    data.cardLibrary = data.cardLibrary || {};
    data.cardLibrary.shaman_stormstrike = JSON.parse(JSON.stringify(data.professions.shaman.cards.shaman_stormstrike));
  }
})();
