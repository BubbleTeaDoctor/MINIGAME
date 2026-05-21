
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
    origin: [['','(空)'],['职业技能','职业技能'],['武器技能','武器技能'],['饰品技能','饰品技能'],['护甲技能','护甲技能'],['靴子技能','靴子技能'],['咒物技能','咒物技能'],['职业被动','职业被动']],
    refundBucket: [['','不返还'],['class_or_guardian','返还职业卡次数'],['weapon_or_accessory','返还武器卡次数'],['equipment_skill','返还装备卡次数'],['basic_attack','返还普通攻击次数']],
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
    affectedBuckets: [['class','class'],['weapon','weapon'],['accessory','accessory'],['equipment','equipment']],
    exceptionBuckets: [['class','class'],['weapon','weapon'],['accessory','accessory'],['equipment','equipment']],
    negativeEffectType: [['fumble','Fumble / 手忙脚乱'],['vulnerable','Vulnerable / 破绽'],['clumsy','Clumsy / 笨拙'],['panic','Panic / 惊慌'],['chaos','Chaos / 混乱'],['blood','Blood / 生命代价']],
    fumbleBucket: [['random','随机行动机会'],['basic_attack','普通攻击机会'],['weapon_or_accessory','武器技能机会'],['class_or_guardian','职业技能机会'],['equipment_skill','装备技能机会']],
    vulnerableScope: [['any','任意伤害'],['attack','攻击伤害'],['basic','普通攻击'],['spell','法术伤害'],['hazard','地形/黑洞/尖刺'],['trap','陷阱'],['negative','负面牌']],
    vulnerableDuration: [['next','下次'],['permanent','永久']],
    clumsyScope: [['any','下一次攻击或技能'],['attack','下一次攻击'],['skill','下一次技能']],
    clumsyDuration: [['next','下次'],['permanent','永久']],
    panicMode: [['random_attack','随机弃一张攻击牌'],['highest_damage','弃掉最高伤害牌']],
    turnStartNegativeEffect: [['','无'],['fumble','Fumble / 手忙脚乱'],['vulnerable','Vulnerable / 破绽'],['clumsy','Clumsy / 笨拙'],['panic','Panic / 惊慌'],['chaos','Chaos / 混乱'],['blood','Blood / 生命代价']],
  };

  function currentRuleset(){ return state.rulesetCache; }
  function equipmentScopeInfo(scope = state.scope){
    if(scope === 'weapon_cards') return { label: '武器', library: 'weaponLibrary', source: '武器技能', entity: 'weapon' };
    if(scope === 'accessory_cards') return { label: '饰品', library: 'accessoryLibrary', source: '饰品技能', entity: 'accessory' };
    if(scope === 'armor_cards') return { label: '护甲', library: 'armorLibrary', source: '护甲技能', entity: 'armor' };
    if(scope === 'boots_cards') return { label: '靴子', library: 'bootsLibrary', source: '靴子技能', entity: 'boots' };
    if(scope === 'relic_cards') return { label: '咒物', library: 'relicLibrary', source: '咒物技能', entity: 'relic' };
    return null;
  }
  function isEquipmentCardScope(scope = state.scope){
    return !!equipmentScopeInfo(scope);
  }
  function currentEntityCollection(){
    if (state.scope === 'weapon_cards') return currentRuleset().data.weaponLibrary || {};
    if (state.scope === 'accessory_cards') return currentRuleset().data.accessoryLibrary || {};
    if (state.scope === 'armor_cards') return currentRuleset().data.armorLibrary || {};
    if (state.scope === 'boots_cards') return currentRuleset().data.bootsLibrary || {};
    if (state.scope === 'relic_cards') return currentRuleset().data.relicLibrary || {};
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
    if (isEquipmentCardScope()) {
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
    const equipment = equipmentScopeInfo();
    if (equipment) return equipment.label;
    if (state.scope === 'negative_cards') return '负面牌';
    return '职业';
  }
  function currentEntityName(){
    return state.scope === 'negative_cards' ? '负面牌库' : (currentEntity()?.name || state.profession);
  }

  function defaultCardArtForCurrent() {
    if (state.scope === 'cards' || state.scope === 'passives') {
      const portraitKey = {
        warrior: 'warrior',
        mage: 'mage',
        rogue: 'rogue',
        priest: 'priest',
        shaman: 'shaman',
        necro: 'necro',
        necromancer: 'necro',
        warlock: 'warlock',
        hunter: 'hunter',
        monk: 'monk',
        samurai: 'swordsman',
        swordsman: 'swordsman',
        assassin: 'rogue'
      }[String(state.profession || '').toLowerCase()] || String(state.profession || 'warrior').toLowerCase();
      return `assets/portraits/${portraitKey}-select.png`;
    }
    return 'assets/portraits/warrior-select.png';
  }

  function normalizeArtName(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function findMatchingCardArt(card = state.current, artManifest = null) {
    const images = artManifest?.images || [];
    if (!card || !images.length) return '';
    const candidates = [
      card.name,
      state.entryKey,
      String(state.entryKey || '').replace(/^[a-z]+_/, '')
    ].map(normalizeArtName).filter(Boolean);
    const exact = images.find(img => candidates.includes(normalizeArtName(img.name)) || candidates.includes(normalizeArtName(img.label)));
    return exact?.path || '';
  }

  function cardArtPath(card = state.current, artManifest = null) {
    return (card && String(card.art || '').trim()) || findMatchingCardArt(card, artManifest) || defaultCardArtForCurrent();
  }

  function assetUrl(path) {
    const value = String(path || '').trim();
    if (!value || /^(data:|blob:|https?:)/i.test(value)) return value;
    return value.split('/').map(part => encodeURIComponent(part)).join('/');
  }

  function ensureCardArtTransform(card = state.current) {
    if (!card) return { x: 0, y: 0, scale: 1 };
    card.artTransform = card.artTransform || {};
    const t = card.artTransform;
    t.x = Number(t.x || 0);
    t.y = Number(t.y || 0);
    t.scale = Number(t.scale || 1) || 1;
    return t;
  }

  function ensureCardTextTransform(card = state.current) {
    if (!card) return { title: {}, desc: {} };
    card.textTransform = card.textTransform || {};
    card.textTransform.title = card.textTransform.title || {};
    card.textTransform.desc = card.textTransform.desc || {};
    return card.textTransform;
  }

  function cardTextTransformFor(role, card = state.current) {
    return card?.textTransform?.[role] || {};
  }

  function setCardTextTransformValue(role, key, value) {
    const textTransform = ensureCardTextTransform();
    if (value === '' || value == null) delete textTransform[role][key];
    else textTransform[role][key] = value;
    const normalize = obj => Object.entries(obj).filter(([, v]) => {
      if (typeof v === 'string') return v.trim() !== '';
      return Number(v || 0) !== 0;
    });
    if (!normalize(textTransform.title).length) delete textTransform.title;
    if (!normalize(textTransform.desc).length) delete textTransform.desc;
    if (!Object.keys(textTransform).length) delete state.current.textTransform;
  }

  const CARD_FONT_OPTIONS = [
    ['', '默认'],
    ['SimHei', '黑体 / SimHei'],
    ['Microsoft YaHei', '微软雅黑'],
    ['KaiTi', '楷体 / KaiTi'],
    ['SimSun', '宋体 / SimSun'],
    ['FangSong', '仿宋 / FangSong'],
    ['serif', 'Serif'],
    ['sans-serif', 'Sans-serif']
  ];

  function cardFontFamily(role, fontKey) {
    const fonts = {
      SimHei: `"SimHei", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif`,
      'Microsoft YaHei': `"Microsoft YaHei UI", "Microsoft YaHei", sans-serif`,
      KaiTi: `"KaiTi", "STKaiti", "Microsoft YaHei", serif`,
      SimSun: `"SimSun", "Songti SC", serif`,
      FangSong: `"FangSong", "STFangsong", serif`,
      serif: `serif`,
      'sans-serif': `sans-serif`
    };
    if (fontKey && fonts[fontKey]) return fonts[fontKey];
    return role === 'title'
      ? `"Microsoft YaHei UI", "Microsoft YaHei", "SimHei", sans-serif`
      : `serif`;
  }

  const CARD_TEMPLATE_MANIFEST_URL = 'assets/card-templates/manifest.json';
  const CARD_ART_MANIFEST_URL = 'assets/card_art/manifest.json';
  let cardTemplateManifestPromise = null;
  const cardTemplateConfigCache = {};

  function loadCardTemplateManifest() {
    if (!cardTemplateManifestPromise) {
      cardTemplateManifestPromise = fetch(CARD_TEMPLATE_MANIFEST_URL)
        .then(res => {
          if (!res.ok) throw new Error(`card template manifest ${res.status}`);
          return res.json();
        })
        .catch(() => ({ templates: {}, defaultTemplate: 'warrior' }));
    }
    return cardTemplateManifestPromise;
  }

  function loadCardArtManifest() {
    return fetch(`${CARD_ART_MANIFEST_URL}?v=${Date.now()}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`card art manifest ${res.status}`);
        return res.json();
      })
      .catch(() => ({ images: [] }));
  }

  function loadCardTemplateConfig(entry) {
    if (!entry?.config) return Promise.resolve(null);
    if (!cardTemplateConfigCache[entry.key]) {
      cardTemplateConfigCache[entry.key] = fetch(entry.config)
        .then(res => {
          if (!res.ok) throw new Error(`card template config ${res.status}`);
          return res.json();
        })
        .catch(() => null);
    }
    return cardTemplateConfigCache[entry.key];
  }

  function inferCardTemplateKey() {
    if (state.scope === 'weapon_cards') return 'weapon';
    if (state.scope === 'accessory_cards') return 'accessory';
    if (state.scope === 'armor_cards' || state.scope === 'boots_cards') return 'gear';
    if (state.scope === 'relic_cards') return 'relic';
    if (state.scope === 'negative_cards') return 'warlock';
    const professionKey = String(state.profession || '').toLowerCase();
    return {
      warrior: 'warrior',
      mage: 'mage',
      rogue: 'assassin',
      assassin: 'assassin',
      priest: 'priest',
      shaman: 'shaman',
      necro: 'necro',
      necromancer: 'necro',
      warlock: 'warlock',
      hunter: 'hunter',
      monk: 'monk',
      samurai: 'samurai',
      swordsman: 'samurai'
    }[professionKey] || 'warrior';
  }

  function resolveCardTemplateKey(manifest) {
    const templates = manifest?.templates || {};
    const requested = String(state.current?.cardTemplate || '').trim();
    const inferred = inferCardTemplateKey();
    return templates[requested] ? requested : templates[inferred] ? inferred : manifest?.defaultTemplate || Object.keys(templates)[0] || '';
  }

  function cardTemplateLabel(entry) {
    return entry?.label || entry?.key || 'template';
  }

  function applyTemplateBox(el, box, dim) {
    el.style.position = 'absolute';
    el.style.left = `${(Number(box.x || 0) / dim.width) * 100}%`;
    el.style.top = `${(Number(box.y || 0) / dim.height) * 100}%`;
    el.style.width = `${(Number(box.w || 0) / dim.width) * 100}%`;
    el.style.height = `${(Number(box.h || 0) / dim.height) * 100}%`;
  }

  function scaledCardFontSize(baseSize, dim, text, role) {
    const size = Number(baseSize || (role === 'title' ? 48 : 30));
    return `${(size / dim.width) * 100}cqw`;
  }

  function renderFullCardPreview(host, entry, cfg, artManifest = null) {
    host.innerHTML = '';
    if (!entry || !cfg) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = '未找到卡牌模板配置。';
      host.appendChild(empty);
      return;
    }
    const dim = cfg.imageDimensions || { width: 1086, height: 1448 };
    const card = state.current || {};
    const artTransform = ensureCardArtTransform(card);
    const titleText = card.name || state.entryKey || '';
    const faceText = card.cardText || card.text || '';

    const preview = document.createElement('div');
    preview.style.width = 'min(100%, 300px)';
    preview.style.aspectRatio = `${dim.width} / ${dim.height}`;
    preview.style.position = 'relative';
    preview.style.containerType = 'inline-size';
    preview.style.overflow = 'visible';
    preview.style.background = 'transparent';
    preview.style.margin = '6px auto 0';

    if (cfg.artBox) {
      const artSlot = document.createElement('div');
      applyTemplateBox(artSlot, cfg.artBox, dim);
      artSlot.style.overflow = 'hidden';
      artSlot.style.zIndex = '1';
      artSlot.style.background = '#111';
      const art = document.createElement('img');
      art.src = assetUrl(cardArtPath(card, artManifest));
      art.alt = '';
      art.style.position = 'absolute';
      art.style.left = `calc(50% + ${(artTransform.x / Number(cfg.artBox.w || 1)) * 100}%)`;
      art.style.top = `calc(50% + ${(artTransform.y / Number(cfg.artBox.h || 1)) * 100}%)`;
      art.style.width = '100%';
      art.style.height = 'auto';
      art.style.minHeight = '100%';
      art.style.objectFit = 'cover';
      art.style.transform = `translate(-50%, -50%) scale(${artTransform.scale})`;
      art.style.transformOrigin = 'center';
      artSlot.appendChild(art);
      preview.appendChild(artSlot);
    }

    function addBackground(box, conf, role) {
      if (!box || !conf?.bgImage) return;
      const bgSlot = document.createElement('div');
      applyTemplateBox(bgSlot, box, dim);
      bgSlot.style.overflow = 'hidden';
      bgSlot.style.zIndex = '2';
      const bg = document.createElement('img');
      bg.src = conf.bgImage;
      bg.alt = '';
      bg.style.position = 'absolute';
      bg.style.left = '50%';
      bg.style.top = '50%';
      const fillScale = Math.max(role === 'desc' ? 1.5 : 1, Number(conf.bgTransform?.scale || 1));
      bg.style.width = `${fillScale * 100}%`;
      bg.style.height = `${fillScale * 100}%`;
      bg.style.objectFit = 'fill';
      bg.style.transform = `translate(calc(-50% + ${Number(conf.bgTransform?.x || 0) / Number(box.w || 1) * 100}%), calc(-50% + ${Number(conf.bgTransform?.y || 0) / Number(box.h || 1) * 100}%))`;
      bg.style.transformOrigin = 'center';
      bgSlot.appendChild(bg);
      preview.appendChild(bgSlot);
    }

    addBackground(cfg.titleBox, cfg.textConfigs?.title, 'title');
    addBackground(cfg.textBox, cfg.textConfigs?.desc, 'desc');

    function addText(box, conf, text, role) {
      if (!box) return;
      const override = cardTextTransformFor(role, card);
      const baseOffsetX = Number(conf?.offset?.x || 0);
      const baseOffsetY = Number(conf?.offset?.y || 0);
      const offsetX = baseOffsetX + Number(override.x || 0);
      const offsetY = baseOffsetY + Number(override.y || 0);
      const sizeOverride = Number(override.size || 0);
      const baseSize = sizeOverride > 0 ? sizeOverride : role === 'desc' ? 60 : role === 'title' ? 55 : conf?.size;
      const layer = document.createElement('div');
      applyTemplateBox(layer, box, dim);
      layer.style.zIndex = '3';
      layer.style.overflow = 'hidden';
      layer.style.display = 'flex';
      layer.style.alignItems = role === 'title' ? 'center' : 'flex-start';
      layer.style.justifyContent = 'center';
      layer.style.textAlign = 'center';
      layer.style.pointerEvents = 'none';
      const inner = document.createElement('div');
      if (role === 'title') {
        Array.from(String(text || '')).forEach(char => {
          const span = document.createElement('span');
          span.textContent = char;
          inner.appendChild(span);
        });
      } else {
        inner.textContent = text;
      }
      inner.style.position = 'relative';
      inner.style.left = `${(offsetX / Number(box.w || 1)) * 100}%`;
      inner.style.top = `${(offsetY / Number(box.h || 1)) * 100}%`;
      inner.style.width = role === 'title' ? '48%' : '92%';
      inner.style.whiteSpace = 'pre-wrap';
      inner.style.overflowWrap = 'break-word';
      inner.style.lineHeight = role === 'title' ? '1' : '1.18';
      inner.style.fontFamily = cardFontFamily(role, override.font);
      inner.style.fontSize = scaledCardFontSize(baseSize, dim, text, role);
      inner.style.color = conf?.color || '#fff';
      inner.style.fontWeight = role === 'title' ? '900' : '500';
      if (role === 'title') {
        inner.style.display = 'flex';
        inner.style.alignItems = 'center';
        inner.style.justifyContent = 'space-between';
      }
      inner.style.textShadow = role === 'title'
        ? '0 1px 1px #000, 0 0 2px #000'
        : '0 1px 2px #000, 0 0 3px #000';
      if (role === 'title' || conf?.strokeWidth) {
        const stroke = role === 'title' ? Number(conf?.strokeWidth || 1.2) * 0.45 : Number(conf?.strokeWidth || 0.9);
        inner.style.webkitTextStroke = `${(stroke / dim.width) * 100}cqw rgba(30, 12, 2, .72)`;
      }
      layer.appendChild(inner);
      preview.appendChild(layer);
    }

    addText(cfg.titleBox, cfg.textConfigs?.title, titleText, 'title');
    addText(cfg.textBox, cfg.textConfigs?.desc, faceText, 'desc');

    const frame = document.createElement('img');
    frame.src = entry.frame;
    frame.alt = '';
    frame.style.position = 'absolute';
    frame.style.inset = '0';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.zIndex = '4';
    frame.style.pointerEvents = 'none';
    preview.appendChild(frame);
    host.appendChild(preview);
  }

  function renderCardVisualFields(host) {
    if (!state.current || state.scope === 'passives') return;
    ensureCardArtTransform();

    const section = document.createElement('div');
    section.className = 'field';
    const title = document.createElement('label');
    title.textContent = '卡面显示设置';
    section.appendChild(title);

    const templateField = document.createElement('div');
    templateField.className = 'field';
    const templateLabel = document.createElement('label');
    templateLabel.textContent = '卡牌模板';
    templateField.appendChild(templateLabel);
    const templateSelect = document.createElement('select');
    const autoOption = document.createElement('option');
    autoOption.value = '';
    autoOption.textContent = `自动（${inferCardTemplateKey()}）`;
    templateSelect.appendChild(autoOption);
    templateSelect.value = state.current.cardTemplate || '';
    templateField.appendChild(templateSelect);
    section.appendChild(templateField);

    const cardTextField = document.createElement('div');
    cardTextField.className = 'field';
    const cardTextLabel = document.createElement('label');
    cardTextLabel.textContent = '卡面短文本（留空则使用上方完整描述）';
    cardTextField.appendChild(cardTextLabel);
    const cardTextArea = document.createElement('textarea');
    cardTextArea.rows = 3;
    cardTextArea.value = state.current.cardText || '';
    cardTextArea.placeholder = '例：恢复 1D8。\n被动：每第 4 次治疗，额外恢复 1D6。';
    cardTextArea.oninput = () => {
      ensureEditableRuleset();
      state.current.cardText = cardTextArea.value;
      if (!state.current.cardText) delete state.current.cardText;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
      refreshPreview();
    };
    cardTextField.appendChild(cardTextArea);

    const artGrid = document.createElement('div');
    artGrid.className = 'field-grid';
    const artPathField = document.createElement('div');
    artPathField.className = 'field';
    const artPathLabel = document.createElement('label');
    artPathLabel.textContent = '插图路径（留空则使用默认职业立绘）';
    artPathField.appendChild(artPathLabel);
    const artInput = document.createElement('input');
    artInput.type = 'text';
    artInput.value = state.current.art || '';
    artInput.placeholder = defaultCardArtForCurrent();
    artPathField.appendChild(artInput);
    const artSelect = document.createElement('select');
    const artAuto = document.createElement('option');
    artAuto.value = '';
    artAuto.textContent = '自动匹配同名插图';
    artSelect.appendChild(artAuto);
    artPathField.appendChild(artSelect);
    const artFile = document.createElement('input');
    artFile.type = 'file';
    artFile.accept = 'image/*';
    artFile.onchange = () => {
      const file = artFile.files && artFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        ensureEditableRuleset();
        state.current.art = String(reader.result || '');
        artInput.value = state.current.art;
        syncCurrentEntryToCache();
        renderFriendlyPreview();
        refreshPreview();
      };
      reader.readAsDataURL(file);
    };
    artPathField.appendChild(artFile);
    const artHint = document.createElement('div');
    artHint.className = 'muted';
    artHint.textContent = '可填写项目内路径；也可临时选择图片并以内嵌 data URL 保存。后续正式图建议放入 assets/card_art 后改为路径。';
    artPathField.appendChild(artHint);
    artGrid.appendChild(artPathField);

    [
      ['scale', '插图缩放', 'number', '0.05'],
      ['x', '插图 X 偏移', 'number', '1'],
      ['y', '插图 Y 偏移', 'number', '1']
    ].forEach(([key, label, type, step]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      const input = document.createElement('input');
      input.type = type;
      input.step = step;
      input.value = state.current.artTransform?.[key] ?? (key === 'scale' ? 1 : 0);
      input.oninput = () => {
        ensureEditableRuleset();
        const t = ensureCardArtTransform();
        t[key] = key === 'scale' ? Math.max(0.1, Number(input.value || 1)) : Number(input.value || 0);
        syncCurrentEntryToCache();
        renderFriendlyPreview();
        refreshPreview();
      };
      field.appendChild(input);
      artGrid.appendChild(field);
    });
    section.appendChild(artGrid);

    const textGrid = document.createElement('div');
    textGrid.className = 'field-grid';
    textGrid.appendChild(cardTextField);
    cardTextField.style.gridColumn = '1 / -1';
    const textAdjustHint = document.createElement('div');
    textAdjustHint.className = 'muted';
    textAdjustHint.style.gridColumn = '1 / -1';
    textAdjustHint.textContent = '文字位置默认读取模板坐标；下面的数值是在模板基础上的每卡微调。标题字号填 0 使用默认 55，描述字号填 0 使用默认 60。';
    textGrid.appendChild(textAdjustHint);
    const textControlInputs = [];
    [
      ['title', '标题字体'],
      ['desc', '描述字体']
    ].forEach(([role, label]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      const select = document.createElement('select');
      CARD_FONT_OPTIONS.forEach(([value, text]) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = text;
        select.appendChild(opt);
      });
      select.value = cardTextTransformFor(role).font || (role === 'title' ? 'Microsoft YaHei' : 'serif');
      select.onchange = () => {
        ensureEditableRuleset();
        setCardTextTransformValue(role, 'font', select.value);
        syncCurrentEntryToCache();
        renderFriendlyPreview();
        refreshPreview();
      };
      field.appendChild(select);
      textGrid.appendChild(field);
    });
    [
      ['title', '标题文字 X 偏移', 'x', '1'],
      ['title', '标题文字 Y 偏移', 'y', '1'],
      ['title', '标题字号覆盖', 'size', '1'],
      ['desc', '描述文字 X 偏移', 'x', '1'],
      ['desc', '描述文字 Y 偏移', 'y', '1'],
      ['desc', '描述字号覆盖', 'size', '1']
    ].forEach(([role, label, key, step]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      const input = document.createElement('input');
      input.type = 'number';
      input.step = step;
      input.value = cardTextTransformFor(role)[key] ?? (key === 'size' ? (role === 'desc' ? 60 : role === 'title' ? 55 : 0) : 0);
      input.placeholder = '模板值';
      input.oninput = () => {
        ensureEditableRuleset();
        const value = key === 'size' ? Math.max(0, Number(input.value || 0)) : Number(input.value || 0);
        setCardTextTransformValue(role, key, value);
        syncCurrentEntryToCache();
        renderFriendlyPreview();
        refreshPreview();
      };
      field.appendChild(input);
      textControlInputs.push({ role, key, input });
      textGrid.appendChild(field);
    });
    const preview = document.createElement('div');
    preview.className = 'summary-box';
    preview.style.minHeight = '160px';
    preview.style.display = 'flex';
    preview.style.alignItems = 'center';
    preview.style.gap = '12px';
    preview.style.overflow = 'hidden';
    const imgWrap = document.createElement('div');
    imgWrap.style.width = '96px';
    imgWrap.style.height = '132px';
    imgWrap.style.flex = '0 0 auto';
    imgWrap.style.overflow = 'hidden';
    imgWrap.style.border = '1px solid rgba(255,255,255,.16)';
    imgWrap.style.background = 'rgba(0,0,0,.28)';
    const img = document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    imgWrap.appendChild(img);
    const meta = document.createElement('div');
    meta.className = 'muted';
    meta.style.whiteSpace = 'pre-wrap';
    preview.appendChild(imgWrap);
    preview.appendChild(meta);
    section.appendChild(preview);

    const fullPreviewField = document.createElement('div');
    fullPreviewField.className = 'field';
    const fullPreviewLabel = document.createElement('label');
    fullPreviewLabel.textContent = '完整卡牌预览';
    fullPreviewField.appendChild(fullPreviewLabel);
    const fullPreviewLayout = document.createElement('div');
    fullPreviewLayout.style.display = 'flex';
    fullPreviewLayout.style.gap = '14px';
    fullPreviewLayout.style.alignItems = 'flex-start';
    fullPreviewLayout.style.flexWrap = 'wrap';
    const fullPreview = document.createElement('div');
    fullPreview.className = 'summary-box';
    fullPreview.style.minHeight = '360px';
    fullPreview.style.display = 'flex';
    fullPreview.style.alignItems = 'center';
    fullPreview.style.justifyContent = 'center';
    fullPreview.style.overflow = 'visible';
    fullPreview.style.flex = '1 1 360px';
    fullPreviewLayout.appendChild(fullPreview);
    textGrid.style.flex = '1 1 280px';
    textGrid.style.margin = '0';
    fullPreviewLayout.appendChild(textGrid);
    fullPreviewField.appendChild(fullPreviewLayout);
    section.appendChild(fullPreviewField);

    function populateTemplateSelect(manifest) {
      if (templateSelect.dataset.loaded) return;
      const templates = manifest?.templates || {};
      const inferred = inferCardTemplateKey();
      autoOption.textContent = `自动（${cardTemplateLabel(templates[inferred])}）`;
      Object.values(templates).forEach(entry => {
        const opt = document.createElement('option');
        opt.value = entry.key;
        opt.textContent = cardTemplateLabel(entry);
        templateSelect.appendChild(opt);
      });
      templateSelect.value = state.current.cardTemplate || '';
      templateSelect.dataset.loaded = '1';
    }

    function populateArtSelect(artManifest) {
      const previousValue = state.current.art || artSelect.value || '';
      artSelect.innerHTML = '';
      const artAuto = document.createElement('option');
      artAuto.value = '';
      artAuto.textContent = '自动匹配同名插图';
      artSelect.appendChild(artAuto);
      const images = artManifest?.images || [];
      images.forEach(imgEntry => {
        const opt = document.createElement('option');
        opt.value = imgEntry.path;
        opt.textContent = imgEntry.label || imgEntry.name || imgEntry.file;
        artSelect.appendChild(opt);
      });
      artSelect.value = images.some(imgEntry => imgEntry.path === previousValue) ? previousValue : '';
    }

    function refreshPreview() {
      const t = ensureCardArtTransform();
      const artManifestPromise = loadCardArtManifest();
      artManifestPromise.then(artManifest => {
        if (!section.isConnected) return;
        populateArtSelect(artManifest);
        const currentArt = cardArtPath(state.current, artManifest);
        img.src = assetUrl(currentArt);
        artInput.placeholder = findMatchingCardArt(state.current, artManifest) || defaultCardArtForCurrent();
        artSelect.value = state.current.art || '';
        meta.textContent = `实际插图：${currentArt}\n卡面文本：${state.current.cardText || state.current.text || '（空）'}`;
      });
      img.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`;
      fullPreview.textContent = '加载卡牌模板...';
      Promise.all([loadCardTemplateManifest(), artManifestPromise]).then(([manifest, artManifest]) => {
        if (!section.isConnected) return;
        populateTemplateSelect(manifest);
        populateArtSelect(artManifest);
        const key = resolveCardTemplateKey(manifest);
        const entry = manifest.templates?.[key];
        return loadCardTemplateConfig(entry).then(cfg => {
          if (!section.isConnected) return;
          textControlInputs.forEach(({ role, key, input }) => {
            const conf = cfg?.textConfigs?.[role] || {};
            const templateValue = key === 'size' ? (role === 'desc' ? 60 : role === 'title' ? 55 : Number(conf.size || 0)) : Number(conf.offset?.[key] || 0);
            input.placeholder = `模板 ${templateValue}`;
            input.title = `${cardTemplateLabel(entry)} 模板基础值：${templateValue}`;
          });
          renderFullCardPreview(fullPreview, entry, cfg, artManifest);
        });
      });
    }

    artInput.oninput = () => {
      ensureEditableRuleset();
      state.current.art = artInput.value.trim();
      if (!state.current.art) delete state.current.art;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
      refreshPreview();
    };

    artSelect.onchange = () => {
      ensureEditableRuleset();
      state.current.art = artSelect.value;
      if (!state.current.art) delete state.current.art;
      artInput.value = state.current.art || '';
      syncCurrentEntryToCache();
      renderFriendlyPreview();
      refreshPreview();
    };

    templateSelect.onchange = () => {
      ensureEditableRuleset();
      if (templateSelect.value) state.current.cardTemplate = templateSelect.value;
      else delete state.current.cardTemplate;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
      refreshPreview();
    };

    state.refreshCardVisualPreview = refreshPreview;
    host.appendChild(section);
    refreshPreview();
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

    rs.data.templates.negative_effect = Object.assign(
      {},
      rs.data.templates.negative_effect || {},
      {
        label: '负面牌：通用负面效果',
        desc: '使用后触发一个可配置的负面效果，如失去行动机会、破绽、笨拙、惊慌、混乱或生命代价。',
        fields: [
          ['negativeEffectType','负面效果','negativeEffectType'],
          ['fumbleBucket','Fumble：失去机会','fumbleBucket'],
          ['vulnerableBonus','Vulnerable：额外受伤','number'],
          ['vulnerableScope','Vulnerable：伤害类型','vulnerableScope'],
          ['vulnerableDuration','Vulnerable：持续','vulnerableDuration'],
          ['clumsyChance','Clumsy：失败率 %','number'],
          ['clumsyScope','Clumsy：影响范围','clumsyScope'],
          ['clumsyDuration','Clumsy：持续','clumsyDuration'],
          ['panicMode','Panic：弃牌方式','panicMode'],
          ['chaosCharges','Chaos：次数','number'],
          ['bloodDamage','Blood：失去生命','text']
        ]
      }
    );
    rs.data.templateDefaults.negative_effect = Object.assign(
      { negativeEffectType: 'fumble', fumbleBucket: 'random', vulnerableBonus: 2, vulnerableScope: 'any', vulnerableDuration: 'next', clumsyChance: 25, clumsyScope: 'any', clumsyDuration: 'next', panicMode: 'random_attack', chaosCharges: 1, bloodDamage: 1 },
      rs.data.templateDefaults.negative_effect || {}
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
    const collection = currentEntityCollection();
    if (!collection[state.profession]) {
      state.profession = Object.keys(collection)[0];
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
    } else if (isEquipmentCardScope()) {
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
      const kind = equipmentScopeInfo()?.entity || (state.scope === 'negative_cards' ? 'card' : 'profession');
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

  function negativeEffectsEditor(effects, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'form-host';
    const list = Array.isArray(effects) ? effects : [];
    const fields = [
      ['negativeEffectType','负面效果','negativeEffectType'],
      ['fumbleBucket','Fumble：失去机会','fumbleBucket'],
      ['vulnerableBonus','Vulnerable：额外受伤','number'],
      ['vulnerableScope','Vulnerable：伤害类型','vulnerableScope'],
      ['vulnerableDuration','Vulnerable：持续','vulnerableDuration'],
      ['clumsyChance','Clumsy：失败率 %','number'],
      ['clumsyScope','Clumsy：影响范围','clumsyScope'],
      ['clumsyDuration','Clumsy：持续','clumsyDuration'],
      ['panicMode','Panic：弃牌方式','panicMode'],
      ['chaosCharges','Chaos：次数','number'],
      ['bloodDamage','Blood：失去生命','text']
    ];

    function renderRow(effect, idx) {
      const box = document.createElement('div');
      box.className = 'panel';
      box.style.padding = '12px';
      box.innerHTML = `<div class="chip">负面效果 ${idx + 1}</div>`;
      const grid = document.createElement('div');
      grid.className = 'field-grid';
      fields.forEach(([key, label, type]) => {
        const field = document.createElement('div');
        field.className = 'field';
        const lab = document.createElement('label');
        lab.textContent = label;
        field.appendChild(lab);
        field.appendChild(makeInput(key, type, effect[key], v => {
          effect[key] = v;
          onChange(list);
        }));
        grid.appendChild(field);
      });
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'danger';
      del.textContent = '删除这个负面效果';
      del.onclick = () => {
        list.splice(idx, 1);
        onChange(list);
        renderForm();
      };
      box.appendChild(grid);
      box.appendChild(del);
      return box;
    }

    list.forEach((effect, idx) => wrap.appendChild(renderRow(effect, idx)));
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'secondary';
    add.textContent = '添加负面效果';
    add.onclick = () => {
      list.push({ negativeEffectType: 'fumble', fumbleBucket: 'random', vulnerableBonus: 2, vulnerableScope: 'any', vulnerableDuration: 'next', clumsyChance: 25, clumsyScope: 'any', clumsyDuration: 'next', panicMode: 'random_attack', chaosCharges: 1, bloodDamage: 1 });
      onChange(list);
      renderForm();
    };
    wrap.appendChild(add);
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
    const fallbackSource = state.scope === 'cards' ? '职业技能' : state.scope === 'passives' ? '职业被动' : equipmentScopeInfo()?.source || '饰品技能';
    lines.push(`Source: ${I18N().entity('origin', c.source || fallbackSource, c.source || fallbackSource)}`);
    lines.push(`Template: ${I18N().entity('template', c.template, tpl?.label || c.template)}`);
    if (c.config.damage) lines.push(`Damage: ${c.config.damage}`);
    if (c.config.range != null) lines.push(`Range: ${c.config.range}`);
    if (c.config.radius != null) lines.push(`Radius: ${c.config.radius}`);
    if (c.config.buffBasic != null) lines.push(`Bonus: ${c.config.buffBasic}`);
    if (c.config.consumeOn) lines.push(`Consume On: ${c.config.consumeOn}`);
    if (c.config.quick) lines.push('Quick: yes');
    if (c.config.dodgeNext) lines.push('Dodge: next damage');
    if (c.config.counterDamage) lines.push(`Counter Fixed: ${c.config.counterDamage}`);
    if (c.config.counterUseTakenDamage) lines.push('Counter: taken damage');
    if (c.config.classSkillCapDelta) lines.push(`Extra Class Uses: ${c.config.classSkillCapDelta}`);
    if (c.config.reactiveMoveTrigger) lines.push(`Reactive Move: ${c.config.reactiveMoveTrigger} / ${c.config.reactiveMoveMaxDistance || 0}`);
    if (c.config.healOnDamaged) lines.push(`Heal On Damaged: ${c.config.healOnDamaged}`);
    if (c.config.disarmAttackerOnHit) lines.push(`Disarm Attacker: ${c.config.disarmAttackerOnHit}`);
    if (c.config.lifestealPercent) lines.push(`Lifesteal: ${c.config.lifestealPercent}%`);
    if (c.config.lifestealFlat) lines.push(`Lifesteal Flat: ${c.config.lifestealFlat}`);
    if (c.config.applyTemplate) lines.push(`Status Template: ${c.config.applyTemplate}`);
    if (Array.isArray(c.config.negativeEffects) && c.config.negativeEffects.length) lines.push(`Negative Effects: ${c.config.negativeEffects.map(x => x.negativeEffectType || x.effectType).join(', ')}`);
    if (c.config.modes) lines.push(`Modes: ${c.config.modes.length}`);
    if (c.text) lines.push(`Description: ${c.text}`);
    if (c.cardText) lines.push(`Card Face Text: ${c.cardText}`);
    if (state.scope !== 'passives') {
      const t = c.artTransform || {};
      lines.push(`Card Template: ${c.cardTemplate || `auto:${inferCardTemplateKey()}`}`);
      lines.push(`Card Art: ${cardArtPath(c)}`);
      lines.push(`Art Transform: scale ${t.scale || 1}, x ${t.x || 0}, y ${t.y || 0}`);
      if (c.textTransform) lines.push(`Text Transform: ${JSON.stringify(c.textTransform)}`);
    }
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

  function relicNegativeValueMeta(effectType) {
    const map = {
      vulnerable: { label: '破绽数值：下次额外受伤', placeholder: '例如 2' },
      clumsy: { label: '笨拙数值：失败率 %', placeholder: '例如 25' },
      chaos: { label: '混乱数值：触发次数', placeholder: '例如 1' },
      blood: { label: 'Blood 数值：失去生命', placeholder: '例如 3' },
    };
    return map[effectType] || null;
  }

  function renderEntityField(grid, entity, key, label, type, onAfterChange = null) {
    const field = document.createElement('div');
    field.className = 'field';
    const lab = document.createElement('label');
    lab.textContent = label;
    field.appendChild(lab);
    field.appendChild(makeInput(key, type, entity[key], v => {
      ensureEditableRuleset();
      const target = currentEntity();
      if (type === 'number') target[key] = Number(v || 0);
      else target[key] = v;
      if (onAfterChange) onAfterChange(target);
      renderSummary();
      renderFriendlyPreview();
    }));
    grid.appendChild(field);
    return field;
  }

  function renderRelicEntityFields(host, entity, info) {
    const box = document.createElement('div');
    box.className = 'panel';
    box.style.padding = '12px';
    const title = document.createElement('div');
    title.className = 'chip';
    title.textContent = `${info.label}固定效果`;
    box.appendChild(title);

    const positiveTitle = document.createElement('div');
    positiveTitle.className = 'muted';
    positiveTitle.style.marginTop = '8px';
    positiveTitle.textContent = '正面效果：常驻生效。';
    box.appendChild(positiveTitle);
    const positiveGrid = document.createElement('div');
    positiveGrid.className = 'field-grid';
    [
      ['outgoingDamageHealFlat','每次造成伤害回血','number'],
      ['outgoingDamageCritChance','造成伤害暴击率 %','number'],
      ['outgoingDamageCritBonusDie','暴击追加骰','text'],
      ['outgoingDamageCritMultiplier','暴击倍率','number'],
      ['ignoreTargetReductionFlat','造成伤害无视减伤','number'],
      ['moveBonus','每回合移动距离加成','number'],
    ].forEach(([key, label, type]) => renderEntityField(positiveGrid, entity, key, label, type));
    box.appendChild(positiveGrid);

    const costTitle = document.createElement('div');
    costTitle.className = 'muted';
    costTitle.style.marginTop = '12px';
    costTitle.textContent = '常驻代价：永久生效，不需要触发检定。';
    box.appendChild(costTitle);
    const costGrid = document.createElement('div');
    costGrid.className = 'field-grid';
    [
      ['turnStartSelfDamage','每回合开始失去生命（固定代价）','number'],
      ['incomingDamageBonus','永久额外受到伤害','number'],
      ['hazardDamageBonus','永久额外受到地形伤害','number'],
      ['outgoingAttackFailChance','永久攻击/技能失败率 %','number'],
    ].forEach(([key, label, type]) => renderEntityField(costGrid, entity, key, label, type));
    box.appendChild(costGrid);

    const negativeTitle = document.createElement('div');
    negativeTitle.className = 'muted';
    negativeTitle.style.marginTop = '12px';
    negativeTitle.textContent = '回合开始负面：先选择负面效果，再配置触发率和该效果需要的数值。';
    box.appendChild(negativeTitle);
    const negativeGrid = document.createElement('div');
    negativeGrid.className = 'field-grid';
    renderEntityField(negativeGrid, entity, 'turnStartNegativeEffect', '回合开始负面效果', 'turnStartNegativeEffect', () => {
      renderForm();
    });
    const effectType = String(entity.turnStartNegativeEffect || '');
    if(effectType){
      renderEntityField(negativeGrid, entity, 'turnStartNegativeChance', '触发率 %', 'number');
      const meta = relicNegativeValueMeta(effectType);
      if(meta){
        const field = renderEntityField(negativeGrid, entity, 'turnStartNegativePower', meta.label, 'number');
        field.querySelector('input')?.setAttribute('placeholder', meta.placeholder);
      }
    }
    box.appendChild(negativeGrid);
    host.appendChild(box);
  }

  function renderEquipmentEntityFields(host) {
    const info = equipmentScopeInfo();
    const entity = currentEntity();
    if (!info || !entity) return;
    if (info.entity === 'relic') {
      renderRelicEntityFields(host, entity, info);
      return;
    }
    const fieldsByType = {
      armor: [
        ['maxHp','生命值','number'],
        ['damageReductionFlat','固定减伤','number'],
        ['damageReductionRoll','骰子减伤','text'],
        ['incomingDamageBonus','额外受到伤害','number'],
        ['outgoingAttackFailChance','攻击/技能失败率 %','number'],
      ],
      boots: [
        ['moveBase','移动距离','number'],
        ['hazardDamageReduction','地形/陷阱伤害减少','number'],
        ['forcedMoveResistance','强制位移抗性','number'],
        ['incomingDamageBonus','额外受到伤害','number'],
        ['hazardDamageBonus','额外受到地形伤害','number'],
        ['outgoingAttackFailChance','攻击/技能失败率 %','number'],
      ],
    };
    const fields = fieldsByType[info.entity];
    if (!fields) return;
    const box = document.createElement('div');
    box.className = 'panel';
    box.style.padding = '12px';
    const title = document.createElement('div');
    title.className = 'chip';
    title.textContent = `${info.label}固定效果`;
    box.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'field-grid';
    fields.forEach(([key, label, type]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      field.appendChild(makeInput(key, type, entity[key], v => {
        ensureEditableRuleset();
        const target = currentEntity();
        if (type === 'number') target[key] = Number(v || 0);
        else target[key] = v;
        renderSummary();
        renderFriendlyPreview();
      }));
      grid.appendChild(field);
    });
    box.appendChild(grid);
    host.appendChild(box);
  }

  function renderForm() {
    if (!state.current) {
      $('form-title').textContent = '没有可编辑条目';
      const host = $('form-host');
      host.innerHTML = '';
      renderEquipmentEntityFields(host);
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
    const kind = equipmentScopeInfo()?.entity || 'profession';
    $('form-title').textContent = `${I18N().entity(kind, state.profession, currentEntityName())} / ${I18N().entity('card', state.entryKey, state.current.name)}`;
    renderEquipmentEntityFields(host);
    const tpl = currentRuleset().data.templates[state.current.template];
    const note = document.createElement('div');
    note.className = 'muted';
    note.textContent = tpl?.desc || '此模板尚未登记描述';
    host.appendChild(note);
    const descField = document.createElement('div');
    descField.className = 'field';
    const descLab = document.createElement('label');
    descLab.textContent = state.scope === 'cards'
      ? '卡牌描述'
      : state.scope === 'passives'
        ? '被动描述'
        : state.scope === 'negative_cards'
          ? '负面牌描述'
          : `${equipmentScopeInfo()?.label || '饰品'}卡描述`;
    descField.appendChild(descLab);
    const descArea = document.createElement('textarea');
    descArea.rows = 3;
    descArea.value = state.current.text || '';
    descArea.oninput = () => {
      ensureEditableRuleset();
      state.current.text = descArea.value;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
      if (state.refreshCardVisualPreview) state.refreshCardVisualPreview();
    };
    descField.appendChild(descArea);
    host.appendChild(descField);
    renderCardVisualFields(host);
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

    const quickField = document.createElement('div');
    quickField.className = 'field';
    const quickLabel = document.createElement('label');
    quickLabel.textContent = '快速 / Quick（不占用行动桶）';
    quickField.appendChild(quickLabel);
    quickField.appendChild(makeInput('quick', 'boolean', !!state.current.config.quick, v => {
      ensureEditableRuleset();
      if(v) state.current.config.quick = true;
      else delete state.current.config.quick;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
    }));
    host.appendChild(quickField);

    const negativeField = document.createElement('div');
    negativeField.className = 'field';
    const negativeLabel = document.createElement('label');
    negativeLabel.textContent = '附加负面效果（可选，给任意技能添加代价）';
    negativeField.appendChild(negativeLabel);
    negativeField.appendChild(negativeEffectsEditor(state.current.config.negativeEffects || [], v => {
      ensureEditableRuleset();
      if(v.length) state.current.config.negativeEffects = v;
      else delete state.current.config.negativeEffects;
      syncCurrentEntryToCache();
      renderFriendlyPreview();
    }));
    host.appendChild(negativeField);

    const lifestealField = document.createElement('div');
    lifestealField.className = 'field';
    const lifestealLabel = document.createElement('label');
    lifestealLabel.textContent = '附加吸血效果（可选，按实际伤害回血）';
    lifestealField.appendChild(lifestealLabel);
    const lifestealGrid = document.createElement('div');
    lifestealGrid.className = 'field-grid';
    [
      ['lifestealPercent','吸血比例 %','number'],
      ['lifestealFlat','固定吸血','number']
    ].forEach(([key, label, type]) => {
      const field = document.createElement('div');
      field.className = 'field';
      const lab = document.createElement('label');
      lab.textContent = label;
      field.appendChild(lab);
      field.appendChild(makeInput(key, type, state.current.config[key] || 0, v => {
        ensureEditableRuleset();
        const n = Number(v || 0);
        if(n > 0) state.current.config[key] = n;
        else delete state.current.config[key];
        syncCurrentEntryToCache();
        renderFriendlyPreview();
      }));
      lifestealGrid.appendChild(field);
    });
    lifestealField.appendChild(lifestealGrid);
    host.appendChild(lifestealField);
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

  function createArmor() {
    ensureEditableRuleset();
    const key = (window.prompt('请输入新护甲 key，例如 light_armor / medium_armor / heavy_armor') || '').trim();
    if (!key) return;
    const rs = currentRuleset();
    rs.data.armorLibrary = rs.data.armorLibrary || {};
    if (rs.data.armorLibrary[key]) return alert('护甲 key 已存在。');
    const displayName = (window.prompt('请输入护甲显示名称') || key).trim() || key;
    rs.data.armorLibrary[key] = { key, name: displayName, maxHp: 55, damageReductionFlat: 2, damageReductionRoll: '', incomingDamageBonus: 0, outgoingAttackFailChance: 0, cards: [] };
    state.scope = 'armor_cards';
    state.profession = key;
    state.entryKey = null;
    persistRuleset(true, '新护甲已创建。');
  }

  function createBoots() {
    ensureEditableRuleset();
    const key = (window.prompt('请输入新靴子 key，例如 swift_boots / trail_boots / anchor_boots') || '').trim();
    if (!key) return;
    const rs = currentRuleset();
    rs.data.bootsLibrary = rs.data.bootsLibrary || {};
    if (rs.data.bootsLibrary[key]) return alert('靴子 key 已存在。');
    const displayName = (window.prompt('请输入靴子显示名称') || key).trim() || key;
    rs.data.bootsLibrary[key] = { key, name: displayName, moveBase: 4, hazardDamageReduction: 1, forcedMoveResistance: 0, incomingDamageBonus: 0, outgoingAttackFailChance: 0, cards: [] };
    state.scope = 'boots_cards';
    state.profession = key;
    state.entryKey = null;
    persistRuleset(true, '新靴子已创建。');
  }

  function createRelic() {
    ensureEditableRuleset();
    const key = (window.prompt('请输入新咒物 key，例如 blood_pact_relic / chaos_relic') || '').trim();
    if (!key) return;
    const rs = currentRuleset();
    rs.data.relicLibrary = rs.data.relicLibrary || {};
    if (rs.data.relicLibrary[key]) return alert('咒物 key 已存在。');
    const displayName = (window.prompt('请输入咒物显示名称') || key).trim() || key;
    rs.data.relicLibrary[key] = {
      key,
      name: displayName,
      outgoingDamageHealFlat: 0,
      outgoingDamageCritChance: 0,
      outgoingDamageCritBonusDie: '',
      ignoreTargetReductionFlat: 0,
      moveBonus: 0,
      turnStartSelfDamage: 0,
      incomingDamageBonus: 0,
      hazardDamageBonus: 0,
      outgoingAttackFailChance: 0,
      turnStartNegativeEffect: '',
      turnStartNegativeChance: 0,
      turnStartNegativePower: 1,
      cards: []
    };
    state.scope = 'relic_cards';
    state.profession = key;
    state.entryKey = null;
    persistRuleset(true, '新咒物已创建。');
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
    const source = state.scope === 'cards' ? '职业技能' : state.scope === 'passives' ? '职业被动' : equipmentScopeInfo()?.source || '负面牌';
    const chosenTemplate = state.scope === 'negative_cards' ? 'negative_direct_damage' : templateKey;
    const entry = { name: newKey, source, template: chosenTemplate, config: deep(currentRuleset().data.templateDefaults[chosenTemplate]), text: '', negativeOnDraw: state.scope === 'negative_cards' };
    if (isEquipmentCardScope() || state.scope === 'negative_cards') {
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
    if (isEquipmentCardScope() || state.scope === 'negative_cards') {
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
    if (isEquipmentCardScope() || state.scope === 'negative_cards') {
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
    if (isEquipmentCardScope() || state.scope === 'negative_cards') {
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
      state.profession = Object.keys(currentEntityCollection())[0];
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
      if (state.refreshCardVisualPreview) state.refreshCardVisualPreview();
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
    if ($('btn-new-armor')) $('btn-new-armor').onclick = createArmor;
    if ($('btn-new-boots')) $('btn-new-boots').onclick = createBoots;
    if ($('btn-new-relic')) $('btn-new-relic').onclick = createRelic;
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
