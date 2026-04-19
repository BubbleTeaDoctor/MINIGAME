
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
    if (state.entityType === 'profession') {
      const keys = Object.keys(rs.data.professions || {});
      if (!state.entityKey || !keys.includes(state.entityKey)) state.entityKey = keys[0] || null;
    } else if (state.entityType === 'weapon') {
      const keys = Object.keys(rs.data.weaponLibrary || {});
      if (!state.entityKey || !keys.includes(state.entityKey)) state.entityKey = keys[0] || null;
    } else {
      const keys = Object.keys(rs.data.accessoryLibrary || {});
      if (!state.entityKey || !keys.includes(state.entityKey)) state.entityKey = keys[0] || null;
    }
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
    if (state.entityType === 'profession') return currentData().professions || {};
    if (state.entityType === 'weapon') return currentData().weaponLibrary || {};
    return currentData().accessoryLibrary || {};
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
    $('editing-chip').textContent = state.entityType === 'profession' ? '职业' : state.entityType === 'weapon' ? '武器' : '饰品';
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

  function availableCards(entity){
    const lib = currentData().cardLibrary || {};
    if (state.entityType === 'profession') {
      return Object.entries(entity.cards || {}).map(([k, v]) => [k, v || lib[k] || { name: k }]);
    }
    const sourceNeed = state.entityType === 'weapon' ? '武器技能' : '饰品技能';
    const currentKeys = new Set(Object.keys(getDeckCounts(entity)));
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
    professionPanel.classList.toggle('hidden', state.entityType !== 'profession');
    weaponPanel.classList.toggle('hidden', state.entityType !== 'weapon');
    accPanel.classList.toggle('hidden', state.entityType !== 'accessory');

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
  }

  function renderDeckTable(){
    const host = $('deck-table');
    host.innerHTML = '';
    host.innerHTML = `<div class="deck-row header"><div>卡牌</div><div>来源 / 模板</div><div>数量</div></div>`;
    const ent = currentEntity();
    if (!ent) return;
    const counts = getDeckCounts(ent);
    availableCards(ent).forEach(([cardKey, cardDef]) => {
      const row = document.createElement('div');
      row.className = 'deck-row';
      const name = document.createElement('div');
      name.className = 'deck-name';
      name.innerHTML = `<strong>${cardDef.name || cardKey}</strong><div class="deck-meta">${cardKey}</div>`;
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
      text += `生命值：${ent.hp}\n移动距离：${ent.move}\n移动预设：${ent.movePreset || 'melee'}\n职业技能数量：${Object.keys(ent.cards || {}).length}\n被动数量：${Object.keys(ent.passives || {}).length}\n`;
    } else if (state.entityType === 'weapon') {
      text += `普攻：${ent.basic?.name || ''}\n伤害：${ent.basic?.damage || ''}\n射程：${ent.basic?.range ?? ''}\n直线：${ent.basic?.straight ? '是' : '否'}\n`;
    } else {
      text += `饰品卡种类：${Object.keys(counts).filter(k => Number(counts[k]||0) > 0).length}\n`;
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
