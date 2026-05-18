
(() => {
  const deep = (o) => JSON.parse(JSON.stringify(o));
  const $ = (id) => document.getElementById(id);

  const state = {
    rulesetId: null,
    rulesetCache: null,
    entityType: 'profession',
    entityKey: null,
  };

  function currentRuleset(){ return state.rulesetCache; }
  function currentData(){ return currentRuleset()?.data || {}; }
  function entityTypeInfo(type = state.entityType){
    if(type === 'profession') return { label: '职业', library: 'professions', source: '职业技能' };
    if(type === 'weapon') return { label: '武器', library: 'weaponLibrary', source: '武器技能' };
    if(type === 'accessory') return { label: '饰品', library: 'accessoryLibrary', source: '饰品技能' };
    if(type === 'armor') return { label: '护甲', library: 'armorLibrary', source: '护甲技能' };
    if(type === 'boots') return { label: '靴子', library: 'bootsLibrary', source: '靴子技能' };
    if(type === 'relic') return { label: '咒物', library: 'relicLibrary', source: '咒物技能' };
    return { label: type, library: type, source: '' };
  }

  function toNumberInputValue(value, fallback = 0){
    return value === undefined || value === null || value === '' ? fallback : Number(value);
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }

  function compactValue(value){
    if (value === undefined || value === null || value === '') return '';
    if (Array.isArray(value)) return value.length ? value.map(compactValue).filter(Boolean).join('; ') : '';
    if (typeof value === 'object') {
      return Object.entries(value)
        .filter(([,v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length))
        .map(([k,v]) => `${k}: ${compactValue(v)}`)
        .join('; ');
    }
    return String(value);
  }

  function cardConfigRows(cardDef){
    const cfg = cardDef?.config || {};
    const keys = [
      ['damage', '伤害'],
      ['baseDamage', '基础伤害'],
      ['bonusDamage', '追加伤害'],
      ['range', '距离'],
      ['radius', '半径'],
      ['target', '目标'],
      ['block', '格挡'],
      ['heal', '治疗'],
      ['buffBasic', '普攻加值'],
      ['bonusDie', '额外骰'],
      ['insertCardKey', '插入负面牌'],
      ['insertCount', '插入数量'],
      ['negativeEffectType', '负面效果'],
      ['fumbleBucket', '失去机会'],
      ['vulnerableBonus', '额外受伤'],
      ['vulnerableScope', '受伤类型'],
      ['vulnerableDuration', '持续'],
      ['clumsyChance', '失败率'],
      ['clumsyScope', '影响范围'],
      ['clumsyDuration', '持续'],
      ['panicMode', '弃牌方式'],
      ['chaosCharges', '混乱次数'],
      ['bloodDamage', '生命代价'],
      ['lifestealPercent', '吸血比例'],
      ['lifestealFlat', '固定吸血'],
      ['quick', '快速'],
      ['consumeOn', '消耗时机']
    ];
    const rows = [];
    keys.forEach(([key, label]) => {
      const val = compactValue(cfg[key]);
      if (val !== '') rows.push([label, val]);
    });
    if (cfg.applyTemplate) rows.push(['附加状态', `${cfg.applyTemplate}${cfg.applyConfig ? ` (${compactValue(cfg.applyConfig)})` : ''}`]);
    if (Array.isArray(cfg.negativeEffects) && cfg.negativeEffects.length) rows.push(['附加负面', compactValue(cfg.negativeEffects)]);
    return rows;
  }

  function relicNegativeValueMeta(effectType) {
    const map = {
      vulnerable: { label: '破绽数值：下次额外受伤', title: '破绽会让下次受到的对应伤害增加这个数值。' },
      clumsy: { label: '笨拙数值：失败率 %', title: '笨拙会让下一次攻击或技能按这个百分比失败。' },
      chaos: { label: '混乱数值：触发次数', title: '混乱会让接下来若干次伤害打到自己。' },
      blood: { label: 'Blood 数值：失去生命', title: 'Blood 会让角色直接失去这个数值的生命。' },
    };
    return map[effectType] || null;
  }

  function syncRelicNegativeControls() {
    const effect = $('relic-turn-negative')?.value || '';
    const chance = $('relic-turn-negative-chance');
    const power = $('relic-turn-negative-power');
    const chanceField = chance?.closest('label');
    const powerField = power?.closest('label');
    if(chanceField) chanceField.classList.toggle('hidden', !effect);
    if(powerField) powerField.classList.toggle('hidden', !relicNegativeValueMeta(effect));
    if(!effect) return;
    const chanceLabel = chanceField?.querySelector('span');
    if(chanceLabel) chanceLabel.textContent = '触发率 %';
    const meta = relicNegativeValueMeta(effect);
    if(meta && powerField && power){
      const powerLabel = powerField.querySelector('span');
      if(powerLabel) powerLabel.textContent = meta.label;
      power.title = meta.title;
    }
  }

  function cardTooltipHtml(cardKey, cardDef){
    const data = currentData();
    const tpl = data.templates?.[cardDef?.template] || {};
    const rows = cardConfigRows(cardDef);
    const text = cardDef?.text || tpl.desc || '没有卡牌描述。';
    const rowHtml = rows.length
      ? `<ul class="card-tooltip-config">${rows.map(([k,v]) => `<li><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></li>`).join('')}</ul>`
      : '';
    return `
      <div class="card-tooltip-title">${escapeHtml(cardDef?.name || cardKey)}</div>
      <div class="card-tooltip-meta">${escapeHtml(cardKey)} · ${escapeHtml(cardDef?.source || '-')} · ${escapeHtml(tpl.label || cardDef?.template || '-')}</div>
      <div class="card-tooltip-text">${escapeHtml(text)}</div>
      ${rowHtml}
    `;
  }

  function positionCardTooltip(evt){
    const tip = $('card-tooltip');
    if(!tip) return;
    const margin = 14;
    const width = tip.offsetWidth || 340;
    const height = tip.offsetHeight || 160;
    let x = evt.clientX + margin;
    let y = evt.clientY + margin;
    if (x + width > window.innerWidth - margin) x = evt.clientX - width - margin;
    if (y + height > window.innerHeight - margin) y = window.innerHeight - height - margin;
    tip.style.left = `${Math.max(margin, x)}px`;
    tip.style.top = `${Math.max(margin, y)}px`;
  }

  function showCardTooltip(evt, cardKey, cardDef){
    const tip = $('card-tooltip');
    if(!tip) return;
    tip.innerHTML = cardTooltipHtml(cardKey, cardDef);
    tip.classList.remove('hidden');
    positionCardTooltip(evt);
  }

  function hideCardTooltip(){
    const tip = $('card-tooltip');
    if(tip) tip.classList.add('hidden');
  }

  function renderStorageInfo(){
    const info = STUDIO_RUNTIME.getStorageInfo();
    $('storage-info').textContent =
`mode: ${info.mode}
label: ${info.label}
rulesetsKey: ${info.rulesetsKey}
activeKey: ${info.activeKey}
activeRulesetId: ${info.activeRulesetId}
folderName: ${info.folderName || '(none)'}`;
  }

  function loadRulesetIntoState(id){
    const rs = deep(STUDIO_RUNTIME.findRuleset(id));
    state.rulesetId = id;
    state.rulesetCache = rs;
    const map = currentData()[entityTypeInfo().library] || {};
    const keys = Object.keys(map);
    if (!state.entityKey || !keys.includes(state.entityKey)) state.entityKey = keys[0] || null;
  }

  function ensureEditableRuleset() {
    if (currentRuleset().editable) return false;
    const source = currentRuleset();
    const duplicated = STUDIO_RUNTIME.duplicateRuleset(state.rulesetId, `${source.name} 副本`);
    loadRulesetIntoState(duplicated.id);
    renderAll();
    alert('已自动复制默认规则，请在副本上继续编辑。');
    return true;
  }

  function persist(showAlert = false) {
    STUDIO_RUNTIME.updateRuleset(state.rulesetId, rs => {
      rs.data = deep(state.rulesetCache.data);
    });
    state.rulesetCache = deep(STUDIO_RUNTIME.findRuleset(state.rulesetId));
    renderAll();
    if (showAlert) alert('规则副本已保存。');
  }

  function entityMapByType() {
    return currentData()[entityTypeInfo().library] || {};
  }

  function currentEntity() {
    return entityMapByType()[state.entityKey] || null;
  }

  function renderRulesets(){
    const host = $('ruleset-list');
    host.innerHTML = '';
    STUDIO_RUNTIME.loadRulesets().forEach(rs => {
      const item = document.createElement('button');
      item.className = 'ruleset-item' + (rs.id === state.rulesetId ? ' active' : '');
      item.type = 'button';
      item.innerHTML = `<span>${rs.name}</span><span class="muted">${rs.editable ? '可编辑' : '默认'}</span>`;
      item.onclick = () => {
        STUDIO_RUNTIME.setActiveRulesetId(rs.id);
        loadRulesetIntoState(rs.id);
        renderAll();
      };
      host.appendChild(item);
    });
  }

  function renderEntitySelect(){
    $('editing-chip').textContent = entityTypeInfo().label;
    const map = entityMapByType();
    const sel = $('entity-select');
    sel.innerHTML = '';
    Object.keys(map).forEach(k => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = `${map[k].name || k} [${k}]`;
      sel.appendChild(opt);
    });
    if (state.entityKey && map[state.entityKey]) sel.value = state.entityKey;
  }

  function countFromArray(arr){
    const out = {};
    (arr || []).forEach(key => { out[key] = (out[key] || 0) + 1; });
    return out;
  }

  function getDeckCounts(entity){
    if (!entity) return {};
    if (state.entityType === 'profession') {
      if (!entity.deckCounts) {
        entity.deckCounts = Object.fromEntries(Object.keys(entity.cards || {}).map(k => [k, 1]));
      }
      return entity.deckCounts;
    }
    if (!entity.deckCounts) entity.deckCounts = countFromArray(entity.cards || []);
    return entity.deckCounts;
  }

  function isNegativeCard(card){
    return !!(
      card?.negativeOnDraw ||
      card?.source === '负面牌' ||
      String(card?.template || '').startsWith('negative_')
    );
  }

  function availableCards(entity){
    const lib = currentData().cardLibrary || {};
    const currentKeys = new Set(Object.keys(getDeckCounts(entity)));
    Object.entries(lib).forEach(([k, v]) => {
      if (isNegativeCard(v)) currentKeys.add(k);
    });
    if (state.entityType === 'profession') {
      Object.keys(entity.cards || {}).forEach(k => currentKeys.add(k));
      return Array.from(currentKeys).sort().map(k => [k, entity.cards?.[k] || lib[k] || { name: k }]);
    }
    const sourceNeed = entityTypeInfo().source;
    Object.entries(lib).forEach(([k, v]) => {
      if ((v.source || '').includes(sourceNeed)) currentKeys.add(k);
    });
    return Array.from(currentKeys).sort().map(k => [k, lib[k] || { name: k, source: sourceNeed }]);
  }

  function bindStats(){
    const ent = currentEntity();
    const professionPanel = $('profession-stats-panel');
    const weaponPanel = $('weapon-panel');
    const accPanel = $('accessory-panel');
    const armorPanel = $('armor-panel');
    const bootsPanel = $('boots-panel');
    const relicPanel = $('relic-panel');
    professionPanel.classList.toggle('hidden', state.entityType !== 'profession');
    weaponPanel.classList.toggle('hidden', state.entityType !== 'weapon');
    accPanel.classList.toggle('hidden', state.entityType !== 'accessory');
    if(armorPanel) armorPanel.classList.toggle('hidden', state.entityType !== 'armor');
    if(bootsPanel) bootsPanel.classList.toggle('hidden', state.entityType !== 'boots');
    if(relicPanel) relicPanel.classList.toggle('hidden', state.entityType !== 'relic');

    if (state.entityType === 'profession' && ent){
      $('prof-name').value = ent.name || '';
      $('prof-key').value = ent.key || state.entityKey || '';
      $('prof-hp').value = ent.hp ?? 55;
      $('prof-move').value = ent.move ?? 5;
      $('prof-move-preset').value = ent.movePreset || 'melee';
      $('prof-name').oninput = () => { ensureEditableRuleset(); currentEntity().name = $('prof-name').value; renderSummary(); };
      $('prof-hp').oninput = () => { ensureEditableRuleset(); currentEntity().hp = Number($('prof-hp').value || 1); renderSummary(); };
      $('prof-move').oninput = () => { ensureEditableRuleset(); currentEntity().move = Number($('prof-move').value || 1); renderSummary(); };
      $('prof-move-preset').onchange = () => { ensureEditableRuleset(); currentEntity().movePreset = $('prof-move-preset').value; renderSummary(); };
    }

    if (state.entityType === 'weapon' && ent){
      const basic = ent.basic = ent.basic || { name: `${ent.name || ent.key} 普攻`, damage: '1d6', range: 1, straight: false, type: '近战' };
      $('weapon-name').value = ent.name || '';
      $('weapon-key').value = ent.key || state.entityKey || '';
      $('weapon-basic-name').value = basic.name || '';
      $('weapon-basic-damage').value = basic.damage || '';
      $('weapon-basic-range').value = basic.range ?? 1;
      $('weapon-basic-type').value = basic.type || '';
      $('weapon-basic-straight').value = String(!!basic.straight);

      $('weapon-name').oninput = () => { ensureEditableRuleset(); currentEntity().name = $('weapon-name').value; renderSummary(); renderEntitySelect(); };
      $('weapon-basic-name').oninput = () => { ensureEditableRuleset(); currentEntity().basic.name = $('weapon-basic-name').value; renderSummary(); };
      $('weapon-basic-damage').oninput = () => { ensureEditableRuleset(); currentEntity().basic.damage = $('weapon-basic-damage').value; renderSummary(); };
      $('weapon-basic-range').oninput = () => { ensureEditableRuleset(); currentEntity().basic.range = Number($('weapon-basic-range').value || 0); renderSummary(); };
      $('weapon-basic-type').oninput = () => { ensureEditableRuleset(); currentEntity().basic.type = $('weapon-basic-type').value; renderSummary(); };
      $('weapon-basic-straight').onchange = () => { ensureEditableRuleset(); currentEntity().basic.straight = $('weapon-basic-straight').value === 'true'; renderSummary(); };
    }

    if (state.entityType === 'accessory' && ent){
      $('acc-name').value = ent.name || '';
      $('acc-key').value = ent.key || state.entityKey || '';
      $('acc-name').oninput = () => { ensureEditableRuleset(); currentEntity().name = $('acc-name').value; renderSummary(); renderEntitySelect(); };
    }

    if (state.entityType === 'armor' && ent){
      $('armor-name').value = ent.name || '';
      $('armor-key').value = ent.key || state.entityKey || '';
      $('armor-max-hp').value = ent.maxHp ?? 55;
      $('armor-reduction-flat').value = ent.damageReductionFlat ?? ent.incomingDamageFlatReduction ?? 0;
      $('armor-reduction-roll').value = ent.damageReductionRoll || '';
      $('armor-incoming-bonus').value = ent.incomingDamageBonus ?? 0;
      $('armor-attack-fail').value = ent.outgoingAttackFailChance ?? 0;
      $('armor-name').oninput = () => { ensureEditableRuleset(); currentEntity().name = $('armor-name').value; renderSummary(); renderEntitySelect(); };
      $('armor-max-hp').oninput = () => { ensureEditableRuleset(); currentEntity().maxHp = Number($('armor-max-hp').value || 1); renderSummary(); };
      $('armor-reduction-flat').oninput = () => { ensureEditableRuleset(); const entity = currentEntity(); entity.damageReductionFlat = Number($('armor-reduction-flat').value || 0); delete entity.incomingDamageFlatReduction; renderSummary(); };
      $('armor-reduction-roll').oninput = () => { ensureEditableRuleset(); currentEntity().damageReductionRoll = $('armor-reduction-roll').value.trim(); renderSummary(); };
      $('armor-incoming-bonus').oninput = () => { ensureEditableRuleset(); currentEntity().incomingDamageBonus = Number($('armor-incoming-bonus').value || 0); renderSummary(); };
      $('armor-attack-fail').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingAttackFailChance = toNumberInputValue($('armor-attack-fail').value, 0); renderSummary(); };
    }

    if (state.entityType === 'boots' && ent){
      $('boots-name').value = ent.name || '';
      $('boots-key').value = ent.key || state.entityKey || '';
      $('boots-move').value = ent.moveBase ?? 4;
      $('boots-hazard-reduction').value = ent.hazardDamageReduction ?? 0;
      $('boots-force-resist').value = ent.forcedMoveResistance ?? 0;
      $('boots-incoming-bonus').value = ent.incomingDamageBonus ?? 0;
      $('boots-attack-fail').value = ent.outgoingAttackFailChance ?? 0;
      $('boots-name').oninput = () => { ensureEditableRuleset(); currentEntity().name = $('boots-name').value; renderSummary(); renderEntitySelect(); };
      $('boots-move').oninput = () => { ensureEditableRuleset(); currentEntity().moveBase = Number($('boots-move').value || 1); renderSummary(); };
      $('boots-hazard-reduction').oninput = () => { ensureEditableRuleset(); currentEntity().hazardDamageReduction = Number($('boots-hazard-reduction').value || 0); renderSummary(); };
      $('boots-force-resist').oninput = () => { ensureEditableRuleset(); currentEntity().forcedMoveResistance = Number($('boots-force-resist').value || 0); renderSummary(); };
      $('boots-incoming-bonus').oninput = () => { ensureEditableRuleset(); currentEntity().incomingDamageBonus = Number($('boots-incoming-bonus').value || 0); renderSummary(); };
      $('boots-attack-fail').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingAttackFailChance = toNumberInputValue($('boots-attack-fail').value, 0); renderSummary(); };
    }

    if (state.entityType === 'relic' && ent){
      $('relic-name').value = ent.name || '';
      $('relic-key').value = ent.key || state.entityKey || '';
      $('relic-heal-flat').value = ent.outgoingDamageHealFlat ?? 0;
      $('relic-crit-chance').value = ent.outgoingDamageCritChance ?? 0;
      $('relic-crit-die').value = ent.outgoingDamageCritBonusDie || '';
      $('relic-crit-multiplier').value = ent.outgoingDamageCritMultiplier ?? 0;
      $('relic-pierce').value = ent.ignoreTargetReductionFlat ?? 0;
      $('relic-move-bonus').value = ent.moveBonus ?? 0;
      $('relic-turn-damage').value = ent.turnStartSelfDamage ?? 0;
      $('relic-incoming-bonus').value = ent.incomingDamageBonus ?? 0;
      $('relic-hazard-bonus').value = ent.hazardDamageBonus ?? 0;
      $('relic-attack-fail').value = ent.outgoingAttackFailChance ?? 0;
      $('relic-turn-negative').value = ent.turnStartNegativeEffect || '';
      $('relic-turn-negative-chance').value = ent.turnStartNegativeChance ?? 0;
      $('relic-turn-negative-power').value = ent.turnStartNegativePower ?? 1;
      syncRelicNegativeControls();
      $('relic-name').oninput = () => { ensureEditableRuleset(); currentEntity().name = $('relic-name').value; renderSummary(); renderEntitySelect(); };
      $('relic-heal-flat').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingDamageHealFlat = Number($('relic-heal-flat').value || 0); renderSummary(); };
      $('relic-crit-chance').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingDamageCritChance = Number($('relic-crit-chance').value || 0); renderSummary(); };
      $('relic-crit-die').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingDamageCritBonusDie = $('relic-crit-die').value.trim(); renderSummary(); };
      $('relic-crit-multiplier').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingDamageCritMultiplier = Number($('relic-crit-multiplier').value || 0); renderSummary(); };
      $('relic-pierce').oninput = () => { ensureEditableRuleset(); currentEntity().ignoreTargetReductionFlat = Number($('relic-pierce').value || 0); renderSummary(); };
      $('relic-move-bonus').oninput = () => { ensureEditableRuleset(); currentEntity().moveBonus = Number($('relic-move-bonus').value || 0); renderSummary(); };
      $('relic-turn-damage').oninput = () => { ensureEditableRuleset(); currentEntity().turnStartSelfDamage = Number($('relic-turn-damage').value || 0); renderSummary(); };
      $('relic-incoming-bonus').oninput = () => { ensureEditableRuleset(); currentEntity().incomingDamageBonus = Number($('relic-incoming-bonus').value || 0); renderSummary(); };
      $('relic-hazard-bonus').oninput = () => { ensureEditableRuleset(); currentEntity().hazardDamageBonus = Number($('relic-hazard-bonus').value || 0); renderSummary(); };
      $('relic-attack-fail').oninput = () => { ensureEditableRuleset(); currentEntity().outgoingAttackFailChance = toNumberInputValue($('relic-attack-fail').value, 0); renderSummary(); };
      $('relic-turn-negative').onchange = () => { ensureEditableRuleset(); currentEntity().turnStartNegativeEffect = $('relic-turn-negative').value; syncRelicNegativeControls(); renderSummary(); };
      $('relic-turn-negative-chance').oninput = () => { ensureEditableRuleset(); currentEntity().turnStartNegativeChance = Number($('relic-turn-negative-chance').value || 0); renderSummary(); };
      $('relic-turn-negative-power').oninput = () => { ensureEditableRuleset(); currentEntity().turnStartNegativePower = Number($('relic-turn-negative-power').value || 1); renderSummary(); };
    }
  }

  function renderDeckTable(){
    hideCardTooltip();
    const host = $('deck-table');
    host.innerHTML = '';
    host.innerHTML = `<div class="deck-row header"><div>卡牌</div><div>来源 / 模板</div><div>数量</div></div><div class="deck-meta">负面牌会自动显示在这里；把数量调到 1 以上即可加入当前职业或装备卡组。</div>`;
    const ent = currentEntity();
    if (!ent) return;
    const counts = getDeckCounts(ent);
    availableCards(ent).forEach(([cardKey, cardDef]) => {
      const row = document.createElement('div');
      row.className = 'deck-row';
      const name = document.createElement('div');
      name.className = 'deck-name';
      name.tabIndex = 0;
      name.setAttribute('aria-label', `${cardDef.name || cardKey} 卡牌效果`);
      name.innerHTML = `<strong>${escapeHtml(cardDef.name || cardKey)}</strong><div class="deck-meta">${escapeHtml(cardKey)}</div>`;
      name.onpointerenter = (evt) => showCardTooltip(evt, cardKey, cardDef);
      name.onpointermove = positionCardTooltip;
      name.onpointerleave = hideCardTooltip;
      name.onfocus = () => {
        const rect = name.getBoundingClientRect();
        showCardTooltip({ clientX: rect.right, clientY: rect.top }, cardKey, cardDef);
      };
      name.onblur = hideCardTooltip;
      const meta = document.createElement('div');
      meta.className = 'deck-meta';
      meta.textContent = `${cardDef.source || '-'} / ${cardDef.template || '-'}`;
      const qty = document.createElement('input');
      qty.type = 'number';
      qty.min = '0';
      qty.max = '20';
      qty.step = '1';
      qty.className = 'qty-input';
      qty.value = Number(counts[cardKey] || 0);
      qty.oninput = () => {
        ensureEditableRuleset();
        const entity = currentEntity();
        const cc = getDeckCounts(entity);
        cc[cardKey] = Math.max(0, Number(qty.value || 0));
        if (state.entityType !== 'profession') {
          entity.cards = [];
          Object.entries(cc).forEach(([k, n]) => {
            const nn = Number(n || 0);
            for (let i=0;i<nn;i+=1) entity.cards.push(k);
          });
        }
        renderSummary();
      };
      row.appendChild(name); row.appendChild(meta); row.appendChild(qty);
      host.appendChild(row);
    });
  }

  function renderSummary(){
    const ent = currentEntity();
    if (!ent){ $('summary').textContent = '没有可编辑对象'; return; }
    const counts = getDeckCounts(ent);
    const total = Object.values(counts).reduce((a,b)=>a+Number(b||0),0);
    let text = `当前规则副本：${currentRuleset().name}\n编辑对象：${state.entityType} / ${ent.name || state.entityKey}\n总卡数：${total}\n\n`;
    if (state.entityType === 'profession') {
      text += `旧生命字段：${ent.hp}\n旧移动字段：${ent.move}\n移动预设：${ent.movePreset || 'melee'}\n职业技能数量：${Object.keys(ent.cards || {}).length}\n被动数量：${Object.keys(ent.passives || {}).length}\n`;
    } else if (state.entityType === 'weapon') {
      text += `普攻：${ent.basic?.name || ''}\n伤害：${ent.basic?.damage || ''}\n射程：${ent.basic?.range ?? ''}\n直线：${ent.basic?.straight ? '是' : '否'}\n`;
    } else if (state.entityType === 'armor') {
      text += `生命值：${ent.maxHp ?? ''}\n固定减伤：${ent.damageReductionFlat ?? ent.incomingDamageFlatReduction ?? 0}\n骰子减伤：${ent.damageReductionRoll || '无'}\n额外受伤：${ent.incomingDamageBonus ?? 0}\n攻击失误率：${ent.outgoingAttackFailChance ?? 0}%\n`;
    } else if (state.entityType === 'boots') {
      text += `移动距离：${ent.moveBase ?? ''}\n地形/陷阱减伤：${ent.hazardDamageReduction ?? 0}\n强制位移抗性：${ent.forcedMoveResistance ?? 0}\n额外受伤：${ent.incomingDamageBonus ?? 0}\n攻击失误率：${ent.outgoingAttackFailChance ?? 0}%\n`;
    } else if (state.entityType === 'relic') {
      text += `造成伤害回血：${ent.outgoingDamageHealFlat ?? 0}\n暴击率：${ent.outgoingDamageCritChance ?? 0}%\n暴击追加骰：${ent.outgoingDamageCritBonusDie || '无'}\n无视减伤：${ent.ignoreTargetReductionFlat ?? 0}\n移动加成：${ent.moveBonus ?? 0}\n回合开始失去生命：${ent.turnStartSelfDamage ?? 0}\n额外受伤：${ent.incomingDamageBonus ?? 0}\n地形额外伤害：${ent.hazardDamageBonus ?? 0}\n攻击失误率：${ent.outgoingAttackFailChance ?? 0}%\n回合开始负面：${ent.turnStartNegativeEffect || '无'} ${ent.turnStartNegativeChance ?? 0}% / 数值 ${ent.turnStartNegativePower ?? 1}\n`;
    } else {
      text += `${entityTypeInfo().label}卡种类：${Object.keys(counts).filter(k => Number(counts[k]||0) > 0).length}\n`;
    }
    text += `\n卡组明细：\n`;
    Object.entries(counts).filter(([,n])=>Number(n||0)>0).sort().forEach(([k,n]) => {
      const card = currentData().cardLibrary?.[k] || ent.cards?.[k] || { name: k };
      text += `- ${card.name || k} [${k}] × ${n}\n`;
    });
    $('summary').textContent = text.trim();
  }

  function renderAll(){
    renderStorageInfo();
    renderRulesets();
    $('entity-type').value = state.entityType;
    renderEntitySelect();
    bindStats();
    renderDeckTable();
    renderSummary();
  }

  function bindTop(){
    $('entity-type').onchange = () => {
      state.entityType = $('entity-type').value;
      const map = entityMapByType();
      state.entityKey = Object.keys(map)[0] || null;
      renderAll();
    };
    $('entity-select').onchange = () => {
      state.entityKey = $('entity-select').value;
      renderAll();
    };
    $('btn-save').onclick = () => {
      if (currentRuleset().editable === false) ensureEditableRuleset();
      persist(true);
    };
    $('btn-duplicate').onclick = () => {
      const duplicated = STUDIO_RUNTIME.duplicateRuleset(state.rulesetId, `${currentRuleset().name} 副本`);
      STUDIO_RUNTIME.setActiveRulesetId(duplicated.id);
      loadRulesetIntoState(duplicated.id);
      renderAll();
    };
    $('btn-rename').onclick = () => {
      const name = prompt('请输入新的规则副本名称', currentRuleset().name || '');
      if (!name) return;
      STUDIO_RUNTIME.renameRuleset(state.rulesetId, name.trim());
      loadRulesetIntoState(state.rulesetId);
      renderAll();
    };
    $('btn-delete').onclick = () => {
      if (!currentRuleset().editable) return alert('默认规则不能删除。');
      if (!confirm('确定删除当前规则副本吗？')) return;
      STUDIO_RUNTIME.deleteRuleset(state.rulesetId);
      const nextId = STUDIO_RUNTIME.getActiveRulesetId();
      loadRulesetIntoState(nextId);
      renderAll();
    };
    window.addEventListener('resize', hideCardTooltip);
  }

  async function boot(){
    await STUDIO_RUNTIME.init();
    const activeId = STUDIO_RUNTIME.getActiveRulesetId();
    loadRulesetIntoState(activeId);
    bindTop();
    renderAll();
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
