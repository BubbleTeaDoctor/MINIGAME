
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.2';

  Object.assign(data.templates, {
    damage_then_multi_buff: {
      label: '造成伤害后获得多重增益',
      desc: '先对目标造成伤害，再按 rewardList 给予自身多个增益。',
      fields: [['damage','伤害骰','text'],['range','距离','number'],['target','目标类型','text'],['rewardList','奖励列表','json']]
    },
    damage_roll_grant_card: {
      label: '造成伤害后掷骰触发补牌',
      desc: '造成伤害后掷指定骰，达到阈值则获得指定卡，并可选择返还行动桶。',
      fields: [['damage','伤害骰','text'],['range','距离','number'],['target','目标类型','text'],['procDie','触发骰','text'],['threshold','阈值','number'],['grantedCardKey','获得卡牌 key','text'],['grantedOrigin','获得卡牌来源','text'],['refundBucket','返还行动桶','text']]
    }
  });

  Object.assign(data.templateDefaults, {
    damage_then_multi_buff: { damage: '1d6', range: 1, target: 'enemy', rewardList: [{ type: 'gain_block', value: '1d4' }] },
    damage_roll_grant_card: { damage: '1d6', range: 1, target: 'enemy', procDie: '1d6', threshold: 3, grantedCardKey: '', grantedOrigin: '职业技能', refundBucket: 'class_or_guardian' }
  });

  if (data.cardLibrary?.shaman_stormstrike) {
    data.cardLibrary.shaman_stormstrike.template = 'damage_roll_grant_card';
    data.cardLibrary.shaman_stormstrike.config = {
      damage: '1d8',
      range: 1,
      target: 'enemy',
      procDie: '1d6',
      threshold: 3,
      grantedCardKey: 'shaman_stormstrike',
      grantedOrigin: '职业技能',
      refundBucket: 'class_or_guardian'
    };
    data.cardLibrary.shaman_stormstrike.text = '造成 1D8 伤害；再掷 1D6，若结果≥3，则获得一张风暴打击并可再次打出。';
  } else if (data.professions?.shaman?.cards) {
    data.professions.shaman.cards.shaman_stormstrike = {
      name: '风暴打击',
      source: '职业技能',
      template: 'damage_roll_grant_card',
      config: { damage: '1d8', range: 1, target: 'enemy', procDie: '1d6', threshold: 3, grantedCardKey: 'shaman_stormstrike', grantedOrigin: '职业技能', refundBucket: 'class_or_guardian' },
      text: '造成 1D8 伤害；再掷 1D6，若结果≥3，则获得一张风暴打击并可再次打出。'
    };
  }

  if (data.cardLibrary?.shaman_ancestral) {
    data.cardLibrary.shaman_ancestral.template = 'damage_then_multi_buff';
    data.cardLibrary.shaman_ancestral.config = {
      damage: '1d6',
      range: 1,
      target: 'enemy',
      rewardList: [
        { type: 'gain_block', value: '1d4' },
        { type: 'heal', value: '1d4' },
        { type: 'buff_basic', value: 2 }
      ]
    };
    data.cardLibrary.shaman_ancestral.text = '先造成 1D6 伤害，再获得 1D4 格挡、恢复 1D4，并让下次普攻 +2。';
  }

  // Ensure passive text fields exist for editor friendliness
  Object.values(data.professions || {}).forEach(prof => {
    Object.values(prof.passives || {}).forEach(passive => {
      if (typeof passive.text !== 'string') passive.text = passive.text || '';
    });
    Object.values(prof.cards || {}).forEach(card => {
      if (typeof card.text !== 'string') card.text = card.text || '';
    });
  });
})();
