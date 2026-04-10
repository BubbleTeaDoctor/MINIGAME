// Board overlay engine v0.9.2
// Purpose: provide a reusable hex-board engine for radius-6 maps and unified highlight logic.
// This is designed to be copied into Studio game.js or imported as a standalone helper.

(function (global) {
  function keyOf(q, r) {
    return q + ',' + r;
  }

  function parseKey(key) {
    const [q, r] = String(key).split(',').map(Number);
    return { q, r };
  }

  function hexDistance(a, b) {
    const dq = a.q - b.q;
    const dr = a.r - b.r;
    const ds = (-a.q - a.r) - (-b.q - b.r);
    return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
  }

  function neighborsOf(tile) {
    return [
      { q: tile.q + 1, r: tile.r },
      { q: tile.q - 1, r: tile.r },
      { q: tile.q, r: tile.r + 1 },
      { q: tile.q, r: tile.r - 1 },
      { q: tile.q + 1, r: tile.r - 1 },
      { q: tile.q - 1, r: tile.r + 1 },
    ];
  }

  function isInsideRadius(tile, radius) {
    return Math.max(Math.abs(tile.q), Math.abs(tile.r), Math.abs(-tile.q - tile.r)) <= radius;
  }

  function buildHexBoard(radius) {
    const tiles = [];
    const byKey = {};
    for (let q = -radius; q <= radius; q += 1) {
      for (let r = -radius; r <= radius; r += 1) {
        const tile = { q, r };
        if (!isInsideRadius(tile, radius)) continue;
        const cell = {
          q,
          r,
          key: keyOf(q, r),
          ring: hexDistance({ q: 0, r: 0 }, tile),
          terrain: 'plain',
        };
        tiles.push(cell);
        byKey[cell.key] = cell;
      }
    }
    return { radius, diameter: radius * 2 + 1, tiles, byKey };
  }

  function buildOccupiedSet(units) {
    const occupied = new Set();
    (units || []).forEach((u) => {
      if (u && Number.isFinite(u.q) && Number.isFinite(u.r)) occupied.add(keyOf(u.q, u.r));
    });
    return occupied;
  }

  function getReachableTiles(board, start, distance, units, options) {
    const opts = Object.assign({
      allowOccupiedDestination: false,
      blockedTerrains: [],
      ignoreUnits: false,
    }, options || {});
    const occupied = opts.ignoreUnits ? new Set() : buildOccupiedSet(units);
    const startKey = keyOf(start.q, start.r);
    const visited = new Set([startKey]);
    const queue = [{ q: start.q, r: start.r, cost: 0 }];
    const result = [];

    while (queue.length) {
      const node = queue.shift();
      for (const next of neighborsOf(node)) {
        if (!isInsideRadius(next, board.radius)) continue;
        const nextKey = keyOf(next.q, next.r);
        if (visited.has(nextKey)) continue;
        const nextCost = node.cost + 1;
        if (nextCost > distance) continue;
        const cell = board.byKey[nextKey];
        if (!cell) continue;
        if (opts.blockedTerrains.includes(cell.terrain)) continue;
        const occupiedHere = occupied.has(nextKey) && nextKey !== startKey;
        if (occupiedHere && !opts.allowOccupiedDestination) continue;
        visited.add(nextKey);
        queue.push({ q: next.q, r: next.r, cost: nextCost });
        result.push({ q: next.q, r: next.r, key: nextKey, cost: nextCost });
      }
    }
    return result;
  }

  function areInSameHexLine(a, b) {
    const dq = b.q - a.q;
    const dr = b.r - a.r;
    const ds = (-b.q - b.r) - (-a.q - a.r);
    return dq === 0 || dr === 0 || ds === 0;
  }

  function getAttackableTargets(board, attacker, units, range, straight) {
    const result = [];
    (units || []).forEach((unit) => {
      if (!unit || unit === attacker) return;
      const dist = hexDistance(attacker, unit);
      if (dist > range) return;
      if (straight && !areInSameHexLine(attacker, unit)) return;
      result.push(unit);
    });
    return result;
  }

  function getCastableTiles(board, source, range) {
    const result = [];
    board.tiles.forEach((tile) => {
      if (hexDistance(source, tile) <= range) result.push(tile);
    });
    return result;
  }

  function getTilesInRadius(board, center, radius) {
    const result = [];
    board.tiles.forEach((tile) => {
      if (hexDistance(center, tile) <= radius) result.push(tile);
    });
    return result;
  }

  function findNearestFreeAdjacentTile(board, attacker, target, units) {
    const occupied = buildOccupiedSet(units);
    const candidates = neighborsOf(target)
      .filter((tile) => isInsideRadius(tile, board.radius))
      .filter((tile) => !occupied.has(keyOf(tile.q, tile.r)))
      .sort((a, b) => hexDistance(attacker, a) - hexDistance(attacker, b));
    return candidates[0] || null;
  }

  function projectDashLandingTile(board, attacker, target, units) {
    return findNearestFreeAdjacentTile(board, attacker, target, units);
  }

  function getOverlayForAction(args) {
    const {
      board,
      actor,
      units,
      actionType,
      range,
      radius,
      straight,
      pendingMode,
    } = args;

    if (actionType === 'move') {
      return {
        mode: 'reachable_tiles',
        cells: getReachableTiles(board, actor, range, units, { allowOccupiedDestination: false }),
      };
    }

    if (actionType === 'basic_attack') {
      const targets = getAttackableTargets(board, actor, units, range, !!straight);
      return {
        mode: 'attack_targets',
        cells: targets.map((u) => ({ q: u.q, r: u.r, key: keyOf(u.q, u.r), targetId: u.id || u.name })),
      };
    }

    if (actionType === 'direct_damage') {
      const targets = getAttackableTargets(board, actor, units, range, !!straight);
      return {
        mode: 'attack_targets',
        cells: targets.map((u) => ({ q: u.q, r: u.r, key: keyOf(u.q, u.r), targetId: u.id || u.name })),
      };
    }

    if (actionType === 'teleport') {
      return {
        mode: 'reachable_tiles',
        cells: getReachableTiles(board, actor, range, units, { allowOccupiedDestination: false, ignoreUnits: false }),
      };
    }

    if (actionType === 'aoe') {
      const castable = getCastableTiles(board, actor, range);
      return {
        mode: 'castable_tiles_with_radius_preview',
        cells: castable.map((tile) => ({
          q: tile.q,
          r: tile.r,
          key: tile.key,
          affected: getTilesInRadius(board, tile, radius || 1).map((t) => t.key),
        })),
      };
    }

    if (actionType === 'dash_hit') {
      const targets = getAttackableTargets(board, actor, units, range, !!straight);
      return {
        mode: 'attack_targets_with_landing_preview',
        cells: targets.map((u) => {
          const landing = projectDashLandingTile(board, actor, u, units);
          return {
            q: u.q,
            r: u.r,
            key: keyOf(u.q, u.r),
            targetId: u.id || u.name,
            landingKey: landing ? keyOf(landing.q, landing.r) : null,
          };
        }),
      };
    }

    if (actionType === 'dual_mode') {
      if (!pendingMode) return { mode: 'choose_mode_first', cells: [] };
      return getOverlayForAction(Object.assign({}, args, { actionType: pendingMode }));
    }

    return { mode: 'none', cells: [] };
  }

  function applyOverlayState(state, overlay) {
    state.overlay = {
      mode: overlay.mode,
      cells: overlay.cells || [],
      active: overlay.mode !== 'none' && overlay.mode !== 'choose_mode_first',
    };
    return state.overlay;
  }

  function clearOverlayState(state) {
    state.overlay = { mode: 'none', cells: [], active: false };
    return state.overlay;
  }

  function buildDefaultBoardState() {
    const board = buildHexBoard(6);
    const center = board.byKey[keyOf(0, 0)];
    if (center) center.terrain = 'black_hole';
    [
      [-3, 1],
      [-2, -2],
      [-1, 3],
      [2, -3],
      [3, -1],
      [1, 2],
      [-4, 3],
      [4, -3],
    ].forEach(([q, r]) => {
      const cell = board.byKey[keyOf(q, r)];
      if (cell) cell.terrain = 'spike';
    });
    return board;
  }

  global.BoardOverlayEngineV092 = {
    keyOf,
    parseKey,
    hexDistance,
    neighborsOf,
    isInsideRadius,
    buildHexBoard,
    buildOccupiedSet,
    getReachableTiles,
    areInSameHexLine,
    getAttackableTargets,
    getCastableTiles,
    getTilesInRadius,
    findNearestFreeAdjacentTile,
    projectDashLandingTile,
    getOverlayForAction,
    applyOverlayState,
    clearOverlayState,
    buildDefaultBoardState,
  };
})(typeof window !== 'undefined' ? window : globalThis);
