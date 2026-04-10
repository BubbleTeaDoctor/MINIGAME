// Studio game bootstrap v0.9.7
// Purpose: bridge Studio data files to the game shell and UI wiring.
// This file connects:
// - game_screen_shell_v096.html
// - game_ui_wiring_v095.js
// - studio_data_v084_necro_hunter.json or compatible data
// and provides safe defaults for weapons/accessories so dropdowns are never empty.

(function (global) {
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureObject(value) {
    return value && typeof value === 'object' ? value : {};
  }

  function normalizeStudioPayload(raw) {
    const root = ensureObject(raw);
    const studioData = ensureObject(root.studioData || root);

    const professions = ensureObject(studioData.professions);
    const cards = ensureObject(studioData.cards);
    const weapons = ensureObject(studioData.weapons);
    const accessories = ensureObject(studioData.accessories);

    return {
      professions: deepClone(professions),
      cards: deepClone(cards),
      weapons: buildWeaponCatalog(weapons),
      accessories: buildAccessoryCatalog(accessories),
    };
  }

  function buildWeaponCatalog(existing) {
    const base = ensureObject(existing);
    if (Object.keys(base).length > 0) return deepClone(base);
    return {
      default_weapon: {
        name: '默认武器',
        basicAttack: { damage: '1d6', range: 1, straight: false },
      },
      greatsword: {
        name: '巨剑',
        basicAttack: { damage: '1d8', range: 1, straight: false },
      },
      longbow: {
        name: '长弓',
        basicAttack: { damage: '1d6', range: 5, straight: true },
      },
      dagger: {
        name: '匕首',
        basicAttack: { damage: '1d4', range: 1, straight: false },
      }
    };
  }

  function buildAccessoryCatalog(existing) {
    const base = ensureObject(existing);
    if (Object.keys(base).length > 0) return deepClone(base);
    return {
      default_accessory: {
        name: '默认饰品'
      },
      linkens: {
        name: '林肯法球'
      },
      pocket_trap: {
        name: '口袋陷阱'
      },
      dawn_hope: {
        name: '希望曙光'
      }
    };
  }

  function attachProfessionMoveDefaults(data) {
    const melee = new Set(['warrior', 'rogue', 'swordsman']);
    Object.entries(data.professions || {}).forEach(([key, profession]) => {
      profession.base = profession.base || {};
      if (!Number.isFinite(profession.base.move)) {
        profession.base.move = melee.has(key) ? 5 : 3;
      }
    });
    return data;
  }

  function enrichCardsWithIds(data) {
    Object.entries(data.cards || {}).forEach(([key, card]) => {
      if (!card.key) card.key = key;
      if (!card.source) card.source = '职业技能';
      if (!card.template) card.template = 'direct_damage';
      if (!card.config) card.config = {};
    });
    return data;
  }

  function resolveDataSource() {
    if (global.__STUDIO_GAME_DATA__) return normalizeStudioPayload(global.__STUDIO_GAME_DATA__);
    if (global.STUDIO_DATA_V084) return normalizeStudioPayload(global.STUDIO_DATA_V084);
    if (global.studioDataV084) return normalizeStudioPayload(global.studioDataV084);
    return normalizeStudioPayload({ studioData: { professions: {}, cards: {} } });
  }

  function bootFromResolvedData() {
    const data = enrichCardsWithIds(attachProfessionMoveDefaults(resolveDataSource()));
    if (!global.GameUiWiringV095 || typeof global.GameUiWiringV095.bindStartScreen !== 'function') {
      console.warn('GameUiWiringV095 is missing; cannot bind start screen yet.');
      return data;
    }
    global.GameUiWiringV095.bindStartScreen(data);
    return data;
  }

  function autoBoot() {
    return bootFromResolvedData();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      autoBoot();
    });
  }

  global.StudioGameBootstrapV097 = {
    normalizeStudioPayload,
    buildWeaponCatalog,
    buildAccessoryCatalog,
    attachProfessionMoveDefaults,
    enrichCardsWithIds,
    resolveDataSource,
    bootFromResolvedData,
    autoBoot,
  };
})(typeof window !== 'undefined' ? window : globalThis);
