// Editor renderer skeleton v0.9.0
// Purpose: render template-driven forms from palette + form mappings + current entry data.
// This is a concrete integration bridge for Studio editor.js.

(function (global) {
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getByPath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  function setByPath(obj, path, value) {
    const keys = path.split('.');
    let ref = obj;
    for (let i = 0; i < keys.length - 1; i += 1) {
      const key = keys[i];
      if (ref[key] == null || typeof ref[key] !== 'object') ref[key] = {};
      ref = ref[key];
    }
    ref[keys[keys.length - 1]] = value;
  }

  function buildTemplateIndex(palette) {
    const index = {};
    for (const group of palette.groups || []) {
      for (const template of group.templates || []) {
        index[template.key] = Object.assign({ groupKey: group.key, groupLabel: group.label }, template);
      }
    }
    return index;
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function renderTextInput(field, value, onChange, meta) {
    const wrap = createEl('div', 'field');
    wrap.appendChild(createEl('label', '', field.label));
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value ?? '';
    if (meta && meta.placeholder) input.placeholder = meta.placeholder;
    input.addEventListener('input', () => onChange(input.value));
    wrap.appendChild(input);
    if (meta && meta.hint) wrap.appendChild(createEl('div', 'note', meta.hint));
    return wrap;
  }

  function renderNumberInput(field, value, onChange, optional) {
    const wrap = createEl('div', 'field');
    wrap.appendChild(createEl('label', '', field.label));
    const input = document.createElement('input');
    input.type = 'number';
    input.value = value ?? '';
    input.addEventListener('input', () => {
      const raw = input.value;
      if (optional && raw === '') onChange(null);
      else onChange(Number(raw || 0));
    });
    wrap.appendChild(input);
    return wrap;
  }

  function renderToggle(field, value, onChange) {
    const wrap = createEl('div', 'field');
    wrap.appendChild(createEl('label', '', field.label));
    const select = document.createElement('select');
    [['true', '是'], ['false', '否']].forEach(([v, l]) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = l;
      select.appendChild(opt);
    });
    select.value = String(!!value);
    select.addEventListener('change', () => onChange(select.value === 'true'));
    wrap.appendChild(select);
    return wrap;
  }

  function renderSelect(field, value, onChange) {
    const wrap = createEl('div', 'field');
    wrap.appendChild(createEl('label', '', field.label));
    const select = document.createElement('select');
    for (const option of field.options || []) {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      select.appendChild(opt);
    }
    select.value = value ?? (field.options && field.options[0]) ?? '';
    select.addEventListener('change', () => onChange(select.value));
    wrap.appendChild(select);
    return wrap;
  }

  function renderConditionalBonus(field, value, onChange) {
    const current = Object.assign({
      condition: '',
      bonusDamage: '',
      replaceDamage: '',
      bonusDraw: 0,
      bonusMove: 0,
      consumeMark: false,
    }, value || {});
    const wrap = createEl('div', 'field field-block');
    wrap.appendChild(createEl('label', '', field.label));
    const grid = createEl('div', 'field-grid');
    const defs = [
      { key: 'condition', label: '条件', type: 'text' },
      { key: 'bonusDamage', label: '额外伤害', type: 'text' },
      { key: 'replaceDamage', label: '替换伤害', type: 'text' },
      { key: 'bonusDraw', label: '额外抽牌', type: 'number' },
      { key: 'bonusMove', label: '额外位移', type: 'number' },
      { key: 'consumeMark', label: '消耗标记', type: 'toggle' },
    ];
    defs.forEach((def) => {
      const child = renderWidget(def, current[def.key], (next) => {
        current[def.key] = next;
        onChange(deepClone(current));
      }, {});
      grid.appendChild(child);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function renderControlBuilder(field, value, onChange) {
    const current = Object.assign({ type: 'root', durationTurns: 1, isControlTag: true }, value || {});
    const wrap = createEl('div', 'field field-block');
    wrap.appendChild(createEl('label', '', field.label));
    const grid = createEl('div', 'field-grid');
    const defs = [
      { key: 'type', label: '控制类型', type: 'select', options: ['sheep', 'disarm', 'root', 'stun', 'slow'] },
      { key: 'durationTurns', label: '持续回合', type: 'number' },
      { key: 'isControlTag', label: '计入控制标签', type: 'toggle' },
    ];
    defs.forEach((def) => {
      const child = renderWidget(def, current[def.key], (next) => {
        current[def.key] = next;
        onChange(deepClone(current));
      }, {});
      grid.appendChild(child);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function renderMarkedBonusBuilder(field, value, onChange) {
    const current = Object.assign({ bonusDamage: 0, bonusDraw: 0, bonusMove: 0, consumeMark: true }, value || {});
    const wrap = createEl('div', 'field field-block');
    wrap.appendChild(createEl('label', '', field.label));
    const grid = createEl('div', 'field-grid');
    const defs = [
      { key: 'bonusDamage', label: '额外伤害', type: 'number' },
      { key: 'bonusDraw', label: '额外抽牌', type: 'number' },
      { key: 'bonusMove', label: '额外位移', type: 'number' },
      { key: 'consumeMark', label: '消耗标记', type: 'toggle' },
    ];
    defs.forEach((def) => {
      const child = renderWidget(def, current[def.key], (next) => {
        current[def.key] = next;
        onChange(deepClone(current));
      }, {});
      grid.appendChild(child);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function renderTableEditor(field, value, onChange, columns) {
    const rows = Array.isArray(value) ? deepClone(value) : [];
    const wrap = createEl('div', 'field field-block');
    wrap.appendChild(createEl('label', '', field.label));
    const list = createEl('div', 'field-list');

    function rerender() {
      list.innerHTML = '';
      rows.forEach((row, rowIndex) => {
        const box = createEl('div', 'field-card');
        const grid = createEl('div', 'field-grid');
        columns.forEach((col) => {
          const def = { key: col, label: col, type: 'text' };
          const child = renderWidget(def, row[col], (next) => {
            row[col] = next;
            onChange(deepClone(rows));
          }, {});
          grid.appendChild(child);
        });
        const remove = createEl('button', '', '删除行');
        remove.type = 'button';
        remove.addEventListener('click', () => {
          rows.splice(rowIndex, 1);
          rerender();
          onChange(deepClone(rows));
        });
        box.appendChild(grid);
        box.appendChild(remove);
        list.appendChild(box);
      });
    }

    const add = createEl('button', '', '新增一行');
    add.type = 'button';
    add.addEventListener('click', () => {
      const row = {};
      columns.forEach((col) => { row[col] = ''; });
      rows.push(row);
      rerender();
      onChange(deepClone(rows));
    });

    wrap.appendChild(list);
    wrap.appendChild(add);
    rerender();
    return wrap;
  }

  function renderModeList(field, value, onChange) {
    const modes = Array.isArray(value) ? deepClone(value) : [];
    const wrap = createEl('div', 'field field-block');
    wrap.appendChild(createEl('label', '', field.label));
    const list = createEl('div', 'field-list');

    function rerender() {
      list.innerHTML = '';
      modes.forEach((mode, index) => {
        const card = createEl('div', 'field-card');
        card.appendChild(createEl('div', 'chip', '模式 ' + (index + 1)));
        const grid = createEl('div', 'field-grid');
        [
          { key: 'name', label: '模式名称', type: 'text' },
          { key: 'templateRef', label: '模板', type: 'select', options: ['direct_damage', 'self_buff', 'teleport', 'dash_hit'] },
          { key: 'damage', label: '伤害骰', type: 'text' },
          { key: 'range', label: '距离', type: 'number_optional' },
          { key: 'buffBasic', label: '普攻加值', type: 'number_optional' },
          { key: 'basicAttackCapDelta', label: '普攻次数增量', type: 'number_optional' },
          { key: 'consumeOn', label: '消耗条件', type: 'select', options: ['next_basic_attack', 'next_spell_hit', 'end_of_turn', 'manual'] },
        ].forEach((def) => {
          const child = renderWidget(def, mode[def.key], (next) => {
            mode[def.key] = next;
            onChange(deepClone(modes));
          }, {});
          grid.appendChild(child);
        });
        const remove = createEl('button', '', '删除模式');
        remove.type = 'button';
        remove.addEventListener('click', () => {
          modes.splice(index, 1);
          rerender();
          onChange(deepClone(modes));
        });
        card.appendChild(grid);
        card.appendChild(remove);
        list.appendChild(card);
      });
    }

    const add = createEl('button', '', '新增模式');
    add.type = 'button';
    add.addEventListener('click', () => {
      modes.push({
        name: '新模式',
        templateRef: 'direct_damage',
        damage: '',
        range: null,
        buffBasic: null,
        basicAttackCapDelta: null,
        consumeOn: 'manual',
      });
      rerender();
      onChange(deepClone(modes));
    });

    wrap.appendChild(list);
    wrap.appendChild(add);
    rerender();
    return wrap;
  }

  function renderWidget(field, value, onChange, mappings) {
    const type = field.type;
    const meta = (mappings.fieldWidgets && mappings.fieldWidgets[type]) || {};
    if (type === 'number') return renderNumberInput(field, value, onChange, false);
    if (type === 'number_optional') return renderNumberInput(field, value, onChange, true);
    if (type === 'toggle') return renderToggle(field, value, onChange);
    if (type === 'select') return renderSelect(field, value, onChange);
    if (type === 'conditional_bonus') return renderConditionalBonus(field, value, onChange);
    if (type === 'control_picker') return renderControlBuilder(field, value, onChange);
    if (type === 'marked_bonus_picker') return renderMarkedBonusBuilder(field, value, onChange);
    if (type === 'token_bonus_table') return renderTableEditor(field, value, onChange, ['tokenType', 'bonusDamage']);
    if (type === 'mode_list') return renderModeList(field, value, onChange);
    return renderTextInput(field, value, onChange, meta);
  }

  function getTemplateDefinition(templateKey, palette, mappings) {
    const index = buildTemplateIndex(palette);
    const template = index[templateKey];
    const defaults = (mappings.templateDefaults && mappings.templateDefaults[templateKey]) || {};
    return { template, defaults };
  }

  function resetEntryToTemplate(entry, templateKey, palette, mappings) {
    const info = getTemplateDefinition(templateKey, palette, mappings);
    entry.template = templateKey;
    entry.config = deepClone(info.defaults || {});
    return entry;
  }

  function renderTemplateForm(host, entry, palette, mappings, onEntryChange) {
    host.innerHTML = '';
    const { template, defaults } = getTemplateDefinition(entry.template, palette, mappings);
    if (!entry.config) entry.config = deepClone(defaults || {});

    const summary = createEl('div', 'panel note');
    summary.textContent = template
      ? (template.label + '：' + (template.summary || ''))
      : '未找到模板定义';
    host.appendChild(summary);

    const baseGrid = createEl('div', 'field-grid');
    const nameField = renderTextInput({ label: '名称' }, entry.name, (next) => {
      entry.name = next;
      onEntryChange(entry);
    }, {});
    baseGrid.appendChild(nameField);

    const templateField = renderSelect(
      { label: '模板', options: Object.keys(buildTemplateIndex(palette)) },
      entry.template,
      (next) => {
        resetEntryToTemplate(entry, next, palette, mappings);
        onEntryChange(entry);
        renderTemplateForm(host, entry, palette, mappings, onEntryChange);
      }
    );
    baseGrid.appendChild(templateField);
    host.appendChild(baseGrid);

    const formGrid = createEl('div', 'field-grid');
    for (const field of template ? (template.uiFields || []) : []) {
      const currentValue = entry.config[field.key];
      const widget = renderWidget(field, currentValue, (next) => {
        entry.config[field.key] = next;
        onEntryChange(entry);
      }, mappings);
      formGrid.appendChild(widget);
    }
    host.appendChild(formGrid);
  }

  global.EditorRendererV090 = {
    deepClone,
    getByPath,
    setByPath,
    buildTemplateIndex,
    getTemplateDefinition,
    resetEntryToTemplate,
    renderTemplateForm,
  };
})(typeof window !== 'undefined' ? window : globalThis);
