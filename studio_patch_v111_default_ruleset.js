(() => {
  window.DEFAULT_STUDIO_RULESET_NAME = "各职业加强v1";
  window.DEFAULT_STUDIO_DATA = {
    "version":  "0.9.1",
    "templates":  {
                      "direct_damage":  {
                                            "label":  "直接伤害",
                                            "desc":  "对单体造成伤害，可附带状态。",
                                            "fields":  [
                                                           [
                                                               "damage",
                                                               "伤害骰",
                                                               "text"
                                                           ],
                                                           [
                                                               "range",
                                                               "距离",
                                                               "number"
                                                           ],
                                                           [
                                                               "target",
                                                               "目标类型",
                                                               "text"
                                                           ],
                                                           [
                                                               "spell",
                                                               "是否法术",
                                                               "boolean"
                                                           ],
                                                           [
                                                               "straight",
                                                               "是否直线",
                                                               "boolean"
                                                           ]
                                                       ]
                                        },
                      "self_buff":  {
                                        "label":  "自身增益",
                                        "desc":  "默认永久存在，直到被消耗。现在也支持闪避、反击、额外职业卡次数、受击随机位移、受伤自疗、受击缴械。",
                                        "fields":  [
                                                       [
                                                           "buffBasic",
                                                           "普攻加值",
                                                           "number"
                                                       ],
                                                       [
                                                           "bonusDie",
                                                           "额外骰子",
                                                           "text"
                                                       ],
                                                       [
                                                           "heal",
                                                           "恢复数值",
                                                           "text"
                                                       ],
                                                       [
                                                           "block",
                                                           "格挡骰",
                                                           "text"
                                                       ],
                                                       [
                                                           "dodgeNext",
                                                           "闪避下一次伤害",
                                                           "boolean"
                                                       ],
                                                       [
                                                           "counterDamage",
                                                           "反击固定伤害",
                                                           "text"
                                                       ],
                                                       [
                                                           "counterUseTakenDamage",
                                                           "反击=所受伤害",
                                                           "boolean"
                                                       ],
                                                       [
                                                           "classSkillCapDelta",
                                                           "职业技能额外次数",
                                                           "number"
                                                       ],
                                                       [
                                                           "reactiveMoveTrigger",
                                                           "随机位移触发时机",
                                                           "reactiveMoveTrigger"
                                                       ],
                                                       [
                                                           "reactiveMoveMaxDistance",
                                                           "随机位移最大距离(0=不限)",
                                                           "number"
                                                       ],
                                                       [
                                                           "healOnDamaged",
                                                           "受伤后自疗",
                                                           "text"
                                                       ],
                                                       [
                                                           "disarmAttackerOnHit",
                                                           "被攻击后缴械回合",
                                                           "number"
                                                       ],
                                                       [
                                                           "consumeOn",
                                                           "何时消耗",
                                                           "text"
                                                       ],
                                                       [
                                                           "durationTurns",
                                                           "持续回合",
                                                           "number"
                                                       ],
                                                       [
                                                           "basicAttackCapDelta",
                                                           "普攻次数改变量",
                                                           "number"
                                                       ]
                                                   ]
                                    },
                      "teleport":  {
                                       "label":  "位移/传送",
                                       "desc":  "移动到指定距离内空位。",
                                       "fields":  [
                                                      [
                                                          "range",
                                                          "位移距离",
                                                          "number"
                                                      ],
                                                      [
                                                          "target",
                                                          "目标类型",
                                                          "text"
                                                      ]
                                                  ]
                                   },
                      "aoe":  {
                                  "label":  "范围伤害",
                                  "desc":  "对范围内多个目标生效。",
                                  "fields":  [
                                                 [
                                                     "damage",
                                                     "伤害骰",
                                                     "text"
                                                 ],
                                                 [
                                                     "range",
                                                     "施法距离",
                                                     "number"
                                                 ],
                                                 [
                                                     "radius",
                                                     "半径",
                                                     "number"
                                                 ],
                                                 [
                                                     "spell",
                                                     "是否法术",
                                                     "boolean"
                                                 ]
                                             ]
                              },
                      "dash_hit":  {
                                       "label":  "冲锋并攻击",
                                       "desc":  "贴近目标后造成伤害。",
                                       "fields":  [
                                                      [
                                                          "damage",
                                                          "伤害骰",
                                                          "text"
                                                      ],
                                                      [
                                                          "range",
                                                          "冲锋距离",
                                                          "number"
                                                      ],
                                                      [
                                                          "gainBlock",
                                                          "获得格挡",
                                                          "text"
                                                      ],
                                                      [
                                                          "buffBasic",
                                                          "下次普攻加值",
                                                          "number"
                                                      ]
                                                  ]
                                   },
                      "dual_mode":  {
                                        "label":  "双模式技能",
                                        "desc":  "一张卡在使用时弹出两个模式供选择。",
                                        "fields":  [
                                                       [
                                                           "modes",
                                                           "模式列表",
                                                           "modes"
                                                       ]
                                                   ]
                                    },
                      "insert_negative_card_into_target_deck":  {
                                                                    "label":  "埋炸弹/插负面牌",
                                                                    "desc":  "在一定距离内指定目标，并向目标牌库加入负面牌。",
                                                                    "fields":  [
                                                                                   [
                                                                                       "range",
                                                                                       "距离",
                                                                                       "number"
                                                                                   ],
                                                                                   [
                                                                                       "insertCardKey",
                                                                                       "插入负面牌",
                                                                                       "negative-card-select"
                                                                                   ],
                                                                                   [
                                                                                       "insertCount",
                                                                                       "数量",
                                                                                       "number"
                                                                                   ],
                                                                                   [
                                                                                       "triggerCondition",
                                                                                       "触发条件",
                                                                                       "triggerCondition"
                                                                                   ],
                                                                                   [
                                                                                       "shuffleIntoDeck",
                                                                                       "是否洗入牌库",
                                                                                       "boolean"
                                                                                   ]
                                                                               ]
                                                                },
                      "threshold_reward_once_per_turn":  {
                                                             "label":  "阈值触发奖励",
                                                             "desc":  "每回合首次达到阈值时获得奖励。支持“造成伤害”阈值，并可直接返还普攻次数。",
                                                             "fields":  [
                                                                            [
                                                                                "thresholdType",
                                                                                "阈值类型",
                                                                                "thresholdType"
                                                                            ],
                                                                            [
                                                                                "thresholdValue",
                                                                                "阈值数值",
                                                                                "number"
                                                                            ],
                                                                            [
                                                                                "rewardList",
                                                                                "奖励列表",
                                                                                "reward-list"
                                                                            ],
                                                                            [
                                                                                "oncePerTurn",
                                                                                "每回合一次",
                                                                                "boolean"
                                                                            ]
                                                                        ]
                                                         },
                      "movement_threshold_restricts_bucket":  {
                                                                  "label":  "移动阈值限制技能",
                                                                  "desc":  "超过阈值后限制特定技能桶。",
                                                                  "fields":  [
                                                                                 [
                                                                                     "threshold",
                                                                                     "阈值",
                                                                                     "number"
                                                                                 ],
                                                                                 [
                                                                                     "affectedBuckets",
                                                                                     "受影响桶",
                                                                                     "json"
                                                                                 ],
                                                                                 [
                                                                                     "timing",
                                                                                     "触发时机",
                                                                                     "text"
                                                                                 ],
                                                                                 [
                                                                                     "exceptionBuckets",
                                                                                     "例外技能桶",
                                                                                     "json"
                                                                                 ]
                                                                             ]
                                                              },
                      "control_bonus_on_basic_attack":  {
                                                            "label":  "受控目标追加伤害",
                                                            "desc":  "普攻命中受控目标时额外造成伤害。",
                                                            "fields":  [
                                                                           [
                                                                               "requiredTargetState",
                                                                               "目标状态",
                                                                               "json"
                                                                           ],
                                                                           [
                                                                               "bonusDamage",
                                                                               "追加伤害",
                                                                               "text"
                                                                           ],
                                                                           [
                                                                               "attackType",
                                                                               "攻击类型",
                                                                               "text"
                                                                           ]
                                                                       ]
                                                        },
                      "heal_counter_bonus":  {
                                                 "label":  "累计治疗触发",
                                                 "desc":  "累计治疗次数后获得额外恢复。",
                                                 "fields":  [
                                                                [
                                                                    "counterName",
                                                                    "计数器名称",
                                                                    "text"
                                                                ],
                                                                [
                                                                    "triggerEvery",
                                                                    "每多少次触发",
                                                                    "number"
                                                                ],
                                                                [
                                                                    "bonusHeal",
                                                                    "额外治疗",
                                                                    "text"
                                                                ]
                                                            ]
                                             },
                      "weapon_basic_inflicts_status":  {
                                                           "label":  "普攻附带状态",
                                                           "desc":  "普通攻击附带 DOT 或状态。",
                                                           "fields":  [
                                                                          [
                                                                              "statusType",
                                                                              "状态类型",
                                                                              "text"
                                                                          ],
                                                                          [
                                                                              "statusValue",
                                                                              "状态数值",
                                                                              "text"
                                                                          ],
                                                                          [
                                                                              "durationTurns",
                                                                              "持续回合",
                                                                              "number"
                                                                          ]
                                                                      ]
                                                       },
                      "activated_token_scaling_block":  {
                                                            "label":  "已激活 token 提供格挡",
                                                            "desc":  "按 token 数量提供格挡。",
                                                            "fields":  [
                                                                           [
                                                                               "tokenType",
                                                                               "token 类型",
                                                                               "text"
                                                                           ],
                                                                           [
                                                                               "ratio",
                                                                               "比例",
                                                                               "number"
                                                                           ],
                                                                           [
                                                                               "rounding",
                                                                               "取整方式",
                                                                               "text"
                                                                           ],
                                                                           [
                                                                               "rewardType",
                                                                               "奖励类型",
                                                                               "text"
                                                                           ]
                                                                       ]
                                                        },
                      "life_for_card_draw_once_per_turn":  {
                                                               "label":  "支付生命抽牌",
                                                               "desc":  "每回合可支付生命额外抽牌。",
                                                               "fields":  [
                                                                              [
                                                                                  "lifeCost",
                                                                                  "生命消耗",
                                                                                  "number"
                                                                              ],
                                                                              [
                                                                                  "drawCount",
                                                                                  "抽牌数量",
                                                                                  "number"
                                                                              ],
                                                                              [
                                                                                  "oncePerTurn",
                                                                                  "每回合一次",
                                                                                  "boolean"
                                                                              ]
                                                                          ]
                                                           },
                      "skip_basic_attack_then_gain_bonus":  {
                                                                "label":  "未普攻获得增益",
                                                                "desc":  "本回合未普攻，则下次获得伤害加成。",
                                                                "fields":  [
                                                                               [
                                                                                   "checkAt",
                                                                                   "检查时机",
                                                                                   "text"
                                                                               ],
                                                                               [
                                                                                   "bonusType",
                                                                                   "加成类型",
                                                                                   "text"
                                                                               ],
                                                                               [
                                                                                   "bonusValue",
                                                                                   "加成数值",
                                                                                   "number"
                                                                               ],
                                                                               [
                                                                                   "consumeOn",
                                                                                   "何时消耗",
                                                                                   "text"
                                                                               ]
                                                                           ]
                                                            },
                      "mark_target_for_bonus":  {
                                                    "label":  "标记目标",
                                                    "desc":  "对目标施加标记，供后续技能额外结算。",
                                                    "fields":  [
                                                                   [
                                                                       "markType",
                                                                       "标记类型",
                                                                       "text"
                                                                   ],
                                                                   [
                                                                       "range",
                                                                       "距离",
                                                                       "number"
                                                                   ],
                                                                   [
                                                                       "consumeOn",
                                                                       "何时消耗",
                                                                       "text"
                                                                   ]
                                                               ]
                                                },
                      "bonus_if_target_marked":  {
                                                     "label":  "标记目标额外收益",
                                                     "desc":  "若目标被标记，则获得额外伤害或收益。",
                                                     "fields":  [
                                                                    [
                                                                        "baseDamage",
                                                                        "基础伤害",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "range",
                                                                        "距离",
                                                                        "number"
                                                                    ],
                                                                    [
                                                                        "bonusDamage",
                                                                        "额外伤害",
                                                                        "number"
                                                                    ],
                                                                    [
                                                                        "consumeMark",
                                                                        "是否消耗标记",
                                                                        "boolean"
                                                                    ]
                                                                ]
                                                 },
                      "summon_token_into_self_deck":  {
                                                          "label":  "召唤并激活 token",
                                                          "desc":  "使用后激活召唤物计数。",
                                                          "fields":  [
                                                                         [
                                                                             "tokenType",
                                                                             "token 类型",
                                                                             "text"
                                                                         ],
                                                                         [
                                                                             "insertCount",
                                                                             "数量",
                                                                             "number"
                                                                         ]
                                                                     ]
                                                      },
                      "consume_all_activated_tokens_for_burst":  {
                                                                     "label":  "消耗召唤物爆发",
                                                                     "desc":  "消耗已激活召唤物并对目标造成爆发伤害。",
                                                                     "fields":  [
                                                                                    [
                                                                                        "baseDamage",
                                                                                        "基础伤害",
                                                                                        "text"
                                                                                    ],
                                                                                    [
                                                                                        "range",
                                                                                        "距离",
                                                                                        "number"
                                                                                    ],
                                                                                    [
                                                                                        "bonusByTokenType",
                                                                                        "按 token 追加",
                                                                                        "json"
                                                                                    ]
                                                                                ]
                                                                 },
                      "damage_then_multi_buff":  {
                                                     "label":  "造成伤害后获得多重增益",
                                                     "desc":  "若原始伤害达到阈值，则按奖励列表获得多个增益。",
                                                     "fields":  [
                                                                    [
                                                                        "threshold",
                                                                        "造成伤害阈值",
                                                                        "number"
                                                                    ],
                                                                    [
                                                                        "target",
                                                                        "目标类型",
                                                                        "target"
                                                                    ],
                                                                    [
                                                                        "rewardList",
                                                                        "奖励列表",
                                                                        "reward-list"
                                                                    ],
                                                                    [
                                                                        "oncePerTurn",
                                                                        "每回合一次",
                                                                        "boolean"
                                                                    ]
                                                                ]
                                                 },
                      "damage_roll_grant_card":  {
                                                     "label":  "造成伤害后掷骰触发补牌",
                                                     "desc":  "造成伤害后掷骰，满足阈值时补入指定卡牌并可返还行动。",
                                                     "fields":  [
                                                                    [
                                                                        "damage",
                                                                        "伤害",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "range",
                                                                        "距离",
                                                                        "number"
                                                                    ],
                                                                    [
                                                                        "target",
                                                                        "目标类型",
                                                                        "target"
                                                                    ],
                                                                    [
                                                                        "procDie",
                                                                        "触发骰",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "threshold",
                                                                        "触发阈值",
                                                                        "number"
                                                                    ],
                                                                    [
                                                                        "grantedCardKey",
                                                                        "获得卡牌",
                                                                        "card-key-select"
                                                                    ],
                                                                    [
                                                                        "grantedOrigin",
                                                                        "卡牌来源",
                                                                        "origin"
                                                                    ],
                                                                    [
                                                                        "refundBucket",
                                                                        "返还行动",
                                                                        "refundBucket"
                                                                    ]
                                                                ]
                                                 },
                      "grant_multiple_buffs":  {
                                                   "label":  "使用后直接获得多种增益",
                                                   "desc":  "不造成伤害，直接按 rewardList 对自身施加多个增益。",
                                                   "fields":  [
                                                                  [
                                                                      "rewardList",
                                                                      "奖励列表",
                                                                      "reward-list"
                                                                  ],
                                                                  [
                                                                      "consumeOn",
                                                                      "何时消耗",
                                                                      "consumeOn"
                                                                  ]
                                                              ]
                                               },
                      "transform_basic_attack":  {
                                                     "label":  "变身并改变普通攻击",
                                                     "desc":  "使用后改变当前角色的普通攻击模式，可修改射程、伤害、附带效果与持续回合。",
                                                     "fields":  [
                                                                    [
                                                                        "attackName",
                                                                        "变身后普攻名称",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "damage",
                                                                        "变身后伤害骰",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "range",
                                                                        "变身后距离",
                                                                        "number"
                                                                    ],
                                                                    [
                                                                        "straight",
                                                                        "是否直线",
                                                                        "boolean"
                                                                    ],
                                                                    [
                                                                        "consumeOn",
                                                                        "何时结束",
                                                                        "consumeOn"
                                                                    ],
                                                                    [
                                                                        "durationTurns",
                                                                        "持续回合",
                                                                        "durationTurns"
                                                                    ],
                                                                    [
                                                                        "block",
                                                                        "额外格挡",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "apply",
                                                                        "附带效果",
                                                                        "json"
                                                                    ]
                                                                ]
                                                 },
                      "pay_life_draw_cards":  {
                                                  "label":  "支付生命并抽卡",
                                                  "desc":  "支付生命值后抽若干张牌。",
                                                  "fields":  [
                                                                 [
                                                                     "lifeCost",
                                                                     "生命代价",
                                                                     "number"
                                                                 ],
                                                                 [
                                                                     "drawCount",
                                                                     "抽牌数量",
                                                                     "number"
                                                                 ]
                                                             ]
                                              },
                      "negative_direct_damage":  {
                                                     "label":  "负面牌：直接伤害",
                                                     "desc":  "抽到即触发，直接对抽牌者造成伤害。",
                                                     "fields":  [
                                                                    [
                                                                        "damage",
                                                                        "伤害骰",
                                                                        "text"
                                                                    ],
                                                                    [
                                                                        "showInPreview",
                                                                        "展示在预览中",
                                                                        "boolean"
                                                                    ]
                                                                ]
                                                 },
                      "negative_dot":  {
                                           "label":  "负面牌：DOT",
                                           "desc":  "抽到即施加持续伤害。",
                                           "fields":  [
                                                          [
                                                              "damagePerTick",
                                                              "每跳伤害",
                                                              "text"
                                                          ],
                                                          [
                                                              "tickTiming",
                                                              "触发时机",
                                                              "tickTiming"
                                                          ],
                                                          [
                                                              "durationTurns",
                                                              "持续回合",
                                                              "durationTurns"
                                                          ],
                                                          [
                                                              "showInPreview",
                                                              "展示在预览中",
                                                              "boolean"
                                                          ]
                                                      ]
                                       },
                      "negative_control":  {
                                               "label":  "负面牌：控制",
                                               "desc":  "抽到即施加控制状态。",
                                               "fields":  [
                                                              [
                                                                  "controlType",
                                                                  "控制类型",
                                                                  "controlType"
                                                              ],
                                                              [
                                                                  "controlDuration",
                                                                  "控制回合",
                                                                  "durationTurns"
                                                              ],
                                                              [
                                                                  "showInPreview",
                                                                  "展示在预览中",
                                                                  "boolean"
                                                              ]
                                                          ]
                                           },
                      "negative_mixed":  {
                                             "label":  "负面牌：混合效果",
                                             "desc":  "抽到即触发直接伤害、DOT 和控制的组合。",
                                             "fields":  [
                                                            [
                                                                "damage",
                                                                "直接伤害",
                                                                "text"
                                                            ],
                                                            [
                                                                "damagePerTick",
                                                                "每跳伤害",
                                                                "text"
                                                            ],
                                                            [
                                                                "tickTiming",
                                                                "DOT 触发时机",
                                                                "tickTiming"
                                                            ],
                                                            [
                                                                "durationTurns",
                                                                "DOT 持续回合",
                                                                "durationTurns"
                                                            ],
                                                            [
                                                                "controlType",
                                                                "控制类型",
                                                                "controlType"
                                                            ],
                                                            [
                                                                "controlDuration",
                                                                "控制回合",
                                                                "durationTurns"
                                                            ],
                                                            [
                                                                "showInPreview",
                                                                "展示在预览中",
                                                                "boolean"
                                                            ]
                                                        ]
                                         },
                      "create_map_token":  {
                                               "label":  "在地图上创造 Token",
                                               "desc":  "在指定地块放置陷阱、永久柱体或自动炮塔。",
                                               "fields":  [
                                                              [
                                                                  "range",
                                                                  "放置距离",
                                                                  "number"
                                                              ],
                                                              [
                                                                  "tokenName",
                                                                  "Token 名称",
                                                                  "text"
                                                              ],
                                                              [
                                                                  "tokenKind",
                                                                  "Token 类型",
                                                                  "tokenKind"
                                                              ],
                                                              [
                                                                  "durationTurns",
                                                                  "持续回合",
                                                                  "durationTurns"
                                                              ],
                                                              [
                                                                  "damage",
                                                                  "伤害",
                                                                  "text"
                                                              ],
                                                              [
                                                                  "insertCardKey",
                                                                  "插入负面牌",
                                                                  "negative-card-select"
                                                              ],
                                                              [
                                                                  "insertCount",
                                                                  "插入数量",
                                                                  "number"
                                                              ],
                                                              [
                                                                  "attackRange",
                                                                  "炮塔射程",
                                                                  "number"
                                                              ],
                                                              [
                                                                  "controlType",
                                                                  "控制效果",
                                                                  "controlType"
                                                              ],
                                                              [
                                                                  "controlDuration",
                                                                  "控制回合",
                                                                  "number"
                                                              ],
                                                              [
                                                                  "blocking",
                                                                  "阻挡碰撞",
                                                                  "boolean"
                                                              ]
                                                          ]
                                           }
                  },
    "statuses":  {
                     "none":  {
                                  "label":  "无"
                              },
                     "dot_damage_over_time":  {
                                                  "label":  "DOT",
                                                  "fields":  [
                                                                 [
                                                                     "damagePerTick",
                                                                     "每跳伤害",
                                                                     "text"
                                                                 ],
                                                                 [
                                                                     "tickTiming",
                                                                     "触发时机",
                                                                     "text"
                                                                 ],
                                                                 [
                                                                     "durationTurns",
                                                                     "持续回合",
                                                                     "number"
                                                                 ],
                                                                 [
                                                                     "stackRule",
                                                                     "叠加规则",
                                                                     "text"
                                                                 ]
                                                             ]
                                              },
                     "slow_status":  {
                                         "label":  "减速",
                                         "fields":  [
                                                        [
                                                            "moveMultiplier",
                                                            "移动倍率",
                                                            "number"
                                                        ],
                                                        [
                                                            "rounding",
                                                            "取整方式",
                                                            "text"
                                                        ],
                                                        [
                                                            "durationTurns",
                                                            "持续回合",
                                                            "number"
                                                        ]
                                                    ]
                                     },
                     "control_status":  {
                                            "label":  "控制",
                                            "fields":  [
                                                           [
                                                               "controlType",
                                                               "控制类型",
                                                               "text"
                                                           ],
                                                           [
                                                               "durationTurns",
                                                               "持续回合",
                                                               "number"
                                                           ],
                                                           [
                                                               "isControlTag",
                                                               "是否控制标签",
                                                               "boolean"
                                                           ]
                                                       ]
                                        },
                     "negative_card_trigger_on_draw":  {
                                                           "label":  "抽到触发负面牌",
                                                           "fields":  [
                                                                          [
                                                                              "onDrawEffect",
                                                                              "抽到时效果",
                                                                              "text"
                                                                          ],
                                                                          [
                                                                              "damage",
                                                                              "伤害骰",
                                                                              "text"
                                                                          ],
                                                                          [
                                                                              "showInPreview",
                                                                              "是否展示",
                                                                              "boolean"
                                                                          ]
                                                                      ]
                                                       }
                 },
    "templateDefaults":  {
                             "direct_damage":  {
                                                   "damage":  "1d6",
                                                   "range":  1,
                                                   "target":  "enemy",
                                                   "spell":  false,
                                                   "straight":  false
                                               },
                             "self_buff":  {
                                               "buffBasic":  0,
                                               "bonusDie":  "",
                                               "heal":  "",
                                               "block":  "",
                                               "dodgeNext":  false,
                                               "counterDamage":  "",
                                               "counterUseTakenDamage":  false,
                                               "classSkillCapDelta":  0,
                                               "reactiveMoveTrigger":  "",
                                               "reactiveMoveMaxDistance":  0,
                                               "healOnDamaged":  "",
                                               "disarmAttackerOnHit":  0,
                                               "consumeOn":  "next_basic_attack",
                                               "durationTurns":  null,
                                               "basicAttackCapDelta":  0
                                           },
                             "teleport":  {
                                              "range":  3,
                                              "target":  "tile"
                                          },
                             "aoe":  {
                                         "damage":  "2d4",
                                         "range":  2,
                                         "radius":  1,
                                         "spell":  true
                                     },
                             "dash_hit":  {
                                              "damage":  "1d6",
                                              "range":  3,
                                              "gainBlock":  "",
                                              "buffBasic":  0
                                          },
                             "dual_mode":  {
                                               "modes":  [
                                                             {
                                                                 "name":  "模式1",
                                                                 "templateRef":  "direct_damage",
                                                                 "damage":  "1d6",
                                                                 "range":  1,
                                                                 "consumeOn":  ""
                                                             },
                                                             {
                                                                 "name":  "模式2",
                                                                 "templateRef":  "self_buff",
                                                                 "buffBasic":  2,
                                                                 "consumeOn":  "next_basic_attack"
                                                             }
                                                         ]
                                           },
                             "insert_negative_card_into_target_deck":  {
                                                                           "range":  4,
                                                                           "insertCardKey":  "bomb_token",
                                                                           "insertCount":  1,
                                                                           "triggerCondition":  "on_hit",
                                                                           "shuffleIntoDeck":  true
                                                                       },
                             "threshold_reward_once_per_turn":  {
                                                                    "thresholdType":  "effective_damage",
                                                                    "thresholdValue":  4,
                                                                    "rewardList":  [
                                                                                       {
                                                                                           "type":  "gain_block",
                                                                                           "value":  2
                                                                                       }
                                                                                   ],
                                                                    "oncePerTurn":  true
                                                                },
                             "movement_threshold_restricts_bucket":  {
                                                                         "threshold":  3,
                                                                         "affectedBuckets":  [
                                                                                                 "class_or_guardian"
                                                                                             ],
                                                                         "timing":  "after_move_before_class_skill",
                                                                         "exceptionBuckets":  [
                                                                                                  "weapon_or_accessory"
                                                                                              ]
                                                                     },
                             "control_bonus_on_basic_attack":  {
                                                                   "requiredTargetState":  [
                                                                                               "slow"
                                                                                           ],
                                                                   "bonusDamage":  "1d4",
                                                                   "attackType":  "basic_attack"
                                                               },
                             "heal_counter_bonus":  {
                                                        "counterName":  "heal_count",
                                                        "triggerEvery":  4,
                                                        "bonusHeal":  "1d6"
                                                    },
                             "weapon_basic_inflicts_status":  {
                                                                  "statusType":  "burn",
                                                                  "statusValue":  "1d4",
                                                                  "durationTurns":  2
                                                              },
                             "activated_token_scaling_block":  {
                                                                   "tokenType":  "undead_token",
                                                                   "ratio":  0.5,
                                                                   "rounding":  "ceil",
                                                                   "rewardType":  "gain_block_each_turn"
                                                               },
                             "life_for_card_draw_once_per_turn":  {
                                                                      "lifeCost":  4,
                                                                      "drawCount":  1,
                                                                      "oncePerTurn":  true
                                                                  },
                             "skip_basic_attack_then_gain_bonus":  {
                                                                       "checkAt":  "end_of_turn",
                                                                       "bonusType":  "flat_damage",
                                                                       "bonusValue":  5,
                                                                       "consumeOn":  "next_basic_attack_or_class_skill"
                                                                   },
                             "mark_target_for_bonus":  {
                                                           "markType":  "normal",
                                                           "range":  5,
                                                           "consumeOn":  "until_triggered"
                                                       },
                             "bonus_if_target_marked":  {
                                                            "baseDamage":  "2d8",
                                                            "range":  5,
                                                            "bonusDamage":  2,
                                                            "consumeMark":  true
                                                        },
                             "summon_token_into_self_deck":  {
                                                                 "tokenType":  "skeleton",
                                                                 "insertCount":  1
                                                             },
                             "consume_all_activated_tokens_for_burst":  {
                                                                            "baseDamage":  "2d4",
                                                                            "range":  5,
                                                                            "bonusByTokenType":  {
                                                                                                     "skeleton":  "1d4",
                                                                                                     "bone_dragon":  "1d8"
                                                                                                 }
                                                                        },
                             "damage_then_multi_buff":  {
                                                            "threshold":  0,
                                                            "target":  "enemy",
                                                            "rewardList":  [
                                                                               {
                                                                                   "type":  "gain_block",
                                                                                   "value":  "1d4"
                                                                               }
                                                                           ],
                                                            "oncePerTurn":  true,
                                                            "baseDamage":  "1d6",
                                                            "range":  1,
                                                            "damage":  "1d6"
                                                        },
                             "damage_roll_grant_card":  {
                                                            "damage":  "1d6",
                                                            "range":  1,
                                                            "target":  "enemy",
                                                            "procDie":  "1d6",
                                                            "threshold":  3,
                                                            "grantedCardKey":  "",
                                                            "grantedOrigin":  "职业技能",
                                                            "refundBucket":  "class_or_guardian"
                                                        },
                             "grant_multiple_buffs":  {
                                                          "rewardList":  [
                                                                             {
                                                                                 "type":  "gain_block",
                                                                                 "value":  "1d4"
                                                                             },
                                                                             {
                                                                                 "type":  "buff_basic",
                                                                                 "value":  2
                                                                             }
                                                                         ],
                                                          "consumeOn":  "immediate"
                                                      },
                             "transform_basic_attack":  {
                                                            "attackName":  "变身普攻",
                                                            "damage":  "1d8",
                                                            "range":  3,
                                                            "straight":  false,
                                                            "consumeOn":  "end_of_turn",
                                                            "durationTurns":  2,
                                                            "block":  "0",
                                                            "apply":  {

                                                                      }
                                                        },
                             "pay_life_draw_cards":  {
                                                         "lifeCost":  4,
                                                         "drawCount":  1
                                                     },
                             "negative_direct_damage":  {
                                                            "damage":  "2d6",
                                                            "showInPreview":  true
                                                        },
                             "negative_dot":  {
                                                  "damagePerTick":  "1d4",
                                                  "tickTiming":  "turn_start",
                                                  "durationTurns":  "2",
                                                  "showInPreview":  true
                                              },
                             "negative_control":  {
                                                      "controlType":  "disarm",
                                                      "controlDuration":  "1",
                                                      "showInPreview":  true
                                                  },
                             "negative_mixed":  {
                                                    "damage":  "1d4",
                                                    "damagePerTick":  "1d4",
                                                    "tickTiming":  "turn_start",
                                                    "durationTurns":  "2",
                                                    "controlType":  "slow",
                                                    "controlDuration":  "1",
                                                    "showInPreview":  true
                                                },
                             "create_map_token":  {
                                                      "range":  3,
                                                      "tokenName":  "陷阱",
                                                      "tokenKind":  "trap_once_negative",
                                                      "durationTurns":  2,
                                                      "damage":  "2d6",
                                                      "insertCardKey":  "",
                                                      "insertCount":  1,
                                                      "attackRange":  4,
                                                      "controlType":  "",
                                                      "controlDuration":  1,
                                                      "blocking":  false
                                                  }
                         },
    "ruleDefaults":  {
                         "drawPerTurn":  2,
                         "meleeMove":  5,
                         "rangedMove":  3,
                         "buckets":  {
                                         "class_or_guardian":  1,
                                         "weapon_or_accessory":  1,
                                         "move":  1,
                                         "basic_attack":  1,
                                         "block":  1
                                     },
                         "mapRadius":  6,
                         "drawOpening":  6,
                         "handLimit":  10
                     },
    "weaponLibrary":  {
                          "greatsword":  {
                                             "key":  "greatsword",
                                             "name":  "巨剑",
                                             "basic":  {
                                                           "name":  "巨剑普攻",
                                                           "damage":  "2d6",
                                                           "range":  1,
                                                           "straight":  false,
                                                           "type":  "近战"
                                                       },
                                             "cards":  [
                                                           "greatsword_crush",
                                                           "weapon_charge"
                                                       ],
                                             "deckCounts":  {
                                                                "greatsword_crush":  1,
                                                                "weapon_charge":  1
                                                            }
                                         },
                          "longbow":  {
                                          "key":  "longbow",
                                          "name":  "长弓",
                                          "basic":  {
                                                        "name":  "长弓普攻",
                                                        "damage":  "1d6",
                                                        "range":  6,
                                                        "straight":  true,
                                                        "type":  "远程直线"
                                                    },
                                          "cards":  [
                                                        "bow_pin",
                                                        "bow_step"
                                                    ],
                                          "deckCounts":  {
                                                             "bow_pin":  1,
                                                             "bow_step":  1
                                                         }
                                      },
                          "dagger":  {
                                         "key":  "dagger",
                                         "name":  "匕首",
                                         "basic":  {
                                                       "name":  "匕首普攻",
                                                       "damage":  "2d5",
                                                       "range":  1,
                                                       "straight":  false,
                                                       "type":  "近战"
                                                   },
                                         "cards":  [
                                                       "dagger_step",
                                                       "dagger_poison"
                                                   ],
                                         "deckCounts":  {
                                                            "dagger_step":  1,
                                                            "dagger_poison":  1
                                                        }
                                     },
                          "warhammer":  {
                                            "key":  "warhammer",
                                            "name":  "战锤",
                                            "basic":  {
                                                          "name":  "战锤普攻",
                                                          "damage":  "2d5",
                                                          "range":  1,
                                                          "straight":  false,
                                                          "type":  "近战"
                                                      },
                                            "cards":  [
                                                          "hammer_break",
                                                          "hammer_quake",
                                                          "weapon_charge"
                                                      ],
                                            "deckCounts":  {
                                                               "hammer_break":  1,
                                                               "weapon_charge":  0,
                                                               "hammer_quake":  1
                                                           }
                                        },
                          "wand":  {
                                       "key":  "wand",
                                       "name":  "魔杖",
                                       "basic":  {
                                                     "name":  "魔杖普攻",
                                                     "damage":  "1d6",
                                                     "range":  4,
                                                     "straight":  true,
                                                     "type":  "远程直线"
                                                 },
                                       "cards":  [
                                                     "wand_burst",
                                                     "wand_shield",
                                                     "bow_step"
                                                 ],
                                       "deckCounts":  {
                                                          "wand_burst":  1,
                                                          "bow_step":  0,
                                                          "wand_shield":  1
                                                      }
                                   },
                          "twin_blades":  {
                                              "key":  "twin_blades",
                                              "name":  "双刃",
                                              "basic":  {
                                                            "name":  "双刃普攻",
                                                            "damage":  "2d4",
                                                            "range":  1,
                                                            "straight":  false,
                                                            "type":  "近战"
                                                        },
                                              "cards":  [
                                                            "twin_flurry",
                                                            "twin_dash",
                                                            "dagger_step"
                                                        ],
                                              "deckCounts":  {
                                                                 "twin_flurry":  1,
                                                                 "dagger_step":  0,
                                                                 "twin_dash":  1
                                                             }
                                          },
                          "totem":  {
                                        "key":  "totem",
                                        "name":  "图腾",
                                        "basic":  {
                                                      "name":  "图腾普攻",
                                                      "damage":  "2d4",
                                                      "range":  4,
                                                      "straight":  true,
                                                      "type":  "远程直线"
                                                  },
                                        "cards":  [
                                                      "totem_shock",
                                                      "totem_barrier",
                                                      "bow_step"
                                                  ],
                                        "deckCounts":  {
                                                           "totem_shock":  1,
                                                           "bow_step":  0,
                                                           "totem_barrier":  1
                                                       }
                                    }
                      },
    "accessoryLibrary":  {
                             "lincoln":  {
                                             "key":  "lincoln",
                                             "name":  "林肯法球",
                                             "cards":  [
                                                           "acc_nullify",
                                                           "acc_lincoln_guard"
                                                       ],
                                             "deckCounts":  {
                                                                "acc_nullify":  1,
                                                                "acc_lincoln_guard":  1
                                                            }
                                         },
                             "trapbag":  {
                                             "key":  "trapbag",
                                             "name":  "口袋陷阱",
                                             "cards":  [
                                                           "acc_trap",
                                                           "acc_trap_spike"
                                                       ],
                                             "deckCounts":  {
                                                                "acc_trap":  1,
                                                                "acc_trap_spike":  1
                                                            }
                                         },
                             "hope":  {
                                          "key":  "hope",
                                          "name":  "希望曙光",
                                          "cards":  [
                                                        "acc_hope",
                                                        "acc_hope_guard"
                                                    ],
                                          "deckCounts":  {
                                                             "acc_hope":  1,
                                                             "acc_hope_guard":  1
                                                         }
                                      },
                             "blood_phial":  {
                                                 "key":  "blood_phial",
                                                 "name":  "嗜血药剂",
                                                 "cards":  [
                                                               "acc_blood_phial",
                                                               "acc_blood_surge"
                                                           ]
                                             },
                             "time_rewind":  {
                                                 "key":  "time_rewind",
                                                 "name":  "时光倒流",
                                                 "cards":  [
                                                               "acc_time_rewind",
                                                               "acc_time_echo"
                                                           ]
                                             },
                             "void_core":  {
                                               "key":  "void_core",
                                               "name":  "虚空核心",
                                               "cards":  [
                                                             "acc_void_core",
                                                             "acc_void_blast"
                                                         ]
                                           },
                             "holy_icon":  {
                                               "key":  "holy_icon",
                                               "name":  "圣徽",
                                               "cards":  [
                                                             "acc_holy_icon",
                                                             "acc_holy_guard"
                                                         ],
                                               "deckCounts":  {
                                                                  "acc_holy_icon":  1,
                                                                  "acc_holy_guard":  1
                                                              }
                                           },
                             "口袋炮塔":  {
                                          "key":  "口袋炮塔",
                                          "name":  "口袋炮塔",
                                          "cards":  [
                                                        "口袋炮塔"
                                                    ]
                                      }
                         },
    "cardLibrary":  {
                        "greatsword_crush":  {
                                                 "name":  "碾压打击",
                                                 "source":  "武器技能",
                                                 "template":  "direct_damage",
                                                 "config":  {
                                                                "damage":  "1d6+1",
                                                                "range":  1,
                                                                "target":  "enemy"
                                                            },
                                                 "text":  "近战造成 1D6+1 伤害。"
                                             },
                        "weapon_charge":  {
                                              "name":  "武器冲锋",
                                              "source":  "武器技能",
                                              "template":  "dash_hit",
                                              "config":  {
                                                             "damage":  "1d6",
                                                             "range":  3,
                                                             "buffBasic":  0
                                                         },
                                              "text":  "冲向目标造成 1D6 伤害。"
                                          },
                        "bow_pin":  {
                                        "name":  "钉刺射击",
                                        "source":  "武器技能",
                                        "template":  "direct_damage",
                                        "config":  {
                                                       "damage":  "1d4",
                                                       "range":  6,
                                                       "target":  "enemy",
                                                       "straight":  true,
                                                       "apply":  {
                                                                     "slow":  1
                                                                 }
                                                   },
                                        "text":  "直线 1D4 伤害并减速。"
                                    },
                        "bow_step":  {
                                         "name":  "滑步",
                                         "source":  "武器技能",
                                         "template":  "teleport",
                                         "config":  {
                                                        "range":  2,
                                                        "target":  "tile"
                                                    },
                                         "text":  "移动到 2 格内空位。"
                                     },
                        "dagger_step":  {
                                            "name":  "滑步",
                                            "source":  "武器技能",
                                            "template":  "teleport",
                                            "config":  {
                                                           "range":  2,
                                                           "target":  "tile"
                                                       },
                                            "text":  "移动到 2 格内空位。"
                                        },
                        "dagger_poison":  {
                                              "name":  "毒刃",
                                              "source":  "武器技能",
                                              "template":  "direct_damage",
                                              "config":  {
                                                             "damage":  "1d4",
                                                             "range":  1,
                                                             "target":  "enemy",
                                                             "applyTemplate":  "dot_damage_over_time",
                                                             "applyConfig":  {
                                                                                 "damagePerTick":  "1d4",
                                                                                 "tickTiming":  "turn_start",
                                                                                 "durationTurns":  2,
                                                                                 "stackRule":  "refresh_duration"
                                                                             }
                                                         },
                                              "text":  "造成 1D6 伤害并附带 DOT，1d4 2回合。"
                                          },
                        "acc_nullify":  {
                                            "name":  "法术无效",
                                            "source":  "饰品技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "consumeOn":  "next_spell_hit",
                                                           "durationTurns":  null
                                                       },
                                            "text":  "抵消下一次法术。"
                                        },
                        "acc_trap":  {
                                         "name":  "尖刺陷阱",
                                         "source":  "饰品技能",
                                         "template":  "create_map_token",
                                         "config":  {
                                                        "range":  4,
                                                        "tokenName":  "陷阱",
                                                        "tokenKind":  "trap_once_negative",
                                                        "durationTurns":  2,
                                                        "damage":  "",
                                                        "insertCardKey":  "trap_token",
                                                        "insertCount":  1,
                                                        "attackRange":  0,
                                                        "controlType":  "",
                                                        "controlDuration":  0,
                                                        "blocking":  false
                                                    },
                                         "text":  ""
                                     },
                        "acc_hope":  {
                                         "name":  "曙光",
                                         "source":  "饰品技能",
                                         "template":  "self_buff",
                                         "config":  {
                                                        "heal":  4,
                                                        "block":  "2",
                                                        "consumeOn":  "immediate"
                                                    },
                                         "text":  "恢复 4 并获得 2 格挡。"
                                     },
                        "trap_token":  {
                                           "name":  "陷阱触发",
                                           "source":  "负面牌",
                                           "template":  "direct_damage",
                                           "config":  {
                                                          "damage":  "2d6",
                                                          "range":  0,
                                                          "target":  "self"
                                                      },
                                           "text":  "触发陷阱，受到 2D6 伤害。",
                                           "negativeOnDraw":  true
                                       },
                        "necro_bomb_token":  {
                                                 "name":  "骨炸弹",
                                                 "source":  "负面牌",
                                                 "template":  "direct_damage",
                                                 "config":  {
                                                                "damage":  "2d6",
                                                                "range":  0,
                                                                "target":  "self",
                                                                "applyTemplate":  "slow_status",
                                                                "applyConfig":  {
                                                                                    "moveMultiplier":  0.5
                                                                                }
                                                            },
                                                 "text":  "抽到即爆炸并减速。",
                                                 "negativeOnDraw":  true
                                             },
                        "hammer_break":  {
                                             "name":  "重击",
                                             "source":  "武器技能",
                                             "template":  "direct_damage",
                                             "config":  {
                                                            "damage":  "1d8",
                                                            "range":  1,
                                                            "target":  "enemy"
                                                        },
                                             "text":  "近战造成 1D8 伤害。"
                                         },
                        "wand_burst":  {
                                           "name":  "点燃",
                                           "source":  "武器技能",
                                           "template":  "direct_damage",
                                           "config":  {
                                                          "damage":  "1d6",
                                                          "range":  5,
                                                          "target":  "enemy",
                                                          "straight":  true,
                                                          "spell":  true,
                                                          "applyTemplate":  "dot_damage_over_time",
                                                          "applyConfig":  {
                                                                              "damagePerTick":  "1d4"
                                                                          }
                                                      },
                                           "text":  "直线造成 1D6 法术伤害，并且点燃目标造成1d4伤害持续1回合。"
                                       },
                        "twin_flurry":  {
                                            "name":  "乱舞",
                                            "source":  "武器技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "basicAttackCapDelta":  1,
                                                           "consumeOn":  "end_of_turn",
                                                           "durationTurns":  1
                                                       },
                                            "text":  "本回合额外获得一次普攻。"
                                        },
                        "totem_shock":  {
                                            "name":  "图腾震击",
                                            "source":  "武器技能",
                                            "template":  "direct_damage",
                                            "config":  {
                                                           "damage":  "1d6",
                                                           "range":  4,
                                                           "target":  "enemy",
                                                           "apply":  {
                                                                         "slow":  1
                                                                     },
                                                           "applyTemplate":  "slow_status",
                                                           "applyConfig":  {
                                                                               "moveMultiplier":  0.5
                                                                           }
                                                       },
                                            "text":  "造成 1D6伤害并减速。"
                                        },
                        "acc_blood_phial":  {
                                                "name":  "嗜血药剂",
                                                "source":  "饰品技能",
                                                "template":  "self_buff",
                                                "config":  {
                                                               "heal":  "1d6",
                                                               "bonusDie":  "1d4",
                                                               "consumeOn":  "next_basic_attack"
                                                           },
                                                "text":  "恢复 1D6，并让下次普攻额外造成 1D4。"
                                            },
                        "acc_time_rewind":  {
                                                "name":  "时光倒流",
                                                "source":  "饰品技能",
                                                "template":  "self_buff",
                                                "config":  {
                                                               "buffBasic":  0,
                                                               "bonusDie":  "",
                                                               "heal":  "",
                                                               "block":  "",
                                                               "dodgeNext":  false,
                                                               "counterDamage":  "",
                                                               "counterUseTakenDamage":  false,
                                                               "classSkillCapDelta":  1,
                                                               "reactiveMoveTrigger":  "",
                                                               "reactiveMoveMaxDistance":  0,
                                                               "healOnDamaged":  "",
                                                               "disarmAttackerOnHit":  0,
                                                               "consumeOn":  "end_of_turn",
                                                               "durationTurns":  null,
                                                               "basicAttackCapDelta":  0
                                                           },
                                                "text":  "额外使用一次职业技能。"
                                            },
                        "acc_void_core":  {
                                              "name":  "虚空核心",
                                              "source":  "饰品技能",
                                              "template":  "direct_damage",
                                              "config":  {
                                                             "damage":  "1d8",
                                                             "range":  5,
                                                             "target":  "enemy",
                                                             "spell":  true
                                                         },
                                              "text":  "造成 1D8 法术伤害。"
                                          },
                        "acc_holy_icon":  {
                                              "name":  "圣火",
                                              "source":  "饰品技能",
                                              "template":  "direct_damage",
                                              "config":  {
                                                             "damage":  "1d6",
                                                             "range":  5,
                                                             "target":  "enemy",
                                                             "spell":  false,
                                                             "straight":  false,
                                                             "applyTemplate":  "dot_damage_over_time",
                                                             "applyConfig":  {
                                                                                 "damagePerTick":  "1d6"
                                                                             }
                                                         },
                                              "text":  "从天而降的圣火，点燃目标，造成1d6伤害，并且点燃造成1d6伤害，持续一回合"
                                          },
                        "hunter_snare_token":  {
                                                   "name":  "束缚陷阱",
                                                   "source":  "负面牌",
                                                   "template":  "direct_damage",
                                                   "config":  {
                                                                  "damage":  "2d6",
                                                                  "range":  0,
                                                                  "target":  "self",
                                                                  "applyTemplate":  "slow_status",
                                                                  "applyConfig":  {
                                                                                      "moveMultiplier":  0.5
                                                                                  }
                                                              },
                                                   "text":  "抽到即触发，受到 2D6 伤害并减速。",
                                                   "negativeOnDraw":  true
                                               },
                        "acc_lincoln_guard":  {
                                                  "name":  "护幕",
                                                  "source":  "饰品技能",
                                                  "template":  "self_buff",
                                                  "config":  {
                                                                 "block":  "1d6",
                                                                 "consumeOn":  "next_basic_attack"
                                                             },
                                                  "text":  "获得 1D6 格挡。"
                                              },
                        "acc_trap_spike":  {
                                               "name":  "追猎陷阱",
                                               "source":  "饰品技能",
                                               "template":  "insert_negative_card_into_target_deck",
                                               "config":  {
                                                              "insertCardKey":  "hunter_snare_token",
                                                              "insertCount":  1,
                                                              "triggerCondition":  "on_hit",
                                                              "shuffleIntoDeck":  true,
                                                              "range":  4
                                                          },
                                               "text":  "向目标牌库植入束缚陷阱。"
                                           },
                        "acc_hope_guard":  {
                                               "name":  "晨光庇护",
                                               "source":  "饰品技能",
                                               "template":  "self_buff",
                                               "config":  {
                                                              "heal":  3,
                                                              "block":  "1d4",
                                                              "consumeOn":  "immediate"
                                                          },
                                               "text":  "恢复 3 并获得 1D4 格挡。"
                                           },
                        "hunter_trap":  {
                                            "name":  "束缚陷阱",
                                            "source":  "职业技能",
                                            "template":  "insert_negative_card_into_target_deck",
                                            "config":  {
                                                           "insertCardKey":  "hunter_snare_token",
                                                           "insertCount":  1,
                                                           "triggerCondition":  "on_hit",
                                                           "shuffleIntoDeck":  true,
                                                           "range":  6
                                                       },
                                            "text":  "向目标牌库植入束缚陷阱。"
                                        },
                        "hunter_command":  {
                                               "name":  "杀戮命令",
                                               "source":  "职业技能",
                                               "template":  "bonus_if_target_marked",
                                               "config":  {
                                                              "baseDamage":  "2d8",
                                                              "range":  5,
                                                              "bonusDamage":  3,
                                                              "consumeMark":  true
                                                          },
                                               "text":  "对被标记目标造成高额伤害。"
                                           },
                        "hunter_volley":  {
                                              "name":  "多重射击",
                                              "source":  "职业技能",
                                              "template":  "aoe",
                                              "config":  {
                                                             "damage":  "1d6",
                                                             "range":  5,
                                                             "radius":  1,
                                                             "spell":  false
                                                         },
                                              "text":  "对小范围造成 1D6 伤害。"
                                          },
                        "priest_sanctuary":  {
                                                 "name":  "圣光庇护",
                                                 "source":  "职业技能",
                                                 "template":  "self_buff",
                                                 "config":  {
                                                                "heal":  "",
                                                                "block":  "1d5",
                                                                "consumeOn":  "immediate",
                                                                "healOnDamaged":  "1D5",
                                                                "counterDamage":  "5"
                                                            },
                                                 "text":  "在受伤后回复1D5，同时获得格挡1D5，并对攻击者反伤5点伤害。"
                                             },
                        "priest_judgement":  {
                                                 "name":  "审判",
                                                 "source":  "职业技能",
                                                 "template":  "direct_damage",
                                                 "config":  {
                                                                "damage":  "1d8",
                                                                "range":  4,
                                                                "target":  "enemy",
                                                                "spell":  true
                                                            },
                                                 "text":  "造成 1D8 法术伤害"
                                             },
                        "shaman_chain":  {
                                             "name":  "闪电链",
                                             "source":  "职业技能",
                                             "template":  "aoe",
                                             "config":  {
                                                            "damage":  "1d6",
                                                            "range":  4,
                                                            "radius":  1,
                                                            "spell":  true
                                                        },
                                             "text":  "对范围造成 1D6 法术伤害。"
                                         },
                        "shaman_spiritwalk":  {
                                                  "name":  "灵行",
                                                  "source":  "职业技能",
                                                  "template":  "teleport",
                                                  "config":  {
                                                                 "range":  3,
                                                                 "target":  "tile"
                                                             },
                                                  "text":  "位移到 3 格内空位。"
                                              },
                        "necro_gravebind":  {
                                                "name":  "墓缚",
                                                "source":  "职业技能",
                                                "template":  "direct_damage",
                                                "config":  {
                                                               "damage":  "1d4",
                                                               "range":  5,
                                                               "target":  "enemy",
                                                               "spell":  true,
                                                               "apply":  {
                                                                             "slow":  1
                                                                         }
                                                           },
                                                "text":  "造成 1D4 伤害并减速。"
                                            },
                        "necro_legion":  {
                                             "name":  "亡者军势",
                                             "source":  "职业技能",
                                             "template":  "summon_token_into_self_deck",
                                             "config":  {
                                                            "tokenType":  "skeleton",
                                                            "insertCount":  2
                                                        },
                                             "text":  "一次激活两个骷髅。"
                                         },
                        "lock_bloodpact":  {
                                               "name":  "血契",
                                               "source":  "职业技能",
                                               "template":  "self_buff",
                                               "config":  {
                                                              "heal":  "1d4",
                                                              "bonusDie":  "1d4",
                                                              "consumeOn":  "next_basic_attack"
                                                          },
                                               "text":  "恢复并让下次普攻额外造成 1D4。"
                                           },
                        "lock_doom":  {
                                          "name":  "厄运",
                                          "source":  "职业技能",
                                          "template":  "insert_negative_card_into_target_deck",
                                          "config":  {
                                                         "range":  5,
                                                         "insertCardKey":  "doom",
                                                         "insertCount":  1,
                                                         "triggerCondition":  "on_hit",
                                                         "shuffleIntoDeck":  true
                                                     },
                                          "text":  "诅咒对方，当对方抽到厄运降临时，受到大量伤害。"
                                      },
                        "sword_focus":  {
                                            "name":  "心眼",
                                            "source":  "职业技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "buffBasic":  2,
                                                           "block":  "1d4",
                                                           "consumeOn":  "next_basic_attack"
                                                       },
                                            "text":  "获得少量格挡，下次普攻 +2。"
                                        },
                        "shaman_tide":  {
                                            "name":  "潮汐之涌",
                                            "source":  "职业技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "heal":  "1d6",
                                                           "block":  "1d6",
                                                           "consumeOn":  "immediate"
                                                       },
                                            "text":  "恢复 1D6 并获得 1D6格挡。"
                                        },
                        "shaman_earthbind":  {
                                                 "name":  "地缚",
                                                 "source":  "职业技能",
                                                 "template":  "direct_damage",
                                                 "config":  {
                                                                "damage":  "1d4",
                                                                "range":  4,
                                                                "target":  "enemy",
                                                                "spell":  true,
                                                                "apply":  {
                                                                              "slow":  1
                                                                          }
                                                            },
                                                 "text":  "造成 1D4 法术伤害并减速。"
                                             },
                        "lock_siphon":  {
                                            "name":  "灵魂虹吸",
                                            "source":  "职业技能",
                                            "template":  "direct_damage",
                                            "config":  {
                                                           "damage":  "1d6",
                                                           "range":  4,
                                                           "target":  "enemy",
                                                           "spell":  true
                                                       },
                                            "text":  "造成 1D6 法术伤害。"
                                        },
                        "lock_hellfire":  {
                                              "name":  "地狱烈焰",
                                              "source":  "职业技能",
                                              "template":  "aoe",
                                              "config":  {
                                                             "damage":  "1d8",
                                                             "range":  4,
                                                             "radius":  1,
                                                             "spell":  true
                                                         },
                                              "text":  "对目标点周围 1 格造成 1D8 法术伤害。"
                                          },
                        "hunter_explosive":  {
                                                 "name":  "爆裂射击",
                                                 "source":  "职业技能",
                                                 "template":  "aoe",
                                                 "config":  {
                                                                "damage":  "1d8",
                                                                "range":  5,
                                                                "radius":  1,
                                                                "spell":  false
                                                            },
                                                 "text":  "对目标点周围 1 格造成 1D8 伤害。"
                                             },
                        "hunter_tracking":  {
                                                "name":  "追踪射击",
                                                "source":  "职业技能",
                                                "template":  "mark_target_for_bonus",
                                                "config":  {
                                                               "markType":  "tracking",
                                                               "range":  6,
                                                               "consumeOn":  "until_triggered"
                                                           },
                                                "text":  "为目标施加追踪标记。"
                                            },
                        "hunter_camouflage":  {
                                                  "name":  "伪装",
                                                  "source":  "职业技能",
                                                  "template":  "self_buff",
                                                  "config":  {
                                                                 "block":  "1d6",
                                                                 "buffBasic":  2,
                                                                 "consumeOn":  "next_basic_attack"
                                                             },
                                                  "text":  "获得 1D6 格挡，并让下次普攻 +2。"
                                              },
                        "priest_holyfire":  {
                                                "name":  "神圣之火",
                                                "source":  "职业技能",
                                                "template":  "direct_damage",
                                                "config":  {
                                                               "damage":  "1d8",
                                                               "range":  5,
                                                               "target":  "enemy",
                                                               "spell":  true,
                                                               "apply":  {
                                                                             "burn":  1
                                                                         }
                                                           },
                                                "text":  "造成 1D8 法术伤害并附带点燃。"
                                            },
                        "priest_barrier":  {
                                               "name":  "光辉壁垒",
                                               "source":  "职业技能",
                                               "template":  "self_buff",
                                               "config":  {
                                                              "block":  "1d10",
                                                              "consumeOn":  "manual"
                                                          },
                                               "text":  "获得 1D10 格挡。"
                                           },
                        "priest_radiance":  {
                                                "name":  "圣光照耀",
                                                "source":  "职业技能",
                                                "template":  "self_buff",
                                                "config":  {
                                                               "heal":  "1d8",
                                                               "block":  "1d6",
                                                               "consumeOn":  "immediate"
                                                           },
                                                "text":  "恢复 1D8并获得 1D6格挡。"
                                            },
                        "shaman_thunderstorm":  {
                                                    "name":  "雷暴",
                                                    "source":  "职业技能",
                                                    "template":  "aoe",
                                                    "config":  {
                                                                   "damage":  "1d8",
                                                                   "range":  4,
                                                                   "radius":  1,
                                                                   "spell":  true
                                                               },
                                                    "text":  "对范围造成 1D8 法术伤害。"
                                                },
                        "shaman_stormstrike":  {
                                                   "name":  "风暴打击",
                                                   "source":  "职业技能",
                                                   "template":  "damage_roll_grant_card",
                                                   "config":  {
                                                                  "damage":  "1d6",
                                                                  "range":  1,
                                                                  "target":  "enemy",
                                                                  "procDie":  "1d6",
                                                                  "threshold":  3,
                                                                  "grantedCardKey":  "shaman_stormstrike",
                                                                  "grantedOrigin":  "职业技能",
                                                                  "refundBucket":  "class_or_guardian"
                                                              },
                                                   "text":  "造成1d6伤害，并投掷1d6，如结果大于3，则再次获得风暴打击，并可以再次使用。"
                                               },
                        "shaman_ancestral":  {
                                                 "name":  "先祖指引",
                                                 "source":  "职业技能",
                                                 "template":  "self_buff",
                                                 "config":  {
                                                                "heal":  "1d4",
                                                                "bonusDie":  "1d4",
                                                                "consumeOn":  "next_basic_attack"
                                                            },
                                                 "text":  "恢复 1D4，并让下次普攻额外造成 1D4。"
                                             },
                        "necro_deathcoil":  {
                                                "name":  "死亡缠绕",
                                                "source":  "职业技能",
                                                "template":  "direct_damage",
                                                "config":  {
                                                               "damage":  "1d8",
                                                               "range":  5,
                                                               "target":  "enemy",
                                                               "spell":  true
                                                           },
                                                "text":  "造成 1D8 法术伤害。"
                                            },
                        "necro_boneprison":  {
                                                 "name":  "骨牢",
                                                 "source":  "职业技能",
                                                 "template":  "direct_damage",
                                                 "config":  {
                                                                "damage":  "1d4",
                                                                "range":  4,
                                                                "target":  "enemy",
                                                                "spell":  true,
                                                                "apply":  {
                                                                              "slow":  1
                                                                          }
                                                            },
                                                 "text":  "造成 1D4 法术伤害并减速。"
                                             },
                        "necro_harvest":  {
                                              "name":  "灵魂收割",
                                              "source":  "职业技能",
                                              "template":  "bonus_if_target_marked",
                                              "config":  {
                                                             "baseDamage":  "1d10",
                                                             "range":  5,
                                                             "bonusDamage":  2,
                                                             "consumeMark":  false
                                                         },
                                              "text":  "若目标已被标记或诅咒，则额外造成 2 点伤害。"
                                          },
                        "lock_shadowbolt":  {
                                                "name":  "暗影箭",
                                                "source":  "职业技能",
                                                "template":  "direct_damage",
                                                "config":  {
                                                               "damage":  "1d10",
                                                               "range":  5,
                                                               "target":  "enemy",
                                                               "spell":  true
                                                           },
                                                "text":  "造成 1D10 法术伤害。"
                                            },
                        "lock_demonskin":  {
                                               "name":  "恶魔之肤",
                                               "source":  "职业技能",
                                               "template":  "self_buff",
                                               "config":  {
                                                              "block":  "1d8",
                                                              "consumeOn":  "manual"
                                                          },
                                               "text":  "获得 1D8 格挡。"
                                           },
                        "lock_agony":  {
                                           "name":  "痛楚诅咒",
                                           "source":  "职业技能",
                                           "template":  "direct_damage",
                                           "config":  {
                                                          "damage":  "1d4",
                                                          "range":  5,
                                                          "target":  "enemy",
                                                          "spell":  true,
                                                          "applyTemplate":  "dot_damage_over_time",
                                                          "applyConfig":  {
                                                                              "damagePerTick":  "1d4",
                                                                              "tickTiming":  "turn_start",
                                                                              "durationTurns":  3,
                                                                              "stackRule":  "refresh_duration"
                                                                          }
                                                      },
                                           "text":  "造成 1D4 伤害并附带持续伤害。"
                                       },
                        "sword_riposte":  {
                                              "name":  "反击架势",
                                              "source":  "职业技能",
                                              "template":  "self_buff",
                                              "config":  {
                                                             "block":  "",
                                                             "buffBasic":  0,
                                                             "consumeOn":  "until_triggered",
                                                             "dodgeNext":  true,
                                                             "counterUseTakenDamage":  true
                                                         },
                                              "text":  "格挡并反击"
                                          },
                        "sword_shadowstep":  {
                                                 "name":  "影踏",
                                                 "source":  "职业技能",
                                                 "template":  "teleport",
                                                 "config":  {
                                                                "range":  4,
                                                                "target":  "tile"
                                                            },
                                                 "text":  "位移到 4 格内空位。"
                                             },
                        "hammer_quake":  {
                                             "name":  "震地",
                                             "source":  "武器技能",
                                             "template":  "aoe",
                                             "config":  {
                                                            "damage":  "1d6",
                                                            "range":  2,
                                                            "radius":  1,
                                                            "spell":  false
                                                        },
                                             "text":  "对近距离范围造成 1D6 伤害。"
                                         },
                        "wand_shield":  {
                                            "name":  "奥术护盾",
                                            "source":  "武器技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "block":  "1d6",
                                                           "consumeOn":  "manual"
                                                       },
                                            "text":  "获得 1D6 格挡。"
                                        },
                        "twin_dash":  {
                                          "name":  "双刃突进",
                                          "source":  "武器技能",
                                          "template":  "dash_hit",
                                          "config":  {
                                                         "damage":  "1d6",
                                                         "range":  3,
                                                         "buffBasic":  1
                                                     },
                                          "text":  "冲锋并造成 1D6 伤害，下次普攻 +1。"
                                      },
                        "totem_barrier":  {
                                              "name":  "反击图腾",
                                              "source":  "武器技能",
                                              "template":  "self_buff",
                                              "config":  {
                                                             "block":  "1d6",
                                                             "consumeOn":  "until_triggered",
                                                             "counterUseTakenDamage":  true
                                                         },
                                              "text":  "获得 1D6 格挡，并反击受到的伤害。"
                                          },
                        "acc_blood_surge":  {
                                                "name":  "沸血",
                                                "source":  "饰品技能",
                                                "template":  "self_buff",
                                                "config":  {
                                                               "buffBasic":  0,
                                                               "heal":  "",
                                                               "consumeOn":  "until_triggered",
                                                               "healOnDamaged":  "1d6"
                                                           },
                                                "text":  "受伤后回复1d6"
                                            },
                        "acc_time_echo":  {
                                              "name":  "时间回响",
                                              "source":  "饰品技能",
                                              "template":  "self_buff",
                                              "config":  {
                                                             "block":  "1d6",
                                                             "consumeOn":  "manual"
                                                         },
                                              "text":  "获得 1D6 格挡。"
                                          },
                        "acc_void_blast":  {
                                               "name":  "虚空传送",
                                               "source":  "饰品技能",
                                               "template":  "teleport",
                                               "config":  {
                                                              "range":  4,
                                                              "target":  "tile"
                                                          },
                                               "text":  "位移4单位"
                                           },
                        "acc_holy_guard":  {
                                               "name":  "圣光守护",
                                               "source":  "饰品技能",
                                               "template":  "self_buff",
                                               "config":  {
                                                              "block":  "1d8",
                                                              "heal":  "1d4",
                                                              "consumeOn":  "immediate"
                                                          },
                                               "text":  "恢复 1D4，并获得 1D8 格挡。"
                                           },
                        "warrior_passive":  {
                                                "name":  "战士被动",
                                                "template":  "threshold_reward_once_per_turn",
                                                "config":  {
                                                               "thresholdType":  "effective_damage",
                                                               "thresholdValue":  4,
                                                               "rewardList":  [
                                                                                  {
                                                                                      "type":  "gain_block",
                                                                                      "value":  2
                                                                                  }
                                                                              ],
                                                               "oncePerTurn":  true
                                                           },
                                                "text":  ""
                                            },
                        "mage_passive":  {
                                             "name":  "狂野施法",
                                             "template":  "threshold_reward_once_per_turn",
                                             "config":  {
                                                            "thresholdType":  "dealt_damage",
                                                            "thresholdValue":  9,
                                                            "rewardList":  [
                                                                               {
                                                                                   "type":  "extra_class_card_use",
                                                                                   "value":  "1",
                                                                                   "cardKey":  "",
                                                                                   "origin":  ""
                                                                               }
                                                                           ],
                                                            "oncePerTurn":  true,
                                                            "threshold":  9,
                                                            "damageThreshold":  9
                                                        },
                                             "text":  "单回合内造成至少10点伤害后，可额外使用一次职业技能。"
                                         },
                        "rogue_passive":  {
                                              "name":  "盗贼被动",
                                              "template":  "control_bonus_on_basic_attack",
                                              "config":  {
                                                             "requiredTargetState":  [
                                                                                         "slow",
                                                                                         "disarm",
                                                                                         "sheep"
                                                                                     ],
                                                             "bonusDamage":  "1d6",
                                                             "attackType":  "basic_attack"
                                                         },
                                              "text":  "受控制目标会额外受到普通攻击伤害"
                                          },
                        "priest_passive":  {
                                               "name":  "圣光回响",
                                               "template":  "threshold_reward_once_per_turn",
                                               "config":  {
                                                              "thresholdType":  "damage_taken",
                                                              "thresholdValue":  4,
                                                              "rewardList":  [
                                                                                 {
                                                                                     "type":  "heal",
                                                                                     "value":  "1d4",
                                                                                     "cardKey":  "",
                                                                                     "origin":  ""
                                                                                 }
                                                                             ],
                                                              "oncePerTurn":  true,
                                                              "threshold":  4,
                                                              "damageThreshold":  4
                                                          },
                                               "text":  "受到4点伤害后，会回复1D4"
                                           },
                        "shaman_passive":  {
                                               "name":  "萨满被动",
                                               "template":  "weapon_basic_inflicts_status",
                                               "config":  {
                                                              "statusType":  "burn",
                                                              "statusValue":  "1d4",
                                                              "durationTurns":  2
                                                          },
                                               "text":  ""
                                           },
                        "necro_passive":  {
                                              "name":  "死灵法师被动",
                                              "template":  "activated_token_scaling_block",
                                              "config":  {
                                                             "tokenType":  "undead_token",
                                                             "ratio":  0.5,
                                                             "rounding":  "ceil",
                                                             "rewardType":  "gain_block_each_turn"
                                                         }
                                          },
                        "warlock_passive":  {
                                                "name":  "术士被动",
                                                "template":  "life_for_card_draw_once_per_turn",
                                                "config":  {
                                                               "lifeCost":  4,
                                                               "drawCount":  1,
                                                               "oncePerTurn":  true
                                                           },
                                                "text":  ""
                                            },
                        "swordsman_passive":  {
                                                  "name":  "剑客被动",
                                                  "template":  "skip_basic_attack_then_gain_bonus",
                                                  "config":  {
                                                                 "checkAt":  "end_of_turn",
                                                                 "bonusType":  "flat_damage",
                                                                 "bonusValue":  5,
                                                                 "consumeOn":  "next_basic_attack_or_class_skill"
                                                             },
                                                  "text":  ""
                                              },
                        "hunter_passive":  {
                                               "name":  "游击战术",
                                               "template":  "threshold_reward_once_per_turn",
                                               "config":  {
                                                              "thresholdType":  "distance_moved",
                                                              "thresholdValue":  4,
                                                              "rewardList":  [
                                                                                 {
                                                                                     "type":  "buff_basic",
                                                                                     "value":  2,
                                                                                     "cardKey":  "",
                                                                                     "origin":  ""
                                                                                 }
                                                                             ],
                                                              "oncePerTurn":  true,
                                                              "threshold":  4,
                                                              "damageThreshold":  4
                                                          },
                                               "text":  "每回合至少移动4格后，获得2点普通攻击加成"
                                           },
                        "example_floor_trap":  {
                                                   "name":  "地雷陷阱",
                                                   "source":  "职业技能",
                                                   "template":  "create_map_token",
                                                   "config":  {
                                                                  "range":  3,
                                                                  "tokenName":  "地雷",
                                                                  "tokenKind":  "trap_once_negative",
                                                                  "durationTurns":  3,
                                                                  "damage":  "1d6",
                                                                  "insertCardKey":  "",
                                                                  "insertCount":  1,
                                                                  "attackRange":  4,
                                                                  "controlType":  "slow",
                                                                  "controlDuration":  1,
                                                                  "blocking":  false
                                                              },
                                                   "text":  "在地图上放置一个一次性陷阱，敌人进入时会触发。"
                                               },
                        "shaman_avatar":  {
                                              "name":  "化身",
                                              "source":  "职业技能",
                                              "template":  "transform_basic_attack",
                                              "config":  {
                                                             "attackName":  "化身普攻",
                                                             "damage":  "weapon_damage",
                                                             "range":  8,
                                                             "straight":  false,
                                                             "consumeOn":  "end_of_turn",
                                                             "block":  "1d6",
                                                             "apply":  {

                                                                       },
                                                             "applyTemplate":  "dot_damage_over_time",
                                                             "applyConfig":  {
                                                                                 "damagePerTick":  "1d6",
                                                                                 "durationTurns":  2,
                                                                                 "stackRule":  "stack"
                                                                             },
                                                             "durationTurns":  "2"
                                                         },
                                              "text":  "变身，普通攻击变成强力远程攻击, 并附带叠加1d6伤害，同时获得1d6格挡，持续2回合"
                                          },
                        "lock_corrode":  {
                                             "name":  "腐蚀",
                                             "source":  "职业技能",
                                             "template":  "direct_damage",
                                             "config":  {
                                                            "damage":  "1d6",
                                                            "range":  6,
                                                            "target":  "enemy",
                                                            "spell":  true,
                                                            "applyTemplate":  "dot_damage_over_time",
                                                            "applyConfig":  {
                                                                                "damagePerTick":  "1d6",
                                                                                "tickTiming":  "turn_start",
                                                                                "durationTurns":  3,
                                                                                "stackRule":  "refresh_duration"
                                                                            }
                                                        },
                                             "text":  "1D6伤害并附带 DOT持续3回合每回合1D6。"
                                         },
                        "武僧_passive":  {
                                           "name":  "连击",
                                           "template":  "threshold_reward_once_per_turn",
                                           "config":  {
                                                          "thresholdType":  "dealt_damage",
                                                          "thresholdValue":  4,
                                                          "rewardList":  [
                                                                             {
                                                                                 "type":  "extra_basic_cap",
                                                                                 "value":  "1",
                                                                                 "cardKey":  "",
                                                                                 "origin":  ""
                                                                             }
                                                                         ],
                                                          "oncePerTurn":  true,
                                                          "threshold":  4,
                                                          "damageThreshold":  4
                                                      },
                                           "text":  "造成至少4点伤害后，可以再次普通攻击"
                                       },
                        "武僧_strike":  {
                                          "name":  "点穴",
                                          "source":  "职业技能",
                                          "template":  "direct_damage",
                                          "config":  {
                                                         "damage":  "1d6",
                                                         "range":  1,
                                                         "target":  "enemy",
                                                         "spell":  true,
                                                         "straight":  false,
                                                         "applyTemplate":  "control_status",
                                                         "applyConfig":  {
                                                                             "isControlTag":  true
                                                                         }
                                                     },
                                          "text":  "点穴目标，造成1d6伤害并眩晕一回合"
                                      },
                        "黑虎掏心":  {
                                     "name":  "黑虎掏心",
                                     "source":  "职业技能",
                                     "template":  "direct_damage",
                                     "config":  {
                                                    "damage":  "2d8",
                                                    "range":  1,
                                                    "target":  "enemy",
                                                    "spell":  false,
                                                    "straight":  false,
                                                    "applyTemplate":  "dot_damage_over_time",
                                                    "applyConfig":  {
                                                                        "damagePerTick":  "1d6",
                                                                        "durationTurns":  "2"
                                                                    }
                                                },
                                     "text":  "一次猛烈的攻击，附带高额的流血效果。造成2d8伤害并且每回合流血1d6，持续2回合",
                                     "negativeOnDraw":  false
                                 },
                        "降龙十八掌":  {
                                      "name":  "降龙十八掌",
                                      "source":  "职业技能",
                                      "template":  "direct_damage",
                                      "config":  {
                                                     "damage":  "18x(0|1)",
                                                     "range":  1,
                                                     "target":  "enemy",
                                                     "spell":  false,
                                                     "straight":  false,
                                                     "applyTemplate":  "control_status",
                                                     "applyConfig":  {
                                                                         "controlType":  "stun"
                                                                     }
                                                 },
                                      "text":  "造成18次伤害，并且将目标击晕",
                                      "negativeOnDraw":  false
                                  },
                        "口袋炮塔":  {
                                     "name":  "口袋炮塔",
                                     "source":  "饰品技能",
                                     "template":  "create_map_token",
                                     "config":  {
                                                    "range":  10,
                                                    "tokenName":  "炮塔",
                                                    "tokenKind":  "auto_turret",
                                                    "durationTurns":  "3",
                                                    "damage":  "1d6",
                                                    "insertCardKey":  "",
                                                    "insertCount":  0,
                                                    "attackRange":  5,
                                                    "controlType":  "",
                                                    "controlDuration":  0,
                                                    "blocking":  true
                                                },
                                     "text":  "",
                                     "negativeOnDraw":  false
                                 },
                        "sword_parry":  {
                                            "name":  "见切",
                                            "source":  "职业技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "block":  "1d6",
                                                           "consumeOn":  "until_triggered",
                                                           "dodgeNext":  true
                                                       },
                                            "text":  "闪避下一次受到的攻击，并获得1d6格挡"
                                        },
                        "warrior_charge":  {
                                               "name":  "冲锋",
                                               "source":  "职业技能",
                                               "template":  "dash_hit",
                                               "config":  {
                                                              "damage":  "1d6",
                                                              "range":  6,
                                                              "buffBasic":  2,
                                                              "target":  "enemy"
                                                          },
                                               "text":  "冲向6格内的目标并造成 1D6 伤害；下次普攻 +2。"
                                           },
                        "warrior_rage":  {
                                             "name":  "暴怒/强力射击",
                                             "source":  "职业技能",
                                             "template":  "dual_mode",
                                             "config":  {
                                                            "modes":  [
                                                                          {
                                                                              "name":  "暴怒",
                                                                              "templateRef":  "direct_damage",
                                                                              "buffBasic":  0,
                                                                              "consumeOn":  "next_basic_attack",
                                                                              "damage":  "2D8",
                                                                              "range":  1
                                                                          },
                                                                          {
                                                                              "name":  "强力射击",
                                                                              "templateRef":  "self_buff",
                                                                              "buffBasic":  8,
                                                                              "consumeOn":  "next_basic_attack",
                                                                              "range":  0
                                                                          }
                                                                      ]
                                                        },
                                             "text":  "双模式增益技能。近战情况下造成2D8伤害，远程则是令下一次普通攻击额外造成8伤害。"
                                         },
                        "warrior_throw":  {
                                              "name":  "二连斩",
                                              "source":  "职业技能",
                                              "template":  "self_buff",
                                              "config":  {
                                                             "buffBasic":  0,
                                                             "bonusDie":  "",
                                                             "heal":  "",
                                                             "block":  "",
                                                             "dodgeNext":  false,
                                                             "counterDamage":  "",
                                                             "counterUseTakenDamage":  false,
                                                             "classSkillCapDelta":  0,
                                                             "reactiveMoveTrigger":  "",
                                                             "reactiveMoveMaxDistance":  0,
                                                             "healOnDamaged":  "",
                                                             "disarmAttackerOnHit":  0,
                                                             "consumeOn":  "next_basic_attack",
                                                             "durationTurns":  null,
                                                             "basicAttackCapDelta":  1
                                                         },
                                              "text":  "本回合额外普通攻击一次"
                                          },
                        "warrior_execute":  {
                                                "name":  "割裂",
                                                "source":  "职业技能",
                                                "template":  "direct_damage",
                                                "config":  {
                                                               "damage":  "1d10",
                                                               "range":  1,
                                                               "target":  "enemy",
                                                               "spell":  true,
                                                               "straight":  false,
                                                               "applyTemplate":  "dot_damage_over_time",
                                                               "applyConfig":  {
                                                                                   "damagePerTick":  "10x(0|1)"
                                                                               }
                                                           },
                                                "text":  "一次恐怖的攻击，有可能撕裂目标，造成1D10伤害，并有可能在下一回合最多造成10次流血，每次1点伤害，持续一回合"
                                            },
                        "warrior_hamstring":  {
                                                  "name":  "断筋",
                                                  "source":  "职业技能",
                                                  "template":  "direct_damage",
                                                  "config":  {
                                                                 "damage":  "1d4",
                                                                 "range":  1,
                                                                 "target":  "enemy",
                                                                 "apply":  {
                                                                               "slow":  1
                                                                           },
                                                                 "applyTemplate":  "slow_status",
                                                                 "applyConfig":  {
                                                                                     "moveMultiplier":  0.5,
                                                                                     "durationTurns":  "1"
                                                                                 },
                                                                 "spell":  true
                                                             },
                                                  "text":  "1D4 伤害并减速1回合。"
                                              },
                        "mage_fireball":  {
                                              "name":  "火球",
                                              "source":  "职业技能",
                                              "template":  "direct_damage",
                                              "config":  {
                                                             "damage":  "2d8",
                                                             "range":  6,
                                                             "target":  "enemy",
                                                             "spell":  true,
                                                             "apply":  {
                                                                           "burn":  2
                                                                       },
                                                             "applyTemplate":  "dot_damage_over_time",
                                                             "applyConfig":  {
                                                                                 "damagePerTick":  "1D6"
                                                                             },
                                                             "straight":  true
                                                         },
                                              "text":  "一颗巨大的直线飞出的火球，造成2D8 伤害并点燃1回合，造成1D6点燃伤害。"
                                          },
                        "mage_nova":  {
                                          "name":  "冰霜新星",
                                          "source":  "职业技能",
                                          "template":  "aoe",
                                          "config":  {
                                                         "damage":  "2d4",
                                                         "range":  2,
                                                         "radius":  2,
                                                         "spell":  true,
                                                         "apply":  {
                                                                       "slow":  1
                                                                   },
                                                         "applyTemplate":  "control_status",
                                                         "applyConfig":  {
                                                                             "moveMultiplier":  0.5,
                                                                             "controlType":  "root",
                                                                             "isControlTag":  true
                                                                         }
                                                     },
                                          "text":  "范围2的 2d4 AOE伤害并冻住目标一回合。"
                                      },
                        "mage_blink":  {
                                           "name":  "闪现",
                                           "source":  "职业技能",
                                           "template":  "teleport",
                                           "config":  {
                                                          "range":  5,
                                                          "target":  "tile"
                                                      },
                                           "text":  "传送 5 格。"
                                       },
                        "mage_phase":  {
                                           "name":  "相位转移",
                                           "source":  "职业技能",
                                           "template":  "self_buff",
                                           "config":  {
                                                          "buffBasic":  0,
                                                          "bonusDie":  "",
                                                          "heal":  "1d6",
                                                          "block":  "",
                                                          "dodgeNext":  false,
                                                          "counterDamage":  "",
                                                          "counterUseTakenDamage":  false,
                                                          "classSkillCapDelta":  0,
                                                          "reactiveMoveTrigger":  "on_targeted",
                                                          "reactiveMoveMaxDistance":  2,
                                                          "healOnDamaged":  "",
                                                          "disarmAttackerOnHit":  0,
                                                          "consumeOn":  "until_triggered",
                                                          "durationTurns":  null,
                                                          "basicAttackCapDelta":  0
                                                      },
                                           "text":  "回复1D6并在被攻击后随机传送2格内且闪避该次攻击"
                                       },
                        "rogue_ambush":  {
                                             "name":  "偷袭",
                                             "source":  "职业技能",
                                             "template":  "direct_damage",
                                             "config":  {
                                                            "damage":  "1d6",
                                                            "range":  2,
                                                            "target":  "enemy",
                                                            "conditionalBonus":  {
                                                                                     "condition":  "moved_this_turn",
                                                                                     "bonusDamage":  "1d4"
                                                                                 },
                                                            "applyTemplate":  "control_status",
                                                            "applyConfig":  {
                                                                                "isControlTag":  true
                                                                            },
                                                            "spell":  true
                                                        },
                                             "text":  "跨过暗影，偷袭目标造成1D6伤害，并造成眩晕。"
                                         },
                        "rogue_disarm":  {
                                             "name":  "缴械",
                                             "source":  "职业技能",
                                             "template":  "direct_damage",
                                             "config":  {
                                                            "damage":  "1d6",
                                                            "range":  1,
                                                            "target":  "enemy",
                                                            "apply":  {
                                                                          "disarm":  1
                                                                      },
                                                            "applyTemplate":  "control_status",
                                                            "applyConfig":  {
                                                                                "controlType":  "disarm",
                                                                                "isControlTag":  true
                                                                            },
                                                            "spell":  true
                                                        },
                                             "text":  "造成 1D6 并缴械。"
                                         },
                        "rogue_assassinate":  {
                                                  "name":  "刺杀",
                                                  "source":  "职业技能",
                                                  "template":  "direct_damage",
                                                  "config":  {
                                                                 "damage":  "2d8",
                                                                 "range":  1,
                                                                 "target":  "enemy",
                                                                 "conditionalBonus":  {
                                                                                          "condition":  "target_controlled",
                                                                                          "bonusFlat":  2
                                                                                      },
                                                                 "applyTemplate":  "control_status",
                                                                 "applyConfig":  {
                                                                                     "controlType":  "root",
                                                                                     "isControlTag":  true
                                                                                 }
                                                             },
                                                  "text":  "尝试终结目标，造成大量伤害2D8并使目标禁锢1回合。"
                                              },
                        "rogue_step":  {
                                           "name":  "瞬步",
                                           "source":  "职业技能",
                                           "template":  "teleport",
                                           "config":  {
                                                          "range":  5,
                                                          "target":  "tile"
                                                      },
                                           "text":  "传送 5格。"
                                       },
                        "rogue_bloodmix":  {
                                               "name":  "血腥合剂",
                                               "source":  "职业技能",
                                               "template":  "self_buff",
                                               "config":  {
                                                              "heal":  "1d6",
                                                              "bonusDie":  "1d6",
                                                              "consumeOn":  "next_basic_attack"
                                                          },
                                               "text":  "恢复1D6并强化下次普攻，额外造成1D6。"
                                           },
                        "rogue_feast":  {
                                            "name":  "杀戮盛宴",
                                            "source":  "职业技能",
                                            "template":  "direct_damage",
                                            "config":  {
                                                           "damage":  "15x(0|2)",
                                                           "range":  1,
                                                           "target":  "enemy",
                                                           "conditionalBonus":  {
                                                                                    "condition":  "target_hp_lte",
                                                                                    "threshold":  15,
                                                                                    "bonusDamage":  "1d6"
                                                                                },
                                                           "spell":  true
                                                       },
                                            "text":  "恐怖的高伤害技能最高可能造成30点伤害"
                                        },
                        "priest_pain":  {
                                            "name":  "痛苦",
                                            "source":  "职业技能",
                                            "template":  "direct_damage",
                                            "config":  {
                                                           "damage":  "1d6",
                                                           "range":  5,
                                                           "target":  "enemy",
                                                           "spell":  true,
                                                           "straight":  false,
                                                           "applyTemplate":  "dot_damage_over_time",
                                                           "applyConfig":  {
                                                                               "damagePerTick":  "1d6",
                                                                               "durationTurns":  "2"
                                                                           }
                                                       },
                                            "text":  "造成1D6伤害并额外造成2回合每回合1D6"
                                        },
                        "priest_smite":  {
                                             "name":  "惩戒化身",
                                             "source":  "职业技能",
                                             "template":  "transform_basic_attack",
                                             "config":  {
                                                            "attackName":  "变身普攻",
                                                            "damage":  "8D2",
                                                            "range":  6,
                                                            "straight":  false,
                                                            "consumeOn":  "end_of_turn",
                                                            "durationTurns":  2,
                                                            "block":  "8",
                                                            "apply":  {

                                                                      }
                                                        },
                                             "text":  "化身成纯粹的惩戒使者，普通攻击造成8D2且变成距离为6的远程攻击，同时获得8格挡。"
                                         },
                        "priest_heal":  {
                                            "name":  "快速治疗",
                                            "source":  "职业技能",
                                            "template":  "self_buff",
                                            "config":  {
                                                           "heal":  "1d8",
                                                           "consumeOn":  "immediate"
                                                       },
                                            "text":  "恢复 1D8。"
                                        },
                        "necro_bomb":  {
                                           "name":  "埋骨炸弹",
                                           "source":  "职业技能",
                                           "template":  "insert_negative_card_into_target_deck",
                                           "config":  {
                                                          "insertCardKey":  "necro_bomb_token",
                                                          "insertCount":  2,
                                                          "triggerCondition":  "on_hit",
                                                          "shuffleIntoDeck":  true,
                                                          "range":  6
                                                      },
                                           "text":  "命中后向对方牌库塞入炸弹牌。"
                                       },
                        "necro_burst":  {
                                            "name":  "亡灵爆发",
                                            "source":  "职业技能",
                                            "template":  "consume_all_activated_tokens_for_burst",
                                            "config":  {
                                                           "baseDamage":  "2d4",
                                                           "range":  5,
                                                           "bonusByTokenType":  {
                                                                                    "skeleton":  "1d4",
                                                                                    "bone_dragon":  "1d8"
                                                                                }
                                                       },
                                            "text":  "消耗召唤物对目标造成爆发伤害，基础造成2D4伤害，额外每有一个骷髅造成1D4，每有一头骨龙造成1D8。"
                                        },
                        "lock_metamorphosis":  {
                                                   "name":  "恶魔变身",
                                                   "source":  "职业技能",
                                                   "template":  "transform_basic_attack",
                                                   "config":  {
                                                                  "attackName":  "恶魔烈爪",
                                                                  "damage":  "1d10",
                                                                  "range":  5,
                                                                  "straight":  true,
                                                                  "consumeOn":  "next_basic_attack",
                                                                  "block":  "1d6",
                                                                  "apply":  {
                                                                                "burn":  1
                                                                            },
                                                                  "applyTemplate":  "dot_damage_over_time",
                                                                  "applyConfig":  {
                                                                                      "damagePerTick":  "1D6"
                                                                                  },
                                                                  "durationTurns":  "3"
                                                              },
                                                   "text":  "变身后普通攻击变为远程直线攻击，并附带点燃。"
                                               },
                        "lock_soulfire":  {
                                              "name":  "灵魂火",
                                              "source":  "职业技能",
                                              "template":  "direct_damage",
                                              "config":  {
                                                             "damage":  "2d8",
                                                             "range":  3,
                                                             "target":  "enemy",
                                                             "spell":  true
                                                         },
                                              "text":  "造成 2D8 法术伤害。"
                                          },
                        "doom":  {
                                     "name":  "doom",
                                     "source":  "负面牌",
                                     "template":  "negative_direct_damage",
                                     "config":  {
                                                    "damage":  "2d10",
                                                    "showInPreview":  true
                                                },
                                     "text":  "厄运降临，受到2D10伤害",
                                     "negativeOnDraw":  true
                                 },
                        "lock_nightdash":  {
                                               "name":  "暗夜冲刺",
                                               "source":  "职业技能",
                                               "template":  "dash_hit",
                                               "config":  {
                                                              "damage":  "1d6",
                                                              "range":  5
                                                          },
                                               "text":  "冲向目标并造成 1D6 伤害。"
                                           },
                        "sword_read":  {
                                           "name":  "看破",
                                           "source":  "职业技能",
                                           "template":  "mark_target_for_bonus",
                                           "config":  {
                                                          "markType":  "normal",
                                                          "range":  4,
                                                          "consumeOn":  "until_triggered",
                                                          "applyTemplate":  "slow_status",
                                                          "applyConfig":  {
                                                                              "moveMultiplier":  0.5
                                                                          }
                                                      },
                                           "text":  "标记一名目标，并减速"
                                       },
                        "sword_finish":  {
                                             "name":  "燕返",
                                             "source":  "职业技能",
                                             "template":  "bonus_if_target_marked",
                                             "config":  {
                                                            "baseDamage":  "2d8",
                                                            "range":  4,
                                                            "bonusDamage":  "10",
                                                            "consumeMark":  true
                                                        },
                                             "text":  "若目标被标记，则造成更高伤害并移除标记。"
                                         },
                        "sword_flash":  {
                                            "name":  "一闪",
                                            "source":  "职业技能",
                                            "template":  "dash_hit",
                                            "config":  {
                                                           "damage":  "1d6",
                                                           "range":  4
                                                       },
                                            "text":  "冲锋并造成 1D6 伤害。"
                                        },
                        "hunter_mark":  {
                                            "name":  "猎人印记",
                                            "source":  "职业技能",
                                            "template":  "mark_target_for_bonus",
                                            "config":  {
                                                           "markType":  "normal",
                                                           "range":  8,
                                                           "consumeOn":  "never",
                                                           "applyTemplate":  "dot_damage_over_time",
                                                           "applyConfig":  {
                                                                               "damagePerTick":  "1d4",
                                                                               "durationTurns":  "10"
                                                                           }
                                                       },
                                            "text":  "永久标记一名目标，并在10回合内每回合造成1d4."
                                        },
                        "hunter_kill":  {
                                            "name":  "狙击",
                                            "source":  "职业技能",
                                            "template":  "bonus_if_target_marked",
                                            "config":  {
                                                           "baseDamage":  "1d12",
                                                           "range":  5,
                                                           "bonusDamage":  "1d14",
                                                           "consumeMark":  true
                                                       },
                                            "text":  "对被标记目标造成高额伤害。"
                                        },
                        "hunter_disengage":  {
                                                 "name":  "逃脱",
                                                 "source":  "职业技能",
                                                 "template":  "teleport",
                                                 "config":  {
                                                                "range":  4,
                                                                "target":  "tile"
                                                            },
                                                 "text":  "位移到 3 格内空位。"
                                             },
                        "飞龙在天":  {
                                     "name":  "飞龙在天",
                                     "source":  "职业技能",
                                     "template":  "dash_hit",
                                     "config":  {
                                                    "damage":  "1d6",
                                                    "range":  6,
                                                    "gainBlock":  "",
                                                    "buffBasic":  3
                                                },
                                     "text":  "冲向目标并造成1d6伤害，并且下一次普通攻击额外造成3点伤害",
                                     "negativeOnDraw":  false
                                 },
                        "闪电反射":  {
                                     "name":  "闪电反射",
                                     "source":  "职业技能",
                                     "template":  "self_buff",
                                     "config":  {
                                                    "buffBasic":  0,
                                                    "bonusDie":  "",
                                                    "heal":  "",
                                                    "block":  "",
                                                    "dodgeNext":  true,
                                                    "counterDamage":  "",
                                                    "counterUseTakenDamage":  true,
                                                    "classSkillCapDelta":  0,
                                                    "reactiveMoveTrigger":  "on_targeted",
                                                    "reactiveMoveMaxDistance":  1,
                                                    "healOnDamaged":  "",
                                                    "disarmAttackerOnHit":  1,
                                                    "consumeOn":  "until_triggered",
                                                    "durationTurns":  null,
                                                    "basicAttackCapDelta":  0
                                                },
                                     "text":  "被攻击后迅速闪避，缴械目标并还击。",
                                     "negativeOnDraw":  false
                                 }
                    },
    "professions":  {
                        "warrior":  {
                                        "key":  "warrior",
                                        "name":  "战士",
                                        "hp":  65,
                                        "move":  5,
                                        "movePreset":  "melee",
                                        "passives":  {
                                                         "warrior_passive":  {
                                                                                 "name":  "战士被动",
                                                                                 "template":  "threshold_reward_once_per_turn",
                                                                                 "config":  {
                                                                                                "thresholdType":  "effective_damage",
                                                                                                "thresholdValue":  4,
                                                                                                "rewardList":  [
                                                                                                                   {
                                                                                                                       "type":  "gain_block",
                                                                                                                       "value":  2
                                                                                                                   }
                                                                                                               ],
                                                                                                "oncePerTurn":  true
                                                                                            }
                                                                             }
                                                     },
                                        "cards":  {
                                                      "warrior_charge":  {
                                                                             "name":  "冲锋",
                                                                             "source":  "职业技能",
                                                                             "template":  "dash_hit",
                                                                             "config":  {
                                                                                            "damage":  "1d6",
                                                                                            "range":  6,
                                                                                            "buffBasic":  2,
                                                                                            "target":  "enemy"
                                                                                        },
                                                                             "text":  "冲向6格内的目标并造成 1D6 伤害；下次普攻 +2。"
                                                                         },
                                                      "warrior_rage":  {
                                                                           "name":  "暴怒/强力射击",
                                                                           "source":  "职业技能",
                                                                           "template":  "dual_mode",
                                                                           "config":  {
                                                                                          "modes":  [
                                                                                                        {
                                                                                                            "name":  "暴怒",
                                                                                                            "templateRef":  "direct_damage",
                                                                                                            "buffBasic":  0,
                                                                                                            "consumeOn":  "next_basic_attack",
                                                                                                            "damage":  "2D8",
                                                                                                            "range":  1
                                                                                                        },
                                                                                                        {
                                                                                                            "name":  "强力射击",
                                                                                                            "templateRef":  "self_buff",
                                                                                                            "buffBasic":  8,
                                                                                                            "consumeOn":  "next_basic_attack",
                                                                                                            "range":  0
                                                                                                        }
                                                                                                    ]
                                                                                      },
                                                                           "text":  "双模式增益技能。近战情况下造成2D8伤害，远程则是令下一次普通攻击额外造成8伤害。"
                                                                       },
                                                      "warrior_throw":  {
                                                                            "name":  "二连斩",
                                                                            "source":  "职业技能",
                                                                            "template":  "self_buff",
                                                                            "config":  {
                                                                                           "buffBasic":  0,
                                                                                           "bonusDie":  "",
                                                                                           "heal":  "",
                                                                                           "block":  "",
                                                                                           "dodgeNext":  false,
                                                                                           "counterDamage":  "",
                                                                                           "counterUseTakenDamage":  false,
                                                                                           "classSkillCapDelta":  0,
                                                                                           "reactiveMoveTrigger":  "",
                                                                                           "reactiveMoveMaxDistance":  0,
                                                                                           "healOnDamaged":  "",
                                                                                           "disarmAttackerOnHit":  0,
                                                                                           "consumeOn":  "next_basic_attack",
                                                                                           "durationTurns":  null,
                                                                                           "basicAttackCapDelta":  1
                                                                                       },
                                                                            "text":  "本回合额外普通攻击一次"
                                                                        },
                                                      "warrior_execute":  {
                                                                              "name":  "割裂",
                                                                              "source":  "职业技能",
                                                                              "template":  "direct_damage",
                                                                              "config":  {
                                                                                             "damage":  "1d10",
                                                                                             "range":  1,
                                                                                             "target":  "enemy",
                                                                                             "spell":  true,
                                                                                             "straight":  false,
                                                                                             "applyTemplate":  "dot_damage_over_time",
                                                                                             "applyConfig":  {
                                                                                                                 "damagePerTick":  "10x(0|1)"
                                                                                                             }
                                                                                         },
                                                                              "text":  "一次恐怖的攻击，有可能撕裂目标，造成1D10伤害，并有可能在下一回合最多造成10次流血，每次1点伤害，持续一回合"
                                                                          },
                                                      "warrior_hamstring":  {
                                                                                "name":  "断筋",
                                                                                "source":  "职业技能",
                                                                                "template":  "direct_damage",
                                                                                "config":  {
                                                                                               "damage":  "1d4",
                                                                                               "range":  1,
                                                                                               "target":  "enemy",
                                                                                               "apply":  {
                                                                                                             "slow":  1
                                                                                                         },
                                                                                               "applyTemplate":  "slow_status",
                                                                                               "applyConfig":  {
                                                                                                                   "moveMultiplier":  0.5,
                                                                                                                   "durationTurns":  "1"
                                                                                                               },
                                                                                               "spell":  true
                                                                                           },
                                                                                "text":  "1D4 伤害并减速1回合。"
                                                                            }
                                                  },
                                        "deckCounts":  {
                                                           "warrior_charge":  1,
                                                           "warrior_rage":  1,
                                                           "warrior_throw":  1,
                                                           "warrior_execute":  1,
                                                           "warrior_hamstring":  1
                                                       }
                                    },
                        "mage":  {
                                     "key":  "mage",
                                     "name":  "法师",
                                     "hp":  50,
                                     "move":  4,
                                     "movePreset":  "ranged",
                                     "passives":  {
                                                      "mage_passive":  {
                                                                           "name":  "狂野施法",
                                                                           "template":  "threshold_reward_once_per_turn",
                                                                           "config":  {
                                                                                          "thresholdType":  "dealt_damage",
                                                                                          "thresholdValue":  9,
                                                                                          "rewardList":  [
                                                                                                             {
                                                                                                                 "type":  "extra_class_card_use",
                                                                                                                 "value":  "1",
                                                                                                                 "cardKey":  "",
                                                                                                                 "origin":  ""
                                                                                                             }
                                                                                                         ],
                                                                                          "oncePerTurn":  true,
                                                                                          "threshold":  9,
                                                                                          "damageThreshold":  9
                                                                                      },
                                                                           "text":  "单回合内造成至少10点伤害后，可额外使用一次职业技能。"
                                                                       }
                                                  },
                                     "cards":  {
                                                   "mage_fireball":  {
                                                                         "name":  "火球",
                                                                         "source":  "职业技能",
                                                                         "template":  "direct_damage",
                                                                         "config":  {
                                                                                        "damage":  "2d8",
                                                                                        "range":  6,
                                                                                        "target":  "enemy",
                                                                                        "spell":  true,
                                                                                        "apply":  {
                                                                                                      "burn":  2
                                                                                                  },
                                                                                        "applyTemplate":  "dot_damage_over_time",
                                                                                        "applyConfig":  {
                                                                                                            "damagePerTick":  "1D6"
                                                                                                        },
                                                                                        "straight":  true
                                                                                    },
                                                                         "text":  "一颗巨大的直线飞出的火球，造成2D8 伤害并点燃1回合，造成1D6点燃伤害。"
                                                                     },
                                                   "mage_nova":  {
                                                                     "name":  "冰霜新星",
                                                                     "source":  "职业技能",
                                                                     "template":  "aoe",
                                                                     "config":  {
                                                                                    "damage":  "2d4",
                                                                                    "range":  2,
                                                                                    "radius":  2,
                                                                                    "spell":  true,
                                                                                    "apply":  {
                                                                                                  "slow":  1
                                                                                              },
                                                                                    "applyTemplate":  "control_status",
                                                                                    "applyConfig":  {
                                                                                                        "moveMultiplier":  0.5,
                                                                                                        "controlType":  "root",
                                                                                                        "isControlTag":  true
                                                                                                    }
                                                                                },
                                                                     "text":  "范围2的 2d4 AOE伤害并冻住目标一回合。"
                                                                 },
                                                   "mage_blink":  {
                                                                      "name":  "闪现",
                                                                      "source":  "职业技能",
                                                                      "template":  "teleport",
                                                                      "config":  {
                                                                                     "range":  5,
                                                                                     "target":  "tile"
                                                                                 },
                                                                      "text":  "传送 5 格。"
                                                                  },
                                                   "mage_lightning":  {
                                                                          "name":  "雷击",
                                                                          "source":  "职业技能",
                                                                          "template":  "direct_damage",
                                                                          "config":  {
                                                                                         "damage":  "1d12+4",
                                                                                         "range":  5,
                                                                                         "target":  "enemy",
                                                                                         "spell":  true
                                                                                     },
                                                                          "text":  "造成 1D12+4 伤害。"
                                                                      },
                                                   "mage_phase":  {
                                                                      "name":  "相位转移",
                                                                      "source":  "职业技能",
                                                                      "template":  "self_buff",
                                                                      "config":  {
                                                                                     "buffBasic":  0,
                                                                                     "bonusDie":  "",
                                                                                     "heal":  "1d6",
                                                                                     "block":  "",
                                                                                     "dodgeNext":  false,
                                                                                     "counterDamage":  "",
                                                                                     "counterUseTakenDamage":  false,
                                                                                     "classSkillCapDelta":  0,
                                                                                     "reactiveMoveTrigger":  "on_targeted",
                                                                                     "reactiveMoveMaxDistance":  2,
                                                                                     "healOnDamaged":  "",
                                                                                     "disarmAttackerOnHit":  0,
                                                                                     "consumeOn":  "until_triggered",
                                                                                     "durationTurns":  null,
                                                                                     "basicAttackCapDelta":  0
                                                                                 },
                                                                      "text":  "回复1D6并在被攻击后随机传送2格内且闪避该次攻击"
                                                                  }
                                               },
                                     "deckCounts":  {
                                                        "mage_fireball":  1,
                                                        "mage_nova":  1,
                                                        "mage_blink":  1,
                                                        "mage_lightning":  1,
                                                        "mage_phase":  1
                                                    }
                                 },
                        "rogue":  {
                                      "key":  "rogue",
                                      "name":  "盗贼",
                                      "hp":  55,
                                      "move":  6,
                                      "movePreset":  "melee",
                                      "passives":  {
                                                       "rogue_passive":  {
                                                                             "name":  "盗贼被动",
                                                                             "template":  "control_bonus_on_basic_attack",
                                                                             "config":  {
                                                                                            "requiredTargetState":  [
                                                                                                                        "slow",
                                                                                                                        "disarm",
                                                                                                                        "sheep"
                                                                                                                    ],
                                                                                            "bonusDamage":  "1d6",
                                                                                            "attackType":  "basic_attack"
                                                                                        },
                                                                             "text":  "受控制目标会额外受到普通攻击伤害"
                                                                         }
                                                   },
                                      "cards":  {
                                                    "rogue_ambush":  {
                                                                         "name":  "偷袭",
                                                                         "source":  "职业技能",
                                                                         "template":  "direct_damage",
                                                                         "config":  {
                                                                                        "damage":  "1d6",
                                                                                        "range":  2,
                                                                                        "target":  "enemy",
                                                                                        "conditionalBonus":  {
                                                                                                                 "condition":  "moved_this_turn",
                                                                                                                 "bonusDamage":  "1d4"
                                                                                                             },
                                                                                        "applyTemplate":  "control_status",
                                                                                        "applyConfig":  {
                                                                                                            "isControlTag":  true
                                                                                                        },
                                                                                        "spell":  true
                                                                                    },
                                                                         "text":  "跨过暗影，偷袭目标造成1D6伤害，并造成眩晕。"
                                                                     },
                                                    "rogue_disarm":  {
                                                                         "name":  "缴械",
                                                                         "source":  "职业技能",
                                                                         "template":  "direct_damage",
                                                                         "config":  {
                                                                                        "damage":  "1d6",
                                                                                        "range":  1,
                                                                                        "target":  "enemy",
                                                                                        "apply":  {
                                                                                                      "disarm":  1
                                                                                                  },
                                                                                        "applyTemplate":  "control_status",
                                                                                        "applyConfig":  {
                                                                                                            "controlType":  "disarm",
                                                                                                            "isControlTag":  true
                                                                                                        },
                                                                                        "spell":  true
                                                                                    },
                                                                         "text":  "造成 1D6 并缴械。"
                                                                     },
                                                    "rogue_assassinate":  {
                                                                              "name":  "刺杀",
                                                                              "source":  "职业技能",
                                                                              "template":  "direct_damage",
                                                                              "config":  {
                                                                                             "damage":  "2d8",
                                                                                             "range":  1,
                                                                                             "target":  "enemy",
                                                                                             "conditionalBonus":  {
                                                                                                                      "condition":  "target_controlled",
                                                                                                                      "bonusFlat":  2
                                                                                                                  },
                                                                                             "applyTemplate":  "control_status",
                                                                                             "applyConfig":  {
                                                                                                                 "controlType":  "root",
                                                                                                                 "isControlTag":  true
                                                                                                             }
                                                                                         },
                                                                              "text":  "尝试终结目标，造成大量伤害2D8并使目标禁锢1回合。"
                                                                          },
                                                    "rogue_step":  {
                                                                       "name":  "瞬步",
                                                                       "source":  "职业技能",
                                                                       "template":  "teleport",
                                                                       "config":  {
                                                                                      "range":  5,
                                                                                      "target":  "tile"
                                                                                  },
                                                                       "text":  "传送 5格。"
                                                                   },
                                                    "rogue_bloodmix":  {
                                                                           "name":  "血腥合剂",
                                                                           "source":  "职业技能",
                                                                           "template":  "self_buff",
                                                                           "config":  {
                                                                                          "heal":  "1d6",
                                                                                          "bonusDie":  "1d6",
                                                                                          "consumeOn":  "next_basic_attack"
                                                                                      },
                                                                           "text":  "恢复1D6并强化下次普攻，额外造成1D6。"
                                                                       },
                                                    "rogue_feast":  {
                                                                        "name":  "杀戮盛宴",
                                                                        "source":  "职业技能",
                                                                        "template":  "direct_damage",
                                                                        "config":  {
                                                                                       "damage":  "15x(0|2)",
                                                                                       "range":  1,
                                                                                       "target":  "enemy",
                                                                                       "conditionalBonus":  {
                                                                                                                "condition":  "target_hp_lte",
                                                                                                                "threshold":  15,
                                                                                                                "bonusDamage":  "1d6"
                                                                                                            },
                                                                                       "spell":  true
                                                                                   },
                                                                        "text":  "恐怖的高伤害技能最高可能造成30点伤害"
                                                                    }
                                                },
                                      "deckCounts":  {
                                                         "rogue_ambush":  1,
                                                         "rogue_disarm":  1,
                                                         "rogue_assassinate":  1,
                                                         "rogue_step":  0,
                                                         "rogue_bloodmix":  1,
                                                         "rogue_feast":  1
                                                     }
                                  },
                        "priest":  {
                                       "key":  "priest",
                                       "name":  "牧师",
                                       "hp":  55,
                                       "move":  4,
                                       "movePreset":  "melee",
                                       "passives":  {
                                                        "priest_passive":  {
                                                                               "name":  "圣光回响",
                                                                               "template":  "threshold_reward_once_per_turn",
                                                                               "config":  {
                                                                                              "thresholdType":  "damage_taken",
                                                                                              "thresholdValue":  4,
                                                                                              "rewardList":  [
                                                                                                                 {
                                                                                                                     "type":  "heal",
                                                                                                                     "value":  "1d4",
                                                                                                                     "cardKey":  "",
                                                                                                                     "origin":  ""
                                                                                                                 }
                                                                                                             ],
                                                                                              "oncePerTurn":  true,
                                                                                              "threshold":  4,
                                                                                              "damageThreshold":  4
                                                                                          },
                                                                               "text":  "受到4点伤害后，会回复1D4"
                                                                           }
                                                    },
                                       "cards":  {
                                                     "priest_heal":  {
                                                                         "name":  "快速治疗",
                                                                         "source":  "职业技能",
                                                                         "template":  "self_buff",
                                                                         "config":  {
                                                                                        "heal":  "1d8",
                                                                                        "consumeOn":  "immediate"
                                                                                    },
                                                                         "text":  "恢复 1D8。"
                                                                     },
                                                     "priest_pain":  {
                                                                         "name":  "痛苦",
                                                                         "source":  "职业技能",
                                                                         "template":  "direct_damage",
                                                                         "config":  {
                                                                                        "damage":  "1d6",
                                                                                        "range":  5,
                                                                                        "target":  "enemy",
                                                                                        "spell":  true,
                                                                                        "straight":  false,
                                                                                        "applyTemplate":  "dot_damage_over_time",
                                                                                        "applyConfig":  {
                                                                                                            "damagePerTick":  "1d6",
                                                                                                            "durationTurns":  "2"
                                                                                                        }
                                                                                    },
                                                                         "text":  "造成1D6伤害并额外造成2回合每回合1D6"
                                                                     },
                                                     "priest_smite":  {
                                                                          "name":  "惩戒化身",
                                                                          "source":  "职业技能",
                                                                          "template":  "transform_basic_attack",
                                                                          "config":  {
                                                                                         "attackName":  "变身普攻",
                                                                                         "damage":  "8D2",
                                                                                         "range":  6,
                                                                                         "straight":  false,
                                                                                         "consumeOn":  "end_of_turn",
                                                                                         "durationTurns":  2,
                                                                                         "block":  "8",
                                                                                         "apply":  {

                                                                                                   }
                                                                                     },
                                                                          "text":  "化身成纯粹的惩戒使者，普通攻击造成8D2且变成距离为6的远程攻击，同时获得8格挡。"
                                                                      },
                                                     "priest_stance":  {
                                                                           "name":  "神圣立场",
                                                                           "source":  "职业技能",
                                                                           "template":  "self_buff",
                                                                           "config":  {
                                                                                          "block":  "1d6",
                                                                                          "buffBasic":  2
                                                                                      },
                                                                           "text":  "获得格挡并让下次普攻 +2。"
                                                                       },
                                                     "priest_shield":  {
                                                                           "name":  "护盾术",
                                                                           "source":  "职业技能",
                                                                           "template":  "self_buff",
                                                                           "config":  {
                                                                                          "block":  "1d8"
                                                                                      },
                                                                           "text":  "获得 1D8 格挡。"
                                                                       },
                                                     "priest_sanctuary":  {
                                                                              "name":  "圣光庇护",
                                                                              "source":  "职业技能",
                                                                              "template":  "self_buff",
                                                                              "config":  {
                                                                                             "heal":  "",
                                                                                             "block":  "1d5",
                                                                                             "consumeOn":  "immediate",
                                                                                             "healOnDamaged":  "1D5",
                                                                                             "counterDamage":  "5"
                                                                                         },
                                                                              "text":  "在受伤后回复1D5，同时获得格挡1D5，并对攻击者反伤5点伤害。"
                                                                          },
                                                     "priest_judgement":  {
                                                                              "name":  "审判",
                                                                              "source":  "职业技能",
                                                                              "template":  "direct_damage",
                                                                              "config":  {
                                                                                             "damage":  "1d8",
                                                                                             "range":  4,
                                                                                             "target":  "enemy",
                                                                                             "spell":  true
                                                                                         },
                                                                              "text":  "造成 1D8 法术伤害"
                                                                          },
                                                     "priest_holyfire":  {
                                                                             "name":  "神圣之火",
                                                                             "source":  "职业技能",
                                                                             "template":  "direct_damage",
                                                                             "config":  {
                                                                                            "damage":  "1d8",
                                                                                            "range":  5,
                                                                                            "target":  "enemy",
                                                                                            "spell":  true,
                                                                                            "apply":  {
                                                                                                          "burn":  1
                                                                                                      }
                                                                                        },
                                                                             "text":  "造成 1D8 法术伤害并附带点燃。"
                                                                         },
                                                     "priest_barrier":  {
                                                                            "name":  "光辉壁垒",
                                                                            "source":  "职业技能",
                                                                            "template":  "self_buff",
                                                                            "config":  {
                                                                                           "block":  "1d10",
                                                                                           "consumeOn":  "manual"
                                                                                       },
                                                                            "text":  "获得 1D10 格挡。"
                                                                        },
                                                     "priest_radiance":  {
                                                                             "name":  "圣光照耀",
                                                                             "source":  "职业技能",
                                                                             "template":  "self_buff",
                                                                             "config":  {
                                                                                            "heal":  "1d8",
                                                                                            "block":  "1d6",
                                                                                            "consumeOn":  "immediate"
                                                                                        },
                                                                             "text":  "恢复 1D8并获得 1D6格挡。"
                                                                         }
                                                 },
                                       "deckCounts":  {
                                                          "priest_heal":  1,
                                                          "priest_pain":  1,
                                                          "priest_smite":  1,
                                                          "priest_stance":  1,
                                                          "priest_shield":  0,
                                                          "priest_sanctuary":  1,
                                                          "priest_judgement":  0,
                                                          "priest_holyfire":  0,
                                                          "priest_barrier":  0,
                                                          "priest_radiance":  0
                                                      }
                                   },
                        "shaman":  {
                                       "key":  "shaman",
                                       "name":  "萨满",
                                       "hp":  60,
                                       "move":  5,
                                       "movePreset":  "melee",
                                       "passives":  {
                                                        "shaman_passive":  {
                                                                               "name":  "灼热武器",
                                                                               "template":  "weapon_basic_inflicts_status",
                                                                               "config":  {
                                                                                              "statusType":  "burn",
                                                                                              "statusValue":  "1d6",
                                                                                              "durationTurns":  2
                                                                                          },
                                                                               "text":  "每次普通攻击会点燃目标，造成1d6每回合伤害，持续两回合"
                                                                           }
                                                    },
                                       "cards":  {
                                                     "shaman_shock":  {
                                                                          "name":  "震击",
                                                                          "source":  "职业技能",
                                                                          "template":  "direct_damage",
                                                                          "config":  {
                                                                                         "damage":  "1d6",
                                                                                         "range":  6,
                                                                                         "target":  "enemy",
                                                                                         "spell":  true,
                                                                                         "applyTemplate":  "slow_status",
                                                                                         "applyConfig":  {
                                                                                                             "moveMultiplier":  0.5,
                                                                                                             "rounding":  "ceil",
                                                                                                             "durationTurns":  1
                                                                                                         }
                                                                                     },
                                                                          "text":  "伤害并减速。"
                                                                      },
                                                     "shaman_windfury":  {
                                                                             "name":  "风怒",
                                                                             "source":  "职业技能",
                                                                             "template":  "self_buff",
                                                                             "config":  {
                                                                                            "basicAttackCapDelta":  1,
                                                                                            "consumeOn":  "end_of_turn",
                                                                                            "durationTurns":  2
                                                                                        },
                                                                             "text":  "每回合多1次普攻持续2回合"
                                                                         },
                                                     "shaman_avatar":  {
                                                                           "name":  "化身",
                                                                           "source":  "职业技能",
                                                                           "template":  "transform_basic_attack",
                                                                           "config":  {
                                                                                          "attackName":  "化身普攻",
                                                                                          "damage":  "weapon_damage",
                                                                                          "range":  8,
                                                                                          "straight":  false,
                                                                                          "consumeOn":  "end_of_turn",
                                                                                          "block":  "1d6",
                                                                                          "apply":  {

                                                                                                    },
                                                                                          "applyTemplate":  "dot_damage_over_time",
                                                                                          "applyConfig":  {
                                                                                                              "damagePerTick":  "1d6",
                                                                                                              "durationTurns":  2,
                                                                                                              "stackRule":  "stack"
                                                                                                          },
                                                                                          "durationTurns":  "2"
                                                                                      },
                                                                           "text":  "变身，普通攻击变成强力远程攻击, 并附带叠加1d6伤害，同时获得1d6格挡，持续2回合"
                                                                       },
                                                     "shaman_earthshield":  {
                                                                                "name":  "大地之盾",
                                                                                "source":  "职业技能",
                                                                                "template":  "self_buff",
                                                                                "config":  {
                                                                                               "block":  "1d8"
                                                                                           },
                                                                                "text":  "获得 1D8 格挡。"
                                                                            },
                                                     "shaman_bloodlust":  {
                                                                              "name":  "嗜血术",
                                                                              "source":  "职业技能",
                                                                              "template":  "self_buff",
                                                                              "config":  {
                                                                                             "buffBasic":  3,
                                                                                             "consumeOn":  "end_of_turn",
                                                                                             "durationTurns":  3
                                                                                         },
                                                                              "text":  "下三回合普攻 +3。"
                                                                          },
                                                     "shaman_chain":  {
                                                                          "name":  "闪电链",
                                                                          "source":  "职业技能",
                                                                          "template":  "aoe",
                                                                          "config":  {
                                                                                         "damage":  "1d6",
                                                                                         "range":  4,
                                                                                         "radius":  1,
                                                                                         "spell":  true
                                                                                     },
                                                                          "text":  "对范围造成 1D6 法术伤害。"
                                                                      },
                                                     "shaman_spiritwalk":  {
                                                                               "name":  "灵行",
                                                                               "source":  "职业技能",
                                                                               "template":  "teleport",
                                                                               "config":  {
                                                                                              "range":  3,
                                                                                              "target":  "tile"
                                                                                          },
                                                                               "text":  "位移到 3 格内空位。"
                                                                           },
                                                     "shaman_tide":  {
                                                                         "name":  "潮汐之涌",
                                                                         "source":  "职业技能",
                                                                         "template":  "self_buff",
                                                                         "config":  {
                                                                                        "heal":  "1d6",
                                                                                        "block":  "1d6",
                                                                                        "consumeOn":  "immediate"
                                                                                    },
                                                                         "text":  "恢复 1D6 并获得 1D6格挡。"
                                                                     },
                                                     "shaman_earthbind":  {
                                                                              "name":  "地缚",
                                                                              "source":  "职业技能",
                                                                              "template":  "direct_damage",
                                                                              "config":  {
                                                                                             "damage":  "1d4",
                                                                                             "range":  4,
                                                                                             "target":  "enemy",
                                                                                             "spell":  true,
                                                                                             "apply":  {
                                                                                                           "slow":  1
                                                                                                       }
                                                                                         },
                                                                              "text":  "造成 1D4 法术伤害并减速。"
                                                                          },
                                                     "shaman_thunderstorm":  {
                                                                                 "name":  "雷暴",
                                                                                 "source":  "职业技能",
                                                                                 "template":  "aoe",
                                                                                 "config":  {
                                                                                                "damage":  "1d8",
                                                                                                "range":  4,
                                                                                                "radius":  1,
                                                                                                "spell":  true
                                                                                            },
                                                                                 "text":  "对范围造成 1D8 法术伤害。"
                                                                             },
                                                     "shaman_stormstrike":  {
                                                                                "name":  "风暴打击",
                                                                                "source":  "职业技能",
                                                                                "template":  "damage_roll_grant_card",
                                                                                "config":  {
                                                                                               "damage":  "1d6",
                                                                                               "range":  1,
                                                                                               "target":  "enemy",
                                                                                               "procDie":  "1d6",
                                                                                               "threshold":  3,
                                                                                               "grantedCardKey":  "shaman_stormstrike",
                                                                                               "grantedOrigin":  "职业技能",
                                                                                               "refundBucket":  "class_or_guardian"
                                                                                           },
                                                                                "text":  "造成1d6伤害，并投掷1d6，如结果大于3，则再次获得风暴打击，并可以再次使用。"
                                                                            },
                                                     "shaman_ancestral":  {
                                                                              "name":  "先祖指引",
                                                                              "source":  "职业技能",
                                                                              "template":  "self_buff",
                                                                              "config":  {
                                                                                             "heal":  "1d4",
                                                                                             "bonusDie":  "1d4",
                                                                                             "consumeOn":  "next_basic_attack"
                                                                                         },
                                                                              "text":  "恢复 1D4，并让下次普攻额外造成 1D4。"
                                                                          },
                                                     "shaman_stone_skin":  {
                                                                               "name":  "石肤护佑",
                                                                               "source":  "职业技能",
                                                                               "template":  "grant_multiple_buffs",
                                                                               "config":  {
                                                                                              "rewardList":  [
                                                                                                                 {
                                                                                                                     "type":  "gain_block",
                                                                                                                     "value":  "1d6"
                                                                                                                 },
                                                                                                                 {
                                                                                                                     "type":  "heal",
                                                                                                                     "value":  "1d4"
                                                                                                                 },
                                                                                                                 {
                                                                                                                     "type":  "buff_basic",
                                                                                                                     "value":  1
                                                                                                                 }
                                                                                                             ],
                                                                                              "consumeOn":  "immediate"
                                                                                          },
                                                                               "text":  "直接获得 1D6 格挡、恢复 1D4，并让下次普攻 +1。"
                                                                           }
                                                 },
                                       "deckCounts":  {
                                                          "shaman_shock":  1,
                                                          "shaman_windfury":  1,
                                                          "shaman_avatar":  1,
                                                          "shaman_earthshield":  0,
                                                          "shaman_bloodlust":  0,
                                                          "shaman_chain":  0,
                                                          "shaman_spiritwalk":  0,
                                                          "shaman_tide":  1,
                                                          "shaman_earthbind":  0,
                                                          "shaman_thunderstorm":  0,
                                                          "shaman_stormstrike":  1,
                                                          "shaman_ancestral":  0,
                                                          "shaman_stone_skin":  0
                                                      }
                                   },
                        "necro":  {
                                      "key":  "necro",
                                      "name":  "死灵法师",
                                      "hp":  60,
                                      "move":  4,
                                      "movePreset":  "ranged",
                                      "passives":  {
                                                       "necro_passive":  {
                                                                             "name":  "死灵法师被动",
                                                                             "template":  "activated_token_scaling_block",
                                                                             "config":  {
                                                                                            "tokenType":  "undead_token",
                                                                                            "ratio":  0.5,
                                                                                            "rounding":  "ceil",
                                                                                            "rewardType":  "gain_block_each_turn"
                                                                                        }
                                                                         }
                                                   },
                                      "cards":  {
                                                    "necro_bomb":  {
                                                                       "name":  "埋骨炸弹",
                                                                       "source":  "职业技能",
                                                                       "template":  "insert_negative_card_into_target_deck",
                                                                       "config":  {
                                                                                      "insertCardKey":  "necro_bomb_token",
                                                                                      "insertCount":  2,
                                                                                      "triggerCondition":  "on_hit",
                                                                                      "shuffleIntoDeck":  true,
                                                                                      "range":  6
                                                                                  },
                                                                       "text":  "命中后向对方牌库塞入炸弹牌。"
                                                                   },
                                                    "necro_skeleton":  {
                                                                           "name":  "召唤骷髅",
                                                                           "source":  "职业技能",
                                                                           "template":  "summon_token_into_self_deck",
                                                                           "config":  {
                                                                                          "tokenType":  "skeleton",
                                                                                          "insertCount":  1
                                                                                      },
                                                                           "text":  "激活一个骷髅。"
                                                                       },
                                                    "necro_bonedragon":  {
                                                                             "name":  "召唤骨龙",
                                                                             "source":  "职业技能",
                                                                             "template":  "summon_token_into_self_deck",
                                                                             "config":  {
                                                                                            "tokenType":  "bone_dragon",
                                                                                            "insertCount":  1
                                                                                        },
                                                                             "text":  "激活一个骨龙。"
                                                                         },
                                                    "necro_burst":  {
                                                                        "name":  "亡灵爆发",
                                                                        "source":  "职业技能",
                                                                        "template":  "consume_all_activated_tokens_for_burst",
                                                                        "config":  {
                                                                                       "baseDamage":  "2d4",
                                                                                       "range":  5,
                                                                                       "bonusByTokenType":  {
                                                                                                                "skeleton":  "1d4",
                                                                                                                "bone_dragon":  "1d8"
                                                                                                            }
                                                                                   },
                                                                        "text":  "消耗召唤物对目标造成爆发伤害，基础造成2D4伤害，额外每有一个骷髅造成1D4，每有一头骨龙造成1D8。"
                                                                    },
                                                    "necro_shield":  {
                                                                         "name":  "骨盾",
                                                                         "source":  "职业技能",
                                                                         "template":  "self_buff",
                                                                         "config":  {
                                                                                        "block":  "1d8"
                                                                                    },
                                                                         "text":  "获得 1D8 格挡。"
                                                                     },
                                                    "necro_spear":  {
                                                                        "name":  "骨矛",
                                                                        "source":  "职业技能",
                                                                        "template":  "direct_damage",
                                                                        "config":  {
                                                                                       "damage":  "1d10",
                                                                                       "range":  5,
                                                                                       "target":  "enemy",
                                                                                       "spell":  true
                                                                                   },
                                                                        "text":  "造成 1D10 法术伤害。"
                                                                    },
                                                    "necro_gravebind":  {
                                                                            "name":  "墓缚",
                                                                            "source":  "职业技能",
                                                                            "template":  "direct_damage",
                                                                            "config":  {
                                                                                           "damage":  "1d4",
                                                                                           "range":  5,
                                                                                           "target":  "enemy",
                                                                                           "spell":  true,
                                                                                           "apply":  {
                                                                                                         "slow":  1
                                                                                                     }
                                                                                       },
                                                                            "text":  "造成 1D4 伤害并减速。"
                                                                        },
                                                    "necro_legion":  {
                                                                         "name":  "亡者军势",
                                                                         "source":  "职业技能",
                                                                         "template":  "summon_token_into_self_deck",
                                                                         "config":  {
                                                                                        "tokenType":  "skeleton",
                                                                                        "insertCount":  2
                                                                                    },
                                                                         "text":  "一次激活两个骷髅。"
                                                                     },
                                                    "necro_deathcoil":  {
                                                                            "name":  "死亡缠绕",
                                                                            "source":  "职业技能",
                                                                            "template":  "direct_damage",
                                                                            "config":  {
                                                                                           "damage":  "1d8",
                                                                                           "range":  5,
                                                                                           "target":  "enemy",
                                                                                           "spell":  true
                                                                                       },
                                                                            "text":  "造成 1D8 法术伤害。"
                                                                        },
                                                    "necro_boneprison":  {
                                                                             "name":  "骨牢",
                                                                             "source":  "职业技能",
                                                                             "template":  "direct_damage",
                                                                             "config":  {
                                                                                            "damage":  "1d4",
                                                                                            "range":  4,
                                                                                            "target":  "enemy",
                                                                                            "spell":  true,
                                                                                            "apply":  {
                                                                                                          "slow":  1
                                                                                                      }
                                                                                        },
                                                                             "text":  "造成 1D4 法术伤害并减速。"
                                                                         },
                                                    "necro_harvest":  {
                                                                          "name":  "灵魂收割",
                                                                          "source":  "职业技能",
                                                                          "template":  "bonus_if_target_marked",
                                                                          "config":  {
                                                                                         "baseDamage":  "1d10",
                                                                                         "range":  5,
                                                                                         "bonusDamage":  2,
                                                                                         "consumeMark":  false
                                                                                     },
                                                                          "text":  "若目标已被标记或诅咒，则额外造成 2 点伤害。"
                                                                      }
                                                },
                                      "deckCounts":  {
                                                         "necro_bomb":  1,
                                                         "necro_skeleton":  1,
                                                         "necro_bonedragon":  1,
                                                         "necro_burst":  1,
                                                         "necro_shield":  0,
                                                         "necro_spear":  0,
                                                         "necro_gravebind":  0,
                                                         "necro_legion":  1,
                                                         "necro_deathcoil":  0,
                                                         "necro_boneprison":  0,
                                                         "necro_harvest":  0
                                                     }
                                  },
                        "warlock":  {
                                        "key":  "warlock",
                                        "name":  "术士",
                                        "hp":  55,
                                        "move":  4,
                                        "movePreset":  "melee",
                                        "passives":  {
                                                         "warlock_passive":  {
                                                                                 "name":  "术士被动",
                                                                                 "template":  "life_for_card_draw_once_per_turn",
                                                                                 "config":  {
                                                                                                "lifeCost":  4,
                                                                                                "drawCount":  1,
                                                                                                "oncePerTurn":  true
                                                                                            }
                                                                             }
                                                     },
                                        "cards":  {
                                                      "lock_corrode":  {
                                                                           "name":  "腐蚀",
                                                                           "source":  "职业技能",
                                                                           "template":  "direct_damage",
                                                                           "config":  {
                                                                                          "damage":  "1d6",
                                                                                          "range":  6,
                                                                                          "target":  "enemy",
                                                                                          "spell":  true,
                                                                                          "applyTemplate":  "dot_damage_over_time",
                                                                                          "applyConfig":  {
                                                                                                              "damagePerTick":  "1d6",
                                                                                                              "tickTiming":  "turn_start",
                                                                                                              "durationTurns":  3,
                                                                                                              "stackRule":  "refresh_duration"
                                                                                                          }
                                                                                      },
                                                                           "text":  "1D6伤害并附带 DOT持续3回合每回合1D6。"
                                                                       },
                                                      "lock_soulfire":  {
                                                                            "name":  "灵魂火",
                                                                            "source":  "职业技能",
                                                                            "template":  "direct_damage",
                                                                            "config":  {
                                                                                           "damage":  "2d8",
                                                                                           "range":  3,
                                                                                           "target":  "enemy",
                                                                                           "spell":  true
                                                                                       },
                                                                            "text":  "造成 2D8 法术伤害。"
                                                                        },
                                                      "lock_nightdash":  {
                                                                             "name":  "暗夜冲刺",
                                                                             "source":  "职业技能",
                                                                             "template":  "dash_hit",
                                                                             "config":  {
                                                                                            "damage":  "1d6",
                                                                                            "range":  5
                                                                                        },
                                                                             "text":  "冲向目标并造成 1D6 伤害。"
                                                                         },
                                                      "lock_leech":  {
                                                                         "name":  "吸血",
                                                                         "source":  "职业技能",
                                                                         "template":  "direct_damage",
                                                                         "config":  {
                                                                                        "damage":  "1d5",
                                                                                        "range":  4,
                                                                                        "target":  "enemy"
                                                                                    },
                                                                         "text":  "造成 1D5 伤害。"
                                                                     },
                                                      "lock_shadowflame":  {
                                                                               "name":  "暗影烈焰",
                                                                               "source":  "职业技能",
                                                                               "template":  "aoe",
                                                                               "config":  {
                                                                                              "damage":  "1d12",
                                                                                              "range":  4,
                                                                                              "radius":  1,
                                                                                              "spell":  true
                                                                                          },
                                                                               "text":  "对范围造成 1D12 伤害。"
                                                                           },
                                                      "lock_bloodpact":  {
                                                                             "name":  "血契",
                                                                             "source":  "职业技能",
                                                                             "template":  "self_buff",
                                                                             "config":  {
                                                                                            "heal":  "1d4",
                                                                                            "bonusDie":  "1d4",
                                                                                            "consumeOn":  "next_basic_attack"
                                                                                        },
                                                                             "text":  "恢复并让下次普攻额外造成 1D4。"
                                                                         },
                                                      "lock_doom":  {
                                                                        "name":  "厄运",
                                                                        "source":  "职业技能",
                                                                        "template":  "insert_negative_card_into_target_deck",
                                                                        "config":  {
                                                                                       "range":  5,
                                                                                       "insertCardKey":  "doom",
                                                                                       "insertCount":  1,
                                                                                       "triggerCondition":  "on_hit",
                                                                                       "shuffleIntoDeck":  true
                                                                                   },
                                                                        "text":  "诅咒对方，当对方抽到厄运降临时，受到大量伤害。"
                                                                    },
                                                      "lock_siphon":  {
                                                                          "name":  "灵魂虹吸",
                                                                          "source":  "职业技能",
                                                                          "template":  "direct_damage",
                                                                          "config":  {
                                                                                         "damage":  "1d6",
                                                                                         "range":  4,
                                                                                         "target":  "enemy",
                                                                                         "spell":  true
                                                                                     },
                                                                          "text":  "造成 1D6 法术伤害。"
                                                                      },
                                                      "lock_hellfire":  {
                                                                            "name":  "地狱烈焰",
                                                                            "source":  "职业技能",
                                                                            "template":  "aoe",
                                                                            "config":  {
                                                                                           "damage":  "1d8",
                                                                                           "range":  4,
                                                                                           "radius":  1,
                                                                                           "spell":  true
                                                                                       },
                                                                            "text":  "对目标点周围 1 格造成 1D8 法术伤害。"
                                                                        },
                                                      "lock_shadowbolt":  {
                                                                              "name":  "暗影箭",
                                                                              "source":  "职业技能",
                                                                              "template":  "direct_damage",
                                                                              "config":  {
                                                                                             "damage":  "1d10",
                                                                                             "range":  5,
                                                                                             "target":  "enemy",
                                                                                             "spell":  true
                                                                                         },
                                                                              "text":  "造成 1D10 法术伤害。"
                                                                          },
                                                      "lock_demonskin":  {
                                                                             "name":  "恶魔之肤",
                                                                             "source":  "职业技能",
                                                                             "template":  "self_buff",
                                                                             "config":  {
                                                                                            "block":  "1d8",
                                                                                            "consumeOn":  "manual"
                                                                                        },
                                                                             "text":  "获得 1D8 格挡。"
                                                                         },
                                                      "lock_agony":  {
                                                                         "name":  "痛楚诅咒",
                                                                         "source":  "职业技能",
                                                                         "template":  "direct_damage",
                                                                         "config":  {
                                                                                        "damage":  "1d4",
                                                                                        "range":  5,
                                                                                        "target":  "enemy",
                                                                                        "spell":  true,
                                                                                        "applyTemplate":  "dot_damage_over_time",
                                                                                        "applyConfig":  {
                                                                                                            "damagePerTick":  "1d4",
                                                                                                            "tickTiming":  "turn_start",
                                                                                                            "durationTurns":  3,
                                                                                                            "stackRule":  "refresh_duration"
                                                                                                        }
                                                                                    },
                                                                         "text":  "造成 1D4 伤害并附带持续伤害。"
                                                                     },
                                                      "lock_metamorphosis":  {
                                                                                 "name":  "恶魔变身",
                                                                                 "source":  "职业技能",
                                                                                 "template":  "transform_basic_attack",
                                                                                 "config":  {
                                                                                                "attackName":  "恶魔烈爪",
                                                                                                "damage":  "1d10",
                                                                                                "range":  5,
                                                                                                "straight":  true,
                                                                                                "consumeOn":  "next_basic_attack",
                                                                                                "block":  "1d6",
                                                                                                "apply":  {
                                                                                                              "burn":  1
                                                                                                          },
                                                                                                "applyTemplate":  "dot_damage_over_time",
                                                                                                "applyConfig":  {
                                                                                                                    "damagePerTick":  "1D6"
                                                                                                                },
                                                                                                "durationTurns":  "3"
                                                                                            },
                                                                                 "text":  "变身后普通攻击变为远程直线攻击，并附带点燃。"
                                                                             },
                                                      "lock_life_tap":  {
                                                                            "name":  "生命分流",
                                                                            "source":  "职业技能",
                                                                            "template":  "pay_life_draw_cards",
                                                                            "config":  {
                                                                                           "lifeCost":  4,
                                                                                           "drawCount":  2
                                                                                       },
                                                                            "text":  "支付 4 点生命并抽 2 张牌。"
                                                                        }
                                                  },
                                        "deckCounts":  {
                                                           "lock_corrode":  1,
                                                           "lock_soulfire":  1,
                                                           "lock_nightdash":  1,
                                                           "lock_leech":  0,
                                                           "lock_shadowflame":  0,
                                                           "lock_bloodpact":  0,
                                                           "lock_doom":  1,
                                                           "lock_siphon":  0,
                                                           "lock_hellfire":  0,
                                                           "lock_shadowbolt":  0,
                                                           "lock_demonskin":  0,
                                                           "lock_agony":  0,
                                                           "lock_metamorphosis":  1,
                                                           "lock_life_tap":  0
                                                       }
                                    },
                        "swordsman":  {
                                          "key":  "swordsman",
                                          "name":  "剑客",
                                          "hp":  55,
                                          "move":  5,
                                          "movePreset":  "melee",
                                          "passives":  {
                                                           "swordsman_passive":  {
                                                                                     "name":  "剑客被动",
                                                                                     "template":  "skip_basic_attack_then_gain_bonus",
                                                                                     "config":  {
                                                                                                    "checkAt":  "end_of_turn",
                                                                                                    "bonusType":  "flat_damage",
                                                                                                    "bonusValue":  5,
                                                                                                    "consumeOn":  "next_basic_attack_or_class_skill"
                                                                                                }
                                                                                 }
                                                       },
                                          "cards":  {
                                                        "sword_parry":  {
                                                                            "name":  "见切",
                                                                            "source":  "职业技能",
                                                                            "template":  "self_buff",
                                                                            "config":  {
                                                                                           "block":  "1d6",
                                                                                           "consumeOn":  "until_triggered",
                                                                                           "dodgeNext":  true
                                                                                       },
                                                                            "text":  "闪避下一次受到的攻击，并获得1d6格挡"
                                                                        },
                                                        "sword_read":  {
                                                                           "name":  "看破",
                                                                           "source":  "职业技能",
                                                                           "template":  "mark_target_for_bonus",
                                                                           "config":  {
                                                                                          "markType":  "normal",
                                                                                          "range":  4,
                                                                                          "consumeOn":  "until_triggered",
                                                                                          "applyTemplate":  "slow_status",
                                                                                          "applyConfig":  {
                                                                                                              "moveMultiplier":  0.5
                                                                                                          }
                                                                                      },
                                                                           "text":  "标记一名目标，并减速"
                                                                       },
                                                        "sword_flash":  {
                                                                            "name":  "一闪",
                                                                            "source":  "职业技能",
                                                                            "template":  "dash_hit",
                                                                            "config":  {
                                                                                           "damage":  "1d6",
                                                                                           "range":  4
                                                                                       },
                                                                            "text":  "冲锋并造成 1D6 伤害。"
                                                                        },
                                                        "sword_drawdash":  {
                                                                               "name":  "纳刀疾驰",
                                                                               "source":  "职业技能",
                                                                               "template":  "teleport",
                                                                               "config":  {
                                                                                              "range":  3,
                                                                                              "target":  "tile"
                                                                                          },
                                                                               "text":  "位移到 3 格内空位。"
                                                                           },
                                                        "sword_finish":  {
                                                                             "name":  "燕返",
                                                                             "source":  "职业技能",
                                                                             "template":  "bonus_if_target_marked",
                                                                             "config":  {
                                                                                            "baseDamage":  "2d8",
                                                                                            "range":  4,
                                                                                            "bonusDamage":  "10",
                                                                                            "consumeMark":  true
                                                                                        },
                                                                             "text":  "若目标被标记，则造成更高伤害并移除标记。"
                                                                         },
                                                        "sword_focus":  {
                                                                            "name":  "心眼",
                                                                            "source":  "职业技能",
                                                                            "template":  "self_buff",
                                                                            "config":  {
                                                                                           "buffBasic":  2,
                                                                                           "block":  "1d4",
                                                                                           "consumeOn":  "next_basic_attack"
                                                                                       },
                                                                            "text":  "获得少量格挡，下次普攻 +2。"
                                                                        },
                                                        "sword_riposte":  {
                                                                              "name":  "反击架势",
                                                                              "source":  "职业技能",
                                                                              "template":  "self_buff",
                                                                              "config":  {
                                                                                             "block":  "",
                                                                                             "buffBasic":  0,
                                                                                             "consumeOn":  "until_triggered",
                                                                                             "dodgeNext":  true,
                                                                                             "counterUseTakenDamage":  true
                                                                                         },
                                                                              "text":  "格挡并反击"
                                                                          },
                                                        "sword_shadowstep":  {
                                                                                 "name":  "影踏",
                                                                                 "source":  "职业技能",
                                                                                 "template":  "teleport",
                                                                                 "config":  {
                                                                                                "range":  4,
                                                                                                "target":  "tile"
                                                                                            },
                                                                                 "text":  "位移到 4 格内空位。"
                                                                             }
                                                    },
                                          "deckCounts":  {
                                                             "sword_parry":  1,
                                                             "sword_read":  1,
                                                             "sword_flash":  1,
                                                             "sword_drawdash":  0,
                                                             "sword_finish":  1,
                                                             "sword_focus":  1,
                                                             "sword_riposte":  1,
                                                             "sword_shadowstep":  0
                                                         }
                                      },
                        "hunter":  {
                                       "key":  "hunter",
                                       "name":  "猎人",
                                       "hp":  55,
                                       "move":  4,
                                       "movePreset":  "ranged",
                                       "passives":  {
                                                        "hunter_passive":  {
                                                                               "name":  "游击战术",
                                                                               "template":  "threshold_reward_once_per_turn",
                                                                               "config":  {
                                                                                              "thresholdType":  "distance_moved",
                                                                                              "thresholdValue":  4,
                                                                                              "rewardList":  [
                                                                                                                 {
                                                                                                                     "type":  "buff_basic",
                                                                                                                     "value":  2,
                                                                                                                     "cardKey":  "",
                                                                                                                     "origin":  ""
                                                                                                                 }
                                                                                                             ],
                                                                                              "oncePerTurn":  true,
                                                                                              "threshold":  4,
                                                                                              "damageThreshold":  4
                                                                                          },
                                                                               "text":  "每回合至少移动4格后，获得2点普通攻击加成"
                                                                           }
                                                    },
                                       "cards":  {
                                                     "hunter_mark":  {
                                                                         "name":  "猎人印记",
                                                                         "source":  "职业技能",
                                                                         "template":  "mark_target_for_bonus",
                                                                         "config":  {
                                                                                        "markType":  "normal",
                                                                                        "range":  8,
                                                                                        "consumeOn":  "never",
                                                                                        "applyTemplate":  "dot_damage_over_time",
                                                                                        "applyConfig":  {
                                                                                                            "damagePerTick":  "1d4",
                                                                                                            "durationTurns":  "10"
                                                                                                        }
                                                                                    },
                                                                         "text":  "永久标记一名目标，并在10回合内每回合造成1d4."
                                                                     },
                                                     "hunter_aimed":  {
                                                                          "name":  "瞄准射击",
                                                                          "source":  "职业技能",
                                                                          "template":  "bonus_if_target_marked",
                                                                          "config":  {
                                                                                         "baseDamage":  "1d8",
                                                                                         "range":  6,
                                                                                         "bonusDamage":  2,
                                                                                         "consumeMark":  false
                                                                                     },
                                                                          "text":  "若目标被标记，额外 +2 伤害。"
                                                                      },
                                                     "hunter_arcane":  {
                                                                           "name":  "奥术射击",
                                                                           "source":  "职业技能",
                                                                           "template":  "direct_damage",
                                                                           "config":  {
                                                                                          "damage":  "1d6+1",
                                                                                          "range":  5,
                                                                                          "target":  "enemy",
                                                                                          "spell":  true
                                                                                      },
                                                                           "text":  "造成 1D6+1 法术伤害。"
                                                                       },
                                                     "hunter_disengage":  {
                                                                              "name":  "逃脱",
                                                                              "source":  "职业技能",
                                                                              "template":  "teleport",
                                                                              "config":  {
                                                                                             "range":  4,
                                                                                             "target":  "tile"
                                                                                         },
                                                                              "text":  "位移到 3 格内空位。"
                                                                          },
                                                     "hunter_snare":  {
                                                                          "name":  "束缚射击",
                                                                          "source":  "职业技能",
                                                                          "template":  "direct_damage",
                                                                          "config":  {
                                                                                         "damage":  "1d4",
                                                                                         "range":  5,
                                                                                         "target":  "enemy",
                                                                                         "apply":  {
                                                                                                       "slow":  1
                                                                                                   }
                                                                                     },
                                                                          "text":  "造成 1D4 伤害并减速。"
                                                                      },
                                                     "hunter_kill":  {
                                                                         "name":  "狙击",
                                                                         "source":  "职业技能",
                                                                         "template":  "bonus_if_target_marked",
                                                                         "config":  {
                                                                                        "baseDamage":  "1d12",
                                                                                        "range":  5,
                                                                                        "bonusDamage":  "1d14",
                                                                                        "consumeMark":  true
                                                                                    },
                                                                         "text":  "对被标记目标造成高额伤害。"
                                                                     },
                                                     "hunter_trap":  {
                                                                         "name":  "束缚陷阱",
                                                                         "source":  "职业技能",
                                                                         "template":  "insert_negative_card_into_target_deck",
                                                                         "config":  {
                                                                                        "insertCardKey":  "hunter_snare_token",
                                                                                        "insertCount":  1,
                                                                                        "triggerCondition":  "on_hit",
                                                                                        "shuffleIntoDeck":  true,
                                                                                        "range":  6
                                                                                    },
                                                                         "text":  "向目标牌库植入束缚陷阱。"
                                                                     },
                                                     "hunter_command":  {
                                                                            "name":  "杀戮命令",
                                                                            "source":  "职业技能",
                                                                            "template":  "bonus_if_target_marked",
                                                                            "config":  {
                                                                                           "baseDamage":  "2d8",
                                                                                           "range":  5,
                                                                                           "bonusDamage":  3,
                                                                                           "consumeMark":  true
                                                                                       },
                                                                            "text":  "对被标记目标造成高额伤害。"
                                                                        },
                                                     "hunter_volley":  {
                                                                           "name":  "多重射击",
                                                                           "source":  "职业技能",
                                                                           "template":  "aoe",
                                                                           "config":  {
                                                                                          "damage":  "1d6",
                                                                                          "range":  5,
                                                                                          "radius":  1,
                                                                                          "spell":  false
                                                                                      },
                                                                           "text":  "对小范围造成 1D6 伤害。"
                                                                       },
                                                     "hunter_explosive":  {
                                                                              "name":  "爆裂射击",
                                                                              "source":  "职业技能",
                                                                              "template":  "aoe",
                                                                              "config":  {
                                                                                             "damage":  "1d8",
                                                                                             "range":  5,
                                                                                             "radius":  1,
                                                                                             "spell":  false
                                                                                         },
                                                                              "text":  "对目标点周围 1 格造成 1D8 伤害。"
                                                                          },
                                                     "hunter_tracking":  {
                                                                             "name":  "追踪射击",
                                                                             "source":  "职业技能",
                                                                             "template":  "mark_target_for_bonus",
                                                                             "config":  {
                                                                                            "markType":  "tracking",
                                                                                            "range":  6,
                                                                                            "consumeOn":  "until_triggered"
                                                                                        },
                                                                             "text":  "为目标施加追踪标记。"
                                                                         },
                                                     "hunter_camouflage":  {
                                                                               "name":  "伪装",
                                                                               "source":  "职业技能",
                                                                               "template":  "self_buff",
                                                                               "config":  {
                                                                                              "block":  "1d6",
                                                                                              "buffBasic":  2,
                                                                                              "consumeOn":  "next_basic_attack"
                                                                                          },
                                                                               "text":  "获得 1D6 格挡，并让下次普攻 +2。"
                                                                           }
                                                 },
                                       "deckCounts":  {
                                                          "hunter_mark":  1,
                                                          "hunter_aimed":  1,
                                                          "hunter_arcane":  0,
                                                          "hunter_disengage":  1,
                                                          "hunter_snare":  0,
                                                          "hunter_kill":  1,
                                                          "hunter_trap":  1,
                                                          "hunter_command":  0,
                                                          "hunter_volley":  0,
                                                          "hunter_explosive":  0,
                                                          "hunter_tracking":  0,
                                                          "hunter_camouflage":  0
                                                      }
                                   },
                        "武僧":  {
                                   "key":  "武僧",
                                   "name":  "武僧",
                                   "hp":  55,
                                   "move":  6,
                                   "movePreset":  "melee",
                                   "passives":  {
                                                    "武僧_passive":  {
                                                                       "name":  "连击",
                                                                       "template":  "threshold_reward_once_per_turn",
                                                                       "config":  {
                                                                                      "thresholdType":  "dealt_damage",
                                                                                      "thresholdValue":  4,
                                                                                      "rewardList":  [
                                                                                                         {
                                                                                                             "type":  "extra_basic_cap",
                                                                                                             "value":  "1",
                                                                                                             "cardKey":  "",
                                                                                                             "origin":  ""
                                                                                                         }
                                                                                                     ],
                                                                                      "oncePerTurn":  true,
                                                                                      "threshold":  4,
                                                                                      "damageThreshold":  4
                                                                                  },
                                                                       "text":  "造成至少4点伤害后，可以再次普通攻击"
                                                                   }
                                                },
                                   "cards":  {
                                                 "武僧_strike":  {
                                                                   "name":  "点穴",
                                                                   "source":  "职业技能",
                                                                   "template":  "direct_damage",
                                                                   "config":  {
                                                                                  "damage":  "1d6",
                                                                                  "range":  1,
                                                                                  "target":  "enemy",
                                                                                  "spell":  true,
                                                                                  "straight":  false,
                                                                                  "applyTemplate":  "control_status",
                                                                                  "applyConfig":  {
                                                                                                      "isControlTag":  true
                                                                                                  }
                                                                              },
                                                                   "text":  "点穴目标，造成1d6伤害并眩晕一回合"
                                                               },
                                                 "黑虎掏心":  {
                                                              "name":  "黑虎掏心",
                                                              "source":  "职业技能",
                                                              "template":  "direct_damage",
                                                              "config":  {
                                                                             "damage":  "2d8",
                                                                             "range":  1,
                                                                             "target":  "enemy",
                                                                             "spell":  false,
                                                                             "straight":  false,
                                                                             "applyTemplate":  "dot_damage_over_time",
                                                                             "applyConfig":  {
                                                                                                 "damagePerTick":  "1d6",
                                                                                                 "durationTurns":  "2"
                                                                                             }
                                                                         },
                                                              "text":  "一次猛烈的攻击，附带高额的流血效果。造成2d8伤害并且每回合流血1d6，持续2回合",
                                                              "negativeOnDraw":  false
                                                          },
                                                 "降龙十八掌":  {
                                                               "name":  "降龙十八掌",
                                                               "source":  "职业技能",
                                                               "template":  "direct_damage",
                                                               "config":  {
                                                                              "damage":  "18x(0|1)",
                                                                              "range":  1,
                                                                              "target":  "enemy",
                                                                              "spell":  false,
                                                                              "straight":  false,
                                                                              "applyTemplate":  "control_status",
                                                                              "applyConfig":  {
                                                                                                  "controlType":  "stun"
                                                                                              }
                                                                          },
                                                               "text":  "造成18次伤害，并且将目标击晕",
                                                               "negativeOnDraw":  false
                                                           },
                                                 "飞龙在天":  {
                                                              "name":  "飞龙在天",
                                                              "source":  "职业技能",
                                                              "template":  "dash_hit",
                                                              "config":  {
                                                                             "damage":  "1d6",
                                                                             "range":  6,
                                                                             "gainBlock":  "",
                                                                             "buffBasic":  3
                                                                         },
                                                              "text":  "冲向目标并造成1d6伤害，并且下一次普通攻击额外造成3点伤害",
                                                              "negativeOnDraw":  false
                                                          },
                                                 "闪电反射":  {
                                                              "name":  "闪电反射",
                                                              "source":  "职业技能",
                                                              "template":  "self_buff",
                                                              "config":  {
                                                                             "buffBasic":  0,
                                                                             "bonusDie":  "",
                                                                             "heal":  "",
                                                                             "block":  "",
                                                                             "dodgeNext":  true,
                                                                             "counterDamage":  "",
                                                                             "counterUseTakenDamage":  true,
                                                                             "classSkillCapDelta":  0,
                                                                             "reactiveMoveTrigger":  "on_targeted",
                                                                             "reactiveMoveMaxDistance":  1,
                                                                             "healOnDamaged":  "",
                                                                             "disarmAttackerOnHit":  1,
                                                                             "consumeOn":  "until_triggered",
                                                                             "durationTurns":  null,
                                                                             "basicAttackCapDelta":  0
                                                                         },
                                                              "text":  "被攻击后迅速闪避，缴械目标并还击。",
                                                              "negativeOnDraw":  false
                                                          }
                                             },
                                   "deckCounts":  {
                                                      "武僧_strike":  1,
                                                      "黑虎掏心":  1,
                                                      "降龙十八掌":  1,
                                                      "飞龙在天":  1,
                                                      "闪电反射":  1
                                                  }
                               }
                    }
};
})();
