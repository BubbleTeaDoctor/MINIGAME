import DiceBox from 'https://unpkg.com/@3d-dice/dice-box@1.1.4/dist/dice-box.es.js';

const DICE_BOX_VERSION = '1.1.4';
const DICE_BOX_THEME_VERSION = '0.2.1';
const DICE_BOX_ASSET_PATH = `https://unpkg.com/@3d-dice/dice-box@${DICE_BOX_VERSION}/dist/assets/`;
const DICE_OF_ROLLING_URL = `https://unpkg.com/@3d-dice/theme-dice-of-rolling@${DICE_BOX_THEME_VERSION}`;
const HOST_ID = 'dice-box-host';

const bridgeState = {
  box: null,
  initPromise: null,
  lastError: null,
};

function renderScale() {
  const dpr = Number(window.devicePixelRatio || 1);
  return Math.max(1, Math.min(2, dpr));
}

function baseRollScale() {
  return window.innerWidth <= 860 ? 4.1 : 5.1;
}

function rollScale() {
  return baseRollScale() * renderScale();
}

function updateHostResolution() {
  const host = document.getElementById(HOST_ID);
  if (!host) return null;
  host.style.setProperty('--dice-render-scale', String(renderScale()));
  return host;
}

async function ensureDiceBox() {
  if (bridgeState.box) return bridgeState.box;
  if (!bridgeState.initPromise) {
    bridgeState.initPromise = (async () => {
      const host = updateHostResolution();
      if (!host) throw new Error(`Dice Box host #${HOST_ID} not found`);
      bridgeState.lastError = null;
      const box = new DiceBox({
        container: `#${HOST_ID}`,
        assetPath: DICE_BOX_ASSET_PATH,
        origin: '',
        theme: 'diceOfRolling',
        preloadThemes: ['diceOfRolling'],
        externalThemes: {
          diceOfRolling: DICE_OF_ROLLING_URL,
        },
        enableShadows: true,
        shadowTransparency: 0.72,
        lightIntensity: 1.3,
        delay: 18,
        offscreen: false,
        scale: rollScale(),
      });
      await box.init();
      box.hide('dice-box-canvas--hide');
      bridgeState.box = box;
      return box;
    })().catch(error => {
      bridgeState.lastError = error?.stack || error?.message || String(error);
      console.error('[dice-box] init failed', error);
      bridgeState.initPromise = null;
      throw error;
    });
  }
  return bridgeState.initPromise;
}

async function roll(notation) {
  try {
    const box = await ensureDiceBox();
    updateHostResolution();
    box.show();
    await box.updateConfig({
      theme: 'diceOfRolling',
      scale: rollScale(),
      offscreen: false,
    });
    bridgeState.lastError = null;
    return box.roll(notation, { theme: 'diceOfRolling' });
  } catch (error) {
    bridgeState.lastError = error?.stack || error?.message || String(error);
    console.error('[dice-box] roll failed', error);
    throw error;
  }
}

function hide() {
  if (!bridgeState.box) return;
  bridgeState.box.hide('dice-box-canvas--hide');
  bridgeState.box.clear();
}

window.DICE_BOX_BRIDGE = {
  ready: ensureDiceBox,
  roll,
  hide,
  config: {
    version: DICE_BOX_VERSION,
    theme: 'diceOfRolling',
    assetPath: DICE_BOX_ASSET_PATH,
    themeUrl: DICE_OF_ROLLING_URL,
  },
  get lastError() {
    return bridgeState.lastError;
  },
};
