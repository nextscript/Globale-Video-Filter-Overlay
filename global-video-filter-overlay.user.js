// ==UserScript==
// @name         Global Video Filter Overlay
// @name:de      Globale Video Filter Overlay
// @namespace    gvf
// @author       Freak288
// @version      1.1.1
// @description  Global Video Filter Overlay enhances any HTML5 video in your browser with real-time color grading, sharpening, and pseudo-HDR. It provides instant profile switching and on-video controls to improve visual quality without re-encoding or downloads.
// @description:de  Globale Video Filter Overlay verbessert jedes HTML5-Video in Ihrem Browser mit Echtzeit-Farbkorrektur, Schärfung und Pseudo-HDR. Es bietet sofortiges Profilwechseln und Steuerelemente direkt im Video, um die Bildqualität ohne Neucodierung oder Downloads zu verbessern.
// @match        *://*/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_info
// @iconURL      https://i.ibb.co/206MW56L/logomes.png
// @downloadURL  https://update.greasyfork.org/scripts/561189/Global%20Video%20Filter%20Overlay.user.js
// @updateURL    https://update.greasyfork.org/scripts/561189/Global%20Video%20Filter%20Overlay.meta.js
// ==/UserScript==

(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  if (window.__GLOBAL_VIDEO_FILTER__) return;
  window.__GLOBAL_VIDEO_FILTER__ = true;

  // -------------------------
  // IDs / Const
  // -------------------------
  const STYLE_ID = 'global-video-filter-style';
  const SVG_ID   = 'global-video-filter-svg';
  const svgNS    = 'http://www.w3.org/2000/svg';

  // Hotkeys
  const HDR_TOGGLE_KEY  = 'p'; // Strg+Alt+P
  const PROF_TOGGLE_KEY = 'c'; // Strg+Alt+C
  const GRADE_HUD_KEY   = 'g'; // Strg+Alt+G
  const IO_HUD_KEY      = 'i'; // Strg+Alt+I (Settings Export/Import)

  // GM keys
  const K = {
    enabled: 'gvf_enabled',
    moody:   'gvf_moody',
    teal:    'gvf_teal',
    vib:     'gvf_vib',
    icons:   'gvf_icons',

    SL: 'gvf_sl',
    SR: 'gvf_sr',
    BL: 'gvf_bl',
    WL: 'gvf_wl',
    DN: 'gvf_dn',

    HDR:      'gvf_hdr',
    HDR_LAST: 'gvf_hdr_last',

    PROF:     'gvf_profile',

    G_HUD:    'gvf_g_hud',
    I_HUD:    'gvf_i_hud',

    U_CONTRAST:   'gvf_u_contrast',
    U_BLACK:      'gvf_u_black',
    U_WHITE:      'gvf_u_white',
    U_HIGHLIGHTS: 'gvf_u_highlights',
    U_SHADOWS:    'gvf_u_shadows',
    U_SAT:        'gvf_u_saturation',
    U_VIB:        'gvf_u_vibrance',
    U_SHARP:      'gvf_u_sharpen',
    U_GAMMA:      'gvf_u_gamma',
    U_GRAIN:      'gvf_u_grain',
    U_HUE:        'gvf_u_hue'
  };

  // -------------------------
  // Helpers
  // -------------------------
  const clamp   = (n, a, b) => Math.min(b, Math.max(a, n));
  const roundTo = (n, step) => Math.round(n / step) * step;
  const snap0   = (n, eps)  => (Math.abs(n) <= eps ? 0 : n);

  // stable JSON numbers (kills 0.30000000000000004 etc.)
  const nFix = (n, digits = 1) => Number((Number(n) || 0).toFixed(digits));

  const gmGet = (key, fallback) => { try { return GM_getValue(key, fallback); } catch (_) { return fallback; } };
  const gmSet = (key, val) => { try { GM_setValue(key, val); } catch (_) {} };

  // -------------------------
  // Global state
  // -------------------------
  let enabled    = !!gmGet(K.enabled, true);
  let darkMoody  = !!gmGet(K.moody,   true);
  let tealOrange = !!gmGet(K.teal,    false);
  let vibrantSat = !!gmGet(K.vib,     false);
  let iconsShown = !!gmGet(K.icons,   false);

  let sl = Number(gmGet(K.SL, 1.3));
  let sr = Number(gmGet(K.SR, -1.1));
  let bl = Number(gmGet(K.BL, 0.3));
  let wl = Number(gmGet(K.WL, 0.2));
  let dn = Number(gmGet(K.DN, 0.6));

  let hdr = Number(gmGet(K.HDR, 0.0));

  let profile = String(gmGet(K.PROF, 'off')).toLowerCase();
  if (!['off','film','anime','gaming','user'].includes(profile)) profile = 'off';

  let gradingHudShown = !!gmGet(K.G_HUD, false);
  let ioHudShown      = !!gmGet(K.I_HUD, false);

  let u_contrast   = Number(gmGet(K.U_CONTRAST,   0.0));
  let u_black      = Number(gmGet(K.U_BLACK,      0.0));
  let u_white      = Number(gmGet(K.U_WHITE,      0.0));
  let u_highlights = Number(gmGet(K.U_HIGHLIGHTS, 0.0));
  let u_shadows    = Number(gmGet(K.U_SHADOWS,    0.0));
  let u_sat        = Number(gmGet(K.U_SAT,        0.0));
  let u_vib        = Number(gmGet(K.U_VIB,        0.0));
  let u_sharp      = Number(gmGet(K.U_SHARP,      0.0));
  let u_gamma      = Number(gmGet(K.U_GAMMA,      0.0));
  let u_grain      = Number(gmGet(K.U_GRAIN,      0.0));
  let u_hue        = Number(gmGet(K.U_HUE,        0.0));

  // Hotkeys (extra toggles)
  const HK = { base: 'b', moody: 'd', teal: 'o', vib: 'v', icons: 'h' };

  function normSL()  { return snap0(roundTo(clamp(Number(sl)||0,  -2, 2),   0.1), 0.05); }
  function normSR()  { return snap0(roundTo(clamp(Number(sr)||0,  -2, 2),   0.1), 0.05); }
  function normBL()  { return snap0(roundTo(clamp(Number(bl)||0,  -2, 2),   0.1), 0.05); }
  function normWL()  { return snap0(roundTo(clamp(Number(wl)||0,  -2, 2),   0.1), 0.05); }
  function normDN()  { return snap0(roundTo(clamp(Number(dn)||0, -1.5, 1.5), 0.1), 0.05); }
  function normHDR() { return snap0(roundTo(clamp(Number(hdr)||0, -1.0, 2.0), 0.1), 0.05); }

  function normU(v)  { return roundTo(clamp(Number(v)||0, -10, 10), 0.1); }
  function uDelta(v) { return normU(v); }

  function getSharpenA()  { return Math.max(0, normSL()) * 1.0; }
  function getBlurSigma() { return Math.max(0, -normSL()) * 1.0; }
  function getRadius() { return Math.max(0.1, Math.abs(normSR())); }

  function blackToOffset(v) { return clamp(v, -2, 2) * 0.04; }
  function whiteToHiAdj(v) { return clamp(v, -2, 2) * 0.06; }

  function dnToDenoiseMix(v)   { return clamp(v, 0, 1.5) * 0.5; }
  function dnToDenoiseSigma(v) { return clamp(v, 0, 1.5) * 0.8; }
  function dnToGrainAlpha(v)   { return clamp(-v, 0, 1.5) * (0.20/1.5); }

  const PROF = {
    off:    { name: 'Off',   color: 'transparent' },
    film:   { name: 'Movie', color: '#00b050' },
    anime:  { name: 'Anime', color: '#1e6fff' },
    gaming: { name: 'Gaming',color: '#ff2a2a' },
    user:   { name: 'User',  color: '#bfbfbf' }
  };

  const PROFILE_VIDEO_OUTLINE = false;

  // -------------------------
  // Overlay infra
  // -------------------------
  const overlaysMain  = new WeakMap();
  const overlaysGrade = new WeakMap();
  const overlaysIO    = new WeakMap();
  const fsWraps  = new WeakMap();
  let rafScheduled = false;

  function getFsEl() {
    return document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement
      || null;
  }

  function stopEventsOn(el) {
    const stop = (e) => { e.stopPropagation(); };
    [
      'pointerdown','pointerup','pointermove',
      'mousedown','mouseup','mousemove',
      'touchstart','touchmove','touchend',
      'wheel','keydown','keyup'
    ].forEach(ev => el.addEventListener(ev, stop, { passive: true }));
  }

  // -------------------------
  // Main overlay
  // -------------------------
  function mkMainOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'gvf-video-overlay-main';
    overlay.style.cssText = `
      position: fixed;
      display: none;
      flex-direction: column;
      gap: 6px;
      z-index: 2147483647;
      pointer-events: auto;
      opacity: 0.92;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      transform: translateZ(0);
      user-select: none;
    `;

    const top = document.createElement('div');
    top.style.cssText = `display:flex;align-items:center;justify-content: space-between;gap: 8px;`;

    const row = document.createElement('div');
    row.style.cssText = `display:flex; gap:6px; align-items:center;`;

    const profBadge = document.createElement('div');
    profBadge.className = 'gvf-prof-badge';
    profBadge.style.cssText = `
      padding: 4px 8px;border-radius: 10px;font-size: 11px;font-weight: 900;
      background: rgba(0,0,0,0.92);color: #eaeaea;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset;white-space: nowrap;
    `;

    const mkBtn = (key, label) => {
      const el = document.createElement('div');
      el.dataset.key = key;
      el.textContent = label;
      el.style.cssText = `
        width: 24px;height: 24px;border-radius: 6px;background: #000;color: #666;
        display:flex;align-items:center;justify-content:center;
        font-size: 11px;font-weight: 800;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset;
        text-shadow: 0 1px 1px rgba(0,0,0,0.6);
      `;
      return el;
    };

    row.appendChild(mkBtn('base', 'B'));
    row.appendChild(mkBtn('moody','D'));
    row.appendChild(mkBtn('teal', 'O'));
    row.appendChild(mkBtn('vib',  'V'));
    row.appendChild(mkBtn('hdr',  'P'));
    top.appendChild(row);
    top.appendChild(profBadge);
    overlay.appendChild(top);

    const mkSliderRow = (labelText, min, max, step, getVal, setVal, gmKey, snapZero, fmt = v => Number(v).toFixed(1)) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        display:flex;align-items:center;gap:8px;padding: 6px 8px;border-radius: 10px;
        background: rgba(0,0,0,0.92);box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset;
      `;

      const lbl = document.createElement('div');
      lbl.textContent = labelText;
      lbl.style.cssText = `min-width: 36px;text-align:center;font-size: 11px;font-weight: 900;color:#cfcfcf;`;

      const rng = document.createElement('input');
      rng.type = 'range';
      rng.min = String(min);
      rng.max = String(max);
      rng.step = String(step);
      rng.value = String(getVal());
      rng.className = `gvf-${labelText}-range`;
      rng.style.cssText = `width: 210px; height: 18px; accent-color: #fff;`;

      const val = document.createElement('div');
      val.className = `gvf-${labelText}-val`;
      val.textContent = fmt(getVal());
      val.style.cssText = `width: 52px;text-align:right;font-size: 11px;font-weight: 900;color:#e6e6e6;`;

      stopEventsOn(rng);

      rng.addEventListener('input', () => {
        let v = clamp(parseFloat(rng.value), min, max);
        if (snapZero) v = snap0(v, 0.05);
        v = roundTo(v, step);

        setVal(v);
        rng.value = String(getVal());
        val.textContent = fmt(getVal());

        gmSet(gmKey, getVal());
        if (gmKey === K.HDR && getVal() !== 0) gmSet(K.HDR_LAST, getVal());

        applyFilter();
      });

      wrap.appendChild(lbl);
      wrap.appendChild(rng);
      wrap.appendChild(val);
      return wrap;
    };

    overlay.appendChild(mkSliderRow('SL',  -2,   2,   0.1, () => normSL(),  (v)=>{ sl=v;  }, K.SL,  true));
    overlay.appendChild(mkSliderRow('SR',  -2,   2,   0.1, () => normSR(),  (v)=>{ sr=v;  }, K.SR,  true));
    overlay.appendChild(mkSliderRow('BL',  -2,   2,   0.1, () => normBL(),  (v)=>{ bl=v;  }, K.BL,  true));
    overlay.appendChild(mkSliderRow('WL',  -2,   2,   0.1, () => normWL(),  (v)=>{ wl=v;  }, K.WL,  true));
    overlay.appendChild(mkSliderRow('DN', -1.5, 1.5, 0.1, () => normDN(),  (v)=>{ dn=v;  }, K.DN,  true));
    overlay.appendChild(mkSliderRow('HDR', -1.0, 2.0, 0.1, () => normHDR(), (v)=>{ hdr=v; }, K.HDR, true));

    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  // -------------------------
  // Grading overlay (Ctrl+Alt+G)
  // -------------------------
  function mkGradingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'gvf-video-overlay-grade';
    overlay.style.cssText = `
      position: fixed;display: none;flex-direction: column;gap: 6px;z-index: 2147483647;
      pointer-events: auto;opacity: 0.92;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      transform: translateZ(0);user-select: none;
    `;

    const head = document.createElement('div');
    head.style.cssText = `
      display:flex;justify-content: space-between;align-items:center;
      padding: 6px 8px;border-radius: 10px;background: rgba(0,0,0,0.92);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset;
    `;

    const title = document.createElement('div');
    title.textContent = 'Grading Settings(G) Profil: User';
    title.style.cssText = `font-size:11px; font-weight:900; color:#eaeaea;`;
    head.appendChild(title);
    overlay.appendChild(head);

    const mkRow = (labelText, keyGet, keySet, gmKey) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        display:flex;align-items:center;gap:8px;padding: 6px 8px;border-radius: 10px;
        background: rgba(0,0,0,0.92);box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset;
      `;

      const lbl = document.createElement('div');
      lbl.textContent = labelText;
      lbl.style.cssText = `
        min-width: 120px;text-align:left;font-size: 11px;font-weight: 900;
        color:#cfcfcf;padding-left: 2px;
      `;

      const rng = document.createElement('input');
      rng.type = 'range';
      rng.min = '-10';
      rng.max = '10';
      rng.step = '0.1';
      rng.value = String(keyGet());
      rng.className = `gvf-${labelText}-range`;
      rng.style.cssText = `width: 120px; height: 18px; accent-color: #fff;`;

      const val = document.createElement('div');
      val.className = `gvf-${labelText}-val`;
      val.textContent = Number(keyGet()).toFixed(1);
      val.style.cssText = `width: 54px;text-align:right;font-size: 11px;font-weight: 900;color:#e6e6e6;`;

      stopEventsOn(rng);

      rng.addEventListener('input', () => {
        const v = normU(parseFloat(rng.value));
        keySet(v);
        rng.value = String(keyGet());
        val.textContent = Number(keyGet()).toFixed(1);
        gmSet(gmKey, keyGet());
        applyFilter();
        scheduleOverlayUpdate();
      });

      wrap.appendChild(lbl);
      wrap.appendChild(rng);
      wrap.appendChild(val);
      return wrap;
    };

    overlay.appendChild(mkRow('Contrast',        () => normU(u_contrast),   (v)=>{ u_contrast=v; },   K.U_CONTRAST));
    overlay.appendChild(mkRow('Black Level',     () => normU(u_black),      (v)=>{ u_black=v; },      K.U_BLACK));
    overlay.appendChild(mkRow('White Level',     () => normU(u_white),      (v)=>{ u_white=v; },      K.U_WHITE));
    overlay.appendChild(mkRow('Highlights',      () => normU(u_highlights), (v)=>{ u_highlights=v; }, K.U_HIGHLIGHTS));
    overlay.appendChild(mkRow('Shadows',         () => normU(u_shadows),    (v)=>{ u_shadows=v; },    K.U_SHADOWS));
    overlay.appendChild(mkRow('Saturation',      () => normU(u_sat),        (v)=>{ u_sat=v; },        K.U_SAT));
    overlay.appendChild(mkRow('Vibrance',        () => normU(u_vib),        (v)=>{ u_vib=v; },        K.U_VIB));
    overlay.appendChild(mkRow('Sharpen',         () => normU(u_sharp),      (v)=>{ u_sharp=v; },      K.U_SHARP));
    overlay.appendChild(mkRow('Gamma',           () => normU(u_gamma),      (v)=>{ u_gamma=v; },      K.U_GAMMA));
    overlay.appendChild(mkRow('Grain (Banding)', () => normU(u_grain),      (v)=>{ u_grain=v; },      K.U_GRAIN));
    overlay.appendChild(mkRow('Hue-Correction',  () => normU(u_hue),        (v)=>{ u_hue=v; },        K.U_HUE));

    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  // -------------------------
  // Settings Import/Export overlay (Ctrl+Alt+I)
  // FIX: No auto overwrite while textarea is dirty (even if it blurs when clicking buttons)
  // -------------------------
  function mkIOOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'gvf-video-overlay-io';
    overlay.style.cssText = `
      position: fixed;display: none;flex-direction: column;gap: 6px;z-index: 2147483647;
      pointer-events: auto;opacity: 0.95;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      transform: translateZ(0);user-select: none;
      width: 420px;
    `;

    const head = document.createElement('div');
    head.style.cssText = `
      display:flex;justify-content: space-between;align-items:center;
      padding: 6px 8px;border-radius: 10px;background: rgba(0,0,0,0.92);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset;
    `;

    const title = document.createElement('div');
    title.textContent = 'Settings (I) Export/Import';
    title.style.cssText = `font-size:11px; font-weight:900; color:#eaeaea;`;

    const hint = document.createElement('div');
    hint.textContent = 'JSON';
    hint.style.cssText = `font-size:10px;font-weight:900;color:#cfcfcf;opacity:0.9;`;

    head.appendChild(title);
    head.appendChild(hint);
    overlay.appendChild(head);

    const box = document.createElement('div');
    box.style.cssText = `
      padding: 8px;border-radius: 10px;background: rgba(0,0,0,0.92);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.14) inset;
    `;

    const ta = document.createElement('textarea');
    ta.className = 'gvf-io-text';
    ta.spellcheck = false;
    ta.wrap = 'off';
    ta.style.cssText = `
      width: 100%;height: 220px;resize: vertical;
      background: rgba(10,10,10,0.98);color:#eaeaea;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 10px;padding: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 11px; line-height: 1.25;
      outline: none;
    `;
    stopEventsOn(ta);

    // dirty lock: once user edits, auto-refresh never overwrites until we explicitly clear it
    const setDirty = (on) => { if (on) ta.dataset.dirty = '1'; else delete ta.dataset.dirty; };
    ta.addEventListener('input', () => setDirty(true));
    ta.addEventListener('focus', () => {}); // keep simple; blur is NOT used anymore

    const row = document.createElement('div');
    row.style.cssText = `display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;`;

    const mkBtn = (text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.style.cssText = `
        cursor:pointer;
        padding: 6px 10px;border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.08);
        color:#eaeaea;font-size: 11px;font-weight: 900;
      `;
      stopEventsOn(b);
      return b;
    };

    const status = document.createElement('div');
    status.className = 'gvf-io-status';
    status.style.cssText = `margin-top:8px;font-size:11px;font-weight:900;color:#cfcfcf;opacity:0.95;`;
    status.textContent = 'Tip: paste JSON here → Save';

    const btnRefresh   = mkBtn('Refresh');
    const btnSave      = mkBtn('Save');
    const btnSelect    = mkBtn('Select All');
    const btnReset     = mkBtn('Reset to defaults');
    const btnExportFile = mkBtn('Export .json');
    const btnImportFile = mkBtn('Import .json');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json,.json';
    fileInput.style.display = 'none';
    stopEventsOn(fileInput);

    function downloadJsonToPC(obj) {
      const jsonStr = JSON.stringify(obj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const name = `gvf-settings_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}.json`;
      a.download = name;

      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    btnExportFile.addEventListener('click', () => {
      try {
        downloadJsonToPC(exportSettings());
        status.textContent = 'Exported to .json file.';
      } catch (_) {
        status.textContent = 'Export failed.';
      }
    });

    btnImportFile.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = String(reader.result || '').trim();
          const obj = JSON.parse(raw);
          const ok = importSettings(obj);
          if (!ok) { status.textContent = 'Invalid JSON structure.'; return; }

          setDirty(false);
          ta.value = JSON.stringify(exportSettings(), null, 2);
          status.textContent = 'Imported + applied.';
        } catch (_) {
          status.textContent = 'Import failed (invalid JSON).';
        }
      };
      reader.onerror = () => { status.textContent = 'Import failed (read error).'; };
      reader.readAsText(f);
    });

    btnRefresh.addEventListener('click', () => {
      setDirty(false);
      ta.value = JSON.stringify(exportSettings(), null, 2);
      status.textContent = 'Exported current settings.';
    });

    btnSelect.addEventListener('click', () => {
      ta.focus();
      ta.select();
      status.textContent = 'Selected.';
    });

    btnSave.addEventListener('click', () => {
      // IMPORTANT: read BEFORE anything else can overwrite
      const raw = String(ta.value || '').trim();
      if (!raw) { status.textContent = 'Empty JSON.'; return; }
      try {
        const obj = JSON.parse(raw);
        const ok = importSettings(obj);
        if (!ok) { status.textContent = 'Invalid JSON structure.'; return; }

        setDirty(false);
        ta.value = JSON.stringify(exportSettings(), null, 2);
        status.textContent = 'Saved + applied.';
      } catch (_) {
        status.textContent = 'JSON parse error.';
      }
    });

    btnReset.addEventListener('click', () => {
      const defaults = {
        enabled: true, darkMoody: true, tealOrange: false, vibrantSat: false, iconsShown: false,
        sl: 1.3, sr: -1.1, bl: 0.3, wl: 0.2, dn: 0.6,
        hdr: 0.0, profile: 'off',
        gradingHudShown: false,
        user: { contrast:0, black:0, white:0, highlights:0, shadows:0, saturation:0, vibrance:0, sharpen:0, gamma:0, grain:0, hue:0 }
      };
      importSettings(defaults);
      setDirty(false);
      ta.value = JSON.stringify(exportSettings(), null, 2);
      status.textContent = 'Reset + applied.';
    });

    row.appendChild(btnRefresh);
    row.appendChild(btnSave);
    row.appendChild(btnSelect);
    row.appendChild(btnExportFile);
    row.appendChild(btnImportFile);
    row.appendChild(btnReset);

    box.appendChild(ta);
    box.appendChild(row);
    box.appendChild(status);
    box.appendChild(fileInput);

    overlay.appendChild(box);

    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  // -------------------------
  // Export/Import logic
  // -------------------------
  function exportSettings() {
    return {
      schema: 'gvf-settings',
      ver: '1.0',
      enabled: !!enabled,
      darkMoody: !!darkMoody,
      tealOrange: !!tealOrange,
      vibrantSat: !!vibrantSat,
      iconsShown: !!iconsShown,

      sl: nFix(normSL(), 1),
      sr: nFix(normSR(), 1),
      bl: nFix(normBL(), 1),
      wl: nFix(normWL(), 1),
      dn: nFix(normDN(), 1),

      hdr: nFix(normHDR(), 1),
      profile: String(profile),

      gradingHudShown: !!gradingHudShown,

      user: {
        contrast:   nFix(normU(u_contrast), 1),
        black:      nFix(normU(u_black), 1),
        white:      nFix(normU(u_white), 1),
        highlights: nFix(normU(u_highlights), 1),
        shadows:    nFix(normU(u_shadows), 1),
        saturation: nFix(normU(u_sat), 1),
        vibrance:   nFix(normU(u_vib), 1),
        sharpen:    nFix(normU(u_sharp), 1),
        gamma:      nFix(normU(u_gamma), 1),
        grain:      nFix(normU(u_grain), 1),
        hue:        nFix(normU(u_hue), 1)
      }
    };
  }

  function importSettings(obj) {
    if (!obj || typeof obj !== 'object') return false;

    const u = (obj.user && typeof obj.user === 'object') ? obj.user : {};

    if ('enabled' in obj)      enabled    = !!obj.enabled;
    if ('darkMoody' in obj)    darkMoody  = !!obj.darkMoody;
    if ('tealOrange' in obj)   tealOrange = !!obj.tealOrange;
    if ('vibrantSat' in obj)   vibrantSat = !!obj.vibrantSat;
    if ('iconsShown' in obj)   iconsShown = !!obj.iconsShown;

    if ('sl' in obj)  sl  = clamp(Number(obj.sl),  -2, 2);
    if ('sr' in obj)  sr  = clamp(Number(obj.sr),  -2, 2);
    if ('bl' in obj)  bl  = clamp(Number(obj.bl),  -2, 2);
    if ('wl' in obj)  wl  = clamp(Number(obj.wl),  -2, 2);
    if ('dn' in obj)  dn  = clamp(Number(obj.dn),  -1.5, 1.5);

    if ('hdr' in obj) hdr = clamp(Number(obj.hdr), -1, 2);

    if ('profile' in obj) {
      const p = String(obj.profile).toLowerCase();
      profile = (['off','film','anime','gaming','user'].includes(p) ? p : 'off');
    }

    if ('gradingHudShown' in obj) gradingHudShown = !!obj.gradingHudShown;

    if ('contrast'   in u) u_contrast   = normU(u.contrast);
    if ('black'      in u) u_black      = normU(u.black);
    if ('white'      in u) u_white      = normU(u.white);
    if ('highlights' in u) u_highlights = normU(u.highlights);
    if ('shadows'    in u) u_shadows    = normU(u.shadows);
    if ('saturation' in u) u_sat        = normU(u.saturation);
    if ('vibrance'   in u) u_vib        = normU(u.vibrance);
    if ('sharpen'    in u) u_sharp      = normU(u.sharpen);
    if ('gamma'      in u) u_gamma      = normU(u.gamma);
    if ('grain'      in u) u_grain      = normU(u.grain);
    if ('hue'        in u) u_hue        = normU(u.hue);

    gmSet(K.enabled, enabled);
    gmSet(K.moody, darkMoody);
    gmSet(K.teal, tealOrange);
    gmSet(K.vib, vibrantSat);
    gmSet(K.icons, iconsShown);

    sl = normSL(); gmSet(K.SL, sl);
    sr = normSR(); gmSet(K.SR, sr);
    bl = normBL(); gmSet(K.BL, bl);
    wl = normWL(); gmSet(K.WL, wl);
    dn = normDN(); gmSet(K.DN, dn);

    hdr = normHDR(); gmSet(K.HDR, hdr);
    if (hdr !== 0) gmSet(K.HDR_LAST, hdr);

    gmSet(K.PROF, profile);
    gmSet(K.G_HUD, gradingHudShown);

    gmSet(K.U_CONTRAST, u_contrast);
    gmSet(K.U_BLACK, u_black);
    gmSet(K.U_WHITE, u_white);
    gmSet(K.U_HIGHLIGHTS, u_highlights);
    gmSet(K.U_SHADOWS, u_shadows);
    gmSet(K.U_SAT, u_sat);
    gmSet(K.U_VIB, u_vib);
    gmSet(K.U_SHARP, u_sharp);
    gmSet(K.U_GAMMA, u_gamma);
    gmSet(K.U_GRAIN, u_grain);
    gmSet(K.U_HUE, u_hue);

    applyFilter();
    scheduleOverlayUpdate();
    return true;
  }

  // -------------------------
  // Overlay state updates
  // -------------------------
  function updateMainOverlayState(overlay) {
    if (!iconsShown) { overlay.style.display = 'none'; return; }
    overlay.style.display = 'flex';

    const state = {
      base: enabled,
      moody: darkMoody,
      teal: tealOrange,
      vib: vibrantSat,
      hdr: (normHDR() !== 0)
    };

    overlay.querySelectorAll('[data-key]').forEach(el => {
      const on = !!state[el.dataset.key];
      el.style.color = on ? '#fff' : '#666';
      el.style.background = on ? 'rgba(255,255,255,0.22)' : '#000';
      el.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.18) inset';
    });

    const badge = overlay.querySelector('.gvf-prof-badge');
    if (badge) {
      const p = PROF[profile] || PROF.off;
      const c = p.color;
      badge.textContent = `${p.name} (C)`;

      if (c && c !== 'transparent') {
        badge.style.background = 'rgba(0,0,0,0.92)';
        badge.style.border = `1px solid ${c}`;
        badge.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.14) inset, 0 0 0 2px ${c}, 0 0 18px ${c}55`;
      } else {
        badge.style.background = 'rgba(0,0,0,0.92)';
        badge.style.border = '1px solid rgba(255,255,255,0.10)';
        badge.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.14) inset';
      }
    }

    const setPair = (name, v) => {
      const r = overlay.querySelector(`.gvf-${CSS.escape(name)}-range`);
      const t = overlay.querySelector(`.gvf-${CSS.escape(name)}-val`);
      if (r) r.value = String(v);
      if (t) t.textContent = Number(v).toFixed(1);
    };

    setPair('SL',  normSL());
    setPair('SR',  normSR());
    setPair('BL',  normBL());
    setPair('WL',  normWL());
    setPair('DN',  normDN());
    setPair('HDR', normHDR());
  }

  function updateGradingOverlayState(overlay) {
    if (!gradingHudShown) { overlay.style.display = 'none'; return; }
    overlay.style.display = 'flex';

    const setPair = (name, v) => {
      const r = overlay.querySelector(`.gvf-${CSS.escape(name)}-range`);
      const t = overlay.querySelector(`.gvf-${CSS.escape(name)}-val`);
      if (r) r.value = String(v);
      if (t) t.textContent = Number(v).toFixed(1);
    };

    setPair('Contrast',        normU(u_contrast));
    setPair('Black Level',     normU(u_black));
    setPair('White Level',     normU(u_white));
    setPair('Highlights',      normU(u_highlights));
    setPair('Shadows',         normU(u_shadows));
    setPair('Saturation',      normU(u_sat));
    setPair('Vibrance',        normU(u_vib));
    setPair('Sharpen',         normU(u_sharp));
    setPair('Gamma',           normU(u_gamma));
    setPair('Grain (Banding)', normU(u_grain));
    setPair('Hue-Correction',  normU(u_hue));
  }

  function updateIOOverlayState(overlay) {
    if (!ioHudShown) { overlay.style.display = 'none'; return; }
    overlay.style.display = 'flex';

    const ta = overlay.querySelector('.gvf-io-text');
    if (!ta) return;

    // DO NOT overwrite if user edited (dirty)
    if (ta.dataset.dirty) return;

    ta.value = JSON.stringify(exportSettings(), null, 2);
  }

  // -------------------------
  // Fullscreen wrapper
  // -------------------------
  function ensureFsWrapper(video) {
    if (fsWraps.has(video)) return fsWraps.get(video);
    if (!video || !video.parentNode) return null;

    const parent = video.parentNode;

    const wrap = document.createElement('div');
    wrap.className = 'gvf-fs-wrap';
    wrap.style.cssText = `
      position: relative;display: inline-block;width: 100%;height: 100%;
      max-width: 100%;background: black;
    `;

    const ph = document.createComment('gvf-video-placeholder');
    parent.insertBefore(ph, video);
    parent.insertBefore(wrap, video);
    wrap.appendChild(video);

    wrap.__gvfPlaceholder = ph;
    fsWraps.set(video, wrap);
    return wrap;
  }

  function restoreFromFsWrapper(video) {
    const wrap = fsWraps.get(video);
    if (!wrap) return;
    const ph = wrap.__gvfPlaceholder;
    if (ph && ph.parentNode) {
      ph.parentNode.insertBefore(video, ph);
      ph.parentNode.removeChild(ph);
    }
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    fsWraps.delete(video);
  }

  function patchFullscreenRequest(video) {
    if (!video || video.__gvfFsPatched) return;
    video.__gvfFsPatched = true;

    if (typeof video.webkitEnterFullscreen === 'function') return;

    const origReq = video.requestFullscreen || video.webkitRequestFullscreen || video.msRequestFullscreen;
    if (!origReq) return;

    const callWrapFs = async () => {
      const wrap = ensureFsWrapper(video);
      if (!wrap) return origReq.call(video);
      const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen || wrap.msRequestFullscreen;
      if (req) return req.call(wrap);
      return origReq.call(video);
    };

    if (video.requestFullscreen) {
      const _orig = video.requestFullscreen.bind(video);
      video.requestFullscreen = function () { return callWrapFs() || _orig(); };
    }
    if (video.webkitRequestFullscreen) {
      const _orig = video.webkitRequestFullscreen.bind(video);
      video.webkitRequestFullscreen = function () { return callWrapFs() || _orig(); };
    }
    if (video.msRequestFullscreen) {
      const _orig = video.msRequestFullscreen.bind(video);
      video.msRequestFullscreen = function () { return callWrapFs() || _orig(); };
    }
  }

  function getOverlayContainer(video) {
    const fsEl = getFsEl();
    const wrap = fsWraps.get(video);

    if (fsEl && wrap && fsEl === wrap) return wrap;

    if (fsEl && (fsEl === video || (fsEl.contains && fsEl.contains(video)))) {
      if (fsEl.tagName && fsEl.tagName.toLowerCase() === 'video') return document.body || document.documentElement;
      return fsEl;
    }
    return document.body || document.documentElement;
  }

  function positionOverlayAt(video, overlay, dx, dy) {
    const fsEl = getFsEl();
    const container = getOverlayContainer(video);
    if (overlay.parentNode !== container) container.appendChild(overlay);

    const isWrapFs = fsEl && container === fsEl && fsEl.classList && fsEl.classList.contains('gvf-fs-wrap');
    overlay.style.position = isWrapFs ? 'absolute' : 'fixed';

    const r = video.getBoundingClientRect();
    if (!r || r.width < 40 || r.height < 40) { overlay.style.display = 'none'; return; }

    if (!fsEl) {
      if (r.bottom < 0 || r.right < 0 || r.top > (window.innerHeight||0) || r.left > (window.innerWidth||0)) {
        overlay.style.display = 'none';
        return;
      }
    }

    overlay.style.display = 'flex';

    if (isWrapFs) {
      const cr = container.getBoundingClientRect();
      overlay.style.top  = `${Math.round((r.top - cr.top) + dy)}px`;
      overlay.style.left = `${Math.round((r.left - cr.left) + r.width - dx)}px`;
      overlay.style.transform = 'translateX(-100%) translateZ(0)';
    } else {
      overlay.style.top  = `${Math.round(r.top + dy)}px`;
      overlay.style.left = `${Math.round(r.left + r.width - dx)}px`;
      overlay.style.transform = 'translateX(-100%) translateZ(0)';
    }
  }

  function ensureOverlays() {
    document.querySelectorAll('video').forEach(v => {
      patchFullscreenRequest(v);
      if (!overlaysMain.has(v))  overlaysMain.set(v, mkMainOverlay());
      if (!overlaysGrade.has(v)) overlaysGrade.set(v, mkGradingOverlay());
      if (!overlaysIO.has(v))    overlaysIO.set(v, mkIOOverlay());
    });
  }

  function updateAllOverlays() {
    ensureOverlays();

    document.querySelectorAll('video').forEach(v => {
      const oMain = overlaysMain.get(v);
      const oGr   = overlaysGrade.get(v);
      const oIO   = overlaysIO.get(v);

      if (oMain) {
        updateMainOverlayState(oMain);
        if (iconsShown) positionOverlayAt(v, oMain, 10, 10);
      }

      if (oGr) {
        updateGradingOverlayState(oGr);
        if (gradingHudShown) positionOverlayAt(v, oGr, 10, 10 + 280);
      }

      if (oIO) {
        updateIOOverlayState(oIO);
        if (ioHudShown) positionOverlayAt(v, oIO, 10, 10 + 560);
      }
    });
  }

  function scheduleOverlayUpdate() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      updateAllOverlays();
    });
  }

  function onFsChange() {
    const fsEl = getFsEl();
    if (!fsEl) {
      document.querySelectorAll('video').forEach(v => {
        if (fsWraps.has(v)) restoreFromFsWrapper(v);
      });
    }
    scheduleOverlayUpdate();
  }

  // -------------------------
  // SVG filter build
  // -------------------------
  function mkGamma(ch, amp, exp, off) {
    const f = document.createElementNS(svgNS, ch);
    f.setAttribute('type', 'gamma');
    f.setAttribute('amplitude', String(amp));
    f.setAttribute('exponent',  String(exp));
    f.setAttribute('offset',    String(off));
    return f;
  }

  function mkOffsetCT(inId, outId, offset) {
    const ct = document.createElementNS(svgNS, 'feComponentTransfer');
    ct.setAttribute('in', inId);
    ct.setAttribute('result', outId);
    ct.appendChild(mkGamma('feFuncR', 1.0, 1.0, offset));
    ct.appendChild(mkGamma('feFuncG', 1.0, 1.0, offset));
    ct.appendChild(mkGamma('feFuncB', 1.0, 1.0, offset));
    return ct;
  }

  function mkHighlightsTableCT(inId, outId, hiAdj) {
    const knee = 0.78;
    const steps = 17;
    const vals = [];
    for (let i = 0; i < steps; i++) {
      const x = i / (steps - 1);
      let y = x;
      if (x > knee) {
        const t = (x - knee) / (1 - knee);
        y = x + hiAdj * t;
      }
      y = clamp(y, 0, 1);
      vals.push(y.toFixed(4));
    }

    const ct = document.createElementNS(svgNS, 'feComponentTransfer');
    ct.setAttribute('in', inId);
    ct.setAttribute('result', outId);

    const mkTable = (tag) => {
      const f = document.createElementNS(svgNS, tag);
      f.setAttribute('type', 'table');
      f.setAttribute('tableValues', vals.join(' '));
      return f;
    };

    ct.appendChild(mkTable('feFuncR'));
    ct.appendChild(mkTable('feFuncG'));
    ct.appendChild(mkTable('feFuncB'));
    return ct;
  }

  function mkDenoiseBlend(inId, outId, sigma, mix) {
    const blur = document.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', inId);
    blur.setAttribute('stdDeviation', String(sigma));
    blur.setAttribute('result', outId + '_b');

    const comp = document.createElementNS(svgNS, 'feComposite');
    comp.setAttribute('in', inId);
    comp.setAttribute('in2', outId + '_b');
    comp.setAttribute('operator', 'arithmetic');
    comp.setAttribute('k1', '0');
    comp.setAttribute('k2', String(1 - mix));
    comp.setAttribute('k3', String(mix));
    comp.setAttribute('k4', '0');
    comp.setAttribute('result', outId);

    return [blur, comp];
  }

  function mkGrain(inId, outId, alpha) {
    const turb = document.createElementNS(svgNS, 'feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('baseFrequency', '0.9');
    turb.setAttribute('numOctaves', '2');
    turb.setAttribute('seed', '2');
    turb.setAttribute('result', outId + '_n');

    const noiseCM = document.createElementNS(svgNS, 'feColorMatrix');
    noiseCM.setAttribute('in', outId + '_n');
    noiseCM.setAttribute('type', 'matrix');
    noiseCM.setAttribute('values',
      '0.33 0.33 0.33 0 0 ' +
      '0.33 0.33 0.33 0 0 ' +
      '0.33 0.33 0.33 0 0 ' +
      '0    0    0    1 0'
    );
    noiseCM.setAttribute('result', outId + '_nm');

    const comp = document.createElementNS(svgNS, 'feComposite');
    comp.setAttribute('in', inId);
    comp.setAttribute('in2', outId + '_nm');
    comp.setAttribute('operator', 'arithmetic');
    comp.setAttribute('k1', '0');
    comp.setAttribute('k2', '1');
    comp.setAttribute('k3', String(alpha));
    comp.setAttribute('k4', '0');
    comp.setAttribute('result', outId);

    return [turb, noiseCM, comp];
  }

  function mkClarityHighpass(inId, outId, sigma, amount) {
    const blur = document.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('in', inId);
    blur.setAttribute('stdDeviation', String(sigma));
    blur.setAttribute('result', outId + '_b');

    const comp = document.createElementNS(svgNS, 'feComposite');
    comp.setAttribute('in', inId);
    comp.setAttribute('in2', outId + '_b');
    comp.setAttribute('operator', 'arithmetic');
    comp.setAttribute('k1', '0');
    comp.setAttribute('k2', String(1 + amount));
    comp.setAttribute('k3', String(-amount));
    comp.setAttribute('k4', '0');
    comp.setAttribute('result', outId);

    return [blur, comp];
  }

  function mkBlend(inA, inB, outId, mixB) {
    const comp = document.createElementNS(svgNS, 'feComposite');
    comp.setAttribute('in', inA);
    comp.setAttribute('in2', inB);
    comp.setAttribute('operator', 'arithmetic');
    comp.setAttribute('k1', '0');
    comp.setAttribute('k2', String(1 - mixB));
    comp.setAttribute('k3', String(mixB));
    comp.setAttribute('k4', '0');
    comp.setAttribute('result', outId);
    return comp;
  }

  function mkLinearCT(inId, outId, slope, intercept) {
    const ct = document.createElementNS(svgNS, 'feComponentTransfer');
    ct.setAttribute('in', inId);
    ct.setAttribute('result', outId);

    const mkLin = (tag) => {
      const f = document.createElementNS(svgNS, tag);
      f.setAttribute('type', 'linear');
      f.setAttribute('slope', String(slope));
      f.setAttribute('intercept', String(intercept));
      return f;
    };

    ct.appendChild(mkLin('feFuncR'));
    ct.appendChild(mkLin('feFuncG'));
    ct.appendChild(mkLin('feFuncB'));
    return ct;
  }

  function mkSCurveTableCT(inId, outId, strength) {
    const s = clamp(strength, 0, 2);

    const steps = 33;
    const vals = [];
    const toe = 0.20 + s * 0.06;
    const shoulder = 0.78 - s * 0.05;
    const shoulderGain = 0.16 + s * 0.10;

    for (let i = 0; i < steps; i++) {
      const x = i / (steps - 1);
      let y = x;

      if (x < toe) {
        const t = x / toe;
        const ss = t * t * (3 - 2 * t);
        y = x + (toe - x) * (0.10 + s * 0.10) * (1 - ss);
      }

      if (x > shoulder) {
        const t = (x - shoulder) / (1 - shoulder);
        const ss = t * t * (3 - 2 * t);
        y = x - shoulderGain * ss * t;
      }

      y = clamp(y, 0, 1);
      vals.push(y.toFixed(4));
    }

    const ct = document.createElementNS(svgNS, 'feComponentTransfer');
    ct.setAttribute('in', inId);
    ct.setAttribute('result', outId);

    const mkTable = (tag) => {
      const f = document.createElementNS(svgNS, tag);
      f.setAttribute('type', 'table');
      f.setAttribute('tableValues', vals.join(' '));
      return f;
    };

    ct.appendChild(mkTable('feFuncR'));
    ct.appendChild(mkTable('feFuncG'));
    ct.appendChild(mkTable('feFuncB'));
    return ct;
  }

  function mkProfileMatrixCT(inId, outId, prof) {
    const cm = document.createElementNS(svgNS, 'feColorMatrix');
    cm.setAttribute('in', inId);
    cm.setAttribute('type', 'matrix');

    let values = null;

    if (prof === 'film') {
      values =
        '1.06 0.02 0.00 0 -0.03 ' +
        '0.01 1.03 0.01 0 -0.02 ' +
        '0.00 0.03 1.05 0 -0.03 ' +
        '0    0    0    1  0';
    } else if (prof === 'anime') {
      values =
        '1.06 0.01 0.00 0 -0.012 ' +
        '0.00 1.07 0.01 0 -0.012 ' +
        '0.01 0.03 1.10 0 -0.016 ' +
        '0    0    0    1  0';
    } else if (prof === 'gaming') {
      values =
        '1.04 0.00 0.00 0 -0.010 ' +
        '0.00 1.04 0.00 0 -0.010 ' +
        '0.00 0.00 1.04 0 -0.010 ' +
        '0    0    0    1  0';
    } else {
      return null;
    }

    cm.setAttribute('values', values);
    cm.setAttribute('result', outId);
    return cm;
  }

  function userToneCss() {
    if (profile !== 'user') return '';

    const c = clamp(1.0 + (uDelta(u_contrast) * 0.04), 0.60, 1.60);
    const sat = clamp(1.0 + (uDelta(u_sat) * 0.05), 0.40, 1.80);
    const vib = clamp(1.0 + (uDelta(u_vib) * 0.02), 0.70, 1.35);
    const hue = clamp(uDelta(u_hue) * 3.0, -30, 30);

    const blk = clamp(uDelta(u_black) * 0.012, -0.12, 0.12);
    const wht = clamp(uDelta(u_white) * 0.012, -0.12, 0.12);
    const sh  = clamp(uDelta(u_shadows) * 0.010, -0.10, 0.10);
    const hi  = clamp(uDelta(u_highlights) * 0.010, -0.10, 0.10);

    const br = clamp(1.0 + (-blk + wht + sh + hi) * 0.6, 0.70, 1.35);

    const g = clamp(1.0 + (uDelta(u_gamma) * 0.025), 0.60, 1.60);
    const gBr = clamp(1.0 + (1.0 - g) * 0.18, 0.85, 1.20);
    const gCt = clamp(1.0 + (g - 1.0) * 0.10, 0.90, 1.15);

    const s = uDelta(u_sharp);
    const cssSharp = s > 0 ? ` drop-shadow(0 0 ${Math.max(0.001, (s/10)*0.35).toFixed(3)}px rgba(0,0,0,0.0))` : '';

    return ` brightness(${(br*gBr).toFixed(3)}) contrast(${(c*gCt).toFixed(3)}) saturate(${(sat*vib).toFixed(3)}) hue-rotate(${hue.toFixed(1)}deg)${cssSharp}`;
  }

  function buildFilter(svg, id, opts, radius, sharpenA, blurSigma, blackOffset, whiteAdj, dnVal, hdrVal, prof) {
    const { moody, teal, vib } = opts;

    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    let last = 'SourceGraphic';

    if (blurSigma > 0) {
      const b = document.createElementNS(svgNS, 'feGaussianBlur');
      b.setAttribute('in', last);
      b.setAttribute('stdDeviation', String(radius));
      b.setAttribute('result', 'r_blur');
      filter.appendChild(b);
      last = 'r_blur';
    } else {
      const blur = document.createElementNS(svgNS, 'feGaussianBlur');
      blur.setAttribute('in', 'SourceGraphic');
      blur.setAttribute('stdDeviation', String(radius));
      blur.setAttribute('result', 'blur');
      filter.appendChild(blur);

      const comp = document.createElementNS(svgNS, 'feComposite');
      comp.setAttribute('in', 'SourceGraphic');
      comp.setAttribute('in2', 'blur');
      comp.setAttribute('operator', 'arithmetic');
      comp.setAttribute('k1', '0');
      comp.setAttribute('k2', String(1 + sharpenA));
      comp.setAttribute('k3', String(-sharpenA));
      comp.setAttribute('k4', '0');
      comp.setAttribute('result', 'r0');
      filter.appendChild(comp);

      last = 'r0';
    }

    if (blackOffset !== 0) {
      filter.appendChild(mkOffsetCT(last, 'r_bl', blackOffset));
      last = 'r_bl';
    }

    if (whiteAdj !== 0) {
      filter.appendChild(mkHighlightsTableCT(last, 'r_wl', whiteAdj));
      last = 'r_wl';
    }

    if (dnVal > 0) {
      const mix = dnToDenoiseMix(dnVal);
      const sig = dnToDenoiseSigma(dnVal);
      const [b, c] = mkDenoiseBlend(last, 'r_dn', sig, mix);
      filter.appendChild(b);
      filter.appendChild(c);
      last = 'r_dn';
    } else if (dnVal < 0) {
      const alpha = dnToGrainAlpha(dnVal);
      const parts = mkGrain(last, 'r_gr', alpha);
      parts.forEach(p => filter.appendChild(p));
      last = 'r_gr';
    }

    if (hdrVal !== 0) {
      if (hdrVal > 0) {
        const s = clamp(hdrVal, 0, 2);

        const clarityAmt = 0.55 + s * 0.55;
        const claritySigma = clamp(1.3 + radius * 0.75, 1.3, 3.6);
        const [b, c] = mkClarityHighpass(last, 'r_hdr_cl', claritySigma, clarityAmt);
        filter.appendChild(b);
        filter.appendChild(c);

        filter.appendChild(mkBlend(last, 'r_hdr_cl', 'r_hdr_clb', clamp(0.65 + s * 0.12, 0.65, 0.89)));
        last = 'r_hdr_clb';

        filter.appendChild(mkSCurveTableCT(last, 'r_hdr_tm', s));
        last = 'r_hdr_tm';

        const slope = 1.10 + s * 0.18;
        const intercept = -0.015 + s * 0.006;
        filter.appendChild(mkLinearCT(last, 'r_hdr_lin', slope, intercept));
        last = 'r_hdr_lin';

        const sat = document.createElementNS(svgNS, 'feColorMatrix');
        sat.setAttribute('type', 'saturate');
        sat.setAttribute('values', String(1.10 + s * 0.30));
        sat.setAttribute('in', last);
        sat.setAttribute('result', 'r_hdr_sat');
        filter.appendChild(sat);
        last = 'r_hdr_sat';
      } else {
        const s = clamp(-hdrVal, 0, 1);

        const mix = clamp(s * 0.55, 0, 0.55);
        const sig = clamp(0.9 + s * 1.8, 0.9, 2.7);
        const [b, c] = mkDenoiseBlend(last, 'r_hdr_soft', sig, mix);
        filter.appendChild(b);
        filter.appendChild(c);
        last = 'r_hdr_soft';

        const sat = document.createElementNS(svgNS, 'feColorMatrix');
        sat.setAttribute('type', 'saturate');
        sat.setAttribute('values', String(1.0 - s * 0.18));
        sat.setAttribute('in', last);
        sat.setAttribute('result', 'r_hdr_soft2');
        filter.appendChild(sat);
        last = 'r_hdr_soft2';
      }
    }

    if (moody) {
      const ct = document.createElementNS(svgNS, 'feComponentTransfer');
      ct.setAttribute('in', last);
      ct.setAttribute('result', 'r1');
      ct.appendChild(mkGamma('feFuncR', 0.96, 1.14, -0.015));
      ct.appendChild(mkGamma('feFuncG', 0.96, 1.13, -0.015));
      ct.appendChild(mkGamma('feFuncB', 0.97, 1.11, -0.015));
      filter.appendChild(ct);

      const sat = document.createElementNS(svgNS, 'feColorMatrix');
      sat.setAttribute('type', 'saturate');
      sat.setAttribute('values', '0.90');
      sat.setAttribute('in', 'r1');
      sat.setAttribute('result', 'r2');
      filter.appendChild(sat);

      last = 'r2';
    }

    if (teal) {
      const cool = document.createElementNS(svgNS, 'feColorMatrix');
      cool.setAttribute('type', 'matrix');
      cool.setAttribute('values',
        '0.96 0.02 0.00 0 0 ' +
        '0.02 1.02 0.02 0 0 ' +
        '0.00 0.04 1.06 0 0 ' +
        '0    0    0    1 0'
      );
      cool.setAttribute('in', last);
      cool.setAttribute('result', 'r3');
      filter.appendChild(cool);

      const warm = document.createElementNS(svgNS, 'feColorMatrix');
      warm.setAttribute('type', 'matrix');
      warm.setAttribute('values',
        '1.10 0.02 0.00 0 0 ' +
        '0.02 1.00 0.00 0 0 ' +
        '0.00 0.00 0.90 0 0 ' +
        '0    0    0    1 0'
      );
      warm.setAttribute('in', 'r3');
      warm.setAttribute('result', 'r4');
      filter.appendChild(warm);

      const pop = document.createElementNS(svgNS, 'feColorMatrix');
      pop.setAttribute('type', 'saturate');
      pop.setAttribute('values', '1.08');
      pop.setAttribute('in', 'r4');
      pop.setAttribute('result', 'r4b');
      filter.appendChild(pop);

      last = 'r4b';
    }

    if (vib) {
      const vSat = document.createElementNS(svgNS, 'feColorMatrix');
      vSat.setAttribute('type', 'saturate');
      vSat.setAttribute('values', '1.35');
      vSat.setAttribute('in', last);
      vSat.setAttribute('result', 'r5');
      filter.appendChild(vSat);
      last = 'r5';
    }

    if (prof && (prof === 'film' || prof === 'anime' || prof === 'gaming')) {
      const pm = mkProfileMatrixCT(last, 'r_prof', prof);
      if (pm) {
        filter.appendChild(pm);
        last = 'r_prof';

        const sat = document.createElementNS(svgNS, 'feColorMatrix');
        sat.setAttribute('type', 'saturate');
        sat.setAttribute('in', last);
        sat.setAttribute('result', 'r_prof_sat');
        if (prof === 'film')   sat.setAttribute('values', '1.08');
        if (prof === 'anime')  sat.setAttribute('values', '1.18');
        if (prof === 'gaming') sat.setAttribute('values', '1.06');
        filter.appendChild(sat);
        last = 'r_prof_sat';
      }
    }

    const merge = document.createElementNS(svgNS, 'feMerge');
    const n1 = document.createElementNS(svgNS, 'feMergeNode');
    n1.setAttribute('in', last);
    merge.appendChild(n1);
    filter.appendChild(merge);

    svg.appendChild(filter);
  }

  function ensureSvgFilter() {
    const SL  = Number(normSL().toFixed(1));
    const SR  = Number(normSR().toFixed(1));
    const R   = Number(getRadius().toFixed(1));
    const A   = Number(getSharpenA().toFixed(3));
    const BS  = Number(getBlurSigma().toFixed(3));
    const BL  = Number(normBL().toFixed(1));
    const WL  = Number(normWL().toFixed(1));
    const DN  = Number(normDN().toFixed(1));
    const HDR = Number(normHDR().toFixed(1));
    const P   = (profile || 'off');

    const uSig = [
      normU(u_contrast), normU(u_black), normU(u_white), normU(u_highlights), normU(u_shadows),
      normU(u_sat), normU(u_vib), normU(u_sharp), normU(u_gamma), normU(u_grain), normU(u_hue)
    ].map(x => Number(x).toFixed(1)).join(',');

    const want = `${SL}|${SR}|${R}|${A}|${BS}|${BL}|${WL}|${DN}|${HDR}|${P}|U:${uSig}`;

    const existing = document.getElementById(SVG_ID);
    if (existing) {
      const has = existing.getAttribute('data-params') || '';
      if (has === want) return;
      existing.remove();
    }

    const svg = document.createElementNS(svgNS, 'svg');
    svg.id = SVG_ID;
    svg.setAttribute('data-params', want);
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.left = '-9999px';
    svg.style.top  = '-9999px';

    const blackOffset = blackToOffset(BL);
    const whiteAdj    = whiteToHiAdj(WL);

    buildFilter(svg, 'gvf_s',    { moody:false, teal:false, vib:false }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_sm',   { moody:true,  teal:false, vib:false }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_st',   { moody:false, teal:true,  vib:false }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_sv',   { moody:false, teal:false, vib:true  }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_smt',  { moody:true,  teal:true,  vib:false }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_smv',  { moody:true,  teal:false, vib:true  }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_stv',  { moody:false, teal:true,  vib:true  }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);
    buildFilter(svg, 'gvf_smtv', { moody:true,  teal:true,  vib:true  }, R, A, BS, blackOffset, whiteAdj, DN, HDR, P);

    (document.body || document.documentElement).appendChild(svg);
  }

  function pickComboId() {
    const m = !!darkMoody;
    const t = !!tealOrange;
    const v = !!vibrantSat;

    if (m && t && v) return 'gvf_smtv';
    if (m && t && !v) return 'gvf_smt';
    if (m && !t && v) return 'gvf_smv';
    if (!m && t && v) return 'gvf_stv';
    if (m && !t && !v) return 'gvf_sm';
    if (!m && t && !v) return 'gvf_st';
    if (!m && !t && v) return 'gvf_sv';
    return 'gvf_s';
  }

  function profileToneCss() {
    if (profile === 'film')   return ' brightness(1.01) contrast(1.08) saturate(1.08)';
    if (profile === 'anime')  return ' brightness(1.03) contrast(1.10) saturate(1.16)';
    if (profile === 'gaming') return ' brightness(1.01) contrast(1.12) saturate(1.06)';
    return '';
  }

  function applyFilter() {
    let style = document.getElementById(STYLE_ID);

    const nothingOn =
      !enabled && !darkMoody && !tealOrange && !vibrantSat && normHDR() === 0 && (profile === 'off');

    if (nothingOn) {
      if (style) style.remove();
      scheduleOverlayUpdate();
      return;
    }

    ensureSvgFilter();

    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const baseTone = enabled ? ' brightness(1.02) contrast(1.05) saturate(1.21)' : '';
    const profTone = profileToneCss();
    const userTone = userToneCss();

    const outlineCss = (PROFILE_VIDEO_OUTLINE && profile !== 'off')
      ? `outline: 2px solid ${(PROF[profile]||PROF.off).color} !important; outline-offset: -2px;`
      : `outline: none !important;`;

    style.textContent = `
      video {
        will-change: filter;
        transform: translateZ(0);
        filter: url("#${pickComboId()}")${baseTone}${profTone}${userTone} !important;
        ${outlineCss}
      }
    `;

    scheduleOverlayUpdate();
  }

  // -------------------------
  // Same-origin iframe injection
  // -------------------------
  function getSelfCode() {
    try {
      if (document.currentScript && document.currentScript.textContent) {
        const t = document.currentScript.textContent.trim();
        if (t.length > 200) return t;
      }
    } catch (_) {}
    try {
      if (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.source) {
        return String(GM_info.script.source || '');
      }
    } catch (_) {}
    return null;
  }

  function injectIntoIframe(iframe, code) {
    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;
      if (win.__GLOBAL_VIDEO_FILTER__) return;
      if (!code) return;

      const s = doc.createElement('script');
      s.type = 'text/javascript';
      s.textContent = code;
      (doc.head || doc.documentElement).appendChild(s);
      s.remove();
    } catch (_) {}
  }

  function watchIframes() {
    const code = getSelfCode();
    if (!code) return;

    const scan = () => document.querySelectorAll('iframe').forEach(ifr => injectIntoIframe(ifr, code));
    scan();

    document.addEventListener('load', (e) => {
      const t = e.target;
      if (t && t.tagName && t.tagName.toLowerCase() === 'iframe') injectIntoIframe(t, code);
    }, true);

    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  }

  // -------------------------
  // Global sync (tabs + sites)
  // -------------------------
  function listenGlobalSync() {
    const sync = () => {
      enabled    = !!gmGet(K.enabled, enabled);
      darkMoody  = !!gmGet(K.moody, darkMoody);
      tealOrange = !!gmGet(K.teal, tealOrange);
      vibrantSat = !!gmGet(K.vib, vibrantSat);
      iconsShown = !!gmGet(K.icons, iconsShown);

      sl  = Number(gmGet(K.SL, sl));
      sr  = Number(gmGet(K.SR, sr));
      bl  = Number(gmGet(K.BL, bl));
      wl  = Number(gmGet(K.WL, wl));
      dn  = Number(gmGet(K.DN, dn));
      hdr = Number(gmGet(K.HDR, hdr));

      profile = String(gmGet(K.PROF, profile)).toLowerCase();
      if (!['off','film','anime','gaming','user'].includes(profile)) profile = 'off';

      gradingHudShown = !!gmGet(K.G_HUD, gradingHudShown);
      ioHudShown      = !!gmGet(K.I_HUD, ioHudShown);

      u_contrast   = Number(gmGet(K.U_CONTRAST, u_contrast));
      u_black      = Number(gmGet(K.U_BLACK, u_black));
      u_white      = Number(gmGet(K.U_WHITE, u_white));
      u_highlights = Number(gmGet(K.U_HIGHLIGHTS, u_highlights));
      u_shadows    = Number(gmGet(K.U_SHADOWS, u_shadows));
      u_sat        = Number(gmGet(K.U_SAT, u_sat));
      u_vib        = Number(gmGet(K.U_VIB, u_vib));
      u_sharp      = Number(gmGet(K.U_SHARP, u_sharp));
      u_gamma      = Number(gmGet(K.U_GAMMA, u_gamma));
      u_grain      = Number(gmGet(K.U_GRAIN, u_grain));
      u_hue        = Number(gmGet(K.U_HUE, u_hue));

      applyFilter();
      scheduleOverlayUpdate();
    };

    Object.values(K).forEach(key => {
      try { GM_addValueChangeListener(key, sync); } catch (_) {}
    });
  }

  function cycleProfile() {
    const order = ['off', 'film', 'anime', 'gaming', 'user'];
    const cur = order.indexOf(profile);
    profile = order[(cur < 0 ? 0 : (cur + 1)) % order.length];
    gmSet(K.PROF, profile);
    applyFilter();
    scheduleOverlayUpdate();
  }

  function toggleGradingHud() {
    gradingHudShown = !gradingHudShown;
    gmSet(K.G_HUD, gradingHudShown);
    scheduleOverlayUpdate();
  }

  function toggleIOHud() {
    ioHudShown = !ioHudShown;
    gmSet(K.I_HUD, ioHudShown);
    scheduleOverlayUpdate();
  }

  // -------------------------
  // Init
  // -------------------------
  function init() {
    sl  = normSL();  gmSet(K.SL,  sl);
    sr  = normSR();  gmSet(K.SR,  sr);
    bl  = normBL();  gmSet(K.BL,  bl);
    wl  = normWL();  gmSet(K.WL,  wl);
    dn  = normDN();  gmSet(K.DN,  dn);
    hdr = normHDR(); gmSet(K.HDR, hdr);
    if (hdr !== 0) gmSet(K.HDR_LAST, hdr);

    u_contrast   = normU(u_contrast);   gmSet(K.U_CONTRAST, u_contrast);
    u_black      = normU(u_black);      gmSet(K.U_BLACK, u_black);
    u_white      = normU(u_white);      gmSet(K.U_WHITE, u_white);
    u_highlights = normU(u_highlights); gmSet(K.U_HIGHLIGHTS, u_highlights);
    u_shadows    = normU(u_shadows);    gmSet(K.U_SHADOWS, u_shadows);
    u_sat        = normU(u_sat);        gmSet(K.U_SAT, u_sat);
    u_vib        = normU(u_vib);        gmSet(K.U_VIB, u_vib);
    u_sharp      = normU(u_sharp);      gmSet(K.U_SHARP, u_sharp);
    u_gamma      = normU(u_gamma);      gmSet(K.U_GAMMA, u_gamma);
    u_grain      = normU(u_grain);      gmSet(K.U_GRAIN, u_grain);
    u_hue        = normU(u_hue);        gmSet(K.U_HUE, u_hue);

    gmSet(K.G_HUD, gradingHudShown);
    gmSet(K.I_HUD, ioHudShown);

    if (!['off','film','anime','gaming','user'].includes(profile)) profile = 'off';
    gmSet(K.PROF, profile);

    applyFilter();
    listenGlobalSync();
    watchIframes();

    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.isComposing) return;

      const k = (e.key || '').toLowerCase();

      if (e.ctrlKey && e.altKey && !e.shiftKey && k === IO_HUD_KEY) {
        e.preventDefault();
        toggleIOHud();
        return;
      }

      if (e.ctrlKey && e.altKey && !e.shiftKey && k === GRADE_HUD_KEY) {
        e.preventDefault();
        toggleGradingHud();
        return;
      }

      if (e.ctrlKey && e.altKey && !e.shiftKey && k === PROF_TOGGLE_KEY) {
        e.preventDefault();
        cycleProfile();
        return;
      }

      if (e.ctrlKey && e.altKey && !e.shiftKey && k === HDR_TOGGLE_KEY) {
        e.preventDefault();
        const cur = normHDR();
        if (cur === 0) {
          const last = Number(gmGet(K.HDR_LAST, 0.3));
          hdr = clamp(last || 1.2, -1.0, 2.0);
        } else {
          gmSet(K.HDR_LAST, cur);
          hdr = 0;
        }
        gmSet(K.HDR, normHDR());
        applyFilter();
        return;
      }

      if (!(e.ctrlKey && e.altKey) || e.shiftKey) return;

      if (k === HK.base)  { enabled = !enabled;       gmSet(K.enabled, enabled);   e.preventDefault(); applyFilter(); return; }
      if (k === HK.moody) { darkMoody = !darkMoody;   gmSet(K.moody, darkMoody);   e.preventDefault(); applyFilter(); return; }
      if (k === HK.teal)  { tealOrange = !tealOrange; gmSet(K.teal, tealOrange);   e.preventDefault(); applyFilter(); return; }
      if (k === HK.vib)   { vibrantSat = !vibrantSat; gmSet(K.vib, vibrantSat);    e.preventDefault(); applyFilter(); return; }
      if (k === HK.icons) { iconsShown = !iconsShown; gmSet(K.icons, iconsShown);  e.preventDefault(); scheduleOverlayUpdate(); return; }
    });

    window.addEventListener('scroll', scheduleOverlayUpdate, { passive: true });
    window.addEventListener('resize', scheduleOverlayUpdate, { passive: true });

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    new MutationObserver(() => {
      if (!document.getElementById(SVG_ID)) ensureSvgFilter();
      scheduleOverlayUpdate();
    }).observe(document.documentElement, { childList: true, subtree: true });

    scheduleOverlayUpdate();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init();

})();
