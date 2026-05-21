
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.9.3';

  Object.assign(data.templates, {
    grant_multiple_buffs: {
      label: '使用后直接获得多种增益',
      desc: '不造成伤害，直接按 rewardList 对自身施加多个增益。',
      fields: [['rewardList','奖励列表','json'],['consumeOn','何时消耗','text']]
    }
  });

  Object.assign(data.templateDefaults, {
    grant_multiple_buffs: {
      rewardList: [
        { type: 'gain_block', value: '1d4' },
        { type: 'buff_basic', value: 2 }
      ],
      consumeOn: 'immediate'
    }
  });

  // Do not hard-overwrite editable profession cards like 风暴打击.
  // Only seed built-in data if the card is absent.
  if (data.professions?.shaman?.cards && !data.professions.shaman.cards.shaman_stormstrike) {
    data.professions.shaman.cards.shaman_stormstrike = {
      name: '风暴打击',
      source: '职业技能',
      template: 'damage_roll_grant_card',
      config: {
        damage: '1d8',
        range: 1,
        target: 'enemy',
        procDie: '1d6',
        threshold: 3,
        grantedCardKey: 'shaman_stormstrike',
        grantedOrigin: '职业技能',
        refundBucket: 'class_or_guardian'
      },
      text: '造成 1D8 伤害；再掷 1D6，若结果≥3，则获得一张风暴打击并可再次打出。'
    };
  }

  if (data.professions?.shaman?.cards && !data.professions.shaman.cards.shaman_stone_skin) {
    data.professions.shaman.cards.shaman_stone_skin = {
      name: '石肤护佑',
      source: '职业技能',
      template: 'grant_multiple_buffs',
      config: {
        rewardList: [
          { type: 'gain_block', value: '1d6' },
          { type: 'heal', value: '1d4' },
          { type: 'buff_basic', value: 1 }
        ],
        consumeOn: 'immediate'
      },
      text: '直接获得 1D6 格挡、恢复 1D4，并让下次普攻 +1。'
    };
  }

  Object.values(data.professions || {}).forEach(prof => {
    Object.values(prof.passives || {}).forEach(passive => {
      if (typeof passive.text !== 'string') passive.text = passive.text || '';
    });
    Object.values(prof.cards || {}).forEach(card => {
      if (typeof card.text !== 'string') card.text = card.text || '';
    });
  });
})();
