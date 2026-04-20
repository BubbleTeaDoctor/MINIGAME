/**
 * ui_layout.js — Draggable & Resizable UI Layout Editor
 *
 * - Most panels: resize via width/height
 * - Player status panels: resize via transform:scale() (content is JS-rendered)
 * Saves positions + sizes/scale to localStorage.
 */

(function () {
  const STORAGE_KEY = 'arena_ui_layout_v2';

  const DRAGGABLE_IDS = [
    'action-panel',
    'menu-btn-container',
    'player-info',
    'player-info-rival',
    'battle-log-panel',
    'hand-panel-head',
    'selection-hint',
  ];

  // These use transform:scale() instead of width/height
  const SCALE_IDS = new Set(['player-info', 'player-info-rival']);

  // ── Persistence ────────────────────────────────────────────────────────

  function saveLayout() {
    const layout = {};
    DRAGGABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      layout[id] = {
        left: el.style.left || '',
        top: el.style.top || '',
        width: el.style.width || '',
        height: el.style.height || '',
        scale: el.dataset.uiScale || '',
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }

  function loadLayout() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const layout = JSON.parse(raw);
      DRAGGABLE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !layout[id]) return;
        const pos = layout[id];
        if (pos.left) { el.style.left = pos.left; el.style.right = ''; }
        if (pos.top)  { el.style.top = pos.top; el.style.bottom = ''; }
        if (SCALE_IDS.has(id)) {
          if (pos.scale) {
            el.dataset.uiScale = pos.scale;
            el.style.transform = 'scale(' + pos.scale + ')';
            el.style.transformOrigin = 'top left';
          }
        } else {
          if (pos.width)  el.style.width = pos.width;
          if (pos.height) el.style.height = pos.height;
        }
        // Ensure it's not completely off-screen after loading
        clampToViewport(el);
      });
    } catch (e) {
      console.warn('[ui_layout] Failed to load layout:', e);
    }
  }

  function clampToViewport(el) {
    if (!el || el.offsetParent === null) return; // Skip hidden elements
    
    const scale = parseFloat(el.dataset.uiScale) || 1;
    const w = el.offsetWidth * scale;
    const h = el.offsetHeight * scale;
    const rect = el.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const margin = 10;
    
    let newLeft = rect.left;
    let newTop = rect.top;
    let changed = false;

    // If completely off to the right or bottom
    if (newLeft > winW - margin) { newLeft = winW - w - margin; changed = true; }
    if (newTop > winH - margin) { newTop = winH - h - margin; changed = true; }
    
    // If off to the left or top
    if (newLeft < 0) { newLeft = 0; changed = true; }
    if (newTop < 0) { newTop = 0; changed = true; }

    if (changed) {
      el.style.left = px(newLeft);
      el.style.top = px(newTop);
      el.style.right = '';
      el.style.bottom = '';
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  let activeOp = null;

  function px(v) { return Math.round(v) + 'px'; }

  function clientXY(e) {
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX, y: src.clientY };
  }

  // ── Drag ────────────────────────────────────────────────────────────────

  function startDrag(e, el) {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = clientXY(e);
    const rect = el.getBoundingClientRect();
    el.style.left = px(rect.left);
    el.style.top = px(rect.top);
    el.style.right = '';
    el.style.bottom = '';
    activeOp = { el, mode: 'drag', startX: x, startY: y, origLeft: rect.left, origTop: rect.top };
  }

  // ── Resize ──────────────────────────────────────────────────────────────

  function startResize(e, el) {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = clientXY(e);
    const isScale = SCALE_IDS.has(el.id);
    activeOp = {
      el,
      mode: 'resize',
      isScale,
      startX: x,
      startY: y,
      origW: el.offsetWidth,
      origH: el.offsetHeight,
      origScale: parseFloat(el.dataset.uiScale) || 1,
    };
  }

  function onPointerMove(e) {
    if (!activeOp) return;
    e.preventDefault();
    const { x, y } = clientXY(e);
    const dx = x - activeOp.startX;
    const dy = y - activeOp.startY;

    if (activeOp.mode === 'drag') {
      let newLeft = activeOp.origLeft + dx;
      let newTop = activeOp.origTop + dy;
      const el = activeOp.el;
      const scale = parseFloat(el.dataset.uiScale) || 1;
      const w = el.offsetWidth * scale;
      const h = el.offsetHeight * scale;
      newLeft = Math.max(0, Math.min(window.innerWidth - w, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - h, newTop));
      el.style.left = px(newLeft);
      el.style.top = px(newTop);
    } else if (activeOp.mode === 'resize') {
      if (activeOp.isScale) {
        // Scale mode for player status panels
        const diag = (dx + dy) / 2;
        const visualW = activeOp.origW * activeOp.origScale;
        const newVisualW = Math.max(60, visualW + diag);
        const newScale = Math.max(0.3, Math.min(3, newVisualW / activeOp.origW));
        const rounded = Math.round(newScale * 100) / 100;
        activeOp.el.dataset.uiScale = rounded;
        activeOp.el.style.transform = 'scale(' + rounded + ')';
        activeOp.el.style.transformOrigin = 'top left';
      } else {
        // Width/height mode for other panels
        const newW = Math.max(60, activeOp.origW + dx);
        const newH = Math.max(30, activeOp.origH + dy);
        activeOp.el.style.width = px(newW);
        activeOp.el.style.height = px(newH);
      }
    }
  }

  function onPointerEnd() {
    activeOp = null;
  }

  // ── Resize Handles ─────────────────────────────────────────────────────

  const resizeHandles = [];

  function createResizeHandle(parentEl) {
    const handle = document.createElement('div');
    handle.className = 'ui-resize-handle';
    handle.title = SCALE_IDS.has(parentEl.id) ? '拖拽缩放' : '拖拽调整大小';
    parentEl.appendChild(handle);
    resizeHandles.push(handle);
    const onMouse = e => startResize(e, parentEl);
    const onTouch = e => startResize(e, parentEl);
    handle.addEventListener('mousedown', onMouse);
    handle.addEventListener('touchstart', onTouch, { passive: false });
    handle._handlers = { mousedown: onMouse, touchstart: onTouch };
  }

  function removeAllResizeHandles() {
    resizeHandles.forEach(handle => {
      if (handle._handlers) {
        handle.removeEventListener('mousedown', handle._handlers.mousedown);
        handle.removeEventListener('touchstart', handle._handlers.touchstart);
      }
      handle.remove();
    });
    resizeHandles.length = 0;
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────

  let editModeActive = false;
  const dragHandlers = new Map();

  function enterEditMode() {
    editModeActive = true;
    document.body.classList.add('ui-edit-mode');

    const menuPanel = document.getElementById('game-menu-panel');
    if (menuPanel) menuPanel.classList.add('hidden');

    const confirmBtn = document.getElementById('btn-confirm-layout');
    if (confirmBtn) confirmBtn.classList.remove('hidden');

    DRAGGABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 'battle-log-panel') el.classList.add('edit-mode-visible');

      const onMouseDown = e => {
        if (!editModeActive) return;
        if (e.target.classList.contains('ui-resize-handle')) return;
        startDrag(e, el);
      };
      const onTouchStart = e => {
        if (!editModeActive) return;
        if (e.target.classList.contains('ui-resize-handle')) return;
        startDrag(e, el);
      };
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('touchstart', onTouchStart, { passive: false });
      dragHandlers.set(id, { mousedown: onMouseDown, touchstart: onTouchStart });

      createResizeHandle(el);
    });

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerEnd);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerEnd);
  }

  function exitEditMode() {
    editModeActive = false;
    document.body.classList.remove('ui-edit-mode');

    const confirmBtn = document.getElementById('btn-confirm-layout');
    if (confirmBtn) confirmBtn.classList.add('hidden');

    const logPanel = document.getElementById('battle-log-panel');
    if (logPanel) logPanel.classList.remove('edit-mode-visible');

    DRAGGABLE_IDS.forEach(id => {
      const el = document.getElementById(id);
      const handlers = dragHandlers.get(id);
      if (!el || !handlers) return;
      el.removeEventListener('mousedown', handlers.mousedown);
      el.removeEventListener('touchstart', handlers.touchstart);
    });
    dragHandlers.clear();
    removeAllResizeHandles();

    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerEnd);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerEnd);

    saveLayout();
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────

  function init() {
    loadLayout();
    const editBtn = document.getElementById('btn-edit-layout');
    if (editBtn) editBtn.addEventListener('click', enterEditMode);
    const confirmInner = document.getElementById('btn-confirm-layout-inner');
    if (confirmInner) confirmInner.addEventListener('click', exitEditMode);

    const resetBtn = document.getElementById('btn-reset-layout');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('确定要重置所有 UI 面板的位置吗？')) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
    }

    // Initial load might fail to clamp if game screen is hidden, 
    // so we try again when a click happens (user interaction)
    document.addEventListener('click', () => {
      DRAGGABLE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.style.left && el.offsetParent !== null) clampToViewport(el);
      });
    }, { once: true });

    window.addEventListener('resize', () => {
      DRAGGABLE_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.style.left && el.offsetParent !== null) clampToViewport(el);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
