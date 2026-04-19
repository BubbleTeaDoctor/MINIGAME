
window.STUDIO_RUNTIME = (() => {
  const LEGACY_RULESETS_KEY = "arena_studio_rulesets_v080";
  const LEGACY_ACTIVE_KEY = "arena_studio_active_ruleset_v080";
  const STORAGE_CONFIG_KEY = "arena_studio_storage_config_v090";
  const HANDLE_DB = 'arena_studio_fs_v090';
  const HANDLE_STORE = 'handles';
  const HANDLE_KEY = 'workspace-folder';
  const DEFAULT_ID = "default";
  const deep = (o) => JSON.parse(JSON.stringify(o));

  let cacheRulesets = null;
  let cacheActiveId = DEFAULT_ID;
  let cacheConfig = null;
  let initPromise = null;
  let pendingWrite = Promise.resolve();

  function sanitizeNamespace(ns) {
    return String(ns || '').trim().replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'default';
  }

  function legacyConfig() {
    return {
      label: 'legacy-v080',
      mode: 'localStorage',
      namespace: 'legacy-v080',
      rulesetsKey: LEGACY_RULESETS_KEY,
      activeKey: LEGACY_ACTIVE_KEY,
      isLegacy: true,
      folderName: null,
    };
  }

  function namespaceConfig(ns) {
    const safe = sanitizeNamespace(ns);
    return {
      label: safe,
      mode: 'localStorage',
      namespace: safe,
      rulesetsKey: `arena_studio_rulesets_${safe}`,
      activeKey: `arena_studio_active_${safe}`,
      isLegacy: false,
      folderName: null,
    };
  }

  function folderConfig(folderName = 'workspace') {
    return {
      label: `folder:${folderName}`,
      mode: 'folder',
      namespace: 'folder-workspace',
      rulesetsKey: 'rulesets.json',
      activeKey: 'active.json',
      isLegacy: false,
      folderName,
    };
  }

  function supportsFolderPicker() {
    return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function' && !!window.indexedDB;
  }

  function baseRuleset() {
    return {
      id: DEFAULT_ID,
      name: window.DEFAULT_STUDIO_RULESET_NAME || "标准默认规则",
      editable: false,
      data: deep(window.DEFAULT_STUDIO_DATA)
    };
  }

  function mergeArrayUnique(baseArr, curArr) {
    const out = Array.isArray(curArr) ? curArr.slice() : [];
    (Array.isArray(baseArr) ? baseArr : []).forEach(item => {
      if (!out.includes(item)) out.push(item);
    });
    return out;
  }

  function mergeRulesetDataWithBase(baseData, rawData) {
    const data = deep(rawData || {});
    data.templates = Object.fromEntries(
      Object.entries(Object.assign({}, deep(baseData.templates || {}), data.templates || {})).map(([k,v]) => {
        const merged = Object.assign({}, deep(baseData.templates?.[k] || {}), deep(data.templates?.[k] || {}));
        if (baseData.templates?.[k]?.fields) merged.fields = deep(baseData.templates[k].fields);
        return [k, merged];
      })
    );
    data.templateDefaults = Object.fromEntries(
      Object.entries(Object.assign({}, deep(baseData.templateDefaults || {}), data.templateDefaults || {})).map(([k,v]) => {
        const merged = Object.assign({}, deep(baseData.templateDefaults?.[k] || {}), deep(data.templateDefaults?.[k] || {}));
        return [k, merged];
      })
    );
    data.statuses = Object.fromEntries(
      Object.entries(Object.assign({}, deep(baseData.statuses || {}), data.statuses || {})).map(([k,v]) => {
        const merged = Object.assign({}, deep(baseData.statuses?.[k] || {}), deep(data.statuses?.[k] || {}));
        if (baseData.statuses?.[k]?.fields) merged.fields = deep(baseData.statuses[k].fields);
        return [k, merged];
      })
    );
    data.cardLibrary = Object.assign({}, deep(baseData.cardLibrary || {}), data.cardLibrary || {});
    data.ruleDefaults = Object.assign({}, deep(baseData.ruleDefaults || {}), data.ruleDefaults || {});
    data.ruleDefaults.buckets = Object.assign({}, deep(baseData.ruleDefaults?.buckets || {}), data.ruleDefaults?.buckets || {});
    data.weaponLibrary = data.weaponLibrary || {};
    Object.entries(baseData.weaponLibrary || {}).forEach(([k, v]) => {
      if (!data.weaponLibrary[k]) data.weaponLibrary[k] = deep(v);
      else {
        data.weaponLibrary[k] = Object.assign({}, deep(v), data.weaponLibrary[k]);
        data.weaponLibrary[k].basic = Object.assign({}, deep(v.basic || {}), data.weaponLibrary[k].basic || {});
        data.weaponLibrary[k].cards = mergeArrayUnique(v.cards || [], data.weaponLibrary[k].cards || []);
      }
    });
    data.accessoryLibrary = data.accessoryLibrary || {};
    Object.entries(baseData.accessoryLibrary || {}).forEach(([k, v]) => {
      if (!data.accessoryLibrary[k]) data.accessoryLibrary[k] = deep(v);
      else {
        data.accessoryLibrary[k] = Object.assign({}, deep(v), data.accessoryLibrary[k]);
        data.accessoryLibrary[k].cards = mergeArrayUnique(v.cards || [], data.accessoryLibrary[k].cards || []);
      }
    });
    data.professions = data.professions || {};
    Object.entries(baseData.professions || {}).forEach(([k, v]) => {
      if (!data.professions[k]) data.professions[k] = deep(v);
      else {
        const cur = data.professions[k];
        data.professions[k] = Object.assign({}, deep(v), cur);
        data.professions[k].passives = Object.assign({}, deep(v.passives || {}), cur.passives || {});
        data.professions[k].cards = Object.assign({}, deep(v.cards || {}), cur.cards || {});
      }
    });
    return data;
  }

  function normalizeRulesets(maybeRulesets) {
    const freshDefault = baseRuleset();
    let rulesets = Array.isArray(maybeRulesets) && maybeRulesets.length ? maybeRulesets : [freshDefault];
    rulesets = rulesets.map(rs => {
      const copy = deep(rs || {});
      copy.id = copy.id || DEFAULT_ID;
      copy.name = copy.name || (copy.id === DEFAULT_ID ? freshDefault.name : '规则副本');
      copy.editable = copy.id === DEFAULT_ID ? false : copy.editable !== false;
      copy.data = mergeRulesetDataWithBase(freshDefault.data, copy.data || {});
      return copy;
    });
    const idx = rulesets.findIndex(x => x.id === DEFAULT_ID);
    if (idx === -1) rulesets.unshift(freshDefault);
    else rulesets[idx] = freshDefault;
    return rulesets;
  }

  function getStorageConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (!raw) return legacyConfig();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return legacyConfig();
      if (parsed.mode === 'folder') return folderConfig(parsed.folderName || 'workspace');
      if (parsed.isLegacy) return legacyConfig();
      return namespaceConfig(parsed.namespace || parsed.label || 'default');
    } catch {
      return legacyConfig();
    }
  }

  function setStorageConfig(config) {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    cacheConfig = config;
    return config;
  }

  function saveRulesetsToConfig(config, rulesets) {
    localStorage.setItem(config.rulesetsKey, JSON.stringify(normalizeRulesets(rulesets)));
  }

  function getActiveRulesetIdFromConfig(config) {
    return localStorage.getItem(config.activeKey) || DEFAULT_ID;
  }

  function setActiveRulesetIdToConfig(config, id) {
    localStorage.setItem(config.activeKey, id);
  }

  function loadRulesetsFromConfig(config) {
    const raw = localStorage.getItem(config.rulesetsKey);
    const freshDefault = baseRuleset();
    if (!raw) {
      const initial = [freshDefault];
      saveRulesetsToConfig(config, initial);
      setActiveRulesetIdToConfig(config, DEFAULT_ID);
      return initial;
    }
    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeRulesets(parsed);
      saveRulesetsToConfig(config, normalized);
      return normalized;
    } catch {
      const initial = [freshDefault];
      saveRulesetsToConfig(config, initial);
      setActiveRulesetIdToConfig(config, DEFAULT_ID);
      return initial;
    }
  }

  function openHandleDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(HANDLE_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getStoredFolderHandle() {
    if (!supportsFolderPicker()) return null;
    try {
      const db = await openHandleDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(HANDLE_STORE, 'readonly');
        const store = tx.objectStore(HANDLE_STORE);
        const req = store.get(HANDLE_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async function setStoredFolderHandle(handle) {
    if (!supportsFolderPicker()) return false;
    const db = await openHandleDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      const store = tx.objectStore(HANDLE_STORE);
      const req = store.put(handle, HANDLE_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function clearStoredFolderHandle() {
    if (!supportsFolderPicker()) return false;
    const db = await openHandleDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      const store = tx.objectStore(HANDLE_STORE);
      const req = store.delete(HANDLE_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async function ensureFolderPermission(handle, write = true) {
    if (!handle) return false;
    try {
      const opts = write ? { mode: 'readwrite' } : {};
      if (handle.queryPermission) {
        const current = await handle.queryPermission(opts);
        if (current === 'granted') return true;
      }
      if (handle.requestPermission) {
        const requested = await handle.requestPermission(opts);
        return requested === 'granted';
      }
      return true;
    } catch {
      return false;
    }
  }

  async function readTextFile(handle, name) {
    try {
      const fileHandle = await handle.getFileHandle(name);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch {
      return null;
    }
  }

  async function writeTextFile(handle, name, text) {
    const fileHandle = await handle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(text);
    await writable.close();
  }

  async function loadFolderSnapshot(handle) {
    const rawRulesets = await readTextFile(handle, 'rulesets.json');
    const rawActive = await readTextFile(handle, 'active.json');
    let rulesets = null;
    let activeId = DEFAULT_ID;
    try { rulesets = JSON.parse(rawRulesets); } catch { rulesets = null; }
    try { activeId = JSON.parse(rawActive || '{}').activeId || DEFAULT_ID; } catch { activeId = DEFAULT_ID; }
    rulesets = normalizeRulesets(rulesets);
    return { rulesets, activeId };
  }

  async function flushFolderSnapshot() {
    if (!cacheConfig || cacheConfig.mode !== 'folder') return;
    const handle = await getStoredFolderHandle();
    if (!handle) return;
    const granted = await ensureFolderPermission(handle, true);
    if (!granted) return;
    await writeTextFile(handle, 'rulesets.json', JSON.stringify(normalizeRulesets(cacheRulesets), null, 2));
    await writeTextFile(handle, 'active.json', JSON.stringify({ activeId: cacheActiveId }, null, 2));
  }

  function queueFolderFlush() {
    pendingWrite = pendingWrite.then(() => flushFolderSnapshot()).catch(console.error);
    return pendingWrite;
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      cacheConfig = getStorageConfig();
      if (cacheConfig.mode === 'folder') {
        const handle = await getStoredFolderHandle();
        const granted = await ensureFolderPermission(handle, true);
        if (handle && granted) {
          const snap = await loadFolderSnapshot(handle);
          cacheRulesets = snap.rulesets;
          cacheActiveId = snap.activeId;
          await flushFolderSnapshot();
        } else {
          cacheRulesets = normalizeRulesets(null);
          cacheActiveId = DEFAULT_ID;
        }
      } else {
        cacheRulesets = loadRulesetsFromConfig(cacheConfig);
        cacheActiveId = getActiveRulesetIdFromConfig(cacheConfig);
      }
      return true;
    })();
    return initPromise;
  }

  function requireCache() {
    if (!cacheConfig) cacheConfig = getStorageConfig();
    if (!cacheRulesets) {
      if (cacheConfig.mode === 'folder') {
        cacheRulesets = normalizeRulesets(null);
        cacheActiveId = DEFAULT_ID;
      } else {
        cacheRulesets = loadRulesetsFromConfig(cacheConfig);
        cacheActiveId = getActiveRulesetIdFromConfig(cacheConfig);
      }
    }
  }

  function loadRulesets() {
    requireCache();
    return normalizeRulesets(deep(cacheRulesets));
  }

  function saveRulesets(rulesets) {
    requireCache();
    cacheRulesets = normalizeRulesets(deep(rulesets));
    if (cacheConfig.mode === 'folder') queueFolderFlush();
    else saveRulesetsToConfig(cacheConfig, cacheRulesets);
    return loadRulesets();
  }

  function getActiveRulesetId() {
    requireCache();
    return cacheActiveId || DEFAULT_ID;
  }

  function setActiveRulesetId(id) {
    requireCache();
    cacheActiveId = id || DEFAULT_ID;
    if (cacheConfig.mode === 'folder') queueFolderFlush();
    else setActiveRulesetIdToConfig(cacheConfig, cacheActiveId);
    return cacheActiveId;
  }

  function findRuleset(id) {
    const rulesets = loadRulesets();
    return rulesets.find(x => x.id === id) || rulesets[0];
  }

  function updateRuleset(id, updater) {
    const rulesets = loadRulesets();
    const idx = rulesets.findIndex(x => x.id === id);
    if (idx < 0) return null;
    const copy = deep(rulesets[idx]);
    updater(copy);
    rulesets[idx] = copy;
    saveRulesets(rulesets);
    return copy;
  }

  function duplicateRuleset(id, newName) {
    const source = findRuleset(id);
    const rulesets = loadRulesets();
    const newId = 'rs_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 9999).toString(36);
    const copy = deep(source);
    copy.id = newId;
    copy.name = newName || `${source.name} 副本`;
    copy.editable = true;
    rulesets.push(copy);
    saveRulesets(rulesets);
    setActiveRulesetId(newId);
    return copy;
  }

  function deleteRuleset(id) {
    if (id === DEFAULT_ID) return false;
    const rulesets = loadRulesets().filter(x => x.id !== id);
    saveRulesets(rulesets);
    if (getActiveRulesetId() === id) setActiveRulesetId(DEFAULT_ID);
    return true;
  }

  function renameRuleset(id, name) {
    return updateRuleset(id, r => { r.name = name || r.name; });
  }

  function switchStorageNamespace(namespace, options = {}) {
    requireCache();
    const copyCurrent = options.copyCurrent !== false;
    const prevRulesets = loadRulesets();
    const prevActive = getActiveRulesetId();
    const nextConfig = namespaceConfig(namespace);
    setStorageConfig(nextConfig);
    cacheConfig = nextConfig;
    if (copyCurrent) {
      cacheRulesets = normalizeRulesets(prevRulesets);
      cacheActiveId = prevActive;
      saveRulesetsToConfig(nextConfig, cacheRulesets);
      setActiveRulesetIdToConfig(nextConfig, cacheActiveId);
    } else {
      cacheRulesets = loadRulesetsFromConfig(nextConfig);
      cacheActiveId = getActiveRulesetIdFromConfig(nextConfig);
    }
    return nextConfig;
  }

  async function chooseWorkspaceFolder(options = {}) {
    if (!supportsFolderPicker()) throw new Error('folder-picker-unsupported');
    requireCache();
    const copyCurrent = options.copyCurrent !== false;
    const prevRulesets = loadRulesets();
    const prevActive = getActiveRulesetId();
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const granted = await ensureFolderPermission(handle, true);
    if (!granted) throw new Error('folder-permission-denied');
    await setStoredFolderHandle(handle);
    const nextConfig = folderConfig(handle.name || 'workspace');
    setStorageConfig(nextConfig);
    cacheConfig = nextConfig;
    if (copyCurrent) {
      cacheRulesets = normalizeRulesets(prevRulesets);
      cacheActiveId = prevActive;
    } else {
      const snap = await loadFolderSnapshot(handle);
      cacheRulesets = snap.rulesets;
      cacheActiveId = snap.activeId;
    }
    await flushFolderSnapshot();
    return getStorageInfo();
  }

  async function resetStorageToLegacy(options = {}) {
    requireCache();
    const copyCurrent = options.copyCurrent !== false;
    const prevRulesets = loadRulesets();
    const prevActive = getActiveRulesetId();
    const nextConfig = legacyConfig();
    setStorageConfig(nextConfig);
    cacheConfig = nextConfig;
    if (copyCurrent) {
      cacheRulesets = normalizeRulesets(prevRulesets);
      cacheActiveId = prevActive;
      saveRulesetsToConfig(nextConfig, cacheRulesets);
      setActiveRulesetIdToConfig(nextConfig, cacheActiveId);
    } else {
      cacheRulesets = loadRulesetsFromConfig(nextConfig);
      cacheActiveId = getActiveRulesetIdFromConfig(nextConfig);
    }
    return nextConfig;
  }

  async function clearWorkspaceFolderBinding() {
    await clearStoredFolderHandle();
    return true;
  }

  function getStorageInfo() {
    requireCache();
    const cfg = cacheConfig || getStorageConfig();
    return {
      mode: cfg.mode,
      namespace: cfg.namespace,
      label: cfg.label,
      rulesetsKey: cfg.rulesetsKey,
      activeKey: cfg.activeKey,
      isLegacy: !!cfg.isLegacy,
      activeRulesetId: cacheActiveId || DEFAULT_ID,
      folderName: cfg.folderName || null,
      supportsFolderPicker: supportsFolderPicker(),
    };
  }

  return {
    init,
    loadRulesets, saveRulesets, getActiveRulesetId, setActiveRulesetId,
    findRuleset, updateRuleset, duplicateRuleset, deleteRuleset, renameRuleset,
    switchStorageNamespace, chooseWorkspaceFolder, resetStorageToLegacy, clearWorkspaceFolderBinding,
    getStorageConfig, getStorageInfo, supportsFolderPicker,
    DEFAULT_ID
  };
})();
