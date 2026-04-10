# Game Interpreter Hooks v0.8.4

This file explains where the current game runtime should hook template-based behaviors.

## 1. Recommended execution order per turn

### Turn start
1. Resolve global map effects
   - black hole pull
   - spike / trap standing checks if needed
2. Resolve active DOT on current player
3. Resolve active summon auto-damage
   - skeleton: 1d4 each
   - bone_dragon: 1d8 each
4. Reset turn flags
   - autoBlockUsed = false
   - markPassiveTriggered = false
   - resourcePaidForDraw = false
5. Draw 3 cards
6. Resolve card_drawn hooks
   - auto block cards
   - summon tokens drawn into showcase
   - negative bomb cards
7. Render hand and action buckets

### Before action cast
1. Check bucket permission
   - class_or_guardian
   - weapon_or_accessory
   - move
   - basic_attack
   - block
2. Check hard restrictions
   - silence_bucket_lock
   - disarm
   - root
   - mage move threshold on class bucket
3. Compute highlight cells / targets

### Before damage apply
1. Apply template conditional bonus
   - target marked
   - target controlled
   - moved this turn
2. Apply persistent buffs waiting for consumption
3. Apply hunter mark bonus if valid
4. Apply swordsman stored bonus if valid

### After damage apply
1. Resolve lifesteal
2. Resolve insert_negative_card_into_target_deck if on-hit
3. Resolve mark consumption
4. Resolve rogue passive on controlled target if source is basic attack
5. Resolve warrior / lilith threshold reward once per turn
6. Resolve faith / soul_shard gain triggers

### Turn end
1. Reduce temporary counters
2. Remove end_of_turn buffs
3. Clear one-turn locks if appropriate
4. Pass turn

---

## 2. Template to hook mapping

### direct_damage
Hooks used:
- before target validation
- before_damage_apply
- after_damage_apply

Needed runtime helpers:
- canTarget()
- rollDamage()
- applyConditionalBonus()
- applyStatuses()

### self_buff
Hooks used:
- class_skill_cast or weapon_skill_cast
- future consume point based on consumeOn

Needed runtime helpers:
- addPersistentBuff()
- consumeMatchingBuffs()

### teleport
Hooks used:
- highlight phase
- on tile click
- post-move trigger checks

Needed runtime helpers:
- getReachableTiles()
- moveUnitTo()
- resolveOnEnterTile()

### aoe
Hooks used:
- highlight castable tiles
- after tile selection
- before_damage_apply for each target
- after_damage_apply for each target

Needed runtime helpers:
- getTilesInRadius()
- getUnitsInRadius()

### dash_hit
Hooks used:
- highlight enemy targets
- find adjacent landing tile
- move attacker
- resolve damage

Needed runtime helpers:
- findNearestFreeAdjacentTile()

### dual_mode
Hooks used:
- on card click show mode buttons
- cache selected mode in pending state
- then run selected sub-template flow

Needed runtime helpers:
- openModePicker()
- setPendingMode()

### summon_token_into_self_deck
Hooks used:
- class_skill_cast inserts token
- card_drawn resolves token into showcase instead of hand

Needed runtime helpers:
- insertCardIntoDeck()
- moveTokenToShowcase()
- incrementActiveSummon()

### activated_token_auto_damage_each_turn
Hooks used:
- turn_start

Needed runtime helpers:
- iterateSummons()
- applyPacketDamage()

### consume_all_activated_tokens_for_burst
Hooks used:
- class_skill_cast

Needed runtime helpers:
- readSummonCounts()
- clearSummonCounts()
- buildBurstDamageFromSummons()

### insert_negative_card_into_target_deck
Hooks used:
- after_damage_apply or class_skill_cast

Needed runtime helpers:
- insertCardIntoEnemyDeck()

### negative_card_trigger_on_draw
Hooks used:
- card_drawn

Needed runtime helpers:
- revealNegativeCard()
- resolveNegativeCardEffect()

### mark_target_for_bonus
Hooks used:
- class_skill_cast on hit/target selection

Needed runtime helpers:
- setTargetMark()
- refreshOrReplaceMark()

### bonus_if_target_marked
Hooks used:
- before_damage_apply
- after_damage_apply

Needed runtime helpers:
- hasRelevantMark()
- consumeMarkIfNeeded()
- queueBonusDraw()
- queueBonusMove()

### trap_with_mark_interaction
Hooks used:
- trap_triggered

Needed runtime helpers:
- resolveTrapBaseEffect()
- resolveMarkedTrapBonus()

---

## 3. Minimal runtime objects to add

```js
player.activeSummons = {
  skeleton: 0,
  bone_dragon: 0,
};

player.resources = {
  faith: 0,
  soul_shard: 0,
};

player.turnFlags = {
  autoBlockUsed: false,
  markPassiveTriggered: false,
  resourcePaidForDraw: false,
};

unit.marks = {
  normal: false,
  empowered: false,
};

unit.controlTags = {
  slow: 0,
  disarm: 0,
  sheep: 0,
  root: 0,
  stun: 0,
  silence_bucket_lock: 0,
};
```

---

## 4. Necromancer implementation checkpoints

1. Drawn summon token should never stay in hand
2. Summon token should appear in showcase / side panel
3. Turn start auto damage must be packet-based
4. Grave Burst must read current summon counts before clearing them
5. Grave Burst then clears activeSummons.skeleton and activeSummons.bone_dragon
6. Bomb cards should still work independently from summon system

---

## 5. Hunter implementation checkpoints

1. Marks are stored on the target unit, not on the attacker
2. Mark should be visible in unit status chips
3. Hunter passive should trigger only once per turn
4. Aimed Shot and Arcane Shot can read mark without necessarily consuming it
5. Kill Command should read and consume mark
6. Trap can also consume mark if configured

---

## 6. Recommended near-term coding order

1. Add runtime state fields
2. Add turn_start hook runner
3. Add summon token draw resolution
4. Add mark state and rendering
5. Add dual_mode pending flow
6. Add new template handlers in interpreter switch
7. Only then expose these templates in the main game build
