(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.10.4';

  const normalizeType = (v) => ({
    'effective_damage':'dealt_damage',
    '造成伤害':'dealt_damage',
    'damage':'dealt_damage',
    'raw_damage':'dealt_damage',
    'dealt_damage':'dealt_damage'
  })[String(v)] || String(v);

  function normalizeCard(card){
    if (!card || !card.template) return;
    card.config = card.config || {};
    const cfg = card.config;
    if (card.template === 'threshold_reward_once_per_turn'){
      const n = Number(cfg.thresholdValue ?? cfg.threshold ?? cfg.damageThreshold ?? 0);
      cfg.thresholdType = normalizeType(cfg.thresholdType || cfg.checkType || 'dealt_damage');
      cfg.thresholdValue = n;
      cfg.threshold = n;
      cfg.damageThreshold = n;
    }
  }

  Object.values(data.professions || {}).forEach(prof => {
    Object.values(prof.passives || {}).forEach(normalizeCard);
  });
  Object.values(data.cardLibrary || {}).forEach(normalizeCard);
})();
