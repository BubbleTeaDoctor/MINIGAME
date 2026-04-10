// Studio game data stub v0.9.8
// Purpose: provide a minimal bootable data payload for the current game shell.
// This lets the shell/wiring/bootstrap stack run even before the full Studio data layer is merged.

(function (global) {
  global.__STUDIO_GAME_DATA__ = {
    studioData: {
      professions: {
        warrior: {
          name: '战士',
          base: { hp: 62, move: 5, blockCards: { count: 4, die: '1d4' } },
          passive: {
            template: 'threshold_reward_once_per_turn',
            config: {
              thresholdType: 'effective_damage',
              thresholdValue: 4,
              rewardList: [{ type: 'gain_block', value: 2 }],
              oncePerTurn: true
            }
          },
          deck: [
            { cardKey: 'warrior_charge', count: 2 },
            { cardKey: 'warrior_throw', count: 2 },
            { cardKey: 'warrior_rage', count: 2 },
            { cardKey: 'warrior_guard', count: 1 },
            { cardKey: 'warrior_strike', count: 4 },
            { cardKey: 'block_d4', count: 4 }
          ]
        },
        mage: {
          name: '法师',
          base: { hp: 50, move: 3, blockCards: { count: 4, die: '1d4' } },
          passive: {
            template: 'movement_threshold_restricts_bucket',
            config: {
              threshold: 3,
              affectedBuckets: ['class_or_guardian'],
              timing: 'after_move_before_class_skill',
              exceptionBuckets: ['weapon_or_accessory']
            }
          },
          deck: [
            { cardKey: 'mage_fireball', count: 2 },
            { cardKey: 'mage_nova', count: 2 },
            { cardKey: 'mage_phase', count: 2 },
            { cardKey: 'mage_barrier', count: 3 },
            { cardKey: 'mage_bolt', count: 2 },
            { cardKey: 'block_d4', count: 4 }
          ]
        },
        necro: {
          name: '死灵法师',
          base: { hp: 60, move: 3, blockCards: { count: 4, die: '1d4' } },
          passive: {
            template: 'activated_token_auto_damage_each_turn',
            config: {
              entries: [
                { tokenType: 'skeleton', damagePerToken: '1d4', triggerTiming: 'turn_start', targetRule: 'enemy_single' },
                { tokenType: 'bone_dragon', damagePerToken: '1d8', triggerTiming: 'turn_start', targetRule: 'enemy_single' }
              ]
            }
          },
          deck: [
            { cardKey: 'necro_skeleton', count: 2 },
            { cardKey: 'necro_bonedragon', count: 1 },
            { cardKey: 'necro_spear', count: 2 },
            { cardKey: 'necro_burst', count: 2 },
            { cardKey: 'necro_shield', count: 2 },
            { cardKey: 'necro_bomb', count: 2 },
            { cardKey: 'block_d4', count: 4 }
          ]
        },
        hunter: {
          name: '猎人',
          base: { hp: 52, move: 3, blockCards: { count: 4, die: '1d4' } },
          passive: {
            template: 'bonus_if_target_marked',
            config: {
              triggerLimit: 'once_per_turn',
              bonusDamage: 2,
              bonusDraw: 1,
              bonusMove: 0,
              consumeMark: true
            }
          },
          deck: [
            { cardKey: 'hunter_mark', count: 2 },
            { cardKey: 'hunter_aimed', count: 2 },
            { cardKey: 'hunter_arcane', count: 2 },
            { cardKey: 'hunter_disengage', count: 2 },
            { cardKey: 'hunter_snare_trap', count: 2 },
            { cardKey: 'hunter_kill_command', count: 1 },
            { cardKey: 'block_d4', count: 4 }
          ]
        }
      },
      cards: {
        warrior_charge: {
          name: '冲锋',
          source: '职业技能',
          template: 'dash_hit',
          config: { damage: '1d6', range: 3, gainBlock: '1d4', buffBasic: 2 }
        },
        warrior_throw: {
          name: '英勇投掷/二连斩',
          source: '职业技能',
          template: 'dual_mode',
          config: {
            modes: [
              { name: '英勇投掷', templateRef: 'direct_damage', damage: '2d3', range: 3, consumeOn: 'manual' },
              { name: '二连斩', templateRef: 'self_buff', basicAttackCapDelta: 1, consumeOn: 'end_of_turn' }
            ]
          }
        },
        warrior_rage: {
          name: '暴怒/强力射击',
          source: '职业技能',
          template: 'dual_mode',
          config: {
            modes: [
              { name: '暴怒', templateRef: 'self_buff', buffBasic: 3, consumeOn: 'next_basic_attack' },
              { name: '强力射击', templateRef: 'self_buff', buffBasic: 3, consumeOn: 'next_basic_attack' }
            ]
          }
        },
        warrior_guard: {
          name: '格挡架势',
          source: '职业技能',
          template: 'self_buff',
          config: { block: '1d8', consumeOn: 'manual', durationTurns: null }
        },
        warrior_strike: {
          name: '战吼打击',
          source: '职业技能',
          template: 'direct_damage',
          config: { damage: '1d6', range: 1, target: 'enemy', spell: false, straight: false }
        },
        mage_fireball: {
          name: '火球',
          source: '职业技能',
          template: 'direct_damage',
          config: { damage: '1d8', range: 5, target: 'enemy', spell: true, apply: { burn: 2 } }
        },
        mage_nova: {
          name: '冰霜新星',
          source: '职业技能',
          template: 'aoe',
          config: { damage: '2d4', range: 2, radius: 1, spell: true }
        },
        mage_phase: {
          name: '相位转移/法术无效',
          source: '职业技能',
          template: 'dual_mode',
          config: {
            modes: [
              { name: '相位转移', templateRef: 'teleport', range: 3, target: 'tile', consumeOn: 'manual' },
              { name: '法术无效', templateRef: 'self_buff', consumeOn: 'next_spell_hit' }
            ]
          }
        },
        mage_barrier: {
          name: '奥术壁垒',
          source: '职业技能',
          template: 'self_buff',
          config: { block: '1d6', consumeOn: 'manual', durationTurns: null }
        },
        mage_bolt: {
          name: '奥术飞弹',
          source: '职业技能',
          template: 'direct_damage',
          config: { damage: '1d6', range: 4, target: 'enemy', spell: true }
        },
        necro_skeleton: {
          name: '召唤骷髅',
          source: '职业技能',
          template: 'summon_token_into_self_deck',
          config: { tokenKey: 'skeleton_token', tokenType: 'skeleton', insertCount: 1, shuffleIntoDeck: true }
        },
        necro_bonedragon: {
          name: '召唤骨龙',
          source: '职业技能',
          template: 'summon_token_into_self_deck',
          config: { tokenKey: 'bone_dragon_token', tokenType: 'bone_dragon', insertCount: 1, shuffleIntoDeck: true }
        },
        necro_spear: {
          name: '骨矛',
          source: '职业技能',
          template: 'direct_damage',
          config: { damage: '1d10', range: 5, target: 'enemy', spell: true }
        },
        necro_burst: {
          name: '亡灵爆发',
          source: '职业技能',
          template: 'consume_all_activated_tokens_for_burst',
          config: {
            baseDamage: '2d4',
            castRange: 3,
            radius: 1,
            consumeTokenTypes: ['skeleton', 'bone_dragon'],
            bonusByTokenType: { skeleton: '1d4', bone_dragon: '1d8' }
          }
        },
        necro_shield: {
          name: '骨盾',
          source: '职业技能',
          template: 'self_buff',
          config: { block: '1d8', consumeOn: 'manual', durationTurns: null }
        },
        necro_bomb: {
          name: '埋骨炸弹',
          source: '职业技能',
          template: 'insert_negative_card_into_target_deck',
          config: { insertCardKey: 'necro_bomb_token', insertCount: 1, triggerCondition: 'on_hit', shuffleIntoDeck: true }
        },
        skeleton_token: {
          name: '骷髅 Token',
          source: '负面牌/召唤物',
          template: 'summon_token_into_self_deck',
          behavior: 'draw_to_showcase',
          config: { tokenType: 'skeleton' },
          result: { addActiveSummon: { skeleton: 1 } }
        },
        bone_dragon_token: {
          name: '骨龙 Token',
          source: '负面牌/召唤物',
          template: 'summon_token_into_self_deck',
          behavior: 'draw_to_showcase',
          config: { tokenType: 'bone_dragon' },
          result: { addActiveSummon: { bone_dragon: 1 } }
        },
        necro_bomb_token: {
          name: '埋骨炸弹',
          source: '负面牌',
          template: 'negative_card_trigger_on_draw',
          config: { onDrawEffect: 'explode_damage', damage: '2d6', apply: { slow: 1 }, showInPreview: true }
        },
        hunter_mark: {
          name: '猎人印记',
          source: '职业技能',
          template: 'mark_target_for_bonus',
          config: { markType: 'normal', durationMode: 'until_consumed', durationTurns: null, consumeOn: 'first_hit_by_owner' }
        },
        hunter_aimed: {
          name: '瞄准射击',
          source: '职业技能',
          template: 'direct_damage',
          config: {
            damage: '1d8', range: 6, target: 'enemy',
            conditionalBonus: { condition: 'target_marked', bonusDamage: '1d6', consumeMark: false }
          }
        },
        hunter_arcane: {
          name: '奥术射击',
          source: '职业技能',
          template: 'direct_damage',
          config: {
            damage: '1d6+1', range: 5, target: 'enemy',
            conditionalBonus: { condition: 'target_marked', replaceDamage: '1d10+1', consumeMark: false }
          }
        },
        hunter_disengage: {
          name: '逃脱',
          source: '职业技能',
          template: 'teleport',
          config: { range: 3, target: 'tile', conditionalBonus: { condition: 'adjacent_enemy_exists', bonusMove: 1 } }
        },
        hunter_snare_trap: {
          name: '束缚陷阱',
          source: '职业技能',
          template: 'trap_with_mark_interaction',
          config: {
            placementRange: 3,
            damage: '1d4',
            applyControl: { type: 'root', durationTurns: 1, isControlTag: true },
            ifTargetMarkedBonus: { bonusDamage: 2, bonusDraw: 0, bonusMove: 0, consumeMark: true }
          }
        },
        hunter_kill_command: {
          name: '杀戮命令',
          source: '职业技能',
          template: 'bonus_if_target_marked',
          config: { baseDamage: '2d8', range: 5, bonusDamage: 2, bonusDraw: 1, bonusMove: 0, consumeMark: true }
        },
        block_d4: {
          name: '1D4 格挡',
          source: '格挡牌',
          template: 'block_auto_on_draw',
          config: { block: '1d4' }
        }
      },
      weapons: {
        default_weapon: { name: '默认武器', basicAttack: { damage: '1d6', range: 1, straight: false } },
        greatsword: { name: '巨剑', basicAttack: { damage: '1d8', range: 1, straight: false } },
        longbow: { name: '长弓', basicAttack: { damage: '1d6', range: 5, straight: true } },
        dagger: { name: '匕首', basicAttack: { damage: '1d4', range: 1, straight: false } }
      },
      accessories: {
        default_accessory: { name: '默认饰品' },
        linkens: { name: '林肯法球' },
        pocket_trap: { name: '口袋陷阱' },
        dawn_hope: { name: '希望曙光' }
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
