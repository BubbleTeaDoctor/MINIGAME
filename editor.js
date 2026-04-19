
(() => {
  const $ = id => document.getElementById(id);
  const deep = o => JSON.parse(JSON.stringify(o));
  const STORAGE_KEYS = null;
  const state = {
    rulesetId: null,
    scope: 'cards',
    profession: 'warrior',
    entryKey: null,
    original: null,
    current: null,
    rulesetCache: null,
  };
  const I18N = () => window.STUDIO_I18N || { t:(k,f)=>f||k, entity:(type,key,fb)=>fb||key };

  const FIELD_OPTIONS = {
    target: [['enemy','enemy'],['tile','tile'],['self','self'],['ally','ally'],['all_enemies','all_enemies']],
    consumeOn: [['next_basic_attack','next_basic_attack'],['next_damage','next_damage'],['next_spell_hit','next_spell_hit'],['manual','manual'],['end_of_turn','end_of_turn'],['start_of_turn','start_of_turn'],['never','never'],['until_triggered','until_triggered'],['next_basic_attack_or_class_skill','next_basic_attack_or_class_skill']],
    reactiveMoveTrigger: [['','(空)'],['on_targeted','on_targeted'],['on_damaged','on_damaged']],
    tickTiming: [['turn_start','turn_start'],['turn_end','turn_end'],['on_draw','on_draw']],
    rounding: [['floor','floor'],['ceil','ceil'],['round','round']],
    durationTurns: [['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6'],['7','7'],['8','8'],['9','9'],['10','10']],
    origin: [['','(空)'],['职业技能','职业技能'],['武器技能','武器技能'],['饰品技能','饰品技能'],['职业被动','职业被动']],
    refundBucket: [['','不返还'],['class_or_guardian','返还职业卡次数'],['weapon_or_accessory','返还武器/饰品卡次数'],['basic_attack','返还普通攻击次数']],
    controlType: [['stun','stun'],['root','root'],['disarm','disarm'],['sheep','sheep'],['silence','silence']],
    stackRule: [['refresh','refresh'],['stack','stack'],['replace','replace'],['refresh_duration','refresh_duration']],
    triggerCondition: [['on_hit','on_hit'],['on_draw','on_draw'],['on_enter','on_enter'],['turn_start','turn_start'],['turn_end','turn_end']],
    tokenKind: [['trap_once_negative','一次性陷阱（触发插负面牌）'],['permanent_pillar','永久柱体'],['auto_turret','自动炮塔']],
    timing: [['after_move','after_move'],['turn_start','turn_start'],['turn_end','turn_end'],['on_card_use','on_card_use']],
    checkAt: [['turn_start','turn_start'],['turn_end','turn_end']],
    rewardType: [['gain_block','获得格挡'],['heal','恢复生命'],['draw','抽牌'],['buff_basic','普攻加值'],['bonus_die','额外骰'],['extra_basic_cap','额外普攻次数'],['extra_class_card_use','额外职业卡次数'],['spell_immune','法术无效'],['dodge_next_damage','闪避下一次伤害'],['card','获得卡牌'],['block','block'],['buff','buff']],
    thresholdType: [['dealt_damage','造成伤害'],['cards_used','cards_used'],['damage_taken','damage_taken'],['summon_count','summon_count'],['distance_moved','distance_moved']],
    attackType: [['basic','basic'],['spell','spell'],['any','any']],
    onDrawEffect: [['damage','damage'],['discard','discard'],['status','status']],
    bonusType: [['buffBasic','buffBasic'],['bonusDie','bonusDie'],['draw','draw'],['block','block']],
    affectedBuckets: [['class','class'],['weapon','weapon'],['accessory','accessory']],
    exceptionBuckets: [['class','class'],['weapon','weapon'],['accessory','accessory']],
  };

  function currentRuleset(){ return state.rulesetCache; }
  function currentEntityCollection(){
    if (state.scope === 'weapon_cards') return currentRuleset().data.weaponLibrary || {};
    if (state.scope === 'accessory_cards') return currentRuleset().data.accessoryLibrary || {};
    if (state.scope === 'negative_cards') return { negative_cards: { name: '负面牌库', cards: [] } };
    return currentRuleset().data.professions || {};
  }
  function currentEntity(){ return currentEntityCollection()[state.profession]; }
  function currentProf(){ return currentEntity(); }
  function entries(){
    const entity = currentEntity();
    if (!entity) return {};
    if (state.scope === 'cards') return entity.cards || {};
    if (state.scope === 'passives') return entity.passives || {};
    if (state.scope === 'weapon_cards' || state.scope === 'accessory_cards') {
      const out = {};
      (entity.cards || []).forEach(cardKey => {
        if (currentRuleset().data.cardLibrary?.[cardKey]) out[cardKey] = currentRuleset().data.cardLibrary[cardKey];
      });
      return out;
    }
    if (state.scope === 'negative_cards') {
      const out = {};
      Object.entries(currentRuleset().data.cardLibrary || {}).forEach(([cardKey, card]) => {
        if (card?.source === '负面牌' || card?.negativeOnDraw || String(card?.template || '').startsWith('negative_')) out[cardKey] = card;
      });
      return out;
    }
    return {};
  }
  function currentEntityLabel(){
    if (state.scope === 'weapon_cards') return '武器';
    if (state.scope === 'accessory_cards') return '饰品';
    if (state.scope === 'negative_cards') return '负面牌';
    return '职业';
  }
  function currentEntityName(){
    return state.scope === 'negative_cards' ? '负面牌库' : (currentEntity()?.name || state.profession);
  }


  function forceTemplateSchemas(rs){
    rs.data = rs.data || {};
    rs.data.templates = rs.data.templates || {};
    rs.data.templateDefaults = rs.data.templateDefaults || {};

    rs.data.templates.insert_negative_card_into_target_deck = Object.assign(
      {},
      rs.data.templates.insert_negative_card_into_target_deck || {},
      {
        label: '埋炸弹/插负面牌',
        desc: '在一定距离内指定目标，并向目标牌库加入负面牌。',
        fields: [
          ['range','距离','number'],
          ['insertCardKey','插入负面牌','negative-card-select'],
          ['insertCount','数量','number'],
          ['triggerCondition','触发条件','triggerCondition'],
          ['shuffleIntoDeck','是否洗入牌库','boolean']
        ]
      }
    );
    rs.data.templateDefaults.insert_negative_card_into_target_deck = Object.assign(
      { range: 4, insertCardKey: '', insertCount: 1, triggerCondition: 'on_hit', shuffleIntoDeck: true },
      rs.data.templateDefaults.insert_negative_card_into_target_deck || {}
    );

    rs.data.templates.create_map_token = Object.assign(
      {},
      rs.data.templates.create_map_token || {},
      {
        label: '在地图上创造 Token',
        desc: '在指定地块放置陷阱、永久柱体或自动炮塔。',
        fields: [
          ['range','放置距离','number'],
          ['tokenName','Token 名称','text'],
          ['tokenKind','Token 类型','tokenKind'],
          ['durationTurns','持续回合','durationTurns'],
          ['damage','伤害','text'],
          ['insertCardKey','插入负面牌','negative-card-select'],
          ['insertCount','插入数量','number'],
          ['attackRange','炮塔射程','number'],
          ['controlType','控制效果','controlType'],
          ['controlDuration','控制回合','number'],
          ['blocking','阻挡碰撞','boolean']
        ]
      }
    );
    rs.data.templateDefaults.create_map_token = Object.assign(
      { range: 3, tokenName: '陷阱', tokenKind: 'trap_once_negative', durationTurns: 2, damage: '2d6', insertCardKey: '', insertCount: 1, attackRange: 4, controlType: '', controlDuration: 1, blocking: false },
      rs.data.templateDefaults.create_map_token || {}
    );
    return rs;
  }

  function mergeLatestSchemasIntoRuleset(rs){
    const latest = window.DEFAULT_STUDIO_DATA || {};
    rs.data = rs.data || {};
    const oldTemplates = deep(rs.data.templates || {});
    const latestTemplates = deep(latest.templates || {});
    rs.data.templates = Object.fromEntries(Object.entries(Object.assign({}, oldTemplates, latestTemplates)).map(([k,v]) => [k, Object.assign({}, deep(oldTemplates[k] || {}), deep(latestTemplates[k] || {}))]));
    const oldDefaults = deep(rs.data.templateDefaults || {});
    const latestDefaults = deep(latest.templateDefaults || {});
    rs.data.templateDefaults = Object.fromEntries(Object.entries(Object.assign({}, oldDefaults, latestDefaults)).map(([k,v]) => [k, Object.assign({}, deep(oldDefaults[k] || {}), deep(latestDefaults[k] || {}))]));
    rs.data.statuses = Object.assign({}, deep(rs.data.statuses || {}), deep(latest.statuses || {}));
    rs.data.ruleDefaults = Object.assign({}, deep(rs.data.ruleDefaults || {}), deep(latest.ruleDefaults || {}));
    return forceTemplateSchemas(rs);
  }

  function loadRulesetIntoState(id) {
    state.rulesetId = id;
    STUDIO_RUNTIME.setActiveRulesetId(id);
    state.rulesetCache = mergeLatestSchemasIntoRuleset(deep(STUDIO_RUNTIME.findRuleset(id)));
    if (!state.rulesetCache.data.professions[state.profession]) {
      state.profession = Object.keys(state.rulesetCache.data.professions)[0];
    }
  }

  function ensureEditableRuleset() {
    if (currentRuleset().editable) return false;
    const source = currentRuleset();
    const duplicated = STUDIO_RUNTIME.duplicateRuleset(state.rulesetId, `${source.name} 副本`);
    loadRulesetIntoState(duplicated.id);
    renderRulesets();
    renderProfessions();
    renderEntries();
    alert('已自动复制默认规则，请在副本上继续编辑。');
    return true;
  }

  function persistRuleset(showAlert=false, alertText='规则副本已保存。') {
    STUDIO_RUNTIME.updateRuleset(state.rulesetId, rs => {
      rs.name = (($('ruleset-name') && $('ruleset-name').value) || rs.name || '未命名规则').trim() || rs.name;
      rs.data = deep(state.rulesetCache.data);
    });
    state.rulesetCache = deep(STUDIO_RUNTIME.findRuleset(state.rulesetId));
    renderRulesets();
    renderProfessions();
    renderEntries();
    renderForm();
    if (showAlert) alert(alertText);
  }

  function syncCurrentEntryToCache() {
    if (!state.current || !state.entryKey) return;
    const entity = currentEntity();
    currentRuleset().data.cardLibrary = currentRuleset().data.cardLibrary || {};
    const normalized = normalizeTemplateConfig(deep(state.current));
    state.current = deep(normalized);
    if (state.scope === 'cards') {
      entity.cards[state.entryKey] = deep(normalized);
      currentRuleset().data.cardLibrary[state.entryKey] = deep(normalized);
    } else if (state.scope === 'passives') {
      entity.passives[state.entryKey] = deep(normalized);
      currentRuleset().data.cardLibrary[state.entryKey] = deep(normalized);
    } else if (state.scope === 'weapon_cards' || state.scope === 'accessory_cards') {
      currentRuleset().data.cardLibrary[state.entryKey] = deep(normalized);
      entity.cards = entity.cards || [];
      if (!entity.cards.includes(state.entryKey)) entity.cards.push(state.entryKey);
    } else if (state.scope === 'negative_cards') {
      normalized.source = '负面牌';
      currentRuleset().data.cardLibrary[state.entryKey] = deep(normalized);
    }
  }


  function normalizeTemplateConfig(card){
    if (!card || !card.template) return card;
    card.config = card.config || {};
    const cfg = card.config;
    if (card.template === 'threshold_reward_once_per_turn'){
      const typeMap = {
        'effective_damage': 'dealt_damage',
        '造成伤害': 'dealt_damage',
        'damage': 'dealt_damage',
        'raw_damage': 'dealt_damage',
        'dealt_damage': 'dealt_damage'
      };
      cfg.thresholdType = typeMap[String(cfg.thresholdType || cfg.checkType || 'dealt_damage')] || String(cfg.thresholdType || 'dealt_damage');
      const n = Number(cfg.thresholdValue ?? cfg.threshold ?? cfg.damageThreshold ?? 0);
      cfg.thresholdValue = n;
      cfg.threshold = n;
      cfg.damageThreshold = n;
    }
    if (card.template === 'damage_then_multi_buff'){
      const n = Number(cfg.threshold ?? cfg.thresholdValue ?? cfg.damageThreshold ?? 0);
      cfg.threshold = n;
      cfg.thresholdValue = n;
    }
    return card;
  }

  function renderStorageInfo() {
    const host = $('storage-info');
    if (!host) return;
    const rs = currentRuleset();
    const info = STUDIO_RUNTIME.getStorageInfo();
    host.textContent =
      `mode: ${info.mode}
` +
      `namespace: ${info.namespace}
` +
      `folder: ${info.folderName || '-'}
` +
      `rulesets key: ${info.rulesetsKey}
` +
      `active key: ${info.activeKey}
` +
      `当前副本 ID: ${rs.id}`;
    if ($('storage-namespace')) $('storage-namespace').value = info.mode === 'localStorage' && !info.isLegacy ? info.namespace : '';
  }

  function applyStorageNamespace() {
    const typed = (($('storage-namespace') && $('storage-namespace').value) || '').trim();
    if (!typed) return alert('请输入存储命名空间。');
    STUDIO_RUNTIME.switchStorageNamespace(typed, { copyCurrent: true });
    loadRulesetIntoState(STUDIO_RUNTIME.getActiveRulesetId());
    renderRulesets();
    renderProfessions();
    renderEntries();
    renderForm();
    alert('已切换存储位置，并复制当前数据。');
  }

  async function pickWorkspaceFolder() {
    try {
      await STUDIO_RUNTIME.chooseWorkspaceFolder({ copyCurrent: true });
      loadRulesetIntoState(STUDIO_RUNTIME.getActiveRulesetId());
      renderRulesets();
      renderProfessions();
      renderEntries();
      renderForm();
      alert('已切换到本地文件夹工作区。');
    } catch (e) {
      const code = String(e && e.message || e);
      if (code.includes('unsupported')) alert('当前浏览器不支持本地文件夹选择。');
      else if (code.includes('denied')) alert('未获得文件夹访问权限。');
    }
  }

  async function resetStorageNamespace() {
    if (!confirm('恢复到默认存储，并复制当前数据？')) return;
    await STUDIO_RUNTIME.resetStorageToLegacy({ copyCurrent: true });
    loadRulesetIntoState(STUDIO_RUNTIME.getActiveRulesetId());
    renderRulesets();
    renderProfessions();
    renderEntries();
    renderForm();
    alert('已恢复默认存储位置。');
  }

  function renderRulesetMeta() {
    const host = $('ruleset-meta');
    if (!host) return;
    const rs = currentRuleset();
    host.textContent =
      `名称: ${rs.name}\n` +
      `类型: ${rs.editable ? '可编辑副本' : '默认规则'}\n` +
      `职业数: ${Object.keys(rs.data.professions || {}).length}`;
    if ($('ruleset-name')) $('ruleset-name').value = rs.name || '';
  }

  function renderRulesets() {
    const sel = $('ruleset-select');
    sel.innerHTML = '';
    STUDIO_RUNTIME.loadRulesets().forEach(rs => {
      const o = document.createElement('option');
      o.value = rs.id;
      o.textContent = rs.name + (rs.editable ? '' : '（默认）');
      sel.appendChild(o);
    });
    state.rulesetId = STUDIO_RUNTIME.getActiveRulesetId();
    sel.value = state.rulesetId;
  }

  function renderProfessions() {
    const sel = $('profession-select');
    if ($('entity-label')) $('entity-label').textContent = currentEntityLabel();
    sel.innerHTML = '';
    const collection = currentEntityCollection();
    Object.entries(collection).forEach(([key, val]) => {
      const o = document.createElement('option');
      o.value = key;
      const kind = state.scope === 'weapon_cards' ? 'weapon' : state.scope === 'accessory_cards' ? 'accessory' : state.scope === 'negative_cards' ? 'card' : 'profession';
      o.textContent = I18N().entity(kind, key, val.name);
      sel.appendChild(o);
    });
    if (!collection[state.profession]) state.profession = Object.keys(collection)[0];
    sel.value = state.profession;
  }

  function renderEntries() {
    const sel = $('entry-select');
    sel.innerHTML = '';
    const collection = entries();
    const keys = Object.keys(collection);
    if (!keys.length) {
      state.entryKey = null;
      state.original = null;
      state.current = null;
      if ($('entry-key')) $('entry-key').value = '';
      return;
    }
    if (!keys.includes(state.entryKey)) state.entryKey = keys[0];
    keys.forEach(key => {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = `${I18N().entity('card', key, collection[key].name || key)} [${key}]`;
      sel.appendChild(o);
    });
    sel.value = state.entryKey;
    state.original = deep(collection[state.entryKey]);
    state.current = deep(collection[state.entryKey]);
    if ($('entry-key')) $('entry-key').value = state.entryKey;
  }

  function renderTemplateSelect() {
    const sel = $('template-select');
    sel.innerHTML = '';
    Object.entries(currentRuleset().data.templates).forEach(([key, val]) => {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = `${I18N().entity('template', key, val.label)} (${key})`;
      sel.appendChild(o);
    });
    sel.value = state.current.template;
  }

  function templateOptionPairs() {
    return Object.entries(currentRuleset().data.templates || {}).map(([key, val]) => [key, `${I18N().entity('template', key, val.label)} (${key})`]);
  }

  function renderStatusSelect() {
    const sel = $('status-template-select');
    sel.innerHTML = '';
    const none = document.createElement('option');
    none.value = 'none';
    none.textContent = 'none';
    sel.appendChild(none);
    Object.entries(currentRuleset().data.statuses).forEach(([key, val]) => {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = val.label;
      sel.appendChild(o);
    });
    sel.value = state.current.config.applyTemplate || 'none';
  }

  function makeBooleanInput(value, onChange) {
    const sel = document.createElement('select');
    [['true','是'],['false','否']].forEach(([v,l]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = l; sel.appendChild(o);
    });
    sel.value = String(!!value);
    sel.onchange = () => onChange(sel.value === 'true');
    return sel;
  }

  function makeSelectInput(options, value, onChange) {
    const sel = document.createElement('select');
    options.forEach(([v,l]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = l; sel.appendChild(o);
    });
    if (value != null && options.some(x => String(x[0]) === String(value))) sel.value = String(value);
    else if (options.length) sel.value = String(options[0][0]);
    sel.onchange = () => onChange(sel.value);
    return sel;
  }

  function allNegativeCardOptionPairs() {
    const set = new Set();
    const rs = currentRuleset();
    Object.entries(rs?.data?.cardLibrary || {}).forEach(([k, card]) => {
      if (card?.source === '负面牌' || card?.negativeOnDraw || String(card?.template || '').startsWith('negative_')) set.add(k);
    });
    return [['','(空)']].concat(Array.from(set).sort().map(k => [k, `${I18N().entity('card', k, k)} [${k}]`]));
  }

  function allCardOptionPairs() {
    const set = new Set();
    const rs = currentRuleset();
    Object.keys(rs?.data?.cardLibrary || {}).forEach(k => set.add(k));
    Object.values(rs?.data?.professions || {}).forEach(prof => Object.keys(prof.cards || {}).forEach(k => set.add(k)));
    return [['','(空)']].concat(Array.from(set).sort().map(k => [k, `${I18N().entity('card', k, k)} [${k}]`]));
  }

  function makeJsonArea(value, onChange) {
    const t = document.createElement('textarea');
    t.rows = 5;
    t.value = typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);
    t.oninput = () => {
      try {
        onChange(JSON.parse(t.value || '{}'));
        t.style.outline = 'none';
      } catch {
        t.style.outline = '2px solid #ff8a8a';
      }
    };
    return t;
  }

  function rewardListEditor(value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'form-host';
    const list = Array.isArray(value) ? value : [];

    function emit(){ onChange(list); }
    function row(item, idx){
      const box = document.createElement('div');
      box.className = 'panel';
      box.style.padding = '10px';
      const title = document.createElement('div');
      title.className = 'chip';
      title.textContent = `奖励 ${idx+1}`;
      box.appendChild(title);

      const defs = [
        ['type','奖励类型','rewardType'],
        ['value','数值 / 骰值','text']
      ];

      const grid = document.createElement('div');
      grid.className = 'field-grid';

      defs.forEach(([k,label,tp])=>{
        const field = document.createElement('div');
        field.className = 'field';
        const lab = document.createElement('label');
        lab.textContent = label;
        field.appendChild(lab);
        field.appendChild(makeInput(k, tp, item[k], v => { item[k] = v; emit(); renderForm(); }));
        grid.appendChild(field);
      });

      if ((item.type || '') === 'card'){
        const extraDefs = [
          ['cardKey','卡牌 key','card-key-select'],
          ['origin','来源','origin']
        ];
        extraDefs.forEach(([k,label,tp])=>{
          const field = document.createElement('div');
          field.className = 'field';
          const lab = document.createElement('label');
          lab.textContent = label;
          field.appendChild(lab);
          field.appendChild(makeInput(k, tp, item[k], v => { item[k] = v; emit(); }));
          grid.appendChild(field);
        });
      } else {
        item.cardKey = '';
        item.origin = '';
      }

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'danger';
      del.textContent = '删除奖励';
      del.onclick = () => { list.splice(idx,1); emit(); renderForm(); };
      box.appendChild(grid);
      box.appendChild(del);
      return box;
    }

    list.forEach((item, idx)=> wrap.appendChild(row(item, idx)));
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'secondary';
    add.textContent = '新增奖励';
    add.onclick = () => { list.push({ type:'gain_block', value:'1d4', cardKey:'', origin:'' }); emit(); renderForm(); };
    wrap.appendChild(add);
    return wrap;
  }


  function damageExpressionInput(value, onChange){
    const wrap = document.createElement('div');
    wrap.className = 'field-grid';
    wrap.style.gridTemplateColumns = '140px 1fr';
    const preset = document.createElement('select');
    const presets = [
      ['', '自定义'],
      ['weapon_damage', '武器伤害'],
      ['18x(0|1)', '18次，每次 0 或 1'],
      ['18x0.5', '18次，每次固定 0.5'],
      ['10x(0|1)', '10次，每次 0 或 1'],
      ['1d4', '1d4'],
      ['1d6', '1d6'],
      ['1d8', '1d8'],
      ['1d10', '1d10'],
      ['1d12', '1d12'],
      ['2d4', '2d4'],
      ['2d6', '2d6'],
      ['2d8', '2d8']
    ];
    presets.forEach(([v,l]) => {
      const o=document.createElement('option');
      o.value=v; o.textContent=l; preset.appendChild(o);
    });
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '例如 1d6 / weapon_damage / 18x(0|1) / 18x0.5';
    input.value = value ?? '';
    const current = String(value ?? '');
    if (presets.some(x => x[0] === current)) preset.value = current;
    else preset.value = '';
    preset.onchange = () => {
      if (preset.value) {
        input.value = preset.value;
        onChange(preset.value);
      }
    };
    input.oninput = () => {
      if (!presets.some(x => x[0] === input.value)) preset.value = '';
      else preset.value = input.value;
      onChange(input.value);
    };
    wrap.appendChild(preset);
    wrap.appendChild(input);
    return wrap;
  }

  function makeInput(key, type, value, onChange) {
    if (type === 'json') return makeJsonArea(value, onChange);
    if (type === 'reward-list') return rewardListEditor(value, onChange);
    if (type === 'boolean') return makeBooleanInput(value, onChange);
    if (type === 'card-key-select') return makeSelectInput(allCardOptionPairs(), value, onChange);
    if (type === 'negative-card-select' || key === 'insertCardKey') return makeSelectInput(allNegativeCardOptionPairs(), value, onChange);
    if (['damage','baseDamage','bonusDamage','damagePerTick'].includes(key)) return damageExpressionInput(value, onChange);
    if (FIELD_OPTIONS[key]) return makeSelectInput(FIELD_OPTIONS[key], value, onChange);
    if (FIELD_OPTIONS[type]) return makeSelectInput(FIELD_OPTIONS[type], value, onChange);
    const input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
    input.value = value ?? '';
    input.oninput = () => onChange(type === 'number' ? Number(input.value || 0) : input.value);
    return input;
  }


  function modesEditor(modes, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'form-host';
    const templatePairs = templateOptionPairs();
    (modes || []).forEach((m, idx) => {
      const box = document.createElement('div');
      box.className = 'panel';
      box.style.padding = '12px';
      box.innerHTML = `<div class="chip">模式 ${idx+1}</div>`;
      const grid = document.createElement('div');
      grid.className = 'field-grid';

      const fields = [
        ['name','模式名称','text'],
        ['templateRef','模板','template-select'],
        ['damage','伤害骰','text'],
        ['range','距离','number'],
        ['target','目标类型','target'],
        ['buffBasic','普攻加值','number'],
        ['block','格挡骰','text'],
        ['heal','恢复数值','text'],
        ['dodgeNext','闪避下一次伤害','boolean'],
        ['counterDamage','反击固定伤害','text'],
        ['counterUseTakenDamage','反击=所受伤害','boolean'],
        ['classSkillCapDelta','职业技能额外次数','number'],
        ['reactiveMoveTrigger','随机位移触发','reactiveMoveTrigger'],
        ['reactiveMoveMaxDistance','随机位移最大距离','number'],
        ['healOnDamaged','受伤后自疗','text'],
        ['disarmAttackerOnHit','被攻击后缴械回合','number'],
        ['basicAttackCapDelta','普攻次数改变量','number'],
        ['consumeOn','何时消耗','consumeOn'],
        ['durationTurns','持续回合','durationTurns'],
        ['durationTurns','持续回合','number']
      ];

      fields.forEach(([key,label,tp]) => {
        const field = document.createElement('div');
        field.className = 'field';
        const lab = document.createElement('label');
        lab.textContent = label;
        field.appendChild(lab);
        if (tp === 'template-select') {
          field.appendChild(makeSelectInput(templatePairs, m[key], v => { m[key] = v; onChange(modes); }));
        } else {
          field.appendChild(makeInput(key, tp, m[key], v => { m[key] = v; onChange(modes); }));
        }
        grid.appendChild(field);
      });
      box.appendChild(grid);
      wrap.appendChild(box);
    });
    return wrap;
  }

  function initTemplateConfig(templateKey) {
    ensureEditableRuleset();
    state.current.template = templateKey;
    state.current.config = deep(currentRuleset().data.templateDefaults[templateKey] || {});
    state.current.text = '';
    delete state.current.config.applyTemplate;
    delete state.current.config.applyConfig;
    syncCurrentEntryToCache();
    renderForm();
  }

  function renderSummary() {
    if (!state.current) return;
    const tpl = currentRuleset().data.templates[state.current.template];
    $('template-summary').textContent =
      `规则副本：${currentRuleset().name}\n` +
      `职业：${currentProf().name}\n` +
      `对象：${state.scope === 'cards' ? '职业卡' : '职业被动'}\n` +
      `条目：${state.current.name}\n` +
      `Key：${state.entryKey}\n\n` +
      `模板：${tpl?.label || state.current.template}\n\n` +
      `说明：${tpl?.desc || '未定义模板说明'}`;
  }

  function renderFriendlyPreview() {
    if (!state.current) return;
    const c = state.current;
    const tpl = currentRuleset().data.templates[c.template];
    const lines = [];
    lines.push(`Name: ${I18N().entity('card', state.entryKey, c.name)}`);
    lines.push(`Key: ${state.entryKey}`);
    lines.push(`Source: ${I18N().entity('origin', c.source || (state.scope === 'cards' ? '职业技能' : state.scope === 'passives' ? '职业被动' : state.scope === 'weapon_cards' ? '武器技能' : '饰品技能'), c.source || (state.scope === 'cards' ? '职业技能' : state.scope === 'passives' ? '职业被动' : state.scope === 'weapon_cards' ? '武器技能' : '饰品技能'))}`);
    lines.push(`Template: ${I18N().entity('template', c.template, tpl?.label || c.template)}`);
    if (c.config.damage) lines.push(`Damage: ${c.config.damage}`);
    if (c.config.range != null) lines.push(`Range: ${c.config.range}`);
    if (c.config.radius != null) lines.push(`Radius: ${c.config.radius}`);
    if (c.config.buffBasic != null) lines.push(`Bonus: ${c.config.buffBasic}`);
    if (c.config.consumeOn) lines.push(`Consume On: ${c.config.consumeOn}`);
    if (c.config.dodgeNext) lines.push('Dodge: next damage');
    if (c.config.counterDamage) lines.push(`Counter Fixed: ${c.config.counterDamage}`);
    if (c.config.counterUseTakenDamage) lines.push('Counter: taken damage');
    if (c.config.classSkillCapDelta) lines.push(`Extra Class Uses: ${c.config.classSkillCapDelta}`);
    if (c.config.reactiveMoveTrigger) lines.push(`Reactive Move: ${c.config.reactiveMoveTrigger} / ${c.config.reactiveMoveMaxDistance || 0}`);
    if (c.config.healOnDamaged) lines.push(`Heal On Damaged: ${c.config.healOnDamaged}`);
    if (c.config.disarmAttackerOnHit) lines.push(`Disarm Attacker: ${c.config.disarmAttackerOnHit}`);
    if (c.config.applyTemplate) lines.push(`Status Template: ${c.config.applyTemplate}`);
    if (c.config.modes) lines.push(`Modes: ${c.config.modes.length}`);
    if (c.text) lines.push(`Description: ${c.text}`);
    $('friendly-preview').textContent = lines.join('\n');
    $('json-preview').value = JSON.stringify(state.current, null, 2);
  }

  function renderStatusFields() {
    const host = $('status-fields');
    host.innerHTML = '';
    const statusKey = $('status-template-select').value;
    if (statusKey === 'none') {
      delete state.current.config.applyTemplate;
      delete state.current.config.applyConfig;
      renderFriendlyPreview();
      return;
    }
    state.current.config.applyTemplate = statusKey;
    state.current.config.applyConfig = state.current.config.applyConfig || {};
    const status = currentRuleset().data.statuses[statusKey];
    (status.fields || []).forEach(([key, label, type]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      field.appendChild(makeInput(key, type, state.current.config.applyConfig[key], v => {
        ensureEditableRuleset();
        state.current.config.applyConfig[key] = v;
        syncCurrentEntryToCache();
        renderFriendlyPreview();
      }));
      host.appendChild(field);
    });
    renderFriendlyPreview();
  }

  function renderForm() {
    if (!state.current) {
      $('form-title').textContent = '没有可编辑条目';
      $('form-host').innerHTML = '';
      $('friendly-preview').textContent = '';
      $('json-preview').value = '';
      renderStorageInfo();
      renderRulesetMeta();
      return;
    }
    $('entry-name').value = state.current.name || '';
    $('entry-key').value = state.entryKey || '';
    renderTemplateSelect();
    renderStatusSelect();
    renderSummary();
    renderFriendlyPreview();

    const host = $('form-host');
    host.innerHTML = '';
    const kind = state.scope === 'weapon_cards' ? 'weapon' : state.scope === 'accessory_cards' ? 'accessory' : 'profession';
    $('form-title').textContent = `${I18N().entity(kind, state.profession, currentEntityName())} / ${I18N().entity('card', state.entryKey, state.current.name)}`;
    const tpl = currentRuleset().data.templates[state.current.template];
    const note = document.createElement('div');
    note.className = 'muted';
    note.textContent = tpl?.desc || '此模板尚未登记描述';
    host.appendChild(note);
    const descField = document.createElement('div');
    descField.className = 'field';
    const descLab = document.createElement('label');
    descLab.textContent = state.scope === 'cards' ? '卡牌描述' : state.scope === 'passives' ? '被动描述' : state.scope === 'weapon_cards' ? '武器卡描述' : '饰品卡描述';
    descField.appendChild(descLab);
    const descArea = document.createElement('textarea');
    descArea.rows = 3;
    descArea.value = state.current.text || '';
    descArea.oninput = () => {
      ensureEditableRuleset();
      state.current.text = descArea.value;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
    };
    descField.appendChild(descArea);
    host.appendChild(descField);
    const grid = document.createElement('div');
    grid.className = 'field-grid';
    (tpl?.fields || []).forEach(([k, label, type]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      if (type === 'modes') {
        field.appendChild(modesEditor(state.current.config[k] || [], v => {
          ensureEditableRuleset();
          state.current.config[k] = v;
          syncCurrentEntryToCache();
          renderFriendlyPreview();
        }));
      } else {
        field.appendChild(makeInput(k, type, state.current.config[k], v => {
          ensureEditableRuleset();
          state.current.config[k] = v;
          syncCurrentEntryToCache();
          renderFriendlyPreview();
        }));
      }
      grid.appendChild(field);
    });
    host.appendChild(grid);
    renderStatusFields();
    renderStorageInfo();
    renderRulesetMeta();
  }

  function saveCurrentEntry() {
    if (!state.current) return;
    ensureEditableRuleset();
    syncCurrentEntryToCache();
    persistRuleset(true, '当前条目已保存。');
    state.original = deep(state.current);
  }

  function saveRuleset() {
    ensureEditableRuleset();
    if (state.current) syncCurrentEntryToCache();
    persistRuleset(true, '整个规则副本已保存。');
  }


  function createWeapon() {
    ensureEditableRuleset();
    const key = (window.prompt('请输入新武器 key，例如 monk_staff / cannon / glaive') || '').trim();
    if (!key) return;
    const rs = currentRuleset();
    rs.data.weaponLibrary = rs.data.weaponLibrary || {};
    if (rs.data.weaponLibrary[key]) return alert('武器 key 已存在。');
    const displayName = (window.prompt('请输入武器显示名称') || key).trim() || key;
    rs.data.weaponLibrary[key] = {
      key,
      name: displayName,
      basic: { name: `${displayName} 普攻`, damage: '1d6', range: 1, straight: false, type: '近战' },
      cards: []
    };
    state.scope = 'weapon_cards';
    state.profession = key;
    state.entryKey = null;
    persistRuleset(true, '新武器已创建。');
  }

  function createAccessory() {
    ensureEditableRuleset();
    const key = (window.prompt('请输入新饰品 key，例如 bomb_ring / soul_emblem / trap_core') || '').trim();
    if (!key) return;
    const rs = currentRuleset();
    rs.data.accessoryLibrary = rs.data.accessoryLibrary || {};
    if (rs.data.accessoryLibrary[key]) return alert('饰品 key 已存在。');
    const displayName = (window.prompt('请输入饰品显示名称') || key).trim() || key;
    rs.data.accessoryLibrary[key] = {
      key,
      name: displayName,
      cards: []
    };
    state.scope = 'accessory_cards';
    state.profession = key;
    state.entryKey = null;
    persistRuleset(true, '新饰品已创建。');
  }

  function createProfession() {
    ensureEditableRuleset();
    const key = (window.prompt('请输入新职业 key，例如 monk / engineer / druid2') || '').trim();
    if (!key) return;
    const rs = currentRuleset();
    rs.data.professions = rs.data.professions || {};
    if (rs.data.professions[key]) return alert('职业 key 已存在。');
    const displayName = (window.prompt('请输入职业显示名称') || key).trim() || key;
    rs.data.professions[key] = {
      key,
      name: displayName,
      hp: 55,
      move: 5,
      movePreset: 'melee',
      passives: {
        [`${key}_passive`]: {
          name: `${displayName} 被动`,
          template: 'threshold_reward_once_per_turn',
          config: {
            thresholdType: 'dealt_damage',
            thresholdValue: 1,
            rewardList: [{ type: 'gain_block', value: '1d4', origin: '职业被动' }],
            oncePerTurn: true
          },
          text: ''
        }
      },
      cards: {
        [`${key}_strike`]: {
          name: `${displayName} 打击`,
          source: '职业技能',
          template: 'direct_damage',
          config: { damage: '1d6', range: 1, target: 'enemy' },
          text: ''
        }
      }
    };
    state.scope = 'cards';
    state.profession = key;
    state.entryKey = `${key}_strike`;
    persistRuleset(true, '新职业已创建。');
  }

  function createEntry() {
    ensureEditableRuleset();
    const typed = (($('entry-key') && $('entry-key').value) || '').trim();
    const newKey = typed || ('new_entry_' + Date.now().toString(36));
    const collection = entries();
    if (collection[newKey]) return alert('key 已存在。');
    const templateKey = 'direct_damage';
    const source = state.scope === 'cards' ? '职业技能' : state.scope === 'passives' ? '职业被动' : state.scope === 'weapon_cards' ? '武器技能' : state.scope === 'accessory_cards' ? '饰品技能' : '负面牌';
    const chosenTemplate = state.scope === 'negative_cards' ? 'negative_direct_damage' : templateKey;
    const entry = { name: newKey, source, template: chosenTemplate, config: deep(currentRuleset().data.templateDefaults[chosenTemplate]), text: '', negativeOnDraw: state.scope === 'negative_cards' };
    if (state.scope === 'weapon_cards' || state.scope === 'accessory_cards' || state.scope === 'negative_cards') {
      currentRuleset().data.cardLibrary[newKey] = deep(entry);
      currentEntity().cards = currentEntity().cards || [];
      currentEntity().cards.push(newKey);
    } else {
      collection[newKey] = entry;
    }
    state.entryKey = newKey;
    state.current = deep(entry);
    state.original = deep(entry);
    syncCurrentEntryToCache();
    persistRuleset(true, '新条目已创建。');
  }

  function duplicateEntry() {
    if (!state.current) return;
    ensureEditableRuleset();
    const typed = (($('entry-key') && $('entry-key').value) || '').trim();
    const newKey = (typed && typed !== state.entryKey) ? typed : `${state.entryKey}_copy`;
    const collection = entries();
    if (collection[newKey]) return alert('key 已存在。');
    if (state.scope === 'weapon_cards' || state.scope === 'accessory_cards' || state.scope === 'negative_cards') {
      currentRuleset().data.cardLibrary[newKey] = deep(state.current);
      currentRuleset().data.cardLibrary[newKey].name = `${state.current.name} Copy`;
      if (state.scope !== 'negative_cards') { currentEntity().cards = currentEntity().cards || []; currentEntity().cards.push(newKey); }
      state.current = deep(currentRuleset().data.cardLibrary[newKey]);
    } else {
      collection[newKey] = deep(state.current);
      collection[newKey].name = `${state.current.name} Copy`;
      state.current = deep(collection[newKey]);
    }
    state.entryKey = newKey;
    state.original = deep(state.current);
    persistRuleset(true, '条目已复制。');
  }

  function renameEntry() {
    if (!state.current || !state.entryKey) return;
    ensureEditableRuleset();
    const newKey = (($('entry-key') && $('entry-key').value) || '').trim();
    if (!newKey) return alert('请输入新的条目 key。');
    if (newKey === state.entryKey) return alert('请输入不同的 key。');
    const collection = entries();
    if (collection[newKey]) return alert('key 已存在。');
    if (state.scope === 'weapon_cards' || state.scope === 'accessory_cards' || state.scope === 'negative_cards') {
      currentRuleset().data.cardLibrary[newKey] = deep(currentRuleset().data.cardLibrary[state.entryKey]);
      delete currentRuleset().data.cardLibrary[state.entryKey];
      if (state.scope !== 'negative_cards') currentEntity().cards = (currentEntity().cards || []).map(k => k === state.entryKey ? newKey : k);
      state.current = deep(currentRuleset().data.cardLibrary[newKey]);
    } else {
      collection[newKey] = deep(collection[state.entryKey]);
      delete collection[state.entryKey];
      state.current = deep(collection[newKey]);
    }
    state.entryKey = newKey;
    state.original = deep(state.current);
    persistRuleset(true, '条目 key 已重命名。');
  }

  function deleteEntry() {
    if (!state.current || !state.entryKey) return;
    ensureEditableRuleset();
    if (!confirm('确定删除当前条目？')) return;
    const collection = entries();
    const keys = Object.keys(collection);
    if (keys.length <= 1) return alert('至少保留一个条目。');
    if (state.scope === 'weapon_cards' || state.scope === 'accessory_cards' || state.scope === 'negative_cards') {
      delete currentRuleset().data.cardLibrary[state.entryKey];
      if (state.scope !== 'negative_cards') {
        currentEntity().cards = (currentEntity().cards || []).filter(k => k !== state.entryKey);
        state.entryKey = currentEntity().cards[0];
      } else {
        state.entryKey = Object.keys(entries()).filter(k => k !== state.entryKey)[0];
      }
      state.current = state.entryKey ? deep(currentRuleset().data.cardLibrary[state.entryKey]) : null;
    } else {
      delete collection[state.entryKey];
      state.entryKey = Object.keys(collection)[0];
      state.current = deep(collection[state.entryKey]);
    }
    state.original = deep(state.current);
    persistRuleset(true, '条目已删除。');
  }

  function deleteRuleset() {
    const rs = currentRuleset();
    if (!rs.editable) return alert('默认规则不能删除。');
    if (!confirm(`确定删除规则副本「${rs.name}」吗？`)) return;
    STUDIO_RUNTIME.removeRuleset(rs.id);
    loadRulesetIntoState(STUDIO_RUNTIME.getActiveRulesetId());
    renderRulesets();
    renderProfessions();
    renderEntries();
    renderForm();
    alert('规则副本已删除。');
  }

  function exportRuleset() {
    const rs = currentRuleset();
    const blob = new Blob([JSON.stringify(rs, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(rs.name || 'ruleset').replace(/[\\/:*?"<>|]+/g,'_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importRuleset() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const rulesets = STUDIO_RUNTIME.loadRulesets();
        const newId = 'rs_' + Date.now().toString(36) + '_' + Math.floor(Math.random()*9999).toString(36);
        const copy = deep(parsed);
        copy.id = newId;
        copy.name = copy.name || copy.meta?.name || '导入规则副本';
        copy.editable = true;
        if (!copy.data && copy.templates && copy.professions) {
          copy.data = copy;
        }
        rulesets.push(copy);
        STUDIO_RUNTIME.saveRulesets(rulesets);
        STUDIO_RUNTIME.setActiveRulesetId(newId);
        loadRulesetIntoState(newId);
        renderRulesets();
        renderProfessions();
        renderEntries();
        renderForm();
        alert('规则副本已导入。');
      } catch (e) {
        alert('导入失败：不是有效的 JSON 规则副本文件。');
      }
    };
    input.click();
  }

  function boot() {
    renderRulesets();
    loadRulesetIntoState(STUDIO_RUNTIME.getActiveRulesetId());
    renderProfessions();
    renderEntries();
    renderForm();

    $('ruleset-select').onchange = () => {
      loadRulesetIntoState($('ruleset-select').value);
      state.profession = Object.keys(state.rulesetCache.data.professions)[0];
      renderProfessions();
      renderEntries();
      renderForm();
    };
    $('edit-scope').onchange = () => {
      state.scope = $('edit-scope').value;
      renderProfessions();
      renderEntries();
      renderForm();
    };
    $('profession-select').onchange = () => {
      state.profession = $('profession-select').value;
      renderEntries();
      renderForm();
    };
    $('entry-select').onchange = () => {
      state.entryKey = $('entry-select').value;
      state.original = deep(entries()[state.entryKey]);
      state.current = deep(entries()[state.entryKey]);
      renderForm();
    };
    $('entry-name').oninput = () => {
      ensureEditableRuleset();
      state.current.name = $('entry-name').value;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
      renderSummary();
    };
    $('template-select').onchange = () => initTemplateConfig($('template-select').value);
    $('status-template-select').onchange = renderStatusFields;
    $('btn-reset').onclick = () => {
      state.current = deep(state.original);
      syncCurrentEntryToCache();
      renderForm();
    };
    if ($('btn-new-profession')) $('btn-new-profession').onclick = createProfession;
    if ($('btn-new-weapon')) $('btn-new-weapon').onclick = createWeapon;
    if ($('btn-new-accessory')) $('btn-new-accessory').onclick = createAccessory;
    $('btn-new').onclick = createEntry;
    $('btn-rename-entry').onclick = renameEntry;
    $('btn-duplicate').onclick = duplicateEntry;
    $('btn-delete').onclick = deleteEntry;
    $('btn-save-entry').onclick = saveCurrentEntry;
    $('btn-save-ruleset').onclick = saveRuleset;
    $('btn-delete-ruleset').onclick = deleteRuleset;
    $('btn-export-ruleset').onclick = exportRuleset;
    $('btn-import-ruleset').onclick = importRuleset;
    if ($('btn-storage-apply')) $('btn-storage-apply').onclick = applyStorageNamespace;
    if ($('btn-storage-folder')) $('btn-storage-folder').onclick = pickWorkspaceFolder;
    if ($('btn-storage-reset')) $('btn-storage-reset').onclick = resetStorageNamespace;
  }
  (async()=>{ await STUDIO_RUNTIME.init(); boot(); })();
})();
