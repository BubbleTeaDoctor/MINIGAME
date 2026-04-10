// Main game integration skeleton v0.9.4
// Focus: game core only.
// This file stitches together:
// - BoardOverlayEngineV092
// - TemplateHandlersV089
// - GameRuntimeRunnerV091
// into a single controller shape that can be merged into Studio game.js.

(function (global) {
  const BOE = global.BoardOverlayEngineV092;
  const TH = global.TemplateHandlersV089;
  const GR = global.GameRuntimeRunnerV091;

  function createInitialState(config) {
    const board = BOE.buildDefaultBoardState();
    return {
      board,
      overlay: { mode: 'none', cells: [], active: false },
      pendingAction: null,
      selectedCardId: null,
      selectedMode: null,
      turn: 1,
      activePlayerIndex: 0,
      players: [
        buildPlayerFromConfig(config.player1, -6, 0, 'P1'),
        buildPlayerFromConfig(config.player2, 6, 0, 'P2'),
      ],
      log: [],
    };
  }

  function buildPlayerFromConfig(playerConfig, q, r, id) {
    const base = {
      id,
      name: playerConfig.name || id,
      profession: playerConfig.profession,
      weapon: playerConfig.weapon,
      accessory: playerConfig.accessory,
      guardian: playerConfig.guardian || null,
      hp: playerConfig.hp || 50,
      maxHp: playerConfig.hp || 50,
      block: 0,
      deck: cloneArray(playerConfig.deck || []),
      hand: [],
      discard: [],
      professionPassive: playerConfig.professionPassive || null,
      unit: { id, name: playerConfig.name || id, q, r, hp: playerConfig.hp || 50, maxHp: playerConfig.hp || 50, block: 0 },
    };
    return GR.createPlayerState(base);
  }

  function cloneArray(value) {
    return JSON.parse(JSON.stringify(value || []));
  }

  function currentPlayer(state) {
    return state.players[state.activePlayerIndex];
  }

  function enemyPlayer(state) {
    return state.players[(state.activePlayerIndex + 1) % 2];
  }

  function allUnits(state) {
    return state.players.map((p) => p.unit);
  }

  function pushLog(state, channel, text) {
    state.log.push({ channel, text });
    if (state.log.length > 200) state.log.shift();
  }

  function buildHelpers(state) {
    return {
      log(channel, text) {
        pushLog(state, channel, text);
      },
      rollDice(expr) {
        return TH.rollDice(expr);
      },
      shuffleDeck(deck) {
        deck.sort(() => Math.random() - 0.5);
      },
      renderAll() {
        if (typeof global.renderStudioGame === 'function') global.renderStudioGame(state);
      },
      addBlock(player, amount) {
        player.block = (player.block || 0) + amount;
        player.unit.block = player.block;
      },
      healUnit(playerOrUnit, amount) {
        if (playerOrUnit.unit) {
          playerOrUnit.hp = Math.min(playerOrUnit.maxHp, playerOrUnit.hp + amount);
          playerOrUnit.unit.hp = playerOrUnit.hp;
        } else {
          playerOrUnit.hp = Math.min(playerOrUnit.maxHp, playerOrUnit.hp + amount);
        }
      },
      applyDamage(attacker, defender, amount, meta) {
        const targetPlayer = defender.unit ? defender : state.players.find((p) => p.unit === defender) || defender;
        let dmg = amount;
        const currentBlock = targetPlayer.block || targetPlayer.unit.block || 0;
        if (currentBlock > 0) {
          const absorbed = Math.min(currentBlock, dmg);
          targetPlayer.block = currentBlock - absorbed;
          targetPlayer.unit.block = targetPlayer.block;
          dmg -= absorbed;
        }
        if (dmg > 0) {
          targetPlayer.hp -= dmg;
          targetPlayer.unit.hp = targetPlayer.hp;
        }
        pushLog(state, 'combat', (attacker.name || attacker.id || 'source') + ' 对 ' + (targetPlayer.name || targetPlayer.id) + ' 造成 ' + amount + ' 伤害');
        if (targetPlayer.hp <= 0) {
          targetPlayer.hp = 0;
          targetPlayer.unit.hp = 0;
          pushLog(state, 'combat', (targetPlayer.name || targetPlayer.id) + ' 被击败');
        }
        return { finalDamage: dmg };
      },
      applyDirectUnitDamage(unit, amount, meta) {
        const targetPlayer = state.players.find((p) => p.unit === unit);
        if (!targetPlayer) return;
        let dmg = amount;
        const currentBlock = targetPlayer.block || targetPlayer.unit.block || 0;
        if (currentBlock > 0) {
          const absorbed = Math.min(currentBlock, dmg);
          targetPlayer.block = currentBlock - absorbed;
          targetPlayer.unit.block = targetPlayer.block;
          dmg -= absorbed;
        }
        if (dmg > 0) {
          targetPlayer.hp -= dmg;
          targetPlayer.unit.hp = targetPlayer.hp;
        }
        pushLog(state, 'status', (meta && meta.source ? meta.source : 'status') + ' 对 ' + targetPlayer.name + ' 造成 ' + amount + ' 伤害');
      },
      applyStatuses(defender, payload) {
        const unit = defender.unit || defender;
        TH.ensureUnitRuntime(unit);
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (unit.controlTags[key] == null) unit.controlTags[key] = 0;
          unit.controlTags[key] += value;
        });
      },
      applyTemplateStatus(defender, templateKey, config) {
        const unit = defender.unit || defender;
        TH.ensureUnitRuntime(unit);
        if (templateKey === 'dot_damage_over_time') {
          unit.dotEffects = unit.dotEffects || [];
          unit.dotEffects.push({
            damagePerTick: config.damagePerTick,
            tickTiming: config.tickTiming || 'turn_start',
            durationTurns: config.durationTurns || 1,
          });
        }
        if (templateKey === 'slow_status') {
          unit.controlTags.slow = Math.max(unit.controlTags.slow || 0, config.durationTurns || 1);
        }
      },
      insertCardIntoDeck(player, cardKey, shuffle) {
        const catalog = (state.cardCatalog || {});
        const card = catalog[cardKey] ? JSON.parse(JSON.stringify(catalog[cardKey])) : { key: cardKey, name: cardKey, template: 'unknown', config: {} };
        player.deck = player.deck || [];
        player.deck.push(card);
        if (shuffle) player.deck.sort(() => Math.random() - 0.5);
      },
      revealNegativeCard(card) {
        pushLog(state, 'status', '抽到负面牌：' + (card.name || card.key));
      },
      drawCards(player, count) {
        return GR.drawCards(player, count, buildHelpers(state));
      },
      moveUnitTo(playerOrUnit, tile) {
        const unit = playerOrUnit.unit || playerOrUnit;
        unit.q = tile.q;
        unit.r = tile.r;
      },
      resolveOnEnterTile(playerOrUnit, tile) {
        const cell = state.board.byKey[BOE.keyOf(tile.q, tile.r)];
        if (!cell) return;
        if (cell.terrain === 'spike') {
          const p = playerOrUnit.unit ? playerOrUnit : state.players.find((x) => x.unit === playerOrUnit);
          if (p) this.applyDirectUnitDamage(p.unit, TH.rollDice('2d8'), { source: 'spike' });
        }
        if (cell.terrain === 'black_hole') {
          const p = playerOrUnit.unit ? playerOrUnit : state.players.find((x) => x.unit === playerOrUnit);
          if (p) this.applyDirectUnitDamage(p.unit, TH.rollDice('2d8'), { source: 'black_hole' });
        }
      },
      projectDashLandingTile(attacker, defender) {
        return BOE.projectDashLandingTile(state.board, attacker.unit || attacker, defender.unit || defender, allUnits(state));
      },
      getUnitsInRadius(tile, radius) {
        const keys = new Set(BOE.getTilesInRadius(state.board, tile, radius).map((t) => t.key));
        return allUnits(state).filter((u) => keys.has(BOE.keyOf(u.q, u.r)));
      },
      resolveGlobalMapEffects(current, enemy) {
        // black hole pull: all units move 1 tile toward center if possible
        state.players.forEach((player) => {
          const unit = player.unit;
          const options = BOE.neighborsOf(unit)
            .filter((tile) => BOE.isInsideRadius(tile, state.board.radius))
            .sort((a, b) => BOE.hexDistance(a, { q: 0, r: 0 }) - BOE.hexDistance(b, { q: 0, r: 0 }));
          const occupied = new Set(allUnits(state).filter((u) => u !== unit).map((u) => BOE.keyOf(u.q, u.r)));
          const next = options.find((tile) => !occupied.has(BOE.keyOf(tile.q, tile.r)) && BOE.hexDistance(tile, { q: 0, r: 0 }) < BOE.hexDistance(unit, { q: 0, r: 0 }));
          if (next) {
            unit.q = next.q;
            unit.r = next.r;
          }
        });
      },
    };
  }

  function computeOverlayForCard(state, card, selectedMode) {
    const player = currentPlayer(state);
    const actor = player.unit;
    const helpers = buildHelpers(state);
    const cfg = card.config || {};
    let actionType = card.template;
    let range = cfg.range || 0;
    let radius = cfg.radius || 0;
    let straight = !!cfg.straight;

    if (card.template === 'dual_mode') {
      if (!selectedMode) return BOE.getOverlayForAction({ board: state.board, actor, units: allUnits(state), actionType: 'dual_mode', pendingMode: null });
      actionType = selectedMode.templateRef;
      range = selectedMode.range || 0;
      straight = !!selectedMode.straight;
    }

    if (card.template === 'consume_all_activated_tokens_for_burst') {
      actionType = 'aoe';
      range = cfg.castRange || 0;
      radius = cfg.radius || 1;
    }

    return BOE.getOverlayForAction({
      board: state.board,
      actor,
      units: allUnits(state),
      actionType,
      range,
      radius,
      straight,
      pendingMode: selectedMode ? selectedMode.templateRef : null,
    });
  }

  function clickCard(state, cardId) {
    const player = currentPlayer(state);
    const card = (player.hand || []).find((c) => c.id === cardId || c.key === cardId || c.name === cardId);
    if (!card) return { ok: false, reason: 'card_not_found' };
    state.selectedCardId = cardId;
    state.selectedMode = null;
    state.pendingAction = { type: 'card', card };
    const overlay = computeOverlayForCard(state, card, null);
    BOE.applyOverlayState(state, overlay);
    return { ok: true, overlay };
  }

  function chooseMode(state, modeIndex) {
    if (!state.pendingAction || !state.pendingAction.card || state.pendingAction.card.template !== 'dual_mode') {
      return { ok: false, reason: 'no_dual_mode_pending' };
    }
    const mode = (state.pendingAction.card.config.modes || [])[modeIndex];
    if (!mode) return { ok: false, reason: 'mode_not_found' };
    state.selectedMode = mode;
    const overlay = computeOverlayForCard(state, state.pendingAction.card, mode);
    BOE.applyOverlayState(state, overlay);
    return { ok: true, overlay, mode };
  }

  function clickTileOrTarget(state, payload) {
    const player = currentPlayer(state);
    const enemy = enemyPlayer(state);
    if (!state.pendingAction || !state.pendingAction.card) return { ok: false, reason: 'no_pending_action' };
    const card = state.pendingAction.card;
    const helpers = buildHelpers(state);

    let result;
    if (payload.kind === 'tile') {
      result = GR.dispatchTemplateAction({
        attacker: player,
        defender: enemy,
        targetTile: payload.tile,
        originTile: payload.tile,
        selectedMode: state.selectedMode,
        card: state.selectedMode ? { template: state.selectedMode.templateRef, config: state.selectedMode, name: state.selectedMode.name } : card,
        helpers,
      });
    } else {
      const defender = payload.targetPlayer || enemy;
      result = GR.dispatchTemplateAction({
        attacker: player,
        defender,
        selectedMode: state.selectedMode,
        card: state.selectedMode ? { template: state.selectedMode.templateRef, config: state.selectedMode, name: state.selectedMode.name } : card,
        helpers,
        context: {
          movedThisTurn: !!player.turnFlags.moveSpent,
          adjacentEnemyExists: BOE.hexDistance(player.unit, defender.unit) === 1,
        },
      });
    }

    player.hand = (player.hand || []).filter((c) => c !== card);
    player.discard = player.discard || [];
    player.discard.push(card);
    clearPending(state);
    helpers.renderAll();
    checkVictory(state);
    return result;
  }

  function performMove(state, tile) {
    const player = currentPlayer(state);
    const helpers = buildHelpers(state);
    helpers.moveUnitTo(player, tile);
    helpers.resolveOnEnterTile(player, tile);
    player.turnFlags.moveSpent = true;
    clearPending(state);
    helpers.renderAll();
    checkVictory(state);
    return { ok: true };
  }

  function endTurn(state) {
    const helpers = buildHelpers(state);
    const current = currentPlayer(state);
    const enemy = enemyPlayer(state);
    GR.runTurnEnd(current, enemy, helpers);
    state.activePlayerIndex = (state.activePlayerIndex + 1) % 2;
    state.turn += 1;
    GR.runTurnStart(currentPlayer(state), enemyPlayer(state), helpers);
    BOE.clearOverlayState(state);
    clearPending(state);
    checkVictory(state);
    return { ok: true };
  }

  function clearPending(state) {
    state.pendingAction = null;
    state.selectedCardId = null;
    state.selectedMode = null;
    BOE.clearOverlayState(state);
  }

  function checkVictory(state) {
    const alive = state.players.filter((p) => p.hp > 0);
    if (alive.length <= 1) {
      state.winner = alive[0] ? alive[0].id : 'draw';
      pushLog(state, 'turn', '游戏结束，胜利者：' + state.winner);
      return state.winner;
    }
    return null;
  }

  function bootGame(config) {
    const state = createInitialState(config);
    state.cardCatalog = config.cardCatalog || {};
    const helpers = buildHelpers(state);
    GR.runTurnStart(currentPlayer(state), enemyPlayer(state), helpers);
    return state;
  }

  global.MainGameIntegrationV094 = {
    createInitialState,
    buildPlayerFromConfig,
    buildHelpers,
    computeOverlayForCard,
    clickCard,
    chooseMode,
    clickTileOrTarget,
    performMove,
    endTurn,
    clearPending,
    checkVictory,
    bootGame,
  };
})(typeof window !== 'undefined' ? window : globalThis);
