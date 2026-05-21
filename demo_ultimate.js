const $ = id => document.getElementById(id) || document.querySelector(id);
const escapeHtml = (unsafe) => String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ULTIMATE_CUTIN_DEFAULTS = {
  duration: 2850,
  hitStop: 250,
  introDelay: 250,
  voiceDelay: 900,
  titleDelay: 1400,
  finalDelay: 2200,
  shakeIntensity: 30,
  flashAlpha: 1,
  portraitScale: 1.12,
  portraitEnterScale: 1.48,
  portraitPosition: 'center center',
  particleCount: 84,
  crackAngle: -18,
  shockwaveSize: 2.25
};

let ultimateCutInTimer = null;
let ultimateCutInTimers = [];

function clearUltimateCutIn(){
  const layer = $('ultimate-cutin-layer');
  if(ultimateCutInTimer){
    clearTimeout(ultimateCutInTimer);
    ultimateCutInTimer = null;
  }
  ultimateCutInTimers.forEach(timer => clearTimeout(timer));
  ultimateCutInTimers = [];
  document.body.classList.remove('ultimate-hitstop');
  if(layer){
    layer.classList.add('hidden');
    layer.innerHTML = '';
  }
}

function queueUltimateCutIn(delay, fn){
  const timer = setTimeout(() => {
    ultimateCutInTimers = ultimateCutInTimers.filter(x => x !== timer);
    fn();
  }, delay);
  ultimateCutInTimers.push(timer);
}

function activateUltimateText(layer, selector){
  const node = layer?.querySelector(selector);
  if(!node) return;
  node.classList.remove('is-active');
  void node.offsetWidth;
  node.classList.add('is-active');
}

function playUltimateVoice(callout){
  if(!callout?.voiceKey) return;
  console.log('Playing voice:', callout.voiceKey);
  const src = `assets/audio/ultimate/${callout.voiceKey}.mp3`;
  try {
    const a = new Audio(src);
    a.volume = 0.92;
    a.play().catch(e => console.warn('Audio play prevented:', e));
  } catch(e){}
}

function ultimateParticles(count, kind){
  return Array.from({ length: count }, (_, i) => {
    const spread = (i / Math.max(1, count - 1)) * Math.PI * 2;
    const distance = kind === 'shard' ? 40 + Math.random() * 66 : 28 + Math.random() * 54;
    const tx = Math.cos(spread) * distance + (Math.random() - 0.5) * 58;
    const ty = Math.sin(spread) * distance + (Math.random() - 0.5) * 50;
    const rot = Math.round((Math.random() * 2 - 1) * 240);
    const delay = Math.round(220 + Math.random() * 340);
    const dur = Math.round(1420 + Math.random() * 820);
    const size = kind === 'shard' ? Math.round(10 + Math.random() * 22) : Math.round(4 + Math.random() * 10);
    return `<i class="ultimate-${kind}" style="--i:${i};--tx:${tx.toFixed(1)}vw;--ty:${ty.toFixed(1)}vh;--rot:${rot}deg;--delay:${delay}ms;--dur:${dur}ms;--size:${size}px"></i>`;
  }).join('');
}

