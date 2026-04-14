(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.8.4';

  // Hard-fix profession naming regression.
  if (data.professions.warlock) {
    data.professions.warlock.name = '术士';
    data.professions.warlock.key = 'warlock';
  }

  // Continue restoring Shaman and Warlock card pools on top of the stable v0.79 framework.
  Object.assign(data.cardLibrary, {
    shaman_tide: {
      name: '潮汐之涌',
      source: '职业技能',
      template: 'self_buff',
      config: { heal: '1d6', block: '1d4', consumeOn: 'immediate' },
      text: '恢复 1D6 并获得 1D4 格挡。'
    },
    shaman_earthbind: {
      name: '地缚',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d4', range: 4, target: 'enemy', spell: true, apply: { slow: 1 } },
      text: '造成 1D4 法术伤害并减速。'
    },
    lock_siphon: {
      name: '灵魂虹吸',
      source: '职业技能',
      template: 'direct_damage',
      config: { damage: '1d6', range: 4, target: 'enemy', spell: true },
      text: '造成 1D6 法术伤害。'
    },
    lock_hellfire: {
      name: '地狱烈焰',
      source: '职业技能',
      template: 'aoe',
      config: { damage: '1d8', range: 4, radius: 1, spell: true },
      text: '对目标点周围 1 格造成 1D8 法术伤害。'
    }
  });

  if (data.professions.shaman) {
    Object.assign(data.professions.shaman.cards, {
      shaman_chain: data.cardLibrary.shaman_chain || data.professions.shaman.cards.shaman_chain,
      shaman_spiritwalk: data.cardLibrary.shaman_spiritwalk || data.professions.shaman.cards.shaman_spiritwalk,
      shaman_tide: data.cardLibrary.shaman_tide,
      shaman_earthbind: data.cardLibrary.shaman_earthbind
    });
    data.professions.shaman.name = '萨满';
  }

  if (data.professions.warlock) {
    Object.assign(data.professions.warlock.cards, {
      lock_soulfire: data.professions.warlock.cards.lock_soulfire,
      lock_nightdash: data.professions.warlock.cards.lock_nightdash,
      lock_leech: data.professions.warlock.cards.lock_leech,
      lock_shadowflame: data.professions.warlock.cards.lock_shadowflame,
      lock_bloodpact: data.cardLibrary.lock_bloodpact || data.professions.warlock.cards.lock_bloodpact,
      lock_doom: data.cardLibrary.lock_doom || data.professions.warlock.cards.lock_doom,
      lock_siphon: data.cardLibrary.lock_siphon,
      lock_hellfire: data.cardLibrary.lock_hellfire
    });
  }
})();
