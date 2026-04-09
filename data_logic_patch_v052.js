(() => {
  if (!window.GAME_DATA || !window.GAME_DATA.classes) return;
  const classes = window.GAME_DATA.classes;
  Object.values(classes).forEach((entry) => {
    if (!entry.logic) entry.logic = { moveLockThreshold: 0, moveLockAppliesTo: 'none' };
  });
  if (classes.mage) {
    classes.mage.logic.moveLockThreshold = 3;
    classes.mage.logic.moveLockAppliesTo = 'class_only';
    classes.mage.logic.note = '移动超过 3 格后，仅禁用职业技能；武器和饰品技能仍可正常使用。';
  }
})();
