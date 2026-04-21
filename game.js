
(() => {
  const $ = id => document.getElementById(id);
  const deep = o => JSON.parse(JSON.stringify(o));
  const svgNS = 'http://www.w3.org/2000/svg';
  const xlinkNS = 'http://www.w3.org/1999/xlink';
  const NO_ACCESSORY = '__none__';
  const DEFAULT_MATCH_OPTIONS = { blackHoleEnabled: true, drawOpening: 6, drawPerTurn: 2 };
  const BOARD_VIEW = { width: 2100, height: 1750 };
  const MAP_ASSETS = {
    arenaBackdrop: 'assets/map/octopath-arena-backdrop.png',
    obeliskIdle: 'assets/map/obelisk/idle.png',
    spikeFloor: 'assets/map/trap-spikes-floor.png',
    voidFx: 'assets/map/void-fx.png',
    centerTrap: 'assets/map/traps/fire-trap-level-3.png',
    magicTrap: 'assets/map/traps/magic-trap-level-2.png',
    arrowTrap: 'assets/map/traps/arrow-trap-idle.png',
    arrowProjectile: 'assets/map/traps/arrow.png',
    markFx: 'assets/map/fx/mark-red-row.png'
  };
  const AUDIO_ASSETS = {
    bgm: ['assets/audio/bgm-twilight-battle.ogg', 'assets/audio/bgm-twilight-battle.wav'],
    meleeAttack: ['assets/audio/attack-melee.ogg', 'assets/audio/attack-melee.wav'],
    meleeHit: ['assets/audio/hit-melee.ogg', 'assets/audio/hit-melee.wav'],
    bowAttack: ['assets/audio/attack-bow.ogg', 'assets/audio/attack-bow.wav'],
    bowHit: ['assets/audio/hit-bow.ogg', 'assets/audio/hit-bow.wav'],
    cast: ['assets/audio/cast-spell.ogg', 'assets/audio/cast-spell.wav'],
    spellImpact: ['assets/audio/spell-impact.ogg', 'assets/audio/spell-impact.wav'],
    trap: ['assets/audio/trap-trigger.ogg', 'assets/audio/trap-trigger.wav']
  };
  const audioState = { bgm: null, unlocked: false, muted: false };
  const audioSourceCache = {};
  const LIGHTNING_FRAMES = Array.from({ length: 14 }, (_, i) => `assets/map/fx/lightning/frame-${i}.png`);
  const BLUE_LIGHTNING_FRAMES = Array.from({ length: 14 }, (_, i) => `assets/map/fx/lightning-blue/frame-${i}.png`);
  const FIRE_HIT_FX = {
    file: 'assets/map/fx/fire-hit-row.png',
    frameWidth: 64,
    frameHeight: 64,
    frames: 12,
    scale: 1.45,
    duration: 520
  };
  const FIRE_PROJECTILE_FX = {
    file: 'assets/map/fx/fire-projectile-row.png',
    frameWidth: 64,
    frameHeight: 64,
    frames: 14,
    scale: 0.92,
    duration: 420
  };
  const SKILL_FX_DIR = 'assets/map/fx/skills/';
  const stripFx = (name, frames, scale = 1.35, duration = 520, extra = {}) => Object.assign({
    file: `${SKILL_FX_DIR}${name}.png`,
    frameWidth: 64,
    frameHeight: 64,
    frames,
    scale,
    duration
  }, extra);
  const SKILL_TILE_FX = {
    'fire-hit': FIRE_HIT_FX,
    'slash-red': stripFx('slash-red', 20, 1.45, 480),
    'slash-blue': stripFx('slash-blue', 20, 1.45, 480),
    'bleed-red': stripFx('bleed-red', 12, 1.35, 460),
    'stun-gold': stripFx('stun-gold', 16, 1.35, 560),
    'ice-blue': stripFx('ice-blue', 10, 1.65, 560),
    'root-green': stripFx('root-green', 12, 1.45, 580, { anchor: 'ground', yOffset: 18 }),
    'heal-green': stripFx('heal-green', 12, 1.35, 560),
    'holy-gold': stripFx('holy-gold', 13, 1.45, 580),
    'shield-gold': stripFx('shield-gold', 15, 1.42, 620),
    'buff-gold': stripFx('buff-gold', 14, 1.35, 560, { anchor: 'center', yOffset: -8 }),
    'buff-red': stripFx('buff-red', 14, 1.35, 560, { anchor: 'center', yOffset: -8 }),
    'teleport-blue': stripFx('teleport-blue', 12, 1.38, 520, { anchor: 'ground', yOffset: 18 }),
    'teleport-purple': stripFx('teleport-purple', 12, 1.38, 520, { anchor: 'ground', yOffset: 18 }),
    'teleport-green': stripFx('teleport-green', 12, 1.38, 520, { anchor: 'ground', yOffset: 18 }),
    'shadow-purple': stripFx('shadow-purple', 18, 1.45, 600),
    'dark-skull': stripFx('dark-skull', 15, 1.38, 620),
    'bone-white': stripFx('bone-white', 15, 1.32, 600),
    'nature-green': stripFx('nature-green', 9, 1.38, 520),
    'earth-gold': stripFx('earth-gold', 13, 1.35, 580, { anchor: 'ground', yOffset: 14 }),
    'wind-green': stripFx('wind-green', 8, 1.42, 520, { anchor: 'center', yOffset: -8 }),
    'explosion-red': stripFx('explosion-red', 12, 1.55, 580),
    'explosion-purple': stripFx('explosion-purple', 12, 1.55, 580)
  };
  const SKILL_PROJECTILE_FX = {
    fire: FIRE_PROJECTILE_FX,
    shadow: stripFx('projectile-shadow', 11, 0.95, 420, { center: true }),
    ice: stripFx('projectile-ice', 11, 0.95, 420, { center: true }),
    holy: stripFx('projectile-holy', 14, 0.92, 430, { center: true }),
    nature: stripFx('projectile-nature', 14, 0.92, 430, { center: true }),
    blue: stripFx('projectile-blue', 14, 0.9, 410, { center: true }),
    purple: stripFx('projectile-purple', 14, 0.9, 410, { center: true })
  };
  const CARD_FX_PROFILES = {
    warrior_charge: { hit: 'slash-red', anim: 'attackHeavy' },
    warrior_rage: { self: 'buff-red', anim: 'cast' },
    warrior_throw: { self: 'buff-gold', hit: 'slash-red', anim: 'attackCombo' },
    warrior_execute: { hit: 'bleed-red', anim: 'attackHeavy' },
    warrior_hamstring: { hit: 'slash-red', anim: 'attack' },

    mage_fireball: { projectile: 'fire', hit: 'fire-hit', anim: 'cast' },
    mage_nova: { area: 'ice-blue', hit: 'ice-blue', anim: 'cast' },
    mage_blink: { teleport: 'teleport-blue', self: 'teleport-blue', anim: 'cast' },
    mage_lightning: { hit: 'blue-lightning', anim: 'cast' },
    mage_phase: { self: 'teleport-blue', teleport: 'teleport-blue', anim: 'cast' },

    rogue_ambush: { hit: 'slash-red', anim: 'attack' },
    rogue_disarm: { hit: 'slash-blue', anim: 'attackHeavy' },
    rogue_assassinate: { hit: 'shadow-purple', anim: 'attackHeavy' },
    rogue_step: { teleport: 'teleport-purple', self: 'teleport-purple', anim: 'cast' },
    rogue_bloodmix: { self: 'bleed-red', anim: 'cast' },
    rogue_feast: { hit: 'bleed-red', anim: 'attackCombo' },

    priest_heal: { self: 'heal-green', anim: 'cast' },
    priest_pain: { projectile: 'shadow', hit: 'dark-skull', anim: 'cast' },
    priest_smite: { self: 'holy-gold', anim: 'cast' },
    priest_stance: { self: 'holy-gold', anim: 'cast' },
    priest_shield: { self: 'shield-gold', anim: 'cast' },
    priest_sanctuary: { self: 'holy-gold', anim: 'cast' },
    priest_judgement: { projectile: 'holy', hit: 'holy-gold', anim: 'cast' },
    priest_holyfire: { projectile: 'holy', hit: 'holy-gold', anim: 'cast' },
    priest_barrier: { self: 'shield-gold', anim: 'cast' },
    priest_radiance: { self: 'holy-gold', anim: 'cast' },

    shaman_shock: { projectile: 'blue', hit: 'blue-lightning', anim: 'cast' },
    shaman_windfury: { self: 'wind-green', anim: 'cast' },
    shaman_avatar: { self: 'nature-green', anim: 'cast' },
    shaman_earthshield: { self: 'earth-gold', anim: 'cast' },
    shaman_bloodlust: { self: 'buff-red', anim: 'cast' },
    shaman_chain: { area: 'blue-lightning', hit: 'blue-lightning', anim: 'cast' },
    shaman_spiritwalk: { teleport: 'teleport-green', self: 'teleport-green', anim: 'cast' },
    shaman_tide: { self: 'heal-green', anim: 'cast' },
    shaman_earthbind: { projectile: 'nature', hit: 'root-green', anim: 'cast' },
    shaman_thunderstorm: { area: 'blue-lightning', hit: 'blue-lightning', anim: 'cast' },
    shaman_stormstrike: { projectile: 'blue', hit: 'blue-lightning', anim: 'attackHeavy' },
    shaman_ancestral: { self: 'holy-gold', anim: 'cast' },
    shaman_stone_skin: { self: 'earth-gold', anim: 'cast' },

    necro_bomb: { projectile: 'shadow', hit: 'dark-skull', anim: 'cast' },
    necro_skeleton: { self: 'bone-white', anim: 'cast' },
    necro_bonedragon: { self: 'dark-skull', anim: 'cast' },
    necro_burst: { projectile: 'shadow', hit: 'explosion-purple', anim: 'cast' },
    necro_shield: { self: 'bone-white', anim: 'cast' },
    necro_spear: { projectile: 'shadow', hit: 'bone-white', anim: 'cast' },
    necro_gravebind: { projectile: 'shadow', hit: 'root-green', anim: 'cast' },
    necro_legion: { self: 'dark-skull', anim: 'cast' },
    necro_deathcoil: { projectile: 'shadow', hit: 'dark-skull', anim: 'cast' },
    necro_boneprison: { projectile: 'shadow', hit: 'bone-white', anim: 'cast' },
    necro_harvest: { projectile: 'shadow', hit: 'dark-skull', anim: 'cast' },

    lock_corrode: { projectile: 'purple', hit: 'dark-skull', anim: 'cast' },
    lock_soulfire: { projectile: 'fire', hit: 'explosion-purple', anim: 'cast' },
    lock_nightdash: { hit: 'shadow-purple', anim: 'attackHeavy' },
    lock_leech: { projectile: 'shadow', hit: 'dark-skull', self: 'heal-green', anim: 'cast' },
    lock_shadowflame: { area: 'explosion-purple', hit: 'explosion-purple', anim: 'cast' },
    lock_bloodpact: { self: 'buff-red', anim: 'cast' },
    lock_doom: { projectile: 'shadow', hit: 'dark-skull', anim: 'cast' },
    lock_siphon: { projectile: 'shadow', hit: 'dark-skull', self: 'heal-green', anim: 'cast' },
    lock_hellfire: { area: 'explosion-red', hit: 'explosion-red', anim: 'cast' },
    lock_shadowbolt: { projectile: 'shadow', hit: 'shadow-purple', anim: 'cast' },
    lock_demonskin: { self: 'shadow-purple', anim: 'cast' },
    lock_agony: { projectile: 'purple', hit: 'dark-skull', anim: 'cast' },
    lock_metamorphosis: { self: 'explosion-purple', anim: 'cast' },
    lock_life_tap: { self: 'buff-red', anim: 'cast' },

    sword_parry: { self: 'shield-gold', anim: 'cast' },
    sword_read: { projectile: 'blue', hit: 'stun-gold', anim: 'cast' },
    sword_flash: { hit: 'slash-blue', anim: 'attackHeavy' },
    sword_drawdash: { teleport: 'teleport-blue', self: 'teleport-blue', anim: 'cast' },
    sword_finish: { hit: 'slash-red', anim: 'attackCombo' },
    sword_focus: { self: 'buff-gold', anim: 'cast' },
    sword_riposte: { self: 'shield-gold', anim: 'cast' },
    sword_shadowstep: { teleport: 'teleport-purple', self: 'teleport-purple', anim: 'cast' },

    hunter_mark: { projectile: 'arrow', hit: 'stun-gold', anim: 'attack' },
    hunter_aimed: { projectile: 'arrow', hit: 'slash-blue', anim: 'attack' },
    hunter_arcane: { projectile: 'blue', hit: 'slash-blue', anim: 'attack' },
    hunter_disengage: { teleport: 'teleport-green', self: 'teleport-green', anim: 'cast' },
    hunter_snare: { projectile: 'arrow', hit: 'root-green', anim: 'attack' },
    hunter_kill: { projectile: 'arrow', hit: 'bleed-red', anim: 'attack' },
    hunter_trap: { projectile: 'arrow', hit: 'root-green', anim: 'attack' },
    hunter_command: { projectile: 'arrow', hit: 'slash-red', anim: 'attack' },
    hunter_volley: { projectile: 'arrow', hit: 'slash-blue', anim: 'attack' },
    hunter_explosive: { projectile: 'fire', hit: 'explosion-red', anim: 'attack' },
    hunter_tracking: { projectile: 'arrow', hit: 'stun-gold', anim: 'attack' },
    hunter_camouflage: { self: 'wind-green', anim: 'cast' },

    '武僧_strike': { hit: 'stun-gold', anim: 'attack' },
    '黑虎掏心': { hit: 'bleed-red', anim: 'attackHeavy' },
    '降龙十八掌': { hit: 'stun-gold', anim: 'attackCombo' },
    '飞龙在天': { hit: 'stun-gold', anim: 'attackHeavy' },
    '闪电反射': { self: 'blue-lightning', anim: 'cast' }
  };
  const SUMMON_SPRITES = {
    skeleton: {
      frameWidth: 64,
      frameHeight: 64,
      scale: 1.15,
      footOffset: 16,
      animations: {
        idle: { file: 'assets/map/summons/skull/idle.png', frames: 4, duration: 720, loop: true },
        attack: { file: 'assets/map/summons/skull/attack.png', frames: 5, duration: 460 }
      }
    },
    bone_dragon: {
      frameWidth: 128,
      frameHeight: 128,
      scale: 0.78,
      footOffset: 34,
      animations: {
        idle: { file: 'assets/map/summons/gorgon/idle.png', frames: 7, duration: 900, loop: true },
        attack: { file: 'assets/map/summons/gorgon/attack.png', frames: 16, duration: 720 }
      }
    }
  };
  const OBELISK_SPRITE = {
    frameWidth: 200,
    frameHeight: 400,
    scale: 0.28
  };
  const LIGHTNING_FX = {
    frameWidth: 64,
    frameHeight: 64,
    scale: 1.65,
    duration: 560,
    files: LIGHTNING_FRAMES
  };
  const BLUE_LIGHTNING_FX = {
    frameWidth: 64,
    frameHeight: 64,
    scale: 3.3,
    duration: 560,
    files: BLUE_LIGHTNING_FRAMES
  };
  const SPRITE_PROFILES = {
    'knight-blue': {
      frameWidth: 120, frameHeight: 80, scale: 1.22,
      animations: {
        idle: { file: 'assets/sprites/knight-blue/idle.png', frames: 10, duration: 950, loop: true },
        run: { file: 'assets/sprites/knight-blue/run.png', frames: 10, duration: 720, loop: true },
        attack: { file: 'assets/sprites/knight-blue/attack.png', frames: 4, duration: 420 },
        attackHeavy: { file: 'assets/sprites/knight-blue/attack-heavy.png', frames: 6, duration: 560 },
        attackCombo: { file: 'assets/sprites/knight-blue/attack-combo.png', frames: 10, duration: 760 },
        cast: { file: 'assets/sprites/knight-blue/cast.png', frames: 6, duration: 620 },
        hurt: { file: 'assets/sprites/knight-blue/hurt.png', frames: 1, duration: 360 },
        death: { file: 'assets/sprites/knight-blue/death.png', frames: 10, duration: 900 }
      }
    },
    'knight-rose': {
      frameWidth: 120, frameHeight: 80, scale: 1.22,
      animations: {
        idle: { file: 'assets/sprites/knight-rose/idle.png', frames: 10, duration: 950, loop: true },
        run: { file: 'assets/sprites/knight-rose/run.png', frames: 10, duration: 720, loop: true },
        attack: { file: 'assets/sprites/knight-rose/attack.png', frames: 4, duration: 420 },
        attackHeavy: { file: 'assets/sprites/knight-rose/attack-heavy.png', frames: 6, duration: 560 },
        attackCombo: { file: 'assets/sprites/knight-rose/attack-combo.png', frames: 10, duration: 760 },
        cast: { file: 'assets/sprites/knight-rose/cast.png', frames: 6, duration: 620 },
        hurt: { file: 'assets/sprites/knight-rose/hurt.png', frames: 1, duration: 360 },
        death: { file: 'assets/sprites/knight-rose/death.png', frames: 10, duration: 900 }
      }
    },
    warrior: {
      frameWidth: 96, frameHeight: 80, scale: 1.42, footOffset: 8, headOffset: 86,
      animations: {
        idle: { file: 'assets/sprites/warrior/idle.png', frames: 6, duration: 880, loop: true },
        run: { file: 'assets/sprites/warrior/run.png', frames: 8, duration: 620, loop: true },
        attack: { file: 'assets/sprites/warrior/attack.png', frames: 12, duration: 620 },
        attackHeavy: { file: 'assets/sprites/warrior/attack-heavy.png', frames: 10, duration: 660 },
        attackCombo: { file: 'assets/sprites/warrior/attack.png', frames: 12, duration: 720 },
        cast: { file: 'assets/sprites/warrior/attack-heavy.png', frames: 10, duration: 660 },
        hurt: { file: 'assets/sprites/warrior/hurt.png', frames: 4, duration: 320 },
        death: { file: 'assets/sprites/warrior/death.png', frames: 11, duration: 900 }
      }
    },
    samurai: {
      frameWidth: 96, frameHeight: 96, scale: 1.35,
      animations: {
        idle: { file: 'assets/sprites/samurai/idle.png', frames: 10, duration: 950, loop: true },
        run: { file: 'assets/sprites/samurai/run.png', frames: 16, duration: 780, loop: true },
        attack: { file: 'assets/sprites/samurai/attack.png', frames: 7, duration: 560 },
        attackHeavy: { file: 'assets/sprites/samurai/attack.png', frames: 7, duration: 640 },
        attackCombo: { file: 'assets/sprites/samurai/attack.png', frames: 7, duration: 620 },
        cast: { file: 'assets/sprites/samurai/attack.png', frames: 7, duration: 620 },
        hurt: { file: 'assets/sprites/samurai/hurt.png', frames: 4, duration: 360 },
        death: { file: 'assets/sprites/samurai/hurt.png', frames: 4, duration: 800 }
      }
    },
    'midnight-slash': {
      frameWidth: 200, frameHeight: 200, scale: 0.94, footOffset: 64,
      animations: {
        idle: { file: 'assets/sprites/midnight-slash/idle.png', frames: 8, duration: 980, loop: true },
        run: { file: 'assets/sprites/midnight-slash/run.png', frames: 8, duration: 680, loop: true },
        attack: { file: 'assets/sprites/midnight-slash/attack.png', frames: 6, duration: 520 },
        attackHeavy: { file: 'assets/sprites/midnight-slash/attack-heavy.png', frames: 6, duration: 620 },
        attackCombo: { file: 'assets/sprites/midnight-slash/attack-heavy.png', frames: 6, duration: 660 },
        cast: { file: 'assets/sprites/midnight-slash/attack-heavy.png', frames: 6, duration: 620 },
        hurt: { file: 'assets/sprites/midnight-slash/hurt.png', frames: 4, duration: 340 },
        death: { file: 'assets/sprites/midnight-slash/death.png', frames: 6, duration: 860 }
      }
    },
    'severed-fang': {
      frameWidth: 128, frameHeight: 128, scale: 1.18, footOffset: 42,
      animations: {
        idle: { file: 'assets/sprites/severed-fang/idle.png', frames: 6, duration: 950, loop: true },
        run: { file: 'assets/sprites/severed-fang/run.png', frames: 8, duration: 760, loop: true },
        attack: { file: 'assets/sprites/severed-fang/attack.png', frames: 24, duration: 680 },
        attackHeavy: { file: 'assets/sprites/severed-fang/attack.png', frames: 24, duration: 780 },
        attackCombo: { file: 'assets/sprites/severed-fang/attack.png', frames: 24, duration: 820 },
        cast: { file: 'assets/sprites/severed-fang/cast.png', frames: 14, duration: 720 },
        hurt: { file: 'assets/sprites/severed-fang/hurt.png', frames: 4, duration: 360 },
        death: { file: 'assets/sprites/severed-fang/death.png', frames: 7, duration: 860 }
      }
    },
    'evil-wizard': {
      frameWidth: 140, frameHeight: 140, scale: 1.0, footOffset: 52,
      animations: {
        idle: { file: 'assets/sprites/evil-wizard/idle.png', frames: 10, duration: 1050, loop: true },
        run: { file: 'assets/sprites/evil-wizard/run.png', frames: 8, duration: 760, loop: true },
        attack: { file: 'assets/sprites/evil-wizard/attack.png', frames: 13, duration: 720 },
        attackHeavy: { file: 'assets/sprites/evil-wizard/attack.png', frames: 13, duration: 780 },
        attackCombo: { file: 'assets/sprites/evil-wizard/attack.png', frames: 13, duration: 820 },
        cast: { file: 'assets/sprites/evil-wizard/cast.png', frames: 13, duration: 760 },
        hurt: { file: 'assets/sprites/evil-wizard/hurt.png', frames: 3, duration: 360 },
        death: { file: 'assets/sprites/evil-wizard/death.png', frames: 18, duration: 980 }
      }
    },
    'blind-huntress': {
      frameWidth: 120, frameHeight: 128, scale: 1.34, footOffset: 52,
      animations: {
        idle: { file: 'assets/sprites/blind-huntress/idle.png', frames: 24, duration: 1150, loop: true },
        run: { file: 'assets/sprites/blind-huntress/run.png', frames: 16, duration: 760, loop: true },
        attack: { file: 'assets/sprites/blind-huntress/attack.png', frames: 6, duration: 520 },
        attackHeavy: { file: 'assets/sprites/blind-huntress/cast.png', frames: 10, duration: 660 },
        attackCombo: { file: 'assets/sprites/blind-huntress/cast.png', frames: 10, duration: 700 },
        cast: { file: 'assets/sprites/blind-huntress/cast.png', frames: 10, duration: 660 },
        hurt: { file: 'assets/sprites/blind-huntress/hurt.png', frames: 2, duration: 320 },
        death: { file: 'assets/sprites/blind-huntress/death.png', frames: 20, duration: 900 }
      }
    },
    'blind-huntress-warrior': {
      frameWidth: 160, frameHeight: 128, scale: 1.04, footOffset: 22, headOffset: 96,
      animations: {
        idle: { file: 'assets/sprites/blind-huntress-warrior/idle.png', frames: 24, duration: 1150, loop: true },
        run: { file: 'assets/sprites/blind-huntress-warrior/run.png', frames: 16, duration: 760, loop: true },
        attack: { file: 'assets/sprites/blind-huntress-warrior/attack.png', frames: 6, duration: 520 },
        attackHeavy: { file: 'assets/sprites/blind-huntress-warrior/cast.png', frames: 10, duration: 660 },
        attackCombo: { file: 'assets/sprites/blind-huntress-warrior/cast.png', frames: 10, duration: 700 },
        cast: { file: 'assets/sprites/blind-huntress-warrior/cast.png', frames: 10, duration: 660 },
        hurt: { file: 'assets/sprites/blind-huntress-warrior/hurt.png', frames: 2, duration: 320 },
        death: { file: 'assets/sprites/blind-huntress-warrior/death.png', frames: 20, duration: 900 }
      }
    },
    'duskborne-elf': {
      frameWidth: 160, frameHeight: 144, scale: 1.12, footOffset: 48,
      animations: {
        idle: { file: 'assets/sprites/duskborne-elf/idle.png', frames: 6, duration: 1050, loop: true },
        run: { file: 'assets/sprites/duskborne-elf/run.png', frames: 8, duration: 760, loop: true },
        attack: { file: 'assets/sprites/duskborne-elf/attack.png', frames: 7, duration: 560 },
        attackHeavy: { file: 'assets/sprites/duskborne-elf/attack.png', frames: 7, duration: 640 },
        attackCombo: { file: 'assets/sprites/duskborne-elf/attack.png', frames: 7, duration: 660 },
        cast: { file: 'assets/sprites/duskborne-elf/attack.png', frames: 7, duration: 560 },
        hurt: { file: 'assets/sprites/duskborne-elf/hurt.png', frames: 4, duration: 360 },
        death: { file: 'assets/sprites/duskborne-elf/death.png', frames: 8, duration: 860 }
      }
    },
    'huntress-2': {
      frameWidth: 100, frameHeight: 100, scale: 1.72, footOffset: 52,
      animations: {
        idle: { file: 'assets/sprites/huntress-2/idle.png', frames: 10, duration: 950, loop: true },
        run: { file: 'assets/sprites/huntress-2/run.png', frames: 8, duration: 650, loop: true },
        attack: { file: 'assets/sprites/huntress-2/attack.png', frames: 6, duration: 520 },
        attackHeavy: { file: 'assets/sprites/huntress-2/attack.png', frames: 6, duration: 600 },
        attackCombo: { file: 'assets/sprites/huntress-2/attack.png', frames: 6, duration: 640 },
        cast: { file: 'assets/sprites/huntress-2/attack.png', frames: 6, duration: 560 },
        hurt: { file: 'assets/sprites/huntress-2/hurt.png', frames: 3, duration: 320 },
        death: { file: 'assets/sprites/huntress-2/death.png', frames: 10, duration: 860 }
      }
    },
    'duskborne-demonkin': {
      frameWidth: 128, frameHeight: 128, scale: 1.05, footOffset: -5,
      animations: {
        idle: { file: 'assets/sprites/duskborne-demonkin/idle.png', frames: 6, duration: 1000, loop: true },
        run: { file: 'assets/sprites/duskborne-demonkin/run.png', frames: 8, duration: 760, loop: true },
        attack: { file: 'assets/sprites/duskborne-demonkin/attack.png', frames: 12, duration: 620 },
        attackHeavy: { file: 'assets/sprites/duskborne-demonkin/attack.png', frames: 12, duration: 700 },
        attackCombo: { file: 'assets/sprites/duskborne-demonkin/attack.png', frames: 12, duration: 740 },
        cast: { file: 'assets/sprites/duskborne-demonkin/cast.png', frames: 12, duration: 700 },
        hurt: { file: 'assets/sprites/duskborne-demonkin/hurt.png', frames: 4, duration: 360 },
        death: { file: 'assets/sprites/duskborne-demonkin/death.png', frames: 8, duration: 860 }
      }
    },
    'blue-witch': {
      frameWidth: 96, frameHeight: 96, scale: 1.4, footOffset: 40, headOffset: 92,
      animations: {
        idle: { file: 'assets/sprites/blue-witch/idle.png', frames: 6, duration: 980, loop: true },
        run: { file: 'assets/sprites/blue-witch/run.png', frames: 8, duration: 680, loop: true },
        attack: { file: 'assets/sprites/blue-witch/attack.png', frames: 9, duration: 620 },
        attackHeavy: { file: 'assets/sprites/blue-witch/attack.png', frames: 9, duration: 700 },
        attackCombo: { file: 'assets/sprites/blue-witch/attack.png', frames: 9, duration: 740 },
        cast: { file: 'assets/sprites/blue-witch/cast.png', frames: 5, duration: 620 },
        hurt: { file: 'assets/sprites/blue-witch/hurt.png', frames: 3, duration: 320 },
        death: { file: 'assets/sprites/blue-witch/death.png', frames: 10, duration: 900 }
      }
    },
    'battle-maid': {
      frameWidth: 128, frameHeight: 128, scale: 1.16, footOffset: 44,
      animations: {
        idle: { file: 'assets/sprites/battle-maid/idle.png', frames: 12, duration: 1050, loop: true },
        run: { file: 'assets/sprites/battle-maid/run.png', frames: 18, duration: 780, loop: true },
        attack: { file: 'assets/sprites/battle-maid/attack.png', frames: 18, duration: 720 },
        attackHeavy: { file: 'assets/sprites/battle-maid/attack.png', frames: 18, duration: 780 },
        attackCombo: { file: 'assets/sprites/battle-maid/attack.png', frames: 18, duration: 820 },
        cast: { file: 'assets/sprites/battle-maid/cast.png', frames: 18, duration: 740 },
        hurt: { file: 'assets/sprites/battle-maid/hurt.png', frames: 12, duration: 360 },
        death: { file: 'assets/sprites/battle-maid/death.png', frames: 12, duration: 860 }
      }
    },
    'priest-knight': {
      frameWidth: 100, frameHeight: 64, scale: 1.15, footOffset: 12,
      animations: {
        idle: { file: 'assets/sprites/priest-knight/idle.png', frames: 4, duration: 850, loop: true },
        run: { file: 'assets/sprites/priest-knight/run.png', frames: 7, duration: 620, loop: true },
        attack: { file: 'assets/sprites/priest-knight/attack.png', frames: 6, duration: 520 },
        attackHeavy: { file: 'assets/sprites/priest-knight/attack-heavy.png', frames: 7, duration: 620 },
        attackCombo: { file: 'assets/sprites/priest-knight/attack-heavy.png', frames: 7, duration: 660 },
        cast: { file: 'assets/sprites/priest-knight/cast.png', frames: 10, duration: 680 },
        hurt: { file: 'assets/sprites/priest-knight/hurt.png', frames: 4, duration: 320 },
        death: { file: 'assets/sprites/priest-knight/death.png', frames: 5, duration: 820 }
      }
    },
    'fire-warrior': {
      frameWidth: 144, frameHeight: 80, scale: 1.45, footOffset: 28,
      animations: {
        idle: { file: 'assets/sprites/fire-warrior/idle.png', frames: 8, duration: 1050, loop: true },
        run: { file: 'assets/sprites/fire-warrior/run.png', frames: 8, duration: 760, loop: true },
        attack: { file: 'assets/sprites/fire-warrior/attack.png', frames: 4, duration: 560 },
        attackHeavy: { file: 'assets/sprites/fire-warrior/attack-heavy.png', frames: 4, duration: 620 },
        attackCombo: { file: 'assets/sprites/fire-warrior/attack-heavy.png', frames: 4, duration: 660 },
        cast: { file: 'assets/sprites/fire-warrior/cast.png', frames: 9, duration: 760 },
        hurt: { file: 'assets/sprites/fire-warrior/hurt.png', frames: 4, duration: 360 },
        death: { file: 'assets/sprites/fire-warrior/death.png', frames: 11, duration: 900 }
      }
    },
    ninja: {
      frameWidth: 50, frameHeight: 37, scale: 3.15, footOffset: 14,
      animations: {
        idle: { file: 'assets/sprites/ninja/idle.png', frames: 4, duration: 850, loop: true },
        run: { file: 'assets/sprites/ninja/run.png', frames: 6, duration: 560, loop: true },
        attack: { file: 'assets/sprites/ninja/attack.png', frames: 5, duration: 440 },
        attackHeavy: { file: 'assets/sprites/ninja/attack-heavy.png', frames: 6, duration: 520 },
        attackCombo: { file: 'assets/sprites/ninja/attack-heavy.png', frames: 6, duration: 560 },
        cast: { file: 'assets/sprites/ninja/cast.png', frames: 4, duration: 520 },
        hurt: { file: 'assets/sprites/ninja/hurt.png', frames: 3, duration: 320 },
        death: { file: 'assets/sprites/ninja/death.png', frames: 7, duration: 760 }
      }
    },
    'countess-vampire': {
      frameWidth: 128, frameHeight: 128, scale: 1.18, footOffset: 25,
      animations: {
        idle: { file: 'assets/sprites/countess-vampire/idle.png', frames: 5, duration: 950, loop: true },
        run: { file: 'assets/sprites/countess-vampire/run.png', frames: 6, duration: 680, loop: true },
        attack: { file: 'assets/sprites/countess-vampire/attack.png', frames: 6, duration: 560 },
        attackHeavy: { file: 'assets/sprites/countess-vampire/attack-heavy.png', frames: 6, duration: 620 },
        attackCombo: { file: 'assets/sprites/countess-vampire/attack-heavy.png', frames: 6, duration: 660 },
        cast: { file: 'assets/sprites/countess-vampire/cast.png', frames: 4, duration: 560 },
        hurt: { file: 'assets/sprites/countess-vampire/hurt.png', frames: 2, duration: 320 },
        death: { file: 'assets/sprites/countess-vampire/death.png', frames: 8, duration: 860 }
      }
    },
    'gothic-monk': {
      frameWidth: 82, frameHeight: 60, scale: 2.0, footOffset: 16,
      animations: {
        idle: { file: 'assets/sprites/gothic-monk/idle.png', frames: 4, duration: 820, loop: true },
        run: { file: 'assets/sprites/gothic-monk/run.png', frames: 6, duration: 560, loop: true },
        attack: { file: 'assets/sprites/gothic-monk/attack.png', frames: 6, duration: 460 },
        attackHeavy: { file: 'assets/sprites/gothic-monk/attack-heavy.png', frames: 5, duration: 520 },
        attackCombo: { file: 'assets/sprites/gothic-monk/attack-heavy.png', frames: 5, duration: 560 },
        cast: { file: 'assets/sprites/gothic-monk/cast.png', frames: 5, duration: 520 },
        hurt: { file: 'assets/sprites/gothic-monk/hurt.png', frames: 2, duration: 320 },
        death: { file: 'assets/sprites/gothic-monk/death.png', frames: 2, duration: 720 }
      }
    }
  };
  const PROFESSION_SPRITE_PROFILES = {
    warrior: 'warrior',
    mage: 'evil-wizard',
    rogue: 'ninja',
    priest: 'priest-knight',
    shaman: 'fire-warrior',
    necro: 'countess-vampire',
    warlock: 'blue-witch',
    swordsman: 'midnight-slash',
    hunter: 'huntress-2',
    monk: 'gothic-monk',
    '武僧': 'gothic-monk'
  };
  const WEAPON_PRESENTATION = {
    greatsword: { kind: 'greatsword', anim: 'attackHeavy', color: '#e8e4d7', accent: '#b98a44' },
    longbow: { kind: 'bow', anim: 'attack', color: '#b98554', accent: '#e8d28d' },
    dagger: { kind: 'dagger', anim: 'attack', color: '#d9dee6', accent: '#7fd6c3' },
    warhammer: { kind: 'hammer', anim: 'attackHeavy', color: '#c8c4b8', accent: '#8d6a43' },
    wand: { kind: 'wand', anim: 'cast', color: '#8ed1e8', accent: '#e9d46f' },
    twin_blades: { kind: 'dual_blades', anim: 'attackCombo', color: '#d9dee6', accent: '#ffcf6a' },
    totem: { kind: 'totem', anim: 'cast', color: '#a7764f', accent: '#73d6a2' }
  };
  const state = {
    ruleset: null,
    players: [],
    board: [],
    boardMap: new Map(),
    traps: new Map(),
    mapTokens: new Map(),
    mapHazardAnims: new Map(),
    mapHazardTimers: new Map(),
    projectileAnims: [],
    projectileTimers: [],
    summonSeq: 0,
    current: 0,
    pending: null,
    selectedCardIndex: null,
    winner: null,
    dualModeCard: null,
    matchOptions: { ...DEFAULT_MATCH_OPTIONS },
    customArenaBackdropUrl: null,
    customArenaBackdropName: '',
    boardZoom: 0.7,
    boardZoomAuto: true,
    battleLog: [],
    debugLog: [],
  };
  const I18N = () => window.STUDIO_I18N || { t:(k,f)=>f||k, entity:(type,key,fb)=>fb||key, getLang:()=> 'zh' };

  function audioMimeFor(src){
    if(String(src).endsWith('.ogg')) return 'audio/ogg; codecs="vorbis"';
    if(String(src).endsWith('.wav')) return 'audio/wav';
    if(String(src).endsWith('.mp3')) return 'audio/mpeg';
    return '';
  }

  function resolveAudioSource(name){
    if(audioSourceCache[name]) return audioSourceCache[name];
    const raw = AUDIO_ASSETS[name];
    const sources = Array.isArray(raw) ? raw : [raw].filter(Boolean);
    let chosen = sources[0] || '';
    try{
      const probe = document.createElement('audio');
      const playable = sources.find(src => {
        const mime = audioMimeFor(src);
        return !mime || !!probe.canPlayType(mime);
      });
      if(playable) chosen = playable;
    } catch (_) {}
    audioSourceCache[name] = chosen;
    return chosen;
  }

  function playSfx(name, volume = 0.55){
    if(audioState.muted) return;
    const src = resolveAudioSource(name);
    if(!src) return;
    try{
      const a = new Audio(src);
      a.volume = Math.max(0, Math.min(1, volume));
      a.play().catch(() => {});
    } catch (_) {}
  }

  function playAttackSfx(attacker){
    const basic = attacker ? getActiveBasicAttack(attacker) : null;
    const ranged = (basic && Number(basic.range || 1) > 1) || weaponPresentation(attacker || {}).kind === 'bow';
    playSfx(ranged ? 'bowAttack' : 'meleeAttack', ranged ? 0.48 : 0.5);
  }

  function playHitSfx(attacker, spell = false){
    if(spell) return playSfx('spellImpact', 0.55);
    const basic = attacker ? getActiveBasicAttack(attacker) : null;
    const ranged = (basic && Number(basic.range || 1) > 1) || weaponPresentation(attacker || {}).kind === 'bow';
    playSfx(ranged ? 'bowHit' : 'meleeHit', ranged ? 0.46 : 0.52);
  }

  function startBattleAudio(){
    audioState.unlocked = true;
    if(audioState.muted){
      if(audioState.bgm) audioState.bgm.pause();
      return;
    }
    try{
      if(!audioState.bgm){
        audioState.bgm = new Audio(resolveAudioSource('bgm'));
        audioState.bgm.loop = true;
        audioState.bgm.volume = 0.22;
      }
      audioState.bgm.muted = false;
      audioState.bgm.play().catch(() => {});
    } catch (_) {}
  }

  function updateMuteButton(){
    const btn = $('btn-mute');
    if(!btn) return;
    btn.textContent = audioState.muted ? '取消静音' : '静音';
    btn.classList.toggle('active', audioState.muted);
    btn.setAttribute('aria-pressed', audioState.muted ? 'true' : 'false');
  }

  function setAudioMuted(muted){
    audioState.muted = !!muted;
    try{ localStorage.setItem('arena_audio_muted', audioState.muted ? '1' : '0'); } catch (_) {}
    if(audioState.bgm){
      audioState.bgm.muted = audioState.muted;
      if(audioState.muted) audioState.bgm.pause();
      else if(audioState.unlocked) audioState.bgm.play().catch(() => {});
    } else if(!audioState.muted && audioState.unlocked){
      startBattleAudio();
    }
    updateMuteButton();
  }

  function initAudioSettings(){
    try{ audioState.muted = localStorage.getItem('arena_audio_muted') === '1'; } catch (_) {}
    updateMuteButton();
  }

  const R = 9, SIZE = 48, CX = Math.round(SIZE*Math.sqrt(3)*(R+2)), CY = Math.round(SIZE*1.5*(R+2));
  const BOARD_TILT = { yScale: 0.82 };
  const dirs = [{q:1,r:0},{q:1,r:-1},{q:0,r:-1},{q:-1,r:0},{q:-1,r:1},{q:0,r:1}];
  const SPIKE_TILE_KEYS = new Set(['0,-5','5,-5','5,0','0,5','-5,5','-5,0']);
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
    if(SPIKE_TILE_KEYS.has(k)) return 'spike';
    if(k===`-${R},0` || k===`${R},0`) return 'start';
    return 'plain';
  }
  function buildBoard(){
    const out=[]; 
    for(let q=-R;q<=R;q++) for(let r=-R;r<=R;r++){ const s=-q-r; if(Math.max(Math.abs(q),Math.abs(r),Math.abs(s))<=R) out.push({q,r,type:tileType({q,r})}); }
    return out;
  }
  function hexToPixel(c){
    const rawY = CY + SIZE*1.5*c.r;
    return {
      x: CX + SIZE*Math.sqrt(3)*(c.q + c.r/2),
      y: CY + (rawY - CY) * BOARD_TILT.yScale
    };
  }
  function hexPoints(x,y){
    const pts=[]; for(let i=0;i<6;i++){ const a=Math.PI/180*(60*i-30); pts.push(`${x+SIZE*Math.cos(a)},${y+SIZE*BOARD_TILT.yScale*Math.sin(a)}`); } return pts.join(' ');
  }

  function addSvg(parent, tag, attrs = {}){
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([name, value]) => {
      if(value !== null && value !== undefined){
        el.setAttribute(name, value);
        if(name === 'href') el.setAttributeNS(xlinkNS, 'href', value);
      }
    });
    parent.appendChild(el);
    return el;
  }

  function addArenaSpeckles(layer, clipId){
    const colors = ['#8a6b4e', '#40362c', '#6b513d', '#9a7851'];
    for(let i=0;i<96;i++){
      const angle = (i * 137.508) * Math.PI / 180;
      const radius = Math.sqrt(((i * 37) % 101) / 101);
      const x = CX + Math.cos(angle) * radius * 820;
      const y = CY + Math.sin(angle) * radius * 610;
      addSvg(layer, 'ellipse', {
        cx: x.toFixed(1),
        cy: y.toFixed(1),
        rx: 3 + (i % 9),
        ry: 1 + (i % 4),
        fill: colors[i % colors.length],
        opacity: 0.16 + (i % 5) * 0.025,
        transform: `rotate(${(i * 29) % 180} ${x.toFixed(1)} ${y.toFixed(1)})`,
        'clip-path': `url(#${clipId})`
      });
    }
  }

  function addArenaScars(layer, clipId){
    const blood = [
      [-330,-140,78,20,-13], [-120,64,58,16,21], [220,-60,82,18,8], [350,210,70,15,-18],
      [35,-230,52,12,32], [-470,260,64,14,14], [500,-260,54,13,-26]
    ];
    blood.forEach(([dx,dy,rx,ry,rot], idx) => {
      addSvg(layer, 'ellipse', {
        cx: CX + dx, cy: CY + dy, rx, ry, fill: idx % 2 ? '#5b1515' : '#6d1c1b',
        opacity: 0.38, transform: `rotate(${rot} ${CX + dx} ${CY + dy})`, 'clip-path': `url(#${clipId})`
      });
      addSvg(layer, 'ellipse', {
        cx: CX + dx + rx * .24, cy: CY + dy - 3, rx: Math.max(12, rx * .28), ry: Math.max(4, ry * .34),
        fill: '#2c0d0d', opacity: 0.25, transform: `rotate(${rot + 12} ${CX + dx} ${CY + dy})`, 'clip-path': `url(#${clipId})`
      });
    });

    const debris = [
      [-520,-40,42,-8], [-420,190,35,16], [-270,-280,30,28], [-86,285,42,-18], [115,-330,28,8],
      [290,120,48,18], [465,-105,40,-28], [600,260,36,22], [0,0,54,-12], [-600,-250,32,32]
    ];
    debris.forEach(([dx,dy,len,rot], idx) => {
      const x = CX + dx;
      const y = CY + dy;
      addSvg(layer, 'line', {
        x1: x - len / 2, y1: y, x2: x + len / 2, y2: y,
        stroke: idx % 3 ? '#c5b9a0' : '#667073', 'stroke-width': idx % 3 ? 3 : 2,
        opacity: 0.55, transform: `rotate(${rot} ${x} ${y})`, 'clip-path': `url(#${clipId})`
      });
      if(idx % 2 === 0){
        addSvg(layer, 'line', {
          x1: x + len / 2 - 9, y1: y - 5, x2: x + len / 2 + 8, y2: y + 3,
          stroke: '#8c2f2b', 'stroke-width': 3, opacity: 0.45,
          transform: `rotate(${rot} ${x} ${y})`, 'clip-path': `url(#${clipId})`
        });
      }
    });
  }

  function renderArenaBackdrop(svg){
    const layer = addSvg(svg, 'g', { class:'arena-backdrop-layer' });
    addSvg(layer, 'image', {
      href: state.customArenaBackdropUrl || MAP_ASSETS.arenaBackdrop,
      x: 0,
      y: 0,
      width: BOARD_VIEW.width,
      height: BOARD_VIEW.height,
      class: 'arena-image-backdrop',
      preserveAspectRatio: 'xMidYMid slice'
    });
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
  const DICE_BOX_SIDES = new Set([4, 6, 8, 10, 12, 20, 100]);
  function parseDiceBoxNotation(notation){
    const raw = String(notation ?? '').trim().toLowerCase();
    const match = raw.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if(!match) return null;
    const count = Number(match[1] || 0);
    const sides = Number(match[2] || 0);
    const modifier = match[3] ? Number(match[3]) : 0;
    if(!count || !DICE_BOX_SIDES.has(sides)) return null;
    const suffix = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
    return {
      count,
      sides,
      modifier,
      notation: `${count}d${sides}${suffix}`
    };
  }
  function diceBoxDetailFromResults(parsed, results){
    const rolls = (Array.isArray(results) ? results : [])
      .map(entry => Number(entry?.value))
      .filter(Number.isFinite);
    if(!rolls.length) return null;
    return {
      notation: parsed.notation,
      rolls,
      modifier: parsed.modifier,
      total: rolls.reduce((sum, value) => sum + value, 0) + parsed.modifier,
      mode: 'dice',
      engine: 'dice-box'
    };
  }
  function parseDiceBoxChoiceNotation(notation){
    const raw = String(notation ?? '').trim();
    const match = raw.match(/^(\d+)x\(\s*(-?\d+(?:\.\d+)?)\s*\|\s*(-?\d+(?:\.\d+)?)\s*\)$/i);
    if(!match) return null;
    const count = Number(match[1] || 0);
    const first = Number(match[2]);
    const second = Number(match[3]);
    if(!count || !Number.isFinite(first) || !Number.isFinite(second)) return null;
    return {
      count,
      choices: [first, second],
      notation: raw,
      diceNotation: `${count}d4`
    };
  }
  function diceBoxChoiceDetailFromResults(parsed, results){
    const sourceRolls = (Array.isArray(results) ? results : [])
      .map(entry => Number(entry?.value))
      .filter(Number.isFinite);
    if(!sourceRolls.length) return null;
    const rolls = sourceRolls.map(value => value <= 2 ? parsed.choices[0] : parsed.choices[1]);
    return {
      notation: parsed.notation,
      rolls,
      modifier: 0,
      total: rolls.reduce((sum, value) => sum + value, 0),
      mode: 'repeat_choice',
      choices: parsed.choices.slice(),
      sourceRolls,
      engine: 'dice-box'
    };
  }
  async function playDiceBoxRoll(title, parsed){
    const bridge = window.DICE_BOX_BRIDGE;
    if(!bridge || typeof bridge.roll !== 'function'){
      pushDebug('dicebox.bridge.missing', {
        title,
        notation: parsed.notation
      });
      return null;
    }
    try {
      const results = await bridge.roll(parsed.notation, { title });
      return diceBoxDetailFromResults(parsed, results);
    } catch (error) {
      pushDebug('dicebox.roll.failed', {
        title,
        notation: parsed.notation,
        bridgeError: bridge?.lastError || null,
        error: error?.stack || error?.message || String(error)
      });
      return null;
    }
  }
  async function playDiceBoxChoiceRoll(title, parsed){
    const bridge = window.DICE_BOX_BRIDGE;
    if(!bridge || typeof bridge.roll !== 'function'){
      pushDebug('dicebox.bridge.missing', {
        title,
        notation: parsed.notation,
        diceNotation: parsed.diceNotation
      });
      return null;
    }
    try {
      const results = await bridge.roll(parsed.diceNotation, { title });
      return diceBoxChoiceDetailFromResults(parsed, results);
    } catch (error) {
      pushDebug('dicebox.roll.choice_failed', {
        title,
        notation: parsed.notation,
        diceNotation: parsed.diceNotation,
        bridgeError: bridge?.lastError || null,
        error: error?.stack || error?.message || String(error)
      });
      return null;
    }
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
  function waitMs(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  function formatRollVisualValue(value){
    if(typeof value !== 'number' || !Number.isFinite(value)) return String(value ?? 0);
    if(Number.isInteger(value)) return String(value);
    return String(value).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
  }
  function diceSidesFromDetail(detail){
    const match = String(detail?.notation || '').toLowerCase().match(/^\d+d(\d+)/);
    return match ? Math.max(2, Number(match[1] || 6)) : 6;
  }
  function diceVisualKind(detail){
    if(detail?.mode === 'repeat_choice' && Array.isArray(detail.choices) && detail.choices.length === 2) return 'coin';
    if(detail?.mode === 'dice') return 'die';
    return 'counter';
  }
  function dieModelKeyFromSides(sides){
    const n = Math.max(4, Number(sides || 6));
    if(n <= 4) return 'd4';
    if(n <= 6) return 'd6';
    if(n <= 8) return 'd8';
    if(n <= 10) return 'd10';
    if(n <= 12) return 'd12';
    return 'd20';
  }
  function diceVisualEntries(detail){
    const kind = diceVisualKind(detail);
    const maxTokens = 18;
    const values = Array.isArray(detail?.rolls) && detail.rolls.length ? detail.rolls.slice(0, maxTokens) : [detail?.total || 0];
    const sides = diceSidesFromDetail(detail);
    const choicePool = Array.isArray(detail?.choices) && detail.choices.length ? detail.choices.map(formatRollVisualValue) : [];
    return values.map(value => {
      const finalText = formatRollVisualValue(value);
      if(kind === 'coin'){
        return {
          kind,
          finalText,
          randomPool: choicePool.length ? choicePool : ['0', '1'],
        };
      }
      if(kind === 'die'){
        return {
          kind,
          finalText,
          modelType: dieModelKeyFromSides(sides),
          randomPool: Array.from({ length: sides }, (_, idx) => String(idx + 1)),
        };
      }
      return {
        kind,
        finalText,
        modelType: 'counter',
        randomPool: [finalText],
      };
    });
  }
  function diceSummaryText(detail){
    if(detail?.mode === 'dice'){
      const rolls = (detail.rolls || []).map(formatRollVisualValue).join(' + ');
      if(detail.modifier){
        const mod = detail.modifier > 0 ? ` + ${detail.modifier}` : ` - ${Math.abs(detail.modifier)}`;
        return `${rolls}${mod}`;
      }
      return rolls;
    }
    if(detail?.mode === 'repeat_choice'){
      const counts = new Map();
      for(const value of detail.rolls || []){
        const label = formatRollVisualValue(value);
        counts.set(label, (counts.get(label) || 0) + 1);
      }
      return Array.from(counts.entries()).map(([label, count]) => `${count} x ${label}`).join(' / ');
    }
    if(detail?.mode === 'repeat_fixed' && detail.rolls?.length){
      return `${detail.rolls.length} x ${formatRollVisualValue(detail.rolls[0])}`;
    }
    return formatRollDetail(detail);
  }
  function createDiceFace(faceName, text){
    const face = document.createElement('div');
    face.className = `dice-face ${faceName}`;
    face.dataset.face = faceName;
    face.textContent = text;
    return face;
  }
  function randomPoolValue(pool, fallback){
    return pool[Math.floor(Math.random() * pool.length)] ?? fallback;
  }
  function updateRollingFaces(item){
    const pool = item.entry.randomPool?.length ? item.entry.randomPool : [item.entry.finalText];
    item.surfaces.forEach(face => {
      face.textContent = randomPoolValue(pool, item.entry.finalText);
    });
  }
  function settleDiceFaces(item){
    const pool = item.entry.randomPool?.length ? item.entry.randomPool : [item.entry.finalText];
    if(item.entry.kind === 'coin'){
      const [frontLabel, backLabel] = pool;
      if(item.surfaces[0]) item.surfaces[0].textContent = String(frontLabel ?? item.entry.finalText);
      if(item.surfaces[1]) item.surfaces[1].textContent = String(backLabel ?? item.entry.finalText);
      return;
    }
    item.surfaces.forEach(face => { face.textContent = item.entry.finalText; });
  }
  function createSvgNode(tag, attrs = {}){
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function polyline(points){
    return points.map(([x, y]) => `${x},${y}`).join(' ');
  }
  function appendPoly(svg, points, cls){
    svg.appendChild(createSvgNode('polygon', { points: polyline(points), class: `die-facet ${cls}` }));
  }
  function buildFacetSvg(modelType){
    const svg = createSvgNode('svg', { viewBox: '0 0 100 100', class: 'die-shape-svg' });
    if(modelType === 'd4'){
      appendPoly(svg, [[50, 8], [18, 54], [50, 40]], 'facet-a');
      appendPoly(svg, [[50, 8], [50, 40], [82, 54]], 'facet-b');
      appendPoly(svg, [[18, 54], [50, 92], [50, 40]], 'facet-c');
      appendPoly(svg, [[82, 54], [50, 92], [50, 40]], 'facet-d');
      return svg;
    }
    if(modelType === 'd6'){
      appendPoly(svg, [[28, 22], [50, 8], [72, 22], [50, 36]], 'facet-a');
      appendPoly(svg, [[28, 22], [50, 36], [50, 76], [28, 62]], 'facet-b');
      appendPoly(svg, [[72, 22], [50, 36], [50, 76], [72, 62]], 'facet-c');
      appendPoly(svg, [[28, 62], [50, 76], [72, 62], [50, 48]], 'facet-d');
      return svg;
    }
    if(modelType === 'd8'){
      appendPoly(svg, [[50, 8], [24, 38], [50, 52]], 'facet-a');
      appendPoly(svg, [[50, 8], [50, 52], [76, 38]], 'facet-b');
      appendPoly(svg, [[24, 38], [50, 52], [50, 92]], 'facet-c');
      appendPoly(svg, [[76, 38], [50, 52], [50, 92]], 'facet-d');
      return svg;
    }
    if(modelType === 'd10'){
      appendPoly(svg, [[50, 6], [26, 24], [36, 48], [50, 60]], 'facet-a');
      appendPoly(svg, [[50, 6], [50, 60], [64, 48], [74, 24]], 'facet-b');
      appendPoly(svg, [[26, 24], [14, 56], [36, 88], [50, 60]], 'facet-c');
      appendPoly(svg, [[74, 24], [50, 60], [64, 88], [86, 56]], 'facet-d');
      return svg;
    }
    if(modelType === 'd12'){
      appendPoly(svg, [[50, 8], [30, 18], [24, 40], [50, 52], [76, 40], [70, 18]], 'facet-a');
      appendPoly(svg, [[24, 40], [14, 62], [34, 88], [50, 72], [50, 52]], 'facet-b');
      appendPoly(svg, [[76, 40], [50, 52], [50, 72], [66, 88], [86, 62]], 'facet-c');
      appendPoly(svg, [[34, 88], [50, 72], [66, 88], [50, 96]], 'facet-d');
      return svg;
    }
    appendPoly(svg, [[50, 4], [30, 22], [46, 36]], 'facet-a');
    appendPoly(svg, [[50, 4], [46, 36], [54, 36], [70, 22]], 'facet-b');
    appendPoly(svg, [[30, 22], [18, 46], [38, 58], [46, 36]], 'facet-c');
    appendPoly(svg, [[70, 22], [54, 36], [62, 58], [82, 46]], 'facet-d');
    appendPoly(svg, [[38, 58], [50, 92], [62, 58], [54, 36], [46, 36]], 'facet-e');
    return svg;
  }
  function buildPolyDieModel(entry){
    const model = document.createElement('div');
    const modelType = entry.modelType || 'd6';
    model.className = `dice-token-model shape-model ${modelType}`;
    model.appendChild(buildFacetSvg(modelType));
    const label = document.createElement('div');
    label.className = 'dice-label main';
    label.textContent = entry.finalText;
    model.appendChild(label);
    return { model, surfaces: [label] };
  }
  function buildCounterModel(entry){
    const model = document.createElement('div');
    model.className = 'dice-token-model shape-model counter';
    model.appendChild(buildFacetSvg('d6'));
    const label = document.createElement('div');
    label.className = 'dice-label main';
    label.textContent = entry.finalText;
    model.appendChild(label);
    return { model, surfaces: [label] };
  }
  function createDiceToken(entry){
    const token = document.createElement('div');
    token.className = `dice-token ${entry.kind}`;
    const shadow = document.createElement('div');
    shadow.className = 'dice-token-shadow';
    token.appendChild(shadow);
    let model;
    let surfaces = [];
    if(entry.kind === 'coin'){
      const front = createDiceFace('front', String(entry.randomPool?.[0] ?? entry.finalText));
      const back = createDiceFace('back', String(entry.randomPool?.[1] ?? entry.finalText));
      const edge = document.createElement('div');
      edge.className = 'dice-edge';
      model = document.createElement('div');
      model.className = 'dice-token-model coin-model';
      model.append(front, back, edge);
      surfaces.push(front, back);
    } else if(entry.kind === 'counter'){
      const built = buildCounterModel(entry);
      model = built.model;
      surfaces = built.surfaces;
    } else {
      const built = buildPolyDieModel(entry);
      model = built.model;
      surfaces = built.surfaces;
    }
    token.appendChild(model);
    return { token, shadow, model, surfaces, entry };
  }
  function randomBetween(min, max){
    return min + Math.random() * (max - min);
  }
  function getDiceArenaRect(){
    const wrap = $('board-wrap');
    if(wrap && wrap.offsetParent !== null){
      const rect = wrap.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    const width = Math.min(window.innerWidth - 24, 720);
    const height = Math.min(window.innerHeight - 24, 420);
    return {
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - height) / 2,
      width,
      height,
    };
  }
  function syncDiceArenaBounds(){
    const box = document.querySelector('#dice-overlay .dice-box');
    if(!box) return null;
    const rect = getDiceArenaRect();
    box.style.left = `${Math.round(rect.left)}px`;
    box.style.top = `${Math.round(rect.top)}px`;
    box.style.width = `${Math.round(rect.width)}px`;
    box.style.height = `${Math.round(rect.height)}px`;
    return rect;
  }
  function buildDiceStates(tokens, arenaRect){
    const edgePadding = Math.max(12, Math.min(24, Math.min(arenaRect.width, arenaRect.height) * 0.024));
    const bounds = {
      offsetX: edgePadding,
      offsetY: edgePadding,
      width: Math.max(180, arenaRect.width - edgePadding * 2),
      height: Math.max(180, arenaRect.height - edgePadding * 2),
    };
    const totalCount = Math.max(1, tokens.length);
    const cols = Math.min(totalCount, Math.max(2, Math.ceil(Math.sqrt(totalCount))));
    return {
      bounds,
      states: tokens.map((item, index) => {
        const crowdScale = totalCount >= 14 ? 0.68 : totalCount >= 10 ? 0.8 : totalCount >= 6 ? 0.9 : 1;
        const baseSize = item.entry.kind === 'die'
          ? ({ d4: 66, d6: 74, d8: 74, d10: 76, d12: 78, d20: 82 }[item.entry.modelType] || 74)
          : item.entry.kind === 'coin' ? 58 : 66;
        const minSize = item.entry.kind === 'coin' ? 28 : 34;
        const size = Math.max(minSize, Math.round(baseSize * crowdScale));
        const row = Math.floor(index / cols);
        const col = index % cols;
        const launchBias = index - (totalCount - 1) / 2;
        const startX = bounds.width * 0.5 - size * 0.5 + (col - (cols - 1) / 2) * size * 0.54;
        const startY = Math.max(8, bounds.height * 0.08 + row * size * 0.22);
        const spinBase = item.entry.kind === 'coin' ? 860 : item.entry.kind === 'counter' ? 540 : 680;
        item.token.style.width = `${size}px`;
        item.token.style.height = `${size}px`;
        return {
          item,
          size,
          radius: size * 0.42,
          x: startX,
          y: startY,
          vx: randomBetween(-260, 260) + launchBias * 28,
          vy: randomBetween(-660, -430) - row * 22,
          rx: randomBetween(0, 360),
          ry: randomBetween(0, 360),
          rz: randomBetween(0, 360),
          rvx: randomBetween(spinBase * 0.62, spinBase * 1.06) * (Math.random() < 0.5 ? -1 : 1),
          rvy: randomBetween(spinBase * 0.7, spinBase * 1.14) * (Math.random() < 0.5 ? -1 : 1),
          rvz: randomBetween(spinBase * 0.24, spinBase * 0.7) * (Math.random() < 0.5 ? -1 : 1),
          floorDrag: item.entry.kind === 'coin' ? 0.92 : 0.88,
          bounce: item.entry.kind === 'coin' ? 0.44 : item.entry.kind === 'counter' ? 0.5 : 0.56,
        };
      }),
    };
  }
  function keepStateInBounds(state, bounds){
    const maxX = Math.max(0, bounds.width - state.size);
    const maxY = Math.max(0, bounds.height - state.size);
    if(state.x < 0){
      state.x = 0;
      state.vx = Math.abs(state.vx) * 0.78;
      state.ry += 26;
    } else if(state.x > maxX){
      state.x = maxX;
      state.vx = -Math.abs(state.vx) * 0.78;
      state.ry -= 26;
    }
    if(state.y < 0){
      state.y = 0;
      state.vy = Math.abs(state.vy) * 0.72;
      state.rx += 18;
    } else if(state.y > maxY){
      state.y = maxY;
      state.vy = Math.abs(state.vy) < 46 ? 0 : -Math.abs(state.vy) * state.bounce;
      state.vx *= state.floorDrag;
      state.rx *= 0.84;
      state.ry *= 0.84;
      state.rz *= 0.9;
    }
  }
  function resolveDiceCollisions(states){
    for(let i = 0; i < states.length; i++){
      const a = states[i];
      for(let j = i + 1; j < states.length; j++){
        const b = states[j];
        const ax = a.x + a.size / 2;
        const ay = a.y + a.size / 2;
        const bx = b.x + b.size / 2;
        const by = b.y + b.size / 2;
        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDist = a.radius + b.radius;
        if(dist >= minDist) continue;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;
        const relVx = b.vx - a.vx;
        const relVy = b.vy - a.vy;
        const alongNormal = relVx * nx + relVy * ny;
        if(alongNormal >= 0) continue;
        const impulse = -(1 + 0.62) * alongNormal / 2;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
        a.rz -= impulse * 0.12;
        b.rz += impulse * 0.12;
      }
    }
  }
  function renderDiceState(state, bounds){
    const lift = Math.max(0, Math.min(22, Math.abs(state.vy) * 0.026));
    const tokenX = bounds.offsetX + state.x;
    const tokenY = bounds.offsetY + state.y;
    state.item.token.style.transform = `translate3d(${tokenX}px, ${tokenY}px, 0)`;
    state.item.model.style.transform = `translateZ(${lift}px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) rotateZ(${state.rz}deg)`;
    const shadowScale = 0.58 + (1 - Math.min(1, lift / 22)) * 0.46;
    state.item.shadow.style.transform = `translateY(${Math.round(state.size * 0.76)}px) scale(${shadowScale.toFixed(2)})`;
    state.item.shadow.style.opacity = (0.18 + shadowScale * 0.28).toFixed(2);
  }
  function finalTokenTransform(state){
    if(state.item.entry.kind === 'coin'){
      const frontLabel = formatRollVisualValue(state.item.entry.randomPool?.[0]);
      const coinTurn = frontLabel === state.item.entry.finalText ? 0 : 180;
      return `rotateX(72deg) rotateY(${coinTurn}deg) rotateZ(${Math.round(randomBetween(-6, 6))}deg)`;
    }
    if(state.item.entry.kind === 'counter'){
      return `rotateX(-10deg) rotateY(18deg) rotateZ(${Math.round(randomBetween(-4, 4))}deg)`;
    }
    const modelType = state.item.entry.modelType || 'd6';
    if(modelType === 'd4') return `rotateX(58deg) rotateY(-18deg) rotateZ(${Math.round(randomBetween(-8, 8))}deg)`;
    if(modelType === 'd8') return `rotateX(2deg) rotateY(46deg) rotateZ(${Math.round(randomBetween(-8, 8))}deg)`;
    if(modelType === 'd10') return `rotateX(-8deg) rotateY(34deg) rotateZ(${Math.round(randomBetween(-10, 10))}deg)`;
    if(modelType === 'd12') return `rotateX(-14deg) rotateY(28deg) rotateZ(${Math.round(randomBetween(-8, 8))}deg)`;
    if(modelType === 'd20') return `rotateX(-6deg) rotateY(34deg) rotateZ(${Math.round(randomBetween(-10, 10))}deg)`;
    return `rotateX(-18deg) rotateY(24deg) rotateZ(${Math.round(randomBetween(-8, 8))}deg)`;
  }
  async function playRollAnimation(detail){
    const overlay = $('dice-overlay');
    const stageWrap = $('dice-stage');
    const stage = $('dice-token-stage') || stageWrap;
    const summary = $('dice-summary');
    const value = $('dice-value');
    if(!overlay || !stage || !summary || !value){
      if(value) value.textContent = formatRollVisualValue(detail.total);
      return;
    }

    const visualKind = diceVisualKind(detail);
    const arenaRect = syncDiceArenaBounds() || getDiceArenaRect();
    const entries = diceVisualEntries(detail);
    const tokens = entries.map(createDiceToken);
    stage.innerHTML = '';
    if(stageWrap){
      stageWrap.classList.remove('is-dice-box');
      stageWrap.classList.add('is-custom');
    }
    stage.classList.toggle('is-crowded', entries.length > 10);
    const frag = document.createDocumentFragment();
    tokens.forEach(item => frag.appendChild(item.token));
    stage.appendChild(frag);
    summary.classList.add('hidden');
    summary.textContent = '';
    value.textContent = formatRollVisualValue(detail.total);
    value.classList.remove('is-visible');

    await new Promise(resolve => {
      const simulation = buildDiceStates(tokens, arenaRect);
      const { bounds, states } = simulation;
      const gravity = visualKind === 'coin' ? 1180 : 1320;
      const duration = visualKind === 'coin'
        ? Math.min(2600, 1280 + states.length * 44)
        : Math.min(2200, 1120 + states.length * 36);
      let lastFrame = performance.now();
      const startTime = lastFrame;
      let nextFaceShuffle = 0;

      function frame(now){
        const dt = Math.min(0.03, Math.max(0.012, (now - lastFrame) / 1000 || 0.016));
        const elapsed = now - startTime;
        lastFrame = now;

        if(elapsed >= nextFaceShuffle){
          states.forEach(state => {
            if(state.item.entry.kind === 'counter') return;
            updateRollingFaces(state.item);
          });
          nextFaceShuffle = elapsed + (visualKind === 'coin' ? 62 : 76);
        }

        const settleBlend = elapsed > duration * 0.7 ? (elapsed - duration * 0.7) / (duration * 0.3) : 0;
        states.forEach(state => {
          state.vy += gravity * dt;
          state.x += state.vx * dt;
          state.y += state.vy * dt;
          state.rx += state.rvx * dt;
          state.ry += state.rvy * dt;
          state.rz += state.rvz * dt;
          if(settleBlend > 0){
            state.vx *= 0.985;
            state.vy *= 0.985;
            state.rvx *= 0.972;
            state.rvy *= 0.972;
            state.rz *= 0.98;
          }
          keepStateInBounds(state, bounds);
        });
        resolveDiceCollisions(states);
        states.forEach(state => {
          keepStateInBounds(state, bounds);
          renderDiceState(state, bounds);
        });

        const stillMoving = states.some(state =>
          Math.abs(state.vx) > 18 ||
          Math.abs(state.vy) > 18 ||
          Math.abs(state.rvx) > 42 ||
          Math.abs(state.rvy) > 42
        );
        if(elapsed < duration || stillMoving){
          requestAnimationFrame(frame);
          return;
        }

        states.forEach(state => {
          settleDiceFaces(state.item);
          state.item.model.style.transition = 'transform 260ms cubic-bezier(.2,.85,.18,1)';
          state.item.token.style.transition = 'transform 260ms cubic-bezier(.2,.85,.18,1)';
          state.item.model.style.transform = finalTokenTransform(state);
        });
        summary.textContent = diceSummaryText(detail);
        if(summary.textContent) summary.classList.remove('hidden');
        value.textContent = formatRollVisualValue(detail.total);
        requestAnimationFrame(() => value.classList.add('is-visible'));
        setTimeout(resolve, visualKind === 'coin' ? 620 : 520);
      }

      requestAnimationFrame(frame);
    });
  }
  async function showDice(title, notation) {
    const overlay = $('dice-overlay');
    const val = $('dice-value');
    const note = $('dice-notation');
    const tit = $('dice-title');
    const summary = $('dice-summary');
    const stageWrap = $('dice-stage');
    const tokenStage = $('dice-token-stage');
    if(!overlay || !val || !note || !tit) return rollDetail(notation).total;
    tit.textContent = title;
    note.textContent = notation || '';
    overlay.classList.remove('hidden');
    syncDiceArenaBounds();
    if(stageWrap) stageWrap.classList.remove('is-custom', 'is-dice-box');
    if(tokenStage){
      tokenStage.innerHTML = '';
      tokenStage.classList.remove('is-crowded');
    }
    if(summary){
      summary.textContent = '';
      summary.classList.add('hidden');
    }
    val.textContent = '0';
    val.classList.remove('is-visible');
    if(window.DICE_BOX_BRIDGE?.hide) window.DICE_BOX_BRIDGE.hide();

    let detail = null;
    const parsed = parseDiceBoxNotation(notation);
    const parsedChoice = parsed ? null : parseDiceBoxChoiceNotation(notation);
    if(parsed || parsedChoice){
      if(stageWrap) stageWrap.classList.add('is-dice-box');
      detail = parsed
        ? await playDiceBoxRoll(title, parsed)
        : await playDiceBoxChoiceRoll(title, parsedChoice);
      if(detail){
        if(summary){
          summary.textContent = diceSummaryText(detail);
          if(summary.textContent) summary.classList.remove('hidden');
        }
        val.textContent = formatRollVisualValue(detail.total);
        requestAnimationFrame(() => val.classList.add('is-visible'));
        await waitMs(320);
      } else if(stageWrap){
        stageWrap.classList.remove('is-dice-box');
      }
    }
    if(!detail){
      detail = rollDetail(notation);
      await playRollAnimation(detail);
      val.textContent = formatRollVisualValue(detail.total);
      await waitMs(180);
    }
    overlay.classList.add('hidden');
    if(window.DICE_BOX_BRIDGE?.hide) window.DICE_BOX_BRIDGE.hide();
    if(stageWrap){
      stageWrap.classList.remove('is-custom', 'is-dice-box');
    }
    if(tokenStage){
      tokenStage.classList.remove('is-crowded');
      tokenStage.innerHTML = '';
    }
    if(summary){
      summary.textContent = '';
      summary.classList.add('hidden');
    }
    val.classList.remove('is-visible');
    log(`🎲 ${title}：${formatRollDetail(detail)}`);
    return detail.total;
  }
  function setMode(text){ $('mode-indicator').textContent = `当前模式：${text}`; }
  function setHint(text){ $('selection-hint').textContent = text; }
  function current(){ return state.players[state.current]; }
  function enemyOf(p){ return state.players.find(x=>x.id!==p.id && x.alive); }
  function getPlayerAt(c){ return state.players.find(p=>p.alive && p.pos.q===c.q && p.pos.r===c.r) || null; }

  function clampInt(value, fallback, min = 0, max = 99){
    const n = Number(value);
    if(!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.floor(n)));
  }

  function isNoAccessory(accessoryKey){
    return !accessoryKey || accessoryKey === NO_ACCESSORY;
  }

  function isBlackHoleEnabled(){
    return state.matchOptions?.blackHoleEnabled !== false;
  }

  function countCardsFromArray(arr){
    const out = {};
    (arr || []).forEach(cardKey => {
      out[cardKey] = (out[cardKey] || 0) + 1;
    });
    return out;
  }

  function deckCountsFor(kind, entity){
    if(!entity) return {};
    if(kind === 'profession'){
      return entity.deckCounts || Object.fromEntries(Object.keys(entity.cards || {}).map(cardKey => [cardKey, 1]));
    }
    return entity.deckCounts || countCardsFromArray(entity.cards || []);
  }

  function cardDefForDeck(kind, entity, cardKey, data){
    if(kind === 'profession') return entity?.cards?.[cardKey] || data?.cardLibrary?.[cardKey] || { name: cardKey };
    return data?.cardLibrary?.[cardKey] || { name: cardKey };
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }

  function setupRulesetData(){
    const id = $('ruleset-select')?.value || STUDIO_RUNTIME.getActiveRulesetId();
    return STUDIO_RUNTIME.findRuleset(id)?.data || {};
  }

  function readMatchOptions(){
    const defaults = state.ruleset?.data?.ruleDefaults || {};
    const openingFallback = clampInt(defaults.drawOpening ?? DEFAULT_MATCH_OPTIONS.drawOpening, DEFAULT_MATCH_OPTIONS.drawOpening);
    const perTurnFallback = clampInt(defaults.drawPerTurn ?? DEFAULT_MATCH_OPTIONS.drawPerTurn, DEFAULT_MATCH_OPTIONS.drawPerTurn);
    return {
      blackHoleEnabled: $('black-hole-enabled')?.value !== 'false',
      drawOpening: clampInt($('draw-opening')?.value, openingFallback),
      drawPerTurn: clampInt($('draw-per-turn')?.value, perTurnFallback),
    };
  }


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
    const accessory = isNoAccessory(accessoryKey) ? null : ruleset.data.accessoryLibrary[accessoryKey];
    const deck = [];

    function pushFromCounts(counts, origin) {
      Object.entries(counts || {}).forEach(([cardKey, count]) => {
        const n = Number(count || 0);
        for (let i = 0; i < n; i += 1) deck.push({ cardKey, origin });
      });
    }

    pushFromCounts(
      deckCountsFor('profession', profession),
      '职业技能'
    );
    pushFromCounts(
      deckCountsFor('weapon', weapon),
      '武器技能'
    );
    if(accessory){
      pushFromCounts(
        deckCountsFor('accessory', accessory),
        '饰品技能'
      );
    }

    return shuffle(deck);
  }

  function buildPlayer(slot, professionKey, weaponKey, accessoryKey, type, startPos) {
    const ruleset = state.ruleset;
    const profession = ruleset.data.professions[professionKey];
    const weapon = ruleset.data.weaponLibrary[weaponKey];
    const accessory = isNoAccessory(accessoryKey) ? null : ruleset.data.accessoryLibrary[accessoryKey];
    return {
      id: slot, type, label: `玩家 ${slot}`, color: slot===1 ? '#65a9ff' : '#ff8aa8',
      professionKey, weaponKey, accessoryKey: accessory ? accessoryKey : NO_ACCESSORY, profession, weapon, accessory,
      maxHp: profession.hp, hp: profession.hp, moveBase: profession.move, pos: deep(startPos),
      deck: buildDeckFor({ ruleset, professionKey, weaponKey, accessoryKey }),
      discard: [], hand: [], alive: true, block: 0,
      statuses: { burn:0, slow:0, disarm:0, sheep:0, stun:0, root:0, dot:null, dots:[] },
      buffs: { nextBasicFlat:0, nextBasicDie:null, spellImmune:false, extraBasicCap:0, extraClassCardUses:0, swordBonusStored:false, dodgeNextDamage:0, counterDamage:'', counterUseTakenDamage:false, counterCharges:0, reactiveMoveTrigger:'', reactiveMoveMaxDistance:0, reactiveMoveCharges:0, healOnDamaged:'', healOnDamagedCharges:0, disarmAttackerOnHit:0, disarmAttackerCharges:0 },
      turn: { move:false, classOrGuardianUsed:false, weaponOrAccessoryUsed:false, basicSpent:0, blockUsed:false, movedDistance:0, autoBlockTriggered:false },
      counters: { heal_count:0 },
      negativeQueue: [],
      summons: { skeleton:0, bone_dragon:0 },
      summonUnits: [],
      anim: 'idle',
      animTimer: null,
      facing: slot===1 ? 1 : -1,
      moveAnim: null,
      moveAnimTimer: null,
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

  function spikeSourceForDangerTile(tile){
    const t = state.boardMap.get(key(tile));
    if(t?.type === 'spike') return tile;
    return neighbors(tile).find(c => state.boardMap.get(key(c))?.type === 'spike') || null;
  }

  function triggerObeliskLightning(tile){
    const source = spikeSourceForDangerTile(tile);
    if(!source) return;
    const k = key(source);
    const oldTimers = state.mapHazardTimers.get(k);
    if(oldTimers){
      clearInterval(oldTimers.interval);
      clearTimeout(oldTimers.timeout);
    }
    state.mapHazardAnims.set(k, { name: 'lightning', startedAt: performance.now(), target: deep(tile) });
    if(state.board?.length && $('board')) renderBoard();
    const interval = setInterval(() => {
      if(state.mapHazardAnims.get(k)?.name === 'lightning' && state.board?.length && $('board')) renderBoard();
    }, 45);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      state.mapHazardAnims.delete(k);
      state.mapHazardTimers.delete(k);
      if(state.board?.length && $('board')) renderBoard();
    }, LIGHTNING_FX.duration);
    state.mapHazardTimers.set(k, { interval, timeout });
  }

  function triggerArrowProjectile(fromTile, toTile){
    if(!fromTile || !toTile) return;
    const id = `arrow-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const fx = { id, name: 'arrow', from: deep(fromTile), to: deep(toTile), startedAt: performance.now(), duration: 360 };
    state.projectileAnims = (state.projectileAnims || []).filter(x => performance.now() - x.startedAt < x.duration + 80);
    state.projectileAnims.push(fx);
    if(state.board?.length && $('board')) renderBoard();
    const interval = setInterval(() => {
      if(state.board?.length && $('board')) renderBoard();
    }, 32);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      state.projectileAnims = (state.projectileAnims || []).filter(x => x.id !== id);
      state.projectileTimers = (state.projectileTimers || []).filter(t => t.id !== id);
      if(state.board?.length && $('board')) renderBoard();
    }, fx.duration + 70);
    state.projectileTimers = state.projectileTimers || [];
    state.projectileTimers.push({ id, interval, timeout });
  }

  function triggerTimedTileEffect(name, tile, duration, extra = {}){
    if(!tile) return;
    const id = `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const fx = Object.assign({ id, name, startedAt: performance.now(), target: deep(tile), duration }, extra);
    state.mapHazardAnims.set(id, fx);
    if(state.board?.length && $('board')) renderBoard();
    const interval = setInterval(() => {
      if(state.mapHazardAnims.has(id) && state.board?.length && $('board')) renderBoard();
    }, 40);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      state.mapHazardAnims.delete(id);
      state.mapHazardTimers.delete(id);
      if(state.board?.length && $('board')) renderBoard();
    }, duration + 80);
    state.mapHazardTimers.set(id, { interval, timeout });
  }

  function triggerBlueLightning(tile){
    triggerTimedTileEffect('blue_lightning', tile, BLUE_LIGHTNING_FX.duration);
  }

  function triggerFireImpact(tile){
    triggerTimedTileEffect('fire_hit', tile, FIRE_HIT_FX.duration);
  }

  function triggerFireProjectile(fromTile, toTile){
    if(!fromTile || !toTile) return;
    const id = `fire-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const fx = { id, name: 'fire_projectile', from: deep(fromTile), to: deep(toTile), startedAt: performance.now(), duration: FIRE_PROJECTILE_FX.duration };
    state.projectileAnims = (state.projectileAnims || []).filter(x => performance.now() - x.startedAt < x.duration + 80);
    state.projectileAnims.push(fx);
    if(state.board?.length && $('board')) renderBoard();
    const interval = setInterval(() => {
      if(state.board?.length && $('board')) renderBoard();
    }, 32);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      state.projectileAnims = (state.projectileAnims || []).filter(x => x.id !== id);
      state.projectileTimers = (state.projectileTimers || []).filter(t => t.id !== id);
      if(state.board?.length && $('board')) renderBoard();
    }, fx.duration + 70);
    state.projectileTimers = state.projectileTimers || [];
    state.projectileTimers.push({ id, interval, timeout });
  }

  function triggerSkillTileFx(name, tile){
    if(!name || !tile) return;
    if(name === 'blue-lightning'){
      triggerBlueLightning(tile);
      return;
    }
    const cfg = SKILL_TILE_FX[name];
    if(!cfg) return;
    triggerTimedTileEffect('skill_tile_fx', tile, cfg.duration, { fx: name });
  }

  function triggerSkillProjectileFx(name, fromTile, toTile, impactName){
    if(!name || !fromTile || !toTile) {
      if(impactName) triggerSkillTileFx(impactName, toTile);
      return;
    }
    if(name === 'arrow'){
      triggerArrowProjectile(fromTile, toTile);
      if(impactName) setTimeout(() => triggerSkillTileFx(impactName, toTile), 260);
      return;
    }
    if(name === 'fire'){
      triggerFireProjectile(fromTile, toTile);
      if(impactName) setTimeout(() => triggerSkillTileFx(impactName, toTile), Math.max(160, FIRE_PROJECTILE_FX.duration - 80));
      return;
    }
    const cfg = SKILL_PROJECTILE_FX[name];
    if(!cfg){
      if(impactName) triggerSkillTileFx(impactName, toTile);
      return;
    }
    const id = `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const fx = { id, name: 'skill_projectile', fx: name, from: deep(fromTile), to: deep(toTile), startedAt: performance.now(), duration: cfg.duration };
    state.projectileAnims = (state.projectileAnims || []).filter(x => performance.now() - x.startedAt < x.duration + 80);
    state.projectileAnims.push(fx);
    if(state.board?.length && $('board')) renderBoard();
    const interval = setInterval(() => {
      if(state.board?.length && $('board')) renderBoard();
    }, 32);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      state.projectileAnims = (state.projectileAnims || []).filter(x => x.id !== id);
      state.projectileTimers = (state.projectileTimers || []).filter(t => t.id !== id);
      if(state.board?.length && $('board')) renderBoard();
    }, fx.duration + 70);
    state.projectileTimers = state.projectileTimers || [];
    state.projectileTimers.push({ id, interval, timeout });
    if(impactName) setTimeout(() => triggerSkillTileFx(impactName, toTile), Math.max(120, cfg.duration - 70));
  }

  function profDefaultFx(profKey){
    const map = {
      warrior: { hit: 'slash-red', self: 'buff-red' },
      mage: { projectile: 'blue', hit: 'blue-lightning', self: 'teleport-blue' },
      rogue: { hit: 'slash-red', self: 'buff-red', teleport: 'teleport-purple' },
      priest: { projectile: 'holy', hit: 'holy-gold', self: 'heal-green' },
      shaman: { projectile: 'nature', hit: 'blue-lightning', self: 'nature-green', teleport: 'teleport-green' },
      necro: { projectile: 'shadow', hit: 'dark-skull', self: 'bone-white' },
      warlock: { projectile: 'shadow', hit: 'shadow-purple', self: 'buff-red', teleport: 'teleport-purple' },
      swordsman: { hit: 'slash-blue', self: 'buff-gold', teleport: 'teleport-blue' },
      hunter: { projectile: 'arrow', hit: 'slash-blue', self: 'wind-green', teleport: 'teleport-green' },
      monk: { hit: 'stun-gold', self: 'buff-gold' },
      '武僧': { hit: 'stun-gold', self: 'buff-gold' }
    };
    return map[profKey] || { hit: 'slash-red', self: 'buff-gold' };
  }

  function controlFxFromCard(cardDef){
    const cfg = cardDef?.config || {};
    const ctl = cfg.applyConfig?.controlType || cfg.apply?.controlType || '';
    const template = cfg.applyTemplate || '';
    if(ctl === 'root' || template === 'slow_status') return template === 'slow_status' ? 'ice-blue' : 'root-green';
    if(ctl === 'slow') return 'ice-blue';
    if(ctl === 'stun') return 'stun-gold';
    if(ctl === 'disarm') return 'slash-blue';
    if(ctl === 'sheep') return 'holy-gold';
    return '';
  }

  function visualProfileForCard(cardKey, cardDef, caster){
    const exact = CARD_FX_PROFILES[cardKey] || CARD_FX_PROFILES[cardDef?.name];
    if(exact) return exact;
    const cfg = cardDef?.config || {};
    const template = cardDef?.template || '';
    const defaults = profDefaultFx(caster?.professionKey);
    const ctlFx = controlFxFromCard(cardDef);
    if(template === 'teleport') return { teleport: defaults.teleport || 'teleport-blue', self: defaults.teleport || 'teleport-blue', anim: 'cast' };
    if(template === 'self_buff' || template === 'grant_multiple_buffs' || template === 'transform_basic_attack' || template === 'summon_token_into_self_deck' || template === 'pay_life_draw_cards'){
      return { self: defaults.self || 'buff-gold', anim: 'cast' };
    }
    if(template === 'create_map_token') return { area: 'teleport-purple', anim: 'cast' };
    if(template === 'mark_target_for_bonus') return { projectile: defaults.projectile, hit: 'stun-gold', anim: 'cast' };
    if(template === 'aoe') return { area: ctlFx || defaults.hit || 'explosion-red', hit: ctlFx || defaults.hit || 'explosion-red', anim: 'cast' };
    if(cfg.applyTemplate === 'dot_damage_over_time'){
      if(caster?.professionKey === 'necro' || caster?.professionKey === 'warlock') return { projectile: defaults.projectile, hit: 'dark-skull', anim: 'cast' };
      if(caster?.professionKey === 'mage') return { projectile: 'fire', hit: 'fire-hit', anim: 'cast' };
      return { projectile: defaults.projectile, hit: 'bleed-red', anim: 'attack' };
    }
    if(ctlFx) return { projectile: defaults.projectile, hit: ctlFx, anim: cfg.spell ? 'cast' : 'attack' };
    const range = Number(cfg.range || cfg.baseRange || 1);
    if(cfg.spell || range > 1) return { projectile: defaults.projectile, hit: defaults.hit || 'slash-blue', anim: cfg.spell ? 'cast' : 'attack' };
    return { hit: defaults.hit || 'slash-red', anim: 'attack' };
  }

  function triggerVisualProfile(profile, caster, targetTile){
    if(!profile || !targetTile) return;
    const hit = profile.hit || profile.area;
    if(profile.self && caster?.pos) setTimeout(() => triggerSkillTileFx(profile.self, caster.pos), 120);
    if(profile.projectile && caster?.pos){
      triggerSkillProjectileFx(profile.projectile, caster.pos, targetTile, hit);
      return;
    }
    if(hit) triggerSkillTileFx(hit, targetTile);
  }

  function triggerCardVisual(cardKey, cardDef, caster, target){
    const tile = target?.pos || target;
    if(!tile || !caster?.pos) return;
    const profile = visualProfileForCard(cardKey, cardDef, caster);
    triggerVisualProfile(profile, caster, tile);
  }

  function triggerSelfCardVisual(cardKey, cardDef, caster){
    if(!caster?.pos) return;
    const profile = visualProfileForCard(cardKey, cardDef, caster);
    const fxName = profile?.self || profile?.hit || profDefaultFx(caster.professionKey).self;
    triggerSkillTileFx(fxName, caster.pos);
  }

  function triggerTeleportCardVisual(cardKey, cardDef, caster, fromTile, toTile){
    const profile = visualProfileForCard(cardKey, cardDef, caster);
    const fxName = profile?.teleport || profile?.self || profDefaultFx(caster?.professionKey).teleport || 'teleport-blue';
    triggerSkillTileFx(fxName, fromTile);
    triggerSkillTileFx(fxName, toTile);
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
    else if (ctl === 'stun') player.statuses.stun = Math.max(player.statuses.stun || 0, dur);
    else if (ctl === 'root') player.statuses.root = Math.max(player.statuses.root || 0, dur);
  }

  function isControlled(player){
    return !!(player?.statuses?.slow || player?.statuses?.disarm || player?.statuses?.sheep || player?.statuses?.stun || player?.statuses?.root);
  }

  function effectDuration(cfg, fallback = 1){
    return Math.max(1, Number(cfg?.durationTurns ?? cfg?.controlDuration ?? fallback));
  }

  function applyDotEffect(target, cfg = {}, sourceName = 'DOT'){
    if(!target?.statuses) return;
    const dot = {
      damagePerTick: cfg.damagePerTick || cfg.statusValue || cfg.damage || '1d4',
      tickTiming: cfg.tickTiming || 'turn_start',
      durationTurns: effectDuration(cfg, 1),
      stackRule: cfg.stackRule || 'refresh_duration',
      sourceName
    };
    if(dot.stackRule === 'stack'){
      target.statuses.dots = target.statuses.dots || [];
      target.statuses.dots.push(dot);
    } else {
      target.statuses.dot = dot;
    }
    log(`${target.label} 获得 ${sourceName}：每回合 ${dot.damagePerTick}，持续 ${dot.durationTurns} 回合。`);
  }

  function applyControlStatus(target, controlType, duration, sourceName = '控制'){
    if(!target?.statuses || !controlType) return;
    const dur = Math.max(1, Number(duration || 1));
    if(controlType === 'slow') target.statuses.slow = Math.max(target.statuses.slow || 0, dur);
    else if(controlType === 'disarm') target.statuses.disarm = Math.max(target.statuses.disarm || 0, dur);
    else if(controlType === 'sheep') target.statuses.sheep = Math.max(target.statuses.sheep || 0, dur);
    else if(controlType === 'burn') target.statuses.burn = Math.max(target.statuses.burn || 0, dur);
    else if(controlType === 'stun') target.statuses.stun = Math.max(target.statuses.stun || 0, dur);
    else if(controlType === 'root') target.statuses.root = Math.max(target.statuses.root || 0, dur);
    log(`${target.label} 受到 ${sourceName}：${controlType} ${dur} 回合。`);
  }

  function applyStatusConfig(target, cfg = {}, sourceName = '效果'){
    if(cfg.slow) applyControlStatus(target, 'slow', cfg.slow, sourceName);
    if(cfg.disarm) applyControlStatus(target, 'disarm', cfg.disarm, sourceName);
    if(cfg.sheep) applyControlStatus(target, 'sheep', cfg.sheep, sourceName);
    if(cfg.stun) applyControlStatus(target, 'stun', cfg.stun, sourceName);
    if(cfg.root) applyControlStatus(target, 'root', cfg.root, sourceName);
    if(cfg.burn) target.statuses.burn = Math.max(target.statuses.burn || 0, Number(cfg.burn || 1));
    if(cfg.controlType) applyControlStatus(target, cfg.controlType, cfg.controlDuration || cfg.durationTurns || 1, sourceName);
  }

  function applyTemplateEffect(target, template, cfg = {}, sourceName = '效果'){
    if(!template || template === 'none') return;
    if(template === 'dot_damage_over_time'){
      applyDotEffect(target, cfg, sourceName);
      return;
    }
    if(template === 'slow_status'){
      applyControlStatus(target, 'slow', cfg.durationTurns || cfg.controlDuration || 1, sourceName);
      return;
    }
    if(template === 'control_status'){
      applyControlStatus(target, cfg.controlType || 'stun', cfg.controlDuration || cfg.durationTurns || 1, sourceName);
    }
  }

  function applySourceOnHitEffects(attacker, target, source, sourceName, opts = {}){
    if(!target || !source) return;
    applyStatusConfig(target, source.apply || {}, sourceName);
    applyTemplateEffect(target, source.applyTemplate, source.applyConfig || {}, sourceName);
    const passive = attacker?.profession?.passives?.shaman_passive;
    const sourceHasOwnDot = source.applyTemplate === 'dot_damage_over_time';
    if(opts.includeBasicPassive && !sourceHasOwnDot && attacker?.professionKey === 'shaman' && passive?.template === 'weapon_basic_inflicts_status'){
      const cfg = passive.config || {};
      if((cfg.statusType || 'burn') === 'burn'){
        applyDotEffect(target, {
          damagePerTick: cfg.statusValue || '1d4',
          durationTurns: cfg.durationTurns || 1,
          stackRule: 'refresh_duration'
        }, passive.name || '萨满点燃');
      } else {
        applyControlStatus(target, cfg.statusType, cfg.durationTurns || 1, passive.name || '萨满被动');
      }
    }
  }

  function processDotEffects(player){
    const active = [];
    if(player.statuses.dot) active.push(player.statuses.dot);
    if(Array.isArray(player.statuses.dots)) active.push(...player.statuses.dots);
    if(!active.length) return;
    const remaining = [];
    active.forEach((cfg, index) => {
      const dmg = loggedRoll(`${player.label} ${cfg.sourceName || 'DOT'}`, cfg.damagePerTick || '1');
      takePureDamage(player, dmg);
      log(`${player.label} 受到 ${cfg.sourceName || 'DOT'} ${dmg} 伤害。`);
      cfg.durationTurns = Number(cfg.durationTurns || 1) - 1;
      if(cfg.durationTurns > 0) remaining.push(cfg);
    });
    player.statuses.dot = null;
    player.statuses.dots = remaining;
  }

  function summonSpriteFor(type){
    return SUMMON_SPRITES[type] || SUMMON_SPRITES.skeleton;
  }

  function randomSummonIndicatorTile(player){
    const used = new Set();
    state.players.forEach(p => (p.summonUnits || []).forEach(unit => used.add(key(unit.pos))));
    const candidates = state.board.filter(t => {
      const kk = key(t);
      return t.type !== 'center' && !used.has(kk) && !getPlayerAt(t) && !isBlockedTile(t);
    });
    return candidates.length ? deep(candidates[Math.floor(Math.random() * candidates.length)]) : deep(player.pos);
  }

  function addSummonIndicators(player, type, count){
    player.summonUnits = player.summonUnits || [];
    for(let i=0; i<Math.max(0, Number(count || 0)); i++){
      player.summonUnits.push({
        id: `${player.id}-${type}-${++state.summonSeq}`,
        ownerId: player.id,
        type,
        pos: randomSummonIndicatorTile(player),
        anim: 'idle',
        animUntil: 0
      });
    }
  }

  function clearSummonIndicators(player, types){
    const set = new Set(types);
    player.summonUnits = (player.summonUnits || []).filter(unit => !set.has(unit.type));
  }

  function triggerSummonAttack(player, type){
    const now = performance.now();
    (player.summonUnits || []).filter(unit => unit.type === type).forEach(unit => {
      unit.anim = 'attack';
      unit.animUntil = now + (summonSpriteFor(type).animations.attack.duration || 500);
    });
    playSfx(type === 'bone_dragon' ? 'spellImpact' : 'meleeAttack', type === 'bone_dragon' ? 0.5 : 0.42);
    if(state.board?.length && $('board')) renderBoard();
    const duration = summonSpriteFor(type).animations.attack.duration || 500;
    setTimeout(() => {
      (player.summonUnits || []).filter(unit => unit.type === type).forEach(unit => {
        if(unit.animUntil <= performance.now()){
          unit.anim = 'idle';
          unit.animUntil = 0;
        }
      });
      if(state.board?.length && $('board')) renderBoard();
    }, duration + 50);
  }

  function insertNegativeCardsToDeck(targetPlayer, insertCardKey, insertCount){
    const cnt = Number(insertCount || 1);
    if (!insertCardKey || cnt <= 0) return;
    for(let i=0;i<cnt;i++){
      targetPlayer.deck.splice(Math.floor(Math.random()*(targetPlayer.deck.length+1)),0,{cardKey:insertCardKey, origin:'负面牌'});
    }
    log(`${targetPlayer.label} 的牌库被加入了 ${cnt} 张负面牌。`);
  }

  function triggerMapTokenOnEnter(player, pos = player.pos){
    const tilePos = pos || player.pos;
    const tok = getMapToken(tilePos);
    if (!tok || tok.ownerId === player.id) return;
    if (tok.kind === 'trap_once_negative'){
      playSfx('trap', 0.5);
      if (tok.damage) {
        const dmg = loggedRoll(`${player.label} ${tok.name || '陷阱'}伤害`, resolvePlayerNotation(player, tok.damage));
        takePureDamage(player, dmg);
        log(`${player.label} 触发 ${tok.name || '陷阱'}，受到 ${dmg} 伤害。`);
      }
      if (tok.insertCardKey) insertNegativeCardsToDeck(player, tok.insertCardKey, tok.insertCount || 1);
      applyTokenControl(player, tok);
      state.mapTokens.delete(key(tilePos));
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
          triggerArrowProjectile(tok.pos, target.pos);
          playSfx('bowAttack', 0.45);
          if (tok.damage){
            const dmg = loggedRoll(`${tok.name || '炮塔'} 攻击`, resolvePlayerNotation(player, tok.damage));
            const finalDamage = Math.max(0, dmg - target.block);
            target.hp -= finalDamage;
            target.block = Math.max(0, target.block - dmg);
            if (dmg > 0) playSfx('bowHit', 0.45);
            if (finalDamage > 0){
              if (target.hp <= 0) finalizePlayerState(target);
              else playUnitAnim(target, 'hurt', 460);
            }
            log(`${tok.name || '炮塔'} 命中 ${target.label}，原始伤害 ${dmg}，目标当前生命 ${target.hp}，格挡 ${target.block}。`);
          }
          if (tok.insertCardKey) insertNegativeCardsToDeck(target, tok.insertCardKey, tok.insertCount || 1);
          applyTokenControl(target, tok);
          if (target.hp <= 0){ finalizePlayerState(target); state.winner = player.id; }
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

  function weaponPresentation(player){
    return WEAPON_PRESENTATION[player?.weaponKey] || { kind: 'sword', anim: 'attack', color: '#d9dee6', accent: '#e1c45b' };
  }

  function weaponAttackAnim(player){
    return weaponPresentation(player).anim || 'attack';
  }

  function basicProjectileFor(player){
    const presentation = weaponPresentation(player);
    const basic = getActiveBasicAttack(player);
    if(presentation.kind === 'wand') return 'fire';
    if(presentation.kind === 'bow' || Number(basic?.range || 1) > 1) return 'arrow';
    return '';
  }

  function triggerBasicAttackVisual(player, target){
    const projectile = basicProjectileFor(player);
    if(!projectile || !player?.pos || !target?.pos) return;
    triggerSkillProjectileFx(projectile, player.pos, target.pos);
  }

  function hasSpriteAnim(player, anim){
    const profile = spriteProfileFor(player);
    return !!(profile && profile.animations && profile.animations[anim]);
  }

  function castOrRangedAnim(player){
    if(hasSpriteAnim(player, 'cast')) return 'cast';
    if(hasSpriteAnim(player, 'ranged')) return 'ranged';
    return 'attack';
  }

  function isWeaponOrigin(origin){
    const raw = String(origin || '');
    return raw.includes('武器') || raw.includes('姝﹀櫒');
  }

  function cardActionAnim(player, handItem, cardDef){
    const visual = visualProfileForCard(handItem?.cardKey, cardDef, player);
    if(visual?.anim && hasSpriteAnim(player, visual.anim)) return visual.anim;
    if(['self_buff','grant_multiple_buffs','transform_basic_attack','summon_token_into_self_deck','teleport','create_map_token'].includes(cardDef?.template)) return castOrRangedAnim(player);
    if(cardDef?.config?.spell && Number(cardDef?.config?.range || 1) > 1) return castOrRangedAnim(player);
    if(isWeaponOrigin(handItem?.origin)) return weaponAttackAnim(player);
    const range = Number(cardDef?.config?.range || cardDef?.config?.baseRange || 1);
    if(range > 1 || cardDef?.template === 'aoe') return castOrRangedAnim(player);
    return 'attack';
  }

  function spriteProfileKeyFor(player){
    if (PROFESSION_SPRITE_PROFILES[player?.professionKey]) return PROFESSION_SPRITE_PROFILES[player.professionKey];
    return player?.id === 2 ? 'knight-rose' : 'knight-blue';
  }

  function spriteProfileFor(player){
    return SPRITE_PROFILES[spriteProfileKeyFor(player)] || null;
  }

  function spriteAnimFor(player, anim){
    const profile = spriteProfileFor(player);
    if (!profile) return null;
    const keyName = (anim === 'attackHeavy' || anim === 'attackCombo') ? anim : (anim || 'idle');
    return profile.animations[keyName] || profile.animations.attack || profile.animations.idle || null;
  }

  function spriteAnimDuration(player, anim, fallback = 520){
    return Number(spriteAnimFor(player, anim)?.duration || fallback);
  }

  function vectorAnimName(anim){
    if (anim === 'attackHeavy' || anim === 'attackCombo') return 'attack';
    return anim || 'idle';
  }


  function resolvePlayerNotation(player, notation){
    if (notation === null || notation === undefined) return notation;
    const raw = String(notation).trim();
    if (!raw.includes('weapon_damage')) return notation;
    const base = player?.weapon?.basic?.damage || '0';
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

function canPathThroughTile(tile, player){
  if(!tile || !state.boardMap.has(key(tile)) || isBlockedTile(tile)) return false;
  const occ = getPlayerAt(tile);
  return !occ || occ.id === player?.id;
}

function shortestMovementPath(from, to, player){
  if(!from || !to) return [];
  const startKey = key(from);
  const goalKey = key(to);
  if(startKey === goalKey) return [];
  const queue = [deep(from)];
  const prev = new Map([[startKey, null]]);
  while(queue.length){
    const cur = queue.shift();
    if(key(cur) === goalKey) break;
    for(const next of neighbors(cur)){
      const kk = key(next);
      if(prev.has(kk)) continue;
      if(kk !== goalKey && !canPathThroughTile(next, player)) continue;
      if(kk === goalKey && !canPathThroughTile(next, player)) continue;
      prev.set(kk, cur);
      queue.push(next);
    }
  }
  if(!prev.has(goalKey)) return [deep(to)];
  const path = [];
  let cur = deep(to);
  while(cur && key(cur) !== startKey){
    path.unshift(deep(cur));
    cur = prev.get(key(cur));
  }
  return path;
}

function resolveMovementTouchEffects(player, from, to, includeDestination = false){
  const path = shortestMovementPath(from, to, player);
  const limit = includeDestination ? path.length : Math.max(0, path.length - 1);
  const seen = new Set();
  for(let i = 0; i < limit; i += 1){
    const tile = path[i];
    const kk = key(tile);
    if(seen.has(kk)) continue;
    seen.add(kk);
    enterTile(player, tile);
    if(!player.alive){
      player.pos = deep(tile);
      break;
    }
  }
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
  movePlayerTo(player, dst, { duration: 260, triggerDestinationEffects: true });
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
    if(player.alive) playUnitAnim(player, 'death', 900);
    player.alive = false;
    const living = state.players.filter(x => x.alive);
    if (living.length === 1) state.winner = living[0].id;
  }
}

function setFacingToward(player, tile, fromTile = player?.pos){
  if(!player || !tile || !fromTile) return;
  const fromPoint = hexToPixel(fromTile);
  const toPoint = hexToPixel(tile);
  const dx = toPoint.x - fromPoint.x;
  if(Math.abs(dx) > 1) player.facing = dx >= 0 ? 1 : -1;
}

function clearUnitMoveAnim(player){
  if(!player) return;
  if(player.moveAnimTimer?.interval) clearInterval(player.moveAnimTimer.interval);
  if(player.moveAnimTimer?.timeout) clearTimeout(player.moveAnimTimer.timeout);
  player.moveAnimTimer = null;
  player.moveAnim = null;
}

function easeInOut(t){
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function renderPointForPlayer(player){
  const motion = player?.moveAnim;
  if(!motion) return hexToPixel(player.pos);
  const elapsed = Math.max(0, performance.now() - motion.startedAt);
  const t = Math.min(1, elapsed / Math.max(1, motion.duration || 1));
  const eased = easeInOut(t);
  const from = hexToPixel(motion.from);
  const to = hexToPixel(motion.to);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased
  };
}

function movePlayerTo(player, tile, opts = {}){
  if(!player || !tile) return Promise.resolve(false);
  const from = deep(player.pos);
  const to = deep(tile);
  if(key(from) === key(to)) return Promise.resolve(false);
  setFacingToward(player, to, from);
  clearUnitMoveAnim(player);
  if(opts.instant){
    player.pos = to;
    if(state.board?.length && $('board')) renderBoard();
    return Promise.resolve(true);
  }
  const distance = Math.max(1, dist(from, to));
  const duration = Number(opts.duration || Math.min(620, Math.max(260, 170 * distance)));
  if(player.animTimer){
    clearTimeout(player.animTimer);
    player.animTimer = null;
  }
  player.anim = opts.anim || 'run';
  const motion = { from, to, startedAt: performance.now(), duration };
  player.moveAnim = motion;
  player.pos = to;
  if(state.board?.length && $('board')) renderBoard();
  return new Promise(resolve => {
    const finish = () => {
      if(player.moveAnim === motion) player.moveAnim = null;
      if(player.anim === 'run') player.anim = 'idle';
      if(player.moveAnimTimer?.interval === interval) clearInterval(interval);
      if(player.moveAnimTimer?.timeout === timeout) clearTimeout(timeout);
      if(player.moveAnimTimer?.interval === interval) player.moveAnimTimer = null;
      if(opts.triggerPathEffects !== false) resolveMovementTouchEffects(player, from, to, !!opts.triggerDestinationEffects);
      if(state.board?.length && $('board')) renderBoard();
      resolve(true);
    };
    const interval = setInterval(() => {
      if(player.moveAnim === motion && state.board?.length && $('board')) renderBoard();
    }, 32);
    const timeout = setTimeout(finish, duration + 34);
    player.moveAnimTimer = { interval, timeout };
  });
}

function playUnitAnim(player, anim, duration){
  if(!player) return;
  if(player.animTimer) clearTimeout(player.animTimer);
  player.anim = anim || 'idle';
  const animDuration = Number(duration || spriteAnimDuration(player, player.anim, 520));
  if(player.anim === 'cast') playSfx('cast', 0.42);
  if(state.board?.length && $('board')) renderBoard();
  player.animTimer = setTimeout(() => {
    player.anim = 'idle';
    player.animTimer = null;
    if(state.board?.length && $('board')) renderBoard();
  }, animDuration);
}

function applyRewardListSync(player, rewards, labelPrefix){
  for (const reward of (rewards || [])) {
    if (!reward || !reward.type) continue;
    if (reward.type === 'gain_block' || reward.type === 'block') {
      const v = typeof reward.value === 'string' && reward.value.includes('d') ? rollOrValue(`${labelPrefix} 格挡`, reward.value) : Number(reward.value || 0);
      player.block += v;
      log(`${player.label} 获得 ${v} 格挡。`);
    } else if (reward.type === 'heal') {
      const v = typeof reward.value === 'string' && reward.value.includes('d') ? rollOrValue(`${labelPrefix} 治疗`, reward.value) : Number(reward.value || 0);
      player.hp = Math.min(player.maxHp, player.hp + v);
      log(`${player.label} 恢复 ${v} 生命。`);
    } else if (reward.type === 'draw') {
      drawCards(player, Number(reward.value || 1));
    } else if (reward.type === 'buff_basic' || reward.type === 'buffBasic') {
      const v = Number(reward.value || 0);
      player.buffs.nextBasicFlat = (player.buffs.nextBasicFlat || 0) + v;
      log(`${player.label} 的下次普攻 +${v}。`);
    }
  }
}

function applyDamageTakenTriggeredPassives(player, finalDamage, sourceName){
  if(!player || finalDamage <= 0) return;
  for(const passive of getProfessionPassives(player)){
    if(!passive || passive.template !== 'threshold_reward_once_per_turn') continue;
    const passiveKey = passive.key || passive.name || passive.template;
    if(passive.config?.oncePerTurn && player.turn?.passiveOnceTriggered?.[passiveKey]) continue;
    const thresholdType = passive.config?.thresholdType || passive.config?.checkType || '';
    const normalizedType = ({
      damage_taken: 'damage_taken',
      taken_damage: 'damage_taken',
      received_damage: 'damage_taken',
      '受到伤害': 'damage_taken'
    })[String(thresholdType)] || String(thresholdType);
    if(normalizedType !== 'damage_taken') continue;
    const thresholdValue = Number(
      passive.config?.thresholdValue ??
      passive.config?.threshold ??
      passive.config?.damageThreshold ??
      0
    );
    if(finalDamage >= thresholdValue){
      applyRewardListSync(player, passive.config?.rewardList || [], passive.name || sourceName || '受伤被动');
      if(passive.config?.oncePerTurn){
        player.turn.passiveOnceTriggered = player.turn.passiveOnceTriggered || {};
        player.turn.passiveOnceTriggered[passiveKey] = true;
      }
      log(`${player.label} 的被动 ${passive.name || passiveKey} 因受到 ${finalDamage} 伤害触发。`);
    }
  }
}

function applyHealOnDamaged(player, finalDamage){
  if(!player || finalDamage <= 0) return;
  if (!((player.buffs?.healOnDamagedCharges || 0) > 0 && player.buffs?.healOnDamaged)) return;
  player.buffs.healOnDamagedCharges = Math.max(0, Number(player.buffs.healOnDamagedCharges || 0) - 1);
  const heal = rollOrValue(`${player.label} 受伤后自疗`, player.buffs.healOnDamaged);
  if (heal > 0) {
    player.hp = Math.min(player.maxHp, player.hp + heal);
    log(`${player.label} 受伤后立即恢复 ${heal} 生命。`);
  }
}

function takePureDamage(player, rawDamage){
  const damage = Math.max(0, Number(rawDamage || 0));
  if(!player || !player.alive || damage <= 0) return 0;
  playSfx('meleeHit', 0.36);
  player.hp -= damage;
  applyDamageTakenTriggeredPassives(player, damage, '受伤');
  applyHealOnDamaged(player, damage);
  if(player.hp <= 0) finalizePlayerState(player);
  else playUnitAnim(player, 'hurt', 460);
  return damage;
}

function dealDamage(attacker, target, rawDamage, meta){
  const info = meta || {};
  const sourceName = info.sourceName || '伤害';
  const allowReactions = info.allowReactions !== false;
  let damage = Math.max(0, Number(rawDamage || 0));
  if (!target || !target.alive) return { rawDamage: damage, blocked: 0, finalDamage: 0, dodged: false };
  let attackAnim = null;
  if(attacker && attacker !== target){
    setFacingToward(attacker, target.pos);
    attackAnim = info.anim || weaponAttackAnim(attacker);
    playUnitAnim(attacker, attackAnim);
    if(attackAnim !== 'cast') playAttackSfx(attacker);
  }

  if (damage > 0 && (target.buffs?.dodgeNextDamage || 0) > 0) {
    target.buffs.dodgeNextDamage = Math.max(0, Number(target.buffs.dodgeNextDamage || 0) - 1);
    log(`${target.label} 的闪避生效，完全闪避了 ${sourceName}。`);
    return { rawDamage: damage, blocked: 0, finalDamage: 0, dodged: true };
  }

  const blocked = Math.min(Number(target.block || 0), damage);
  const finalDamage = Math.max(0, damage - blocked);
  target.block = Math.max(0, Number(target.block || 0) - damage);
  target.hp -= finalDamage;
  if(damage > 0) playHitSfx(attacker, attackAnim === 'cast' || info.spell === true);

  let healOnDamagedApplied = false;
  if (allowReactions && finalDamage > 0) {
    applyDamageTakenTriggeredPassives(target, finalDamage, sourceName);
    applyHealOnDamaged(target, finalDamage);
    healOnDamagedApplied = true;

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
  if(!healOnDamagedApplied) applyHealOnDamaged(target, finalDamage);

  if(finalDamage > 0) playUnitAnim(target, target.hp <= 0 ? 'death' : 'hurt', target.hp <= 0 ? 900 : 460);

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
        if(normalizedType !== 'dealt_damage') continue;
        const passed = rawDamage >= thresholdValue;
        pushDebug('threshold_reward_once_per_turn.check', { player: player.label, passiveKey, thresholdType: normalizedType, rawDamage, thresholdValue, passed, config: passive.config || {} });
        log(`${player.label} 检查被动 ${passive.name || passiveKey}：类型 ${normalizedType}，本次伤害 ${rawDamage}，阈值 ${thresholdValue}，结果 ${passed ? '通过' : '未通过'}。`);
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

  async function applyMovementTriggeredPassives(player){
    const passives = getProfessionPassives(player);
    const moved = Number(player.turn?.movedDistance || 0);
    if(!moved || !passives.length) return;
    for(const passive of passives){
      if(!passive || passive.template !== 'threshold_reward_once_per_turn') continue;
      const passiveKey = passive.key || passive.name || passive.template;
      if(passive.config?.oncePerTurn && player.turn?.passiveOnceTriggered?.[passiveKey]) continue;
      const thresholdType = passive.config?.thresholdType || passive.config?.checkType || '';
      const normalizedType = ({
        distance: 'distance_moved',
        moved_distance: 'distance_moved',
        move_distance: 'distance_moved',
        distance_moved: 'distance_moved'
      })[String(thresholdType)] || String(thresholdType);
      if(normalizedType !== 'distance_moved') continue;
      const thresholdValue = Number(
        passive.config?.thresholdValue ??
        passive.config?.threshold ??
        passive.config?.distanceThreshold ??
        0
      );
      if(moved >= thresholdValue){
        await applyRewardList(player, passive.config?.rewardList || [], passive.name || '移动被动');
        if(passive.config?.oncePerTurn){
          player.turn.passiveOnceTriggered = player.turn.passiveOnceTriggered || {};
          player.turn.passiveOnceTriggered[passiveKey] = true;
        }
        log(`${player.label} 的被动 ${passive.name || passiveKey} 因移动 ${moved} 格触发。`);
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
    hideDeckTooltip();
    startBattleAudio();
    document.body.classList.add('battle-running');
    relocateLanguageControls();
    syncArenaScreenBackdrop();
    const rulesetId = $('ruleset-select').value;
    state.ruleset = deep(STUDIO_RUNTIME.findRuleset(rulesetId));
    normalizeRulesetForBattle(state.ruleset);
    syncCardLibraryFromProfessions(state.ruleset);
    state.matchOptions = readMatchOptions();
    state.players = [
      buildPlayer(1, $('p1-profession').value, $('p1-weapon').value, $('p1-accessory').value, 'human', {q:-R,r:0}),
      buildPlayer(2, $('p2-profession').value, $('p2-weapon').value, $('p2-accessory').value, $('p2-type').value, {q:R,r:0}),
    ];
    state.board = buildBoard();
    state.boardMap = new Map(state.board.map(t=>[key(t),t]));
    state.traps = new Map();
    state.mapTokens = new Map();
    state.mapHazardTimers.forEach(timers => {
      clearInterval(timers.interval);
      clearTimeout(timers.timeout);
    });
    (state.projectileTimers || []).forEach(timers => {
      clearInterval(timers.interval);
      clearTimeout(timers.timeout);
    });
    state.mapHazardAnims = new Map();
    state.mapHazardTimers = new Map();
    state.projectileAnims = [];
    state.projectileTimers = [];
    state.summonSeq = 0;
    state.current = 0;
    state.pending = null;
    state.selectedCardIndex = null;
    state.winner = null;
    state.dualModeCard = null;
    $('setup-panel').classList.add('hidden');
    $('game-screen').classList.remove('hidden');
    $('log').innerHTML = '';
    state.players.forEach(p=>drawCards(p, state.matchOptions.drawOpening));
    state.players.forEach(p=>ensureHandLimit(p));
    log(isBlackHoleEnabled() ? '对局开始。黑洞每回合将所有单位向中心牵引 1 格。' : '对局开始。黑洞已关闭。');
    startTurn();
    setTimeout(fitBoardZoom, 0);
  }

  function relocateLanguageControls(){
    const lang = document.querySelector('.lang-bar');
    const menuLang = $('menu-lang-container');
    if(!lang || !menuLang || menuLang.contains(lang)) return;
    lang.classList.add('battle-lang-bar');
    menuLang.appendChild(lang);
  }

  function syncArenaScreenBackdrop(){
    const url = state.customArenaBackdropUrl || MAP_ASSETS.arenaBackdrop;
    document.body.style.setProperty('--arena-screen-backdrop', `url("${url}")`);
  }

  async function startTurn(){
    if(state.winner) return;
    const p = current();
    if(!p.alive) return nextTurn();
    resetTurnState(p);
    p.block = 0;
    if(isBlackHoleEnabled()) await applyBlackHolePull();
    processDotEffects(p);
    if(p.statuses.burn>0){ takePureDamage(p, 2); p.statuses.burn -= 1; log(`${p.label} 受到点燃 2 伤害。`); }
    if(p.hp<=0){ p.hp=0; p.alive=false; state.winner = enemyOf(p)?.id || 1; render(); setHint('对局结束'); return; }
    const enemy = enemyOf(p);
    if(p.professionKey==='necro' && enemy){
      let bonus = 0;
      const skeletons = p.summons?.skeleton || 0;
      const dragons = p.summons?.bone_dragon || 0;
      if(skeletons > 0) triggerSummonAttack(p, 'skeleton');
      if(dragons > 0) triggerSummonAttack(p, 'bone_dragon');
      bonus += loggedRollBatch(`${p.label} 的骷髅自动伤害`, '1d4', skeletons);
      bonus += loggedRollBatch(`${p.label} 的骨龙自动伤害`, '1d8', dragons);
      if(bonus>0){ takePureDamage(enemy, bonus); log(`${p.label} 的亡灵随从在回合开始合计造成 ${bonus} 伤害。`); if(enemy.hp<=0){ state.winner=p.id; render(); setHint('对局结束'); return; } }
    }
    processMapTokensAtTurnStart(p);
    if(p.hp<=0){ p.hp=0; p.alive=false; state.winner = enemyOf(p)?.id || 1; render(); setHint('对局结束'); return; }
    if(p.statuses.stun>0){
      p.statuses.stun -= 1;
      log(`${p.label} 被眩晕，跳过本回合。`);
      render();
      setTimeout(nextTurn, 450);
      return;
    }
    drawCards(p, state.matchOptions.drawPerTurn);
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

  async function applyBlackHolePull(){
    const center={q:0,r:0};
    for(const p of state.players){
      if(!p.alive) continue;
      const opts = neighbors(p.pos).filter(c=>state.boardMap.has(key(c)) && !isBlockedTile(c)).filter(c=>{ const occ=getPlayerAt(c); return !occ || occ.id===p.id; }).sort((a,b)=>dist(a,center)-dist(b,center));
      if(opts[0] && key(opts[0])!==key(p.pos)){ await movePlayerTo(p, opts[0], { duration: 260 }); enterTile(p); }
    }
  }

  function enterTile(player, pos = player.pos){
    if(!player || !player.alive) return;
    const tilePos = deep(pos || player.pos);
    const tileKey = key(tilePos);
    const t = state.boardMap.get(tileKey); if(!t) return;
    if(isSpikeDangerTile(tilePos)){
      playSfx('trap', 0.55);
      triggerObeliskLightning(tilePos);
      const dmg = loggedRoll(`${player.label} 尖刺区域伤害`, '2d8');
      takePureDamage(player, dmg);
      log(`${player.label} 触碰飞行方尖碑危险区域，受到 ${dmg} 伤害。`);
      if(!player.alive) return;
    }
    if(isTokenDangerTile(tilePos)){
      const tok = getMapToken(tilePos) || neighbors(tilePos).map(getMapToken).find(Boolean);
      const expr = tok?.damage || '2d8';
      playSfx('trap', 0.55);
      const dmg = loggedRoll(`${player.label} ${tok?.name || '危险区'}伤害`, resolvePlayerNotation(player, expr));
      takePureDamage(player, dmg);
      log(`${player.label} 触碰 ${tok?.name || '危险区'}，受到 ${dmg} 伤害。`);
      if(!player.alive) return;
    }
    if(isBlackHoleEnabled() && t.type==='center'){
      playSfx('trap', 0.55);
      const dmg = loggedRoll(`${player.label} 黑洞中心伤害`, '2d8');
      takePureDamage(player, dmg);
      log(`${player.label} 被黑洞中心撕扯，受到 ${dmg} 伤害。`);
      if(!player.alive) return;
    }
    const trap = state.traps.get(tileKey);
    if(trap && trap.ownerId !== player.id){
      playSfx('trap', 0.55);
      const dmg = loggedRoll(`${player.label} 陷阱伤害`, '2d6'); takePureDamage(player, dmg); player.statuses.slow = 1;
      log(`${player.label} 触发陷阱，受到 ${dmg} 伤害并减速。`);
      state.traps.delete(tileKey);
      if(!player.alive) return;
    }
    triggerMapTokenOnEnter(player, tilePos);
    if(player.hp<=0){ player.hp=0; player.alive=false; state.winner = enemyOf(player)?.id || 1; }
  }


  async function useProfessionPassive(){
    const p = current();
    if (!p.alive) return;
    const passiveEntry = Object.entries(p.profession.passives || {})[0];
    const passiveKey = passiveEntry?.[0] || 'profession_passive';
    const passive = passiveEntry?.[1];
    if (!passive) return;
    if(passive.config?.oncePerTurn && p.turn?.passiveOnceTriggered?.[passiveKey]) return;
    if (passive.template === 'life_for_card_draw_once_per_turn'){
      const anim = castOrRangedAnim(p);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 620));
      triggerSkillTileFx(profDefaultFx(p.professionKey).self || 'buff-red', p.pos);
      const lifeCost = Number(passive.config?.lifeCost || 0);
      const drawCount = Number(passive.config?.drawCount || 1);
      p.hp = Math.max(0, p.hp - lifeCost);
      log(`${p.label} 发动 ${passive.name || '职业被动'}，支付 ${lifeCost} 点生命。`);
      if (p.hp <= 0){
        finalizePlayerState(p);
        state.winner = enemyOf(p)?.id || 1;
        finishAfterAction();
        return;
      }
      drawCards(p, drawCount);
      ensureHandLimit(p);
      if(passive.config?.oncePerTurn){
        p.turn.passiveOnceTriggered = p.turn.passiveOnceTriggered || {};
        p.turn.passiveOnceTriggered[passiveKey] = true;
      }
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
    return true;
  }

  function getReachableTiles(player){
    if(player.turn.move) return new Set();
    if(player.statuses.root>0 || player.statuses.stun>0) return new Set();
    const maxMove = movementStepLimit(player);
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

  function movementStepLimit(player){
    return player.statuses.slow>0 ? Math.ceil(player.moveBase/2) : player.moveBase;
  }

  function currentMovePath(){
    return state.pending?.type === 'move' && Array.isArray(state.pending.path) ? state.pending.path : [];
  }

  function movePathEndpoint(player){
    const path = currentMovePath();
    return path.length ? path[path.length - 1] : player.pos;
  }

  function canStepToMoveTile(player, tile){
    if(!player || !tile || player.turn.move) return false;
    if(currentMovePath().length >= movementStepLimit(player)) return false;
    if(!state.boardMap.has(key(tile)) || isBlockedTile(tile) || getPlayerAt(tile)) return false;
    return dist(movePathEndpoint(player), tile) === 1;
  }

  function movementNextTiles(player){
    if(!player || player.turn.move || player.statuses.root>0 || player.statuses.stun>0) return [];
    return neighbors(movePathEndpoint(player)).filter(tile => canStepToMoveTile(player, tile));
  }

  function resetMovePath(){
    if(state.pending?.type === 'move') state.pending.path = [];
  }

  async function confirmMovePath(){
    const p = current();
    const path = currentMovePath().map(deep);
    if(!p || state.pending?.type !== 'move' || !path.length) {
      setHint('请先逐格选择移动路线。');
      return;
    }
    p.turn.move = true;
    p.turn.movedDistance = path.length;
    for(const step of path){
      if(!p.alive) break;
      await movePlayerTo(p, step, { duration: 230, triggerPathEffects: false });
      enterTile(p);
    }
    await applyMovementTriggeredPassives(p);
    finishAfterAction();
  }

  function handleMovePathClick(tile){
    const p = current();
    if(!state.pending || state.pending.type !== 'move') return;
    const path = currentMovePath();
    const kk = key(tile);
    const existingIndex = path.findIndex(step => key(step) === kk);
    if(existingIndex >= 0){
      state.pending.path = path.slice(0, existingIndex + 1);
      render();
      setHint(`移动路线 ${state.pending.path.length}/${movementStepLimit(p)}。点确认移动执行，点路径格可回退。`);
      return;
    }
    if(kk === key(p.pos)){
      resetMovePath();
      render();
      setHint('已清空移动路线，请重新逐格选择。');
      return;
    }
    if(!canStepToMoveTile(p, tile)){
      setHint('请选择路线末端相邻、未被占用的合法地块。');
      return;
    }
    state.pending.path = path.concat([deep(tile)]);
    render();
    setHint(`移动路线 ${state.pending.path.length}/${movementStepLimit(p)}。继续点相邻格，或点确认移动。`);
  }

  function highlightSet(){
    const moves=new Set(), targets=new Set(), route=new Set();
    const p=current();
    if(state.pending?.type==='move'){
      currentMovePath().forEach(tile => route.add(key(tile)));
      movementNextTiles(p).forEach(tile => moves.add(key(tile)));
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
    return {moves,targets,route};
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
    if(p.statuses.stun>0) return false;
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
    if(p.professionKey==='rogue' && isControlled(target)) dmg += await showDice('盗贼被动', '1d4');
    triggerBasicAttackVisual(p, target);
    const damageResult = dealDamage(p, target, dmg, { sourceName: b.name || '普通攻击', anim: weaponAttackAnim(p), spell: weaponPresentation(p).kind === 'wand' });
    if(!damageResult.dodged) applySourceOnHitEffects(p, target, b, b.name || '普通攻击', { includeBasicPassive: true });
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
    if(!cardCanBePlayed(p, handItem, cardDef)) { setHint('当前行动桶已用尽。'); return; }
    state.selectedCardIndex = index;
    if(cardDef.template==='dual_mode'){
      state.dualModeCard = { index, handItem, cardDef };
      renderHand();
      renderChoicePanel(cardDef.config.modes || []);
      return;
    }
    state.pending = { type:'card', index, handItem, cardDef };
    setMode(`卡牌：${cardDef.name}`);
    render();
    if(cardDef.template==='self_buff' || cardDef.template==='summon_token_into_self_deck' || cardDef.template==='grant_multiple_buffs' || cardDef.template==='transform_basic_attack' || cardDef.template==='pay_life_draw_cards'){
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
      const anim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 620));
      triggerSelfCardVisual(handItem.cardKey, cardDef, p);
      const token = cardDef.config.tokenType || 'skeleton';
      const n = Number(cardDef.config.insertCount || 1);
      p.summons[token] = (p.summons[token] || 0) + n;
      addSummonIndicators(p, token, n);
      const tokenName = token==='bone_dragon' ? '骨龙' : '骷髅';
      log(`${p.label} 使用了 ${cardDef.name}，召唤 ${n} 个${tokenName}，当前骷髅 ${p.summons.skeleton||0} / 骨龙 ${p.summons.bone_dragon||0}。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='self_buff'){
      const anim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 620));
      triggerSelfCardVisual(handItem.cardKey, cardDef, p);
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
      const anim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 620));
      triggerSelfCardVisual(handItem.cardKey, cardDef, p);
      await applyRewardList(p, cardDef.config.rewardList || [], cardDef.name);
      if(cardDef.config.consumeOn === 'next_spell_hit') p.buffs.spellImmune = true;
      log(`${p.label} 使用了 ${cardDef.name}，直接获得多个增益。当前生命 ${p.hp}，格挡 ${p.block}。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='transform_basic_attack'){
      const anim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 620));
      triggerSelfCardVisual(handItem.cardKey, cardDef, p);
      p.buffs.basicTransform = {
        consumeOn: cardDef.config.consumeOn || 'next_basic_attack',
        durationTurns: Number(cardDef.config.durationTurns || 1),
        override: {
          name: cardDef.config.attackName || `${cardDef.name}（变身普攻）`,
          range: Number(cardDef.config.range || p.weapon.basic.range || 1),
          damage: cardDef.config.damage || p.weapon.basic.damage,
          straight: !!cardDef.config.straight,
          apply: deep(cardDef.config.apply || {}),
          applyTemplate: cardDef.config.applyTemplate || '',
          applyConfig: deep(cardDef.config.applyConfig || {})
        }
      };
      if(cardDef.config.block){ p.block += (typeof cardDef.config.block==='string' && cardDef.config.block.includes('d')) ? await showDice('格挡', cardDef.config.block) : Number(cardDef.config.block||0); }
      log(`${p.label} 使用了 ${cardDef.name}，其普通攻击已被改变。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='pay_life_draw_cards'){
      const anim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 620));
      triggerSelfCardVisual(handItem.cardKey, cardDef, p);
      const lifeCost = Number(cardDef.config?.lifeCost || 0);
      const drawCount = Number(cardDef.config?.drawCount || 1);
      p.hp = Math.max(0, p.hp - lifeCost);
      log(`${p.label} 使用 ${cardDef.name}，支付 ${lifeCost} 生命并抽 ${drawCount} 张牌。`);
      if(p.hp <= 0){
        finalizePlayerState(p);
        finishAfterAction();
        return;
      }
      drawCards(p, drawCount);
      ensureHandLimit(p);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='teleport' && tile){
      const anim = cardActionAnim(p, handItem, cardDef);
      const fromTile = deep(p.pos);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 520));
      triggerTeleportCardVisual(handItem.cardKey, cardDef, p, fromTile, tile);
      p.turn.movedDistance = dist(p.pos, tile);
      p.pos = deep(tile);
      enterTile(p);
      log(`${p.label} 使用 ${cardDef.name} 移动到目标地块。`);
      finishAfterAction();
      return;
    }

    if(cardDef.template==='create_map_token' && tile){
      const anim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, anim, spriteAnimDuration(p, anim, 520));
      triggerSkillTileFx(visualProfileForCard(handItem.cardKey, cardDef, p).area || 'teleport-purple', tile);
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
        if(adj){ await movePlayerTo(p, adj, { duration: 340, triggerDestinationEffects: true }); }
      }
      if(cardDef.template==='mark_target_for_bonus'){
        const cardAnim = cardActionAnim(p, handItem, cardDef);
        playUnitAnim(p, cardAnim, spriteAnimDuration(p, cardAnim, 520));
        triggerCardVisual(handItem.cardKey, cardDef, p, target);
        target.marked = true;
        applySourceOnHitEffects(p, target, cardDef.config || {}, cardDef.name);
        log(`${p.label} 使用 ${cardDef.name} 标记了 ${target.label}。`);
        finishAfterAction();
        return;
      }
      let dmg = 0;
      if(cardDef.template==='bonus_if_target_marked'){
        dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.baseDamage || cardDef.config.damage || '1d6'));
        if(target.marked){
          const bonus = cardDef.config.bonusDamage || 0;
          let bonusVal = 0;
          if (typeof bonus === 'string' && bonus.toLowerCase().includes('d')) {
            bonusVal = await showDice(`${cardDef.name} 标记追加`, resolvePlayerNotation(p, bonus));
          } else {
            bonusVal = Number(bonus || 0);
          }
          dmg += bonusVal;
          if(cardDef.config.consumeMark === true || String(cardDef.config.consumeMark).toLowerCase() === 'true') target.marked = false;
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
        clearSummonIndicators(p, ['skeleton', 'bone_dragon']);
      } else if(cardDef.config.damage) dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.damage));
      if(cardDef.config.conditionalBonus?.condition==='moved_this_turn' && p.turn.movedDistance>0) dmg += await showDice('条件追加', resolvePlayerNotation(p, cardDef.config.conditionalBonus.bonusDamage));
      if(cardDef.config.conditionalBonus?.condition==='target_controlled' && isControlled(target)) dmg += Number(cardDef.config.conditionalBonus.bonusFlat || 0);
      if(cardDef.config.conditionalBonus?.condition==='target_hp_lte' && target.hp <= Number(cardDef.config.conditionalBonus.threshold||0)) dmg += await showDice('斩杀追加', resolvePlayerNotation(p, cardDef.config.conditionalBonus.bonusDamage));
      const cardAnim = cardActionAnim(p, handItem, cardDef);
      triggerCardVisual(handItem.cardKey, cardDef, p, target);
      const damageResult = dealDamage(p, target, dmg, { sourceName: cardDef.name, anim: cardAnim, spell: !!cardDef.config?.spell });
      if(cardDef.config.buffBasic) p.buffs.nextBasicFlat = (p.buffs.nextBasicFlat||0) + Number(cardDef.config.buffBasic||0);
      if(cardDef.config.gainBlock) p.block += await showDice('获得格挡', cardDef.config.gainBlock);
      if(!damageResult.dodged) applySourceOnHitEffects(p, target, cardDef.config || {}, cardDef.name);
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
      const cardAnim = cardActionAnim(p, handItem, cardDef);
      playUnitAnim(p, cardAnim, spriteAnimDuration(p, cardAnim, 620));
      triggerCardVisual(handItem.cardKey, cardDef, p, tile);
      const targets = state.players.filter(x=>x.alive && x.id!==p.id && dist(x.pos,tile)<=Number(cardDef.config.radius||1));
      for(const target of targets){
        let dmg = await showDice(cardDef.name, resolvePlayerNotation(p, cardDef.config.damage));
        const damageResult = dealDamage(p, target, dmg, { sourceName: cardDef.name, anim: cardAnim, spell: !!cardDef.config?.spell });
        if(!damageResult.dodged) applySourceOnHitEffects(p, target, cardDef.config || {}, cardDef.name);
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
        applyDotEffect(player, cfg, def.name || '负面牌');
      }
    }
    if (tpl === 'negative_control' || tpl === 'negative_mixed') {
      const ctl = cfg.controlType || 'slow';
      const dur = Number(cfg.controlDuration || cfg.durationTurns || 1);
      applyControlStatus(player, ctl, dur, def.name || '负面牌');
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
      const accessoryName = p.accessory ? I18N().entity('accessory', p.accessoryKey, p.accessory.name) : I18N().t('no_accessory','无饰品');
      return `<div class="player-box${p.id===active.id?' active':''}">
        <div class="player-title"><strong>${p.label}</strong><span>${I18N().entity('profession', p.professionKey, p.profession.name)} / ${I18N().entity('weapon', p.weaponKey, p.weapon.name)} / ${accessoryName}</span></div>
        <div class="hud-metrics">
          <span>${I18N().t('hp','生命')} ${p.hp}/${p.maxHp}</span>
          <span>${I18N().t('block','格挡')} ${p.block}</span>
          <span>${I18N().t('deck_count','牌库')} ${p.deck.length}</span>
          <span>${I18N().t('hand_count','手牌')} ${p.hand.length}</span>
          <span>${I18N().t('discard_count','弃牌')} ${p.discard.length}</span>
        </div>
        <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div></div>
        <div class="block-bar"><div class="block-fill" style="width:${blockPct}%"></div></div>
        <div class="stat-line action-line">${I18N().t('action','行动')}：职 ${p.turn.classOrGuardianUsed?'✓':'○'}${(p.buffs.extraClassCardUses||0)>0?`+${p.buffs.extraClassCardUses}`:''} / 武 ${p.turn.weaponOrAccessoryUsed?'✓':'○'} / 移 ${p.turn.move?'✓':'○'} / 普 ${p.turn.basicSpent}/${1 + (p.buffs.extraBasicCap||0)} / 格 ${p.turn.autoBlockTriggered?'✓':'○'}</div>
        <div class="status-row">${formatStatuses(p)}</div>
      </div>`;
    }).join('')}</div>`;
    $('turn-indicator').textContent = state.winner ? '对局结束' : `轮到 ${active.label}`;
    const rivalHost = $('player-info-rival');
    if(rivalHost){
      const infoHost = $('player-info');
      const boxes = Array.from(infoHost.querySelectorAll('.player-box'));
      const title = `<h2>${I18N().t('role_status','角色状态')}</h2>`;
      if(boxes[0]) infoHost.innerHTML = `${title}<div class="info-grid">${boxes[0].outerHTML}</div>`;
      if(boxes[1]) rivalHost.innerHTML = `${title}<div class="info-grid">${boxes[1].outerHTML}</div>`;
    }
    const activeDeck = $('active-deck-count');
    if(activeDeck) activeDeck.textContent = active ? `${I18N().t('deck_remaining','牌库剩余')} ${active.deck.length}` : `${I18N().t('deck_remaining','牌库剩余')} 0`;
  }

  function formatStatuses(p){
    const out=[];
    if(p.statuses.burn>0) out.push(`<span class="status-chip">${I18N().t('status_burn','点燃')} ${p.statuses.burn}</span>`);
    if(p.statuses.slow>0) out.push(`<span class="status-chip">${I18N().t('status_slow','减速')}</span>`);
    if(p.statuses.disarm>0) out.push(`<span class="status-chip">${I18N().t('status_disarm','缴械')}</span>`);
    if(p.statuses.sheep>0) out.push(`<span class="status-chip">${I18N().t('status_sheep','变羊')}</span>`);
    if(p.statuses.stun>0) out.push(`<span class="status-chip">眩晕 ${p.statuses.stun}</span>`);
    if(p.statuses.root>0) out.push(`<span class="status-chip">定身 ${p.statuses.root}</span>`);
    const dotCount = (p.statuses.dot ? 1 : 0) + (Array.isArray(p.statuses.dots) ? p.statuses.dots.length : 0);
    if(dotCount) out.push(`<span class="status-chip">${I18N().t('status_dot','DOT')} x${dotCount}</span>`);
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

  function tileMaterialFill(tile, centerActive, isSpikeTile, inDanger){
    if(centerActive) return '#4d315c';
    if(isSpikeTile || inDanger) return '#8c4c4c';
    if(tile.type === 'start') return '#9db36f';
    return '#d8c384';
  }

  function tileMaterialOpacity(tile, centerActive, isSpikeTile, inDanger){
    if(centerActive) return '0.52';
    if(isSpikeTile) return '0.44';
    if(inDanger) return '0.32';
    if(tile.type === 'start') return '0.38';
    return '0.24';
  }

  function renderObeliskComponent(layer, tile){
    const {x,y} = hexToPixel(tile);
    const displayW = OBELISK_SPRITE.frameWidth * OBELISK_SPRITE.scale;
    const displayH = OBELISK_SPRITE.frameHeight * OBELISK_SPRITE.scale;
    const g = addSvg(layer, 'g', { class:'map-component obelisk-component', transform:`translate(${x} ${y})` });
    addSvg(g, 'ellipse', { cx:0, cy:20, rx:32, ry:9, class:'map-component-shadow obelisk-shadow' });
    appendNativeSprite(g, {
      file: MAP_ASSETS.obeliskIdle,
      frameWidth: OBELISK_SPRITE.frameWidth,
      frameHeight: OBELISK_SPRITE.frameHeight,
      frames: 1,
      scale: OBELISK_SPRITE.scale,
      x: -displayW / 2,
      y: -displayH + 30,
      className: 'sprite-frame-svg obelisk-sprite-frame',
      imageClass: 'sprite-sheet-image obelisk-sprite-image'
    });
    return g;
  }

  function renderLightningEffect(layer, fxState){
    if(!fxState?.target) return;
    const cfg = fxState.name === 'blue_lightning' ? BLUE_LIGHTNING_FX : LIGHTNING_FX;
    const {x,y} = hexToPixel(fxState.target);
    const frameMs = (fxState.duration || cfg.duration) / Math.max(1, cfg.files.length);
    const elapsed = Math.max(0, performance.now() - fxState.startedAt);
    const frameIndex = Math.min(cfg.files.length - 1, Math.floor(elapsed / frameMs));
    const displayW = cfg.frameWidth * cfg.scale;
    const displayH = cfg.frameHeight * cfg.scale;
    const g = addSvg(layer, 'g', { class:`map-component lightning-strike-component ${fxState.name === 'blue_lightning' ? 'blue-lightning-strike' : ''}`, transform:`translate(${x} ${y})` });
    appendNativeSprite(g, {
      file: cfg.files[frameIndex],
      frameWidth: cfg.frameWidth,
      frameHeight: cfg.frameHeight,
      frames: 1,
      scale: cfg.scale,
      x: -displayW / 2,
      y: -displayH + 20,
      className: `sprite-frame-svg lightning-fx-frame ${fxState.name === 'blue_lightning' ? 'blue-lightning-fx-frame' : ''}`,
      imageClass: 'sprite-sheet-image lightning-fx-image'
    });
  }

  function renderStripTileEffect(layer, fxState, cfg, className){
    if(!fxState?.target) return;
    const {x,y} = hexToPixel(fxState.target);
    const frameMs = (fxState.duration || cfg.duration) / Math.max(1, cfg.frames || 1);
    const elapsed = Math.max(0, performance.now() - fxState.startedAt);
    const frameIndex = Math.min((cfg.frames || 1) - 1, Math.floor(elapsed / frameMs));
    const displayW = cfg.frameWidth * cfg.scale;
    const displayH = cfg.frameHeight * cfg.scale;
    const g = addSvg(layer, 'g', { class:`map-component ${className}-component`, transform:`translate(${x} ${y})` });
    const anchorY = cfg.anchor === 'ground'
      ? -displayH / 2 + Number(cfg.yOffset || 0)
      : cfg.anchor === 'center'
        ? -displayH / 2 + Number(cfg.yOffset || 0)
        : -displayH + Number(cfg.yOffset ?? 8);
    appendNativeSprite(g, {
      file: cfg.file,
      frameWidth: cfg.frameWidth,
      frameHeight: cfg.frameHeight,
      frames: 1,
      frameIndex,
      sheetWidth: cfg.frameWidth * cfg.frames,
      sheetHeight: cfg.frameHeight,
      scale: cfg.scale,
      x: -displayW / 2,
      y: anchorY,
      className: `sprite-frame-svg ${className}-frame`,
      imageClass: `sprite-sheet-image ${className}-image skill-fx-image`
    });
  }

  function renderProjectileEffect(layer, fxState){
    if(!fxState?.from || !fxState?.to) return;
    const from = hexToPixel(fxState.from);
    const to = hexToPixel(fxState.to);
    const raw = Math.min(1, Math.max(0, (performance.now() - fxState.startedAt) / Math.max(1, fxState.duration || 360)));
    const t = easeInOut(raw);
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t - 34;
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
    const g = addSvg(layer, 'g', { class:'arrow-projectile-component', transform:`translate(${x} ${y}) rotate(${angle})` });
    if(fxState.name === 'skill_projectile'){
      const cfg = SKILL_PROJECTILE_FX[fxState.fx];
      if(!cfg) return;
      const frameMs = cfg.duration / Math.max(1, cfg.frames || 1);
      const frameIndex = Math.min((cfg.frames || 1) - 1, Math.floor((performance.now() - fxState.startedAt) / frameMs));
      const displayW = cfg.frameWidth * cfg.scale;
      const displayH = cfg.frameHeight * cfg.scale;
      appendNativeSprite(g, {
        file: cfg.file,
        frameWidth: cfg.frameWidth,
        frameHeight: cfg.frameHeight,
        frames: 1,
        frameIndex,
        sheetWidth: cfg.frameWidth * cfg.frames,
        sheetHeight: cfg.frameHeight,
        scale: cfg.scale,
        x: -displayW / 2,
        y: -displayH / 2,
        className: `sprite-frame-svg skill-projectile-frame skill-projectile-${fxState.fx}-frame`,
        imageClass: `sprite-sheet-image skill-projectile-image skill-projectile-${fxState.fx}-image`
      });
      return;
    }
    if(fxState.name === 'fire_projectile'){
      const cfg = FIRE_PROJECTILE_FX;
      const frameMs = cfg.duration / Math.max(1, cfg.frames || 1);
      const frameIndex = Math.min((cfg.frames || 1) - 1, Math.floor((performance.now() - fxState.startedAt) / frameMs));
      const displayW = cfg.frameWidth * cfg.scale;
      const displayH = cfg.frameHeight * cfg.scale;
      appendNativeSprite(g, {
        file: cfg.file,
        frameWidth: cfg.frameWidth,
        frameHeight: cfg.frameHeight,
        frames: 1,
        frameIndex,
        sheetWidth: cfg.frameWidth * cfg.frames,
        sheetHeight: cfg.frameHeight,
        scale: cfg.scale,
        x: -displayW / 2,
        y: -displayH / 2,
        className: 'sprite-frame-svg fire-projectile-frame',
        imageClass: 'sprite-sheet-image fire-projectile-image'
      });
      return;
    }
    addSvg(g, 'image', {
      href: MAP_ASSETS.arrowProjectile,
      x: -22,
      y: -3,
      width: 44,
      height: 6,
      class: 'arrow-projectile',
      preserveAspectRatio: 'xMidYMid meet'
    });
  }

  function renderBlackHoleComponent(layer, tile){
    const {x,y} = hexToPixel(tile);
    const g = addSvg(layer, 'g', { class:'map-component black-hole-component', transform:`translate(${x} ${y})` });
    addSvg(g, 'ellipse', { cx:0, cy:19, rx:39, ry:12, class:'map-component-shadow center-trap-shadow' });
    appendNativeSprite(g, {
      file: MAP_ASSETS.centerTrap,
      frameWidth: 64,
      frameHeight: 64,
      frames: 6,
      scale: 1.42,
      duration: 620,
      loop: true,
      x: -45,
      y: -54,
      className: 'sprite-frame-svg center-trap-frame',
      imageClass: 'sprite-sheet-image center-trap-image'
    });
    return g;
  }

  function renderMapTokenComponent(parent, x, y, mapTok){
    if(!mapTok) return false;
    if(mapTok.kind === 'auto_turret'){
      appendNativeSprite(parent, {
        file: MAP_ASSETS.arrowTrap,
        frameWidth: 32,
        frameHeight: 32,
        frames: 1,
        scale: 1.78,
        duration: 1100,
        loop: false,
        x: x - 28,
        y: y - 40,
        className: 'sprite-frame-svg arrow-trap-frame',
        imageClass: 'sprite-sheet-image arrow-trap-image'
      });
      return true;
    }
    if(mapTok.kind === 'trap_once_negative'){
      appendNativeSprite(parent, {
        file: MAP_ASSETS.magicTrap,
        frameWidth: 64,
        frameHeight: 64,
        frames: 39,
        scale: 0.95,
        duration: 1200,
        loop: true,
        x: x - 30,
        y: y - 42,
        className: 'sprite-frame-svg magic-trap-frame',
        imageClass: 'sprite-sheet-image magic-trap-image'
      });
      return true;
    }
    return false;
  }

  function renderBoardComponents(svg, blackHoleOn){
    const layer = addSvg(svg, 'g', { class:'map-component-layer' });
    state.board.filter(t => t.type === 'spike' && SPIKE_TILE_KEYS.has(key(t))).forEach(t => renderObeliskComponent(layer, t));
    const center = state.boardMap.get('0,0');
    if(blackHoleOn && center) renderBlackHoleComponent(layer, center);
  }

  function renderHazardEffects(svg){
    const layer = addSvg(svg, 'g', { class:'hazard-fx-layer' });
    state.mapHazardAnims.forEach(fxState => {
      if(fxState.name === 'fire_hit') renderStripTileEffect(layer, fxState, FIRE_HIT_FX, 'fire-hit-fx');
      else if(fxState.name === 'skill_tile_fx'){
        const cfg = SKILL_TILE_FX[fxState.fx];
        if(cfg) renderStripTileEffect(layer, fxState, cfg, `skill-fx-${fxState.fx}`);
      }
      else renderLightningEffect(layer, fxState);
    });
    (state.projectileAnims || []).forEach(fxState => renderProjectileEffect(layer, fxState));
  }

  function renderBoard(){
    const svg = $('board'); svg.innerHTML = '';
    const blackHoleOn = isBlackHoleEnabled();
    svg.classList.toggle('black-hole-off', !blackHoleOn);
    renderArenaBackdrop(svg);
    const hl = tileHighlights(); const active=current();
    state.board.forEach(t=>{
      const {x,y}=hexToPixel(t); const g=document.createElementNS(svgNS,'g'); g.classList.add('tile');
      const kk=key(t);
      const centerActive = blackHoleOn && t.type === 'center';
      const isSpikeTile = t.type === 'spike';
      if(hl.moves.has(kk)) g.classList.add('valid-move');
      if(hl.targets.has(kk)) g.classList.add('valid-target');
      if(hl.route?.has(kk)) g.classList.add('move-route');
      if(kk===key(active.pos)) g.classList.add('selected-origin');
      g.onclick = ()=>tileClick(t);
      const poly=document.createElementNS(svgNS,'polygon');
      poly.setAttribute('points', hexPoints(x,y));
      const inDanger = ((isSpikeDangerTile(t) && !isSpikeTile) || (isTokenDangerTile(t) && !getMapToken(t)));
      poly.setAttribute('fill', tileMaterialFill(t, centerActive, isSpikeTile, inDanger));
      poly.setAttribute('opacity', tileMaterialOpacity(t, centerActive, isSpikeTile, inDanger)); g.appendChild(poly);
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
      if(state.traps.has(kk) || mapTok){
        const renderedToken = mapTok ? renderMapTokenComponent(g, x, y, mapTok) : false;
        if(mapTok && mapTok.kind==='permanent_pillar' && !renderedToken){
          const pillar=document.createElementNS(svgNS,'circle');
          pillar.setAttribute('cx',x); pillar.setAttribute('cy',y); pillar.setAttribute('r',14); pillar.setAttribute('fill','#7f6b4b'); pillar.setAttribute('opacity','0.95');
          g.appendChild(pillar);
        }
        if(state.traps.has(kk) && !mapTok){
          appendNativeSprite(g, {
            file: MAP_ASSETS.magicTrap,
            frameWidth: 64,
            frameHeight: 64,
            frames: 39,
            scale: 0.95,
            duration: 1200,
            loop: true,
            x: x - 30,
            y: y - 42,
            className: 'sprite-frame-svg magic-trap-frame',
            imageClass: 'sprite-sheet-image magic-trap-image'
          });
        }
        const txt=document.createElementNS(svgNS,'text');
        txt.setAttribute('x',x); txt.setAttribute('y',(mapTok&&mapTok.kind==='permanent_pillar')?y+4:y-20); txt.setAttribute('text-anchor','middle');
        txt.textContent = mapTok?mapTok.name:I18N().t('trap','陷阱');
        g.appendChild(txt);
      }
      svg.appendChild(g);
    });
    renderBoardComponents(svg, blackHoleOn);
    state.players.forEach(owner => (owner.summonUnits || []).forEach(unit => renderSummonUnit(svg, owner, unit)));
    state.players.filter(p=>p.alive || p.anim === 'death').forEach(p=>{
      const {x,y}=renderPointForPlayer(p);
      renderPixelUnit(svg, p, x, y);
    });
    renderHazardEffects(svg);
  }

  function unitPalette(player){
    const map = {
      warrior: ['#f2d7a0','#8b2d32','#d2a44d','#2b1518','#f1f1e6'],
      mage: ['#e8d9be','#3c5f9d','#8ed1e8','#17213c','#f3f1ff'],
      rogue: ['#d9bd94','#3e7f56','#c5cf75','#14261b','#edf8de'],
      priest: ['#f1d6b8','#d8d2bd','#e6c65f','#2b2e34','#ffffff'],
      shaman: ['#d8bd93','#4f8a72','#7cc0c0','#1a2d2a','#edf7e9'],
      necro: ['#c8d0bd','#4f5967','#a7d66d','#17201b','#d8ffe4'],
      warlock: ['#d2b092','#673a76','#cf6dc6','#211426','#f6e6ff'],
      swordsman: ['#e2c199','#5e6675','#d7dce4','#1b1f29','#ffffff'],
      hunter: ['#d6b98d','#44633d','#c9954a','#172514','#eff5d6'],
      '武僧': ['#e8c28f','#a74833','#f0d06d','#251710','#fff7d0'],
    };
    const fallback = player.id === 1 ? ['#f2d0a1','#3f6f8f','#8ec5ff','#132432','#f8fbff'] : ['#eac09f','#8e4056','#ff8aa8','#32151f','#fff4f7'];
    return map[player.professionKey] || fallback;
  }

  function addPixelRect(g, px, py, w, h, color, opacity = 1){
    const r = document.createElementNS(svgNS, 'rect');
    r.setAttribute('x', px);
    r.setAttribute('y', py);
    r.setAttribute('width', w);
    r.setAttribute('height', h);
    r.setAttribute('fill', color);
    if(opacity !== 1) r.setAttribute('opacity', opacity);
    r.setAttribute('shape-rendering', 'crispEdges');
    g.appendChild(r);
  }

  function setSvgAttrs(el, attrs){
    Object.entries(attrs).forEach(([name, value]) => {
      if(value !== null && value !== undefined) el.setAttribute(name, value);
    });
    return el;
  }

  function appendNativeSprite(parent, opts){
    const frameW = Number(opts.frameWidth || 1);
    const frameH = Number(opts.frameHeight || 1);
    const scale = Number(opts.scale || 1);
    const frames = Math.max(1, Number(opts.frames || 1));
    const sheetW = Number(opts.sheetWidth || frameW * frames);
    const sheetH = Number(opts.sheetHeight || frameH);
    const row = Math.max(0, Number(opts.row || 0));
    const frameIndex = Math.max(0, Number(opts.frameIndex || 0));
    const duration = Number(opts.duration || 600);
    const x = Number(opts.x || 0);
    const y = Number(opts.y || 0);
    appendNativeSprite._id = (appendNativeSprite._id || 0) + 1;
    const clipId = `sprite-clip-${appendNativeSprite._id}`;
    const frame = document.createElementNS(svgNS, 'g');
    setSvgAttrs(frame, { class: opts.className || 'sprite-frame-svg' });

    const defs = document.createElementNS(svgNS, 'defs');
    const clip = document.createElementNS(svgNS, 'clipPath');
    setSvgAttrs(clip, { id: clipId, clipPathUnits: 'userSpaceOnUse' });
    const clipRect = document.createElementNS(svgNS, 'rect');
    setSvgAttrs(clipRect, { x, y, width: frameW * scale, height: frameH * scale });
    clip.appendChild(clipRect);
    defs.appendChild(clip);
    frame.appendChild(defs);

    const clipped = document.createElementNS(svgNS, 'g');
    clipped.setAttribute('clip-path', `url(#${clipId})`);
    const img = document.createElementNS(svgNS, 'image');
    setSvgAttrs(img, {
      href: opts.file,
      x: x - frameIndex * frameW * scale,
      y: y - row * frameH * scale,
      width: sheetW * scale,
      height: sheetH * scale,
      class: opts.imageClass || 'sprite-sheet-image',
      preserveAspectRatio: 'none'
    });
    img.setAttributeNS(xlinkNS, 'href', opts.file);
    if(frames > 1){
      const values = Array.from({ length: frames }, (_, i) => String(x - (frameIndex + i) * frameW * scale)).join(';');
      const anim = document.createElementNS(svgNS, 'animate');
      setSvgAttrs(anim, {
        attributeName: 'x',
        values,
        dur: `${duration}ms`,
        calcMode: 'discrete',
        repeatCount: opts.loop ? 'indefinite' : '1',
        fill: opts.loop ? 'remove' : 'freeze'
      });
      img.appendChild(anim);
    }
    clipped.appendChild(img);
    frame.appendChild(clipped);
    parent.appendChild(frame);
    return frame;
  }

  function appendUnitHealthBar(g, p, x, y){
    const width = 108;
    const height = 18;
    const pct = Math.max(0, Math.min(1, Number(p.hp || 0) / Math.max(1, Number(p.maxHp || 1))));
    const frameX = x - width / 2;
    addSvg(g, 'rect', { x: frameX + 8, y: y + 5, width: width - 16, height: height - 8, class:'unit-hpbar-bg' });
    addSvg(g, 'rect', { x: frameX + 8, y: y + 5, width: Math.max(0, (width - 16) * pct), height: height - 8, class:'unit-hpbar-fill' });
    addSvg(g, 'image', {
      href: 'assets/ui/dragon-hpbar.png',
      x: frameX,
      y,
      width,
      height,
      class:'unit-hpbar-frame',
      preserveAspectRatio:'none'
    });
    const hpText = document.createElementNS(svgNS, 'text');
    setSvgAttrs(hpText, { x, y: y + 13, 'text-anchor': 'middle', class: 'unit-hpbar-text' });
    hpText.textContent = `${p.hp}/${p.maxHp}`;
    g.appendChild(hpText);
  }

  function appendUnitLabels(g, p, x, nameY, hpY){
    const name = document.createElementNS(svgNS, 'text');
    setSvgAttrs(name, { x, y: nameY, 'text-anchor': 'middle', class: 'unit-nameplate' });
    name.textContent = `P${p.id} ${I18N().entity('profession', p.professionKey, p.profession.name)}`;
    g.appendChild(name);

    appendUnitHealthBar(g, p, x, hpY);
    if(p.block <= 0) return;

    const plate = document.createElementNS(svgNS, 'text');
    setSvgAttrs(plate, { x, y: hpY + 22, 'text-anchor': 'middle', class: 'unit-hpplate' });
    plate.textContent = `护 ${p.block}`;
    g.appendChild(plate);
  }

  function appendMarkFx(g, x, y){
    appendNativeSprite(g, {
      file: MAP_ASSETS.markFx,
      frameWidth: 64,
      frameHeight: 64,
      frames: 12,
      sheetWidth: 768,
      sheetHeight: 64,
      row: 0,
      scale: 0.78,
      duration: 680,
      loop: true,
      x: x - 25,
      y: y - 25,
      className: 'sprite-frame-svg mark-fx-frame',
      imageClass: 'sprite-sheet-image mark-fx-image'
    });
  }

  function renderSummonUnit(svg, owner, unit){
    const profile = summonSpriteFor(unit.type);
    const animName = unit.anim === 'attack' && unit.animUntil > performance.now() ? 'attack' : 'idle';
    const anim = profile.animations[animName] || profile.animations.idle;
    const {x,y} = hexToPixel(unit.pos);
    const frameW = profile.frameWidth;
    const frameH = profile.frameHeight;
    const scale = profile.scale || 1;
    const displayW = frameW * scale;
    const displayH = frameH * scale;
    const enemy = enemyOf(owner);
    const enemyPoint = enemy ? hexToPixel(enemy.pos) : null;
    const facing = enemyPoint && enemyPoint.x < x ? -1 : 1;
    const g = addSvg(svg, 'g', { class:`summon-unit summon-${unit.type} summon-owner-${owner.id}` });
    addSvg(g, 'ellipse', { cx:x, cy:y+8, rx:Math.max(18, displayW * .2), ry:7, class:'summon-shadow' });
    const body = addSvg(g, 'g', {
      class:'summon-body',
      transform: facing < 0 ? `translate(${x} ${y}) scale(-1 1)` : `translate(${x} ${y})`
    });
    appendNativeSprite(body, {
      file: anim.file,
      frameWidth: frameW,
      frameHeight: frameH,
      frames: anim.frames || 1,
      scale,
      duration: anim.duration || 700,
      loop: !!anim.loop,
      x: -displayW / 2,
      y: -displayH + Number(profile.footOffset || 18),
      className: 'sprite-frame-svg summon-sprite-frame',
      imageClass: 'sprite-sheet-image summon-sprite-image'
    });
    const label = addSvg(g, 'text', { x, y: y - displayH + Number(profile.footOffset || 18) - 4, 'text-anchor':'middle', class:'summon-label' });
    label.textContent = unit.type === 'bone_dragon' ? '骨龙' : '骷髅';
  }

  function renderSpriteUnit(svg, p, x, y){
    const profile = spriteProfileFor(p);
    const animName = p.anim || 'idle';
    const anim = spriteAnimFor(p, animName);
    if(!profile || !anim) return false;

    const frameW = profile.frameWidth;
    const frameH = profile.frameHeight;
    const scale = profile.scale || 1;
    const displayW = frameW * scale;
    const displayH = frameH * scale;
    const frameCount = Math.max(1, Number(anim.frames || 1));
    const duration = Number(anim.duration || 600);
    const footOffset = Number(profile.footOffset ?? (profile.frameHeight === 96 ? 18 : 20));
    const headOffset = Number(profile.headOffset ?? (displayH - footOffset));

    const g = document.createElementNS(svgNS, 'g');
    setSvgAttrs(g, {
      class: `sprite-unit sprite-unit-p${p.id} sprite-unit-${vectorAnimName(animName)} sprite-profile-${spriteProfileKeyFor(p)} weapon-${weaponPresentation(p).kind}`,
      'data-profession': p.professionKey,
      'data-weapon': p.weaponKey
    });

    const shadow = document.createElementNS(svgNS, 'ellipse');
    setSvgAttrs(shadow, { cx: x, cy: y + 10, rx: Math.max(28, displayW * .2), ry: 9, class: 'pixel-unit-shadow' });
    g.appendChild(shadow);

    const body = document.createElementNS(svgNS, 'g');
    body.setAttribute('class', 'sprite-body');
    body.setAttribute('transform', (p.facing || 1) < 0 ? `translate(${x} ${y}) scale(-1 1)` : `translate(${x} ${y})`);

    appendNativeSprite(body, {
      file: anim.file,
      frameWidth: frameW,
      frameHeight: frameH,
      frames: frameCount,
      scale,
      duration,
      loop: !!anim.loop,
      x: -displayW / 2,
      y: -displayH + footOffset,
      className: 'sprite-frame-svg unit-sprite-frame',
      imageClass: 'sprite-sheet-image unit-sprite-image'
    });
    g.appendChild(body);

    if(p.marked) appendMarkFx(g, x, y - headOffset - 38);

    appendUnitLabels(g, p, x, y - headOffset - 10, y - headOffset + 1);
    svg.appendChild(g);
    return true;
  }

  function renderPixelUnit(svg, p, x, y){
    if(renderSpriteUnit(svg, p, x, y)) return;
    const pal = unitPalette(p);
    const [skin, cloth, accent, outline, shine] = pal;
    const s = 4;
    const bx = x - 30;
    const by = y - 78;
    const dir = (p.facing || 1) < 0 ? -1 : 1;
    const anim = vectorAnimName(p.anim);
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', `pixel-unit pixel-unit-p${p.id} pixel-unit-${anim}`);
    g.setAttribute('data-profession', p.professionKey);

    const shadow = document.createElementNS(svgNS, 'ellipse');
    shadow.setAttribute('cx', x);
    shadow.setAttribute('cy', y + 7);
    shadow.setAttribute('rx', 28);
    shadow.setAttribute('ry', 8);
    shadow.setAttribute('class', 'pixel-unit-shadow');
    g.appendChild(shadow);

    addPixelRect(g, bx + 5*s, by + 1*s, 5*s, 1*s, outline);
    addPixelRect(g, bx + 4*s, by + 2*s, 7*s, 4*s, skin);
    addPixelRect(g, bx + 4*s, by + 2*s, 7*s, 1*s, outline);
    addPixelRect(g, bx + 6*s, by + 4*s, 1*s, 1*s, outline);
    addPixelRect(g, bx + 9*s, by + 4*s, 1*s, 1*s, outline);
    addPixelRect(g, bx + 5*s, by + 6*s, 5*s, 1*s, outline);

    addPixelRect(g, bx + 4*s, by + 7*s, 8*s, 2*s, outline);
    addPixelRect(g, bx + 5*s, by + 8*s, 6*s, 5*s, cloth);
    addPixelRect(g, bx + 6*s, by + 9*s, 4*s, 2*s, accent);
    addPixelRect(g, bx + 7*s, by + 8*s, 2*s, 1*s, shine, .9);

    addPixelRect(g, bx + 2*s, by + 8*s, 3*s, 2*s, outline);
    addPixelRect(g, bx + 11*s, by + 8*s, 3*s, 2*s, outline);
    addPixelRect(g, bx + 2*s, by + 10*s, 2*s, 3*s, cloth);
    addPixelRect(g, bx + 12*s, by + 10*s, 2*s, 3*s, cloth);

    const weaponX = dir === 1 ? bx + 14*s : bx + 1*s;
    addPixelRect(g, weaponX, by + 5*s, 1*s, 9*s, '#d8d4c4');
    addPixelRect(g, weaponX - (dir === 1 ? 0 : 1*s), by + 4*s, 2*s, 2*s, accent);

    addPixelRect(g, bx + 5*s, by + 13*s, 3*s, 4*s, outline);
    addPixelRect(g, bx + 9*s, by + 13*s, 3*s, 4*s, outline);
    addPixelRect(g, bx + 5*s, by + 14*s, 2*s, 3*s, cloth);
    addPixelRect(g, bx + 10*s, by + 14*s, 2*s, 3*s, cloth);
    addPixelRect(g, bx + 4*s, by + 17*s, 4*s, 1*s, outline);
    addPixelRect(g, bx + 9*s, by + 17*s, 4*s, 1*s, outline);

    if(p.marked) appendMarkFx(g, x, y - 112);

    appendUnitLabels(g, p, x, y - 92, y - 80);

    svg.appendChild(g);
  }

  function renderHand(){
    const hand = $('hand'); hand.innerHTML='';
    const p=current();
    const count = p.hand.length;
    const mobileTwoRow = window.innerWidth <= 860 && window.innerHeight > 560 && count > 4;
    hand.classList.toggle('is-mobile-two-row', mobileTwoRow);
    if(mobileTwoRow){
      const perRow = Math.ceil(count / 2);
      const overlap = 18;
      const cardWidth = Math.max(76, Math.min(98, Math.floor((window.innerWidth - 24 + overlap * Math.max(0, perRow - 1)) / Math.max(1, perRow))));
      const handWidth = Math.min(window.innerWidth - 10, perRow * cardWidth - Math.max(0, perRow - 1) * overlap);
      hand.style.setProperty('--mobile-hand-width', `${handWidth}px`);
    } else {
      hand.style.removeProperty('--mobile-hand-width');
    }
    const mid = (count - 1) / 2;
    p.hand.forEach((item, idx)=>{
      const def = getCardDef(item.cardKey);
      if(!def) return;
      const b=document.createElement('button');
      b.className='card'+(state.selectedCardIndex===idx?' selected':'');
      b.type = 'button';
      b.setAttribute('aria-pressed', state.selectedCardIndex===idx ? 'true' : 'false');
      if(mobileTwoRow){
        const perRow = Math.ceil(count / 2);
        const row = idx >= perRow ? 1 : 0;
        const rowIndex = row === 0 ? idx : idx - perRow;
        const rowCount = row === 0 ? perRow : Math.max(0, count - perRow);
        const rowMid = (Math.max(1, rowCount) - 1) / 2;
        b.style.setProperty('--fan-x', '0px');
        b.style.setProperty('--fan-rotate', `${(rowIndex - rowMid) * 3.1}deg`);
        b.style.setProperty('--fan-y', `${row * 6 + Math.abs(rowIndex - rowMid) * 2}px`);
        b.style.zIndex = String((row === 0 ? 20 : 60) + idx);
        if(row === 1) b.classList.add('mobile-row-back');
        if(rowIndex === 0) b.classList.add('mobile-row-start');
      } else {
        b.style.setProperty('--fan-x', '0px');
        b.style.setProperty('--fan-rotate', `${(idx - mid) * 2.4}deg`);
        b.style.setProperty('--fan-y', `${Math.abs(idx - mid) * 3}px`);
        b.style.zIndex = String(20 + idx);
      }
      b.innerHTML=`<div class="card-name">${I18N().entity('card', item.cardKey, def.name)}</div>
        <div class="card-meta">${I18N().t('source','来源')}：${I18N().entity('origin', item.origin, item.origin)} · ${I18N().t('template','模板')}：${I18N().entity('template', def.template, def.template)}</div>
        <div class="card-text">${def.text || ''}</div>`;
      b.onclick = ()=>playCardFromHand(idx);
      hand.appendChild(b);
    });
    fitHandCardText();
  }

  function fitHandCardText(){
    requestAnimationFrame(() => {
      document.querySelectorAll('#hand .card').forEach(card => {
        const text = card.querySelector('.card-text');
        if(!text) return;
        text.style.fontSize = '';
        text.style.lineHeight = '';
        let size = Number.parseFloat(getComputedStyle(text).fontSize) || 14;
        while(text.scrollHeight > text.clientHeight && size > 11){
          size -= 0.5;
          text.style.fontSize = `${size}px`;
          text.style.lineHeight = '1.28';
        }
      });
    });
  }


  function renderPassiveButton(){
    const btn = $('btn-passive');
    if (!btn) return;
    btn.style.display = 'none';
    const p = current();
    if (!p || !p.professionKey) return;
    const pk = p.professionKey.toLowerCase();
    if (pk !== 'warlock' && pk !== 'lock') return;

    const passiveEntry = Object.entries(p.profession.passives || {})[0];
    const passiveKey = passiveEntry?.[0] || 'profession_passive';
    const passive = passiveEntry?.[1];
    if (passive && passive.template === 'life_for_card_draw_once_per_turn'){
      btn.style.display = '';
      const text = btn.querySelector('.u-text') || btn;
      text.textContent = `${passive.name || '职业被动'}（-${passive.config?.lifeCost || 0} 生命 / +${passive.config?.drawCount || 1} 抽）`;
      btn.disabled = !!p.turn?.passiveOnceTriggered?.[passiveKey] || !p.alive;
    }
  }

  function renderMoveConfirmButton(){
    const btn = $('btn-confirm-move');
    if(!btn) return;
    const show = state.pending?.type === 'move' && currentMovePath().length > 0;
    btn.style.display = show ? '' : 'none';
    const text = btn.querySelector('.u-text') || btn;
    text.textContent = show ? `确认移动 ${currentMovePath().length}/${movementStepLimit(current())}` : '确认移动';
    btn.disabled = !show;
  }

  function renderCancelButton(){
    const btn = $('btn-cancel');
    if(!btn) return;
    // Show only when there is a pending action (move, attack, card, etc.)
    btn.style.display = (state.pending) ? '' : 'none';
  }

  function layoutActionButtons(forceEditLayout = false){
    if(document.body.classList.contains('ui-edit-mode') && !forceEditLayout) return;
    const ids = ['btn-passive', 'btn-move', 'btn-basic-attack', 'btn-cancel', 'btn-end-turn', 'btn-confirm-move'];
    const isMobile = window.innerWidth <= 860;
    const visibleButtons = ids
      .map(id => $(id))
      .filter(btn => btn && getComputedStyle(btn).display !== 'none');
    const buttonsToLayout = visibleButtons.filter(btn => {
      if(forceEditLayout) return !btn.dataset.layoutPinned || !btn.style.left || !btn.style.top;
      return !btn.dataset.layoutPinned;
    });
    if(!buttonsToLayout.length) return;
    const size = isMobile ? 42 : 48;
    const gap = isMobile ? 8 : 10;
    const padding = isMobile ? 8 : 16;
    const maxSlots = isMobile ? 4 : 8;
    const minSlots = isMobile ? 2 : 3;
    const maxPerRow = Math.max(minSlots, Math.min(maxSlots, Math.floor((window.innerWidth - padding * 2 + gap) / (size + gap)) || minSlots));
    const rows = Math.ceil(buttonsToLayout.length / maxPerRow);
    const baseBottom = isMobile ? 18 : 22;
    buttonsToLayout.forEach((btn, index) => {
      const row = Math.floor(index / maxPerRow);
      const col = index % maxPerRow;
      const rowStart = row * maxPerRow;
      const rowCount = Math.min(maxPerRow, buttonsToLayout.length - rowStart);
      const rowTotal = rowCount * size + Math.max(0, rowCount - 1) * gap;
      const startX = Math.max(padding, Math.round((window.innerWidth - rowTotal) / 2));
      const bottom = baseBottom + (rows - 1 - row) * (size + gap);
      btn.style.setProperty('left', `${startX + col * (size + gap)}px`, 'important');
      btn.style.setProperty('right', 'auto', 'important');
      btn.style.setProperty('top', 'auto', 'important');
      btn.style.setProperty('bottom', `${bottom}px`, 'important');
      btn.style.setProperty('width', `${size}px`, 'important');
      btn.style.setProperty('height', `${size}px`, 'important');
    });
  }
  window.layoutActionButtons = layoutActionButtons;

  function render(){
    renderPlayerInfo();
    renderPassiveButton();
    renderMoveConfirmButton();
    renderCancelButton();
    layoutActionButtons();
    renderBoard();
    renderHand();
  }

  async function tileClick(tile){
    const p=current();
    if(state.pending?.type==='discard') return;
    const occ=getPlayerAt(tile);
    if(state.pending?.type==='move'){
      handleMovePathClick(tile);
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

  function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function aiAverageDamage(value){
    if(value === null || value === undefined || value === '') return 0;
    if(typeof value === 'number') return value;
    const raw = String(value).replace(/\s+/g, '');
    if(/^[-+]?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
    let total = 0;
    let matched = false;
    const diceRe = /([+-]?)(\d*)d(\d+)/gi;
    let m;
    while((m = diceRe.exec(raw))){
      matched = true;
      const sign = m[1] === '-' ? -1 : 1;
      const count = Number(m[2] || 1);
      const sides = Number(m[3] || 0);
      total += sign * count * (sides + 1) / 2;
    }
    const cleaned = raw.replace(diceRe, '');
    const flatRe = /([+-]?\d+(?:\.\d+)?)/g;
    while((m = flatRe.exec(cleaned))) total += Number(m[1]);
    return matched ? total : 0;
  }

  function aiCardDamageValue(player, cardDef, target){
    const cfg = cardDef?.config || {};
    let value = cfg.damage || cfg.baseDamage || 0;
    let dmg = aiAverageDamage(resolvePlayerNotation(player, value));
    if(cardDef?.template === 'bonus_if_target_marked' && target?.marked) dmg += aiAverageDamage(resolvePlayerNotation(player, cfg.bonusDamage || 0));
    if(cfg.conditionalBonus?.condition === 'target_controlled' && isControlled(target)) dmg += Number(cfg.conditionalBonus.bonusFlat || 0);
    if(cfg.conditionalBonus?.condition === 'moved_this_turn' && player.turn?.movedDistance > 0) dmg += aiAverageDamage(resolvePlayerNotation(player, cfg.conditionalBonus.bonusDamage || 0));
    if(cfg.conditionalBonus?.condition === 'target_hp_lte' && target?.hp <= Number(cfg.conditionalBonus.threshold || 0)) dmg += aiAverageDamage(resolvePlayerNotation(player, cfg.conditionalBonus.bonusDamage || 0));
    return dmg;
  }

  function aiCardEntries(player){
    const entries = [];
    player.hand.forEach((handItem, index) => {
      const cardDef = getCardDef(handItem.cardKey);
      if(!cardDef || !cardCanBePlayed(player, handItem, cardDef)) return;
      if(cardDef.template === 'dual_mode'){
        (cardDef.config?.modes || []).forEach((mode, modeIndex) => {
          const virtualCard = {
            name: `${cardDef.name} · ${mode.name || `模式${modeIndex + 1}`}`,
            source: handItem.origin,
            template: mode.templateRef,
            config: mode
          };
          if(cardCanBePlayed(player, handItem, virtualCard)) entries.push({ index, handItem, cardDef: virtualCard, baseCardDef: cardDef, modeIndex });
        });
      } else {
        entries.push({ index, handItem, cardDef, baseCardDef: cardDef, modeIndex: -1 });
      }
    });
    return entries;
  }

  function aiTargetTemplate(template){
    return ['direct_damage','dash_hit','insert_negative_card_into_target_deck','mark_target_for_bonus','bonus_if_target_marked','consume_all_activated_tokens_for_burst','damage_then_multi_buff','damage_roll_grant_card'].includes(template);
  }

  function aiCardControlBonus(cardDef){
    const cfg = cardDef?.config || {};
    if(cfg.applyTemplate || cfg.applyConfig?.controlType || cfg.apply?.controlType) return 26;
    if(cfg.applyConfig?.damagePerTick || cfg.apply?.damagePerTick) return 18;
    return 0;
  }

  function aiSelfCardScore(player, cardDef){
    const cfg = cardDef?.config || {};
    let score = 0;
    if(cardDef.template === 'summon_token_into_self_deck') score += 72;
    if(cardDef.template === 'transform_basic_attack' && player.turn.basicSpent < 1 + (player.buffs.extraBasicCap || 0)) score += 68;
    if(cardDef.template === 'grant_multiple_buffs') score += 58;
    if(cardDef.template === 'self_buff'){
      if(cfg.heal && player.hp < player.maxHp) score += 38 + Math.min(30, player.maxHp - player.hp);
      if(cfg.block || cfg.gainBlock) score += 36;
      if(cfg.buffBasic || cfg.bonusDie || cfg.basicAttackCapDelta) score += player.turn.basicSpent ? 18 : 54;
      if(cfg.classSkillCapDelta || cfg.dodgeNext || cfg.counterDamage || cfg.healOnDamaged) score += 42;
    }
    if(cardDef.template === 'pay_life_draw_cards'){
      const cost = Number(cfg.lifeCost || 0);
      if(player.hp > cost + 10) score += 48 + Math.max(0, 5 - player.hand.length) * 4;
    }
    return score;
  }

  function aiTokenTile(player, enemy, cardDef){
    let best = null;
    let bestScore = -Infinity;
    for(const tile of state.board){
      if(getPlayerAt(tile) || isBlockedTile(tile) || getMapToken(tile) || state.traps.has(key(tile))) continue;
      if(!withinTileRange(player, tile, cardDef)) continue;
      let score = 60 - dist(tile, enemy.pos) * 5;
      if(dist(tile, enemy.pos) <= 1) score += 35;
      if(isSpikeDangerTile(tile) || isTokenDangerTile(tile)) score -= 80;
      if(score > bestScore){ bestScore = score; best = tile; }
    }
    return best ? { tile: best, score: bestScore } : null;
  }

  function aiTeleportTile(player, enemy, cardDef){
    let best = null;
    let bestScore = -Infinity;
    const basicRange = Number(getActiveBasicAttack(player).range || 1);
    for(const tile of state.board){
      if(getPlayerAt(tile) || isBlockedTile(tile)) continue;
      if(!withinTileRange(player, tile, cardDef)) continue;
      const d = dist(tile, enemy.pos);
      let score = 20 - d * 3;
      if(d <= basicRange) score += 45;
      if(isSpikeDangerTile(tile) || isTokenDangerTile(tile)) score -= 90;
      if(score > bestScore){ bestScore = score; best = tile; }
    }
    return best ? { tile: best, score: bestScore } : null;
  }

  function chooseAiCardAction(player, enemy){
    let best = null;
    for(const entry of aiCardEntries(player)){
      const cardDef = entry.cardDef;
      const template = cardDef.template;
      if(aiTargetTemplate(template) && withinTargetRange(player, enemy, cardDef)){
        const dmg = aiCardDamageValue(player, cardDef, enemy);
        let score = 95 + dmg * 5 + aiCardControlBonus(cardDef);
        if(enemy.hp <= dmg) score += 600;
        if(template === 'mark_target_for_bonus') score += 36;
        if(template === 'insert_negative_card_into_target_deck') score += 24;
        if(!best || score > best.score) best = { type:'card', entry, target: enemy, score };
      } else if(template === 'aoe' && withinTileRange(player, enemy.pos, cardDef)){
        const dmg = aiCardDamageValue(player, cardDef, enemy);
        let score = 90 + dmg * 5 + aiCardControlBonus(cardDef);
        if(enemy.hp <= dmg) score += 600;
        if(!best || score > best.score) best = { type:'card', entry, tile: enemy.pos, score };
      } else if(template === 'create_map_token'){
        const placement = aiTokenTile(player, enemy, cardDef);
        if(placement && (!best || placement.score > best.score)) best = { type:'card', entry, tile: placement.tile, score: placement.score };
      } else if(template === 'teleport' && !player.turn.move){
        const move = aiTeleportTile(player, enemy, cardDef);
        if(move && move.score > 45 && (!best || move.score > best.score)) best = { type:'card', entry, tile: move.tile, score: move.score };
      } else if(['self_buff','grant_multiple_buffs','transform_basic_attack','summon_token_into_self_deck','pay_life_draw_cards'].includes(template)){
        const score = aiSelfCardScore(player, cardDef);
        if(score > 0 && (!best || score > best.score)) best = { type:'card', entry, score };
      }
    }
    return best;
  }

  function chooseAiMove(player, enemy){
    if(player.turn.move) return null;
    let best = null;
    const basic = getActiveBasicAttack(player);
    const entries = aiCardEntries(player).filter(entry => aiTargetTemplate(entry.cardDef.template) || entry.cardDef.template === 'aoe');
    for(const kk of getReachableTiles(player)){
      const [q,r] = kk.split(',').map(Number);
      const tile = { q, r };
      let score = 80 - dist(tile, enemy.pos) * 5;
      if(isSpikeDangerTile(tile) || isTokenDangerTile(tile) || state.traps.has(key(tile))) score -= 90;
      const sim = Object.assign({}, player, { pos: tile });
      if(dist(tile, enemy.pos) <= Number(basic.range || 1) && (!basic.straight || straight(tile, enemy.pos))) score += 55;
      for(const entry of entries){
        if(entry.cardDef.template === 'aoe'){
          if(withinTileRange(sim, enemy.pos, entry.cardDef)) score += 45;
        } else if(withinTargetRange(sim, enemy, entry.cardDef)){
          score += 52 + aiCardDamageValue(player, entry.cardDef, enemy) * 2;
        }
      }
      if(!best || score > best.score) best = { type:'move', tile, score };
    }
    return best;
  }

  async function executeAiAction(action){
    const p = current();
    if(!action || !p?.alive) return false;
    if(action.type === 'card'){
      await resolveCard(action.entry.index, action.entry.handItem, action.entry.cardDef, action.tile || null, action.target || null);
      return true;
    }
    if(action.type === 'basic'){
      await useBasicAttack(action.target);
      return true;
    }
    if(action.type === 'move'){
      p.turn.move = true;
      p.turn.movedDistance = dist(p.pos, action.tile);
      await movePlayerTo(p, action.tile, { duration: Math.min(640, Math.max(260, 160 * Math.max(1, dist(p.pos, action.tile)))), triggerDestinationEffects: true });
      await applyMovementTriggeredPassives(p);
      finishAfterAction();
      return true;
    }
    return false;
  }

  async function runAiTurn(){
    const p=current(); if(!p.alive || p.type!=='ai' || state.winner || state.pending?.type==='discard') return;
    for(let step = 0; step < 6; step += 1){
      const actor = current();
      const enemy = enemyOf(actor);
      if(!actor?.alive || actor.type !== 'ai' || !enemy?.alive || state.winner || state.pending?.type === 'discard') return;
      let action = chooseAiCardAction(actor, enemy);
      if(!action && actor.turn.basicSpent < 1 + (actor.buffs.extraBasicCap || 0) && canBasicTarget(actor, enemy)) action = { type:'basic', target: enemy, score: 80 + aiAverageDamage(resolvePlayerNotation(actor, getActiveBasicAttack(actor).damage)) * 3 };
      if(!action) action = chooseAiMove(actor, enemy);
      if(!action) break;
      const acted = await executeAiAction(action);
      if(!acted || state.winner || state.pending?.type === 'discard') return;
      await wait(360);
    }
    if(current()?.type === 'ai' && !state.winner && state.pending?.type !== 'discard') endTurn();
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
    if(p.statuses.root>0) p.statuses.root -= 1;
    state.pending = null; state.selectedCardIndex = null; $('choice-panel').innerHTML=''; setMode('待机');
    nextTurn();
  }

  function setupSelectKind(select){
    if(select.id.includes('profession')) return 'profession';
    if(select.id.includes('weapon')) return 'weapon';
    if(select.id.includes('accessory')) return 'accessory';
    return '';
  }

  function setupEntityFor(kind, value, data){
    if(kind === 'profession') return data.professions?.[value] || null;
    if(kind === 'weapon') return data.weaponLibrary?.[value] || null;
    if(kind === 'accessory' && !isNoAccessory(value)) return data.accessoryLibrary?.[value] || null;
    return null;
  }

  function deckTooltipHtml(select){
    const kind = setupSelectKind(select);
    const value = select.value;
    const data = setupRulesetData();
    if(kind === 'accessory' && isNoAccessory(value)){
      return `<div class="deck-tooltip-title">${escapeHtml(I18N().t('no_accessory','无饰品'))}</div><div class="deck-tooltip-meta">${escapeHtml('不会加入饰品牌。')}</div>`;
    }
    const entity = setupEntityFor(kind, value, data);
    if(!entity) return `<div class="deck-tooltip-title">${escapeHtml(select.selectedOptions?.[0]?.textContent || '未选择')}</div><div class="deck-tooltip-meta">${escapeHtml('没有可显示的卡组信息。')}</div>`;
    const title = select.selectedOptions?.[0]?.textContent || entity.name || value;
    const meta = kind === 'profession'
      ? `生命 ${entity.hp ?? '-'} / 移动 ${entity.move ?? '-'} / ${entity.movePreset || 'melee'}`
      : kind === 'weapon'
        ? `${entity.basic?.name || '普攻'}：${entity.basic?.damage || '-'} / 距离 ${entity.basic?.range ?? '-'} / ${entity.basic?.type || '-'}`
        : (entity.name || title);
    const counts = deckCountsFor(kind, entity);
    const rows = Object.entries(counts).map(([cardKey, count]) => {
      const n = Number(count || 0);
      if(n <= 0) return null;
      const card = cardDefForDeck(kind, entity, cardKey, data);
      return { cardKey, count:n, card };
    }).filter(Boolean);
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const list = rows.length
      ? rows.map(row => `<div class="deck-tooltip-card"><span><strong>${escapeHtml(row.card.name || row.cardKey)}</strong><br>${escapeHtml(row.cardKey)} · ${escapeHtml(row.card.template || '-')}</span><span>x${row.count}</span></div>`).join('')
      : `<div class="deck-tooltip-card"><span>${escapeHtml('没有卡牌进入卡组。')}</span><span>x0</span></div>`;
    return `<div class="deck-tooltip-title">${escapeHtml(title)}</div><div class="deck-tooltip-meta">${escapeHtml(meta)}</div><div class="deck-tooltip-total">总卡数：${total}</div><div class="deck-tooltip-list">${list}</div>`;
  }

  function positionDeckTooltip(select){
    const tip = $('deck-tooltip');
    if(!tip) return;
    const rect = select.getBoundingClientRect();
    const gap = 10;
    const width = tip.offsetWidth || 360;
    const height = tip.offsetHeight || 220;
    let left = rect.right + gap;
    let top = rect.top;
    if(left + width > window.innerWidth - 12) left = Math.max(12, rect.left - width - gap);
    if(top + height > window.innerHeight - 12) top = Math.max(12, window.innerHeight - height - 12);
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function showDeckTooltip(select){
    const tip = $('deck-tooltip');
    if(!tip || !select) return;
    tip.innerHTML = deckTooltipHtml(select);
    tip.classList.remove('hidden');
    positionDeckTooltip(select);
  }

  function hideDeckTooltip(){
    const tip = $('deck-tooltip');
    if(tip) tip.classList.add('hidden');
  }

  function bindDeckTooltips(){
    ['p1-profession','p1-weapon','p1-accessory','p2-profession','p2-weapon','p2-accessory'].forEach(id => {
      const sel = $(id);
      if(!sel) return;
      sel.onmouseenter = () => showDeckTooltip(sel);
      sel.onfocus = () => showDeckTooltip(sel);
      sel.onmouseleave = hideDeckTooltip;
      sel.onblur = hideDeckTooltip;
      sel.onchange = () => { if(!$('deck-tooltip')?.classList.contains('hidden')) showDeckTooltip(sel); };
    });
    window.addEventListener('resize', hideDeckTooltip);
    window.addEventListener('scroll', hideDeckTooltip, true);
  }

  function bindActionTooltips(){
    const actions = [
      { id: 'btn-move', title: '移动模式', desc: '进入移动模式，点击棋盘规划路径。' },
      { id: 'btn-basic-attack', title: '普通攻击', desc: '对攻击范围内的敌人发起一次基础武器攻击。' },
      { id: 'btn-cancel', title: '取消选择', desc: '放弃当前选择的动作或卡牌。' },
      { id: 'btn-end-turn', title: '结束回合', desc: '结束你的回合，轮到对手行动。' },
      { id: 'btn-passive', title: '职业被动', desc: '术士专属被动：通过消耗生命值来抽取额外的卡牌。' },
      { id: 'btn-confirm-move', title: '确认移动', desc: '确认并执行当前规划的移动路径。' }
    ];

    const show = (el, title, desc) => {
      const tip = $('deck-tooltip');
      if(!tip) return;
      tip.innerHTML = `<div class="deck-tooltip-title">${escapeHtml(title)}</div><div class="deck-tooltip-meta">${escapeHtml(desc)}</div>`;
      tip.classList.remove('hidden');
      const rect = el.getBoundingClientRect();
      const gap = 10;
      let left = rect.left;
      let top = rect.top - tip.offsetHeight - gap;
      if(top < 10) top = rect.bottom + gap;
      if(left + tip.offsetWidth > window.innerWidth - 12) left = window.innerWidth - tip.offsetWidth - 12;
      tip.style.left = `${Math.max(12, left)}px`;
      tip.style.top = `${Math.max(12, top)}px`;
    };

    actions.forEach(act => {
      const el = $(act.id);
      if(!el) return;
      el.onmouseenter = () => show(el, act.title, act.desc);
      el.onmouseleave = hideDeckTooltip;
      // Mobile support
      el.ontouchstart = (e) => {
        // Prevent click but show tooltip
        show(el, act.title, act.desc);
        setTimeout(hideDeckTooltip, 3000);
      };
    });
  }

  function clampBoardZoom(value){
    const min = window.innerWidth < 720 ? 0.28 : 0.38;
    const max = window.innerWidth < 720 ? 0.9 : 1.25;
    return Math.max(min, Math.min(max, Number(value || state.boardZoom || 0.7)));
  }

  function setBoardZoom(value, auto = false){
    state.boardZoom = clampBoardZoom(value);
    state.boardZoomAuto = !!auto;
    const board = $('board');
    if(board){
      board.style.width = `${Math.round(BOARD_VIEW.width * state.boardZoom)}px`;
      board.style.height = `${Math.round(BOARD_VIEW.height * state.boardZoom)}px`;
    }
    const label = $('board-zoom-label');
    if(label) label.textContent = `${Math.round(state.boardZoom * 100)}%`;
    if(auto) centerBoardViewport();
  }

  function bindBoardTouchGestures(){
    const wrap = $('board-wrap');
    if(!wrap) return;

    let initialDist = 0;
    let initialZoom = 1;
    let startX = 0, startY = 0;
    let startScrollX = 0, startScrollY = 0;

    wrap.addEventListener('touchstart', e => {
      if(e.touches.length === 2){
        initialDist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        initialZoom = state.boardZoom;
      } else if(e.touches.length === 1){
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
        startScrollX = wrap.scrollLeft;
        startScrollY = wrap.scrollTop;
      }
    }, { passive: false });

    wrap.addEventListener('touchmove', e => {
      if(e.touches.length === 2){
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        if(initialDist > 0){
          const zoomDelta = dist / initialDist;
          setBoardZoom(initialZoom * zoomDelta, false);
        }
      } else if(e.touches.length === 1){
        e.preventDefault();
        const dx = e.touches[0].pageX - startX;
        const dy = e.touches[0].pageY - startY;
        wrap.scrollLeft = startScrollX - dx;
        wrap.scrollTop = startScrollY - dy;
      }
    }, { passive: false });
  }

  function centerBoardViewport(){
    const wrap = $('board-wrap');
    if(!wrap) return;
    requestAnimationFrame(() => {
      const overflowX = wrap.scrollWidth - wrap.clientWidth;
      if(overflowX > 2) wrap.scrollLeft = Math.round(overflowX / 2);
    });
  }

  function fitBoardZoom(){
    const wrap = $('board-wrap');
    if(!wrap || wrap.offsetParent === null) {
      setBoardZoom(state.boardZoom, state.boardZoomAuto);
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    const availableW = Math.max(360, wrap.clientWidth - 18);
    const handReserve = window.innerWidth < 720 ? 154 : 118;
    const availableH = Math.max(300, window.innerHeight - wrapRect.top - handReserve);
    const fitted = Math.min(availableW / BOARD_VIEW.width, availableH / BOARD_VIEW.height);
    const compactLandscape = window.innerHeight <= 520 && window.innerWidth > window.innerHeight;
    const preferredMin = compactLandscape ? 0.34 : window.innerWidth >= 1500 ? 0.82 : window.innerWidth >= 1000 ? 0.68 : window.innerWidth >= 720 ? 0.54 : window.innerWidth >= 520 ? 0.38 : 0.32;
    const fit = Math.max(preferredMin, fitted);
    setBoardZoom(fit, true);
  }

  function bindBoardZoomControls(){
    setBoardZoom(state.boardZoom, true);
    const out = $('board-zoom-out');
    const inn = $('board-zoom-in');
    const fit = $('board-zoom-fit');
    if(out) out.onclick = () => setBoardZoom(state.boardZoom - 0.08, false);
    if(inn) inn.onclick = () => setBoardZoom(state.boardZoom + 0.08, false);
    if(fit) fit.onclick = fitBoardZoom;
    window.addEventListener('resize', () => {
      if(state.boardZoomAuto) fitBoardZoom();
      else setBoardZoom(state.boardZoom, false);
      layoutActionButtons();
      if(state.players.length) renderHand();
    });
  }

  function setArenaBackgroundFile(file){
    if(!file || !file.type?.startsWith('image/')) return;
    if(state.customArenaBackdropUrl) URL.revokeObjectURL(state.customArenaBackdropUrl);
    state.customArenaBackdropUrl = URL.createObjectURL(file);
    state.customArenaBackdropName = file.name || '';
    syncArenaScreenBackdrop();
    const label = $('arena-bg-name');
    if(label) label.textContent = state.customArenaBackdropName || '本地背景';
    if(state.board?.length && $('board')) renderBoard();
  }

  function resetArenaBackground(){
    if(state.customArenaBackdropUrl) URL.revokeObjectURL(state.customArenaBackdropUrl);
    state.customArenaBackdropUrl = null;
    state.customArenaBackdropName = '';
    syncArenaScreenBackdrop();
    const input = $('arena-bg-input');
    if(input) input.value = '';
    const label = $('arena-bg-name');
    if(label) label.textContent = '默认背景';
    if(state.board?.length && $('board')) renderBoard();
  }

  function bindArenaBackgroundControls(){
    const input = $('arena-bg-input');
    const clear = $('arena-bg-clear');
    if(input) input.onchange = () => setArenaBackgroundFile(input.files?.[0]);
    if(clear) clear.onclick = resetArenaBackground;
  }

  function fillSetupSelect(id, obj, kind, includeNone = false){
    const sel=$(id);
    sel.innerHTML='';
    if(includeNone){
      const none=document.createElement('option');
      none.value=NO_ACCESSORY;
      none.textContent=I18N().t('no_accessory','无饰品');
      sel.appendChild(none);
    }
    Object.entries(obj || {}).forEach(([k,v])=>{
      const o=document.createElement('option');
      o.value=k;
      o.textContent=I18N().entity(kind, k, v.name);
      sel.appendChild(o);
    });
  }

  function setSetupValue(id, preferred){
    const sel=$(id);
    const values = Array.from(sel.options).map(o=>o.value);
    if(values.includes(preferred)) sel.value = preferred;
    else if(sel.options[0]) sel.value = sel.options[0].value;
  }

  function populateSetup(preferredRulesetId){
    const rulesets = STUDIO_RUNTIME.loadRulesets(); const rsSel = $('ruleset-select'); rsSel.innerHTML='';
    rulesets.forEach(rs=>{ const o=document.createElement('option'); o.value=rs.id; o.textContent=rs.name; rsSel.appendChild(o); });
    const selectedId = preferredRulesetId || rsSel.value || STUDIO_RUNTIME.getActiveRulesetId();
    rsSel.value = rulesets.some(rs => rs.id === selectedId) ? selectedId : STUDIO_RUNTIME.getActiveRulesetId();
    STUDIO_RUNTIME.setActiveRulesetId(rsSel.value);
    const data = STUDIO_RUNTIME.findRuleset(rsSel.value).data;
    fillSetupSelect('p1-profession', data.professions, 'profession');
    fillSetupSelect('p2-profession', data.professions, 'profession');
    fillSetupSelect('p1-weapon', data.weaponLibrary, 'weapon');
    fillSetupSelect('p2-weapon', data.weaponLibrary, 'weapon');
    fillSetupSelect('p1-accessory', data.accessoryLibrary, 'accessory', true);
    fillSetupSelect('p2-accessory', data.accessoryLibrary, 'accessory', true);
    setSetupValue('p1-profession','warrior'); setSetupValue('p1-weapon','greatsword'); setSetupValue('p1-accessory','trapbag');
    setSetupValue('p2-profession','mage'); setSetupValue('p2-weapon','longbow'); setSetupValue('p2-accessory','lincoln');
    const defaults = data.ruleDefaults || {};
    if($('black-hole-enabled')) $('black-hole-enabled').value = 'true';
    if($('draw-opening')) $('draw-opening').value = clampInt(defaults.drawOpening ?? DEFAULT_MATCH_OPTIONS.drawOpening, DEFAULT_MATCH_OPTIONS.drawOpening);
    if($('draw-per-turn')) $('draw-per-turn').value = clampInt(defaults.drawPerTurn ?? DEFAULT_MATCH_OPTIONS.drawPerTurn, DEFAULT_MATCH_OPTIONS.drawPerTurn);
  }

  function bind(){
    $('start-game').onclick = startGame;
    $('btn-move').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } state.pending={type:'move', path:[]}; setMode('移动模式'); render(); setHint('请逐格点击绘制移动路线，再点确认移动。'); };
    if($('btn-confirm-move')) $('btn-confirm-move').onclick = confirmMovePath;
    $('btn-basic-attack').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } state.pending={type:'basic'}; setMode('普通攻击'); render(); setHint('请选择普通攻击目标。'); };
    $('btn-passive').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } useProfessionPassive(); };
    $('btn-cancel').onclick = ()=>{ if(state.pending?.type==='discard'){ setHint(`请先弃牌至 ${handLimit()} 张。`); return; } state.pending=null; state.selectedCardIndex=null; $('choice-panel').innerHTML=''; setMode('待机'); render(); setHint('已取消当前选择。'); };
    $('btn-end-turn').onclick = endTurn;
    $('btn-restart').onclick = ()=>location.reload();
    if ($('btn-export-battle-log')) $('btn-export-battle-log').onclick = exportBattleLog;
    if ($('btn-export-debug-log')) $('btn-export-debug-log').onclick = exportDebugBundle;
    if ($('btn-mute')) $('btn-mute').onclick = () => setAudioMuted(!audioState.muted);
    $('ruleset-select').onchange = () => populateSetup($('ruleset-select').value);
    bindBoardZoomControls();
    bindBoardTouchGestures();
    bindArenaBackgroundControls();
    bindDeckTooltips();
    bindActionTooltips();
    initAudioSettings();
    bindMenuLogic();
  }

  function bindMenuLogic(){
    const menuPanel = $('game-menu-panel');
    const toggleBtn = $('btn-menu-toggle');
    const closeBtn = $('btn-menu-close');
    const toggleLogBtn = $('btn-toggle-log');
    const logPanel = $('battle-log-panel');

    if(toggleBtn) toggleBtn.onclick = () => menuPanel.classList.toggle('hidden');
    if(closeBtn) closeBtn.onclick = () => menuPanel.classList.add('hidden');
    if(toggleLogBtn) toggleLogBtn.onclick = () => {
      logPanel.classList.toggle('visible');
      toggleLogBtn.textContent = logPanel.classList.contains('visible') ? '隐藏战斗日志' : '显示战斗日志';
    };
  }
  (async()=>{
    await STUDIO_RUNTIME.init();
    populateSetup();
    bind();
    window.addEventListener('studio-language-changed', () => { populateSetup($('ruleset-select').value); if(state.players.length) render(); if(window.STUDIO_I18N) STUDIO_I18N.applyPage(); });
  })();
})();
