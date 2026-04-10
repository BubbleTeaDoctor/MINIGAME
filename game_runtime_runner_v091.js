// Game runtime runner v0.9.1
// Purpose: provide a concrete event runner skeleton for turn start, turn end, card draw hooks,
// and template dispatch using TemplateHandlersV089.

(function (global) {
  const TH = global.TemplateHandlersV089;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createPlayerState(base) {
    const player = clone(base || {});
    if (!TH) return player;
    TH.ensurePlayerRuntime(player);
    if (player.unit) TH.ensureUnitRuntime(player.unit);
    return player;
  }

  function createUnitState(base) {
    const unit = clone(base || {});
    if (!TH) return unit;
    TH.ensureUnitRuntime(unit);
    return unit;
  }

  function log(helpers, channel, text) {
    if (helpers && typeof helpers.log === 'function') helpers.log(channel, text);
  }

  function drawCards(player, count, helpers) {
    TH.ensurePlayerRuntime(player);
    const drawn = [];
    for (let i = 0; i < count; i += 1) {
      if (!player.deck || player.deck.length === 0) {
        reshuffleDiscardIntoDeck(player, helpers);
      }
      if (!player.deck || player.deck.length === 0) break;
      const card = player.deck.shift();
      const resolution = resolveDrawnCard(player, card, helpers);
      drawn.push({ card, resolution });
    }
    return drawn;
  }

  function reshuffleDiscardIntoDeck(player, helpers) {
    TH.ensurePlayerRuntime(player);
    if (!player.discard || player.discard.length === 0) return;
    player.deck = (player.deck || []).concat(player.discard);
    player.discard = [];
    if (helpers && typeof helpers.shuffleDeck === 'function') helpers.shuffleDeck(player.deck);
    else player.deck.sort(() => Math.random() - 0.5);
    log(helpers, 'status', '牌库已空，弃牌堆洗回牌库');
  }

  function resolveDrawnCard(player, card, helpers) {
    TH.ensurePlayerRuntime(player);
    const template = card && (card.template || (card.config && card.config.template));
    const source = card && card.source;

    if (source === '格挡牌' || template === 'block_auto_on_draw') {
      if (!player.turnFlags.autoBlockUsed) {
        player.turnFlags.autoBlockUsed = true;
        const blockValue = TH.rollDice(card.config && card.config.block, helpers);
        if (helpers && typeof helpers.addBlock === 'function') helpers.addBlock(player, blockValue);
        log(helpers, 'status', '抽到格挡，自动获得 ' + blockValue + ' 格挡');
        return { kind: 'auto_block', block: blockValue };
      }
      player.discard = player.discard || [];
      player.discard.push(card);
      log(helpers, 'status', '本回合已自动格挡，额外格挡牌置入弃牌堆');
      return { kind: 'extra_block_discarded' };
    }

    if (card.behavior === 'draw_to_showcase') {
      const result = TH.Handlers.handleSummonTokenDrawn({ attacker: player, drawnCard: card, helpers });
      return { kind: 'showcase_token', result };
    }

    if (template === 'negative_card_trigger_on_draw') {
      const result = TH.Handlers.handleNegativeCardTriggerOnDraw({ attacker: player, drawnCard: card, helpers });
      player.discard = player.discard || [];
      player.discard.push(card);
      return { kind: 'negative_card', result };
    }

    player.hand = player.hand || [];
    player.hand.push(card);
    return { kind: 'hand' };
  }

  function runTurnStart(currentPlayer, enemyPlayer, helpers) {
    TH.ensurePlayerRuntime(currentPlayer);
    TH.ensurePlayerRuntime(enemyPlayer);
    if (currentPlayer.unit) TH.ensureUnitRuntime(currentPlayer.unit);
    if (enemyPlayer.unit) TH.ensureUnitRuntime(enemyPlayer.unit);

    TH.clearTurnFlags(currentPlayer);

    if (helpers && typeof helpers.resolveGlobalMapEffects === 'function') {
      helpers.resolveGlobalMapEffects(currentPlayer, enemyPlayer);
    }

    runStatusesAtTurnStart(currentPlayer, helpers);

    if (currentPlayer.professionPassive && currentPlayer.professionPassive.template === 'activated_token_auto_damage_each_turn') {
      TH.Handlers.handleActivatedTokenAutoDamageEachTurn({
        attacker: currentPlayer,
        defender: enemyPlayer,
        config: currentPlayer.professionPassive.config,
        helpers,
      });
    }

    const drawn = drawCards(currentPlayer, 3, helpers);
    log(helpers, 'turn', '回合开始：默认抽 3 张');

    if (helpers && typeof helpers.renderAll === 'function') helpers.renderAll();
    return { drawn };
  }

  function runTurnEnd(currentPlayer, enemyPlayer, helpers) {
    TH.ensurePlayerRuntime(currentPlayer);
    TH.ensureUnitRuntime(currentPlayer.unit || {});
    TH.ensureUnitRuntime(enemyPlayer.unit || {});

    decrementPersistentBuffs(currentPlayer);
    if (currentPlayer.unit) TH.decrementUnitStatuses(currentPlayer.unit);
    if (enemyPlayer.unit) TH.decrementUnitStatuses(enemyPlayer.unit);

    if (helpers && typeof helpers.renderAll === 'function') helpers.renderAll();
    return { ok: true };
  }

  function decrementPersistentBuffs(player) {
    TH.ensurePlayerRuntime(player);
    const kept = [];
    for (const buff of player.persistentBuffs) {
      if (typeof buff.durationTurns === 'number') {
        buff.durationTurns -= 1;
        if (buff.durationTurns > 0) kept.push(buff);
      } else if (buff.consumeOn !== 'end_of_turn') {
        kept.push(buff);
      }
    }
    player.persistentBuffs = kept;
  }

  function runStatusesAtTurnStart(player, helpers) {
    TH.ensureUnitRuntime(player.unit || player);
    const unit = player.unit || player;
    if (unit.controlTags && unit.controlTags.burn > 0) {
      const dmg = TH.rollDice('1d4', helpers);
      if (helpers && typeof helpers.applyDirectUnitDamage === 'function') helpers.applyDirectUnitDamage(unit, dmg, { source: 'burn' });
      log(helpers, 'status', '点燃造成 ' + dmg + ' 伤害');
    }
    if (Array.isArray(unit.dotEffects)) {
      unit.dotEffects.forEach((dot) => {
        const dmg = TH.rollDice(dot.damagePerTick, helpers);
        if (helpers && typeof helpers.applyDirectUnitDamage === 'function') helpers.applyDirectUnitDamage(unit, dmg, { source: 'dot' });
        dot.durationTurns -= 1;
      });
      unit.dotEffects = unit.dotEffects.filter((dot) => dot.durationTurns > 0);
    }
  }

  function dispatchTemplateAction(args) {
    const template = args && args.card && args.card.template;
    if (!template || !TH || !TH.Handlers) return { ok: false, reason: 'missing_template_handler' };
    const map = {
      direct_damage: 'handleDirectDamage',
      aoe: 'handleAoe',
      teleport: 'handleTeleport',
      dash_hit: 'handleDashHit',
      self_buff: 'handleSelfBuff',
      dual_mode: 'handleDualMode',
      summon_token_into_self_deck: 'handleSummonTokenIntoSelfDeck',
      consume_all_activated_tokens_for_burst: 'handleConsumeAllActivatedTokensForBurst',
      insert_negative_card_into_target_deck: 'handleInsertNegativeCardIntoTargetDeck',
      mark_target_for_bonus: 'handleMarkTargetForBonus',
      bonus_if_target_marked: 'handleBonusIfTargetMarked',
      trap_with_mark_interaction: 'handleTrapWithMarkInteraction',
    };
    const fn = map[template];
    if (!fn || typeof TH.Handlers[fn] !== 'function') return { ok: false, reason: 'unmapped_template:' + template };
    return TH.Handlers[fn](Object.assign({}, args, { config: args.card.config || {} }));
  }

  global.GameRuntimeRunnerV091 = {
    createPlayerState,
    createUnitState,
    drawCards,
    reshuffleDiscardIntoDeck,
    resolveDrawnCard,
    runTurnStart,
    runTurnEnd,
    runStatusesAtTurnStart,
    dispatchTemplateAction,
  };
})(typeof window !== 'undefined' ? window : globalThis);
