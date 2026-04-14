
(() => {
  const $ = id => document.getElementById(id);
  const deep = o => JSON.parse(JSON.stringify(o));
  const svgNS = 'http://www.w3.org/2000/svg';
  const state = {
    ruleset: null,
    players: [],
    board: [],
    boardMap: new Map(),
    traps: new Map(),
    mapTokens: new Map(),
    current: 0,
    pending: null,
    selectedCardIndex: null,
    winner: null,
    dualModeCard: null,
    battleLog: [],
    debugLog: [],
  };
  const I18N = () => window.STUDIO_I18N || { t:(k,f)=>f||k, entity:(type,key,fb)=>fb||key, getLang:()=> 'zh' };

  const R = 9, SIZE = 48, CX = Math.round(SIZE*Math.sqrt(3)*(R+2)), CY = Math.round(SIZE*1.5*(R+2));
  const dirs = [{q:1,r:0},{q:1,r:-1},{q:0,r:-1},{q:-1,r:0},{q:-1,r:1},{q:0,r:1}];
  const key = c => `${c.q},${c.r}`;
  const cubeS = c => -c.q - c.r;
  const dist = (a,b) => Math.max(Math.abs(a.q-b.q), Math.abs(a.r-b.r), Math.abs(cubeS(a)-cubeS(b)));
  const straight = (a,b) => a.q===b.q || a.r===b.r || cubeS(a)===cubeS(b);
  const neighbors = c => dirs.map(d=>({q:c.q+d.q,r:c.r+d.r}));
  const randItem = arr => arr[Math.floor(Math.random()*arr.length)];
  const shuffle = arr => { for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; };

  function tileType(c){
    const k = key(c);
    if(k==='0,0') return 'center';
    if(new Set(['0,-5','5,-5','5,0','0,5','-5,5','-5,0']).has(k)) return 'spike';
    if(k===`-${R},0` || k===`${R},0`) return 'start';
    return 'plain';
  }
  function buildBoard(){
    const out=[]; 
    for(let q=-R;q<=R;q++) for(let r=-R;r<=R;r++){ const s=-q-r; if(Math.max(Math.abs(q),Math.abs(r),Math.abs(s))<=R) out.push({q,r,type:tileType({q,r})}); }
    return out;
  }
  function hexToPixel(c){
    return { x: CX + SIZE*Math.sqrt(3)*(c.q + c.r/2), y: CY + SIZE*1.5*c.r };
  }
  function hexPoints(x,y){
    const pts=[]; for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i-30); pts.push(`${x+SIZE*Math.cos(a)},${y+SIZE*Math.sin(a)}`); } return pts.join(' ');
  }

  function rollDetail(notation){
    if(notation===null || notation===undefined || notation==='') return { notation:'0', rolls:[], modifier:0, total:0 };
    if(typeof notation==='number') return { notation:String(notation), rolls:[], modifier:0, total:notation };
    const raw = String(notation).trim();

    const repeatFixed = raw.match(/^(\d+)x(-?\d+(?:\.\d+)?)$/i);
    if (repeatFixed) {
      const count = Number(repeatFixed[1] || 0);
      const value = Number(repeatFixed[2] || 0);
      const rolls = Array.from({ length: count }, () => value);
      return { notation: raw, rolls, modifier: 0, total: rolls.reduce((a,b)=>a+b,0), mode: 'repeat_fixed' };
    }

    const repeatChoice = raw.match(/^(\d+)x\((-?\d+(?:\.\d+)?(?:\|-?\d+(?:\.\d+)?)+)\)$/i);
    if (repeatChoice) {
      const count = Number(repeatChoice[1] || 0);
      const choices = String(repeatChoice[2] || '').split('|').map(Number).filter(v => !Number.isNaN(v));
      const rolls = [];
      for (let i = 0; i < count; i++) {
        rolls.push(choices[Math.floor(Math.random() * choices.length)] ?? 0);
      }
      return { notation: raw, rolls, modifier: 0, total: rolls.reduce((a,b)=>a+b,0), mode: 'repeat_choice', choices };
    }

    const m = raw.toLowerCase().match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if(!m){ const n = Number(raw); return { notation:raw, rolls:[], modifier:0, total:Number.isFinite(n) ? n : 0 }; }
    const count = Number(m[1]);
    const sides = Number(m[2]);
    const modifier = m[3] ? Number(m[3]) : 0;
    const rolls = [];
    for(let i=0;i<count;i++) rolls.push(1 + Math.floor(Math.random()*sides));
    return { notation:raw, rolls, modifier, total:rolls.reduce((a,b)=>a+b,0) + modifier, mode: 'dice' };
  }
  function formatRollDetail(detail){
    if(!detail.rolls || detail.rolls.length===0) return `${detail.notation} = ${detail.total}`;
    const body = `[${detail.rolls.join(', ')}]`;
    const mod = detail.modifier ? (detail.modifier>0 ? ` + ${detail.modifier}` : ` - ${Math.abs(detail.modifier)}`) : '';
    return `${detail.notation} → ${body}${mod} = ${detail.total}`;
  }
  function roll(notation){ return rollDetail(notation).total; }
  function pushDebug(event, detail){
    state.debugLog.push({ time:new Date().toISOString(), event, detail });
    if(state.debugLog.length > 500) state.debugLog.shift();
  }
  function log(text){
    state.battleLog.push({ time:new Date().toISOString(), text });
    if(state.battleLog.length > 500) state.battleLog.shift();
    const host = $('log');
    if(host){
      const d=document.createElement('div');
      d.className='log-entry';
      d.textContent=text;
      host.prepend(d);
    }
  }
  function exportTextFile(filename, content){
    const blob = new Blob([content], { type:'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function exportBattleLog(){
    const lines = state.battleLog.map(x => `[${x.time}] ${x.text}`);
    exportTextFile(`arena_battle_log_${Date.now()}.txt`, lines.join('\n'));
  }
  function exportDebugBundle(){
    const payload = {
      exportedAt: new Date().toISOString(),
      rulesetId: state.ruleset?.id || null,
      rulesetName: state.ruleset?.name || null,
      currentPlayer: state.players?.[state.current]?.label || null,
      players: state.players.map(p => ({
        id: p.id, label: p.label, professionKey: p.professionKey, weaponKey: p.weaponKey, accessoryKey: p.accessoryKey,
        hp: p.hp, maxHp: p.maxHp, block: p.block, turn: p.turn, buffs: p.buffs,
        passives: p.profession?.passives || {},
      })),
      battleLog: state.battleLog,
      debugLog: state.debugLog,
    };
    exportTextFile(`arena_debug_bundle_${Date.now()}.json`, JSON.stringify(payload, null, 2));
  }
  window.addEventListener('error', ev => {
    pushDebug('window.error', { message: ev.message, filename: ev.filename, lineno: ev.lineno, colno: ev.colno });
  });
  window.addEventListener('unhandledrejection', ev => {
    const reason = ev.reason && (ev.reason.stack || ev.reason.message || String(ev.reason));
    pushDebug('window.unhandledrejection', { reason });
  });
  function loggedRoll(label, notation){ const detail = rollDetail(notation); log(`🎲 ${label}：${formatRollDetail(detail)}`); return detail.total; }
  function loggedRollBatch(label, notation, count){
    if(!count) return 0;
    const details = [];
    let total = 0;
    for(let i=0;i<count;i++){ const detail = rollDetail(notation); details.push(formatRollDetail(detail)); total += detail.total; }
    log(`🎲 ${label}：${details.join('；')} → 合计 ${total}`);
    return total;
  }
  async function showDice(title, notation) {
    const overlay = $('dice-overlay'), val = $('dice-value'), note = $('dice-notation'), tit = $('dice-title');
    tit.textContent = title; note.textContent = notation || ''; overlay.classList.remove('hidden');
    const detail = rollDetail(notation);
    for (let i=0;i<8;i++){ val.textContent = String(Math.floor(Math.random()*20)+1); await new Promise(r=>setTimeout(r,35)); }
    val.textContent = String(detail.total);
    await new Promise(r=>setTimeout(r,180));
    overlay.classList.add('hidden');
    log(`🎲 ${title}：${formatRollDetail(detail)}`);
    return detail.total;
  }
  function setMode(text){ $('mode-indicator').textContent = `当前模式：${text}`; }
  function setHint(text){ $('selection-hint').textContent = text; }
  function current(){ return state.players[state.current]; }
  function enemyOf(p){ return state.players.find(x=>x.id!==p.id && x.alive); }
  function getPlayerAt(c){ return state.players.find(p=>p.alive && p.pos.q===c.q && p.pos.r===c.r) || null; }


  function syncCardLibraryFromProfessions(ruleset){
    if (!ruleset?.data?.professions) return;
    ruleset.data.cardLibrary = ruleset.data.cardLibrary || {};
    Object.values(ruleset.data.professions).forEach(prof => {
      Object.entries(prof.cards || {}).forEach(([cardKey, cardDef]) => {
        ruleset.data.cardLibrary[cardKey] = deep(cardDef);
      });
      Object.entries(prof.passives || {}).forEach(([cardKey, cardDef]) => {
        ruleset.data.cardLibrary[cardKey] = deep(cardDef);
      });
    });
  }

  function getProfessionPassives(player){
    const rsProf = state.ruleset?.data?.professions?.[player.professionKey];
    const direct = rsProf?.passives || player.profession?.passives || {};
    const out = Object.entries(direct).map(([k,v]) => Object.assign({ key:k }, deep(v)));
    pushDebug('getProfessionPassives', { player: player.label, professionKey: player.professionKey, passiveKeys: out.map(x => x.key) });
    return out;
  }

  function buildDeckFor(playerConfig) {
    const { ruleset, professionKey, weaponKey, accessoryKey } = playerConfig;
    const profession = ruleset.data.professions[professionKey];
    const weapon = ruleset.data.weaponLibrary[weaponKey];
    const accessory = ruleset.data.accessoryLibrary[accessoryKey];
    const deck = [];

    function pushFromCounts(counts, origin) {
      Object.entries(counts || {}).forEach(([cardKey, count]) => {
        const n = Number(count || 0);
        for (let i = 0; i < n; i += 1) deck.push({ cardKey, origin });
      });
    }

    function deriveCountsFromArray(arr) {
      const out = {};
      (arr || []).forEach(cardKey => {
        out[cardKey] = (out[cardKey] || 0) + 1;
      });
      return out;
    }

    pushFromCounts(
      profession.deckCounts || Object.fromEntries(Object.keys(profession.cards || {}).map(cardKey => [cardKey, 1])),
      '职业技能'
    );
    pushFromCounts(
      weapon.deckCounts || deriveCountsFromArray(weapon.cards || []),
      '武器技能'
    );
    pushFromCounts(
      accessory.deckCounts || deriveCountsFromArray(accessory.cards || []),
      '饰品技能'
    );

    return shuffle(deck);
  }

  function buildPlayer(slot, professionKey, weaponKey, accessoryKey, type, startPos) {
    const ruleset = state.ruleset;
    const profession = ruleset.data.professions[professionKey];
    const weapon = ruleset.data.weaponLibrary[weaponKey];
    const accessory = ruleset.data.accessoryLibrary[accessoryKey];
    return {
      id: slot, type, label: `玩家 ${slot}`, color: slot===1 ? '#65a9ff' : '#ff8aa8',
      professionKey, weaponKey, accessoryKey, profession, weapon, accessory,
      maxHp: profession.hp, hp: profession.hp, moveBase: profession.move, pos: deep(startPos),
      deck: buildDeckFor({ ruleset, professionKey, weaponKey, accessoryKey }),
      discard: [], hand: [], alive: true, block: 0,
      statuses: { burn:0, slow:0, disarm:0, sheep:0, dot:null },
      buffs: { nextBasicFlat:0, nextBasicDie:null, spellImmune:false, extraBasicCap:0, extraClassCardUses:0, swordBonusStored:false, dodgeNextDamage:0, counterDamage:'', counterUseTakenDamage:false, counterCharges:0, reactiveMoveTrigger:'', reactiveMoveMaxDistance:0, reactiveMoveCharges:0, healOnDamaged:'', healOnDamagedCharges:0, disarmAttackerOnHit:0, disarmAttackerCharges:0 },
      turn: { move:false, classOrGuardianUsed:false, weaponOrAccessoryUsed:false, basicSpent:0, blockUsed:false, movedDistance:0, autoBlockTriggered:false },
      counters: { heal_count:0 },
      negativeQueue: [],
      summons: { skeleton:0, bone_dragon:0 },
      marked: false,
    };
  }

  function drawCards(player, n){
    for(let i=0;i<n;i++){
      if(player.deck.length===0){
        if(player.discard.length===0) return;
        player.deck = shuffle(player.discard.splice(0));
        log(`${player.label} 将弃牌堆重新洗回牌库。`);
      }
      const drawn = player.deck.shift();
      const cardDef = getCardDef(drawn.cardKey);
      if(cardDef && cardDef.negativeOnDraw){
        player.discard.push(drawn);
        log(`${player.label} 抽到负面牌：${cardDef.name}。`);
        resolveNegativeOnDraw(player, drawn);
        continue;
      }
      if(cardDef && cardDef.category==='block' && !player.turn.autoBlockTriggered){
        player.turn.autoBlockTriggered = true;
        player.discard.push(drawn);
        const amt = loggedRoll(`${player.label} 自动格挡`, cardDef.config?.block || cardDef.block || '1d4');
        player.block += amt;
        log(`${player.label} 抽到格挡牌并自动获得 ${amt} 格挡。`);
        continue;
      }
      if(cardDef && cardDef.category==='block' && player.turn.autoBlockTriggered){
        player.discard.push(drawn);
        log(`${player.label} 抽到额外格挡牌，但本回合已触发过自动格挡。`);
        continue;
      }
      player.hand.push(drawn);
    }
  }

  function getCardDef(cardKey){
    const profs = Object.values(state.ruleset?.data?.professions || {});
    for (const prof of profs){
      if(prof.cards && prof.cards[cardKey]) return prof.cards[cardKey];
      if(prof.passives && prof.passives[cardKey]) return prof.passives[cardKey];
    }
    if(state.ruleset?.data?.cardLibrary?.[cardKey]) return state.ruleset.data.cardLibrary[cardKey];
    return null;
  }

  function hasAdjacentSpike(tile){
    return neighbors(tile).some(c => {
      const t = state.boardMap.get(key(c));
      return !!(t && t.type === 'spike');
    });
  }

  function isSpikeDangerTile(tile){
    const t = state.boardMap.get(key(tile));
    return !!(t && (t.type === 'spike' || hasAdjacentSpike(tile)));
  }

  function getMapToken(tile){
    return state.mapTokens?.get(key(tile)) || null;
  }

  function hasAdjacentDangerToken(tile){
    return neighbors(tile).some(c => {
      const tok = getMapToken(c);
      return !!(tok && tok.kind === 'permanent_pillar');
    });
  }

  function isTokenDangerTile(tile){
    const tok = getMapToken(tile);
    return !!((tok && tok.kind === 'permanent_pillar') || hasAdjacentDangerToken(tile));
  }

  function applyTokenControl(player, token){
    const ctl = token.controlType || '';
    const dur = Number(token.controlDuration || 1);
    if (!ctl) return;
    if (ctl === 'slow') player.statuses.slow = Math.max(player.statuses.slow || 0, dur);
    else if (ctl === 'disarm') player.statuses.disarm = Math.max(player.statuses.disarm || 0, dur);
    else if (ctl === 'sheep') player.statuses.sheep = Math.max(player.statuses.sheep || 0, dur);
    else if (ctl === 'burn') player.statuses.burn = Math.max(player.statuses.burn || 0, dur);
  }

  function insertNegativeCardsToDeck(targetPlayer, insertCardKey, insertCount){
    const cnt = Number(insertCount || 1);
    if (!insertCardKey || cnt <= 0) return;
    for(let i=0;i<cnt;i++){
      targetPlayer.deck.splice(Math.floor(Math.random()*(targetPlayer.deck.length+1)),0,{cardKey:insertCardKey, origin:'负面牌'});
    }
    log(`${targetPlayer.label} 的牌库被加入了 ${cnt} 张负面牌。`);
  }

  function triggerMapTokenOnEnter(player){
    const tok = getMapToken(player.pos);
    if (!tok || tok.ownerId === player.id) return;
    if (tok.kind === 'trap_once_negative'){
      if (tok.damage) {
        const dmg = loggedRoll(`${player.label} ${tok.name || '陷阱'}伤害`, resolvePlayerNotation(player, tok.damage));
        player.hp -= dmg;
        log(`${player.label} 触发 ${tok.name || '陷阱'}，受到 ${dmg} 伤害。`);
      }
      if (tok.insertCardKey) insertNegativeCardsToDeck(player, tok.insertCardKey, tok.insertCount || 1);
      applyTokenControl(player, tok);
      state.mapTokens.delete(key(player.pos));
      return;
    }
  }

  function processMapTokensAtTurnStart(player){
    if (!state.mapTokens) return;
    for (const [kk, tok] of Array.from(state.mapTokens.entries())){
      if (!tok) continue;
      if (tok.kind === 'auto_turret' && tok.ownerId === player.id){
        const enemies = state.players.filter(x => x.alive && x.id !== player.id);
        const target = enemies
          .filter(x => dist(tok.pos, x.pos) <= Number(tok.attackRange || 4))
          .sort((a,b) => dist(tok.pos, a.pos) - dist(tok.pos, b.pos))[0];
        if (target){
          if (tok.damage){
            const dmg = loggedRoll(`${tok.name || '炮塔'} 攻击`, resolvePlayerNotation(player, tok.damage));
            target.hp -= Math.max(0, dmg - target.block);
            target.block = Math.max(0, target.block - dmg);
            log(`${tok.name || '炮塔'} 命中 ${target.label}，原始伤害 ${dmg}，目标当前生命 ${target.hp}，格挡 ${target.block}。`);
          }
          if (tok.insertCardKey) insertNegativeCardsToDeck(target, tok.insertCardKey, tok.insertCount || 1);
          applyTokenControl(target, tok);
          if (target.hp <= 0){ target.hp = 0; target.alive = false; state.winner = player.id; }
        }
        if (tok.durationTurns != null){
          tok.durationTurns = Number(tok.durationTurns || 0) - 1;
          if (tok.durationTurns <= 0) state.mapTokens.delete(kk);
          else state.mapTokens.set(kk, tok);
        }
      } else if (tok.kind === 'permanent_pillar' && tok.durationTurns != null){
        tok.durationTurns = Number(tok.durationTurns || 0) - 1;
        if (tok.durationTurns <= 0) state.mapTokens.delete(kk);
        else state.mapTokens.set(kk, tok);
      }
    }
  }

  function createMapTokenFromCard(player, tile, cardDef){
    const cfg = cardDef.config || {};
    const token = {
      ownerId: player.id,
      ownerLabel: player.label,
      pos: deep(tile),
      name: cfg.tokenName || cardDef.name || 'Token',
      kind: cfg.tokenKind || 'trap_once_negative',
      durationTurns: cfg.durationTurns === '' || cfg.durationTurns == null ? null : Number(cfg.durationTurns),
      damage: cfg.damage || '',
      insertCardKey: cfg.insertCardKey || '',
      insertCount: Number(cfg.insertCount || 1),
      controlType: cfg.controlType || '',
      controlDuration: Number(cfg.controlDuration || 1),
      attackRange: Number(cfg.attackRange || 4),
      blocking: cfg.blocking !== false && (cfg.tokenKind === 'permanent_pillar')
    };
    state.mapTokens.set(key(tile), token);
    log(`${player.label} 在 ${tile.q},${tile.r} 放置了 ${token.name}。`);
  }

  function getActiveBasicAttack(p){
    const base = deep(p.weapon.basic || {});
    const trans = p.buffs.basicTransform;
    if (!trans) return base;
    return Object.assign(base, deep(trans.override || {}));
  }


  function resolvePlayerNotation(player, notation){
    if (notation === null || notation === undefined) return notation;
    const raw = String(notation).trim();
    if (!raw.includes('weapon_damage')) return notation;
    const base = getActiveBasicAttack(player)?.damage || '0';
    const m = raw.match(/^weapon_damage([+-]\d+)?$/);
    if (!m) return base;
    const extra = m[1] || '';
    if (!extra) return base;
    const dice = String(base).trim();
    const dm = dice.match(/^(\d+d\d+)([+-]\d+)?$/i);
    if (dm) {
      const baseExpr = dm[1];
      const mod = Number(dm[2] || 0) + Number(extra || 0);
      return mod ? `${baseExpr}${mod >= 0 ? '+' : ''}${mod}` : baseExpr;
    }
    const numeric = Number(dice || 0) + Number(extra || 0);
    return String(numeric);
  }

  function isBlockedTile(tile){
    const t = state.boardMap.get(key(tile));
    const tok = getMapToken(tile);
    return !!((t && t.type === 'spike') || (tok && tok.blocking));
  }

  function grantCardToHand(player, cardKey, origin){
    if (!cardKey) return;
    player.hand.push({ cardKey, origin: origin || '职业技能' });
    const def = getCardDef(cardKey);
    log(`${player.label} 获得了 ${def?.name || cardKey}。`);
  }


function rollOrValue(label, value){
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const raw = String(value).trim();
  if (!raw) return 0;
  if (/^[-+]?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  return loggedRoll(label, raw);
}

function canOccupyTileForReactiveMove(tile){
  return !!tile && state.boardMap.has(key(tile)) && !getPlayerAt(tile) && !isBlockedTile(tile);
}

function getRandomReactiveMoveDestination(player, maxDistance){
  const groups = [];
  const stepLimit = Number(maxDistance || 0) > 0 ? Number(maxDistance || 0) : 99;
  for (const dir of dirs){
    const cells = [];
    let cur = { q: player.pos.q, r: player.pos.r };
    for (let step = 1; step <= stepLimit; step += 1){
      const next = { q: cur.q + dir.q, r: cur.r + dir.r };
      if (!canOccupyTileForReactiveMove(next)) break;
      cells.push(next);
      cur = next;
    }
    if (cells.length) groups.push(cells);
  }
  if (!groups.length) return null;
  return deep(randItem(randItem(groups)));
}

function attemptReactiveMove(player, triggerLabel){
  const dst = getRandomReactiveMoveDestination(player, player.buffs?.reactiveMoveMaxDistance || 0);
  if (!dst) {
    log(`${player.label} 的随机位移未找到可用位置。`);
    return false;
  }
  const from = key(player.pos);
  player.pos = dst;
  log(`${player.label} 因 ${triggerLabel || '反应位移'} 随机移动：${from} → ${key(dst)}。`);
  return true;
}

function attackStillValid(attacker, target, source){
  if (!attacker || !target || !attacker.alive || !target.alive) return false;
  if (!source) return true;
  const range = Number(source.range || source.config?.range || 1);
  const isStraight = !!(source.straight || source.config?.straight);
  if (dist(attacker.pos, target.pos) > range) return false;
  if (isStraight && !straight(attacker.pos, target.pos)) return false;
  return true;
}

function maybeTriggerReactiveMoveOnTargeted(attacker, target, source, sourceName){
  if (!target?.buffs || target.buffs.reactiveMoveTrigger !== 'on_targeted' || !(target.buffs.reactiveMoveCharges > 0)) return { moved:false, evaded:false };
  target.buffs.reactiveMoveCharges = Math.max(0, Number(target.buffs.reactiveMoveCharges || 0) - 1);
  const moved = attemptReactiveMove(target, `${sourceName || '被选为目标'}时`);
  if (!moved) return { moved:false, evaded:false };
  if (!attackStillValid(attacker, target, source)) {
    log(`${target.label} 脱离了 ${sourceName || '该攻击'} 的有效范围，本次攻击落空。`);
    return { moved:true, evaded:true };
  }
  return { moved:true, evaded:false };
}

function finalizePlayerState(player){
  if (player.hp <= 0){
    player.hp = 0;
    player.alive = false;
    const living = state.players.filter(x => x.alive);
    if (living.length === 1) state.winner = living[0].id;
  }
}

function dealDamage(attacker, target, rawDamage, meta){
  const info = meta || {};
  const sourceName = info.sourceName || '伤害';
  const allowReactions = info.allowReactions !== false;
  let damage = Math.max(0, Number(rawDamage || 0));
  if (!target || !target.alive) return { rawDamage: damage, blocked: 0, finalDamage: 0, dodged: false };

  if (damage > 0 && (target.buffs?.dodgeNextDamage || 0) > 0) {
    target.buffs.dodgeNextDamage = Math.max(0, Number(target.buffs.dodgeNextDamage || 0) - 1);
    log(`${target.label} 的闪避生效，完全闪避了 ${sourceName}。`);
    return { rawDamage: damage, blocked: 0, finalDamage: 0, dodged: true };
  }

  const blocked = Math.min(Number(target.block || 0), damage);
  const finalDamage = Math.max(0, damage - blocked);
  target.block = Math.max(0, Number(target.block || 0) - damage);
  target.hp -= finalDamage;

  if (allowReactions && finalDamage > 0) {
    if ((target.buffs?.healOnDamagedCharges || 0) > 0 && target.buffs?.healOnDamaged) {
      target.buffs.healOnDamagedCharges = Math.max(0, Number(target.buffs.healOnDamagedCharges || 0) - 1);
      const heal = rollOrValue(`${target.label} 受伤后自疗`, target.buffs.healOnDamaged);
      if (heal > 0) {
        target.hp = Math.min(target.maxHp, target.hp + heal);
        log(`${target.label} 受伤后恢复 ${heal} 生命。`);
      }
    }

    if (attacker && attacker.alive && (target.buffs?.disarmAttackerCharges || 0) > 0 && Number(target.buffs?.disarmAttackerOnHit || 0) > 0) {
      target.buffs.disarmAttackerCharges = Math.max(0, Number(target.buffs.disarmAttackerCharges || 0) - 1);
      attacker.statuses.disarm = Math.max(Number(attacker.statuses.disarm || 0), Number(target.buffs.disarmAttackerOnHit || 1));
      log(`${target.label} 的反制生效，${attacker.label} 被缴械 ${Number(target.buffs.disarmAttackerOnHit || 1)} 回合。`);
    }

    if (attacker && attacker.alive && (target.buffs?.counterCharges || 0) > 0 && (target.buffs?.counterUseTakenDamage || target.buffs?.counterDamage)) {
      target.buffs.counterCharges = Math.max(0, Number(target.buffs.counterCharges || 0) - 1);
      let counterDamage = 0;
      if (target.buffs.counterUseTakenDamage) counterDamage += finalDamage;
      if (target.buffs.counterDamage) counterDamage += rollOrValue(`${target.label} 反击`, target.buffs.counterDamage);
      if (counterDamage > 0) {
        const counterResult = dealDamage(target, attacker, counterDamage, { sourceName: '反击', allowReactions: false });
        log(`${target.label} 触发反击，对 ${attacker.label} 造成 ${counterResult.finalDamage} 伤害。`);
      }
    }

    if (target.alive && target.buffs?.reactiveMoveTrigger === 'on_damaged' && (target.buffs?.reactiveMoveCharges || 0) > 0) {
      target.buffs.reactiveMoveCharges = Math.max(0, Number(target.buffs.reactiveMoveCharges || 0) - 1);
      attemptReactiveMove(target, '受伤后');
    }
  }

  finalizePlayerState(target);
  if (attacker) finalizePlayerState(attacker);
  return { rawDamage: damage, blocked, finalDamage, dodged: false };
}

async function applyRewardList(player, rewards, labelPrefix){

    for (const reward of (rewards || [])) {
      if (!reward || !reward.type) continue;
      if (reward.type === 'gain_block' || reward.type === 'block') {
        const v = typeof reward.value === 'string' && reward.value.includes('d') ? await showDice(`${labelPrefix} 格挡`, reward.value) : Number(reward.value || 0);
        player.block += v;
        log(`${player.label} 获得 ${v} 格挡。`);
      } else if (reward.type === 'heal') {
        const v = typeof reward.value === 'string' && reward.value.includes('d') ? await showDice(`${labelPrefix} 治疗`, reward.value) : Number(reward.value || 0);
        player.hp = Math.min(player.maxHp, player.hp + v);
        log(`${player.label} 恢复 ${v} 生命。`);
      } else if (reward.type === 'buff_basic' || reward.type === 'buffBasic') {
        const v = Number(reward.value || 0);
        player.buffs.nextBasicFlat = (player.buffs.nextBasicFlat || 0) + v;
        log(`${player.label} 的下次普攻 +${v}。`);
      } else if (reward.type === 'bonus_die' || reward.type === 'bonusDie') {
        player.buffs.nextBasicDie = reward.value;
        log(`${player.label} 获得额外骰 ${reward.value}。`);
      } else if (reward.type === 'draw') {
        drawCards(player, Number(reward.value || 1));
      } else if (reward.type === 'extra_basic_cap') {
        const v = Number(reward.value || 1);
        player.buffs.extraBasicCap = (player.buffs.extraBasicCap || 0) + v;
        const refunded = Math.min(v, Number(player.turn?.basicSpent || 0));
        if (refunded > 0) {
          player.turn.basicSpent = Math.max(0, player.turn.basicSpent - refunded);
          log(`${player.label} 立即返还 ${refunded} 次普通攻击次数。`);
        } else {
          log(`${player.label} 本回合额外获得 ${v} 次普攻容量。`);
        }
      } else if (reward.type === 'spell_immune') {
        player.buffs.spellImmune = true;
        log(`${player.label} 获得法术无效。`);
      } else if (reward.type === 'dodge_next_damage') {
        player.buffs.dodgeNextDamage = (player.buffs.dodgeNextDamage || 0) + Math.max(1, Number(reward.value || 1));
        log(`${player.label} 获得 ${Math.max(1, Number(reward.value || 1))} 次闪避。`);
      } else if (reward.type === 'extra_class_card_use') {
        const v = Number(reward.value || 1);
        player.buffs.extraClassCardUses = (player.buffs.extraClassCardUses || 0) + v;
        log(`${player.label} 本回合额外获得 ${v} 次职业卡使用次数。`);
      } else if (reward.type === 'card') {
        grantCardToHand(player, reward.cardKey || reward.value, reward.origin || '职业技能');
      }
    }
  }

  async function applyDamageTriggeredPassives(player, rawDamage, target, sourceName){
    pushDebug('applyDamageTriggeredPassives.enter', { player: player.label, rawDamage, sourceName, professionKey: player.professionKey });
    const passives = getProfessionPassives(player);
    if(!passives.length){
      log(`${player.label} 没有可检查的职业被动。`);
      pushDebug('applyDamageTriggeredPassives.no_passives', { player: player.label });
      return;
    }
    for(const passive of passives){
      if(!passive || !passive.template) continue;
      const passiveKey = passive.key || passive.name || passive.template;
      if(passive.config?.oncePerTurn && player.turn?.passiveOnceTriggered?.[passiveKey]) continue;

      if(passive.template === 'threshold_reward_once_per_turn'){
        const thresholdType = passive.config?.thresholdType || passive.config?.checkType || 'dealt_damage';
        const thresholdValue = Number(
          passive.config?.thresholdValue ??
          passive.config?.threshold ??
          passive.config?.damageThreshold ??
          0
        );
        const normalizedType = ({
          'effective_damage':'dealt_damage',
          '造成伤害':'dealt_damage',
          'damage':'dealt_damage',
          'raw_damage':'dealt_damage',
          'dealt_damage':'dealt_damage'
        })[String(thresholdType)] || String(thresholdType);
        const passed = normalizedType === 'dealt_damage' ? rawDamage >= thresholdValue : false;
        pushDebug('threshold_reward_once_per_turn.check', { player: player.label, passiveKey, thresholdType: normalizedType, rawDamage, thresholdValue, passed, config: passive.config || {} });
        log(`${player.label} 检查被动 ${passive.name || passiveKey}：类型 ${normalizedType}，本次伤害 ${rawDamage}，阈值 ${thresholdValue}，结果 ${passed ? '通过' : '未通过'}。`);
        if(normalizedType !== 'dealt_damage'){ log(`${player.label} 的被动 ${passive.name || passiveKey} 阈值类型未被识别：${normalizedType}`); }
        if(passed){
          await applyRewardList(player, passive.config?.rewardList || [], passive.name || sourceName || '被动');
          if(passive.config?.oncePerTurn){
            player.turn.passiveOnceTriggered = player.turn.passiveOnceTriggered || {};
            player.turn.passiveOnceTriggered[passiveKey] = true;
          }
          log(`${player.label} 的被动 ${passive.name || ''} 达到阈值并触发。`);
        }
      }

      if(passive.template === 'damage_then_multi_buff'){
        const threshold = Number(passive.config?.threshold || 0);
        if(rawDamage >= threshold){
          await applyRewardList(player, passive.config?.rewardList || [], passive.name || sourceName || '被动');
          if(passive.config?.oncePerTurn){
            player.turn.passiveOnceTriggered = player.turn.passiveOnceTriggered || {};
            player.turn.passiveOnceTriggered[passiveKey] = true;
          }
          log(`${player.label} 的被动 ${passive.name || ''} 在造成伤害后触发多重增益。`);
        }
      }
    }
  }


  function handLimit(){
    return Number(state.ruleset?.data?.ruleDefaults?.handLimit || 10);
  }

  function ensureHandLimit(player){
    const limit = handLimit();
    if(player.hand.length <= limit) return false;
    if(player.type === 'ai'){
      while(player.hand.length > limit){
        const idx = Math.floor(Math.random() * player.hand.length);
        const [drop] = player.hand.splice(idx,1);
        player.discard.push(drop);
        const def = getCardDef(drop.cardKey);
        log(`${player.label} 弃掉了 ${def?.name || drop.cardKey}。`);
      }
      return false;
    }
    state.pending = { type:'discard' };
    state.selectedCardIndex = null;
    state.dualModeCard = null;
    $('choice-panel').innerHTML='';
    setMode('弃牌');
    setHint(`手牌超过上限，请弃牌至 ${limit} 张。`);
    return true;
  }

  function discardHandCard(index){
    const p = current();
    if(!p || index < 0 || index >= p.hand.length) return;
    const [drop] = p.hand.splice(index,1);
    p.discard.push(drop);
    const def = getCardDef(drop.cardKey);
    log(`${p.label} 弃掉了 ${def?.name || drop.cardKey}。`);
    if(p.hand.length <= handLimit()){
      state.pending = null;
      setMode('待机');
      setHint('请选择移动、普通攻击，或打出一张牌。');
    } else {
      setHint(`仍需弃牌至 ${handLimit()} 张，当前 ${p.hand.length} 张。`);
    }
    render();
  }

  function resetTurnState(player){
    player.turn = { move:false, classOrGuardianUsed:false, weaponOrAccessoryUsed:false, basicSpent:0, blockUsed:false, movedDistance:0, autoBlockTriggered:false, passiveOnceTriggered:{} };
  }


  function normalizeRulesetForBattle(ruleset){
    if (!ruleset || !ruleset.data) return ruleset;
    const typeMap = {
      'effective_damage':'dealt_damage',
      '造成伤害':'dealt_damage',
      'damage':'dealt_damage',
      'raw_damage':'dealt_damage',
      'dealt_damage':'dealt_damage'
    };
    function normalizeCard(card){
      if (!card || !card.template) return;
      card.config = card.config || {};
      const cfg = card.config;
      if (card.template === 'threshold_reward_once_per_turn'){
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
    }
    Object.values(ruleset.data.professions || {}).forEach(prof => {
      Object.values(prof.cards || {}).forEach(normalizeCard);
      Object.values(prof.passives || {}).forEach(normalizeCard);
    });
    Object.values(ruleset.data.cardLibrary || {}).forEach(normalizeCard);
    return ruleset;
  }

  function startGame(){
    const rulesetId = $('ruleset-select').value;
    state.ruleset = deep(STUDIO_RUNTIME.findRuleset(rulesetId));
    normalizeRulesetForBattle(state.ruleset);
    syncCardLibraryFromProfessions(state.ruleset);
    state.players = [
      buildPlayer(1, $('p1-profession').value, $('p1-weapon').value, $('p1-accessory').value, 'human', {q:-R,r:0}),
      buildPlayer(2, $('p2-profession').value, $('p2-weapon').value, $('p2-accessory').value, $('p2-type').value, {q:R,r:0}),
    ];
    state.board = buildBoard();
    state.boardMap = new Map(state.board.map(t=>[key(t),t]));
    state.traps = new Map();
    state.mapTokens = new Map();
    state.current = 0;
    state.pending = null;
    state.selectedCardIndex = null;
    state.winner = null;
    state.dualModeCard = null;
    $('setup-panel').classList.add('hidden');
    $('game-screen').classList.remove('hidden');
    $('log').innerHTML = '';
    state.players.forEach(p=>drawCards(p, Number(state.ruleset?.data?.ruleDefaults?.drawOpening || 6)));
    state.players.forEach(p=>ensureHandLimit(p));
    log('对局开始。黑洞每回合将所有单位向中心牵引 1 格。');
    startTurn();
  }

  function startTurn(){
    if(state.winner) return;
    const p = current();
    if(!p.alive) return nextTurn();
    resetTurnState(p);
    p.block = 0;
    applyBlackHolePull();
    if(p.statuses.dot){
      const cfg = p.statuses.dot;
      const dmg = loggedRoll(`${p.label} DOT`, cfg.damagePerTick || '1');
      p.hp -= dmg; log(`${p.label} 受到 DOT ${dmg} 伤害。`);
      cfg.durationTurns -= 1;
      if(cfg.durationTurns<=0) p.statuses.dot = null;
    }
    if(p.statuses.burn>0){ p.hp -= 2; p.statuses.burn -= 1; log(`${p.label} 受到点燃 2 伤害。`); }
    const enemy = enemyOf(p);
    if(p.professionKey==='necro' && enemy){
      let bonus = 0;
      bonus += loggedRollBatch(`${p.label} 的骷髅自动伤害`, '1d4', (p.summons?.skeleton||0));
      bonus += loggedRollBatch(`${p.label} 的骨龙自动伤害`, '1d8', (p.summons?.bone_dragon||0));
      if(bonus>0){ enemy.hp -= bonus; log(`${p.label} 的亡灵随从在回合开始合计造成 ${bonus} 伤害。`); if(enemy.hp<=0){ enemy.hp=0; enemy.alive=false; state.winner=p.id; render(); setHint('对局结束'); return; } }
    }
    processMapTokensAtTurnStart(p);
    if(p.hp<=0){ p.hp=0; p.alive=false; state.winner = enemyOf(p)?.id || 1; render(); setHint('对局结束'); return; }
    drawCards(p, Number(state.ruleset?.data?.ruleDefaults?.drawPerTurn || 2));
    if(ensureHandLimit(p)){ render(); return; }
    setMode('待机');
    setHint('选择移动、普通攻击，或打出一张牌。');
    render();
    if(p.type==='ai') setTimeout(runAiTurn, 450);
  }

  function nextTurn(){
    const prev = current();
    if(prev?.buffs?.basicTransform && prev.buffs.basicTransform.consumeOn === 'end_of_turn'){
      if ((prev.buffs.basicTransform.durationTurns || 1) > 1) prev.buffs.basicTransform.durationTurns -= 1;
      else prev.buffs.basicTransform = null;
    }
    state.current = (state.current + 1) % state.players.length;
    startTurn();
  }

  function applyBlackHolePull(){
    const center={q:0,r:0};
    state.players.forEach(p=>{
      if(!p.alive) return;
      const opts = neighbors(p.pos).filter(c=>state.boardMap.has(key(c)) && !isBlockedTile(c)).filter(c=>{ const occ=getPlayerAt(c); return !occ || occ.id===p.id; }).sort((a,b)=>dist(a,center)-dist(b,center));
      if(opts[0] && key(opts[0])!==key(p.pos)){ p.pos = opts[0]; enterTile(p); }
    });
  }

  function enterTile(player){
    const t = state.boardMap.get(key(player.pos)); if(!t) return;
    if(isSpikeDangerTile(player.pos)){ const dmg = loggedRoll(`${player.label} 尖刺区域伤害`, '2d8'); player.hp -= dmg; log(`${player.label} 触碰尖刺柱危险区域，受到 ${dmg} 伤害。`); }
    if(isTokenDangerTile(player.pos)){ const tok = getMapToken(player.pos) || neighbors(player.pos).map(getMapToken).find(Boolean); const expr = tok?.damage || '2d8'; const dmg = loggedRoll(`${player.label} ${tok?.name || '危险区'}伤害`, resolvePlayerNotation(player, expr)); player.hp -= dmg; log(`${player.label} 触碰 ${tok?.name || '危险区'}，受到 ${dmg} 伤害。`); }
    if(t.type==='center'){ const dmg = loggedRoll(`${player.label} 黑洞中心伤害`, '2d8'); player.hp -= dmg; log(`${player.label} 被黑洞中心撕扯，受到 ${dmg} 伤害。`); }
    const trap = state.traps.get(key(player.pos));
    if(trap && trap.ownerId !== player.id){
      const dmg = loggedRoll(`${player.label} 陷阱伤害`, '2d6'); player.hp -= dmg; player.statuses.slow = 1;
      log(`${player.label} 触发陷阱，受到 ${dmg} 伤害并减速。`);
      state.traps.delete(key(player.pos));
    }
    triggerMapTokenOnEnter(player);
    if(player.hp<=0){ player.hp=0; player.alive=false; state.winner = enemyOf(player)?.id || 1; }
  }


  async function useProfessionPassive(){
    const p = current();
    if (!p.alive || p.turn.classOrGuardianUsed) return;
    const passive = Object.values(p.profession.passives || {})[0];
    if (!passive) return;
    if (passive.template === 'life_for_card_draw_once_per_turn'){
      const lifeCost = Number(passive.config?.lifeCost || 0);
      const drawCount = Number(passive.config?.drawCount || 1);
      p.hp = Math.max(0, p.hp - lifeCost);
      log(`${p.label} 发动 ${passive.name || '职业被动'}，支付 ${lifeCost} 点生命。`);
      if (p.hp <= 0){
        p.alive = false;
        p.hp = 0;
        state.winner = enemyOf(p)?.id || 1;
        finishAfterAction();
        return;
      }
      drawCards(p, drawCount);
      ensureHandLimit(p);
      p.turn.classOrGuardianUsed = true;
      finishAfterAction();
      return;
    }
  }

  function actionBucketFor(card){
    const origin = card.origin;
    if(origin==='职业技能' || origin==='守护神技能') return 'class_or_guardian';
    if(origin==='武器技能' || origin==='饰品技能') return 'weapon_or_accessory';
    return 'class_or_guardian';
  }

  function cardCanBePlayed(p, handItem, cardDef){
    const bucket = actionBucketFor(handItem);
    if(bucket==='class_or_guardian' && p.turn.classOrGuardianUsed){
      const extraClassUses = Number(p.buffs?.extraClassCardUses || 0);
      if(!(handItem.origin === '职业技能' && extraClassUses > 0)) return false;
    }
    if(bucket==='weapon_or_accessory' && p.turn.weaponOrAccessoryUsed) return false;
    if(p.professionKey==='mage' && p.turn.movedDistance>3 && handItem.origin==='职业技能') return false;
    return true;
  }

  function getReachableTiles(player){
    if(player.turn.move) return new Set();
    const maxMove = player.statuses.slow>0 ? Math.ceil(player.moveBase/2) : player.moveBase;
    const visited=new Set([key(player.pos)]), q=[{c:player.pos,d:0}], res=new Set();
    while(q.length){
      const cur=q.shift();
      if(cur.d>=maxMove) continue;
      for(const n of neighbors(cur.c)){
        const kk=key(n); if(!state.boardMap.has(kk)||visited.has(kk)||getPlayerAt(n)||isBlockedTile(n)) continue;
        visited.add(kk); res.add(kk); q.push({c:n,d:cur.d+1});
      }
    }
    return res;
  }

  function highlightSet(){
    const moves=new Set(), targets=new Set();
    const p=current();
    if(state.pending?.type==='move'){
      getReachableTiles(p).forEach(x=>moves.add(x));
    } else if(state.pending?.type==='basic'){
      const b = getActiveBasicAttack(p);
      state.board.forEach(t=>{
        if(dist(p.pos,t) > Number(b.range||1)) return;
        if(b.straight && !straight(p.pos,t)) return;
        targets.add(key(t));
      });
    } else if(state.pending?.type==='card'){
      const card=state.pending.cardDef;
      state.board.forEach(t=>{
        const occ=getPlayerAt(t);
        if(card.template==='teleport' && !occ && !isBlockedTile(t) && dist(p.pos,t)<=Number(card.config.range||0)) {
          moves.add(key(t));
        } else if(card.template==='aoe' && dist(p.pos,t)<=Number(card.config.range||0)) {
          targets.add(key(t));
        } else if(card.template==='create_map_token' && !occ && !isBlockedTile(t) && withinTileRange(p, t, card)) {
          targets.add(key(t));
        } else if((card.template==='direct_damage' || card.template==='dash_hit' || card.template==='insert_negative_card_into_target_deck' || card.template==='mark_target_for_bonus' || card.template==='bonus_if_target_marked' || card.template==='consume_all_activated_tokens_for_burst' || card.template==='damage_then_multi_buff' || card.template==='damage_roll_grant_card')) {
          if(withinTileRange(p, t, card)) targets.add(key(t));
        }
      });
    }
    return {moves,targets};
  }

  function withinTargetRange(p, target, card){
    const r = Number(card.config.range || 1);
    if(dist(p.pos,target.pos)>r) return false;
    if(card.config.straight && !straight(p.pos,target.pos)) return false;
    return true;
  }

  function withinTileRange(p, tile, card){
    const r = Number(card.config.range || 1);
    if(dist(p.pos, tile) > r) return false;
    if(card.config.straight && !straight(p.pos, tile)) return false;
    return true;
  }

  function canBasicTarget(p, e){
    const b = getActiveBasicAttack(p);
    if(p.statuses.disarm>0) return false;
    if(dist(p.pos,e.pos)>Number(b.range||1)) return false;
    if(b.straight && !straight(p.pos,e.pos)) return false;
    return true;
  }

  async function useBasicAttack(target){
    const p=current();
    if(p.turn.basicSpent >= 1 + (p.buffs.extraBasicCap||0)) return;
    const b = getActiveBasicAttack(p);
    const reactive = maybeTriggerReactiveMoveOnTargeted(p, target, b, b.name || '普通攻击');
    if (reactive.evaded) {
      p.turn.basicSpent += 1;
      p.buffs.nextBasicFlat = 0; p.buffs.nextBasicDie = null; p.buffs.swordBonusStored = false;
      if(p.buffs.basicTransform && p.buffs.basicTransform.consumeOn === 'next_basic_attack') p.buffs.basicTransform = null;
      log(`${p.label} 的 ${b.name || '普通攻击'} 被 ${target.label} 闪开。`);
      finishAfterAction();
      return;
    }
    let dmg = await showDice(`${b.name || p.weapon.name + ' 普攻'}`, resolvePlayerNotation(p, b.damage));
    dmg += Number(p.buffs.nextBasicFlat || 0);
    if(p.buffs.nextBasicDie) dmg += await showDice('额外骰', resolvePlayerNotation(p, p.buffs.nextBasicDie));
    if(p.professionKey==='rogue' && (target.statuses.slow || target.statuses.disarm || target.statuses.sheep)) dmg += await showDice('盗贼被动', '1d4');
    if(p.professionKey==='hunter' && target.marked){ dmg += 2; target.marked = false; log(`${p.label} 的猎人被动触发，追加 2 伤害并移除标记。`); }
    const damageResult = dealDamage(p, target, dmg, { sourceName: b.name || '普通攻击' });
    if(!damageResult.dodged){
      if(p.professionKey==='shaman' && p.profession.passives.shaman_passive){ target.statuses.burn = 2; log(`${target.label} 被点燃。`); }
      if(b.apply?.slow) target.statuses.slow = b.apply.slow;
      if(b.apply?.disarm) target.statuses.disarm = b.apply.disarm;
      if(b.apply?.burn) target.statuses.burn = b.apply.burn;
      if(b.apply?.sheep) target.statuses.sheep = b.apply.sheep;
    }
    p.turn.basicSpent += 1;
    p.buffs.nextBasicFlat = 0; p.buffs.nextBasicDie = null; p.buffs.swordBonusStored = false;
    if(p.buffs.basicTransform && p.buffs.basicTransform.consumeOn === 'next_basic_attack') p.buffs.basicTransform = null;
    await applyDamageTriggeredPassives(p, damageResult.finalDamage, target, b.name || '普通攻击');
    log(`${p.label} 使用 ${b.name} 命中 ${target.label}，原始伤害 ${dmg}，实际伤害 ${damageResult.finalDamage}，目标当前生命 ${target.hp}，格挡 ${target.block}。`);
    finishAfterAction();
  }

  async function playCardFromHand(index){
    const p=current();
    if(state.pending?.type==='discard'){ discardHandCard(index); return; }
    const handItem = p.hand[index];
    const cardDef = getCardDef(handItem.cardKey);
    if(!cardDef) return;
    if(!cardCanBePlayed(p, handItem, cardDef)) { setHint('当前行动桶已用尽，或法师移动限制生效。'); return; }
    if(cardDef.template==='dual_mode'){
      state.dualModeCard = { index, handItem, cardDef };
      renderChoicePanel(cardDef.config.modes || []);
      return;
    }
    state.pending = { type:'card', index, handItem, cardDef };
    setMode(`卡牌：${cardDef.name}`);
    render();
    if(cardDef.template==='self_buff' || cardDef.template==='summon_token_into_self_deck' || cardDef.template==='grant_multiple_buffs' || cardDef.template==='transform_basic_attack'){
      await resolveCard(index, handItem, cardDef, null, null);
      return;
    }
    setHint('请点击合法目标或地块。');
  }

  function renderChoicePanel(modes){
    const panel = $('choice-panel');
    panel.innerHTML = '<div class="choice-title">请选择模式</div>';
    modes.forEach((mode, i)=>{
      const btn=document.createElement('button'); btn.className='secondary'; btn.textContent=mode.name || `模式${i+1}`;
      btn.onclick = () => chooseMode(i);
      panel.appendChild(btn);
    });
  }

  async function chooseMode(i){
    const p=current();
    const info=state.dualModeCard; if(!info) return;
    const mode = deep(info.cardDef.config.modes[i]);
    const virtualCard = {
      name: `${info.cardDef.name} · ${mode.name}`,
      source: info.handItem.origin,
      template: mode.templateRef,
      config: mode
    };
    $('choice-panel').innerHTML='';
    if(virtualCard.template==='self_buff' || virtualCard.template==='summon_token_into_self_deck'){
      await resolveCard(info.index, info.handItem, virtualCard, null, null);
      state.dualModeCard = null;
      return;
    }
    state.pending = { type:'card', index: info.index, handItem: info.handItem, cardDef: virtualCard };
    state.dualModeCard = null;
    setMode(`模式：${virtualCard.name}`);
    render();
    setHint('请点击模式对应的合法目标。');
  }

  function consumeBucket(p, handItem){
    const bucket = actionBucketFor(handItem);
    if(bucket==='class_or_guardian'){
      if(p.turn.classOrGuardianUsed && handItem.origin === '职业技能' && (p.buffs.extraClassCardUses || 0) > 0){
        p.buffs.extraClassCardUses = Math.max(0, Number(p.buffs.extraClassCardUses || 0) - 1);
      } else {
        p.turn.classOrGuardianUsed = true;
      }
    }
    if(bucket==='weapon_or_accessory') p.turn.weaponOrAccessoryUsed = true;
  }

  async function resolveCard(index, handItem, cardDef, tile, target){
    const p=current();
    consumeBucket(p, handItem);
    p.hand.splice(index,1);
    p.discard.push(handItem);

    if(cardDef.template==='summon_token_into_self_deck'){
      const token = cardDef.config.tokenType || 'skeleton';
      const n = Number(cardDef.config.insertCount || 1);
      p.summons[token] = (p.summons[token] || 0) + n;
      const tokenName = token==='bone_dragon' ? '骨龙' : '骷髅';
      log(`${p.label} 使用了 ${cardDef.name}，召唤 ${n} 个${tokenName}，当前骷髅 ${p.summons.skeleton||0} / 骨龙 ${p.summons.bone_dragon||0}。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='self_buff'){
      if(cardDef.config.heal){
        const heal = typeof cardDef.config.heal==='string' && cardDef.config.heal.includes('d') ? await showDice('治疗', cardDef.config.heal) : Number(cardDef.config.heal||0);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        if(p.professionKey==='priest'){ p.counters.heal_count += 1; if(p.counters.heal_count % 4 === 0){ const bonus = await showDice('牧师被动', '1d6'); p.hp = Math.min(p.maxHp, p.hp + bonus); log(`${p.label} 的牧师被动额外恢复 ${bonus}。`); } }
      }
      if(cardDef.config.block){ const block = typeof cardDef.config.block==='string' && cardDef.config.block.includes('d') ? await showDice('格挡', cardDef.config.block) : Number(cardDef.config.block||0); p.block += block; }
      if(cardDef.config.buffBasic) p.buffs.nextBasicFlat = (p.buffs.nextBasicFlat||0) + Number(cardDef.config.buffBasic||0);
      if(cardDef.config.bonusDie) p.buffs.nextBasicDie = cardDef.config.bonusDie;
      if(cardDef.config.basicAttackCapDelta) p.buffs.extraBasicCap = (p.buffs.extraBasicCap||0) + Number(cardDef.config.basicAttackCapDelta||0);
      if(cardDef.config.classSkillCapDelta) p.buffs.extraClassCardUses = (p.buffs.extraClassCardUses||0) + Number(cardDef.config.classSkillCapDelta||0);
      if(cardDef.config.dodgeNext) p.buffs.dodgeNextDamage = (p.buffs.dodgeNextDamage||0) + 1;
      if(cardDef.config.counterDamage || cardDef.config.counterUseTakenDamage){
        p.buffs.counterDamage = cardDef.config.counterDamage || p.buffs.counterDamage || '';
        p.buffs.counterUseTakenDamage = !!cardDef.config.counterUseTakenDamage;
        p.buffs.counterCharges = (p.buffs.counterCharges||0) + 1;
      }
      if(cardDef.config.reactiveMoveTrigger){
        p.buffs.reactiveMoveTrigger = cardDef.config.reactiveMoveTrigger;
        p.buffs.reactiveMoveMaxDistance = Number(cardDef.config.reactiveMoveMaxDistance || 0);
        p.buffs.reactiveMoveCharges = (p.buffs.reactiveMoveCharges||0) + 1;
      }
      if(cardDef.config.healOnDamaged){
        p.buffs.healOnDamaged = cardDef.config.healOnDamaged;
        p.buffs.healOnDamagedCharges = (p.buffs.healOnDamagedCharges||0) + 1;
      }
      if(cardDef.config.disarmAttackerOnHit){
        p.buffs.disarmAttackerOnHit = Number(cardDef.config.disarmAttackerOnHit || 1);
        p.buffs.disarmAttackerCharges = (p.buffs.disarmAttackerCharges||0) + 1;
      }
      if(cardDef.name.includes('法术无效') || cardDef.config.consumeOn==='next_spell_hit') p.buffs.spellImmune = true;
      log(`${p.label} 使用了 ${cardDef.name}，当前生命 ${p.hp}，格挡 ${p.block}。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='grant_multiple_buffs'){
      await applyRewardList(p, cardDef.config.rewardList || [], cardDef.name);
      if(cardDef.config.consumeOn === 'next_spell_hit') p.buffs.spellImmune = true;
      log(`${p.label} 使用了 ${cardDef.name}，直接获得多个增益。当前生命 ${p.hp}，格挡 ${p.block}。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='transform_basic_attack'){
      p.buffs.basicTransform = {
        consumeOn: cardDef.config.consumeOn || 'next_basic_attack',
        durationTurns: Number(cardDef.config.durationTurns || 1),
        override: {
          name: cardDef.config.attackName || `${cardDef.name}（变身普攻）`,
          range: Number(cardDef.config.range || p.weapon.basic.range || 1),
          damage: cardDef.config.damage || p.weapon.basic.damage,
          straight: !!cardDef.config.straight,
          apply: deep(cardDef.config.apply || {})
        }
      };
      if(cardDef.config.block){ p.block += (typeof cardDef.config.block==='string' && cardDef.config.block.includes('d')) ? await showDice('格挡', cardDef.config.block) : Number(cardDef.config.block||0); }
      log(`${p.label} 使用了 ${cardDef.name}，其普通攻击已被改变。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='teleport' && tile){
      p.turn.move = true;
      p.turn.movedDistance = dist(p.pos, tile);
      p.pos = deep(tile);
      enterTile(p);
      log(`${p.label} 使用 ${cardDef.name} 移动到目标地块。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='create_map_token' && tile){
      createMapTokenFromCard(p, tile, cardDef);
      finishAfterAction();
      return;
    }

    if((cardDef.template==='direct_damage' || cardDef.template==='dash_hit' || cardDef.template==='insert_negative_card_into_target_deck' || cardDef.template==='mark_target_for_bonus' || cardDef.template==='bonus_if_target_marked' || cardDef.template==='consume_all_activated_tokens_for_burst' || cardDef.template==='damage_then_multi_buff' || cardDef.template==='damage_roll_grant_card') && target){
      if(target.buffs?.spellImmune && cardDef.config.spell){
        target.buffs.spellImmune = false;
        log(`${target.label} 的法术无效抵消了 ${cardDef.name}。`);
        finishAfterAction();
        return;
      }
      const reactive = maybeTriggerReactiveMoveOnTargeted(p, target, cardDef, cardDef.name);
      if (reactive.evaded){
        log(`${p.label} 的 ${cardDef.name} 被 ${target.label} 闪开。`);
        finishAfterAction();
        return;
      }
      if(cardDef.template==='dash_hit'){
        const adj = neighbors(target.pos).filter(c=>state.boardMap.has(key(c)) && !getPlayerAt(c)).sort((a,b)=>dist(p.pos,a)-dist(p.pos,b))[0];
        if(adj){ p.pos = adj; }
      }
      if(cardDef.template==='mark_target_for_bonus'){
        target.marked = true;
        log(`${p.label} 使用 ${cardDef.name} 标记了 ${target.label}。`);
        finishAfterAction();
        return;
      }
      let dmg = 0;
      if(cardDef.template==='bonus_if_target_marked'){
        dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.baseDamage || '1d6'));
        if(target.marked){
          dmg += Number(cardDef.config.bonusDamage || 0);
          if(cardDef.config.consumeMark !== false) target.marked = false;
        }
      } else if(cardDef.template==='consume_all_activated_tokens_for_burst'){
        dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.baseDamage || '2d4'));
        const bonusMap = cardDef.config.bonusByTokenType || {};
        const skeletons = p.summons?.skeleton || 0;
        const dragons = p.summons?.bone_dragon || 0;
        dmg += loggedRollBatch(`${p.label} 的骷髅被亡灵爆发消耗`, bonusMap.skeleton || '1d4', skeletons);
        dmg += loggedRollBatch(`${p.label} 的骨龙被亡灵爆发消耗`, bonusMap.bone_dragon || '1d8', dragons);
        p.summons.skeleton = 0;
        p.summons.bone_dragon = 0;
      } else if(cardDef.config.damage) dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.damage));
      if(cardDef.config.conditionalBonus?.condition==='moved_this_turn' && p.turn.movedDistance>0) dmg += await showDice('条件追加', resolvePlayerNotation(p, cardDef.config.conditionalBonus.bonusDamage));
      if(cardDef.config.conditionalBonus?.condition==='target_controlled' && (target.statuses.slow||target.statuses.disarm||target.statuses.sheep)) dmg += Number(cardDef.config.conditionalBonus.bonusFlat || 0);
      if(cardDef.config.conditionalBonus?.condition==='target_hp_lte' && target.hp <= Number(cardDef.config.conditionalBonus.threshold||0)) dmg += await showDice('斩杀追加', resolvePlayerNotation(p, cardDef.config.conditionalBonus.bonusDamage));
      const damageResult = dealDamage(p, target, dmg, { sourceName: cardDef.name });
      if(cardDef.config.buffBasic) p.buffs.nextBasicFlat = (p.buffs.nextBasicFlat||0) + Number(cardDef.config.buffBasic||0);
      if(cardDef.config.gainBlock) p.block += await showDice('获得格挡', cardDef.config.gainBlock);
      if(!damageResult.dodged){
        if(cardDef.config.apply?.slow) target.statuses.slow = cardDef.config.apply.slow;
        if(cardDef.config.apply?.disarm) target.statuses.disarm = cardDef.config.apply.disarm;
        if(cardDef.config.apply?.burn) target.statuses.burn = cardDef.config.apply.burn;
        if(cardDef.config.apply?.sheep) target.statuses.sheep = cardDef.config.apply.sheep;
        if(cardDef.config.applyTemplate==='dot_damage_over_time'){ target.statuses.dot = deep(cardDef.config.applyConfig); }
      }
      if(cardDef.template==='damage_then_multi_buff'){
        const threshold = Number(cardDef.config.threshold || 0);
        if(damageResult.finalDamage >= threshold){
          await applyRewardList(p, cardDef.config.rewardList || [], cardDef.name);
          log(`${cardDef.name} 达到阈值 ${threshold}，获得后续增益。`);
        } else {
          log(`${cardDef.name} 未达到阈值 ${threshold}，不获得后续增益。`);
        }
      }
      if(cardDef.template==='damage_roll_grant_card'){
        const proc = await showDice(`${cardDef.name} 触发判定`, cardDef.config.procDie || '1d6');
        if(proc >= Number(cardDef.config.threshold || 0)){
          grantCardToHand(p, cardDef.config.grantedCardKey, cardDef.config.grantedOrigin || handItem.origin);
          if(cardDef.config.refundBucket === 'class_or_guardian') p.turn.classOrGuardianUsed = false;
          if(cardDef.config.refundBucket === 'weapon_or_accessory') p.turn.weaponOrAccessoryUsed = false;
          if(cardDef.config.refundBucket === 'basic_attack') p.turn.basicSpent = Math.max(0, (p.turn.basicSpent || 0) - 1);
          log(`${p.label} 的 ${cardDef.name} 触发成功，可以再次行动。`);
        } else {
          log(`${p.label} 的 ${cardDef.name} 未触发追加效果。`);
        }
      }
      await applyDamageTriggeredPassives(p, damageResult.finalDamage, target, cardDef.name);
      if(cardDef.template==='insert_negative_card_into_target_deck'){
        const cnt = Number(cardDef.config.insertCount || 1);
        for(let i=0;i<cnt;i++) target.deck.splice(Math.floor(Math.random()*(target.deck.length+1)),0,{cardKey:cardDef.config.insertCardKey, origin:'负面牌'});
        log(`${target.label} 的牌库被加入了 ${cnt} 张负面牌。`);
      }
      log(`${p.label} 使用 ${cardDef.name} 对 ${target.label} 结算，原始伤害 ${dmg}，实际伤害 ${damageResult.finalDamage}，目标当前生命 ${target.hp}，格挡 ${target.block}。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='aoe' && tile){
      const targets = state.players.filter(x=>x.alive && x.id!==p.id && dist(x.pos,tile)<=Number(cardDef.config.radius||1));
      for(const target of targets){
        let dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.damage));
        const damageResult = dealDamage(p, target, dmg, { sourceName: cardDef.name });
        if(!damageResult.dodged && cardDef.config.apply?.slow) target.statuses.slow = cardDef.config.apply.slow;
        log(`${p.label} 的 ${cardDef.name} 命中 ${target.label}，原始伤害 ${dmg}，实际伤害 ${damageResult.finalDamage}，目标当前生命 ${target.hp}，格挡 ${target.block}。`);
      }
      log(`${p.label} 使用 ${cardDef.name} 对范围内目标结算完成。`);
      finishAfterAction();
    }
  }

  function resolveNegativeOnDraw(player, handItem){
    const def = getCardDef(handItem.cardKey);
    if(!def) return;
    const tpl = def.template || 'direct_damage';
    const cfg = def.config || {};
    let totalDamage = 0;
    if (tpl === 'direct_damage' || tpl === 'negative_direct_damage') {
      totalDamage = loggedRoll(`${player.label} 负面牌伤害`, cfg.damage || '2d6');
      dealDamage(null, player, totalDamage, { sourceName: def.name || '负面牌' });
    }
    if (tpl === 'negative_dot' || tpl === 'negative_mixed') {
      if (cfg.damagePerTick) {
        player.statuses.dot = { damagePerTick: cfg.damagePerTick, durationTurns: Number(cfg.durationTurns || 2), tickTiming: cfg.tickTiming || 'turn_start' };
      }
    }
    if (tpl === 'negative_control' || tpl === 'negative_mixed') {
      const ctl = cfg.controlType || 'slow';
      const dur = Number(cfg.controlDuration || cfg.durationTurns || 1);
      if (ctl === 'slow') player.statuses.slow = Math.max(player.statuses.slow || 0, dur);
      else if (ctl === 'disarm') player.statuses.disarm = Math.max(player.statuses.disarm || 0, dur);
      else if (ctl === 'sheep') player.statuses.sheep = Math.max(player.statuses.sheep || 0, dur);
      else if (ctl === 'burn') player.statuses.burn = Math.max(player.statuses.burn || 0, dur);
    }
    if (tpl === 'negative_mixed' && cfg.damage) {
      const extraDamage = loggedRoll(`${player.label} 负面牌额外伤害`, cfg.damage);
      totalDamage += extraDamage;
      dealDamage(null, player, extraDamage, { sourceName: `${def.name || '负面牌'} 追加伤害` });
    }
    if (player.hp < 0) player.hp = 0;
    log(`${player.label} 抽到 ${def.name} 并触发负面效果，当前生命 ${player.hp}。`);
  }

  function finishAfterAction(){
    state.pending = null;
    state.selectedCardIndex = null;
    $('choice-panel').innerHTML = '';
    state.players.forEach(p=>{ if(p.hp<=0){ p.hp=0; p.alive=false; }});
    const living = state.players.filter(p=>p.alive);
    if(living.length===1){ state.winner = living[0].id; setHint(`${living[0].label} 获胜！`); }
    render();
  }

  function renderPlayerInfo(){
    const active=current();
    $('player-info').innerHTML = `<h2>${I18N().t('role_status','角色状态')}</h2><div class="info-grid">${state.players.map(p=>{
      const hpPct = Math.max(0, Math.min(100, p.hp/p.maxHp*100));
      const blockPct = Math.max(0, Math.min(100, p.block*10));
      return `<div class="player-box${p.id===active.id?' active':''}">
        <div class="player-title"><strong>${p.label}</strong><span>${I18N().entity('profession', p.professionKey, p.profession.name)} / ${I18N().entity('weapon', p.weaponKey, p.weapon.name)} / ${I18N().entity('accessory', p.accessoryKey, p.accessory.name)}</span></div>
        <div class="stat-line">${I18N().t('hp','生命')} ${p.hp} / ${p.maxHp}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div></div>
        <div class="stat-line">${I18N().t('block','格挡')} ${p.block}</div>
        <div class="block-bar"><div class="block-fill" style="width:${blockPct}%"></div></div>
        <div class="stat-line">${I18N().t('weapon_basic','武器普攻')}：${p.weapon.basic.damage} / ${p.weapon.basic.type} / ${I18N().t('distance','距离')} ${p.weapon.basic.range}</div>
        <div class="stat-line">${I18N().t('action','行动')}：职业卡 ${p.turn.classOrGuardianUsed?'✓':'○'}${(p.buffs.extraClassCardUses||0)>0?` +${p.buffs.extraClassCardUses}`:''} / 武器卡 ${p.turn.weaponOrAccessoryUsed?'✓':'○'} / 移动 ${p.turn.move?'✓':'○'} / 普攻 ${p.turn.basicSpent}/${1 + (p.buffs.extraBasicCap||0)} / 格挡 ${p.turn.autoBlockTriggered?'✓':'○'}</div>
        <div class="stat-line">${I18N().t('status_skeleton','骷髅')} ${p.summons?.skeleton||0} / ${I18N().t('status_dragon','骨龙')} ${p.summons?.bone_dragon||0}</div>
        <div>${formatStatuses(p)}</div>
      </div>`;
    }).join('')}</div>`;
    $('turn-indicator').textContent = state.winner ? '对局结束' : `轮到 ${active.label}`;
  }

  function formatStatuses(p){
    const out=[];
    if(p.statuses.burn>0) out.push(`<span class="status-chip">${I18N().t('status_burn','点燃')} ${p.statuses.burn}</span>`);
    if(p.statuses.slow>0) out.push(`<span class="status-chip">${I18N().t('status_slow','减速')}</span>`);
    if(p.statuses.disarm>0) out.push(`<span class="status-chip">${I18N().t('status_disarm','缴械')}</span>`);
    if(p.statuses.sheep>0) out.push(`<span class="status-chip">${I18N().t('status_sheep','变羊')}</span>`);
    if(p.statuses.dot) out.push(`<span class="status-chip">${I18N().t('status_dot','DOT')} ${p.statuses.dot.durationTurns}</span>`);
    if(p.buffs.spellImmune) out.push(`<span class="status-chip">${I18N().t('status_spell_immune','法术无效')}</span>`);
    if(p.buffs.dodgeNextDamage) out.push(`<span class="status-chip">闪避 x${p.buffs.dodgeNextDamage}</span>`);
    if(p.buffs.counterCharges) out.push(`<span class="status-chip">反击待命</span>`);
    if(p.buffs.extraClassCardUses) out.push(`<span class="status-chip">额外职业卡 +${p.buffs.extraClassCardUses}</span>`);
    if(p.buffs.reactiveMoveCharges && p.buffs.reactiveMoveTrigger) out.push(`<span class="status-chip">随机位移 ${p.buffs.reactiveMoveTrigger}</span>`);
    if(p.buffs.healOnDamagedCharges && p.buffs.healOnDamaged) out.push(`<span class="status-chip">受伤自疗 ${p.buffs.healOnDamaged}</span>`);
    if(p.buffs.disarmAttackerCharges && p.buffs.disarmAttackerOnHit) out.push(`<span class="status-chip">受击缴械 ${p.buffs.disarmAttackerOnHit}</span>`);
    if(p.buffs.nextBasicFlat) out.push(`<span class="status-chip">下次普攻 +${p.buffs.nextBasicFlat}</span>`);
    if(p.buffs.nextBasicDie) out.push(`<span class="status-chip">下次普攻 +${p.buffs.nextBasicDie}</span>`);
    if(p.buffs.basicTransform) out.push(`<span class="status-chip">普攻变身中</span>`);
    if(p.marked) out.push(`<span class="status-chip">${I18N().t('status_marked','标记')}</span>`); return out.join('') || `<span class="status-chip">${I18N().t('status_none','无状态')}</span>`;
  }

  function tileHighlights(){
    return highlightSet();
  }

  function renderBoard(){
    const svg = $('board'); svg.innerHTML = '';
    const hl = tileHighlights(); const active=current();
    state.board.forEach(t=>{
      const {x,y}=hexToPixel(t); const g=document.createElementNS(svgNS,'g'); g.classList.add('tile');
      const kk=key(t);
      if(hl.moves.has(kk)) g.classList.add('valid-move');
      if(hl.targets.has(kk)) g.classList.add('valid-target');
      if(kk===key(active.pos)) g.classList.add('selected-origin');
      g.onclick = ()=>tileClick(t);
      const poly=document.createElementNS(svgNS,'polygon');
      poly.setAttribute('points', hexPoints(x,y));
      const inDanger = ((isSpikeDangerTile(t) && t.type !== 'spike') || (isTokenDangerTile(t) && !getMapToken(t)));
      poly.setAttribute('fill', t.type==='center'?'#6c3b75': t.type==='spike'?'#7d5353': t.type==='start'?'#465b3f': inDanger ? '#5b4141' : '#36404d');
      poly.setAttribute('opacity','0.96'); g.appendChild(poly);
      if(inDanger){
        const zone=document.createElementNS(svgNS,'polygon');
        zone.setAttribute('points', hexPoints(x,y));
        zone.setAttribute('fill','#ff7a7a');
        zone.setAttribute('opacity','0.12');
        zone.setAttribute('stroke','#ff9a9a');
        zone.setAttribute('stroke-width','2');
        g.appendChild(zone);
      }
      const mapTok = getMapToken(t);
      if(t.type==='center' || t.type==='spike' || state.traps.has(kk) || mapTok){
        if(t.type==='spike'){
          const pillar=document.createElementNS(svgNS,'circle');
          pillar.setAttribute('cx',x); pillar.setAttribute('cy',y); pillar.setAttribute('r',16); pillar.setAttribute('fill','#aa7d7d'); pillar.setAttribute('opacity','0.9');
          g.appendChild(pillar);
        }
        if(mapTok && mapTok.kind==='permanent_pillar'){
          const pillar=document.createElementNS(svgNS,'circle');
          pillar.setAttribute('cx',x); pillar.setAttribute('cy',y); pillar.setAttribute('r',14); pillar.setAttribute('fill','#7f6b4b'); pillar.setAttribute('opacity','0.95');
          g.appendChild(pillar);
        }
        if(mapTok && mapTok.kind==='auto_turret'){
          const turret=document.createElementNS(svgNS,'rect');
          turret.setAttribute('x',x-12); turret.setAttribute('y',y-12); turret.setAttribute('width',24); turret.setAttribute('height',24); turret.setAttribute('rx',4);
          turret.setAttribute('fill','#7aa0c8'); turret.setAttribute('opacity','0.95');
          g.appendChild(turret);
        }
        if(mapTok && mapTok.kind==='trap_once_negative'){
          const trapIcon=document.createElementNS(svgNS,'polygon');
          trapIcon.setAttribute('points', `${x},${y-12} ${x+10},${y+8} ${x-10},${y+8}`);
          trapIcon.setAttribute('fill','#d7b35f');
          g.appendChild(trapIcon);
        }
        const txt=document.createElementNS(svgNS,'text');
        txt.setAttribute('x',x); txt.setAttribute('y',t.type==='center'||t.type==='spike'||(mapTok&&mapTok.kind==='permanent_pillar')?y+4:y-20); txt.setAttribute('text-anchor','middle');
        txt.textContent = t.type==='center'?I18N().t('black_hole','黑洞'):t.type==='spike'?I18N().t('spike','刺'):mapTok?mapTok.name:I18N().t('trap','陷阱');
        g.appendChild(txt);
      }
      svg.appendChild(g);
    });
    state.players.filter(p=>p.alive).forEach(p=>{
      const {x,y}=hexToPixel(p.pos);
      const c=document.createElementNS(svgNS,'circle');
      c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r',22); c.setAttribute('fill',p.color); c.setAttribute('class','unit-circle');
      svg.appendChild(c);
      ['P'+p.id, `HP ${p.hp} / 格挡 ${p.block}`].forEach((txt,idx)=>{
        const t=document.createElementNS(svgNS,'text'); t.setAttribute('x',x); t.setAttribute('y', idx===0?y+5:y+36); t.setAttribute('text-anchor','middle'); if(idx===0) t.setAttribute('class','unit-label'); t.textContent=txt; svg.appendChild(t);
      });
    });
  }

  function renderHand(){
    const hand = $('hand'); hand.innerHTML='';
    const p=current();
    p.hand.forEach((item, idx)=>{
      const def = getCardDef(item.cardKey);
      if(!def) return;
      const b=document.createElement('button');
      b.className='card'+(state.selectedCardIndex===idx?' selected':'');
      b.innerHTML=`<div class="card-name">${I18N().entity('card', item.cardKey, def.name)}</div>
        <div class="card-meta">${I18N().t('source','来源')}：${I18N().entity('origin', item.origin, item.origin)} · ${I18N().t('template','模板')}：${I18N().entity('template', def.template, def.template)}</div>
        <div class="card-text">${def.text || ''}</div>`;
      b.onclick = ()=>playCardFromHand(idx);
      hand.appendChild(b);
    });
  }


  function renderPassiveButton(){
    const btn = $('btn-passive');
    if (!btn) return;
    const p = current();
    const passive = Object.values(p.profession.passives || {})[0];
    if (!passive || passive.template !== 'life_for_card_draw_once_per_turn'){
      btn.style.display = 'none';
      return;
    }
    btn.style.display = '';
    btn.textContent = `${passive.name || '职业被动'}（-${passive.config?.lifeCost || 0} 生命 / +${passive.config?.drawCount || 1} 抽）`;
    btn.disabled = !!p.turn.classOrGuardianUsed || !p.alive;
  }

  function render(){
    renderPlayerInfo();
    renderPassiveButton();
    renderBoard();
    renderHand();
  }

  function tileClick(tile){
    const p=current();
    if(state.pending?.type==='discard') return;
    const occ=getPlayerAt(tile);
    if(state.pending?.type==='move' && !occ){
      const reachable=getReachableTiles(p);
      if(reachable.has(key(tile))){
        p.turn.move = true; p.turn.movedDistance = dist(p.pos, tile); p.pos = deep(tile); enterTile(p); finishAfterAction();
      }
      return;
    }
    if(state.pending?.type==='basic' && occ && occ.id!==p.id){
      if(canBasicTarget(p,occ)) useBasicAttack(occ);
      return;
    }
    if(state.pending?.type==='card'){
      const def=state.pending.cardDef;
      if(def.template==='teleport' && !occ && !isBlockedTile(tile) && dist(p.pos,tile)<=Number(def.config.range||0)) resolveCard(state.pending.index,state.pending.handItem,def,tile,null);
      else if(def.template==='create_map_token' && !occ && !isBlockedTile(tile) && withinTileRange(p,tile,def)) resolveCard(state.pending.index,state.pending.handItem,def,tile,null);
      else if(def.template==='aoe' && dist(p.pos,tile)<=Number(def.config.range||0)) resolveCard(state.pending.index,state.pending.handItem,def,tile,null);
      else if(occ && occ.id!==p.id && withinTargetRange(p,occ,def)) resolveCard(state.pending.index,state.pending.handItem,def,null,occ);
    }
  }

  function runAiTurn(){
    const p=current(); if(!p.alive || p.type!=='ai' || state.winner || state.pending?.type==='discard') return;
    const enemy=enemyOf(p);
    const playable = p.hand.map((h,i)=>({h,i,def:getCardDef(h.cardKey)})).filter(x=>x.def && cardCanBePlayed(p,x.h,x.def));
    const direct = playable.find(x => ['direct_damage','dash_hit','insert_negative_card_into_target_deck'].includes(x.def.template) && withinTargetRange(p, enemy, x.def));
    if(direct){ playCardFromHand(direct.i); setTimeout(()=>{ if(state.pending?.type==='card') resolveCard(state.pending.index,state.pending.handItem,state.pending.cardDef,null,enemy); }, 400); return; }
    if(!p.turn.basicSpent && canBasicTarget(p,enemy)){ useBasicAttack(enemy); return; }
    if(!p.turn.move){
      const reachable=[...getReachableTiles(p)].map(s=>{const [q,r]=s.split(',').map(Number); return {q,r};}).sort((a,b)=>dist(a,enemy.pos)-dist(b,enemy.pos));
      if(reachable[0]){ p.turn.move=true; p.turn.movedDistance=dist(p.pos,reachable[0]); p.pos=reachable[0]; enterTile(p); finishAfterAction(); return; }
    }
    endTurn();
  }

  function endTurn(){
    const p=current();
    if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; }
    if(p.professionKey==='swordsman' && p.turn.basicSpent===0) p.buffs.nextBasicFlat = Math.max(p.buffs.nextBasicFlat||0, 5);
    if(p.buffs.extraBasicCap) p.buffs.extraBasicCap = 0;
    if(p.buffs.extraClassCardUses) p.buffs.extraClassCardUses = 0;
    if(p.statuses.slow>0) p.statuses.slow -= 1;
    if(p.statuses.disarm>0) p.statuses.disarm -= 1;
    if(p.statuses.sheep>0){ p.statuses.sheep -= 1; }
    state.pending = null; state.selectedCardIndex = null; $('choice-panel').innerHTML=''; setMode('待机');
    nextTurn();
  }

  function populateSetup(){
    const rulesets = STUDIO_RUNTIME.loadRulesets(); const rsSel = $('ruleset-select'); rsSel.innerHTML='';
    rulesets.forEach(rs=>{ const o=document.createElement('option'); o.value=rs.id; o.textContent=rs.name; rsSel.appendChild(o); });
    rsSel.value = STUDIO_RUNTIME.getActiveRulesetId();
    const data = STUDIO_RUNTIME.findRuleset(rsSel.value).data;
    [['p1-profession', data.professions],['p2-profession', data.professions],['p1-weapon', data.weaponLibrary],['p2-weapon', data.weaponLibrary],['p1-accessory', data.accessoryLibrary],['p2-accessory', data.accessoryLibrary]].forEach(([id, obj])=>{
      const sel=$(id); sel.innerHTML=''; Object.entries(obj).forEach(([k,v])=>{ const o=document.createElement('option'); o.value=k; const kind = id.includes('profession') ? 'profession' : id.includes('weapon') ? 'weapon' : 'accessory'; o.textContent=I18N().entity(kind, k, v.name); sel.appendChild(o); });
    });
    $('p1-profession').value='warrior'; $('p1-weapon').value='greatsword'; $('p1-accessory').value='trapbag';
    $('p2-profession').value='mage'; $('p2-weapon').value='longbow'; $('p2-accessory').value='lincoln';
  }

  function bind(){
    $('start-game').onclick = startGame;
    $('btn-move').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } state.pending={type:'move'}; setMode('移动模式'); render(); setHint('请选择可移动地块。'); };
    $('btn-basic-attack').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } state.pending={type:'basic'}; setMode('普通攻击'); render(); setHint('请选择普通攻击目标。'); };
    $('btn-passive').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } useProfessionPassive(); };
    $('btn-cancel').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } state.pending=null; state.selectedCardIndex=null; $('choice-panel').innerHTML=''; setMode('待机'); render(); setHint('已取消当前选择。'); };
    $('btn-end-turn').onclick = endTurn;
    $('btn-restart').onclick = ()=>location.reload();
    if ($('btn-export-battle-log')) $('btn-export-battle-log').onclick = exportBattleLog;
    if ($('btn-export-debug-log')) $('btn-export-debug-log').onclick = exportDebugBundle;
    $('ruleset-select').onchange = populateSetup;
  }
  (async()=>{
    await STUDIO_RUNTIME.init();
    populateSetup();
    bind();
    window.addEventListener('studio-language-changed', () => { populateSetup(); render(); if(window.STUDIO_I18N) STUDIO_I18N.applyPage(); });
  })();
})();
