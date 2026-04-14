(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '0.8.5';
  data.ruleDefaults = data.ruleDefaults || {};
  data.ruleDefaults.drawOpening = 6;
  data.ruleDefaults.drawPerTurn = 2;
  data.ruleDefaults.handLimit = 10;
  if (data.professions?.warlock) data.professions.warlock.name = '术士';
})();
