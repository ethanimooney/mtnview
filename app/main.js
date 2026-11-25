/* mtnview Home for LG webOS — lean ES5 runtime. */
(function () {
  'use strict';

  var CONFIG = {
    version: '1.0.1',
    prefsKey: 'mtnview.home.v1',
    weatherKey: 'mtnview.weather.v1',
    hdmiCacheKey: 'mtnview.hdmi.v1',
    stageWidth: 1920,
    stageHeight: 1080,
    ambientIdleMs: 150000,
    ambientShiftMs: 45000,
    ambientTickMs: 10000,
    pixelShiftMs: 10 * 60000,
    inputPollMs: 15000,
    weatherCacheMs: 30 * 60000,
    weatherRefreshMs: 25 * 60000,
    weatherRetryMs: 15 * 60000,
    nightStartHour: 21,
    nightEndHour: 6,
    aerialPreloadSec: 6,
    aerialCrossfadeLeadSec: 1.2,
    aerialFadeUnloadMs: 1500,
    aerialTransitionTimeoutMs: 6000,
    locationToastMs: 8000,
    toastMs: 2400,
    wakeDebounceMs: 300
  };

  var KEYS = {
    37: 'left', 38: 'up', 39: 'right', 40: 'down',
    13: 'ok', 27: 'back', 8: 'back', 10009: 'back', 461: 'back',
    403: 'red', 404: 'green', 405: 'yellow', 406: 'blue'
  };

  var AERIAL_MOUNTAINS = [
    { src: 'assets/aerials/yosemite-valley.mp4', title: 'Yosemite Valley', sub: 'California' },
    { src: 'assets/aerials/yosemite-forest.mp4', title: 'Yosemite High Country', sub: 'California' },
    { src: 'assets/aerials/yosemite-peaks.mp4', title: 'Sierra Peaks', sub: 'Yosemite' },
    { src: 'assets/aerials/yosemite-ridge.mp4', title: 'El Capitan & Cliffs', sub: 'Yosemite' },
    { src: 'assets/aerials/scotland-highlands.mp4', title: 'Scottish Highlands', sub: 'Scotland' },
    { src: 'assets/aerials/scotland-loch.mp4', title: 'Glencoe & Peaks', sub: 'Scotland' }
  ];

  var SETTINGS_CARD = { id: 'tvsettings', port: 0, name: 'TV Settings', icon: 'tvsettings', verb: 'open', kind: 'settings' };
  var PREVIEW_CARDS = [
    { id: 'hdmi-1', port: 1, name: 'HDMI 1', icon: 'hdmi', verb: 'watch', kind: 'hdmi' },
    { id: 'hdmi-2', port: 2, name: 'HDMI 2', icon: 'hdmi', verb: 'watch', kind: 'hdmi' },
    { id: 'hdmi-3', port: 3, name: 'HDMI 3', icon: 'hdmi', verb: 'watch', kind: 'hdmi' },
    SETTINGS_CARD
  ];

  var AMBIENT_SPOTS = [
    { x: 140, y: 660 }, { x: 1080, y: 660 }, { x: 140, y: 160 },
    { x: 1080, y: 160 }, { x: 600, y: 420 }, { x: 320, y: 580 }
  ];
  var PIXEL_SHIFTS = [
    { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 },
    { x: -2, y: 2 }, { x: -2, y: 0 }, { x: -2, y: -2 }, { x: 0, y: -2 }
  ];
  var pixelShiftIdx = 0, pixelShiftTimer = 0;

  var SLEEP_NAMES = { '30': 'After 30 min', '60': 'After 60 min', off: 'Off' };
  var SVG = {
    settings: '<path d="m9 3-.6 2.4-2 1.2L4 6l-2 3.5L3.8 11v2L2 14.5 4 18l2.4-.6 2 1.2L9 21h6l.6-2.4 2-1.2 2.4.6 2-3.5-1.8-1.5v-2L22 9.5 20 6l-2.4.6-2-1.2L15 3Z"/><circle cx="12" cy="12" r="3.2"/>',
    left: '<path d="m14.5 5-7 7 7 7"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    check: '<path d="m5.5 12.5 4 4 9-9"/>'
  };

  var isUsLocale = /^en-(US|BS|KY|LR|PW)\b/i.test((navigator && navigator.language) || 'en-US');

  /* ---------- State ---------- */
  var S = {
    c: { cardIdx: 0, controls: 'both', sounds: true, ambient: true, ambientSleep: '30', autoNight: true, tempUnit: isUsLocale ? 'F' : 'C', clock24: !isUsLocale },
    zone: 'cards',
    cardIdx: 0,
    switching: null,
    view: 'home',       // 'home' | 'settings' | 'detail' | 'leave'
    settingsIdx: 0,
    detailGroup: null,  // 'inputs' | 'aerials' | 'prefs' | 'lgtv'
    detailRow: 1,
    detailCol: 0,
    inputs: [],
    inputsLoading: false,
    inputsError: null,
    apps: [],
    appsLoading: false,
    appsError: null,
    leaveIdx: 0
  };

  var liveCards = null, hdmiStatus = {}, hdmiPollTimer = 0;
  var weatherData = null, weatherTimer = 0, clockTimer = 0;
  var lastActivity = Date.now(), ambientActive = false, oledBlack = false, ambientEnteredAt = 0;
  var ambientShiftAt = 0, ambientSpotIdx = 0, ambientPos = AMBIENT_SPOTS[0], ambientTickTimer = 0;
  var nightOverride = null, toastTimer = 0, heldKeys = {}, lastWakeAt = 0;

  var aerialSlot = 0, aerialIdx = Math.floor(Math.random() * AERIAL_MOUNTAINS.length);
  var aerialCurrentSrc = '', aerialPreloadSrc = '', aerialTransitioning = false, aerialTransTimer = 0;
  var locTimer = 0, locShownSrc = '';

  /* ---------- DOM refs ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), homeEl = $('home'), settingsBtn = $('settingsBtn');
  var clockPill = $('clockPill'), stageBody = $('stageBody'), ambientEl = $('ambient');
  var locEl = $('loc'), toastEl = $('toast'), overlayEl = $('overlay');
  var aerialVids = [$('aerial0'), $('aerial1')];

  /* ---------- Helpers ---------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function icon(name, cls) { return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + SVG[name] + '</svg>'; }
  function setHTML(el, html) { if (el && el._h !== html) { el._h = html; el.innerHTML = html; } }
  function hasTvBridge() {
    return !!(
      (window.webOS && window.webOS.service && typeof window.webOS.service.request === 'function') ||
      typeof window.PalmServiceBridge === 'function'
    );
  }
  function cards() {
    if (liveCards && liveCards.length) return liveCards;
    return hasTvBridge() ? [SETTINGS_CARD] : PREVIEW_CARDS;
  }

  /* ---------- Preferences ---------- */
  function loadPrefs() {
    try {
      var raw = localStorage.getItem(CONFIG.prefsKey);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return;
      var ctrl = s.controls || (s.look && s.look.controls);
      if (typeof s.cardIdx === 'number' && s.cardIdx >= 0 && s.cardIdx < 5) S.c.cardIdx = Math.floor(s.cardIdx);
      if (['icons', 'both', 'text'].indexOf(ctrl) >= 0) S.c.controls = ctrl;
      if (typeof s.sounds === 'boolean') S.c.sounds = s.sounds;
      if (typeof s.ambient === 'boolean') S.c.ambient = s.ambient;
      if (['30', '60', 'off'].indexOf(String(s.ambientSleep)) >= 0) S.c.ambientSleep = String(s.ambientSleep);
      if (typeof s.autoNight === 'boolean') S.c.autoNight = s.autoNight;
      if (s.tempUnit === 'F' || s.tempUnit === 'C') S.c.tempUnit = s.tempUnit;
      if (typeof s.clock24 === 'boolean') S.c.clock24 = s.clock24;
    } catch (e) { /* ignore */ }
    S.cardIdx = S.c.cardIdx;
  }
  function savePrefs() {
    try { localStorage.setItem(CONFIG.prefsKey, JSON.stringify(S.c)); } catch (e) { /* ignore */ }
  }

  /* ---------- Tactile UI Audio (Web Audio API) ---------- */
  var audioCtx = null;
  function getAudioCtx() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) { try { audioCtx = new Ctx(); } catch (e) { return null; } }
    if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch (e) { /* ignore */ } }
    return audioCtx;
  }
  function tone(ctx, f0, f1, t0, dur, peak, type) {
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.01);
  }
  function playSound(kind) {
    if (!S.c.sounds) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime;
      if (kind === 'move') {
        tone(ctx, 480, 320, now, 0.046, 0.075, 'sine');
        tone(ctx, 1180, 800, now, 0.018, 0.018, 'triangle');
      } else if (kind === 'edge') {
        tone(ctx, 185, 115, now, 0.046, 0.055, 'sine');
      } else if (kind === 'select') {
        tone(ctx, 523.25, 523.25, now, 0.11, 0.075, 'sine');
        tone(ctx, 783.99, 783.99, now + 0.045, 0.14, 0.065, 'sine');
      } else if (kind === 'back') {
        tone(ctx, 415, 255, now, 0.07, 0.055, 'sine');
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------- Device Icons ---------- */
  function devSvg(id) {
    if (id === 'appletv') {
      return '<svg class="dev-svg" viewBox="0 0 160 100" aria-hidden="true">'
        + '<path fill="currentColor" d="M53.6 30.2c2.5-3 4.2-7.1 3.7-11.2-3.6.2-8 2.4-10.6 5.4-2.3 2.6-4.3 6.8-3.8 10.8 4 .3 8.1-2 10.7-5zm3.7 6.4c-5.9-.3-10.9 3.3-13.7 3.3-2.8 0-7.1-3.1-11.8-3-6.1.1-11.7 3.5-14.8 9-6.3 11-1.6 27.2 4.5 36.1 3 4.4 6.6 9.2 11.3 9 4.5-.2 6.3-2.9 11.7-2.9 5.4 0 7 2.9 11.8 2.8 4.9-.1 8-4.4 11-8.8 3.5-5 4.9-9.9 5-10.1-.1-.1-9.6-3.7-9.7-14.6-.1-9.1 7.5-13.5 7.8-13.7-4.3-6.3-11-7-13.1-7.1z"/>'
        + '<path fill="currentColor" d="M95.2 35.8v11.4h8.2v6.7h-8.2v19.8c0 4.1 1.9 6 5.6 6 1.1 0 2.1-.1 2.6-.2v6.6c-.9.3-2.5.5-4.4.5-7.8 0-11.6-3.8-11.6-11.7V53.9h-6.2v-6.7h6.2V35.8h7.8zm13.4 11.4h8.2l9.1 29.8h.2l9.1-29.8h8l-13.1 38.8h-8.4l-13.1-38.8z"/>'
        + '</svg>';
    }
    if (id === 'ps5') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<g fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<polygon points="38,24 52,48 24,48"/><circle cx="82" cy="36" r="13"/>'
        + '<path d="M27 71l22 22M49 71L27 93"/><rect x="70" y="70" width="24" height="24" rx="2"/>'
        + '</g></svg>';
    }
    if (id === 'switch') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<path fill="currentColor" fill-rule="evenodd" d="M37 20C25.4 20 16 29.4 16 41v38c0 11.6 9.4 21 21 21h15c1.7 0 3-1.3 3-3V23c0-1.7-1.3-3-3-3H37zm10 7.5H37c-7.5 0-13.5 6-13.5 13.5v38c0 7.5 6 13.5 13.5 13.5h10v-65zM36.5 54a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zm31.5-34c-1.7 0-3 1.3-3 3v74c0 1.7 1.3 3 3 3h15c11.6 0 21-9.4 21-21V41c0-11.6-9.4-21-21-21H68zm14.5 54a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/>'
        + '</svg>';
    }
    if (id === 'xbox') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-width="6"/>'
        + '<path fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" d="M36 38c14 10 34 30 48 48M84 38c-14 10-34 30-48 48"/>'
        + '</svg>';
    }
    if (id === 'pc') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<rect x="16" y="24" width="88" height="58" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>'
        + '<line x1="42" y1="96" x2="78" y2="96" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
        + '<line x1="60" y1="82" x2="60" y2="96" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
        + '</svg>';
    }
    if (id === 'disc') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" stroke-width="6"/>'
        + '<circle cx="60" cy="60" r="11" fill="none" stroke="currentColor" stroke-width="5.5"/>'
        + '</svg>';
    }
    if (id === 'gamepad') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<path fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" d="M36 38h48c12.2 0 22 9.8 22 22 0 6.8-3.1 13.2-8.4 17.4l-7.2 5.7c-3.9 3.1-9.6 2.3-12.5-1.8l-5.8-8.3H47.9l-5.8 8.3c-2.9 4.1-8.6 4.9-12.5 1.8l-7.2-5.7C17.1 73.2 14 66.8 14 60c0-12.2 9.8-22 22-22z"/>'
        + '<path fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" d="M38 51v14M31 58h14"/>'
        + '<circle cx="78" cy="53" r="4" fill="currentColor"/><circle cx="88" cy="61" r="4" fill="currentColor"/>'
        + '</svg>';
    }
    if (id === 'streaming') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<rect x="18" y="28" width="84" height="64" rx="14" fill="none" stroke="currentColor" stroke-width="6"/>'
        + '<polygon points="50,45 50,75 76,60" fill="currentColor"/>'
        + '</svg>';
    }
    if (id === 'hdmi') {
      return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<path fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" d="M20 42h80v22l-12 14H32L20 64V42z"/>'
        + '<line x1="36" y1="58" x2="84" y2="58" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
        + '</svg>';
    }
    return '<svg class="dev-svg" viewBox="0 0 120 120" aria-hidden="true">'
      + '<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round">'
      + '<line x1="22" y1="36" x2="54" y2="36"/><line x1="78" y1="36" x2="98" y2="36"/><circle cx="66" cy="36" r="9"/>'
      + '<line x1="22" y1="60" x2="34" y2="60"/><line x1="58" y1="60" x2="98" y2="60"/><circle cx="46" cy="60" r="9"/>'
      + '<line x1="22" y1="84" x2="62" y2="84"/><line x1="86" y1="84" x2="98" y2="84"/><circle cx="74" cy="84" r="9"/>'
      + '</g></svg>';
  }

  /* ---------- Live Dynamic HDMI Inputs ---------- */
  function loadHdmiCache() {
    try {
      var raw = localStorage.getItem(CONFIG.hdmiCacheKey);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
  }
  function saveHdmiCache(map) {
    try { localStorage.setItem(CONFIG.hdmiCacheKey, JSON.stringify(map)); } catch (e) { /* ignore */ }
  }
  function detectIcon(name, serviceType) {
    var s = String(name || '').toLowerCase();
    var st = String(serviceType || '').toLowerCase();
    if (/apple\s*tv/.test(s)) return 'appletv';
    if (/ps[345]|playstation/.test(s)) return 'ps5';
    if (/switch|nintendo|wii|gamecube/.test(s)) return 'switch';
    if (/xbox/.test(s)) return 'xbox';
    if (/steam\s*deck|console|retro|atari|sega/.test(s) || st === 'game') return 'gamepad';
    if (/\bpc\b|\bmac\b|macbook|imac|windows|linux|computer|laptop|desktop|htpc/.test(s) || st === 'pc') return 'pc';
    if (/blu-?ray|\bbd\b|\bdvd\b|\buhd\b|panasonic|oppo|disc/.test(s) || st === 'bd' || st === 'dvd') return 'disc';
    if (st === 'ott' || st === 'stb' || /roku|chromecast|google\s*tv|shield|fire\s*tv|tivo|cable|xfinity|directv|dish|mi\s*box|onn/.test(s)) return 'streaming';
    return 'hdmi';
  }
  function detectVerb(iconId, serviceType) {
    if (iconId === 'ps5' || iconId === 'switch' || iconId === 'xbox' || iconId === 'gamepad' || serviceType === 'game') return 'play';
    if (iconId === 'pc') return 'use';
    return 'watch';
  }
  function seedCardsFromCache() {
    var cache = loadHdmiCache(), nums = Object.keys(cache).map(Number).filter(function (n) { return n >= 1 && n <= 4; }).sort(function (a, b) { return a - b; });
    if (!nums.length) return;
    liveCards = nums.map(function (num) {
      var entry = cache[num] || {}, name = entry.name || ('HDMI ' + num), stype = entry.serviceType || '';
      var iconId = detectIcon(name, stype);
      return { id: 'hdmi-' + num, port: num, name: name, icon: iconId, verb: detectVerb(iconId, stype), kind: 'hdmi' };
    });
    liveCards.push(SETTINGS_CARD);
  }
  function buildLiveCards(list) {
    var cache = loadHdmiCache(), dirty = false, out = [], i, item, generic, name, stype, iconId;
    for (i = 0; i < list.length; i++) {
      item = list[i];
      if (!item || !item.number || item.isAudio) continue;
      if (!item.pluggedIn && !item.connected && !item.active) continue;
      generic = /^hdmi[\s_-]*\d*$/i.test(String(item.name || '').trim());
      if (!generic && item.name) {
        name = item.name;
        if (!cache[item.number] || cache[item.number].name !== name || cache[item.number].serviceType !== item.serviceType) {
          cache[item.number] = { name: name, serviceType: item.serviceType || '' };
          dirty = true;
        }
      } else if (cache[item.number] && cache[item.number].name) {
        name = cache[item.number].name;
      } else {
        name = 'HDMI ' + item.number;
      }
      stype = item.serviceType || (cache[item.number] && cache[item.number].serviceType) || '';
      iconId = detectIcon(name, stype);
      out.push({ id: 'hdmi-' + item.number, port: item.number, name: name, icon: iconId, verb: detectVerb(iconId, stype), kind: 'hdmi' });
    }
    if (dirty) saveHdmiCache(cache);
    out.push({ id: 'tvsettings', port: 0, name: 'TV Settings', icon: 'tvsettings', verb: 'open', kind: 'settings' });
    return out;
  }
  function cardsSig(list) {
    return list.map(function (c) { return c.id + ':' + c.name + ':' + c.icon; }).join('|');
  }
  function pollInputs() {
    clearTimeout(hdmiPollTimer);
    if (document.hidden) return;
    if (window.FrameDevice && typeof FrameDevice.sources === 'function') {
      FrameDevice.sources(function (err, list) {
        if (!err && Array.isArray(list)) {
          var nextMap = {}, changed = false, i, item, prev;
          for (i = 0; i < list.length; i++) {
            item = list[i];
            nextMap[item.number] = { active: !!item.active, connected: !!item.connected };
            prev = hdmiStatus[item.number];
            if (!prev || prev.active !== !!item.active || prev.connected !== !!item.connected) changed = true;
          }
          hdmiStatus = nextMap;
          var nextCards = buildLiveCards(list);
          if (!liveCards || cardsSig(liveCards) !== cardsSig(nextCards)) {
            liveCards = nextCards;
            S.cardIdx = clamp(S.cardIdx, 0, liveCards.length - 1);
            changed = true;
          }
          if (changed && S.view === 'home') renderHome();
        }
      });
    }
    hdmiPollTimer = setTimeout(pollInputs, CONFIG.inputPollMs);
  }

  /* ---------- Weather ---------- */
  function weatherSvg(kind) {
    if (kind === 'clear') {
      var hr = new Date().getHours();
      if (hr >= 20 || hr < 6) return '<svg class="w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
      return '<svg class="w-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    }
    if (kind === 'rain') return '<svg class="w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 15.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.2 6.4 3.8 3.8 0 0 0 7 15.5ZM9 19l-1 2M13 19l-1 2M17 19l-1 2"/></svg>';
    if (kind === 'snow') return '<svg class="w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 15.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.2 6.4 3.8 3.8 0 0 0 7 15.5Z"/><circle cx="9" cy="19.5" r="1" fill="currentColor"/><circle cx="13" cy="19.5" r="1" fill="currentColor"/><circle cx="17" cy="19.5" r="1" fill="currentColor"/></svg>';
    return '<svg class="w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 17h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.2 7.9 3.8 3.8 0 0 0 7 17Z"/></svg>';
  }
  function wwoKind(code) {
    var c = parseInt(code, 10) || 0;
    if (c === 113) return 'clear';
    if (c === 179 || c === 182 || c === 227 || c === 230 || (c >= 317 && c <= 338) || (c >= 362 && c <= 377) || c === 392 || c === 395) return 'snow';
    if (c === 176 || (c >= 263 && c <= 314) || (c >= 353 && c <= 359) || c === 386 || c === 389) return 'rain';
    return 'cloud';
  }
  function fetchJson(url, done) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 10000;
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          try { done(null, JSON.parse(xhr.responseText)); } catch (e) { done(e); }
        } else done(new Error('HTTP ' + xhr.status));
      };
      xhr.onerror = xhr.ontimeout = function () { done(new Error('Network error')); };
      xhr.send();
    } catch (e) { done(e); }
  }
  function saveWeather(tempF, kind) {
    weatherData = { temp: Math.round(tempF), kind: kind || 'cloud', ts: Date.now() };
    try { localStorage.setItem(CONFIG.weatherKey, JSON.stringify(weatherData)); } catch (e) { /* ignore */ }
    renderClock();
    weatherTimer = setTimeout(fetchWeather, CONFIG.weatherCacheMs);
  }
  function fetchWeather() {
    clearTimeout(weatherTimer);
    try {
      var raw = localStorage.getItem(CONFIG.weatherKey), d = raw ? JSON.parse(raw) : null;
      if (d && typeof d.temp === 'number' && d.kind && Date.now() - d.ts < CONFIG.weatherCacheMs) weatherData = d;
    } catch (e) { /* ignore */ }
    if (weatherData && Date.now() - weatherData.ts < CONFIG.weatherRefreshMs) {
      weatherTimer = setTimeout(fetchWeather, CONFIG.weatherCacheMs);
      return;
    }
    fetchJson('https://wttr.in/?format=j1', function (err, data) {
      var cur = !err && data && data.current_condition && data.current_condition[0];
      var tempF = cur ? parseFloat(cur.temp_F) : NaN;
      if (isFinite(tempF)) { saveWeather(tempF, wwoKind(cur.weatherCode)); return; }
      fetchJson('https://get.geojs.io/v1/ip/geo.json', function (gErr, geo) {
        var lat = geo ? parseFloat(geo.latitude) : NaN, lon = geo ? parseFloat(geo.longitude) : NaN;
        if (gErr || !isFinite(lat) || !isFinite(lon)) { weatherTimer = setTimeout(fetchWeather, CONFIG.weatherRetryMs); return; }
        fetchJson('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + lat.toFixed(3) + '&lon=' + lon.toFixed(3), function (mErr, m) {
          var ts = m && m.properties && m.properties.timeseries && m.properties.timeseries[0];
          var inst = ts && ts.data && ts.data.instant && ts.data.instant.details;
          var sym = ts && ts.data && ts.data.next_1_hours && ts.data.next_1_hours.summary ? ts.data.next_1_hours.summary.symbol_code : '';
          if (!mErr && inst && typeof inst.air_temperature === 'number') {
            var kind = /clear|fair/.test(sym) ? 'clear' : /snow|sleet/.test(sym) ? 'snow' : /rain|drizzle|shower/.test(sym) ? 'rain' : 'cloud';
            saveWeather(inst.air_temperature * 9 / 5 + 32, kind);
          } else weatherTimer = setTimeout(fetchWeather, CONFIG.weatherRetryMs);
        });
      });
    });
  }

  /* ---------- Night Dim, Ambient Mode & OLED Screen-Off ---------- */
  function isNightDim() {
    if (nightOverride !== null) return nightOverride;
    if (!S.c.autoNight) return false;
    var hr = new Date().getHours();
    return hr >= CONFIG.nightStartHour || hr < CONFIG.nightEndHour;
  }
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.className = 'toast is-on';
    toastTimer = setTimeout(function () { toastEl.className = 'toast'; }, CONFIG.toastMs);
  }
  function touchActivity() {
    lastActivity = Date.now();
    if (oledBlack || ambientActive) {
      oledBlack = false;
      ambientActive = false;
      render();
      return true;
    }
    return false;
  }
  function enterAmbient() {
    if (ambientActive || S.view !== 'home' || S.switching) return;
    ambientActive = true;
    oledBlack = false;
    ambientEnteredAt = Date.now();
    ambientShiftAt = ambientEnteredAt;
    ambientSpotIdx = (ambientSpotIdx + 1) % AMBIENT_SPOTS.length;
    ambientPos = AMBIENT_SPOTS[ambientSpotIdx];
    renderHome();
  }
  function enterOledSleep() {
    if (oledBlack) return;
    oledBlack = true;
    ambientActive = true;
    renderHome();
    if (window.FrameDevice && typeof FrameDevice.turnOffScreen === 'function') {
      FrameDevice.turnOffScreen(function () {});
    }
  }
  function startAmbientLoop() {
    clearInterval(ambientTickTimer);
    ambientTickTimer = setInterval(function () {
      if (document.hidden || !S.c.ambient || S.view !== 'home' || S.switching) {
        if (ambientActive || oledBlack) { ambientActive = false; oledBlack = false; renderHome(); }
        return;
      }
      var now = Date.now();
      if (!ambientActive && now - lastActivity >= CONFIG.ambientIdleMs) {
        enterAmbient();
      } else if (ambientActive && !oledBlack) {
        var mins = S.c.ambientSleep === 'off' ? 0 : (parseInt(S.c.ambientSleep, 10) || 30);
        if (mins > 0 && ambientEnteredAt && now - ambientEnteredAt >= mins * 60000) {
          enterOledSleep();
          return;
        }
        if (now - ambientShiftAt >= CONFIG.ambientShiftMs) {
          ambientShiftAt = now;
          ambientSpotIdx = (ambientSpotIdx + 1) % AMBIENT_SPOTS.length;
          ambientPos = AMBIENT_SPOTS[ambientSpotIdx];
          ambientEl.style.transform = 'translate3d(' + ambientPos.x + 'px,' + ambientPos.y + 'px,0)';
        }
      }
    }, CONFIG.ambientTickMs);
  }

  /* ---------- Drop-In Custom Aerials Manifest (optional) ---------- */
  function loadAerialManifest() {
    fetchJson('assets/aerials/manifest.json', function (err, list) {
      if (err || !Array.isArray(list) || !list.length) return;
      var parsed = [];
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        if (!it || typeof it.src !== 'string' || !it.src.trim()) continue;
        var src = it.src.indexOf('/') >= 0 ? it.src : ('assets/aerials/' + it.src);
        parsed.push({ src: src, title: String(it.title || 'Aerial ' + (i + 1)), sub: String(it.sub || '') });
      }
      if (!parsed.length) return;
      AERIAL_MOUNTAINS = parsed;
      aerialIdx = aerialIdx % AERIAL_MOUNTAINS.length;
      aerialCurrentSrc = '';
      aerialPreloadSrc = '';
      syncAerial();
    });
  }

  /* ---------- Subtle OLED Pixel Shift (±2px every 10 min) ---------- */
  function startPixelShift() {
    clearInterval(pixelShiftTimer);
    pixelShiftTimer = setInterval(function () {
      if (document.hidden || ambientActive || oledBlack) return;
      pixelShiftIdx = (pixelShiftIdx + 1) % PIXEL_SHIFTS.length;
      var p = PIXEL_SHIFTS[pixelShiftIdx];
      var tf = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)';
      stageBody.style.transform = tf;
      clockPill.style.transform = tf;
    }, CONFIG.pixelShiftMs);
  }

  /* ---------- Dual-Video Mountain Aerials (Single Active Decoder) ---------- */
  function currentAerial() { return AERIAL_MOUNTAINS[aerialIdx % AERIAL_MOUNTAINS.length]; }
  function nextAerialItem() { return AERIAL_MOUNTAINS[(aerialIdx + 1) % AERIAL_MOUNTAINS.length]; }
  function showLocation(item, force) {
    if (!item || (!force && locShownSrc === item.src)) return;
    locShownSrc = item.src;
    clearTimeout(locTimer);
    setHTML(locEl, '<span class="loc-title">' + esc(item.title) + '</span><span class="loc-sub">' + esc(item.sub) + '</span>');
    locEl.className = 'loc is-on';
    locTimer = setTimeout(function () { locEl.className = 'loc'; }, CONFIG.locationToastMs);
  }
  function preloadNextAerial() {
    var next = nextAerialItem(), standby = aerialVids[1 - aerialSlot];
    if (!standby || !next || aerialPreloadSrc === next.src || aerialCurrentSrc === next.src) return;
    aerialPreloadSrc = next.src;
    standby.preload = 'auto';
    standby.muted = true;
    standby.defaultMuted = true;
    standby.src = next.src;
    try { standby.load(); } catch (e) { /* ignore */ }
  }
  function stepAerial(delta) {
    clearTimeout(aerialTransTimer);
    aerialTransitioning = false;
    aerialIdx = (aerialIdx + delta + AERIAL_MOUNTAINS.length) % AERIAL_MOUNTAINS.length;
    syncAerial();
  }
  function syncAerial() {
    var active = !document.hidden && !oledBlack && (S.view === 'home' || S.view === 'detail');
    if (!active) {
      aerialCurrentSrc = ''; aerialPreloadSrc = ''; aerialTransitioning = false;
      clearTimeout(aerialTransTimer);
      for (var i = 0; i < 2; i++) {
        aerialVids[i].className = 'aerial';
        aerialVids[i].preload = 'none';
        try { aerialVids[i].pause(); } catch (e) { /* ignore */ }
        if (aerialVids[i].getAttribute('src')) {
          aerialVids[i].removeAttribute('src');
          try { aerialVids[i].load(); } catch (e) { /* ignore */ }
        }
      }
      locEl.className = 'loc';
      return;
    }
    var item = currentAerial(), curVid = aerialVids[aerialSlot];
    if (item.src === aerialCurrentSrc) {
      if (curVid.paused && curVid.readyState >= 2) {
        try { var p = curVid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ }
      }
      return;
    }
    var nextSlot = aerialCurrentSrc ? (1 - aerialSlot) : aerialSlot;
    var nextVid = aerialVids[nextSlot], oldVid = aerialCurrentSrc ? curVid : null;
    aerialTransitioning = true;
    clearTimeout(aerialTransTimer);
    aerialTransTimer = setTimeout(function () { aerialTransitioning = false; }, CONFIG.aerialTransitionTimeoutMs);
    aerialCurrentSrc = item.src;
    nextVid.preload = 'auto';
    nextVid.muted = true;
    nextVid.defaultMuted = true;
    if (aerialPreloadSrc !== item.src) {
      nextVid.src = item.src;
      try { nextVid.load(); } catch (e) { /* ignore */ }
    }
    aerialPreloadSrc = '';
    var revealed = false;
    function reveal() {
      if (revealed || aerialCurrentSrc !== item.src) return;
      revealed = true;
      aerialSlot = nextSlot;
      aerialTransitioning = false;
      clearTimeout(aerialTransTimer);
      nextVid.className = 'aerial is-playing is-top';
      showLocation(item, true);
      if (oldVid && oldVid !== nextVid) {
        oldVid.className = 'aerial';
        setTimeout(function () {
          if (aerialSlot === nextSlot) {
            oldVid.preload = 'none';
            try { oldVid.pause(); } catch (e) { /* ignore */ }
            oldVid.removeAttribute('src');
            try { oldVid.load(); } catch (e) { /* ignore */ }
          }
        }, CONFIG.aerialFadeUnloadMs);
      }
    }
    nextVid.onplaying = reveal;
    nextVid.oncanplay = function () {
      if (aerialCurrentSrc !== item.src) return;
      try { var pp = nextVid.play(); if (pp && pp.catch) pp.catch(function () {}); } catch (e) { /* ignore */ }
    };
    nextVid.ontimeupdate = function () {
      if (aerialSlot !== nextSlot || !nextVid.duration || isNaN(nextVid.duration)) return;
      var left = nextVid.duration - nextVid.currentTime;
      if (left <= CONFIG.aerialPreloadSec && left > CONFIG.aerialCrossfadeLeadSec + 0.3) preloadNextAerial();
      else if (left <= CONFIG.aerialCrossfadeLeadSec && !aerialTransitioning) stepAerial(1);
    };
    nextVid.onended = function () { if (aerialSlot === nextSlot) stepAerial(1); };
    nextVid.onerror = function () { aerialTransitioning = false; nextVid.className = 'aerial'; };
    try {
      var pp2 = nextVid.play();
      if (pp2 && pp2.catch) pp2.catch(function () {});
    } catch (e) { /* ignore */ }
  }

  /* ---------- Actions ---------- */
  function activateCard(idx) {
    var list = cards(), card = list[idx];
    if (!card || S.switching) return;
    playSound('select');
    S.c.cardIdx = idx; savePrefs();
    var port = card.kind === 'hdmi' ? (card.port || 1) : 0;
    S.switching = { icon: card.icon, name: card.name, kind: card.kind, port: port, status: 'switching', error: null };
    renderHome();
    if (card.kind === 'settings') {
      FrameDevice.settings(function (err) {
        if (!S.switching || S.switching.name !== card.name) return;
        if (err) { S.switching.status = 'error'; S.switching.error = err.message || 'Could not open TV settings.'; renderHome(); }
      });
    } else {
      FrameDevice.setSource(port, function (err) {
        if (!S.switching || S.switching.port !== port) return;
        if (err && !err.cancelled) { S.switching.status = 'error'; S.switching.error = err.message || ('Could not switch to HDMI ' + port + '.'); renderHome(); }
      });
    }
  }
  function cancelSwitching() {
    if (!S.switching) return;
    if (window.FrameDevice && FrameDevice.cancelSource) FrameDevice.cancelSource();
    S.switching = null;
  }
  function loadInputsDetail() {
    S.inputsLoading = true; S.inputsError = null;
    renderOverlay();
    FrameDevice.sources(function (err, list) {
      if (S.view !== 'detail' || S.detailGroup !== 'inputs') return;
      S.inputsLoading = false;
      S.inputs = list || [];
      S.inputsError = err ? err.message : null;
      renderOverlay();
    });
  }
  function loadAppsDetail() {
    S.appsLoading = true; S.appsError = null;
    renderOverlay();
    FrameDevice.apps(function (err, list) {
      if (S.view !== 'detail' || S.detailGroup !== 'apps') return;
      S.appsLoading = false;
      S.apps = list || [];
      S.appsError = err ? err.message : null;
      renderOverlay();
    });
  }
  function openSettings() { S.view = 'settings'; render(); }
  function openDetail(group) {
    S.view = 'detail'; S.detailGroup = group; S.detailRow = 1; S.detailCol = 0;
    if (group === 'inputs') { S.inputs = []; loadInputsDetail(); }
    if (group === 'apps') { S.apps = []; loadAppsDetail(); }
    render();
  }
  function closeOverlay() {
    cancelSwitching();
    if (S.view === 'detail') { S.view = 'settings'; render(); }
    else { S.view = 'home'; render(); }
  }

  /* ---------- Settings Model ---------- */
  function settingsGroups() {
    var hdmiCount = cards().filter(function (c) { return c.kind === 'hdmi'; }).length;
    return [
      { id: 'inputs', name: 'HDMI Inputs', val: hdmiCount + ' auto-detected · switch any port' },
      { id: 'aerials', name: 'Mountain Aerials', val: currentAerial().title + ' · ' + AERIAL_MOUNTAINS.length + ' scenes' },
      { id: 'prefs', name: 'Ambient & Audio', val: (S.c.ambient ? 'OLED ambient on' : 'Ambient off') + ' · ' + (S.c.sounds ? 'Sounds on' : 'Muted') },
      { id: 'lgtv', name: 'LG TV', val: 'TV settings & LG Home' }
    ];
  }
  function detailModel(group) {
    if (group === 'inputs') {
      var items = S.inputs.length ? S.inputs.map(function (inp) {
        var desc = inp.isAudio ? 'Audio / eARC (hidden on Home)' : inp.active ? 'Powered on · HDMI ' + inp.number : inp.connected ? 'Standby · HDMI ' + inp.number : inp.pluggedIn ? 'Asleep · HDMI ' + inp.number : 'Not plugged in · HDMI ' + inp.number;
        return { action: 'input.' + inp.number, port: inp.number, label: inp.name, desc: desc };
      }) : [{ action: 'inputs.retry', label: S.inputsLoading ? 'Loading inputs…' : (S.inputsError || 'Try again'), disabled: S.inputsLoading }];
      return { title: 'HDMI Inputs', sections: [{ title: '', items: items }] };
    }
    if (group === 'aerials') {
      return {
        title: 'Mountain Aerials',
        sections: [{
          title: 'Now playing',
          items: AERIAL_MOUNTAINS.map(function (a, i) {
            return { action: 'aerial.' + i, aerialIdx: i, label: a.title, desc: a.sub, applied: (aerialIdx % AERIAL_MOUNTAINS.length) === i, radio: true };
          })
        }]
      };
    }
    if (group === 'prefs') {
      return {
        title: 'Ambient & Audio',
        sections: [
          {
            title: 'OLED Protection & Audio',
            items: [
              { action: 'toggle.ambient', label: 'OLED ambient mode: ' + (S.c.ambient ? 'On' : 'Off'), desc: 'Dim screen with drifting clock & Aerials after 2.5 min idle' },
              { action: 'toggle.sleep', label: 'Ambient screen-off: ' + (SLEEP_NAMES[S.c.ambientSleep] || 'After 30 min'), desc: 'Blank OLED panel after extended Ambient Mode (Red button works anytime)' },
              { action: 'toggle.night', label: 'Auto night dim: ' + (S.c.autoNight ? 'On' : 'Off'), desc: 'Deepen scrim & soften contrast 9 PM–6 AM (Green button toggles)' },
              { action: 'toggle.sounds', label: 'Navigation sounds: ' + (S.c.sounds ? 'On' : 'Off'), desc: 'Subtle tactile clicks when scrolling and selecting' }
            ]
          },
          {
            title: 'Clock & Weather',
            horiz: true,
            items: [
              { action: 'toggle.clock24', label: S.c.clock24 ? '24-hour clock' : '12-hour clock' },
              { action: 'toggle.tempUnit', label: S.c.tempUnit === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)' }
            ]
          },
          {
            title: 'Top bar style',
            horiz: true,
            items: [
              { action: 'ctrl.icons', label: 'Icons', radio: true, applied: S.c.controls === 'icons' },
              { action: 'ctrl.both', label: 'Both', radio: true, applied: S.c.controls === 'both' },
              { action: 'ctrl.text', label: 'Text', radio: true, applied: S.c.controls === 'text' }
            ]
          }
        ]
      };
    }
    if (group === 'apps') {
      var appItems = S.apps.length ? S.apps.map(function (a) {
        return { action: 'app.' + a.appId, appId: a.appId, label: a.name };
      }) : [{ action: 'apps.retry', label: S.appsLoading ? 'Loading installed apps…' : (S.appsError || 'No apps found'), disabled: S.appsLoading }];
      return { title: 'Installed Apps', sections: [{ title: '', items: appItems }] };
    }
    if (group === 'about') {
      return {
        title: 'Shortcuts & About',
        sections: [
          {
            title: 'Magic Remote Shortcuts',
            items: [
              { action: 'info.red', label: 'Red button — Screen Off', desc: 'Blank the OLED panel immediately (keeps eARC audio playing)', disabled: true },
              { action: 'info.green', label: 'Green button — Night Dim', desc: 'Toggle dark-room dim mode anytime', disabled: true },
              { action: 'info.yellow', label: 'Yellow / Down — Ambient Mode', desc: 'Drifting clock & Aerials (Left/Right skips scenes)', disabled: true },
              { action: 'info.blue', label: 'Blue button — Next Aerial', desc: 'Skip to the next mountain Aerial immediately', disabled: true }
            ]
          },
          {
            title: 'About',
            items: [
              { action: 'info.ver', label: 'mtnview v' + CONFIG.version, desc: 'LG webOS launcher · custom Aerials via assets/aerials/manifest.json', disabled: true }
            ]
          }
        ]
      };
    }
    return {
      title: 'LG TV',
      sections: [{
        title: '',
        items: [
          { action: 'lgtv.apps', label: 'Installed webOS Apps', desc: 'Launch Homebrew, Plex, Jellyfin, YouTube & other TV apps' },
          { action: 'lgtv.inputs', label: 'Switch HDMI Input', desc: 'Pick any HDMI 1–4 input directly (including eARC / soundbar ports)' },
          { action: 'lgtv.settings', label: 'LG TV Settings', desc: 'Picture, sound and network settings' },
          { action: 'lgtv.home', label: 'LG webOS Home', desc: 'Open LG’s stock Home screen' },
          { action: 'lgtv.about', label: 'Shortcuts & About', desc: 'Magic Remote color keys & mtnview v' + CONFIG.version }
        ]
      }]
    };
  }
  function detailRows(model) {
    var rows = [[{ action: 'back', label: 'Settings' }]];
    model.sections.forEach(function (sec) {
      if (sec.horiz) rows.push(sec.items);
      else sec.items.forEach(function (it) { rows.push([it]); });
    });
    return rows;
  }
  function runDetailAction(item) {
    if (!item || item.disabled) return;
    if (item.action === 'back') { playSound('back'); closeOverlay(); return; }
    playSound('select');
    if (typeof item.aerialIdx === 'number') {
      clearTimeout(aerialTransTimer);
      aerialTransitioning = false;
      aerialIdx = item.aerialIdx;
      syncAerial();
      renderOverlay();
    } else if (item.action === 'toggle.ambient') {
      S.c.ambient = !S.c.ambient; savePrefs(); renderOverlay();
    } else if (item.action === 'toggle.sleep') {
      var ord = ['30', '60', 'off'];
      S.c.ambientSleep = ord[(ord.indexOf(S.c.ambientSleep) + 1) % ord.length];
      savePrefs(); renderOverlay();
    } else if (item.action === 'toggle.night') {
      S.c.autoNight = !S.c.autoNight; nightOverride = null; savePrefs(); renderHome(); renderOverlay();
    } else if (item.action === 'toggle.sounds') {
      S.c.sounds = !S.c.sounds; savePrefs(); if (S.c.sounds) playSound('select'); renderOverlay();
    } else if (item.action === 'toggle.clock24') {
      S.c.clock24 = !S.c.clock24; savePrefs(); renderClock(); renderOverlay();
    } else if (item.action === 'toggle.tempUnit') {
      S.c.tempUnit = S.c.tempUnit === 'C' ? 'F' : 'C'; savePrefs(); renderClock(); renderOverlay();
    } else if (item.action.indexOf('ctrl.') === 0) {
      S.c.controls = item.action.slice(5); savePrefs(); renderHome(); renderOverlay();
    } else if (item.action === 'inputs.retry') {
      loadInputsDetail();
    } else if (item.action === 'apps.retry') {
      loadAppsDetail();
    } else if (item.action.indexOf('app.') === 0) {
      FrameDevice.launchApp(item.appId, function () {});
    } else if (item.action.indexOf('input.') === 0) {
      FrameDevice.setSource(item.port, function () {});
    } else if (item.action === 'lgtv.apps') {
      openDetail('apps');
    } else if (item.action === 'lgtv.inputs') {
      openDetail('inputs');
    } else if (item.action === 'lgtv.settings') {
      FrameDevice.settings(function () {});
    } else if (item.action === 'lgtv.about') {
      openDetail('about');
    } else if (item.action === 'lgtv.home') {
      FrameDevice.home(function () {});
    }
  }

  /* ---------- Rendering ---------- */
  function displayTemp(tempF) {
    return S.c.tempUnit === 'C' ? Math.round((tempF - 32) * 5 / 9) : Math.round(tempF);
  }
  function renderClock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), ampm = h >= 12 ? 'PM' : 'AM';
    var timeStr = S.c.clock24 ? ((h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m) : ((h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m);
    var wHtml = weatherData ? '<span class="weather">' + weatherSvg(weatherData.kind) + '<span>' + displayTemp(weatherData.temp) + '&deg;</span></span>' : '';
    setHTML(clockPill, wHtml + '<span class="time">' + timeStr + '</span>' + (S.c.clock24 ? '' : '<span class="ampm">' + ampm + '</span>'));
    if (ambientActive) {
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var dateStr = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
      ambientEl.style.transform = 'translate3d(' + ambientPos.x + 'px,' + ambientPos.y + 'px,0)';
      setHTML(ambientEl, '<div class="amb-time">' + timeStr + (S.c.clock24 ? '' : '<span class="amb-ampm">' + ampm + '</span>') + '</div>'
        + '<div class="amb-meta"><span>' + esc(dateStr) + '</span>' + (weatherData ? '<span class="amb-sep">&middot;</span>' + wHtml : '') + '</div>');
    }
  }
  function updateClock() {
    clearTimeout(clockTimer);
    if (document.hidden) return;
    renderClock();
    homeEl.className = 'home' + (ambientActive ? ' is-ambient' : '') + (oledBlack ? ' is-oled-black' : '') + (isNightDim() ? ' is-night-dim' : '');
    clockTimer = setTimeout(updateClock, 60000 - (Date.now() % 60000) + 30);
  }
  function renderHome() {
    var list = cards();
    S.cardIdx = clamp(S.cardIdx, 0, list.length - 1);
    var active = list[S.cardIdx], sw = S.switching, cardFocus = S.zone === 'cards' && S.view === 'home';
    homeEl.className = 'home' + (ambientActive ? ' is-ambient' : '') + (oledBlack ? ' is-oled-black' : '') + (isNightDim() ? ' is-night-dim' : '');
    settingsBtn.className = 'top-pill settings-pill is-' + S.c.controls + (S.zone === 'util' && S.view === 'home' && !ambientActive ? ' is-focus' : '');
    setHTML(settingsBtn, icon('settings') + '<span class="pill-label">Settings</span>');
    renderClock();
    syncAerial();

    if (sw) {
      stageBody._mode = 'sw';
      var verb = sw.kind === 'settings' ? 'Opening' : 'Switching to';
      var portNote = sw.kind === 'hdmi' ? (' · HDMI ' + sw.port) : '';
      setHTML(stageBody, '<div class="switching">'
        + '<div class="sw-icon">' + devSvg(sw.icon) + '</div>'
        + '<div class="sw-head"><span class="sw-sub">' + esc(verb + portNote) + '</span>'
        + (sw.status === 'switching' ? '<span class="spinner" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : '') + '</div>'
        + '<h1 class="sw-title">' + esc(sw.name) + '</h1>'
        + (sw.error ? '<p class="sw-err">' + esc(sw.error) + '</p>' : '')
        + '<button type="button" tabindex="-1" class="back-hint" data-z="sw-back"><span class="key-pill">Back</span><span>Return to Home</span></button>'
        + '</div>');
      return;
    }

    /* Keep persistent hero & card DOM nodes so CSS focus transitions animate smoothly at 60fps. */
    var sig = cardsSig(list);
    if (stageBody._mode !== 'cards' || stageBody._sig !== sig) {
      stageBody._mode = 'cards';
      stageBody._sig = sig;
      stageBody._h = null;
      stageBody.innerHTML = '<div class="hero"><h1 class="hero-title" id="heroTitle"></h1><p class="prompt" id="heroPrompt"></p></div>'
        + '<div class="card-row' + (list.length >= 5 ? ' is-five' : '') + '" id="cardRow" role="list">'
        + list.map(function (c, i) {
          return '<button type="button" tabindex="-1" class="card" data-z="card" data-i="' + i + '" aria-label="' + esc(c.name) + '">'
            + '<span class="dot" hidden aria-hidden="true"></span>'
            + '<span class="card-art">' + devSvg(c.icon) + '</span>'
            + '<span class="card-label">' + esc(c.name) + '</span></button>';
        }).join('') + '</div>';
    }
    var subPort = active.kind === 'hdmi' ? ('HDMI ' + active.port) : '';
    var st = active.kind === 'hdmi' ? hdmiStatus[active.port] : null;
    var powered = !!(st && st.active);
    var heroTitleEl = $('heroTitle'), heroPromptEl = $('heroPrompt'), cardRowEl = $('cardRow');
    if (heroTitleEl && heroTitleEl.textContent !== active.name) heroTitleEl.textContent = active.name;
    setHTML(heroPromptEl, '<span>Press</span><span class="ok-badge">OK</span><span>to ' + esc(active.verb) + '</span>'
      + (subPort ? '<span class="prompt-sep">&middot;</span><span>' + esc(subPort) + '</span>' : '')
      + (powered ? '<span class="prompt-sep">&middot;</span><span class="power-tag">Powered on</span>' : ''));
    if (cardRowEl) {
      var btns = cardRowEl.children;
      for (var i = 0; i < btns.length && i < list.length; i++) {
        var c = list[i], isSel = i === S.cardIdx && cardFocus, isDim = i === S.cardIdx && !cardFocus;
        var cSt = c.kind === 'hdmi' ? hdmiStatus[c.port] : null;
        var cls = 'card' + (isSel ? ' is-focus' : '') + (isDim ? ' is-sel' : '');
        if (btns[i].className !== cls) btns[i].className = cls;
        if (btns[i].firstChild) btns[i].firstChild.hidden = !(cSt && cSt.active);
      }
    }
  }

  function renderOverlay() {
    var show = S.view !== 'home';
    overlayEl.hidden = !show;
    stage.className = 'stage' + (S.view === 'settings' || S.view === 'leave' ? ' is-sheet' : '') + (S.view === 'detail' ? ' is-detail' : '');
    if (!show) { setHTML(overlayEl, ''); return; }

    if (S.view === 'leave') {
      setHTML(overlayEl, '<h2 class="msg-title">Leave Home?</h2><p class="msg-line">Open LG Home?</p>'
        + '<div class="msg-acts">'
        + '<button type="button" tabindex="-1" class="msg-btn' + (S.leaveIdx === 0 ? ' is-focus' : '') + '" data-z="leave" data-i="0">Stay</button>'
        + '<button type="button" tabindex="-1" class="msg-btn' + (S.leaveIdx === 1 ? ' is-focus' : '') + '" data-z="leave" data-i="1">LG Home</button>'
        + '</div>');
      return;
    }

    if (S.view === 'settings') {
      var groups = settingsGroups();
      S.settingsIdx = clamp(S.settingsIdx, 0, groups.length - 1);
      var html = '<h2 class="ov-title">Settings</h2><div class="ov-list">' + groups.map(function (g, i) {
        return '<button type="button" tabindex="-1" class="ov-card' + (i === S.settingsIdx ? ' is-focus' : '') + '" data-z="set-group" data-i="' + i + '">'
          + '<span class="ov-card-copy"><span class="ov-card-name">' + esc(g.name) + '</span><span class="ov-card-val">' + esc(g.val) + '</span></span>'
          + icon('right') + '</button>';
      }).join('') + '</div><p class="ov-hint"><span class="remote-key">OK</span><span>Open selected group</span></p>';
      setHTML(overlayEl, html);
      return;
    }

    var model = detailModel(S.detailGroup), rows = detailRows(model);
    S.detailRow = clamp(S.detailRow, 0, rows.length - 1);
    S.detailCol = clamp(S.detailCol, 0, rows[S.detailRow].length - 1);
    var focusedItem = rows[S.detailRow][S.detailCol];
    var rowCursor = 1;
    var secHtml = model.sections.map(function (sec) {
      var optsHtml = sec.items.map(function (it, col) {
        var r = sec.horiz ? rowCursor : rowCursor++;
        var c = sec.horiz ? col : 0;
        var isFoc = S.detailRow === r && S.detailCol === c;
        return '<button type="button" tabindex="-1" class="choice' + (isFoc ? ' is-focus' : '') + (it.applied ? ' is-applied' : '') + (it.disabled ? ' is-disabled' : '') + '" data-z="detail" data-r="' + r + '" data-c="' + c + '">'
          + '<span class="choice-copy"><span class="choice-name">' + esc(it.label) + '</span>'
          + (it.desc ? '<span class="choice-desc">' + esc(it.desc) + '</span>' : '') + '</span>'
          + (it.radio ? '<span class="choice-tick">' + (it.applied ? icon('check') : '') + '</span>' : icon('right', 'choice-fwd'))
          + '</button>';
      }).join('');
      if (sec.horiz) rowCursor++;
      return '<div class="sec' + (sec.horiz ? ' is-horiz' : '') + '">' + (sec.title ? '<h3 class="sec-label">' + esc(sec.title) + '</h3>' : '') + '<div class="sec-opts">' + optsHtml + '</div></div>';
    }).join('');
    var hint = focusedItem.action === 'back' ? 'Return to Settings' : typeof focusedItem.aerialIdx === 'number' ? 'Play this Aerial' : focusedItem.radio ? 'Apply selected setting' : focusedItem.action.indexOf('toggle.') === 0 ? 'Change setting' : 'Open on the TV';
    setHTML(overlayEl, '<div class="detail-back"><button type="button" tabindex="-1" class="choice back-btn' + (S.detailRow === 0 ? ' is-focus' : '') + '" data-z="detail" data-r="0" data-c="0">' + icon('left') + '<span>Settings</span></button></div>'
      + '<h2 class="detail-title">' + esc(model.title) + '</h2>'
      + '<div class="detail-rows" id="detailRows">' + secHtml + '</div>'
      + '<p class="ov-hint"><span class="remote-key">OK</span><span>' + esc(hint) + '</span></p>');
    var focEl = overlayEl.querySelector('.detail-rows .is-focus');
    if (focEl && typeof focEl.scrollIntoView === 'function') {
      try { focEl.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignore */ }
    }
  }

  function render() {
    renderHome();
    renderOverlay();
  }

  /* ---------- Remote & Pointer Input ---------- */
  function handleKey(k) {
    if (S.view === 'home') {
      if (S.switching) {
        if (k === 'back') { playSound('back'); cancelSwitching(); renderHome(); }
        else if (k === 'ok' && S.switching.status === 'error') { cancelSwitching(); activateCard(S.cardIdx); }
        return;
      }
      var n = cards().length;
      if (S.zone === 'util') {
        if (k === 'down' || k === 'back') { S.zone = 'cards'; playSound(k === 'back' ? 'back' : 'move'); renderHome(); }
        else if (k === 'ok') { playSound('select'); openSettings(); }
        return;
      }
      if (k === 'left') { if (S.cardIdx > 0) { S.cardIdx--; playSound('move'); renderHome(); } else playSound('edge'); }
      else if (k === 'right') { if (S.cardIdx < n - 1) { S.cardIdx++; playSound('move'); renderHome(); } else playSound('edge'); }
      else if (k === 'up') { S.zone = 'util'; playSound('move'); renderHome(); }
      else if (k === 'down') { playSound('move'); enterAmbient(); }
      else if (k === 'back') { playSound('back'); S.view = 'leave'; S.leaveIdx = 0; render(); }
      else if (k === 'ok') { activateCard(S.cardIdx); }
      return;
    }

    if (S.view === 'leave') {
      if (k === 'left') { if (S.leaveIdx > 0) { S.leaveIdx = 0; playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'right') { if (S.leaveIdx < 1) { S.leaveIdx = 1; playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'back') { playSound('back'); S.view = 'home'; render(); }
      else if (k === 'ok') {
        playSound('select');
        var goLg = S.leaveIdx === 1;
        S.view = 'home'; render();
        if (goLg && window.FrameDevice) FrameDevice.home(function () {});
      }
      return;
    }

    if (S.view === 'settings') {
      var groups = settingsGroups();
      if (k === 'up') { if (S.settingsIdx > 0) { S.settingsIdx--; playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'down') { if (S.settingsIdx < groups.length - 1) { S.settingsIdx++; playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'back') { playSound('back'); closeOverlay(); }
      else if (k === 'ok') { playSound('select'); openDetail(groups[S.settingsIdx].id); }
      return;
    }

    if (S.view === 'detail') {
      var rows = detailRows(detailModel(S.detailGroup));
      if (k === 'back') { playSound('back'); closeOverlay(); return; }
      if (k === 'up') { if (S.detailRow > 0) { S.detailRow--; S.detailCol = clamp(S.detailCol, 0, rows[S.detailRow].length - 1); playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'down') { if (S.detailRow < rows.length - 1) { S.detailRow++; S.detailCol = clamp(S.detailCol, 0, rows[S.detailRow].length - 1); playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'left') { if (S.detailCol > 0) { S.detailCol--; playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'right') { if (S.detailCol < rows[S.detailRow].length - 1) { S.detailCol++; playSound('move'); renderOverlay(); } else playSound('edge'); }
      else if (k === 'ok') { runDetailAction(rows[S.detailRow][S.detailCol]); }
    }
  }

  document.addEventListener('keydown', function (ev) {
    var code = ev.keyCode, k = KEYS[code];
    if (code === 9) { ev.preventDefault(); return; }
    if (!k || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    ev.preventDefault();
    if (k === 'red') { if (ev.repeat) return; if (oledBlack) touchActivity(); else { playSound('back'); enterOledSleep(); } return; }
    if (k === 'green') { if (ev.repeat) return; lastActivity = Date.now(); nightOverride = !isNightDim(); playSound('select'); renderHome(); showToast(nightOverride ? 'Night dim on' : 'Night dim off'); return; }
    if (k === 'yellow') { if (ev.repeat) return; if (ambientActive || oledBlack) { touchActivity(); playSound('back'); } else { playSound('move'); enterAmbient(); } return; }
    if (k === 'blue') { if (ev.repeat) return; lastActivity = Date.now(); if (oledBlack) { touchActivity(); return; } playSound('move'); stepAerial(1); return; }
    if (ambientActive && !oledBlack && (k === 'left' || k === 'right')) {
      lastActivity = Date.now(); playSound('move'); stepAerial(k === 'right' ? 1 : -1); return;
    }
    if (touchActivity()) return;
    if (k === 'ok' || k === 'back') { if (ev.repeat || heldKeys[code]) return; heldKeys[code] = true; }
    handleKey(k);
  });
  document.addEventListener('keyup', function (ev) { delete heldKeys[ev.keyCode]; });

  /* Magic Remote pointer hover smoothly focuses cards & Settings rows. */
  stage.addEventListener('mouseover', function (ev) {
    if (ambientActive || oledBlack) return;
    var el = ev.target;
    while (el && el !== stage && !(el.getAttribute && el.getAttribute('data-z'))) el = el.parentNode;
    if (!el || el === stage) return;
    var z = el.getAttribute('data-z');
    if (z === 'util' && S.view === 'home' && !S.switching && S.zone !== 'util') {
      S.zone = 'util'; renderHome();
    } else if (z === 'card' && S.view === 'home' && !S.switching) {
      var ci = Number(el.getAttribute('data-i'));
      if (isFinite(ci) && (S.zone !== 'cards' || S.cardIdx !== ci)) { S.zone = 'cards'; S.cardIdx = ci; renderHome(); }
    } else if (z === 'set-group' && S.view === 'settings') {
      var si = Number(el.getAttribute('data-i'));
      if (isFinite(si) && S.settingsIdx !== si) { S.settingsIdx = si; renderOverlay(); }
    } else if (z === 'detail' && S.view === 'detail') {
      var dr = Number(el.getAttribute('data-r')), dc = Number(el.getAttribute('data-c'));
      if (isFinite(dr) && isFinite(dc) && (S.detailRow !== dr || S.detailCol !== dc)) { S.detailRow = dr; S.detailCol = dc; renderOverlay(); }
    } else if (z === 'leave' && S.view === 'leave') {
      var li = Number(el.getAttribute('data-i'));
      if (isFinite(li) && S.leaveIdx !== li) { S.leaveIdx = li; renderOverlay(); }
    }
  });

  stage.addEventListener('click', function (ev) {
    if (touchActivity()) return;
    var el = ev.target;
    while (el && el !== stage && !(el.getAttribute && el.getAttribute('data-z'))) el = el.parentNode;
    focusStage();
    if (!el || el === stage) return;
    var z = el.getAttribute('data-z');
    if (z === 'util') { S.zone = 'util'; playSound('select'); openSettings(); }
    else if (z === 'card') { S.zone = 'cards'; S.cardIdx = Number(el.getAttribute('data-i')) || 0; activateCard(S.cardIdx); }
    else if (z === 'sw-back') { playSound('back'); cancelSwitching(); renderHome(); }
    else if (z === 'set-group') { S.settingsIdx = Number(el.getAttribute('data-i')) || 0; playSound('select'); openDetail(settingsGroups()[S.settingsIdx].id); }
    else if (z === 'detail') {
      var r = Number(el.getAttribute('data-r')) || 0, c = Number(el.getAttribute('data-c')) || 0;
      S.detailRow = r; S.detailCol = c;
      var rows = detailRows(detailModel(S.detailGroup));
      if (rows[r] && rows[r][c]) runDetailAction(rows[r][c]);
    } else if (z === 'leave') {
      S.leaveIdx = Number(el.getAttribute('data-i')) || 0;
      handleKey('ok');
    }
  });

  /* ---------- Lifecycle ---------- */
  function fit() {
    var scale = Math.min(window.innerWidth / CONFIG.stageWidth, window.innerHeight / CONFIG.stageHeight);
    stage.style.transform = 'scale(' + scale + ')';
    stage.style.left = ((window.innerWidth - CONFIG.stageWidth * scale) / 2) + 'px';
    stage.style.top = ((window.innerHeight - CONFIG.stageHeight * scale) / 2) + 'px';
  }
  function focusStage() { try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); } }
  function onWake() {
    var now = Date.now();
    if (now - lastWakeAt < CONFIG.wakeDebounceMs) return;
    lastWakeAt = now;
    touchActivity(); cancelSwitching(); pollInputs();
    if (window.FrameDevice && FrameDevice.inhibitScreenSaver) FrameDevice.inhibitScreenSaver();
    focusStage(); render(); updateClock();
  }
  window.addEventListener('resize', fit);
  window.addEventListener('blur', function () { heldKeys = {}; });
  window.addEventListener('focus', onWake);
  document.addEventListener('webOSRelaunch', function () {
    if (window.PalmSystem && typeof window.PalmSystem.activate === 'function') window.PalmSystem.activate();
    if (window.webOSSystem && typeof window.webOSSystem.activate === 'function') window.webOSSystem.activate();
    onWake();
  });
  document.addEventListener('visibilitychange', function () {
    heldKeys = {};
    if (document.hidden) {
      cancelSwitching(); clearTimeout(clockTimer); clearTimeout(hdmiPollTimer); syncAerial();
      if (window.FrameDevice && FrameDevice.allowScreenSaver) FrameDevice.allowScreenSaver();
    } else {
      fetchWeather(); onWake();
    }
  });

  /* ---------- Boot ---------- */
  for (var v = 0; v < 2; v++) { aerialVids[v].muted = true; aerialVids[v].defaultMuted = true; aerialVids[v].playsInline = true; }
  loadPrefs();
  if (hasTvBridge()) seedCardsFromCache();
  fit();
  render();
  focusStage();
  updateClock();
  loadAerialManifest();
  pollInputs();
  fetchWeather();
  startAmbientLoop();
  startPixelShift();
  if (window.FrameDevice && FrameDevice.inhibitScreenSaver) FrameDevice.inhibitScreenSaver();
})();
