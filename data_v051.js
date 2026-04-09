window.GAME_DATA = {
  board: {
    radius: 6,
    size: 48,
    centerX: 720,
    centerY: 470,
    blackHoleGlobalPull: true
  },
  classes: {
    warrior: { key:'warrior', name:'战士', hp:65, move:4, passive:'每回合首次造成 4 点以上有效伤害时，获得 2 点格挡。', deck:['warrior_charge','warrior_charge','warrior_rage','warrior_rage','warrior_execute','warrior_throw','warrior_throw','warrior_enrage','warrior_enrage','warrior_hamstring','warrior_hamstring','block_d6','block_d6','block_d6','block_d6'] },
    mage: { key:'mage', name:'法师', hp:45, move:5, passive:'基础移动超过 3 格后，本回合不能再发动技能。', deck:['mage_fireball','mage_fireball','mage_nova','mage_nova','mage_nova','mage_polymorph','mage_polymorph','mage_blink','mage_blink','mage_lightning','mage_phase','mage_phase','block_d4','block_d4','block_d4','block_d4'] },
    rogue: { key:'rogue', name:'盗贼', hp:55, move:5, passive:'普攻命中被控制目标时，额外造成 1D4 伤害。', deck:['rogue_ambush','rogue_ambush','rogue_disarm','rogue_disarm','rogue_assassinate','rogue_assassinate','rogue_assassinate','rogue_step','rogue_step','rogue_bloodmix','rogue_bloodmix','rogue_feast','block_d2','block_d2','block_d2','block_d2'] },
    swordsman: { key:'swordsman', name:'剑客', hp:55, move:4, passive:'若本回合未进行普通攻击，则下一次普通攻击或技能额外 +5 伤害。', deck:['sword_parry','sword_parry','sword_read','sword_read','sword_flash','sword_flash','sword_sheathe','sword_sheathe','block_d4','block_d4','block_d4','block_d4'] },
    priest: { key:'priest', name:'牧师', hp:55, move:5, passive:'第 4 次治疗会额外恢复 1D6。', deck:['priest_smite','priest_smite','priest_heal','priest_heal','priest_pain','priest_pain','priest_stance','priest_stance','priest_shield','priest_shield','block_d4','block_d4','block_d4','block_d4'] },
    shaman: { key:'shaman', name:'萨满', hp:60, move:4, passive:'普通攻击可以附带点燃。', deck:['shaman_shock','shaman_shock','shaman_windfury','shaman_windfury','shaman_form','shaman_form','shaman_earth','shaman_earth','shaman_bloodlust','shaman_bloodlust','block_d4','block_d4','block_d4','block_d4'] },
    necro: { key:'necro', name:'死灵法师', hp:60, move:4, passive:'召唤流占位，当前以亡灵护甲近似实现。', deck:['necro_skeleton','necro_skeleton','necro_bonedragon','necro_bonedragon','necro_burst','necro_burst','necro_shield','necro_shield','necro_spear','necro_spear','block_d4','block_d4','block_d4','block_d4'] },
    warlock: { key:'warlock', name:'木士', hp:55, move:5, passive:'每回合可支付 4 生命额外抽 1 张牌。', deck:['lock_soulfire','lock_soulfire','lock_dash','lock_dash','lock_corrode','lock_corrode','lock_drain','lock_drain','lock_flame','lock_flame','block_d4','block_d4','block_d4','block_d4'] }
  },
  weapons: {
    greatsword: { key:'greatsword', name:'巨剑', basic:{name:'巨剑普攻', damage:'2d6', range:1, straight:false, type:'近战'}, deck:['greatsword_crush','greatsword_crush','greatsword_crush','greatsword_crush','weapon_charge'] },
    greataxe: { key:'greataxe', name:'战斧', basic:{name:'战斧普攻', damage:'1d12', range:1, straight:false, type:'近战'}, deck:['axe_split','axe_split','axe_split','axe_bloodrage','axe_bloodrage','axe_step','axe_step'] },
    wand: { key:'wand', name:'魔杖', basic:{name:'魔杖普攻', damage:'1d6', range:6, straight:true, type:'远程直线'}, deck:['wand_bolt','wand_bolt','wand_bolt','wand_void','wand_void','wand_void'] },
    longbow: { key:'longbow', name:'长弓', basic:{name:'长弓普攻', damage:'1d6', range:6, straight:true, type:'远程直线'}, deck:['bow_step','bow_step','bow_step','bow_step','bow_pin','bow_pin','bow_pin'] },
    dagger: { key:'dagger', name:'匕首', basic:{name:'匕首普攻', damage:'2d4', range:1, straight:false, type:'近战'}, deck:['dagger_step','dagger_step','dagger_step','dagger_poison','dagger_poison','dagger_poison'] },
    swordshield: { key:'swordshield', name:'剑盾', basic:{name:'剑盾普攻', damage:'1d6', range:1, straight:false, type:'近战'}, deck:['shield_block_w','shield_block_w','shield_block_w','shield_block_w','shield_rush','shield_rush'] },
    katana: { key:'katana', name:'武士刀', basic:{name:'武士刀普攻', damage:'1d8', range:1, straight:false, type:'近战'}, deck:['katana_cut','katana_cut','katana_cut','katana_dash','katana_dash','katana_qi'] }
  },
  accessories: {
    lincoln: { key:'lincoln', name:'林肯法球', deck:['acc_nullify','acc_nullify','acc_nullify'] },
    trapbag: { key:'trapbag', name:'口袋陷阱', deck:['acc_trap','acc_trap','acc_trap','acc_trap'] },
    hope: { key:'hope', name:'希望曙光', deck:['acc_hope','acc_hope','acc_hope','acc_hope'] },
    forcestaff: { key:'forcestaff', name:'原力法杖', deck:['acc_push','acc_push','acc_push'] },
    lightning: { key:'lightning', name:'闪电权杖', deck:['acc_lightning_shield','acc_lightning_shield','acc_lightning_shield'] },
    livingshield: { key:'livingshield', name:'活化盾牌', deck:['acc_auto_block','acc_auto_block','acc_auto_block'] },
    armorbreak: { key:'armorbreak', name:'破甲匕首', deck:['acc_break_armor','acc_break_armor','acc_break_armor'] },
    dogdice: { key:'dogdice', name:'汪汪骰子', deck:['acc_lucky','acc_lucky','acc_lucky'] }
  },
  races: {
    elf: { key:'elf', name:'精灵', onBuild:'move+1', text:'基础移动 +1。' },
    dwarf: { key:'dwarf', name:'矮人', onBuild:'hp+14', text:'最大生命 +14。' },
    human: { key:'human', name:'人类', onBuild:'randomClass2', text:'额外获得 2 张随机职业牌。' },
    orc: { key:'orc', name:'兽人', onBuild:'orc2', text:'每局前 2 次伤害事件 +2。' },
    gnome: { key:'gnome', name:'侏儒', onBuild:'randomAccessory2', text:'额外获得 2 张随机饰品牌。' }
  },
  guardians: {
    lilith: { key:'lilith', name:'莉莉丝', text:'每回合首次造成 4 点以上有效伤害时，回复 1 生命并获得 1 格挡。', onBuild:null },
    jaina: { key:'jaina', name:'吉安娜', text:'自己的第 1/4/7... 回合开始时额外抽 1 张牌。', onBuild:null },
    trickster: { key:'trickster', name:'欺诈者', text:'加入 1 张时光倒流。', onBuild:'rewind1' },
    barbarian: { key:'barbarian', name:'野蛮人', text:'加入 2 张狂暴。', onBuild:'frenzy2' },
    voidsoul: { key:'voidsoul', name:'虚空之魂', text:'造成高额伤害时向对方牌库塞入虚空。', onBuild:null }
  },
  cards: {
    block_d6:{name:'1D6 格挡', module:'职业', category:'block', target:'self', text:'抽到时自动使用，获得 1D6 格挡。', block:'1d6'},
    block_d4:{name:'1D4 格挡', module:'职业', category:'block', target:'self', text:'抽到时自动使用，获得 1D4 格挡。', block:'1d4'},
    block_d2:{name:'1D2 格挡', module:'职业', category:'block', target:'self', text:'抽到时自动使用，获得 1D2 格挡。', block:'1d2'},
    shield_block_w:{name:'1D8 格挡', module:'武器', category:'block', target:'self', text:'抽到时自动使用，获得 1D8 格挡。', block:'1d8'},
    warrior_charge:{name:'冲锋', module:'职业', category:'skill', target:'enemy', range:3, text:'冲向目标并造成 1D6 伤害；下次普攻 +2。', fx:'dashHit', damage:'1d6', buffBasic:2},
    warrior_rage:{name:'暴怒/强力射击', module:'职业', category:'skill', target:'self', text:'本回合下次普攻 +3。', fx:'buffBasic', buffBasic:3},
    warrior_execute:{name:'斩杀', module:'职业', category:'skill', target:'enemy', range:1, text:'近战造成 4D4 伤害。', fx:'damage', damage:'4d4'},
    warrior_throw:{name:'英勇投掷/二连斩', module:'职业', category:'skill', target:'enemy', range:3, text:'远程模式：2D3 伤害并下次普攻 +1。近战模式：本回合普通攻击次数改为 2。', fx:'dualThrowSlash', damage:'2d3'},
    warrior_enrage:{name:'激怒', module:'职业', category:'skill', target:'self', text:'获得 1D4 格挡；下次普攻 +2。', fx:'blockAndBuff', block:'1d4', buffBasic:2},
    warrior_hamstring:{name:'断筋', module:'职业', category:'skill', target:'enemy', range:1, text:'造成 1D4 伤害并减速 1 回合。', fx:'damage', damage:'1d4', apply:{slow:1}},
    mage_fireball:{name:'火球', module:'职业', category:'skill', target:'enemy', range:5, text:'造成 1D8 伤害并点燃 2 回合。', fx:'damage', damage:'1d8', spell:true, apply:{burn:2}},
    mage_nova:{name:'冰霜新星', module:'职业', category:'skill', target:'tile', range:2, text:'目标点半径 1 内敌人受到 2D4 伤害并减速。', fx:'aoe', damage:'2d4', radius:1, spell:true, apply:{slow:1}},
    mage_polymorph:{name:'变羊', module:'职业', category:'skill', target:'enemy', range:5, text:'目标跳过下个回合。', fx:'status', spell:true, apply:{sheep:1}},
    mage_blink:{name:'闪现', module:'职业', category:'skill', target:'tile', range:4, text:'传送到 4 格内空位。', fx:'teleport'},
    mage_lightning:{name:'雷击', module:'职业', category:'skill', target:'enemy', range:5, text:'造成 1D12+4 伤害。', fx:'damage', damage:'1d12+4', spell:true},
    mage_phase:{name:'相位转移', module:'职业', category:'skill', target:'tile', range:3, text:'获得法术无效并传送。', fx:'teleportNull'},
    rogue_ambush:{name:'偷袭', module:'职业', category:'skill', target:'enemy', range:1, text:'造成 1D4 伤害；若本回合已移动，再额外 1D4。', fx:'ambush'},
    rogue_disarm:{name:'缴械', module:'职业', category:'skill', target:'enemy', range:1, text:'造成 1D6 伤害并缴械 1 回合。', fx:'damage', damage:'1d6', apply:{disarm:1}},
    rogue_assassinate:{name:'刺杀', module:'职业', category:'skill', target:'enemy', range:1, text:'造成 2D8 伤害；若目标被控制，再 +2。', fx:'assassinate'},
    rogue_step:{name:'瞬步', module:'职业', category:'skill', target:'tile', range:4, text:'传送到 4 格内空位。', fx:'teleport'},
    rogue_bloodmix:{name:'血腥合剂', module:'职业', category:'skill', target:'self', text:'恢复 1D6；下次普攻额外 +1D4。', fx:'healBuff', heal:'1d6', bonusDie:'1d4'},
    rogue_feast:{name:'杀戮盛宴', module:'职业', category:'skill', target:'enemy', range:6, text:'造成 1D6 伤害；若目标生命 ≤15，再额外 1D6。', fx:'finisher', damage:'1d6', bonus:'1d6'}
  }
};
