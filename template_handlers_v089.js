// Template handlers v0.8.9
// This file is a concrete code skeleton for wiring the template interpreter back into the main game runtime.
// It is intentionally framework-light so it can be copied into the current Studio game.js with minimal refactor.

(function (global) {
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensurePlayerRuntime(player) {
    player.resources = player.resources || { faith: 0, soul_shard: 0 };
    player.activeSummons = player.activeSummons || { skeleton: 0, bone_dragon: 0 };
    player.persistentBuffs = player.persistentBuffs || [];
    player.weaponImbues = player.weaponImbues || [];
    player.showcase = player.showcase || { summons: [], negativeCards: [] };
    player.turnFlags = Object.assign(
      {
        autoBlockUsed: false,
        markPassiveTriggered: false,
        resourcePaidForDraw: false,
        warriorThresholdTriggered: false,
        lilithThresholdTriggered: false,
        basicAttackSpent: false,
        moveSpent: false,
        classGuardianBucketSpent: false,
        weaponAccessoryBucketSpent: false,
      },
      player.turnFlags || {}
    );
    return player;
  }

  function ensureUnitRuntime(unit) {
    unit.marks = Object.assign(
      { normal: false, empowered: false, expiry: null },
      unit.marks || {}
    );
    unit.controlTags = Object.assign(
      {
        burn: 0,
        slow: 0,
        disarm: 0,
        sheep: 0,
        root: 0,
        stun: 0,
        silence_bucket_lock: 0,
      },
      unit.controlTags || {}
    );
    return unit;
  }

  function clearTurnFlags(player) {
    ensurePlayerRuntime(player);
    player.turnFlags.autoBlockUsed = false;
    player.turnFlags.markPassiveTriggered = false;
    player.turnFlags.resourcePaidForDraw = false;
    player.turnFlags.warriorThresholdTriggered = false;
    player.turnFlags.lilithThresholdTriggered = false;
    player.turnFlags.basicAttackSpent = false;
    player.turnFlags.moveSpent = false;
    player.turnFlags.classGuardianBucketSpent = false;
    player.turnFlags.weaponAccessoryBucketSpent = false;
  }

  function decrementUnitStatuses(unit) {
    ensureUnitRuntime(unit);
    Object.keys(unit.controlTags).forEach((key) => {
      if (typeof unit.controlTags[key] === 'number' && unit.controlTags[key] > 0) {
        unit.controlTags[key] -= 1;
      }
    });
    if (unit.marks.expiry != null) {
      unit.marks.expiry -= 1;
      if (unit.marks.expiry <= 0) {
        unit.marks.normal = false;
        unit.marks.empowered = false;
        unit.marks.expiry = null;
      }
    }
  }

  function rollDice(expr, helpers) {
    if (!expr) return 0;
    if (helpers && typeof helpers.rollDice === 'function') return helpers.rollDice(expr);
    const m = String(expr).trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!m) {
      const n = Number(expr);
      return Number.isFinite(n) ? n : 0;
    }
    const count = Number(m[1]);
    const sides = Number(m[2]);
    const mod = m[3] ? Number(m[3]) : 0;
    let total = mod;
    for (let i = 0; i < count; i += 1) total += 1 + Math.floor(Math.random() * sides);
    return total;
  }

  function hasAnyMark(unit) {
    ensureUnitRuntime(unit);
    return !!(unit.marks.normal || unit.marks.empowered);
  }

  function clearMarks(unit) {
    ensureUnitRuntime(unit);
    unit.marks.normal = false;
    unit.marks.empowered = false;
    unit.marks.expiry = null;
  }

  function attachMark(unit, markType, durationMode, durationTurns) {
    ensureUnitRuntime(unit);
    if (markType === 'empowered') unit.marks.empowered = true;
    else unit.marks.normal = true;
    if (durationMode === 'turn_limited' && Number.isFinite(durationTurns)) {
      unit.marks.expiry = durationTurns;
    } else {
      unit.marks.expiry = null;
    }
  }

  function addPersistentBuff(player, buff) {
    ensurePlayerRuntime(player);
    player.persistentBuffs.push(clone(buff));
  }

  function consumeMatchingBuffs(player, consumeOn) {
    ensurePlayerRuntime(player);
    const kept = [];
    const consumed = [];
    for (const buff of player.persistentBuffs) {
      if (buff.consumeOn === consumeOn) consumed.push(buff);
      else kept.push(buff);
    }
    player.persistentBuffs = kept;
    return consumed;
  }

  function getConditionalBonus(config, attacker, defender, context) {
    const cb = config && config.conditionalBonus;
    if (!cb || !cb.condition) return null;
    if (cb.condition === 'target_marked' && !hasAnyMark(defender)) return null;
    if (cb.condition === 'target_controlled') {
      ensureUnitRuntime(defender);
      const controlled = defender.controlTags.slow || defender.controlTags.disarm || defender.controlTags.sheep || defender.controlTags.root || defender.controlTags.stun;
      if (!controlled) return null;
    }
    if (cb.condition === 'moved_this_turn' && !(context && context.movedThisTurn)) return null;
    if (cb.condition === 'adjacent_enemy_exists' && !(context && context.adjacentEnemyExists)) return null;
    return cb;
  }

  const Handlers = {
    handleDirectDamage(args) {
      const { attacker, defender, card, config, helpers, context } = args;
      ensurePlayerRuntime(attacker);
      ensureUnitRuntime(defender);
      let damageExpr = config.damage;
      const bonus = getConditionalBonus(config, attacker, defender, context);
      if (bonus && bonus.replaceDamage) damageExpr = bonus.replaceDamage;
      let total = rollDice(damageExpr, helpers);
      if (bonus && bonus.bonusDamage) total += rollDice(bonus.bonusDamage, helpers);
      const buffPackets = consumeMatchingBuffs(attacker, 'next_damage');
      for (const buff of buffPackets) {
        if (buff.buffBasic) total += Number(buff.buffBasic) || 0;
        if (buff.bonusDie) total += rollDice(buff.bonusDie, helpers);
      }
      if (helpers && typeof helpers.applyDamage === 'function') {
        helpers.applyDamage(attacker, defender, total, { card, spell: !!config.spell });
      }
      if (config.apply && helpers && typeof helpers.applyStatuses === 'function') {
        helpers.applyStatuses(defender, config.apply);
      }
      if (config.applyTemplate && config.applyConfig && helpers && typeof helpers.applyTemplateStatus === 'function') {
        helpers.applyTemplateStatus(defender, config.applyTemplate, config.applyConfig);
      }
      if (bonus && bonus.bonusDraw && helpers && typeof helpers.drawCards === 'function') helpers.drawCards(attacker, bonus.bonusDraw);
      if (bonus && bonus.bonusMove) attacker.bonusMove = (attacker.bonusMove || 0) + bonus.bonusMove;
      if (bonus && bonus.consumeMark) clearMarks(defender);
      return { ok: true, damage: total };
    },

    handleAoe(args) {
      const { attacker, originTile, card, config, helpers } = args;
      if (!helpers || typeof helpers.getUnitsInRadius !== 'function') return { ok: false, reason: 'missing_getUnitsInRadius' };
      const units = helpers.getUnitsInRadius(originTile, config.radius || 1) || [];
      const results = [];
      for (const defender of units) {
        if (defender === attacker) continue;
        results.push(this.handleDirectDamage({ attacker, defender, card, config, helpers, context: {} }));
      }
      return { ok: true, results };
    },

    handleTeleport(args) {
      const { attacker, targetTile, config, helpers } = args;
      if (!helpers || typeof helpers.moveUnitTo !== 'function') return { ok: false, reason: 'missing_moveUnitTo' };
      helpers.moveUnitTo(attacker, targetTile);
      if (helpers && typeof helpers.resolveOnEnterTile === 'function') helpers.resolveOnEnterTile(attacker, targetTile);
      return { ok: true };
    },

    handleDashHit(args) {
      const { attacker, defender, card, config, helpers } = args;
      if (!helpers || typeof helpers.projectDashLandingTile !== 'function') return { ok: false, reason: 'missing_projectDashLandingTile' };
      const landing = helpers.projectDashLandingTile(attacker, defender);
      if (landing && typeof helpers.moveUnitTo === 'function') helpers.moveUnitTo(attacker, landing);
      const result = this.handleDirectDamage({ attacker, defender, card, config, helpers, context: {} });
      if (config.gainBlock && helpers && typeof helpers.addBlock === 'function') helpers.addBlock(attacker, rollDice(config.gainBlock, helpers));
      if (config.buffBasic) addPersistentBuff(attacker, { consumeOn: 'next_basic_attack', buffBasic: config.buffBasic });
      return result;
    },

    handleSelfBuff(args) {
      const { attacker, config, helpers } = args;
      if (config.heal && helpers && typeof helpers.healUnit === 'function') helpers.healUnit(attacker, rollDice(config.heal, helpers));
      if (config.block && helpers && typeof helpers.addBlock === 'function') helpers.addBlock(attacker, rollDice(config.block, helpers));
      addPersistentBuff(attacker, {
        consumeOn: config.consumeOn || 'manual',
        buffBasic: config.buffBasic || 0,
        bonusDie: config.bonusDie || '',
        durationTurns: config.durationTurns,
        basicAttackCapDelta: config.basicAttackCapDelta || 0,
      });
      return { ok: true };
    },

    handleDualMode(args) {
      const { selectedMode, helpers } = args;
      if (!selectedMode) return { ok: false, reason: 'missing_mode' };
      const delegated = Object.assign({}, args, { config: selectedMode, selectedMode: null });
      const key = selectedMode.templateRef;
      const map = {
        direct_damage: 'handleDirectDamage',
        self_buff: 'handleSelfBuff',
        teleport: 'handleTeleport',
        dash_hit: 'handleDashHit',
      };
      const fn = map[key];
      if (!fn || typeof this[fn] !== 'function') return { ok: false, reason: 'unsupported_mode_template' };
      if (helpers && typeof helpers.log === 'function') helpers.log('skill', '选择模式：' + (selectedMode.name || key));
      return this[fn](delegated);
    },

    handleSummonTokenIntoSelfDeck(args) {
      const { attacker, config, helpers } = args;
      if (!helpers || typeof helpers.insertCardIntoDeck !== 'function') return { ok: false, reason: 'missing_insertCardIntoDeck' };
      for (let i = 0; i < (config.insertCount || 1); i += 1) {
        helpers.insertCardIntoDeck(attacker, config.tokenKey, !!config.shuffleIntoDeck);
      }
      return { ok: true };
    },

    handleSummonTokenDrawn(args) {
      const { attacker, drawnCard, helpers } = args;
      ensurePlayerRuntime(attacker);
      const tokenType = drawnCard && drawnCard.config && drawnCard.config.tokenType;
      if (!tokenType) return { ok: false, reason: 'missing_tokenType' };
      attacker.activeSummons[tokenType] = (attacker.activeSummons[tokenType] || 0) + 1;
      attacker.showcase.summons.push({ key: drawnCard.key, tokenType });
      if (helpers && typeof helpers.log === 'function') helpers.log('status', '展示区激活：' + tokenType);
      return { ok: true };
    },

    handleActivatedTokenAutoDamageEachTurn(args) {
      const { attacker, defender, config, helpers } = args;
      ensurePlayerRuntime(attacker);
      const packets = [];
      for (const entry of config.entries || []) {
        const count = attacker.activeSummons[entry.tokenType] || 0;
        for (let i = 0; i < count; i += 1) {
          const dmg = rollDice(entry.damagePerToken, helpers);
          packets.push({ tokenType: entry.tokenType, damage: dmg });
          if (helpers && typeof helpers.applyDamage === 'function') helpers.applyDamage(attacker, defender, dmg, { source: entry.tokenType, packet: true });
        }
      }
      return { ok: true, packets };
    },

    handleConsumeAllActivatedTokensForBurst(args) {
      const { attacker, defender, config, helpers } = args;
      ensurePlayerRuntime(attacker);
      let total = rollDice(config.baseDamage, helpers);
      for (const tokenType of config.consumeTokenTypes || []) {
        const count = attacker.activeSummons[tokenType] || 0;
        const bonusExpr = config.bonusByTokenType && config.bonusByTokenType[tokenType];
        for (let i = 0; i < count; i += 1) total += rollDice(bonusExpr, helpers);
        attacker.activeSummons[tokenType] = 0;
      }
      attacker.showcase.summons = [];
      if (helpers && typeof helpers.applyDamage === 'function') helpers.applyDamage(attacker, defender, total, { source: 'consume_all_activated_tokens_for_burst', aoe: true });
      return { ok: true, damage: total };
    },

    handleInsertNegativeCardIntoTargetDeck(args) {
      const { defender, config, helpers } = args;
      if (!helpers || typeof helpers.insertCardIntoDeck !== 'function') return { ok: false, reason: 'missing_insertCardIntoDeck' };
      for (let i = 0; i < (config.insertCount || 1); i += 1) helpers.insertCardIntoDeck(defender, config.insertCardKey, !!config.shuffleIntoDeck);
      return { ok: true };
    },

    handleNegativeCardTriggerOnDraw(args) {
      const { attacker, drawnCard, helpers } = args;
      if (helpers && typeof helpers.revealNegativeCard === 'function') helpers.revealNegativeCard(drawnCard);
      const damage = rollDice(drawnCard.config && drawnCard.config.damage, helpers);
      if (helpers && typeof helpers.applyDamage === 'function') helpers.applyDamage(attacker.enemy, attacker, damage, { source: drawnCard.key, negative: true });
      if (drawnCard.config && drawnCard.config.apply && helpers && typeof helpers.applyStatuses === 'function') helpers.applyStatuses(attacker, drawnCard.config.apply);
      attacker.showcase.negativeCards.push({ key: drawnCard.key });
      return { ok: true, damage };
    },

    handleMarkTargetForBonus(args) {
      const { defender, config } = args;
      attachMark(defender, config.markType || 'normal', config.durationMode, config.durationTurns);
      return { ok: true };
    },

    handleBonusIfTargetMarked(args) {
      const { attacker, defender, config, helpers } = args;
      if (!hasAnyMark(defender)) return { ok: false, reason: 'target_not_marked' };
      let total = rollDice(config.baseDamage, helpers);
      if (config.bonusDamage) total += rollDice(config.bonusDamage, helpers);
      if (helpers && typeof helpers.applyDamage === 'function') helpers.applyDamage(attacker, defender, total, { source: 'mark_bonus' });
      if (config.bonusDraw && helpers && typeof helpers.drawCards === 'function') helpers.drawCards(attacker, config.bonusDraw);
      if (config.bonusMove) attacker.bonusMove = (attacker.bonusMove || 0) + config.bonusMove;
      if (config.consumeMark) clearMarks(defender);
      return { ok: true, damage: total };
    },

    handleTrapWithMarkInteraction(args) {
      const { attacker, defender, config, helpers } = args;
      let total = rollDice(config.damage, helpers);
      if (helpers && typeof helpers.applyDamage === 'function') helpers.applyDamage(attacker, defender, total, { source: 'trap' });
      if (config.applyControl && helpers && typeof helpers.applyStatuses === 'function') {
        const payload = {};
        payload[config.applyControl.type] = config.applyControl.durationTurns || 1;
        helpers.applyStatuses(defender, payload);
      }
      if (config.ifTargetMarkedBonus && hasAnyMark(defender)) {
        if (config.ifTargetMarkedBonus.bonusDamage) {
          const bonus = rollDice(config.ifTargetMarkedBonus.bonusDamage, helpers);
          total += bonus;
          if (helpers && typeof helpers.applyDamage === 'function') helpers.applyDamage(attacker, defender, bonus, { source: 'marked_trap_bonus' });
        }
        if (config.ifTargetMarkedBonus.bonusDraw && helpers && typeof helpers.drawCards === 'function') helpers.drawCards(attacker, config.ifTargetMarkedBonus.bonusDraw);
        if (config.ifTargetMarkedBonus.bonusMove) attacker.bonusMove = (attacker.bonusMove || 0) + config.ifTargetMarkedBonus.bonusMove;
        if (config.ifTargetMarkedBonus.consumeMark) clearMarks(defender);
      }
      return { ok: true, damage: total };
    },
  };

  global.TemplateHandlersV089 = {
    clone,
    rollDice,
    ensurePlayerRuntime,
    ensureUnitRuntime,
    clearTurnFlags,
    decrementUnitStatuses,
    addPersistentBuff,
    consumeMatchingBuffs,
    attachMark,
    clearMarks,
    hasAnyMark,
    Handlers,
  };
})(typeof window !== 'undefined' ? window : globalThis);
