// Game UI wiring v0.9.5
// Purpose: connect start screen, dropdowns, card clicks, mode buttons, board clicks,
// and end-turn flow to MainGameIntegrationV094.
// This is a DOM-focused glue layer for Studio game.html.

(function (global) {
  const MG = global.MainGameIntegrationV094;
  const BOE = global.BoardOverlayEngineV092;

  function qs(id) {
    return document.getElementById(id);
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function populateSelect(selectEl, options, getLabel, getValue) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    safeArray(options).forEach((option) => {
      const opt = document.createElement('option');
      opt.value = getValue ? getValue(option) : String(option);
      opt.textContent = getLabel ? getLabel(option) : String(option);
      selectEl.appendChild(opt);
    });
  }

  function buildCardCatalog(data) {
    const catalog = {};
    const cards = data && data.cards ? data.cards : {};
    Object.entries(cards).forEach(([key, value]) => {
      const card = JSON.parse(JSON.stringify(value));
      card.key = key;
      catalog[key] = card;
    });
    return catalog;
  }

  function expandDeck(deckEntries, catalog) {
    const deck = [];
    safeArray(deckEntries).forEach((entry) => {
      const count = entry.count || 1;
      for (let i = 0; i < count; i += 1) {
        const base = catalog[entry.cardKey];
        if (!base) continue;
        const copy = JSON.parse(JSON.stringify(base));
        copy.instanceId = entry.cardKey + '_' + i + '_' + Math.random().toString(36).slice(2, 8);
        deck.push(copy);
      }
    });
    return deck;
  }

  function buildPlayerConfig(data, professionKey, weaponKey, accessoryKey, sideLabel) {
    const professions = data && data.professions ? data.professions : {};
    const profession = professions[professionKey];
    const catalog = buildCardCatalog(data);
    const baseDeck = profession ? expandDeck(profession.deck || [], catalog) : [];
    return {
      name: sideLabel,
      profession: professionKey,
      weapon: weaponKey,
      accessory: accessoryKey,
      guardian: null,
      hp: profession && profession.base ? profession.base.hp : 50,
      professionPassive: profession ? profession.passive : null,
      deck: baseDeck,
    };
  }

  function readStartConfig(data) {
    const p1Profession = qs('p1-profession') ? qs('p1-profession').value : 'warrior';
    const p2Profession = qs('p2-profession') ? qs('p2-profession').value : 'mage';
    const p1Weapon = qs('p1-weapon') ? qs('p1-weapon').value : 'default_weapon';
    const p2Weapon = qs('p2-weapon') ? qs('p2-weapon').value : 'default_weapon';
    const p1Accessory = qs('p1-accessory') ? qs('p1-accessory').value : 'default_accessory';
    const p2Accessory = qs('p2-accessory') ? qs('p2-accessory').value : 'default_accessory';

    return {
      player1: buildPlayerConfig(data, p1Profession, p1Weapon, p1Accessory, 'P1'),
      player2: buildPlayerConfig(data, p2Profession, p2Weapon, p2Accessory, 'P2'),
      cardCatalog: buildCardCatalog(data),
    };
  }

  function getProfessionOptions(data) {
    return Object.entries((data && data.professions) || {}).map(([key, value]) => ({ key, label: value.name || key }));
  }

  function getSimpleOptions(group, fallback) {
    const keys = Object.keys(group || {});
    if (keys.length === 0) return [{ key: fallback, label: fallback }];
    return keys.map((key) => ({ key, label: (group[key] && group[key].name) || key }));
  }

  function bindStartScreen(data) {
    const professionOptions = getProfessionOptions(data);
    const weaponOptions = getSimpleOptions(data && data.weapons, 'default_weapon');
    const accessoryOptions = getSimpleOptions(data && data.accessories, 'default_accessory');

    populateSelect(qs('p1-profession'), professionOptions, (x) => x.label, (x) => x.key);
    populateSelect(qs('p2-profession'), professionOptions, (x) => x.label, (x) => x.key);
    populateSelect(qs('p1-weapon'), weaponOptions, (x) => x.label, (x) => x.key);
    populateSelect(qs('p2-weapon'), weaponOptions, (x) => x.label, (x) => x.key);
    populateSelect(qs('p1-accessory'), accessoryOptions, (x) => x.label, (x) => x.key);
    populateSelect(qs('p2-accessory'), accessoryOptions, (x) => x.label, (x) => x.key);

    const startButton = qs('btn-start-game');
    if (startButton) {
      startButton.onclick = () => {
        const config = readStartConfig(data);
        const state = MG.bootGame(config);
        global.__ARENA_STATE__ = state;
        renderStudioGame(state);
      };
    }
  }

  function renderPlayerPanel(player, host, title) {
    if (!host || !player) return;
    host.innerHTML = '';
    host.appendChild(createEl('h3', '', title));
    host.appendChild(createEl('div', 'line', '职业：' + (player.profession || '')));
    host.appendChild(createEl('div', 'line', '武器：' + (player.weapon || '')));
    host.appendChild(createEl('div', 'line', '饰品：' + (player.accessory || '')));
    host.appendChild(createEl('div', 'line', '生命：' + player.hp + '/' + player.maxHp));
    host.appendChild(createEl('div', 'line', '格挡：' + (player.block || 0)));
    if (player.activeSummons) {
      host.appendChild(createEl('div', 'line', '骷髅：' + (player.activeSummons.skeleton || 0)));
      host.appendChild(createEl('div', 'line', '骨龙：' + (player.activeSummons.bone_dragon || 0)));
    }
  }

  function renderModeButtons(state) {
    const host = qs('mode-buttons');
    if (!host) return;
    host.innerHTML = '';
    if (!state.pendingAction || !state.pendingAction.card || state.pendingAction.card.template !== 'dual_mode') return;
    safeArray(state.pendingAction.card.config && state.pendingAction.card.config.modes).forEach((mode, index) => {
      const btn = createEl('button', 'mode-btn', mode.name || ('模式 ' + (index + 1)));
      btn.type = 'button';
      btn.onclick = () => {
        MG.chooseMode(state, index);
        renderStudioGame(state);
      };
      host.appendChild(btn);
    });
  }

  function renderHand(state, player, host) {
    if (!host) return;
    host.innerHTML = '';
    safeArray(player.hand).forEach((card) => {
      const cardEl = createEl('button', 'hand-card');
      cardEl.type = 'button';
      const source = card.source ? '来源：' + card.source : '来源：未知';
      const template = card.template ? '模板：' + card.template : '模板：未知';
      cardEl.appendChild(createEl('div', 'card-name', card.name || card.key || '未知卡'));
      cardEl.appendChild(createEl('div', 'card-source', source));
      cardEl.appendChild(createEl('div', 'card-template', template));
      if (card.template === 'dual_mode') cardEl.appendChild(createEl('div', 'card-badge', '双模式'));
      cardEl.onclick = () => {
        MG.clickCard(state, card.instanceId || card.key || card.name);
        renderStudioGame(state);
      };
      host.appendChild(cardEl);
    });
  }

  function renderOverlayLegend(state, host) {
    if (!host) return;
    host.innerHTML = '';
    const overlay = state.overlay || { mode: 'none', cells: [] };
    host.appendChild(createEl('div', 'line', '当前高亮：' + overlay.mode));
    host.appendChild(createEl('div', 'line', '高亮格数：' + safeArray(overlay.cells).length));
  }

  function renderLog(state, host) {
    if (!host) return;
    host.innerHTML = '';
    safeArray(state.log).slice(-20).forEach((row) => {
      host.appendChild(createEl('div', 'log-row', '[' + row.channel + '] ' + row.text));
    });
  }

  function renderBoard(state, host) {
    if (!host) return;
    host.innerHTML = '';
    const board = state.board;
    const overlayMap = new Map();
    safeArray(state.overlay && state.overlay.cells).forEach((cell) => overlayMap.set(cell.key, cell));

    board.tiles.forEach((tile) => {
      const btn = createEl('button', 'board-tile');
      btn.type = 'button';
      btn.dataset.key = tile.key;
      btn.textContent = tile.q + ',' + tile.r;
      if (tile.terrain !== 'plain') btn.dataset.terrain = tile.terrain;
      if (overlayMap.has(tile.key)) btn.dataset.overlay = state.overlay.mode;

      const occupant = safeArray(state.players).find((p) => p.unit.q === tile.q && p.unit.r === tile.r);
      if (occupant) btn.dataset.occupant = occupant.id;

      btn.onclick = () => {
        if (state.pendingAction && state.pendingAction.card) {
          const targetPlayer = safeArray(state.players).find((p) => p.unit.q === tile.q && p.unit.r === tile.r && p !== state.players[state.activePlayerIndex]);
          if (targetPlayer) {
            MG.clickTileOrTarget(state, { kind: 'target', targetPlayer });
          } else {
            MG.clickTileOrTarget(state, { kind: 'tile', tile: { q: tile.q, r: tile.r } });
          }
        } else if (!currentPlayerMoveSpent(state)) {
          const overlay = BOE.getOverlayForAction({
            board: state.board,
            actor: state.players[state.activePlayerIndex].unit,
            units: state.players.map((p) => p.unit),
            actionType: 'move',
            range: getMoveBudget(state.players[state.activePlayerIndex]),
          });
          BOE.applyOverlayState(state, overlay);
          const valid = safeArray(overlay.cells).find((cell) => cell.key === tile.key);
          if (valid) MG.performMove(state, { q: tile.q, r: tile.r });
          renderStudioGame(state);
        }
      };

      host.appendChild(btn);
    });
  }

  function getMoveBudget(player) {
    const base = (player.professionDefaults && player.professionDefaults.move) || player.move || 3;
    const slow = player.unit && player.unit.controlTags ? player.unit.controlTags.slow : 0;
    if (slow > 0) return Math.ceil(base * 0.5);
    return base;
  }

  function currentPlayerMoveSpent(state) {
    return !!(state.players[state.activePlayerIndex] && state.players[state.activePlayerIndex].turnFlags && state.players[state.activePlayerIndex].turnFlags.moveSpent);
  }

  function wireEndTurn(state) {
    const button = qs('btn-end-turn');
    if (!button) return;
    button.onclick = () => {
      MG.endTurn(state);
      renderStudioGame(state);
    };
  }

  function renderStudioGame(state) {
    renderPlayerPanel(state.players[0], qs('panel-p1'), '玩家 1');
    renderPlayerPanel(state.players[1], qs('panel-p2'), '玩家 2');
    renderHand(state, state.players[state.activePlayerIndex], qs('hand-panel'));
    renderModeButtons(state);
    renderBoard(state, qs('board-panel'));
    renderOverlayLegend(state, qs('overlay-panel'));
    renderLog(state, qs('log-panel'));
    wireEndTurn(state);
    const turnHost = qs('turn-indicator');
    if (turnHost) turnHost.textContent = '回合 ' + state.turn + ' / 当前：' + state.players[state.activePlayerIndex].id;
    const winnerHost = qs('winner-indicator');
    if (winnerHost) winnerHost.textContent = state.winner ? ('胜利者：' + state.winner) : '';
  }

  global.renderStudioGame = renderStudioGame;
  global.GameUiWiringV095 = {
    populateSelect,
    buildCardCatalog,
    expandDeck,
    buildPlayerConfig,
    readStartConfig,
    bindStartScreen,
    renderStudioGame,
  };
})(typeof window !== 'undefined' ? window : globalThis);
