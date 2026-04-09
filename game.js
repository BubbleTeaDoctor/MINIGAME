(() => {
  const $ = (id) => document.getElementById(id);
  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
  const svgNS = 'http://www.w3.org/2000/svg';

  const state = {
    players: [],
    currentPlayerIndex: 0,
    board: [],
    boardMap: new Map(),
    traps: new Map(),
    selectedCardIndex: null,
    pendingAction: null,
    winner: null,
    turnCounter: 0,
  };

  const MODULES = {
    classes: {
      warrior: {
        key: 'warrior',
        name: '战士',
        hp: 65,
        move: 4,
        blockDie: '1d6',
        passiveText: '每回合首次造成 4 点以上有效伤害时，获得 2 点格挡。',
        deck: [
          'warrior_charge', 'warrior_charge',
          'warrior_rage', 'warrior_rage',
          'warrior_execute',
          'warrior_throw', 'warrior_throw',
          'warrior_enrage', 'warrior_enrage',
          'warrior_hamstring', 'warrior_hamstring',
          'block_d6', 'block_d6', 'block_d6', 'block_d6'
        ]
      },
      mage: {
        key: 'mage',
        name: '法师',
        hp: 45,
        move: 5,
        blockDie: '1d4',
        passiveText: '每使用 3 张技能牌，下回合额外获得 1 次技能动作。',
        deck: [
          'mage_fireball', 'mage_fireball',
          'mage_nova', 'mage_nova', 'mage_nova',
          'mage_polymorph', 'mage_polymorph',
          'mage_blink', 'mage_blink',
          'mage_lightning',
          'mage_phase', 'mage_phase',
          'block_d4', 'block_d4', 'block_d4', 'block_d4'
        ]
      },
      rogue: {
        key: 'rogue',
        name: '盗贼',
        hp: 55,
        move: 5,
        blockDie: '1d2',
        passiveText: '普通攻击命中被控制目标时，额外造成 1D4 伤害。',
        deck: [
          'rogue_ambush', 'rogue_ambush',
          'rogue_disarm', 'rogue_disarm',
          'rogue_assassinate', 'rogue_assassinate', 'rogue_assassinate',
          'rogue_step', 'rogue_step',
          'rogue_bloodmix', 'rogue_bloodmix',
          'rogue_feast',
          'block_d2', 'block_d2', 'block_d2', 'block_d2'
        ]
      }
    },
    weapons: {
      greatsword: {
        key: 'greatsword',
        name: '巨剑',
        basic: { name: '巨剑普攻', damage: '2d6', range: 1, straight: false, melee: true },
        deck: ['greatsword_crush', 'greatsword_crush', 'greatsword_crush', 'greatsword_crush', 'weapon_charge']
      },
      longbow: {
        key: 'longbow',
        name: '长弓',
        basic: { name: '长弓普攻', damage: '1d6', range: 6, straight: true, melee: false },
        deck: ['bow_step', 'bow_step', 'bow_step', 'bow_step', 'bow_pin', 'bow_pin', 'bow_pin']
      },
      swordshield: {
        key: 'swordshield',
        name: '剑盾',
        basic: { name: '剑盾普攻', damage: '1d6', range: 1, straight: false, melee: true },
        deck: ['shield_block', 'shield_block', 'shield_block', 'shield_block', 'shield_rush', 'shield_rush']
      }
    },
    accessories: {
      lincoln: {
        key: 'lincoln',
        name: '林肯法球',
        deck: ['orb_nullify', 'orb_nullify', 'orb_nullify']
      },
      trapbag: {
        key: 'trapbag',
        name: '口袋陷阱',
        deck: ['spike_trap_card', 'spike_trap_card', 'spike_trap_card', 'spike_trap_card']
      },
      hope: {
        key: 'hope',
        name: '希望曙光',
        deck: ['hope_dawn', 'hope_dawn', 'hope_dawn', 'hope_dawn']
      }
    },
    races: {
      elf: { key: 'elf', name: '精灵', description: '基础移动 +1。', onBuild(player) { player.moveBase += 1; } },
      dwarf: { key: 'dwarf', name: '矮人', description: '最大生命值 +14。', onBuild(player) { player.maxHp += 14; player.hp += 14; } },
      human: { key: 'human', name: '人类', description: '额外获得 2 张随机其他职业技能卡。', onBuild(player) {
        const pool = getAllClassSkillIds().filter((id) => !id.startsWith('block_'));
        for (let i = 0; i < 2; i += 1) player.deck.push(randomItem(pool));
      } },
      orc: { key: 'orc', name: '兽人', description: '每局两次，首次伤害事件自动 +2。', onBuild(player) { player.raceData.orcCharges = 2; } }
    },
    guardians: {
      lilith: { key: 'lilith', name: '莉莉丝', description: '每回合首次造成 4 点以上有效伤害时，回复 1 点生命并获得 1 点格挡。', passive: 'lilith' },
      jaina: { key: 'jaina', name: '吉安娜', description: '第 1、4、7... 个自己回合开始时额外抽 1 张牌。', passive: 'jaina' },
      trickster: { key: 'trickster', name: '欺诈者', description: '牌库中加入 1 张时光倒流。', onBuild(player) { player.deck.push('guardian_rewind'); } },
      barbarian: { key: 'barbarian', name: '野蛮人', description: '牌库中加入 2 张狂暴。', onBuild(player) { player.deck.push('guardian_frenzy', 'guardian_frenzy'); } }
    }
  };

  const CARDS = {
    block_d6: card('1D6 格挡', '职业', 'block', 'self', { text: '获得 1D6 格挡。', block: '1d6' }),
    block_d4: card('1D4 格挡', '职业', 'block', 'self', { text: '获得 1D4 格挡。', block: '1d4' }),
    block_d2: card('1D2 格挡', '职业', 'block', 'self', { text: '获得 1D2 格挡。', block: '1d2' }),

    warrior_charge: card('冲锋', '职业', 'skill', 'enemy', { range: 3, text: '冲向目标并造成 1D6 伤害；下次普通攻击 +2 伤害。', effect: 'moveAndAttackAdjacent', damage: '1d6', nextBasicFlat: 2 }),
    warrior_rage: card('暴怒/强力射击', '职业', 'skill', 'self', { text: '本回合下一次普通攻击 +3 伤害。', effect: 'selfBuff', nextBasicFlat: 3 }),
    warrior_execute: card('斩杀', '职业', 'skill', 'enemy', { range: 1, text: '近战，造成 4D4 伤害。', effect: 'damage', damage: '4d4' }),
    warrior_throw: card('英勇投掷/二连斩', '职业', 'skill', 'enemy', { range: 3, text: '远程造成 2D3 伤害；下次普通攻击 +1 伤害。', effect: 'damage', damage: '2d3', nextBasicFlat: 1 }),
    warrior_enrage: card('激怒', '职业', 'skill', 'self', { text: '获得 1D4 格挡；下次普通攻击 +2 伤害。', effect: 'gainBlockAndBuff', block: '1d4', nextBasicFlat: 2 }),
    warrior_hamstring: card('断筋', '职业', 'skill', 'enemy', { range: 1, text: '近战造成 1D4 伤害并使目标减速 1 回合。', effect: 'damage', damage: '1d4', status: { slow: 1 } }),

    mage_fireball: card('火球', '职业', 'skill', 'enemy', { range: 5, spell: true, text: '远程造成 1D8 伤害并点燃目标 2 回合。', effect: 'damage', damage: '1d8', status: { burn: 2 } }),
    mage_nova: card('冰霜新星', '职业', 'skill', 'tile', { range: 2, spell: true, text: '指定 2 格内区域，半径 1 内敌人受到 2D4 伤害并减速。', effect: 'aoe', damage: '2d4', radius: 1, status: { slow: 1 } }),
    mage_polymorph: card('变羊', '职业', 'skill', 'enemy', { range: 5, spell: true, text: '目标变羊，跳过下个回合。', effect: 'statusOnly', status: { sheep: 1 } }),
    mage_blink: card('闪现', '职业', 'skill', 'tile', { range: 4, spell: true, text: '传送到 4 格内空位。', effect: 'teleport' }),
    mage_lightning: card('雷击', '职业', 'skill', 'enemy', { range: 5, spell: true, text: '远程造成 1D12+4 伤害。', effect: 'damage', damage: '1d12+4' }),
    mage_phase: card('相位转移', '职业', 'skill', 'tile', { range: 3, spell: true, text: '获得法术无效，并传送到 3 格内空位。', effect: 'teleportAndNullify' }),

    rogue_ambush: card('偷袭', '职业', 'skill', 'enemy', { range: 1, text: '近战造成 1D4 伤害；若本回合已移动，再额外造成 1D4。', effect: 'ambush' }),
    rogue_disarm: card('缴械', '职业', 'skill', 'enemy', { range: 1, text: '近战造成 1D6 伤害并缴械目标 1 回合。', effect: 'damage', damage: '1d6', status: { disarm: 1 } }),
    rogue_assassinate: card('刺杀', '职业', 'skill', 'enemy', { range: 1, text: '近战造成 2D8 伤害；若目标被控制，再额外 +2。', effect: 'assassinate' }),
    rogue_step: card('瞬步', '职业', 'skill', 'tile', { range: 4, text: '传送到 4 格内空位。', effect: 'teleport' }),
    rogue_bloodmix: card('血腥合剂', '职业', 'skill', 'self', { text: '恢复 1D6 生命；下次普通攻击额外造成 1D4 伤害。', effect: 'healAndBuff', heal: '1d6', nextBasicDice: '1d4' }),
    rogue_feast: card('杀戮盛宴', '职业', 'skill', 'enemy', { range: 6, text: '远程造成 1D6 伤害；若目标生命 ≤15，再额外造成 1D6。', effect: 'feast', damage: '1d6', bonusDamage: '1d6' }),

    greatsword_crush: card('碾压打击', '武器', 'skill', 'enemy', { range: 1, text: '近战造成 1D6+1 伤害。', effect: 'damage', damage: '1d6+1' }),
    weapon_charge: card('冲锋', '武器', 'skill', 'enemy', { range: 3, text: '冲向目标并造成 1D6 伤害。', effect: 'moveAndAttackAdjacent', damage: '1d6' }),
    bow_step: card('滑步', '武器', 'skill', 'tile', { range: 2, text: '移动到 2 格内空位。', effect: 'teleport' }),
    bow_pin: card('钉刺射击', '武器', 'skill', 'enemy', { range: 6, straight: true, text: '直线射击造成 1D4 伤害，并使目标减速。', effect: 'damage', damage: '1d4', status: { slow: 1 } }),
    shield_block: card('1D8 格挡', '武器', 'block', 'self', { text: '获得 1D8 格挡。', block: '1d8' }),
    shield_rush: card('持盾冲锋', '武器', 'skill', 'enemy', { range: 2, text: '冲向目标造成 1D4 伤害，并获得 1D8 格挡。', effect: 'moveAndAttackAdjacent', damage: '1d4', gainBlock: '1d8' }),

    orb_nullify: card('法术无效', '饰品', 'accessory', 'self', { text: '获得法术无效，直到你的下回合开始。', effect: 'nullify' }),
    spike_trap_card: card('尖刺陷阱', '饰品', 'accessory', 'tile', { range: 3, text: '放置一个尖刺陷阱，敌人踩中时受到 2D6 伤害并减速。', effect: 'placeTrap' }),
    hope_dawn: card('曙光', '饰品', 'accessory', 'self', { text: '恢复 4 点生命并获得 2 点格挡。', effect: 'healAndBlock', healFlat: 4, blockFlat: 2 }),

    guardian_frenzy: card('狂暴', '守护神', 'skill', 'self', { text: '本回合下一次普通攻击 +2；额外获得 1 次普通攻击；本回合不能进行基础移动。', effect: 'guardianFrenzy' }),
    guardian_rewind: card('时光倒流', '守护神', 'skill', 'self', { text: '回到你上回合开始时的位置、生命与格挡状态。', effect: 'rewind' }),
  };

  function card(name, module, category, target, extra = {}) {
    return { name, module, category, target, range: extra.range ?? 0, straight: !!extra.straight, ...extra };
  }

  function getAllClassSkillIds() {
    return Object.values(MODULES.classes).flatMap((entry) => entry.deck);
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function rollDice(notation) {
    const match = notation.toLowerCase().match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return Number(notation) || 0;
    const count = Number(match[1]);
    const sides = Number(match[2]);
    const mod = match[3] ? Number(match[3]) : 0;
    let total = mod;
    for (let i = 0; i < count; i += 1) total += 1 + Math.floor(Math.random() * sides);
    return total;
  }

  function coordKey(coord) {
    return `${coord.q},${coord.r}`;
  }

  function parseKey(key) {
    const [q, r] = key.split(',').map(Number);
    return { q, r };
  }

  function cubeS(coord) {
    return -coord.q - coord.r;
  }

  function distance(a, b) {
    return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(cubeS(a) - cubeS(b)));
  }

  function isStraightLine(a, b) {
    return a.q === b.q || a.r === b.r || cubeS(a) === cubeS(b);
  }

  function neighbors(coord) {
    const dirs = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];
    return dirs.map((d) => ({ q: coord.q + d.q, r: coord.r + d.r }));
  }

  function createBoard(radius = 4) {
    const tiles = [];
    for (let q = -radius; q <= radius; q += 1) {
      for (let r = -radius; r <= radius; r += 1) {
        const s = -q - r;
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= radius) {
          const type = tileTypeFor({ q, r });
          tiles.push({ q, r, type });
        }
      }
    }
    return tiles;
  }

  function tileTypeFor(coord) {
    const key = coordKey(coord);
    if (key === '0,0') return 'center';
    if (['-2,1', '-1,-1', '2,-1', '1,2'].includes(key)) return 'spike';
    if (key === '-4,0' || key === '4,0') return 'start';
    return 'plain';
  }

  function hexToPixel(coord, size = 42) {
    const x = 450 + size * Math.sqrt(3) * (coord.q + coord.r / 2);
    const y = 330 + size * 1.5 * coord.r;
    return { x, y };
  }

  function hexPoints(x, y, size = 42) {
    const pts = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = Math.PI / 180 * (60 * i - 30);
      pts.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
    }
    return pts.join(' ');
  }

  function getPlayerAt(coord) {
    return state.players.find((p) => p.alive && p.position.q === coord.q && p.position.r === coord.r) || null;
  }

  function getEnemy(player) {
    return state.players.find((p) => p.id !== player.id && p.alive);
  }

  function currentPlayer() {
    return state.players[state.currentPlayerIndex];
  }

  function log(message) {
    const box = $('log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    box.prepend(entry);
  }

  function buildPlayer(slot, build, startCoord) {
    const classData = MODULES.classes[build.classKey];
    const weaponData = MODULES.weapons[build.weaponKey];
    const accessoryData = MODULES.accessories[build.accessoryKey];
    const raceData = MODULES.races[build.raceKey];
    const guardianData = MODULES.guardians[build.guardianKey];

    const player = {
      id: slot,
      label: `玩家 ${slot}`,
      color: slot === 1 ? '#65a9ff' : '#ff8aa8',
      classKey: build.classKey,
      weaponKey: build.weaponKey,
      accessoryKey: build.accessoryKey,
      raceKey: build.raceKey,
      guardianKey: build.guardianKey,
      classData,
      weaponData,
      accessoryData,
      raceData: {},
      guardianData: {},
      maxHp: classData.hp,
      hp: classData.hp,
      moveBase: classData.move,
      block: 0,
      deck: [...classData.deck, ...weaponData.deck, ...accessoryData.deck],
      discard: [],
      hand: [],
      position: deepCopy(startCoord),
      alive: true,
      statuses: { burn: 0, slow: 0, sheep: 0, disarm: 0 },
      buffs: {
        nextBasicFlat: 0,
        nextBasicDice: null,
        spellImmune: false,
        extraBasicAttacks: 0,
        extraSkillActions: 0,
        lockMove: false,
      },
      actions: {
        move: false,
        skill: false,
        accessory: false,
        basic: false,
        block: false,
      },
      oncePerTurn: { classPassive: false, guardianPassive: false },
      counters: {
        skillsPlayed: 0,
        turnsTaken: 0,
      },
      lastSnapshot: null,
    };

    if (raceData.onBuild) raceData.onBuild(player);
    if (guardianData.onBuild) guardianData.onBuild(player);

    player.hp = player.maxHp;
    shuffle(player.deck);
    drawCards(player, 4);
    return player;
  }

  function drawCards(player, amount) {
    for (let i = 0; i < amount; i += 1) {
      if (player.deck.length === 0) {
        if (player.discard.length === 0) return;
        player.deck = shuffle(player.discard.splice(0));
        log(`${player.label} 重新洗混弃牌堆。`);
      }
      const cardId = player.deck.shift();
      player.hand.push(cardId);
    }
  }

  function startNewGame() {
    state.board = createBoard(4);
    state.boardMap = new Map(state.board.map((tile) => [coordKey(tile), tile]));
    state.traps = new Map();
    state.selectedCardIndex = null;
    state.pendingAction = null;
    state.winner = null;
    state.turnCounter = 0;

    state.players = [
      buildPlayer(1, collectBuild(1), { q: -4, r: 0 }),
      buildPlayer(2, collectBuild(2), { q: 4, r: 0 })
    ];

    state.currentPlayerIndex = 0;
    $('setup-panel').classList.add('hidden');
    $('game-screen').classList.remove('hidden');
    $('log').innerHTML = '';
    log('对局开始。');
    startTurn();
  }

  function collectBuild(slot) {
    return {
      classKey: $(`p${slot}-class`).value,
      weaponKey: $(`p${slot}-weapon`).value,
      accessoryKey: $(`p${slot}-accessory`).value,
      raceKey: $(`p${slot}-race`).value,
      guardianKey: $(`p${slot}-guardian`).value,
    };
  }

  function startTurn() {
    if (state.winner) return;
    const player = currentPlayer();
    if (!player.alive) return advanceTurn();
    const enemy = getEnemy(player);
    state.turnCounter += 1;

    player.counters.turnsTaken += 1;
    player.block = 0;
    player.oncePerTurn.classPassive = false;
    player.oncePerTurn.guardianPassive = false;
    player.actions = {
      move: false,
      skill: false,
      accessory: false,
      basic: false,
      block: false,
    };
    player.buffs.lockMove = false;
    player.buffs.spellImmune = false;
    if (player.buffs.extraSkillActions > 0) player.buffs.extraSkillActions -= 1;

    applyBlackHolePull();
    if (state.winner) return;

    if (player.statuses.burn > 0) {
      const burnDmg = 2;
      log(`${player.label} 受到点燃伤害 ${burnDmg}。`);
      applyDamage(null, player, burnDmg, { sourceName: '点燃' });
      player.statuses.burn -= 1;
      if (state.winner) return;
    }

    drawCards(player, 1);
    if (player.guardianKey === 'jaina' && (player.counters.turnsTaken - 1) % 3 === 0) {
      drawCards(player, 1);
      log(`${player.label} 的吉安娜额外抽 1 张牌。`);
    }

    player.lastSnapshot = {
      hp: player.hp,
      block: player.block,
      position: deepCopy(player.position),
      statuses: deepCopy(player.statuses),
      buffs: deepCopy({
        nextBasicFlat: player.buffs.nextBasicFlat,
        nextBasicDice: player.buffs.nextBasicDice,
      }),
    };

    if (player.statuses.sheep > 0) {
      player.statuses.sheep -= 1;
      log(`${player.label} 处于变羊状态，跳过本回合。`);
      render();
      setHint('该单位被变羊，回合已被跳过。');
      setTimeout(() => endTurn(), 500);
      return;
    }

    if (enemy && enemy.alive) log(`轮到 ${player.label} 行动。`);
    render();
    setHint('点击可到达空格进行基础移动，或使用手牌 / 普攻。');
  }

  function applyBlackHolePull() {
    const center = { q: 0, r: 0 };
    for (const player of state.players) {
      if (!player.alive) continue;
      const before = deepCopy(player.position);
      const next = nextStepToward(player.position, center, player);
      if (next && coordKey(next) !== coordKey(player.position)) {
        player.position = next;
        log(`${player.label} 被黑洞牵引。`);
        onEnterTile(player, true);
        if (state.winner) return;
      }
      if (coordKey(before) !== coordKey(player.position)) renderBoardOnly();
    }
  }

  function nextStepToward(from, target, player) {
    const choices = neighbors(from)
      .filter((coord) => state.boardMap.has(coordKey(coord)))
      .filter((coord) => {
        const occupant = getPlayerAt(coord);
        return !occupant || occupant.id === player.id;
      })
      .sort((a, b) => distance(a, target) - distance(b, target));
    return choices[0] || from;
  }

  function setHint(text) {
    $('selection-hint').textContent = text;
  }

  function render() {
    renderInfo();
    renderBoard();
    renderHand();
  }

  function renderInfo() {
    const active = currentPlayer();
    const container = $('player-info');
    container.innerHTML = '<h2>角色状态</h2>';
    const grid = document.createElement('div');
    grid.className = 'info-grid';

    for (const player of state.players) {
      const box = document.createElement('div');
      box.className = 'player-box' + (player.id === active.id ? ' active' : '');
      const hpPct = Math.max(0, Math.min(100, player.maxHp ? (player.hp / player.maxHp) * 100 : 0));
      const blockPct = Math.max(0, Math.min(100, player.block * 10));
      box.innerHTML = `
        <div class="player-title">
          <strong>${player.label}</strong>
          <span>${player.classData.name} / ${player.weaponData.name}</span>
        </div>
        <div class="stat-line">生命 ${player.hp} / ${player.maxHp}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div></div>
        <div class="stat-line">格挡 ${player.block}</div>
        <div class="block-bar"><div class="block-fill" style="width:${blockPct}%"></div></div>
        <div class="stat-line">饰品：${player.accessoryData.name} ｜ 种族：${MODULES.races[player.raceKey].name}</div>
        <div class="stat-line">守护神：${MODULES.guardians[player.guardianKey].name}</div>
        <div class="stat-line">手牌 ${player.hand.length} ｜ 牌库 ${player.deck.length} ｜ 弃牌 ${player.discard.length}</div>
        <div class="stat-line">动作：${formatActions(player.actions, player)}</div>
        <div>${formatStatuses(player)}</div>
        <div class="footer-note">${player.classData.passiveText}</div>
      `;
      grid.appendChild(box);
    }
    container.appendChild(grid);
  }

  function formatActions(actions, player) {
    const skillTotal = 1 + player.buffs.extraSkillActions;
    const skillUsed = actions.skill ? 1 : 0;
    return `移动 ${actions.move ? '✓' : '○'} / 技能 ${skillUsed}/${skillTotal} / 普攻 ${actions.basic ? '✓' : '○'} / 饰品 ${actions.accessory ? '✓' : '○'} / 格挡 ${actions.block ? '✓' : '○'}`;
  }

  function formatStatuses(player) {
    const chips = [];
    if (player.statuses.burn > 0) chips.push(`<span class="status-chip">点燃 ${player.statuses.burn}</span>`);
    if (player.statuses.slow > 0) chips.push(`<span class="status-chip">减速</span>`);
    if (player.statuses.sheep > 0) chips.push(`<span class="status-chip">变羊</span>`);
    if (player.statuses.disarm > 0) chips.push(`<span class="status-chip">缴械</span>`);
    if (player.buffs.spellImmune) chips.push('<span class="status-chip">法术无效</span>');
    if (player.buffs.nextBasicFlat > 0) chips.push(`<span class="status-chip">下次普攻 +${player.buffs.nextBasicFlat}</span>`);
    if (player.buffs.nextBasicDice) chips.push(`<span class="status-chip">下次普攻 +${player.buffs.nextBasicDice.toUpperCase()}</span>`);
    if (player.buffs.extraBasicAttacks > 0) chips.push(`<span class="status-chip">额外普攻 ${player.buffs.extraBasicAttacks}</span>`);
    if (player.raceData.orcCharges > 0) chips.push(`<span class="status-chip">兽人狂暴余 ${player.raceData.orcCharges}</span>`);
    return chips.join('') || '<span class="status-chip">无状态</span>';
  }

  function renderBoardOnly() {
    renderBoard();
  }

  function renderBoard() {
    const svg = $('board');
    svg.innerHTML = '';
    const validKeys = getHighlightedTiles();

    state.board.forEach((tile) => {
      const { x, y } = hexToPixel(tile);
      const group = document.createElementNS(svgNS, 'g');
      group.classList.add('tile');
      if (validKeys.has(coordKey(tile))) group.classList.add('valid-target');
      group.dataset.key = coordKey(tile);
      group.addEventListener('click', () => onTileClick(tile));

      const poly = document.createElementNS(svgNS, 'polygon');
      poly.setAttribute('points', hexPoints(x, y));
      poly.setAttribute('fill', tileFill(tile));
      poly.setAttribute('opacity', '0.94');
      group.appendChild(poly);

      if (tile.type === 'center') {
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y + 4);
        t.setAttribute('text-anchor', 'middle');
        t.textContent = '黑洞';
        group.appendChild(t);
      }

      if (tile.type === 'spike') {
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y + 4);
        t.setAttribute('text-anchor', 'middle');
        t.textContent = '刺';
        group.appendChild(t);
      }

      const trap = state.traps.get(coordKey(tile));
      if (trap) {
        const t = document.createElementNS(svgNS, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y - 18);
        t.setAttribute('text-anchor', 'middle');
        t.textContent = '陷阱';
        group.appendChild(t);
      }

      svg.appendChild(group);
    });

    state.players.filter((p) => p.alive).forEach((player) => {
      const { x, y } = hexToPixel(player.position);
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 20);
      circle.setAttribute('fill', player.color);
      circle.setAttribute('class', 'unit-circle');
      svg.appendChild(circle);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', y + 5);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'unit-label');
      label.textContent = player.id === 1 ? 'P1' : 'P2';
      svg.appendChild(label);

      const hp = document.createElementNS(svgNS, 'text');
      hp.setAttribute('x', x);
      hp.setAttribute('y', y + 34);
      hp.setAttribute('text-anchor', 'middle');
      hp.textContent = `HP ${player.hp} / 格挡 ${player.block}`;
      svg.appendChild(hp);
    });
  }

  function tileFill(tile) {
    if (tile.type === 'center') return '#6c3b75';
    if (tile.type === 'spike') return '#7d5353';
    if (tile.type === 'start') return '#465b3f';
    return '#3a4452';
  }

  function renderHand() {
    const player = currentPlayer();
    const hand = $('hand');
    hand.innerHTML = '';
    const template = $('card-template');

    player.hand.forEach((cardId, index) => {
      const data = CARDS[cardId];
      const node = template.content.firstElementChild.cloneNode(true);
      if (state.selectedCardIndex === index) node.classList.add('selected');
      node.querySelector('.card-name').textContent = data.name;
      node.querySelector('.card-meta').textContent = `${data.module} / ${categoryLabel(data.category)}${data.range ? ` / 距离 ${data.range}` : ''}`;
      node.querySelector('.card-text').textContent = data.text;
      node.addEventListener('click', () => onCardClick(index));
      hand.appendChild(node);
    });
  }

  function categoryLabel(category) {
    if (category === 'skill') return '技能';
    if (category === 'accessory') return '饰品';
    if (category === 'block') return '格挡';
    return category;
  }

  function onCardClick(index) {
    const player = currentPlayer();
    const cardId = player.hand[index];
    const cardData = CARDS[cardId];
    if (!cardData) return;

    if (!canUseCard(player, cardData)) {
      render();
      return;
    }

    if (cardData.target === 'self') {
      playCard(index, player, player.position);
      return;
    }

    if (cardData.target === 'none') {
      playCard(index, player, null);
      return;
    }

    state.selectedCardIndex = index;
    state.pendingAction = { type: 'card', cardIndex: index, cardId };
    render();
    setHint(`已选择 ${cardData.name}，请点击合法目标。`);
  }

  function onTileClick(tile) {
    if (state.winner) return;
    const player = currentPlayer();
    const occupant = getPlayerAt(tile);

    if (state.pendingAction?.type === 'basicAttack') {
      if (occupant && occupant.id !== player.id && isValidBasicTarget(player, occupant)) {
        executeBasicAttack(player, occupant);
      }
      return;
    }

    if (state.pendingAction?.type === 'card') {
      const card = CARDS[state.pendingAction.cardId];
      if (!card) return;
      if (!isTileValidForCard(player, card, tile, occupant)) return;
      playCard(state.pendingAction.cardIndex, player, tile);
      return;
    }

    if (!player.actions.move && !player.buffs.lockMove && !occupant) {
      const reachable = getReachableTiles(player);
      if (reachable.has(coordKey(tile))) {
        movePlayer(player, tile, '基础移动');
        player.actions.move = true;
        render();
        setHint('已完成基础移动。');
      }
    }
  }

  function getReachableTiles(player) {
    const maxMove = player.statuses.slow > 0 ? Math.ceil(player.moveBase / 2) : player.moveBase;
    const visited = new Set([coordKey(player.position)]);
    const frontier = [{ coord: player.position, dist: 0 }];
    const result = new Set();

    while (frontier.length) {
      const current = frontier.shift();
      if (current.dist >= maxMove) continue;
      for (const next of neighbors(current.coord)) {
        const key = coordKey(next);
        if (!state.boardMap.has(key) || visited.has(key)) continue;
        if (getPlayerAt(next)) continue;
        visited.add(key);
        result.add(key);
        frontier.push({ coord: next, dist: current.dist + 1 });
      }
    }
    return result;
  }

  function canUseCard(player, card) {
    if (card.category === 'skill') {
      const skillLimit = 1 + player.buffs.extraSkillActions;
      const skillUsed = player.actions.skill ? 1 : 0;
      if (skillUsed >= skillLimit) {
        setHint('本回合技能动作已用完。');
        return false;
      }
      if (['mage'].includes(player.classKey) && player.actions.move && lastBaseMoveDistance(player) > 3) {
        setHint('该职业本回合基础移动超过 3 格后不能再发动技能。');
        return false;
      }
    }
    if (card.category === 'accessory' && player.actions.accessory) {
      setHint('本回合饰品动作已用完。');
      return false;
    }
    if (card.category === 'block' && player.actions.block) {
      setHint('本回合已经宣告过格挡。');
      return false;
    }
    return true;
  }

  function lastBaseMoveDistance(player) {
    return player.lastBaseMoveDistance || 0;
  }

  function isTileValidForCard(player, card, tile, occupant) {
    if (card.target === 'enemy') {
      if (!occupant || occupant.id === player.id) return false;
      return canTargetEnemy(player, occupant, card);
    }
    if (card.target === 'tile') {
      if (distance(player.position, tile) > card.range) return false;
      if (card.effect === 'teleport' || card.effect === 'teleportAndNullify' || card.effect === 'placeTrap') return !occupant;
      return true;
    }
    return false;
  }

  function canTargetEnemy(player, targetPlayer, source) {
    const from = player.position;
    const to = targetPlayer.position;
    const range = source.range || 1;
    if (distance(from, to) > range) return false;
    if (source.straight && !isStraightLine(from, to)) return false;
    return true;
  }

  function playCard(handIndex, player, tile) {
    const cardId = player.hand[handIndex];
    const card = CARDS[cardId];
    const enemy = tile ? getPlayerAt(tile) : null;
    if (!card) return;

    const consumed = player.hand.splice(handIndex, 1)[0];
    player.discard.push(consumed);

    if (card.category === 'skill') player.actions.skill = true;
    if (card.category === 'accessory') player.actions.accessory = true;
    if (card.category === 'block') player.actions.block = true;

    player.counters.skillsPlayed += card.category === 'skill' ? 1 : 0;
    if (player.classKey === 'mage' && player.counters.skillsPlayed > 0 && player.counters.skillsPlayed % 3 === 0) {
      player.buffs.extraSkillActions += 1;
      log(`${player.label} 的法师被动已激活，下回合额外获得 1 次技能动作。`);
    }

    state.selectedCardIndex = null;
    state.pendingAction = null;

    resolveCard(card, player, tile, enemy);
    cleanupAfterAction();
  }

  function resolveCard(card, player, tile, enemy) {
    switch (card.effect) {
      case 'gainBlock':
        gainBlock(player, rollDice(card.block));
        log(`${player.label} 使用 ${card.name}，获得格挡。`);
        break;
      case 'selfBuff':
        if (card.nextBasicFlat) player.buffs.nextBasicFlat += card.nextBasicFlat;
        log(`${player.label} 使用 ${card.name}，强化下一次普通攻击。`);
        break;
      case 'gainBlockAndBuff':
        gainBlock(player, rollDice(card.block));
        player.buffs.nextBasicFlat += card.nextBasicFlat || 0;
        log(`${player.label} 使用 ${card.name}，获得格挡并强化普攻。`);
        break;
      case 'healAndBuff':
        healPlayer(player, rollDice(card.heal));
        player.buffs.nextBasicDice = card.nextBasicDice;
        log(`${player.label} 使用 ${card.name}，恢复生命并强化下一次普通攻击。`);
        break;
      case 'healAndBlock':
        healPlayer(player, card.healFlat || 0);
        gainBlock(player, card.blockFlat || 0);
        log(`${player.label} 使用 ${card.name}。`);
        break;
      case 'nullify':
        player.buffs.spellImmune = true;
        log(`${player.label} 获得法术无效。`);
        break;
      case 'teleport':
        movePlayer(player, tile, card.name, true);
        log(`${player.label} 使用 ${card.name}。`);
        break;
      case 'teleportAndNullify':
        player.buffs.spellImmune = true;
        movePlayer(player, tile, card.name, true);
        log(`${player.label} 使用 ${card.name}，并获得法术无效。`);
        break;
      case 'damage':
        directDamageCard(player, enemy, card);
        break;
      case 'statusOnly':
        if (checkSpellImmune(enemy, player, card)) break;
        applyStatus(enemy, card.status);
        log(`${player.label} 对 ${enemy.label} 使用 ${card.name}。`);
        break;
      case 'aoe':
        aoeCard(player, tile, card);
        break;
      case 'moveAndAttackAdjacent':
        moveAndAttackAdjacent(player, enemy, card);
        break;
      case 'ambush':
        ambushCard(player, enemy, card);
        break;
      case 'assassinate':
        assassinateCard(player, enemy, card);
        break;
      case 'feast':
        feastCard(player, enemy, card);
        break;
      case 'placeTrap':
        state.traps.set(coordKey(tile), { ownerId: player.id, damage: '2d6', status: { slow: 1 } });
        log(`${player.label} 放置了尖刺陷阱。`);
        break;
      case 'guardianFrenzy':
        player.buffs.nextBasicFlat += 2;
        player.buffs.extraBasicAttacks += 1;
        player.buffs.lockMove = true;
        player.actions.move = true;
        log(`${player.label} 进入狂暴，本回合额外获得 1 次普通攻击。`);
        break;
      case 'rewind':
        if (player.lastSnapshot) {
          player.hp = Math.min(player.maxHp, player.lastSnapshot.hp);
          player.block = player.lastSnapshot.block;
          player.position = deepCopy(player.lastSnapshot.position);
          player.statuses = deepCopy(player.lastSnapshot.statuses);
          player.buffs.nextBasicFlat = player.lastSnapshot.buffs.nextBasicFlat;
          player.buffs.nextBasicDice = player.lastSnapshot.buffs.nextBasicDice;
          log(`${player.label} 使用时光倒流，回到了上回合开始状态。`);
        }
        break;
      default:
        log(`${player.label} 使用了 ${card.name}。`);
    }
  }

  function directDamageCard(player, enemy, card) {
    if (!enemy) return;
    if (checkSpellImmune(enemy, player, card)) return;
    let dmg = rollDice(card.damage);
    dmg = applyAttackerDamageMods(player, dmg);
    const result = applyDamage(player, enemy, dmg, { sourceName: card.name, spell: !!card.spell, status: card.status });
    if (result.effective > 0 && card.nextBasicFlat) player.buffs.nextBasicFlat += card.nextBasicFlat;
    if (card.gainBlock) gainBlock(player, rollDice(card.gainBlock));
    log(`${player.label} 使用 ${card.name} 对 ${enemy.label} 造成 ${dmg} 点伤害。`);
  }

  function aoeCard(player, tile, card) {
    const targets = state.players.filter((p) => p.alive && p.id !== player.id && distance(p.position, tile) <= card.radius);
    if (targets.length === 0) {
      log(`${player.label} 使用 ${card.name}，但未命中任何目标。`);
      return;
    }
    for (const target of targets) {
      if (checkSpellImmune(target, player, card)) continue;
      const dmg = applyAttackerDamageMods(player, rollDice(card.damage));
      applyDamage(player, target, dmg, { sourceName: card.name, spell: !!card.spell, status: card.status });
      log(`${player.label} 的 ${card.name} 命中 ${target.label}，造成 ${dmg}。`);
      if (state.winner) return;
    }
  }

  function findAdjacentOpenTile(targetCoord, mover) {
    return neighbors(targetCoord)
      .filter((coord) => state.boardMap.has(coordKey(coord)))
      .filter((coord) => !getPlayerAt(coord) || getPlayerAt(coord).id === mover.id)
      .sort((a, b) => distance(mover.position, a) - distance(mover.position, b))[0] || null;
  }

  function moveAndAttackAdjacent(player, enemy, card) {
    if (!enemy) return;
    const adj = findAdjacentOpenTile(enemy.position, player);
    if (!adj) {
      log(`${card.name} 失败：目标周围没有空位。`);
      return;
    }
    movePlayer(player, adj, card.name, true);
    if (state.winner) return;
    if (distance(player.position, enemy.position) <= 1) {
      if (checkSpellImmune(enemy, player, card)) return;
      let dmg = applyAttackerDamageMods(player, rollDice(card.damage));
      applyDamage(player, enemy, dmg, { sourceName: card.name, spell: !!card.spell, status: card.status });
      if (card.nextBasicFlat) player.buffs.nextBasicFlat += card.nextBasicFlat;
      if (card.gainBlock) gainBlock(player, rollDice(card.gainBlock));
      log(`${player.label} 使用 ${card.name} 命中 ${enemy.label}，造成 ${dmg}。`);
    }
  }

  function ambushCard(player, enemy, card) {
    if (!enemy) return;
    let dmg = rollDice('1d4');
    if (player.actions.move) dmg += rollDice('1d4');
    dmg = applyAttackerDamageMods(player, dmg);
    applyDamage(player, enemy, dmg, { sourceName: card.name });
    log(`${player.label} 使用 ${card.name} 对 ${enemy.label} 造成 ${dmg}。`);
  }

  function assassinateCard(player, enemy, card) {
    if (!enemy) return;
    let dmg = rollDice('2d8');
    if (hasControl(enemy)) dmg += 2;
    dmg = applyAttackerDamageMods(player, dmg);
    applyDamage(player, enemy, dmg, { sourceName: card.name });
    log(`${player.label} 使用 ${card.name} 对 ${enemy.label} 造成 ${dmg}。`);
  }

  function feastCard(player, enemy, card) {
    if (!enemy) return;
    let dmg = rollDice(card.damage);
    if (enemy.hp <= 15) dmg += rollDice(card.bonusDamage);
    dmg = applyAttackerDamageMods(player, dmg);
    applyDamage(player, enemy, dmg, { sourceName: card.name });
    log(`${player.label} 使用 ${card.name} 对 ${enemy.label} 造成 ${dmg}。`);
  }

  function hasControl(player) {
    return player.statuses.sheep > 0 || player.statuses.disarm > 0 || player.statuses.slow > 0;
  }

  function checkSpellImmune(target, source, card) {
    if (card.spell && target?.buffs?.spellImmune) {
      target.buffs.spellImmune = false;
      log(`${target.label} 的法术无效抵消了 ${source.label} 的 ${card.name}。`);
      return true;
    }
    return false;
  }

  function applyAttackerDamageMods(player, damage) {
    let result = damage;
    if (player.raceKey === 'orc' && player.raceData.orcCharges > 0) {
      result += 2;
      player.raceData.orcCharges -= 1;
      log(`${player.label} 的兽人狂暴触发，伤害 +2。`);
    }
    return result;
  }

  function applyDamage(source, target, rawDamage, options = {}) {
    let amount = rawDamage;
    if (amount <= 0 || !target.alive) return { blocked: 0, effective: 0 };
    const blocked = Math.min(target.block, amount);
    target.block -= blocked;
    amount -= blocked;
    const effective = Math.max(0, amount);
    target.hp -= effective;

    if (effective > 0 && options.status) applyStatus(target, options.status);

    if (source && source.classKey === 'warrior' && effective >= 4 && !source.oncePerTurn.classPassive) {
      source.oncePerTurn.classPassive = true;
      gainBlock(source, 2);
      log(`${source.label} 的战士被动触发，获得 2 格挡。`);
    }

    if (source && source.classKey === 'rogue' && options.sourceName === source.weaponData.basic.name && hasControl(target)) {
      const bonus = rollDice('1d4');
      target.hp -= bonus;
      log(`${source.label} 的盗贼被动追加 ${bonus} 伤害。`);
    }

    if (source && source.guardianKey === 'lilith' && effective >= 4 && !source.oncePerTurn.guardianPassive) {
      source.oncePerTurn.guardianPassive = true;
      healPlayer(source, 1);
      gainBlock(source, 1);
      log(`${source.label} 的莉莉丝触发，回复 1 生命并获得 1 格挡。`);
    }

    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
      state.winner = source ? source.id : currentPlayer().id;
      log(`${target.label} 被击败。`);
      setHint(`${source ? source.label : '当前玩家'} 获胜！`);
    }

    return { blocked, effective };
  }

  function applyStatus(player, status = {}) {
    Object.entries(status).forEach(([key, value]) => {
      player.statuses[key] = Math.max(player.statuses[key] || 0, value);
    });
  }

  function gainBlock(player, value) {
    player.block += value;
  }

  function healPlayer(player, value) {
    player.hp = Math.min(player.maxHp, player.hp + value);
  }

  function movePlayer(player, tile, reason, isCardMove = false) {
    player.position = deepCopy(tile);
    if (!isCardMove) player.lastBaseMoveDistance = distance(player.position, tile);
    onEnterTile(player, false);
  }

  function onEnterTile(player, forced) {
    const tile = state.boardMap.get(coordKey(player.position));
    if (!tile) return;
    if (tile.type === 'spike') {
      const dmg = rollDice('2d8');
      log(`${player.label} 踩中尖刺，受到 ${dmg} 伤害。`);
      applyDamage(null, player, dmg, { sourceName: '尖刺' });
    }
    if (tile.type === 'center') {
      const dmg = rollDice('2d8');
      log(`${player.label} 被黑洞中心撕扯，受到 ${dmg} 伤害。`);
      applyDamage(null, player, dmg, { sourceName: '黑洞' });
    }
    const trap = state.traps.get(coordKey(tile));
    if (trap && trap.ownerId !== player.id) {
      const dmg = rollDice(trap.damage);
      log(`${player.label} 触发陷阱，受到 ${dmg} 伤害并减速。`);
      applyDamage(null, player, dmg, { sourceName: '陷阱', status: trap.status });
      state.traps.delete(coordKey(tile));
    }
  }

  function isValidBasicTarget(player, target) {
    if (player.statuses.disarm > 0) return false;
    if (!target || !target.alive) return false;
    if (player.id === target.id) return false;
    const basic = player.weaponData.basic;
    return canTargetEnemy(player, target, basic);
  }

  function executeBasicAttack(player, target) {
    if (!isValidBasicTarget(player, target)) {
      setHint('目标不在普通攻击范围内。');
      return;
    }

    const base = rollDice(player.weaponData.basic.damage);
    let dmg = base + player.buffs.nextBasicFlat;
    if (player.buffs.nextBasicDice) dmg += rollDice(player.buffs.nextBasicDice);
    dmg = applyAttackerDamageMods(player, dmg);

    applyDamage(player, target, dmg, { sourceName: player.weaponData.basic.name });
    log(`${player.label} 使用普通攻击命中 ${target.label}，造成 ${dmg} 伤害。`);

    player.buffs.nextBasicFlat = 0;
    player.buffs.nextBasicDice = null;

    if (!player.actions.basic) {
      player.actions.basic = true;
    } else if (player.buffs.extraBasicAttacks > 0) {
      player.buffs.extraBasicAttacks -= 1;
    }

    state.pendingAction = null;
    cleanupAfterAction();
  }

  function cleanupAfterAction() {
    if (state.winner) {
      render();
      return;
    }
    render();
    setHint('请选择下一步行动，或结束回合。');
  }

  function getHighlightedTiles() {
    const set = new Set();
    const player = currentPlayer();
    if (state.pendingAction?.type === 'basicAttack') {
      const enemy = getEnemy(player);
      if (enemy && isValidBasicTarget(player, enemy)) set.add(coordKey(enemy.position));
      return set;
    }
    if (state.pendingAction?.type === 'card') {
      const card = CARDS[state.pendingAction.cardId];
      if (!card) return set;
      state.board.forEach((tile) => {
        const occupant = getPlayerAt(tile);
        if (isTileValidForCard(player, card, tile, occupant)) set.add(coordKey(tile));
      });
      return set;
    }
    if (!player.actions.move && !player.buffs.lockMove) {
      return getReachableTiles(player);
    }
    return set;
  }

  function endTurn() {
    if (state.winner) {
      render();
      return;
    }
    const player = currentPlayer();
    if (player.statuses.slow > 0) player.statuses.slow -= 1;
    if (player.statuses.disarm > 0) player.statuses.disarm -= 1;
    player.lastBaseMoveDistance = 0;
    state.selectedCardIndex = null;
    state.pendingAction = null;
    advanceTurn();
  }

  function advanceTurn() {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    startTurn();
  }

  function setupToolbar() {
    $('btn-basic-attack').addEventListener('click', () => {
      const player = currentPlayer();
      if (player.statuses.disarm > 0) {
        setHint('你处于缴械状态，无法普通攻击。');
        return;
      }
      if (player.actions.basic && player.buffs.extraBasicAttacks <= 0) {
        setHint('本回合普通攻击次数已用完。');
        return;
      }
      state.selectedCardIndex = null;
      state.pendingAction = { type: 'basicAttack' };
      render();
      setHint('请选择普通攻击目标。');
    });

    $('btn-block').addEventListener('click', () => {
      const player = currentPlayer();
      if (player.actions.block) {
        setHint('本回合已经宣告过格挡。');
        return;
      }
      const options = player.hand
        .map((id, index) => ({ id, index, data: CARDS[id] }))
        .filter((entry) => entry.data?.category === 'block');
      if (options.length === 0) {
        setHint('你手里没有格挡牌。');
        return;
      }
      playCard(options[0].index, player, player.position);
    });

    $('btn-end-turn').addEventListener('click', endTurn);
    $('btn-restart').addEventListener('click', () => {
      $('game-screen').classList.add('hidden');
      $('setup-panel').classList.remove('hidden');
      state.players = [];
      state.pendingAction = null;
      state.selectedCardIndex = null;
      state.winner = null;
      $('log').innerHTML = '';
      setHint('请选择构筑。');
    });
  }

  function populateSelect(id, optionsMap) {
    const select = $(id);
    select.innerHTML = '';
    Object.values(optionsMap).forEach((item) => {
      const option = document.createElement('option');
      option.value = item.key;
      option.textContent = item.name;
      select.appendChild(option);
    });
  }

  function initSetup() {
    ['p1', 'p2'].forEach((prefix) => {
      populateSelect(`${prefix}-class`, MODULES.classes);
      populateSelect(`${prefix}-weapon`, MODULES.weapons);
      populateSelect(`${prefix}-accessory`, MODULES.accessories);
      populateSelect(`${prefix}-race`, MODULES.races);
      populateSelect(`${prefix}-guardian`, MODULES.guardians);
    });

    $('p1-class').value = 'warrior';
    $('p1-weapon').value = 'greatsword';
    $('p1-accessory').value = 'trapbag';
    $('p1-race').value = 'dwarf';
    $('p1-guardian').value = 'lilith';

    $('p2-class').value = 'mage';
    $('p2-weapon').value = 'longbow';
    $('p2-accessory').value = 'lincoln';
    $('p2-race').value = 'elf';
    $('p2-guardian').value = 'jaina';

    $('start-game').addEventListener('click', startNewGame);
  }

  initSetup();
  setupToolbar();
})();
