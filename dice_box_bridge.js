(function(){
  const pageBaseUrl = new URL('.', document.baseURI || window.location.href).href;
  const DICE_BOX_VERSION = '1.1.4';
  const DICE_BOX_THEME_VERSION = '0.2.1';
  const DICE_BOX_BUNDLE_URL = new URL('./assets/dice-box/dice-box.es.js?v=20260423e', pageBaseUrl).href;
  const DICE_BOX_ASSET_PATH = new URL('./assets/dice-box/', pageBaseUrl).href;
  const DICE_OF_ROLLING_URL = new URL('./assets/dice-box/themes/diceOfRolling/', pageBaseUrl).href;
  const HOST_ID = 'dice-box-host';

  const bridgeState = {
    DiceBoxCtor: null,
    ctorPromise: null,
    box: null,
    initPromise: null,
    lastError: null,
    lastInfo: null,
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

  function waitFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  async function waitForHostReady() {
    let host = updateHostResolution();
    if (!host) throw new Error(`Dice Box host #${HOST_ID} not found`);
    await waitFrame();
    await waitFrame();
    host = updateHostResolution() || host;
    if (host.clientWidth < 8 || host.clientHeight < 8) {
      throw new Error(`Dice Box host has invalid size ${host.clientWidth}x${host.clientHeight}`);
    }
    return host;
  }

  async function loadDiceBoxCtor() {
    if (bridgeState.DiceBoxCtor) return bridgeState.DiceBoxCtor;
    if (!bridgeState.ctorPromise) {
      bridgeState.ctorPromise = (async () => {
        bridgeState.lastInfo = `bundle-import:${DICE_BOX_BUNDLE_URL}`;
        const module = await import(DICE_BOX_BUNDLE_URL);
        const ctor = module?.default;
        if (typeof ctor !== 'function') {
          throw new Error('Dice Box bundle loaded but default export is not a constructor');
        }
        bridgeState.DiceBoxCtor = ctor;
        bridgeState.lastInfo = 'bundle:ok';
        return ctor;
      })().catch(error => {
        bridgeState.lastError = error?.stack || error?.message || String(error);
        bridgeState.ctorPromise = null;
        throw error;
      });
    }
    return bridgeState.ctorPromise;
  }

  async function ensureDiceBox() {
    if (bridgeState.box) return bridgeState.box;
    if (!bridgeState.initPromise) {
      bridgeState.initPromise = (async () => {
        await waitForHostReady();
        const DiceBox = await loadDiceBoxCtor();
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
          suspendSimulation: false,
          onThemeConfigLoaded(themeData) {
            bridgeState.lastInfo = `theme-config:${themeData?.systemName || themeData?.name || 'unknown'}`;
          },
          onThemeLoaded(themeData) {
            bridgeState.lastInfo = `theme-loaded:${themeData?.systemName || themeData?.name || 'unknown'}`;
          },
        });
        await box.init();
        box.hide('dice-box-canvas--hide');
        bridgeState.box = box;
        bridgeState.lastInfo = 'init:ok';
        return box;
      })().catch(error => {
        bridgeState.lastError = error?.stack || error?.message || String(error);
        bridgeState.initPromise = null;
        console.error('[dice-box] init failed', error);
        throw error;
      });
    }
    return bridgeState.initPromise;
  }

  async function roll(notation) {
    try {
      await waitForHostReady();
      const box = await ensureDiceBox();
      updateHostResolution();
      box.show();
      if (typeof box.resizeWorld === 'function') box.resizeWorld();
      await box.updateConfig({
        theme: 'diceOfRolling',
        scale: rollScale(),
        offscreen: false,
        suspendSimulation: false,
      });
      bridgeState.lastError = null;
      const results = await box.roll(notation, { theme: 'diceOfRolling' });
      bridgeState.lastInfo = `roll:${notation}:${Array.isArray(results) ? results.length : 0}`;
      return results;
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
      themeVersion: DICE_BOX_THEME_VERSION,
      theme: 'diceOfRolling',
      pageBaseUrl,
      bundleUrl: DICE_BOX_BUNDLE_URL,
      assetPath: DICE_BOX_ASSET_PATH,
      themeUrl: DICE_OF_ROLLING_URL,
    },
    get lastError() {
      return bridgeState.lastError;
    },
    get lastInfo() {
      return bridgeState.lastInfo;
    },
  };

  window.addEventListener('load', () => {
    ensureDiceBox().catch(() => {});
  });
})();
