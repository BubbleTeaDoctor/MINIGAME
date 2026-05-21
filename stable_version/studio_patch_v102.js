
(() => {
  const data = window.DEFAULT_STUDIO_DATA;
  if (!data) return;
  data.version = '1.0.2';

  // Ensure threshold passive examples are represented in both profession passives and cardLibrary fallback.
  Object.values(data.professions || {}).forEach(prof => {
    Object.entries(prof.passives || {}).forEach(([k,v]) => {
      data.cardLibrary = data.cardLibrary || {};
      if (!data.cardLibrary[k]) data.cardLibrary[k] = JSON.parse(JSON.stringify(v));
    });
  });
})();
