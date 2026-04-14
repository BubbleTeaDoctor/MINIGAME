
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.4';

  Object.assign(data.templates, {
    damage_then_multi_buff: {
      label: '造成伤害后获得多重增益',
      desc: '先造成伤害；若原始伤害达到阈值，则按 rewardList 获得多个增益。',
      fields: [['damage','伤害骰','text'],['range','距离','number'],['target','目标类型','text'],['threshold','触发阈值','number'],['rewardList','奖励列表','reward-list']]
    },
    grant_multiple_buffs: {
      label: '使用后直接获得多种增益',
      desc: '不造成伤害，直接按 rewardList 对自身施加多个增益。',
      fields: [['rewardList','奖励列表','reward-list'],['consumeOn','何时消耗','text']]
    },
    transform_basic_attack: {
      label: '变身并改变普通攻击',
      desc: '使用后改变当前角色的普通攻击模式，可修改射程、伤害和附带特效。',
      fields: [['attackName','变身后普攻名称','text'],['damage','变身后伤害骰','text'],['range','变身后距离','number'],['straight','是否直线','boolean'],['consumeOn','何时结束','text'],['block','额外格挡','text'],['apply','附带效果','json']]
    }
  });

  Object.assign(data.templateDefaults, {
    damage_then_multi_buff: {
      damage: '1d6', range: 1, target: 'enemy', threshold: 0,
      rewardList: [{ type: 'gain_block', value: '1d4' }]
    },
    grant_multiple_buffs: {
      rewardList: [{ type: 'gain_block', value: '1d4' }, { type: 'buff_basic', value: 2 }],
      consumeOn: 'immediate'
    },
    transform_basic_attack: {
      attackName: '变身普攻', damage: '1d8', range: 3, straight: false, consumeOn: 'next_basic_attack', block: '0', apply: {}
    }
  });

  // Ensure the built-in edited Shaman card isn't forced back to old values when user has a saved override.
  if (data.professions?.shaman?.cards?.shaman_stormstrike && !data.professions.shaman.cards.shaman_stormstrike.text) {
    data.professions.shaman.cards.shaman_stormstrike.text = '造成伤害；再掷触发骰，达到阈值则获得一张风暴打击并可再次行动。';
  }

  // Example transform card for stable ruleset exploration.
  if (data.professions?.warlock?.cards && !data.professions.warlock.cards.lock_metamorphosis) {
    data.professions.warlock.cards.lock_metamorphosis = {
      name: '恶魔变身',
      source: '职业技能',
      template: 'transform_basic_attack',
      config: {
        attackName: '恶魔烈爪',
        damage: '1d10',
        range: 4,
        straight: true,
        consumeOn: 'next_basic_attack',
        block: '1d6',
        apply: { burn: 1 }
      },
      text: '变身后普通攻击变为远程直线攻击，并附带点燃。'
    };
  }
})();