// THE MODIFIED FUNCTION
function playUltimateCutIn(characterPortrait, options = {}){
  document.getElementById('error-log').style.display = 'block';
  document.getElementById('error-log').innerHTML += 'playUltimateCutIn called<br>';
  const layer = $('ultimate-cutin-layer');
  if(!layer || !characterPortrait?.src || ultimateCutInTimer) {
     document.getElementById('error-log').innerHTML += 'Returned early: ' + (!layer) + ', ' + (!characterPortrait?.src) + ', ' + (!!ultimateCutInTimer) + '<br>';
     return;
  }
  const config = { ...ULTIMATE_CUTIN_DEFAULTS, ...options };
  const side = characterPortrait.side === 'right' ? 'right' : 'left';
  const name = characterPortrait.name || '';
  const damage = Number(characterPortrait.damage || 0);
  const callout = characterPortrait.callout || null;
  
  const introLine = callout?.introLine || '';
  const ultimateName = callout?.ultimateName || name;
  const voiceDurationMs = Number(callout?.voiceDurationMs || 0);

  // STAGE 1 TIMING
  // 动态计算前置时长，最少1500ms
  const preIntroDuration = Math.max(1500, voiceDurationMs - config.duration + 400);

  // STAGE 2 TIMING
  // 语音剩余时长（因为第一阶段已经播了 preIntroDuration 的语音）
  const remainingVoiceDuration = Math.max(0, voiceDurationMs - preIntroDuration);
  const stage2Duration = Math.max(config.duration, remainingVoiceDuration + 650);

  const titleTextDuration = Math.max(2300, stage2Duration - config.titleDelay - 520);

  const particles = ultimateParticles(config.particleCount, 'particle');
  const shards = ultimateParticles(Math.max(18, Math.round(config.particleCount * 0.75)), 'shard');

  layer.className = `ultimate-cutin-layer side-${side} class-${name.toLowerCase()}`;
  
  // ============================================
  // STAGE 1: Black Screen + Intro Line + Effects
  // ============================================
  layer.style.setProperty('--ultimate-intro-text-duration', `${preIntroDuration}ms`);
  
  layer.innerHTML = `
    <div class="ultimate-black-bg"></div>
    <div class="ultimate-pre-glow"></div>
    <div class="ultimate-pre-embers"></div>
    <div class="ultimate-intro-container">
      <div class="ultimate-callout ultimate-intro-line is-active">${escapeHtml(introLine)}</div>
    </div>
  `;
  
  document.body.classList.add('ultimate-hitstop');
  setTimeout(() => document.body.classList.remove('ultimate-hitstop'), config.hitStop);
  
  // Play Voice Immediately
  playUltimateVoice(callout);

  // Disable layer animation for Stage 1 so it doesn't shake or fade out
  layer.style.animation = 'none';
  layer.style.opacity = '1';

  // ============================================
  // STAGE 2: Main Cut-in (Triggered later)
  // ============================================
  queueUltimateCutIn(preIntroDuration, () => {
    // 设置 Stage 2 的 CSS 变量
    layer.style.setProperty('--ultimate-duration', `${stage2Duration}ms`);
    layer.style.setProperty('--ultimate-title-text-duration', `${titleTextDuration}ms`);
    
    // Restart the layer animation for Stage 2
    layer.style.animation = 'none';
    void layer.offsetWidth; // trigger reflow
    layer.style.animation = '';

    layer.style.setProperty('--ultimate-shake', `${config.shakeIntensity}px`);
    layer.style.setProperty('--ultimate-shake-a', `${config.shakeIntensity * -0.4}px`);
    layer.style.setProperty('--ultimate-shake-b', `${config.shakeIntensity * 0.65}px`);
    layer.style.setProperty('--ultimate-shake-c', `${config.shakeIntensity * -0.52}px`);
    layer.style.setProperty('--ultimate-shake-d', `${config.shakeIntensity * 0.32}px`);
    layer.style.setProperty('--ultimate-flash-alpha', String(config.flashAlpha));
    layer.style.setProperty('--ultimate-portrait-scale', String(config.portraitScale));
    layer.style.setProperty('--ultimate-portrait-pop-scale', String(config.portraitScale * 1.1));
    layer.style.setProperty('--ultimate-portrait-settle-scale', String(config.portraitScale * 1.02));
    layer.style.setProperty('--ultimate-portrait-enter-scale', String(config.portraitEnterScale));
    layer.style.setProperty('--ultimate-portrait-position', config.portraitPosition);
    layer.style.setProperty('--ultimate-crack-angle', `${config.crackAngle}deg`);
    layer.style.setProperty('--ultimate-shockwave-size', String(config.shockwaveSize));
    layer.style.setProperty('--ultimate-shockwave-end-size', String(config.shockwaveSize * 1.35));

    // 覆盖 innerHTML 触发全新的动画流（并且不再含有 introLine）
    layer.innerHTML = `
      <div class="ultimate-dim"></div>
      <div class="ultimate-crack-layer">
        <div class="ultimate-crack">
          <span class="ultimate-crack-core"></span>
          <span class="ultimate-crack-edge edge-a"></span>
          <span class="ultimate-crack-edge edge-b"></span>
          <span class="ultimate-crack-branch branch-a"></span>
          <span class="ultimate-crack-branch branch-b"></span>
          <span class="ultimate-crack-branch branch-c"></span>
          <span class="ultimate-crack-branch branch-d"></span>
        </div>
      </div>
      <div class="ultimate-fx-layer">
        <div class="ultimate-energy-bloom"></div>
        <div class="ultimate-shockwave"></div>
        <div class="ultimate-shockwave secondary"></div>
        <div class="ultimate-sparks">${particles}</div>
        <div class="ultimate-shards">${shards}</div>
      </div>
      <figure class="ultimate-cutin-afterimage afterimage-a">
        <img src="${escapeHtml(characterPortrait.src)}" alt="">
      </figure>
      <figure class="ultimate-cutin-afterimage afterimage-b">
        <img src="${escapeHtml(characterPortrait.src)}" alt="">
      </figure>
      <figure class="ultimate-cutin-art">
        <img src="${escapeHtml(characterPortrait.src)}" alt="${escapeHtml(name)} ultimate">
      </figure>
      
      <div class="ultimate-title-burst">
        <span class="ultimate-title-shadow">${escapeHtml(ultimateName)}</span>
        <strong>${escapeHtml(ultimateName)}</strong>
      </div>
      
      <div class="ultimate-cutin-copy">
        <span>${escapeHtml(name)}</span>
        ${damage > 0 ? `<strong>${Math.round(damage)}</strong>` : ''}
      </div>
      <div class="ultimate-speed-layer"></div>
      <div class="ultimate-impact-frame"></div>
      <div class="ultimate-flash"></div>
    `;

    // 重新排布后面的动画出现时机
    queueUltimateCutIn(config.titleDelay, () => activateUltimateText(layer, '.ultimate-title-burst'));

    // 设置清理定时器
    ultimateCutInTimer = setTimeout(() => {
      clearUltimateCutIn();
    }, stage2Duration);
  });
}
