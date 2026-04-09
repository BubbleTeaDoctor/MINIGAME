(() => {
  const $ = (id) => document.getElementById(id);
  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
  const state = {
    initialData: deepCopy(window.GAME_DATA),
    data: deepCopy(window.GAME_DATA),
    currentType: 'classes',
    currentKey: null,
  };
  const TYPE_LABELS = { classes:'职业', weapons:'武器', accessories:'饰品', races:'种族', guardians:'守护神', cards:'卡牌' };
  const defaultFactories = {
    classes: () => ({ key:'new_class', name:'新职业', hp:50, move:4, passive:'', logic:{ moveLockThreshold:0, moveLockAppliesTo:'none' }, deck:[] }),
    weapons: () => ({ key:'new_weapon', name:'新武器', basic:{ name:'新武器普攻', damage:'1d6', range:1, straight:false, type:'近战' }, deck:[] }),
    accessories: () => ({ key:'new_accessory', name:'新饰品', deck:[] }),
    races: () => ({ key:'new_race', name:'新种族', onBuild:'', text:'' }),
    guardians: () => ({ key:'new_guardian', name:'新守护神', text:'', onBuild:null }),
    cards: () => ({ name:'新卡牌', module:'职业', category:'skill', target:'self', text:'', fx:'', range:0 }),
  };
  function ensureLogicFields() {
    Object.values(state.data.classes).forEach((entry) => {
      if (!entry.logic) entry.logic = { moveLockThreshold: 0, moveLockAppliesTo: 'none' };
    });
  }
  function boot() { ensureLogicFields(); bindEvents(); renderList(); }
  function bindEvents() {
    $('entity-type').addEventListener('change', () => { state.currentType = $('entity-type').value; state.currentKey = null; renderList(); renderEditor(); });
    $('search-box').addEventListener('input', renderList);
    $('btn-new').addEventListener('click', handleNew);
    $('btn-duplicate').addEventListener('click', handleDuplicate);
    $('btn-delete').addEventListener('click', handleDelete);
    $('btn-save').addEventListener('click', saveCurrent);
    $('btn-export-json').addEventListener('click', exportJSON);
    $('btn-export-js').addEventListener('click', exportJS);
    $('btn-import-json').addEventListener('click', importJSON);
    $('btn-reset').addEventListener('click', () => { state.data = deepCopy(state.initialData); ensureLogicFields(); state.currentKey = null; $('io-box').value=''; renderList(); });
  }
  function currentCollection() { return state.data[state.currentType]; }
  function renderList() {
    const list = $('entity-list');
    const search = $('search-box').value.trim().toLowerCase();
    list.innerHTML = '';
    const collection = currentCollection();
    const items = Object.entries(collection).filter(([key, value]) => {
      const name = (value.name || '').toLowerCase();
      return !search || key.toLowerCase().includes(search) || name.includes(search);
    }).sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
    if (!state.currentKey && items.length) state.currentKey = items[0][0];
    items.forEach(([key, value]) => {
      const item = document.createElement('div');
      item.className = 'entity-item' + (key === state.currentKey ? ' active' : '');
      item.innerHTML = `<div class="entity-key">${key}</div><div class="entity-name">${value.name || key}</div>`;
      item.addEventListener('click', () => { state.currentKey = key; renderList(); renderEditor(); });
      list.appendChild(item);
    });
    renderEditor();
  }
  function renderEditor() {
    const form = $('editor-form'); const title = $('editor-title'); const preview = $('preview-box');
    form.innerHTML=''; preview.textContent='';
    const entry = currentCollection()[state.currentKey];
    if (!entry) { title.textContent='未选择条目'; preview.textContent='请从左侧选择一个条目。'; return; }
    title.textContent = `${TYPE_LABELS[state.currentType]}：${entry.name || state.currentKey}`;
    preview.textContent = JSON.stringify(entry, null, 2);
    if (state.currentType === 'classes') renderClassForm(entry);
    else if (state.currentType === 'weapons') renderWeaponForm(entry);
    else if (state.currentType === 'accessories') renderAccessoryForm(entry);
    else if (state.currentType === 'races') renderRaceForm(entry);
    else if (state.currentType === 'guardians') renderGuardianForm(entry);
    else renderCardForm(entry);
  }
  function addField(container, labelText, value, onChange, type='text') {
    const wrap=document.createElement('div'); wrap.className='field';
    const label=document.createElement('label'); label.textContent=labelText;
    const input=document.createElement('input'); input.type=type; input.value=value ?? '';
    input.addEventListener('input', ()=>onChange(type==='number' ? Number(input.value || 0) : input.value));
    wrap.append(label, input); container.appendChild(wrap);
  }
  function addSelect(container, labelText, value, choices, onChange) {
    const wrap=document.createElement('div'); wrap.className='field';
    const label=document.createElement('label'); label.textContent=labelText;
    const select=document.createElement('select');
    choices.forEach(c=>{ const o=document.createElement('option'); o.value=c.value; o.textContent=c.label; if(c.value===value) o.selected=true; select.appendChild(o); });
    select.addEventListener('change', ()=>onChange(select.value));
    wrap.append(label, select); container.appendChild(wrap);
  }
  function addTextarea(container, labelText, value, onChange, large=false, help='') {
    const wrap=document.createElement('div'); wrap.className='field';
    const label=document.createElement('label'); label.textContent=labelText;
    const textarea=document.createElement('textarea'); if(large) textarea.classList.add('large'); textarea.value=value ?? '';
    textarea.addEventListener('input', ()=>onChange(textarea.value));
    wrap.append(label, textarea);
    if (help) { const note=document.createElement('div'); note.className='help'; note.textContent=help; wrap.appendChild(note); }
    container.appendChild(wrap);
  }
  function renderClassForm(entry) {
    const form=$('editor-form');
    const top=document.createElement('div'); top.className='form-grid';
    addField(top,'key',state.currentKey,v=>renameCurrentKey(v)); addField(top,'名称',entry.name,v=>entry.name=v); addField(top,'生命值',entry.hp,v=>entry.hp=v,'number'); addField(top,'基础移动',entry.move,v=>entry.move=v,'number');
    form.appendChild(top);
    addTextarea(form,'被动描述',entry.passive,v=>entry.passive=v,false);
    const logic=document.createElement('div'); logic.className='form-grid';
    addField(logic,'移动阈值',entry.logic?.moveLockThreshold ?? 0,v=>{ entry.logic=entry.logic||{}; entry.logic.moveLockThreshold=v; },'number');
    addSelect(logic,'超过阈值后的限制范围',entry.logic?.moveLockAppliesTo ?? 'none',[
      {value:'none',label:'不限制'},{value:'class_only',label:'仅职业技能'},{value:'all_skills',label:'所有技能'}
    ],v=>{ entry.logic=entry.logic||{}; entry.logic.moveLockAppliesTo=v; });
    form.appendChild(logic);
    addTextarea(form,'卡组（每行一个 card key）',(entry.deck||[]).join('\n'),v=>entry.deck=v.split('\n').map(x=>x.trim()).filter(Boolean),true,'重复写多次就是多张。');
  }
  function renderWeaponForm(entry) {
    const form=$('editor-form'); const top=document.createElement('div'); top.className='form-grid';
    addField(top,'key',state.currentKey,v=>renameCurrentKey(v)); addField(top,'名称',entry.name,v=>entry.name=v); form.appendChild(top);
    const basic=document.createElement('div'); basic.className='form-grid-3';
    addField(basic,'普攻名称',entry.basic?.name,v=>entry.basic.name=v); addField(basic,'伤害骰',entry.basic?.damage,v=>entry.basic.damage=v); addField(basic,'攻击距离',entry.basic?.range,v=>entry.basic.range=v,'number');
    addSelect(basic,'攻击类型',entry.basic?.type || '近战',[{value:'近战',label:'近战'},{value:'远程直线',label:'远程直线'},{value:'远程',label:'远程'}],v=>entry.basic.type=v);
    addSelect(basic,'是否直线',String(!!entry.basic?.straight),[{value:'true',label:'是'},{value:'false',label:'否'}],v=>entry.basic.straight=v==='true');
    form.appendChild(basic);
    addTextarea(form,'卡组（每行一个 card key）',(entry.deck||[]).join('\n'),v=>entry.deck=v.split('\n').map(x=>x.trim()).filter(Boolean),true);
  }
  function renderAccessoryForm(entry) {
    const form=$('editor-form'); const top=document.createElement('div'); top.className='form-grid';
    addField(top,'key',state.currentKey,v=>renameCurrentKey(v)); addField(top,'名称',entry.name,v=>entry.name=v); form.appendChild(top);
    addTextarea(form,'卡组（每行一个 card key）',(entry.deck||[]).join('\n'),v=>entry.deck=v.split('\n').map(x=>x.trim()).filter(Boolean),true);
  }
  function renderRaceForm(entry) {
    const form=$('editor-form'); const top=document.createElement('div'); top.className='form-grid';
    addField(top,'key',state.currentKey,v=>renameCurrentKey(v)); addField(top,'名称',entry.name,v=>entry.name=v); addField(top,'onBuild',entry.onBuild,v=>entry.onBuild=v); form.appendChild(top);
    addTextarea(form,'说明文本',entry.text,v=>entry.text=v,false);
  }
  function renderGuardianForm(entry) {
    const form=$('editor-form'); const top=document.createElement('div'); top.className='form-grid';
    addField(top,'key',state.currentKey,v=>renameCurrentKey(v)); addField(top,'名称',entry.name,v=>entry.name=v); addField(top,'onBuild',entry.onBuild ?? '',v=>entry.onBuild=v || null); form.appendChild(top);
    addTextarea(form,'说明文本',entry.text,v=>entry.text=v,false);
  }
  function renderCardForm(entry) {
    const form=$('editor-form'); const top=document.createElement('div'); top.className='form-grid';
    addField(top,'key',state.currentKey,v=>renameCurrentKey(v)); addField(top,'名称',entry.name,v=>entry.name=v); addField(top,'module',entry.module,v=>entry.module=v);
    addSelect(top,'category',entry.category || 'skill',[{value:'skill',label:'skill'},{value:'accessory',label:'accessory'},{value:'block',label:'block'}],v=>entry.category=v);
    addSelect(top,'target',entry.target || 'self',[{value:'self',label:'self'},{value:'enemy',label:'enemy'},{value:'tile',label:'tile'}],v=>entry.target=v);
    addField(top,'range',entry.range ?? 0,v=>entry.range=v,'number'); form.appendChild(top);
    const second=document.createElement('div'); second.className='form-grid-3';
    addField(second,'fx',entry.fx || '',v=>entry.fx=v); addField(second,'damage',entry.damage || '',v=>entry.damage=v); addField(second,'heal',entry.heal || '',v=>entry.heal=v); addField(second,'block',entry.block || '',v=>entry.block=v); addField(second,'bonus',entry.bonus || '',v=>entry.bonus=v); addField(second,'bonusDie',entry.bonusDie || '',v=>entry.bonusDie=v);
    form.appendChild(second);
    addSelect(form,'spell',String(!!entry.spell),[{value:'false',label:'false'},{value:'true',label:'true'}],v=>entry.spell=v==='true');
    addTextarea(form,'卡牌文本',entry.text,v=>entry.text=v,false);
    addTextarea(form,'apply / 状态 JSON',JSON.stringify(entry.apply || {}, null, 2),v=>{ try { entry.apply = JSON.parse(v || '{}'); } catch {} },true,'例如：{ "slow": 1 }');
  }
  function renameCurrentKey(newKeyRaw) {
    const newKey=newKeyRaw.trim(); if(!newKey || newKey===state.currentKey) return;
    const collection=currentCollection(); if(collection[newKey]) return;
    collection[newKey]=collection[state.currentKey]; delete collection[state.currentKey]; state.currentKey=newKey; renderList();
  }
  function handleNew() {
    const collection=currentCollection(); const base=defaultFactories[state.currentType](); let key=base.key || 'new_item', i=1;
    while(collection[key]) key=`${base.key || 'new_item'}_${i++}`;
    collection[key]=base; state.currentKey=key; renderList();
  }
  function handleDuplicate() {
    const collection=currentCollection(), entry=collection[state.currentKey]; if(!entry) return;
    let key=`${state.currentKey}_copy`, i=1; while(collection[key]) key=`${state.currentKey}_copy_${i++}`;
    collection[key]=deepCopy(entry); state.currentKey=key; renderList();
  }
  function handleDelete() { const collection=currentCollection(); if(!collection[state.currentKey]) return; delete collection[state.currentKey]; state.currentKey=Object.keys(collection)[0] || null; renderList(); }
  function saveCurrent() { $('preview-box').textContent = JSON.stringify(currentCollection()[state.currentKey], null, 2); }
  function exportJSON() { $('io-box').value = JSON.stringify(state.data, null, 2); }
  function exportJS() { $('io-box').value = 'window.GAME_DATA = ' + JSON.stringify(state.data, null, 2) + ';'; }
  function importJSON() { try { state.data = JSON.parse($('io-box').value); ensureLogicFields(); state.currentKey=null; renderList(); } catch(err) { $('io-box').value = 'JSON 解析失败：' + err.message + '\n\n' + $('io-box').value; } }
  boot();
})();
