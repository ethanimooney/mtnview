/* mtnview Home for LG webOS. Static materials, local preferences and webOS Luna controls. */
(function () {
  'use strict';

  /* ---------- Bundled data ---------- */
  var ASSETS = 'assets/', ICONS = ASSETS + 'icons/', WP = ASSETS + 'wallpapers/';
  var CAP = 9, SCRIM_Y = 560;
  var DOCK_MODES = { both: { tw: 288, th: 200, pitch: 296 }, text: { tw: 288, th: 104, pitch: 296 }, icons: { tw: 176, th: 144, pitch: 184 } };
  var GRID_ROW = 240, GRID_COL = 344, COLS = 5;
  var ED_ROW = 80, ED_SEP = 56, ED_VIEW = 752;
  var PH_TOP = 220, PH_PITCH = 128, PH_FULL = 5, PH_HEIGHT = 944, PH_COMPACT_TOP = 144, PH_COMPACT_PITCH = 88, PH_COMPACT_VISIBLE = 9;
  var WALL_VISIBLE = 6, WALL_ROW = 92, WALL_DELAY = 200;
  var KEYS = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 13: 'ok', 27: 'back', 8: 'back', 10009: 'back', 461: 'back', 403: 'red', 404: 'green', 405: 'yellow', 406: 'blue' };
  var FULL = 'Home holds nine apps. Remove one first.', LAST = 'Home needs one app';

  var PRIMARY_APPS = [
    { id: 'stremio', name: 'Stremio', mark: true, appId: 'com.stremio.app' },
    { id: 'netflix', name: 'Netflix', mark: true, appId: 'netflix' },
    { id: 'disneyplus', name: 'Disney+', mark: true, appId: 'com.disney.disneyplus-prod' },
    { id: 'youtube', name: 'YouTube', mark: true, appId: 'youtube.leanback.v4' },
    { id: 'appletv', name: 'Apple TV', mark: true, appId: 'com.apple.appletv' },
    { id: 'primevideo', name: 'Prime Video', mark: true, appId: 'amazon' },
    { id: 'abciview', name: 'ABC iview', mark: true, appId: 'au.net.abc.iview' },
    { id: 'sbs', name: 'SBS On Demand', mark: true, appId: 'au.com.sbs.ondemand' },
    { id: 'applemusic', name: 'Apple Music', mark: true, appId: 'com.apple.applemusic' }
  ];
  var PRIMARY = PRIMARY_APPS.map(function (a) { return a.id; }), APPS = PRIMARY_APPS.slice(), ALPHA = [];
  var WALLS = window.CleanFrameWallpapers || [{ id: 'misty', name: 'Misty coast', tone: 'light', ut: { tr: 'mist', br: 'mist' }, frostVeil: .20 }];
  var ADAPTIVE_INK = window.CleanFrameAdaptiveInk || {};
  WALLS.forEach(function (w) { w.ut = w.ut || { tr: 'light', br: 'light' }; w.frostVeil = w.frostVeil || .12; });
  var MODES = [
    { id: 'fixed', name: 'Fixed', min: 0 }, { id: 'open', name: 'Each time Home opens', min: 0 },
    { id: '5', name: 'Every 5 minutes', min: 5 }, { id: '15', name: 'Every 15 minutes', min: 15 },
    { id: '60', name: 'Every hour', min: 60 }
  ];
  var KEY = 'mtnview.home.v1', storageOk = true, catalog = { loading: false, loaded: false, error: null, request: 0, revision: 0 };
  var QA = window.ShoreQA = { minuteMs: window.ShoreQA && window.ShoreQA.minuteMs || 60000 };
  var FONTS = {
    inter: { name: 'Inter', family: 'Inter', display: 600, ui: 500, clock: 500 },
    manrope: { name: 'Manrope', family: 'Manrope', display: 600, ui: 500, clock: 500 },
    montreal: { name: 'Neue Montreal', family: 'Study Montreal', display: 300, ui: 400, clock: 300 },
    mori: { name: 'Mori', family: 'Study Mori', display: 200, ui: 400, clock: 200 },
    pangram: { name: 'Pangram Sans', family: 'Study Pangram', display: 300, ui: 400, clock: 300 },
    geist: { name: 'Geist', family: 'Study Geist', display: 300, ui: 400, clock: 300 },
    newsreader: { name: 'Newsreader', family: 'Study Newsreader', display: 400, ui: 400, clock: 400 }
  };
  var PRIVATE_FONTS = window.CleanFramePrivateFontIDs || [], fontMetrics = {}, unavailableFonts = {}, widthCache = {}, fontRevision = 0, fontsReady = false;
  var LOOK_VALUES = { bg: ['dark', 'light', 'photo'], layout: ['cards', 'list', 'dock'], apps: ['icons', 'both', 'text'], font: Object.keys(FONTS).filter(function (id) { return id === 'inter' || id === 'manrope' || PRIVATE_FONTS.indexOf(id) >= 0; }), controls: ['icons', 'both', 'text'], focus: ['type', 'glass'], material: ['soft', 'frost', 'tint'] };
  var LOOK_NAMES = { bg: 'Background', layout: 'Layout', apps: 'Apps', font: 'Font', controls: 'Home controls', focus: 'Focus', material: 'Material' };
  var VALUE_NAMES = { dark: 'Dark', light: 'Light', photo: 'Photo', cards: 'Device Cards', list: 'List', dock: 'Dock', type: 'Type', glass: 'Glass', soft: 'Soft', frost: 'Frost', tint: 'Clear tint', icons: 'Icons', both: 'Icons and text', text: 'Text' };
  var UTIL = { picture: ['Cinema', 'picture'], apps: ['All apps', 'apps'], settings: ['Settings', 'settings'] };
  var PICTURE_MODES = [
    { id: 'cinema', name: 'Cinema' },
    { id: 'filmmaker', name: 'Filmmaker' },
    { id: 'game', name: 'Game' },
    { id: 'night', name: 'Night' }
  ];
  var AMBIENT_WALLS = ['forest', 'misty', 'alpine', 'peaks'];
  var AMBIENT_SLEEP_NAMES = { '30': 'After 30 min', '60': 'After 60 min', off: 'Off' };
  var AERIAL_MOUNTAINS = [
    { src: 'assets/aerials/yosemite-valley.mp4', title: 'Yosemite Valley', sub: 'California' },
    { src: 'assets/aerials/yosemite-forest.mp4', title: 'Yosemite High Country', sub: 'California' },
    { src: 'assets/aerials/yosemite-peaks.mp4', title: 'Sierra Peaks', sub: 'Yosemite' },
    { src: 'assets/aerials/yosemite-ridge.mp4', title: 'El Capitan & Cliffs', sub: 'Yosemite' },
    { src: 'assets/aerials/scotland-highlands.mp4', title: 'Scottish Highlands', sub: 'Scotland' },
    { src: 'assets/aerials/scotland-loch.mp4', title: 'Glencoe & Peaks', sub: 'Scotland' }
  ];
  var BG_MOTION_NAMES = { aerial: 'Aerial video', kenburns: 'Motion photos', static: 'Static' };
  var AMBIENT_IDLE_MS = 150000;
  var WEATHER_KEY = 'mtnview.weather.v1';
  var SNAZZY_DEFAULT_PORTS = { appletv: 1, ps5: 3, switch: 4 };
  var SNAZZY_CARDS = [
    { id: 'appletv', name: 'Apple TV', verb: 'watch', kind: 'hdmi', wall: 'misty' },
    { id: 'ps5', name: 'PS5', verb: 'play', kind: 'hdmi', wall: 'forest' },
    { id: 'switch', name: 'Nintendo Switch', verb: 'play', kind: 'hdmi', wall: 'alpine' },
    { id: 'tvsettings', name: 'TV Settings', verb: 'open', kind: 'settings', wall: 'peaks' }
  ];
  var MSG = {
    leave: { title: 'Leave Home?', line: 'Open LG Home?', note: '', actions: [['stay', 'Stay'], ['samsung', 'LG Home']] }
  };
  var SVG = {
    art: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9.8" r="1.5"/><path d="m4.5 17.5 4.5-4.5 3 3 2.5-2.5 5 5"/>',
    apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    picture: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"/>',
    arrange: '<path d="M4 8.5h14M15 5.5l3 3-3 3M20 15.5H6M9 12.5l-3 3 3 3"/>',
    settings: '<path d="m9 3-.6 2.4-2 1.2L4 6l-2 3.5L3.8 11v2L2 14.5 4 18l2.4-.6 2 1.2L9 21h6l.6-2.4 2-1.2 2.4.6 2-3.5-1.8-1.5v-2L22 9.5 20 6l-2.4.6-2-1.2L15 3Z"/><circle cx="12" cy="12" r="3.2"/>',
    home: '<path d="M4 11 12 4.5l8 6.5v8a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z"/>',
    undo: '<path d="M9 6 5 10l4 4"/><path d="M5 10h9.5a4.5 4.5 0 0 1 0 9H11"/>',
    check: '<path d="m5.5 12.5 4 4 9-9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m14.5 5-7 7 7 7"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    up: '<path d="m5 15.5 7-7 7 7"/>',
    down: '<path d="m5 8.5 7 7 7-7"/>',
    updown: '<path d="m7.5 9.5 4.5-4.5 4.5 4.5M7.5 14.5l4.5 4.5 4.5-4.5"/>',
    tv: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20h7"/>',
    warn: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17.3v.1"/>'
  };

  /* ---------- State ---------- */
  var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var S = {
    variant: 'B', geom: 'broad', c: null, stack: null,
    sel: null, selIdx: 0, lastUtil: 0, appsFocus: null, settingsFocus: 'background', appearanceFocus: 'bg', detailFocus: {},
    undo: [], removedAt: {}, note: null, err: null,
    writes: 0, failed: 0, log: [], logN: 0, lastLaunch: null, press: null,
    wallShown: null, wallPending: null, wallError: null,
    shown: null, pending: null, lookError: null, bundleKey: null, previewBundle: null, reflow: false, fontSwitch: false
  };
  var scroll = { first: 0, off: 0, photo: 0, photoArrange: 0 };
  function pick(v, list, fallback) {
    v = String(v || '').toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === v) return list[i];
    return fallback;
  }
  function lookOf(c) { return { bg: c.bg, wall: c.wall, layout: c.layout, apps: c.apps, font: c.font, controls: c.controls, focus: c.focus, material: c.material }; }
  function materialApplies(c) { c = c || S.c; return c.bg === 'photo' && (c.layout === 'dock' || c.focus === 'glass'); }

  /* ---------- Helpers ---------- */
  function app(id) { for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i]; return null; }
  function wall(id) { for (var i = 0; i < WALLS.length; i++) if (WALLS[i].id === id) return WALLS[i]; return null; }
  function wallIndex(id) { for (var i = 0; i < WALLS.length; i++) if (WALLS[i].id === id) return i; return 0; }
  function frostClass(w) { var i = [.12, .20, .30, .36, .44].indexOf(w.frostVeil); return i > 0 ? ' fv-' + (i + 1) : ''; }
  function wallClasses(w) { return frostClass(w) + (w.listColumn ? ' lc-' + w.listColumn : '') + (w.dockQuiet ? ' db-quiet' : '') + (w.clockMist ? ' tl-mist' : ''); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function without(list, id) { return list.filter(function (x) { return x !== id; }); }
  function same(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function onHome(id) { return S.c.home.indexOf(id) >= 0; }
  function top() { return S.stack[S.stack.length - 1]; }
  function push(e) { S.stack.push(e); return e; }
  function pop() { if (S.stack.length > 1) S.stack.pop(); }
  function px(n) { return n.toFixed(2) + 'px'; }
  function icon(name, cls, underlay) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">'
      + (underlay ? '<g class="ut-underlay" transform="translate(0 .5)">' + SVG[name] + '</g><g class="ut-ink">' + SVG[name] + '</g>' : SVG[name]) + '</svg>';
  }
  function badge(on) {
    return on
      ? '<svg class="badge is-on" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path class="badge-tick" d="m7.6 12.4 3 3 5.8-6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg class="badge is-off" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  }
  function log(text) { S.log.unshift('#' + (++S.logN) + ' ' + text); if (S.log.length > 10) S.log.pop(); }

  var maskSupport = 'webkitMaskImage' in document.documentElement.style || 'maskImage' in document.documentElement.style, markProbes = {};
  function probeMark(id) {
    if (markProbes[id]) return;
    var im = new Image(); markProbes[id] = 'loading';
    im.onload = function () { markProbes[id] = 'ok'; };
    im.onerror = function () {
      markProbes[id] = 'bad';
      Array.prototype.forEach.call(document.querySelectorAll('[data-mark="' + id + '"]'), function (el) { el.className += ' is-bad'; });
    };
    im.src = ICONS + id + '.svg';
  }
  /* Optical placement is identical for the CSS mask and the image fallback. */
  function markHtml(id, w, h, size) {
    var m = window.FrameIconMetrics && window.FrameIconMetrics[id], st;
    if (m) {
      var weight = clamp(Math.pow(0.45 / m.fill, 0.3), 0.84, 1.25);
      var k = Math.min(w / m.w, h / m.h, size * weight / Math.sqrt(m.w * m.h)), s = m.n * k;
      st = 'width:' + px(s) + ';height:' + px(s) + ';left:' + px(w / 2 - (m.x + m.w / 2) * k) + ';top:' + px(h / 2 - (m.y + m.h / 2) * k);
    } else st = 'width:' + w + 'px;height:' + h + 'px;left:0;top:0;object-fit:contain';
    probeMark(id);
    return '<span class="mark' + (markProbes[id] === 'bad' ? ' is-bad' : '') + '" data-mark="' + id + '" style="width:' + w + 'px;height:' + h + 'px">'
      + (maskSupport ? '<span class="mk" style="' + st + ';-webkit-mask-image:url(' + ICONS + id + '.svg);mask-image:url(' + ICONS + id + '.svg)"></span>' : '<img alt="" src="' + ICONS + id + '.svg" style="' + st + '">') + '</span>';
  }
  function appMark(a, w, h, size) {
    if (a.mark && (maskSupport || S.c.bg !== 'light')) return markHtml(a.brand || a.id, w, h, size);
    var words = a.name.split(/\s+/), letters = words[0].charAt(0) + (words.length > 1 ? words[1].charAt(0) : '');
    return '<span class="mark monogram' + (a.icon ? ' native-icon' : '') + '" style="width:' + w + 'px;height:' + h + 'px;font-size:' + Math.round(size * .65) + 'px"><span>' + esc(letters.toUpperCase()) + '</span>'
      + (a.icon ? '<img alt="" data-native-icon="true" src="' + esc(a.icon) + '">' : '') + '</span>';
  }
  function smallMark(a) { return appMark(a, 56, 44, 36); }
  var measureCanvas = document.createElement('canvas'), measureContext = measureCanvas.getContext('2d'), measureSpan = document.createElement('span');
  measureSpan.setAttribute('aria-hidden', 'true');
  measureSpan.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;white-space:pre;font-synthesis:none;';
  document.body.appendChild(measureSpan);
  function homeFont() { return S.shown && S.shown.font || 'inter'; }
  function fontRole(id, role, size) {
    var f = FONTS[id], serif = id === 'newsreader';
    return { family: f.family,
      weight: role === 'display' ? f.display : role === 'clock' ? f.clock : serif ? 400 : f.ui,
      opsz: serif ? role === 'display' ? 72 : role === 'clock' ? 48 : role === 'ui' && (!size || size === 28) ? 28 : 36 : 0 };
  }
  function measureFace(id, faces) {
    var result = { roles: {}, digits: [], digitCell: 0 }, roles = { display: [88, 76, 56], clock: [48], primary: [30, 32, 34, 36, 40], ui: [28, 30, 48] };
    var face = id === 'newsreader' ? faces[0][0] : null, original = face ? face.variationSettings : '', r, widths, min, max;
    Object.keys(roles).forEach(function (role) {
      result.roles[role] = {};
      // Canvas has no optical-size property. Set this face's default only while measuring;
      // CSS specifies each rendered role explicitly, and the descriptor is restored below.
      roles[role].forEach(function (size) {
        r = fontRole(id, role, size);
        if (face) face.variationSettings = r.opsz ? '"opsz" ' + r.opsz : original;
        measureContext.font = r.weight + ' ' + size + 'px "' + r.family + '"';
        var m = measureContext.measureText('H'), d = measureContext.measureText('gjpqy');
        result.roles[role][size] = { cap: m.actualBoundingBoxAscent || size * .72, ascent: m.fontBoundingBoxAscent || size * 1.066, descent: m.fontBoundingBoxDescent || size * .3, lower: d.actualBoundingBoxDescent || size * .255 };
      });
    });
    if (face) face.variationSettings = original;
    r = fontRole(id, 'clock');
    measureSpan.style.font = r.weight + ' 48px/64px "' + r.family + '"';
    measureSpan.style.letterSpacing = '0'; measureSpan.style.fontVariantNumeric = 'tabular-nums';
    measureSpan.style.fontVariationSettings = r.opsz ? '"opsz" ' + r.opsz : 'normal';
    widths = '0123456789'.split('').map(function (n) { measureSpan.textContent = n; return measureSpan.getBoundingClientRect().width; });
    min = Math.min.apply(Math, widths); max = Math.max.apply(Math, widths);
    result.digits = widths; result.digitCell = max - min > .02 ? max : 0;
    return result;
  }
  function fontChoices() {
    LOOK_VALUES.font = Object.keys(FONTS).filter(function (id) { return id === 'inter' || id === 'manrope' || PRIVATE_FONTS.indexOf(id) >= 0 && !unavailableFonts[id]; });
  }
  function retryFontFaces(id) {
    // A rejected CSS FontFace cannot load again. Recreate only that failed family's
    // rules; the displayed family's faces and the rest of the stylesheet stay intact.
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      var rules, i, rule, family, css;
      try { rules = sheet.cssRules; } catch (e) { return; }
      if (!rules) return;
      for (i = 0; i < rules.length; i++) {
        rule = rules[i];
        if (rule.type !== 5) continue;
        family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
        if (family !== FONTS[id].family) continue;
        css = rule.cssText; sheet.deleteRule(i); sheet.insertRule(css, i);
      }
    });
  }
  function loadFont(id, done) {
    var f = FONTS[id], weights = [f.display], timer, ended = false;
    if (fontMetrics[id]) { done(true); return; }
    if (!document.fonts || !document.fonts.load) { if (id === 'inter' || id === 'manrope') { fontMetrics[id] = measureFace(id, []); fontsReady = true; done(true); } else done(false, 'unsupported'); return; }
    if (unavailableFonts[id]) retryFontFaces(id);
    if (id !== 'newsreader' && weights.indexOf(f.ui) < 0) weights.push(f.ui);
    function finish(ok, reason, faces) {
      if (ended) return;
      ended = true; clearTimeout(timer);
      if (ok) {
        fontMetrics[id] = measureFace(id, faces); delete unavailableFonts[id];
        // Measurements and cached markup belong to a particular loaded font.
        widthCache = {}; fontRevision++;
        if (id === 'inter' || id === 'manrope') fontsReady = true;
      } else if (reason !== 'timeout') unavailableFonts[id] = true;
      fontChoices(); done(ok, reason);
    }
    timer = setTimeout(function () { finish(false, 'timeout'); }, 3000);
    Promise.all(weights.map(function (weight) { return document.fonts.load(weight + ' 88px "' + f.family + '"'); })).then(function (faces) {
      finish(faces.every(function (list) { return list.length > 0 && list.every(function (face) { return face.status === 'loaded'; }); }), 'load', faces);
    }, function () { finish(false, 'load'); });
  }
  var baselineRecovery = false;
  function ensureFont(id, done) {
    loadFont('manrope', function (ok, reason) {
      if (!ok) { fontMetrics.manrope = measureFace('manrope', []); fontMetrics.manrope.fallback = true; fontsReady = true; }
      if (id === 'manrope') {
        done(true, reason);
        return;
      }
      loadFont(id, function (idOk, idReason) {
        if (!idOk && id === 'inter') {
          fontMetrics.inter = measureFace('inter', []); fontMetrics.inter.fallback = true; fontsReady = true;
          done(true, idReason);
          if (!baselineRecovery && document.fonts && document.fonts.ready) {
            baselineRecovery = true;
            document.fonts.ready.then(function () {
              delete fontMetrics.inter; delete unavailableFonts.inter;
              loadFont('inter', function (loaded) {
                if (!loaded) { fontMetrics.inter = measureFace('inter', []); fontMetrics.inter.fallback = true; fontsReady = true; }
                render();
              });
            });
          }
          return;
        }
        done(idOk, idReason);
      });
    });
  }
  function fontShift(role, size) {
    var id = homeFont(), base = fontMetrics.manrope, metrics = fontMetrics[id], a, b;
    if (id === 'manrope' || !base || !metrics) return 0;
    a = base.roles[role][size]; b = metrics.roles[role][size];
    return (a.ascent - a.descent - a.cap - b.ascent + b.descent + b.cap) / 2;
  }
  function textWidth(text, size, weight, spacing, role) {
    var id = homeFont(), r = fontRole(id, role || 'ui', size), key, width;
    if (id !== 'manrope') { weight = r.weight; spacing = role === 'display' ? -size * .01 : 0; }
    key = [id, role || 'ui', text, size, weight, spacing].join('|');
    if (widthCache.hasOwnProperty(key)) return widthCache[key];
    if (r.opsz) {
      measureSpan.style.font = weight + ' ' + size + 'px "' + r.family + '"';
      measureSpan.style.fontVariationSettings = '"opsz" ' + r.opsz;
      measureSpan.style.fontVariantNumeric = 'normal'; measureSpan.style.letterSpacing = '0'; measureSpan.textContent = text;
      width = measureSpan.getBoundingClientRect().width;
    } else {
      measureContext.font = (weight || 500) + ' ' + size + 'px "' + r.family + '", Arial, sans-serif';
      width = measureContext.measureText(text).width;
    }
    width += Math.max(0, text.length - 1) * (spacing || 0);
    // Do not retain fallback measurements made before the baseline font is ready.
    if (fontMetrics[id] && !fontMetrics[id].fallback) widthCache[key] = width;
    return width;
  }
  function dockLabelSize(id) { return S.c.apps === 'text' ? (textWidth(app(id).name, 40, 600, -.8, 'primary') > 264 ? 34 : 40) : textWidth(app(id).name, 36, 500, -.8, 'primary') > 280 ? 32 : 36; }
  function reducedDockLabel(id) { return S.c.apps !== 'icons' && dockLabelSize(id) === (S.c.apps === 'text' ? 34 : 32); }
  function actionWidth(text) { return clamp(Math.ceil(textWidth(text, 30, 500, -.3) + 40), 288, 400); }
  function photoLabel(id, compact) {
    var text = app(id).name, size = compact ? 56 : 88, limit = compact ? 640 : 992, width = textWidth(text, size, 600, -1.8, 'display');
    if (!compact && width > limit) { size = 76; width = textWidth(text, size, 600, -1.8, 'display'); }
    // Newsreader's ninth compact Type row otherwise enters the lower fade by .63px.
    return { size: size, top: (compact ? 10.66 : size === 76 ? 10.36 : 9.68) + fontShift('display', size) - (compact && homeFont() === 'newsreader' ? .7 : 0), width: Math.min(limit, width), ellipsis: width > limit };
  }
  function listPlateWidth(id, compact) {
    if (S.c.apps === 'icons') return compact ? 120 : 144;
    var text = S.c.apps === 'text';
    return clamp(Math.ceil(photoLabel(id, compact).width + (text ? 84 : compact ? 156 : 184)), text ? 280 : 360, text ? compact ? 724 : 1076 : compact ? 796 : 1176);
  }

  /* Keyed children: elements persist by key so transforms animate instead of re-creating.
     Children are absolutely positioned, so DOM order never needs to change. */
  function keyed(parent, items, update, tag) {
    var map = parent._k || (parent._k = {}), seen = {}, i, it, el, isNew, k;
    for (i = 0; i < items.length; i++) {
      it = items[i]; el = map[it.key]; isNew = !el;
      if (isNew) { el = document.createElement(tag || 'div'); map[it.key] = el; }
      update(el, it, i);
      if (isNew) parent.appendChild(el);
      seen[it.key] = 1;
    }
    for (k in map) if (map.hasOwnProperty(k) && !seen[k]) { if (map[k].parentNode === parent) parent.removeChild(map[k]); delete map[k]; }
  }
  function setContent(el, sig, renderContent) {
    sig += '|' + catalog.revision + '|' + fontRevision;
    if (el._sig === sig) return;
    el.innerHTML = renderContent();
    el._sig = sig;
    Array.prototype.forEach.call(el.querySelectorAll('[data-native-icon]'), function (img) {
      function ready() { img.parentNode.classList.add('has-native-icon'); }
      function failed() { img.style.display = 'none'; img.parentNode.classList.remove('has-native-icon'); }
      img.onload = ready; img.onerror = failed;
      if (img.complete) { if (img.naturalWidth) ready(); else failed(); }
    });
  }
  function setHTML(el, html) { if (el._html !== html) { el._html = html; el.innerHTML = html; } }
  function attrs(el, z, i, action) { el.setAttribute('data-z', z); el.setAttribute('data-i', String(i)); el.setAttribute('data-action', action); }

  /* ---------- Saved preferences ---------- */
  function safeId(id) { return typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,160}$/.test(id) && ['constructor', 'prototype', '__proto__'].indexOf(id) < 0; }
  function safeIcon(path) { return typeof path === 'string' && path.length < 2048 && /^(?:\/[^\/]|file:\/\/\/|wgt-package:\/\/\/)/.test(path) ? path : ''; }
  function load() {
    var keys = [KEY, 'cleanframe.shore.v1'], raw, saved, i;
    for (i = 0; i < keys.length; i++) {
      try {
        raw = localStorage.getItem(keys[i]);
        if (!raw) continue;
        saved = JSON.parse(raw);
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) return saved;
      } catch (e) { storageOk = false; }
    }
    return null;
  }
  function clean(saved) {
    var s = saved && typeof saved === 'object' ? saved : {}, modern = s.look && typeof s.look === 'object' ? s.look : s;
    var legacyList = s.theme === 'list', h = [], recent = [], records = Array.isArray(s.appRecords) ? s.appRecords : [];
    records.slice(0, 256).forEach(function (a) {
      if (!a || !safeId(a.id) || !safeId(a.appId) || typeof a.name !== 'string' || !a.name.trim() || app(a.id)) return;
      APPS.push({ id: a.id, appId: a.appId, name: a.name.slice(0, 160), brand: ['hbomax', 'spotify', 'tubi'].indexOf(a.brand) >= 0 ? a.brand : '', mark: ['hbomax', 'spotify', 'tubi'].indexOf(a.brand) >= 0, icon: safeIcon(a.icon) });
    });
    (Array.isArray(s.home) ? s.home : Array.isArray(s.dock) ? s.dock : []).forEach(function (id) {
      if (!safeId(id) || h.indexOf(id) >= 0 || h.length >= CAP) return;
      if (!app(id) && id.indexOf('.') > 0) APPS.push({ id: id, appId: id, name: id.split('.').pop(), mark: false });
      if (app(id)) h.push(id);
    });
    if (!h.length) h = PRIMARY.slice();
    (Array.isArray(s.recent) ? s.recent : []).forEach(function (id) { if (safeId(id) && app(id) && h.indexOf(id) < 0 && recent.indexOf(id) < 0 && recent.length < 5) recent.push(id); });
    return {
      bg: pick(modern.bg, LOOK_VALUES.bg, legacyList ? 'dark' : 'photo'), layout: pick(modern.layout, LOOK_VALUES.layout, legacyList ? 'list' : saved ? 'dock' : 'cards'),
      apps: pick(modern.apps, LOOK_VALUES.apps, legacyList ? 'text' : 'both'), controls: pick(modern.controls, LOOK_VALUES.controls, 'both'),
      focus: pick(modern.focus, LOOK_VALUES.focus, legacyList ? 'type' : 'glass'), material: pick(modern.material, LOOK_VALUES.material, 'soft'),
      font: pick(modern.font, LOOK_VALUES.font, 'inter'), wall: wall(modern.wall || s.wallpaper) ? modern.wall || s.wallpaper : WALLS[0].id,
      home: h, recent: recent, lastApp: h.indexOf(s.lastApp) >= 0 ? s.lastApp : h[0],
      mode: pick(s.mode, MODES.map(function (m) { return m.id; }), 'fixed'),
      cardIdx: typeof s.cardIdx === 'number' && s.cardIdx >= 0 && s.cardIdx < SNAZZY_CARDS.length ? Math.floor(s.cardIdx) : 0,
      sounds: s.sounds === false ? false : true,
      todWall: s.todWall === false ? false : true,
      ambient: s.ambient === false ? false : true,
      ambientSleep: pick(s.ambientSleep, ['30', '60', 'off'], '30'),
      autoNight: s.autoNight === false ? false : true,
      bgMotion: pick(s.bgMotion, ['aerial', 'kenburns', 'static'], 'aerial'),
      pictureMode: pick(s.pictureMode, ['cinema', 'filmmaker', 'game', 'night'], 'cinema'),
      ports: (s.ports && s.ports.ps5 !== undefined) ? {
        appletv: [0, 1, 2, 3, 4].indexOf(s.ports.appletv) >= 0 ? s.ports.appletv : SNAZZY_DEFAULT_PORTS.appletv,
        ps5: [1, 2, 3, 4].indexOf(s.ports.ps5) >= 0 ? s.ports.ps5 : SNAZZY_DEFAULT_PORTS.ps5,
        switch: [1, 2, 3, 4].indexOf(s.ports.switch) >= 0 ? s.ports.switch : SNAZZY_DEFAULT_PORTS.switch
      } : {
        appletv: SNAZZY_DEFAULT_PORTS.appletv,
        ps5: SNAZZY_DEFAULT_PORTS.ps5,
        switch: SNAZZY_DEFAULT_PORTS.switch
      }
    };
  }
  function serialise(c) {
    var out = {};
    Object.keys(c).forEach(function (key) { out[key] = c[key]; });
    out.version = 2; out.look = lookOf(c); out.dock = c.home.slice(); out.wallpaper = c.wall;
    out.theme = c.layout === 'list' ? 'list' : 'shore';
    out.appRecords = [];
    c.home.concat(c.recent).forEach(function (key) {
      var a = app(key);
      if (a && PRIMARY.indexOf(key) < 0 && !out.appRecords.some(function (r) { return r.id === key; })) out.appRecords.push({ id: a.id, appId: a.appId, name: a.name, brand: a.brand || '', icon: a.icon || '' });
    });
    return out;
  }
  function initialise() {
    var saved = load(), initial; S.c = clean(saved); initial = next(S.c.home.slice(), S.c.recent.slice());
    S.stack = [{ id: 'home', f: { zone: 'apps', u: 0 } }];
    S.sel = S.c.lastApp; S.selIdx = S.c.home.indexOf(S.sel); S.cardIdx = S.c.cardIdx || 0;
    if (saved && initial.mode === 'open') initial.wall = WALLS[(wallIndex(initial.wall) + 1) % WALLS.length].id;
    // Keep the old schema keys alongside the builder values for in-place updates.
    try { localStorage.setItem(KEY, JSON.stringify(serialise(initial))); S.c = initial; storageOk = true; } catch (e) { storageOk = false; }
  }
  function clearSession() { S.undo = []; S.removedAt = {}; S.note = null; S.err = null; }
  function begin() { S.note = null; }
  function next(home, recent) {
    var c = lookOf(S.c);
    c.home = home; c.recent = recent; c.lastApp = S.c.lastApp; c.mode = S.c.mode;
    c.cardIdx = S.c.cardIdx;
    c.sounds = S.c.sounds !== false;
    c.todWall = S.c.todWall !== false;
    c.ambient = S.c.ambient !== false;
    c.ambientSleep = S.c.ambientSleep || '30';
    c.autoNight = S.c.autoNight !== false;
    c.bgMotion = S.c.bgMotion || 'aerial';
    c.pictureMode = S.c.pictureMode || 'cinema';
    c.ports = { appletv: S.c.ports.appletv, ps5: S.c.ports.ps5, switch: S.c.ports.switch };
    return c;
  }
  function snap() { return { home: S.c.home.slice(), recent: S.c.recent.slice() }; }
  function pushRecent(list, id) { return [id].concat(without(list, id)).slice(0, 5); }
  function write(c, label) {
    try { localStorage.setItem(KEY, JSON.stringify(serialise(c))); }
    catch (e) { storageOk = false; S.failed++; S.err = label; log('Not saved: ' + label); return false; }
    if (c.wall !== S.c.wall || c.mode !== S.c.mode) resetRotation();
    storageOk = true; S.c = c; S.writes++; S.err = null; log('Saved: ' + label);
    return true;
  }
  function errText(lifted) {
    return 'Couldn’t save. Nothing changed.';
  }
  function statusHtml(def, lifted) {
    if (S.err) return '<span class="warn error-chip">' + esc(errText(lifted)) + '</span>';
    return esc(S.note || def);
  }

  function ensureSel() {
    var h = S.c.home, i;
    if (!h.length) { S.sel = null; return -1; }
    i = h.indexOf(S.sel);
    if (i < 0) { i = clamp(S.selIdx, 0, h.length - 1); S.sel = h[i]; }
    S.selIdx = i;
    return i;
  }
  function setSel(id) { S.sel = id; S.selIdx = S.c.home.indexOf(id); }

  /* Membership and order operations shared by B and C. A works on slots (below). */
  function homeRemove(id) {
    var a = app(id), i = S.c.home.indexOf(id), before = snap(), h;
    if (i < 0) return false;
    if (S.c.home.length <= 1) { S.note = LAST; return false; }
    h = S.c.home.slice(); h.splice(i, 1);
    if (!write(next(h, pushRecent(S.c.recent, id)), 'Remove ' + a.name + ' from Home')) return false;
    S.removedAt[id] = i;
    S.undo.push({ label: 'Remove ' + a.name, snap: before });
    return true;
  }
  function homeAdd(id) {
    var a = app(id), before = snap(), h = S.c.home.slice(), at;
    if (h.length >= CAP) { S.note = FULL; return false; }
    at = S.removedAt.hasOwnProperty(id) ? Math.min(S.removedAt[id], h.length) : h.length;
    h.splice(at, 0, id);
    if (!write(next(h, without(S.c.recent, id)), 'Add ' + a.name + ' to Home')) return false;
    S.undo.push({ label: 'Add ' + a.name, snap: before });
    return true;
  }
  function homeMove(order, id, before) {
    var a = app(id);
    if (!write(next(order, S.c.recent.slice()), 'Move ' + a.name)) return false;
    S.undo.push({ label: 'Move ' + a.name, snap: before });
    return true;
  }
  function undoLast(arr) {
    var u = S.undo[S.undo.length - 1];
    if (!u) { S.note = 'Nothing to undo'; return false; }
    if (!write(next(u.snap.home.slice(), u.snap.recent.slice()), 'Undo ' + u.label)) return false;
    S.undo.pop();
    S.note = 'Undone: ' + u.label + '.';
    return true;
  }
  function undoLabel() { var u = S.undo[S.undo.length - 1]; return u ? u.label : ''; }
  function undoCaption() { var label = undoLabel(); return label ? 'Undo ' + label.charAt(0).toLowerCase() + label.slice(1) : 'Nothing to undo'; }
  function editStatus(hint, move) {
    if (S.err) return statusHtml('', !!move);
    if (S.note === FULL || S.note === LAST) return '<span class="warn">' + esc(S.note) + '</span>';
    if (hint === FULL || hint === LAST) return '<span class="warn">' + esc(hint) + '</span>';
    return esc(move || hint || S.note || '');
  }

  var busy = false, busyTimer = 0;
  function release() { busy = false; clearTimeout(busyTimer); S.press = null; }
  function message(title, line, note) {
    push({ id: 'message', msg: 'error', content: { title: title, line: line, note: note || '', actions: [['back', 'Back']] }, f: { b: 0 } });
  }
  function perform(title, run) {
    if (busy) return;
    busy = true; busyTimer = setTimeout(release, 10000);
    run(function (err) {
      release();
      if (err) message(title, err.message || 'The TV could not open this screen.', err.detail || '');
      render(); syncRotation();
    });
  }
  function launch(id) {
    var a = app(id), c;
    if (!a || busy) return;
    if (S.c.home.indexOf(id) >= 0) { c = next(S.c.home.slice(), S.c.recent.slice()); c.lastApp = id; write(c, 'Last app'); }
    S.press = id; S.lastLaunch = a.name;
    perform(a.name, function (done) { FrameDevice.launchApp(a.appId, done); });
  }
  function refreshCatalog() {
    var request, oldFocus;
    if (catalog.loading) return;
    request = ++catalog.request; catalog.loading = true; catalog.error = null;
    FrameDevice.apps(function (err, entries) {
      if (request !== catalog.request) return;
      catalog.loading = false;
      if (err) { catalog.error = err.message || 'Could not read installed apps.'; if (!catalog.loaded) ALPHA = []; render(); return; }
      oldFocus = top().id === 'apps' ? ALPHA[top().f.i] : null;
      ALPHA = [];
      entries.forEach(function (entry) {
        var id = PRIMARY.indexOf(entry.brand) >= 0 ? entry.brand : entry.appId, a;
        if (!safeId(id) || !safeId(entry.appId) || ALPHA.indexOf(id) >= 0) return;
        a = app(id);
        if (!a) { a = { id: id }; APPS.push(a); }
        a.appId = entry.appId; a.brand = entry.brand || ''; a.mark = !!entry.brand;
        a.icon = safeIcon(entry.icon);
        a.name = PRIMARY.indexOf(id) >= 0 ? PRIMARY_APPS[PRIMARY.indexOf(id)].name : String(entry.name).slice(0, 160);
        ALPHA.push(id);
      });
      ALPHA.sort(function (a, b) { return app(a).name.toLowerCase().localeCompare(app(b).name.toLowerCase()); });
      catalog.loaded = true; catalog.error = null; catalog.revision++;
      if (top().id === 'apps' && oldFocus && ALPHA.indexOf(oldFocus) >= 0) top().f.i = ALPHA.indexOf(oldFocus);
      norm(); render();
    });
  }

  /* ---------- Navigation targets ---------- */
  function utils() { return S.c.layout === 'cards' ? ['settings'] : ['apps', 'settings']; }
  /* prev/next run along the apps; out goes to the controls, inn comes back (or to a per-app action). */
  function axes() {
    var v = S.c.layout === 'list';
    return { prev: v ? 'up' : 'left', next: v ? 'down' : 'right', out: v ? 'right' : 'up', inn: v ? 'left' : 'down' };
  }
  function utilAction(u) {
    if (u === 'apps') openApps();
    else openSettings();
  }
  /* ---------- Tactile UI sounds (Web Audio API, zero external assets) ---------- */
  var audioCtx = null;
  function getAudioCtx() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) { try { audioCtx = new Ctx(); } catch (e) { return null; } }
    if (audioCtx.state === 'suspended') { try { audioCtx.resume(); } catch (e) { /* ignore */ } }
    return audioCtx;
  }
  function tone(ctx, freqStart, freqEnd, startAt, dur, peak, type) {
    var osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freqStart, startAt);
    if (freqEnd && freqEnd !== freqStart) osc.frequency.exponentialRampToValueAtTime(freqEnd, startAt + dur);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.01);
  }
  function playUiSound(kind, step) {
    if (S.c && S.c.sounds === false) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime, idx = typeof step === 'number' ? step : 0;
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
    } catch (e) { /* Ignore audio restrictions */ }
  }

  function activateCard(idx) {
    var card = SNAZZY_CARDS[idx], c;
    if (!card || busy || S.switching) return;
    playUiSound('select');
    c = next(S.c.home.slice(), S.c.recent.slice()); c.cardIdx = idx; write(c, 'Selected device');
    S.switching = { id: card.id, name: card.name, kind: card.kind, port: S.c.ports[card.id] || 1, status: 'switching', error: null };
    render();
    if (card.kind === 'settings') {
      FrameDevice.settings(function (err) {
        if (!S.switching || S.switching.id !== card.id) return;
        if (err) { S.switching.status = 'error'; S.switching.error = err.message || 'Could not open TV settings.'; render(); }
      });
    } else if (card.kind === 'hdmi') {
      var port = S.c.ports[card.id] || 1;
      if (port === 0) {
        FrameDevice.launchApp('com.apple.appletv', function (err) {
          if (!S.switching || S.switching.id !== card.id) return;
          if (err) { S.switching.status = 'error'; S.switching.error = err.message || 'Could not launch Apple TV app.'; render(); }
        });
      } else {
        FrameDevice.setSource(port, function (err) {
          if (!S.switching || S.switching.id !== card.id) return;
          if (err && !err.cancelled) { S.switching.status = 'error'; S.switching.error = err.message || ('Could not switch to HDMI ' + port + '.'); render(); }
        });
      }
    }
  }
  function cancelSwitching() {
    if (!S.switching) return;
    FrameDevice.cancelSource();
    S.switching = null;
  }
  function addAppsRoute() { openEditor('home'); }
  function openSettings() { push({ id: 'settings', f: { id: S.settingsFocus } }); }
  function openAppearance(group) {
    var axis = { background: 'bg', layout: 'layout', typography: 'font', focus: 'focus' }[group];
    var action = S.detailFocus[group] || (axis ? 'choice.' + axis + '.' + S.c[axis] : group === 'rotation' ? 'rotation.' + S.c.mode : 'samsung.home');
    push({ id: 'appearance', group: group, f: { action: action } });
  }
  function openMessage(key) { push({ id: 'message', msg: key, f: { b: 0 } }); }
  function openApps() {
    var e = { id: 'apps', mode: 'browse', top: 0, f: { zone: 'grid', i: Math.max(0, ALPHA.indexOf(S.appsFocus)), h: 0 } };
    push(e); refreshCatalog(); return e;
  }
  function openEditor(origin) {
    var i = ensureSel();
    clearSession();
    refreshCatalog();
    push({ id: 'editor', origin: origin, lifted: null, top: 0, otherReturn: { id: otherList()[0] || null, index: 0, top: 0 }, f: { zone: S.c.home.length ? 'home' : 'other', i: Math.max(0, i), part: 'name', h: 1, j: 0 } });
  }
  function openWallpaper() {
    var i = wallIndex(S.c.wall);
    S.err = null; S.wallError = null;
    push({ id: 'wallpaper', i: i, top: clamp(i - 2, 0, Math.max(0, WALLS.length - WALL_VISIBLE)), f: { zone: 'photo' },
      previewTimer: 0, previewDue: null, applyPending: null, failedId: null, failedApply: false, retryBundle: null });
  }
  function isSettingsDetail(t) { return t.id === 'appearance' || t.id === 'wallpaper'; }

  var V = {};

  /* ---------- Home (browse) ---------- */
  V.home = {
    key: function (t, k) {
      var f = t.f, h = S.c.home, U = utils(), x = axes(), i = ensureSel();
      if (S.c.layout === 'cards') { cardsHomeKey(t, k, U); return; }
      if (S.c.layout === 'list') { listHomeKey(t, k, i, U); return; }
      if (f.zone === 'util') {
        f.u = clamp(f.u, 0, U.length - 1);
        if (k === x.prev && f.u > 0) f.u--;
        else if (k === x.next && f.u < U.length - 1) f.u++;
        else if (k === x.inn || k === 'back') f.zone = 'apps';
        else if (k === 'ok') { S.lastUtil = f.u; utilAction(U[f.u]); return; }
        S.lastUtil = f.u;
        return;
      }
      f.zone = 'apps';
      if (k === x.out) { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); }
      else if (k === 'back') openMessage('leave');
      else if (!h.length) { if (k === 'ok') addAppsRoute(); }
      else if (k === x.prev && i > 0) setSel(h[i - 1]);
      else if (k === x.next && i < h.length - 1) setSel(h[i + 1]);
      else if (k === 'ok') launch(S.sel);
    },
    point: function (t, z, i) {
      if (z === 'snazzy-back') { playUiSound('back'); cancelSwitching(); return; }
      if (z === 'snazzy-card') { t.f.zone = 'apps'; S.cardIdx = clamp(i, 0, SNAZZY_CARDS.length - 1); activateCard(S.cardIdx); return; }
      if (z === 'util') { t.f.zone = 'util'; t.f.u = i; S.lastUtil = i; }
      else if (z === 'app') { t.f.zone = 'apps'; setSel(S.c.home[i]); }
      else if (z === 'empty') t.f.zone = 'apps';
      else return;
      this.key(t, 'ok');
    }
  };
  function cardsHomeKey(t, k, U) {
    var f = t.f, n = SNAZZY_CARDS.length;
    if (S.switching) {
      if (k === 'back') { playUiSound('back'); cancelSwitching(); }
      else if (k === 'ok' && S.switching.status === 'error') activateCard(S.cardIdx);
      return;
    }
    S.cardIdx = clamp(typeof S.cardIdx === 'number' ? S.cardIdx : 0, 0, n - 1);
    if (f.zone === 'util') {
      f.u = clamp(f.u, 0, U.length - 1);
      if (k === 'left' && f.u > 0) { f.u--; playUiSound('move', f.u); }
      else if (k === 'right' && f.u < U.length - 1) { f.u++; playUiSound('move', f.u); }
      else if (k === 'down' || k === 'back') { f.zone = 'apps'; playUiSound(k === 'back' ? 'back' : 'move', S.cardIdx); }
      else if (k === 'ok') { playUiSound('select'); S.lastUtil = f.u; utilAction(U[f.u]); return; }
      S.lastUtil = f.u;
      return;
    }
    f.zone = 'apps';
    if (k === 'left') {
      if (S.cardIdx > 0) { S.cardIdx--; playUiSound('move', S.cardIdx); }
      else playUiSound('edge');
    } else if (k === 'right') {
      if (S.cardIdx < n - 1) { S.cardIdx++; playUiSound('move', S.cardIdx); }
      else playUiSound('edge');
    } else if (k === 'up') { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); playUiSound('move', 2); }
    else if (k === 'down') { playUiSound('move'); enterAmbient(); return; }
    else if (k === 'back') { playUiSound('back'); openMessage('leave'); }
    else if (k === 'ok') activateCard(S.cardIdx);
  }
  function listHomeKey(t, k, i, U) {
    var f = t.f, h = S.c.home;
    if (f.zone === 'util') {
      f.u = clamp(f.u, 0, U.length - 1);
      if (k === 'up' && f.u > 0) f.u--;
      else if (k === 'down' && f.u < U.length - 1) f.u++;
      else if (k === 'left' || k === 'back') f.zone = 'apps';
      else if (k === 'ok') { S.lastUtil = f.u; utilAction(U[f.u]); return; }
      S.lastUtil = f.u;
      return;
    }
    f.zone = 'apps';
    if (k === 'up' && i > 0) setSel(h[i - 1]);
    else if (k === 'right') { f.zone = 'util'; f.u = clamp(S.lastUtil, 0, U.length - 1); }
    else if (k === 'down' && i < h.length - 1) setSel(h[i + 1]);
    else if (k === 'back') openMessage('leave');
    else if (k === 'ok') { if (h.length) launch(S.sel); else addAppsRoute(); }
  }

  /* ---------- Wallpaper child: focus previews, activation applies ---------- */
  function cancelWallpaperTimer(t) {
    clearTimeout(t.previewTimer); t.previewTimer = 0; t.previewDue = null;
  }
  function failWallpaper(t, id, apply, bundle) {
    t.applyPending = null; t.failedId = id; t.failedApply = apply; t.retryBundle = bundle || null;
    restoreLook();
    if (!bundle) S.wallError = id;
  }
  function applyWallpaper(t, prepared) {
    var w = WALLS[t.i], c, bundle = prepared || S.previewBundle;
    if (!prepared && (S.wallPending || t.previewDue || S.wallShown !== w.id || S.wallError)) {
      t.applyPending = w.id;
      if (t.previewDue || S.wallPending !== w.id) { cancelWallpaperTimer(t); loadWallpaperPreview(t); }
      return;
    }
    t.applyPending = null;
    if (w.id === S.c.wall) { S.err = null; t.failedId = null; t.failedApply = false; t.retryBundle = null; return; }
    if (!bundle || bundle.key !== bundleKey({ wall: w.id, material: S.c.material })) { t.applyPending = w.id; loadWallpaperPreview(t); return; }
    c = next(S.c.home.slice(), S.c.recent.slice()); c.wall = w.id;
    if (!write(c, 'Wallpaper ' + w.name)) { failWallpaper(t, w.id, true, bundle); return; }
    installBundle(bundle, c); committedBundle = bundle; S.previewBundle = null;
    t.failedId = null; t.failedApply = false; t.retryBundle = null;
  }
  function loadWallpaperPreview(t) {
    var id = WALLS[t.i].id;
    cancelWallpaperTimer(t);
    showWall(id, function (ok) {
      if (top() !== t || WALLS[t.i].id !== id) return;
      if (!ok) failWallpaper(t, id, t.applyPending === id, null);
      else if (t.applyPending === id) applyWallpaper(t);
      render(); syncRotation();
    });
  }
  function previewWallpaper(t, index, apply, immediate) {
    var id, target;
    cancelWallpaperTimer(t); cancelLook();
    t.i = index; t.f.zone = 'photo'; id = WALLS[index].id;
    t.applyPending = apply ? id : null; t.failedId = null; t.failedApply = false; t.retryBundle = null;
    S.err = null; S.wallError = null;
    if (id === S.c.wall && committedBundle) {
      installBundle(committedBundle, S.c, true); S.previewBundle = null;
      if (apply) applyWallpaper(t);
      return;
    }
    if (S.wallShown === id && S.previewBundle && S.previewBundle.key === bundleKey({ wall: id, material: S.c.material })) {
      if (apply) applyWallpaper(t);
      return;
    }
    if (apply || immediate) { loadWallpaperPreview(t); return; }
    target = lookOf(S.c); target.wall = id;
    S.pending = { patch: { wall: id }, target: target, row: 'bg', preview: true, transient: false, deferred: true };
    t.previewDue = id;
    t.previewTimer = setTimeout(function () { if (top() === t && WALLS[t.i].id === id) loadWallpaperPreview(t); }, WALL_DELAY);
  }
  function retryWallpaper(t) {
    var apply = t.failedApply, bundle = t.retryBundle;
    t.f.zone = 'photo';
    if (bundle && apply) applyWallpaper(t, bundle);
    else previewWallpaper(t, t.i, apply, true);
  }
  function closeWallpaper(t) {
    cancelWallpaperTimer(t); t.applyPending = null; S.err = null; pop(); restoreLook();
    if (top().id === 'appearance' && top().group === 'background') detailFocus(top(), { action: 'background.wallpaper' }, 0);
  }
  V.wallpaper = {
    norm: function (t) {
      t.i = clamp(t.i, 0, WALLS.length - 1);
      if (t.f.zone === 'retry' && !t.failedId) t.f.zone = 'photo';
      if (t.i < t.top) t.top = t.i;
      if (t.i >= t.top + WALL_VISIBLE) t.top = t.i - WALL_VISIBLE + 1;
      t.top = clamp(t.top, 0, Math.max(0, WALLS.length - WALL_VISIBLE));
    },
    key: function (t, k) {
      if (k === 'back') { playUiSound('back'); closeWallpaper(t); return; }
      if (t.f.zone === 'back') {
        if (k === 'ok') { playUiSound('back'); closeWallpaper(t); }
        else if (k === 'down' || k === 'right') { t.f.zone = 'photo'; playUiSound('move'); }
        return;
      }
      if (t.f.zone === 'retry') {
        if (k === 'ok') { playUiSound('select'); retryWallpaper(t); }
        else if (k === 'up' || k === 'left') { t.f.zone = 'photo'; playUiSound('move'); }
        return;
      }
      if (k === 'left' || k === 'up' && t.i === 0) { t.f.zone = 'back'; t.applyPending = null; playUiSound('move'); }
      else if (k === 'up' && t.i > 0) { previewWallpaper(t, t.i - 1, false); playUiSound('move'); }
      else if (k === 'down' && t.i < WALLS.length - 1) { previewWallpaper(t, t.i + 1, false); playUiSound('move'); }
      else if ((k === 'right' || k === 'down') && t.failedId) { t.f.zone = 'retry'; playUiSound('move'); }
      else if (k === 'ok') { playUiSound('select'); if (t.retryBundle) applyWallpaper(t, t.retryBundle); else applyWallpaper(t); }
    },
    point: function (t, z, i) {
      if (z === 'wall-back') closeWallpaper(t);
      else if (z === 'wall-retry') retryWallpaper(t);
      else if (z === 'wall-choice' && i >= 0 && i < WALLS.length) {
        if (i === t.i) { t.f.zone = 'photo'; this.key(t, 'ok'); }
        else previewWallpaper(t, i, true);
      }
    }
  };

  /* ---------- Installed apps ---------- */
  function appsItems() { return catalog.error ? [] : ALPHA; }
  function appsHead() { return catalog.error ? [['retry', 'Try again', '', '']] : [['editor', 'Apps on Home', '', 'home']]; }
  V.apps = {
    sheet: true,
    norm: function (t) {
      var n = appsItems().length;
      t.f.i = clamp(t.f.i, 0, Math.max(0, n - 1));
      if (!n) t.f.zone = 'head';
    },
    key: function (t, k) {
      var f = t.f, items = appsItems(), n = items.length, col = f.i % COLS, row = Math.floor(f.i / COLS);
      if (k === 'back') { pop(); return; }
      if (f.zone === 'head') {
        if (k === 'down' && n) f.zone = 'grid';
        else if (k === 'ok') { if (catalog.error) refreshCatalog(); else openEditor('apps'); }
        return;
      }
      if (k === 'left' && col > 0) f.i--;
      else if (k === 'right' && col < COLS - 1 && f.i < n - 1) f.i++;
      else if (k === 'down' && row < Math.ceil(n / COLS) - 1) f.i = Math.min(f.i + COLS, n - 1);
      else if (k === 'up') { if (row > 0) f.i -= COLS; else f.zone = 'head'; }
      else if (k === 'ok' && n) launch(items[f.i]);
      S.appsFocus = items[f.i] || null;
    },
    point: function (t, z, i) { if (z === 'grid') { t.f.zone = 'grid'; t.f.i = i; } else if (z === 'head') t.f.zone = 'head'; else return; this.key(t, 'ok'); }
  };

  /* ---------- B: two-zone Home editor ---------- */
  function otherGroups() {
    var rec = S.c.recent.filter(function (id) { return !onHome(id) && app(id); });
    return { recent: rec, rest: ALPHA.filter(function (id) { return !onHome(id) && rec.indexOf(id) < 0; }) };
  }
  function otherList() { var o = otherGroups(); return o.recent.concat(o.rest); }
  function editorCut() { return 5; }
  function editorHomeY(i) { return i * ED_ROW + (i >= editorCut() ? 24 : 0); }
  function editorOtherY(j) {
    var o = otherGroups();
    return j * ED_ROW + (o.recent.length ? ED_SEP : 0) + (o.recent.length && j >= o.recent.length ? ED_SEP : 0);
  }
  function rememberOther(t) {
    var list = otherList();
    t.otherReturn = { id: list[t.f.j] || null, index: t.f.j, top: t.top };
  }
  function returnOther(t) {
    var list = otherList(), memory = t.otherReturn, i = memory ? list.indexOf(memory.id) : -1;
    t.f.zone = 'other';
    t.f.j = i >= 0 ? i : clamp(memory ? memory.index : 0, 0, Math.max(0, list.length - 1));
    if (memory) t.top = memory.top;
  }
  function nearestHome(t, count) {
    var target = editorOtherY(t.f.j) - t.top + 36, best = 0, distance = Infinity, i, d;
    for (i = 0; i < count; i++) {
      d = Math.abs(editorHomeY(i) + 36 - target);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  }
  V.editor = {
    sheet: true,
    norm: function (t) {
      var f = t.f, nh = (t.lifted ? t.lifted.order : S.c.home).length, no = otherList().length;
      f.i = clamp(f.i, 0, Math.max(0, nh - 1));
      f.j = clamp(f.j, 0, Math.max(0, no - 1));
      if (f.zone === 'home' && !nh) f.zone = no ? 'other' : 'head';
      if (f.zone === 'other' && !no) f.zone = nh ? 'home' : 'head';
    },
    key: function (t, k) {
      var f = t.f, H = t.lifted ? t.lifted.order : S.c.home, O = otherList(), nh = H.length, no = O.length, d, tmp;
      if (t.lifted) {
        d = k === 'up' ? -1 : k === 'down' ? 1 : 0;
        if (d && f.i + d >= 0 && f.i + d < nh) { tmp = H[f.i + d]; H[f.i + d] = H[f.i]; H[f.i] = tmp; f.i += d; S.err = null; }
        else if (k === 'ok') editorPlace(t);
        else if (k === 'back') { f.i = t.lifted.from; t.lifted = null; S.err = null; }
        return;
      }
      if (k === 'back') { closeEditor(t); return; }
      if (f.zone === 'head') {
        if (k === 'left' && f.h > 0) f.h--;
        else if (k === 'right' && f.h < 1) f.h++;
        else if (k === 'down') { if (no) returnOther(t); else if (nh) f.zone = 'home'; }
        else if (k === 'ok') { begin(); if (f.h === 0) undoLast(null); else closeEditor(t); }
      } else if (f.zone === 'home') {
        if (k === 'up') { if (f.i > 0) f.i--; else f.zone = 'head'; }
        else if (k === 'down') { if (f.i < nh - 1) f.i++; }
        else if (k === 'right') { if (f.part === 'name') f.part = 'remove'; else if (no) returnOther(t); }
        else if (k === 'left') { if (f.part === 'remove') f.part = 'name'; }
        else if (k === 'ok') {
          begin();
          if (f.part === 'name') t.lifted = { id: H[f.i], from: f.i, order: H.slice(), snap: snap() };
          else editorRemove(t, H[f.i]);
        }
      } else {
        if (k === 'up') { if (f.j > 0) { f.j--; rememberOther(t); } else f.zone = 'head'; }
        else if (k === 'down') { if (f.j < no - 1) { f.j++; rememberOther(t); } }
        else if (k === 'left') { if (nh) { rememberOther(t); f.i = nearestHome(t, nh); f.zone = 'home'; f.part = 'name'; } }
        else if (k === 'ok') { begin(); editorAdd(t, O[f.j]); }
      }
    },
    point: function (t, z, i) {
      if (t.lifted) { if (z === 'name' && i === t.f.i) this.key(t, 'ok'); return; }
      if (z === 'name' || z === 'remove') { t.f.zone = 'home'; t.f.i = i; t.f.part = z; }
      else if (z === 'other') { t.f.zone = 'other'; t.f.j = i; rememberOther(t); }
      else if (z === 'head') { t.f.zone = 'head'; t.f.h = i; }
      else return;
      this.key(t, 'ok');
    }
  };
  /* Focus follows the app between zones, so a repeated OK toggles the same app. */
  function editorRemove(t, id) {
    if (!homeRemove(id)) return;
    t.f.zone = 'other'; t.f.j = otherList().indexOf(id);
    S.note = app(id).name + ' is in Recently removed. OK puts it back.';
  }
  function editorAdd(t, id) {
    rememberOther(t);
    if (!homeAdd(id)) return;
    var remaining = otherList(), at = clamp(t.otherReturn.index, 0, Math.max(0, remaining.length - 1));
    t.otherReturn.id = remaining[at] || null; t.otherReturn.index = at;
    t.f.zone = 'home'; t.f.i = S.c.home.indexOf(id); t.f.part = 'remove';
    S.note = app(id).name + ' is on Home, position ' + (t.f.i + 1) + '.';
  }
  function editorPlace(t) {
    var L = t.lifted;
    begin();
    if (same(L.order, S.c.home)) { t.lifted = null; return; }
    if (!homeMove(L.order.slice(), L.id, L.snap)) return;
    t.lifted = null;
    S.note = app(L.id).name + ' moved to position ' + (t.f.i + 1) + '.';
  }
  function closeEditor() { clearSession(); pop(); }

  /* ---------- Settings, Layout and messages ---------- */
  function mode() { for (var i = 0; i < MODES.length; i++) if (MODES[i].id === S.c.mode) return MODES[i]; return MODES[0]; }
  function settingsRows() {
    if (S.c.layout === 'cards') {
      return [
        { id: 'devices', label: 'Device HDMI Ports', value: 'HDMI 1, 3 & 4' },
        { id: 'motion', label: 'Background & Aerials', value: BG_MOTION_NAMES[S.c.bgMotion] || 'Aerial video' },
        { id: 'preferences', label: 'Ambient & Audio', value: (S.c.ambient !== false ? 'OLED ambient on' : 'Ambient off') + ' · ' + (S.c.sounds !== false ? 'Sounds on' : 'Muted') },
        { id: 'samsung', label: 'LG TV', value: 'Inputs, TV settings & LG Home' }
      ];
    }
    var n = S.c.home.length;
    return [{ id: 'background', label: 'Background', value: S.c.bg === 'photo' ? wall(S.c.wall).name : VALUE_NAMES[S.c.bg] },
      { id: 'layout', label: 'Layout', value: VALUE_NAMES[S.c.layout] },
      { id: 'typography', label: 'Typography', value: FONTS[S.c.font].name },
      { id: 'focus', label: 'Focus', value: VALUE_NAMES[S.c.focus] + (materialApplies() ? ', ' + VALUE_NAMES[S.c.material] : '') },
      { id: 'editor', label: 'Apps on Home', value: n + (n === 1 ? ' app' : ' apps') },
      { id: 'samsung', label: 'LG TV', value: 'HDMI ports and TV settings' }];
  }
  function settingsIds() { return settingsRows().map(function (r) { return r.id; }); }
  V.settings = {
    sheet: true,
    norm: function (t) { var ids = settingsIds(); if (ids.indexOf(t.f.id) < 0) t.f.id = ids[0]; },
    key: function (t, k) {
      var ids = settingsIds(), i = Math.max(0, ids.indexOf(t.f.id));
      if (k === 'up') { if (i > 0) { i--; playUiSound('move'); } else playUiSound('edge'); }
      else if (k === 'down') { if (i < ids.length - 1) { i++; playUiSound('move'); } else playUiSound('edge'); }
      else if (k === 'back') { playUiSound('back'); pop(); return; }
      t.f.id = ids[i]; S.settingsFocus = ids[i];
      if (k === 'ok') { playUiSound('select'); settingsOk(ids[i]); }
    },
    point: function (t, z, i, id) { if (z === 'row' && id) { t.f.id = id; this.key(t, 'ok'); } }
  };
  function settingsOk(id) {
    if (id === 'editor') openEditor('settings');
    else openAppearance(id);
  }
  var DETAIL_NAMES = { background: 'Background', layout: 'Layout', typography: 'Typography', focus: 'Focus', rotation: 'Rotation', samsung: 'LG TV', inputs: 'Inputs', devices: 'Device Ports', motion: 'Background & Aerials', preferences: 'Ambient & Audio' };
  function choice(axis, value, disabled) {
    return { action: axis === 'mode' ? 'rotation.' + value : 'choice.' + axis + '.' + value, axis: axis, value: value, disabled: !!disabled,
      label: axis === 'font' ? FONTS[value].name : axis === 'mode' ? MODES.filter(function (m) { return m.id === value; })[0].name : value === 'both' ? 'Both' : VALUE_NAMES[value] };
  }
  function portChoice(dev, port) {
    return { action: 'port.' + dev + '.' + port, portDev: dev, portVal: port, disabled: false, label: port === 0 ? 'TV App' : 'HDMI ' + port };
  }
  function detailSections(t) {
    var flat = S.c.bg !== 'photo', inactive = !materialApplies();
    function options(axis, values, disabled) { return values.map(function (value) { return choice(axis, value, disabled); }); }
    if (t.group === 'devices') return [
      { id: 'appletv_port', title: 'Apple TV', horizontal: true, items: [1, 2, 3, 4, 0].map(function (p) { return portChoice('appletv', p); }) },
      { id: 'ps5_port', title: 'PS5', horizontal: true, items: [1, 2, 3, 4].map(function (p) { return portChoice('ps5', p); }) },
      { id: 'switch_port', title: 'Nintendo Switch', horizontal: true, items: [1, 2, 3, 4].map(function (p) { return portChoice('switch', p); }) }
    ];
    if (t.group === 'inputs') return [{ id: 'inputs', title: '', items: t.inputs.length ? t.inputs.map(function (input) {
      return { action: 'input.' + input.number, label: input.name, description: input.active ? 'Active' : input.connected ? 'Connected' : 'Disconnected — may be asleep' };
    }) : [{ action: 'inputs.retry', label: t.loading ? 'Loading inputs…' : 'Try again', disabled: t.loading }],
      reason: t.inputError || (!t.loading && !t.inputs.length ? 'No HDMI inputs were reported by this TV.' : '') }];
    if (t.group === 'background') return [
      { id: 'bg', title: 'Background type', items: options('bg', ['photo', 'light', 'dark']) },
      { id: 'wall', title: 'Wallpaper', items: [{ action: 'background.wallpaper', label: wall(S.c.wall).name, thumbnail: true, disabled: flat }] },
      { id: 'rotation', title: 'Rotation', items: [{ action: 'background.rotation', label: mode().name, disabled: flat }], reason: flat ? 'Choose Photo to use wallpaper and rotation.' : '' }
    ];
    if (t.group === 'layout') return [
      { id: 'layout', title: 'Layout', horizontal: true, items: options('layout', ['cards', 'list', 'dock']) },
      { id: 'apps', title: 'App display', horizontal: true, items: options('apps', ['text', 'icons', 'both']) },
      { id: 'controls', title: 'Home controls', horizontal: true, items: options('controls', ['text', 'icons', 'both']) }
    ];
    if (t.group === 'typography') return [{ id: 'font', title: '', items: options('font', LOOK_VALUES.font) }];
    if (t.group === 'focus') return [
      { id: 'focus', title: 'Focus style', horizontal: true, items: options('focus', ['type', 'glass']) },
      { id: 'material', title: 'Material', horizontal: true, items: options('material', ['soft', 'frost', 'tint'], inactive),
        reason: inactive ? flat ? 'Materials are available with a Photo background.' : 'Choose Glass focus or the Dock layout to use materials.' : '' }
    ];
    if (t.group === 'rotation') return [{ id: 'mode', title: '', items: options('mode', MODES.map(function (m) { return m.id; }), flat),
      reason: flat ? 'Choose Photo in Background to use rotation.' : 'Timed changes pause while Settings or another panel is open.' }];
    if (t.group === 'motion') return [
      { id: 'bg_motion', title: 'Motion & Aerials', items: [
        { action: 'samsung.bgMotion', label: 'Background motion: ' + (BG_MOTION_NAMES[S.c.bgMotion] || 'Aerial video'), description: 'Cycle between Yosemite & Scottish Highlands mountain Aerials, Motion photos, or Static' },
        { action: 'samsung.todWall', label: 'Time-of-day wallpapers: ' + (S.c.todWall !== false ? 'On' : 'Off'), description: 'Shift fallback nature photos for morning, day, sunset & night' }
      ] },
      { id: 'wall', title: 'Fallback wallpaper', items: [{ action: 'background.wallpaper', label: wall(S.c.wall).name, thumbnail: true }] }
    ];
    if (t.group === 'preferences') return [
      { id: 'prefs', title: 'OLED Protection & Audio', items: [
        { action: 'samsung.ambient', label: 'OLED ambient mode: ' + (S.c.ambient !== false ? 'On' : 'Off'), description: 'Dim screen with drifting clock & Aerials after 2.5 min idle' },
        { action: 'samsung.ambientSleep', label: 'Ambient screen-off: ' + (AMBIENT_SLEEP_NAMES[S.c.ambientSleep] || 'After 30 min'), description: 'Blank OLED panel after extended Ambient Mode (Red button works anytime)' },
        { action: 'samsung.autoNight', label: 'Auto night dim: ' + (S.c.autoNight !== false ? 'On' : 'Off'), description: 'Deepen scrim & soften contrast 9 PM–6 AM (Green button toggles)' },
        { action: 'samsung.sounds', label: 'Navigation sounds: ' + (S.c.sounds !== false ? 'On' : 'Off'), description: 'Subtle tactile clicks when scrolling and selecting' }
      ] },
      { id: 'controls', title: 'Top bar style', horizontal: true, items: options('controls', ['icons', 'both', 'text']) }
    ];
    return [{ id: 'samsung', title: '', items: [
      { action: 'samsung.inputs', label: 'Switch HDMI Input', description: 'Pick any HDMI 1–4 input directly (incl. HDMI 2 Sonos eARC)' },
      { action: 'samsung.settings', label: 'LG TV Settings', description: 'Picture, sound and network settings' },
      { action: 'samsung.home', label: 'LG webOS Home', description: 'Open LG’s stock Home screen' }
    ] }];
  }
  function detailRows(t) {
    var rows = [[{ action: 'settings.back', label: t.group === 'rotation' ? 'Background' : t.group === 'inputs' ? 'LG TV' : 'Settings' }]];
    detailSections(t).forEach(function (section) {
      var enabled = section.items.filter(function (item) { return !item.disabled; });
      if (section.horizontal && enabled.length) rows.push(enabled);
      else enabled.forEach(function (item) { rows.push([item]); });
    });
    if (S.lookError) rows.push([{ action: 'settings.retry', label: 'Try again' }]);
    return rows;
  }
  function detailLocation(t) {
    var rows = detailRows(t), row = 0, column = 0;
    rows.forEach(function (items, r) { items.forEach(function (item, c) { if (item.action === t.f.action) { row = r; column = c; } }); });
    return { rows: rows, row: row, column: column, item: rows[row][column] };
  }
  function detailFocus(t, item, column) {
    t.f.action = item.action;
    if (item.action !== 'settings.back') S.detailFocus[t.group] = item.action;
    if (column !== undefined) t.f.column = column;
    if (item.axis) S.appearanceFocus = item.axis;
  }
  function applyRotation(value) {
    var c;
    if (S.c.bg !== 'photo') return;
    S.err = null; S.lookError = null;
    if (value === S.c.mode) return;
    c = next(S.c.home.slice(), S.c.recent.slice()); c.mode = value;
    if (!write(c, 'Wallpaper rotation')) S.lookError = { type: 'save', patch: { mode: value }, row: 'mode', transient: false };
  }
  function loadInputs(t) {
    t.loading = true; t.inputError = null;
    FrameDevice.sources(function (err, list) {
      if (top() !== t) return;
      t.loading = false; t.inputs = list || []; t.inputError = err ? err.message : null; after();
    });
  }
  function openInputs() {
    openAppearance('inputs'); var t = top(); t.inputs = []; loadInputs(t);
  }
  function detailBack() { cancelLook(); S.err = null; pop(); FrameDevice.cancelSource(); }
  function detailOk(t, item) {
    var patch = {}, error = S.lookError, c;
    if (item.action === 'settings.back') { detailBack(); return; }
    if (item.disabled || S.pending) return;
    if (item.action === 'settings.retry') {
      if (error && error.patch[error.row] !== undefined) detailFocus(t, choice(error.row, error.patch[error.row]), 0);
      if (error && error.row === 'mode') applyRotation(error.patch.mode);
      else if (error) setLook(error.patch, { row: error.row });
    } else if (item.portDev) {
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.ports[item.portDev] = item.portVal;
      write(c, 'Device HDMI Port');
    } else if (item.axis === 'mode') applyRotation(item.value);
    else if (item.axis) { patch[item.axis] = item.value; setLook(patch, { row: item.axis }); }
    else if (item.action === 'background.wallpaper') openWallpaper();
    else if (item.action === 'background.rotation') openAppearance('rotation');
    else if (item.action === 'samsung.devices') openAppearance('devices');
    else if (item.action === 'samsung.sounds') {
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.sounds = !(S.c.sounds !== false);
      write(c, 'Navigation sounds');
      if (c.sounds) playUiSound('select');
    }
    else if (item.action === 'samsung.todWall') {
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.todWall = !(S.c.todWall !== false);
      write(c, 'Time-of-day wallpapers');
    }
    else if (item.action === 'samsung.bgMotion') {
      var mOrder = ['aerial', 'kenburns', 'static'];
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.bgMotion = mOrder[(mOrder.indexOf(S.c.bgMotion || 'aerial') + 1) % mOrder.length];
      write(c, 'Background motion');
    }
    else if (item.action === 'samsung.ambient') {
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.ambient = !(S.c.ambient !== false);
      write(c, 'OLED ambient mode');
    }
    else if (item.action === 'samsung.ambientSleep') {
      var sleepOrder = ['30', '60', 'off'];
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.ambientSleep = sleepOrder[(sleepOrder.indexOf(S.c.ambientSleep || '30') + 1) % sleepOrder.length];
      write(c, 'Ambient screen-off');
    }
    else if (item.action === 'samsung.autoNight') {
      c = next(S.c.home.slice(), S.c.recent.slice());
      c.autoNight = !(S.c.autoNight !== false);
      nightOverride = null;
      write(c, 'Auto night dim');
    }
    else if (item.action === 'samsung.home') perform('LG Home', FrameDevice.home);
    else if (item.action === 'samsung.settings') perform('TV settings', FrameDevice.settings);
    else if (item.action === 'samsung.inputs') openInputs();
    else if (item.action === 'inputs.retry') loadInputs(t);
    else if (item.action.indexOf('input.') === 0) perform(item.label, function (done) {
      FrameDevice.setSource(Number(item.action.slice(6)), function (err) {
        t.refreshInputs = true;
        done(top() === t && !document.hidden && !(err && err.cancelled) ? err : null);
      });
    });
  }
  V.appearance = {
    norm: function (t) {
      var rows = detailRows(t), exists = false, applied = null;
      var axis = { background: 'bg', layout: 'layout', typography: 'font', focus: 'focus', rotation: 'mode' }[t.group];
      rows.forEach(function (items) { items.forEach(function (item) {
        if (item.action === t.f.action) exists = true;
        if (item.axis === axis && item.value === S.c[axis]) applied = item;
      }); });
      if (!exists) detailFocus(t, applied || (rows[1] || rows[0])[0], 0);
      if (t.f.column === undefined) t.f.column = detailLocation(t).column;
    },
    key: function (t, k) {
      var at = detailLocation(t), row = at.row, column = at.column, nextRow, nextCol;
      if (k === 'back') { playUiSound('back'); detailBack(); return; }
      if (k === 'ok') { playUiSound(at.item.action === 'settings.back' ? 'back' : 'select'); detailOk(t, at.item); return; }
      if (k === 'up' || k === 'down') {
        nextRow = clamp(row + (k === 'up' ? -1 : 1), 0, at.rows.length - 1);
        if (nextRow === row) { playUiSound('edge'); return; }
        row = nextRow;
        column = Math.min(t.f.column || 0, at.rows[row].length - 1);
        playUiSound('move');
        detailFocus(t, at.rows[row][column]);
      } else if (k === 'left' || k === 'right') {
        nextCol = clamp(column + (k === 'left' ? -1 : 1), 0, at.rows[row].length - 1);
        if (nextCol === column) { playUiSound('edge'); return; }
        column = nextCol;
        playUiSound('move');
        detailFocus(t, at.rows[row][column], column);
      }
    },
    point: function (t, z, i, action) {
      if (z !== 'detail') return;
      detailRows(t).some(function (items) { return items.some(function (item, column) {
        if (item.action !== action) return false;
        detailFocus(t, item, column); detailOk(t, item); return true;
      }); });
    }
  };
  function messageContent(t) { return t.content || MSG[t.msg]; }
  V.message = {
    sheet: true,
    key: function (t, k) {
      var A = messageContent(t).actions, a;
      if (k === 'left') { if (t.f.b > 0) { t.f.b--; playUiSound('move'); } else playUiSound('edge'); }
      else if (k === 'right') { if (t.f.b < A.length - 1) { t.f.b++; playUiSound('move'); } else playUiSound('edge'); }
      else if (k === 'back') { playUiSound('back'); pop(); }
      else if (k === 'ok') { playUiSound('select'); a = A[t.f.b][0]; pop(); if (a === 'samsung') perform('LG Home', FrameDevice.home); }
    },
    point: function (t, z, i) { if (z === 'act') { t.f.b = i; this.key(t, 'ok'); } }
  };

  /* ---------- Dispatch ---------- */
  function norm() { var t = top(), v = V[t.id]; if (v.norm) v.norm(t); }
  function press(k) {
    norm();
    var t = top();
    V[t.id].key(t, k);
    norm();
    render();
    syncRotation();
  }

  /* ---------- Rendering ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage'), homeEl = $('home'), caption = $('caption'), utilsEl = $('utils');
  var utilFocusLabel = $('utilFocusLabel'), utilFocusKey = '', appFocusName = $('appFocusName');
  var dock = $('dock'), shelf = $('shelf'), track = $('track'), plate = $('plate'), matScrim = $('matScrim'), dockEmpty = $('dockEmpty');
  var cueL = $('cueL'), cueR = $('cueR'), dockAction = $('dockAction'), snazzyHome = $('snazzyHome');
  var focusStatus = $('focusStatus'), sceneEl = $('scene'), appearanceEl = $('appearance'), appearanceRows = $('appearanceRows'), appearanceDesc = $('appearanceDesc');
  var appearanceBack = $('appearanceBack'), appearanceTitle = $('appearanceTitle'), appearanceStatus = $('appearanceStatus');
  var phScene = $('phScene'), phPlate = $('phPlate'), phField = $('phField'), phList = $('phList'), phRows = $('phRows'), phAction = $('phAction'), phEmpty = $('phEmpty');
  var phPlates = [phPlate, $('phPlateAlt')], phFields = [phField, $('phFieldAlt')], photoPlateIndex = 0, photoPlateKey = null;
  var utPlates = [$('utLens'), $('utLensAlt')], utFields = [$('utField'), $('utFieldAlt')], utPlateIndex = 0, utPlateKey = null;
  var photoMode = null, photoTransitionToken = 0;
  var sheetEl = $('sheet'), sheetView = $('sheetView');
  var IMG = { photo: $('photo'), mat: $('matImg'), bg: $('sheetBg'), field: $('phFieldImg'), fieldAlt: $('phFieldImgAlt'), utility: $('utFieldImg'), utilityAlt: $('utFieldImgAlt') };
  var sheetKey = '', slotEls = {}, dockEdgeFrame = 0, dockEdgeUntil = 0, dockAnchorCenter = 960;
  var appliedPalette = null, appliedPhoto = null, appliedFont = null, appliedFontMetrics = null;

  /* Curated locked palettes keep the existing rendering path exactly. */
  function applyAdaptiveInk(palette) {
    var active = S.c.bg === 'photo' && palette && !palette.locked && palette.light && palette.tl && palette.tr && palette.br;
    if (appliedPalette === palette && appliedPhoto === (S.c.bg === 'photo')) return !!active;
    appliedPalette = palette; appliedPhoto = S.c.bg === 'photo';
    ['tl', 'tr', 'br'].forEach(function (zone) {
      var r = active ? palette[zone] : null;
      var values = r ? { ink: r.ink, 'clock-ink': r.clockInk || r.ink, 'rest-ink': r.restInk, 'peer-ink': r.peerInk, rest: r.restAlpha, peer: r.peerAlpha, under: r.halo, shadow: r.shadow } : {};
      ['ink', 'clock-ink', 'rest-ink', 'peer-ink', 'rest', 'peer', 'under', 'shadow'].forEach(function (key) {
        var name = '--' + zone + '-' + key, value = values[key];
        if (value !== undefined && value !== null) stage.style.setProperty(name, String(value));
        else stage.style.removeProperty(name);
      });
    });
    if (active && palette.light) stage.style.setProperty('--home-app-ink', palette.light);
    else stage.style.removeProperty('--home-app-ink');
    return !!active;
  }
  function inkRungClasses(palette, active) {
    if (!active) return '';
    return ['tl', 'tr', 'br'].map(function (zone) {
      var rung = palette[zone].rung;
      return ['light', 'mist', 'mist-high', 'dark', 'dark-halo'].indexOf(rung) >= 0 ? ' ink-' + zone + '-' + rung : '';
    }).join('');
  }
  function render() {
    var t = top(), sheet = !!V[t.id].sheet, shown = wall(S.shown ? S.shown.wall : S.c.wall), palette = ADAPTIVE_INK[shown.id];
    var adaptive = applyAdaptiveInk(palette), tr = adaptive && palette.tr ? palette.tr.pol : shown.ut.tr, br = adaptive && palette.br ? palette.br.pol : shown.ut.br;
    stage.className = 'stage bg-' + S.c.bg + ' l-' + S.c.layout + ' v-' + S.variant + ' m-' + (materialApplies() ? S.c.material : 'none') + ' f-' + S.c.focus + ' a-' + S.c.apps + ' u-' + S.c.controls + ' g-' + S.geom + ' tone-' + shown.tone + ' tr-' + tr + ' br-' + br + wallClasses(shown) + inkRungClasses(palette, adaptive) + ' at-' + t.id + ' font-' + homeFont() + (homeFont() !== 'manrope' ? ' font-custom' : '') + (S.fontSwitch ? ' is-font-switch' : '') + (adaptive ? ' has-adaptive-ink adaptive-tl-' + palette.tl.pol : '') + (!adaptive && shown.clockInk ? ' has-clock-ink' : '') + (!adaptive && shown.dockClockInk ? ' has-dock-clock-ink' : '') + (registeredMaterial(shown.id) ? ' registered-material' : '') + (sheet ? ' is-sheet' : '') + (S.reflow ? ' is-reflow' : '');
    if (!adaptive && shown.clockInk) stage.style.setProperty('--clock-ink', shown.clockInk);
    else stage.style.removeProperty('--clock-ink');
    if (!adaptive && shown.dockClockInk) stage.style.setProperty('--dock-clock-ink', shown.dockClockInk);
    else stage.style.removeProperty('--dock-clock-ink');
    applyHomeFont();
    if (!sheet) renderHome(t);
    renderSheet(t, sheet);
    renderAppearance(t);
    renderFocusStatus(t);
  }

  function applyHomeFont() {
    var id = homeFont(), f = FONTS[id], primary = fontRole(id, 'primary'), ui = fontRole(id, 'ui'), metrics = fontMetrics[id];
    if (appliedFont === id && appliedFontMetrics === metrics) return;
    appliedFont = id; appliedFontMetrics = metrics;
    var values = { 'display-family': '"' + f.family + '"', 'ui-family': '"' + ui.family + '"', 'primary-family': '"' + primary.family + '"', 'display-weight': f.display, 'ui-weight': ui.weight, 'primary-weight': primary.weight, 'clock-weight': f.clock,
      'clock-shift': px(fontShift('clock', 48)), 'utility-shift': px(fontShift('ui', 28)), 'action-shift': px(fontShift('ui', 30)), 'heading-shift': px(fontShift('ui', 48)), 'full-name-shift': px(fontShift('primary', 30)), 'clock-digit': px(metrics ? metrics.digitCell : 0) };
    Object.keys(values).forEach(function (key) { homeEl.style.setProperty('--font-' + key, String(values[key])); });
  }

  function homeState(t) {
    var h = S.c.home, hs = { mode: 'browse', zone: null, i: Math.max(0, ensureSel()), u: -1, lifted: false, from: -1, arr: null, items: h.map(function (id) { return { key: id, kind: 'app', id: id }; }) };
    if (isSettingsDetail(t)) hs.zone = 'preview';
    else if (t.id === 'home') { hs.zone = t.f.zone; hs.u = t.f.u; }
    return hs;
  }

  function snazzyIllus(id) {
    if (id === 'appletv') {
      return '<svg class="snazzy-svg" viewBox="0 0 160 100" aria-hidden="true">'
        + '<path fill="currentColor" d="M53.6 30.2c2.5-3 4.2-7.1 3.7-11.2-3.6.2-8 2.4-10.6 5.4-2.3 2.6-4.3 6.8-3.8 10.8 4 .3 8.1-2 10.7-5zm3.7 6.4c-5.9-.3-10.9 3.3-13.7 3.3-2.8 0-7.1-3.1-11.8-3-6.1.1-11.7 3.5-14.8 9-6.3 11-1.6 27.2 4.5 36.1 3 4.4 6.6 9.2 11.3 9 4.5-.2 6.3-2.9 11.7-2.9 5.4 0 7 2.9 11.8 2.8 4.9-.1 8-4.4 11-8.8 3.5-5 4.9-9.9 5-10.1-.1-.1-9.6-3.7-9.7-14.6-.1-9.1 7.5-13.5 7.8-13.7-4.3-6.3-11-7-13.1-7.1z"/>'
        + '<path fill="currentColor" d="M95.2 35.8v11.4h8.2v6.7h-8.2v19.8c0 4.1 1.9 6 5.6 6 1.1 0 2.1-.1 2.6-.2v6.6c-.9.3-2.5.5-4.4.5-7.8 0-11.6-3.8-11.6-11.7V53.9h-6.2v-6.7h6.2V35.8h7.8zm13.4 11.4h8.2l9.1 29.8h.2l9.1-29.8h8l-13.1 38.8h-8.4l-13.1-38.8z"/>'
        + '</svg>';
    }
    if (id === 'sonos') {
      return '<svg class="snazzy-svg" viewBox="0 0 140 100" aria-hidden="true">'
        + '<rect x="14" y="42" width="112" height="28" rx="14" fill="none" stroke="currentColor" stroke-width="5.5"/>'
        + '<circle cx="42" cy="56" r="4" fill="currentColor"/>'
        + '<circle cx="70" cy="56" r="4" fill="currentColor"/>'
        + '<circle cx="98" cy="56" r="4" fill="currentColor"/>'
        + '<path fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" d="M52 28c10-6 26-6 36 0M42 18c16-10 40-10 56 0" opacity="0.72"/>'
        + '</svg>';
    }
    if (id === 'ps5') {
      return '<svg class="snazzy-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<g fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">'
        + '<polygon points="38,24 52,48 24,48"/>'
        + '<circle cx="82" cy="36" r="13"/>'
        + '<path d="M27 71l22 22M49 71L27 93"/>'
        + '<rect x="70" y="70" width="24" height="24" rx="2"/>'
        + '</g></svg>';
    }
    if (id === 'switch') {
      return '<svg class="snazzy-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<path fill="currentColor" fill-rule="evenodd" d="M37 20C25.4 20 16 29.4 16 41v38c0 11.6 9.4 21 21 21h15c1.7 0 3-1.3 3-3V23c0-1.7-1.3-3-3-3H37zm10 7.5H37c-7.5 0-13.5 6-13.5 13.5v38c0 7.5 6 13.5 13.5 13.5h10v-65zM36.5 54a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zm31.5-34c-1.7 0-3 1.3-3 3v74c0 1.7 1.3 3 3 3h15c11.6 0 21-9.4 21-21V41c0-11.6-9.4-21-21-21H68zm14.5 54a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/>'
        + '</svg>';
    }
    if (id === 'steam') {
      return '<svg class="snazzy-svg" viewBox="0 0 120 120" aria-hidden="true">'
        + '<path fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" d="M36 38h48c12.2 0 22 9.8 22 22 0 6.8-3.1 13.2-8.4 17.4l-7.2 5.7c-3.9 3.1-9.6 2.3-12.5-1.8l-5.8-8.3H47.9l-5.8 8.3c-2.9 4.1-8.6 4.9-12.5 1.8l-7.2-5.7C17.1 73.2 14 66.8 14 60c0-12.2 9.8-22 22-22z"/>'
        + '<path fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" d="M38 51v14M31 58h14"/>'
        + '<circle cx="78" cy="53" r="4" fill="currentColor"/>'
        + '<circle cx="88" cy="61" r="4" fill="currentColor"/>'
        + '</svg>';
    }
    return '<svg class="snazzy-svg" viewBox="0 0 120 120" aria-hidden="true">'
      + '<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round">'
      + '<line x1="22" y1="36" x2="54" y2="36"/><line x1="78" y1="36" x2="98" y2="36"/><circle cx="66" cy="36" r="9"/>'
      + '<line x1="22" y1="60" x2="34" y2="60"/><line x1="58" y1="60" x2="98" y2="60"/><circle cx="46" cy="60" r="9"/>'
      + '<line x1="22" y1="84" x2="62" y2="84"/><line x1="86" y1="84" x2="98" y2="84"/><circle cx="74" cy="84" r="9"/>'
      + '</g></svg>';
  }
  /* ---------- Time-of-day wallpapers, live HDMI dots, weather, OLED ambient ---------- */
  var hdmiStatus = {}, hdmiPollTimer = 0, weatherData = null, weatherTimer = 0;
  var lastActivity = Date.now(), ambientActive = false, oledBlack = false, ambientEnteredAt = 0, nightOverride = null, toastTimer = 0;
  var ambientWallIdx = 0, ambientPos = { x: 160, y: 660 }, ambientTickTimer = 0, ambientShiftAt = 0;
  var AMBIENT_SPOTS = [
    { x: 140, y: 660 }, { x: 1080, y: 660 }, { x: 140, y: 160 },
    { x: 1080, y: 160 }, { x: 600, y: 420 }, { x: 320, y: 580 }
  ];
  var ambientSpotIdx = 0;

  function isNightDim() {
    if (nightOverride !== null) return nightOverride;
    if (S.c.pictureMode === 'night') return true;
    if (S.c.autoNight !== false) {
      var hr = new Date().getHours();
      return hr >= 21 || hr < 6;
    }
    return false;
  }
  function showSnazzyToast(msg) {
    var el = $('snazzyToast');
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = msg;
    el.className = 'snazzy-toast is-on';
    toastTimer = setTimeout(function () {
      var tEl = $('snazzyToast');
      if (tEl) tEl.className = 'snazzy-toast';
    }, 2400);
  }
  function timeOfDayWalls() {
    var hr = new Date().getHours();
    if (hr >= 5 && hr < 11) return ['misty', 'alpine', 'forest', 'peaks'];
    if (hr >= 11 && hr < 17) return ['forest', 'misty', 'alpine', 'peaks'];
    if (hr >= 17 && hr < 20) return ['alpine', 'forest', 'peaks', 'misty'];
    return ['peaks', 'forest', 'misty', 'alpine'];
  }
  function snazzyWallForCard(c, idx, t) {
    if (ambientActive) return AMBIENT_WALLS[ambientWallIdx % AMBIENT_WALLS.length];
    if (t && (t.id === 'wallpaper' || (t.id === 'appearance' && t.group === 'background')) && S.wallShown) return S.wallShown;
    if (S.c.wall && S.c.wall !== 'misty') return S.c.wall;
    if (S.c.todWall !== false) return timeOfDayWalls()[aerialIdx % 4] || 'forest';
    return 'misty';
  }
  function pollCardInputs() {
    clearTimeout(hdmiPollTimer);
    if (document.hidden || S.c.layout !== 'cards') return;
    if (FrameDevice && typeof FrameDevice.sources === 'function') {
      FrameDevice.sources(function (err, list) {
        if (!err && Array.isArray(list)) {
          var nextMap = {}, changed = false, i, item, prev;
          for (i = 0; i < list.length; i++) {
            item = list[i];
            nextMap[item.number] = { connected: !!item.connected, active: !!item.active };
            prev = hdmiStatus[item.number];
            if (!prev || prev.connected !== !!item.connected || prev.active !== !!item.active) changed = true;
          }
          hdmiStatus = nextMap;
          if (changed && top().id === 'home' && S.c.layout === 'cards') renderSnazzyCards(homeState(top()));
        }
      });
    }
    hdmiPollTimer = setTimeout(pollCardInputs, 20000);
  }
  function weatherSvg(kind) {
    if (kind === 'clear') {
      var hr = new Date().getHours();
      if (hr >= 20 || hr < 6) return '<svg class="snazzy-w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
      return '<svg class="snazzy-w-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    }
    if (kind === 'rain') {
      return '<svg class="snazzy-w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 15.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.2 6.4 3.8 3.8 0 0 0 7 15.5ZM9 19l-1 2M13 19l-1 2M17 19l-1 2"/></svg>';
    }
    if (kind === 'snow') {
      return '<svg class="snazzy-w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 15.5h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.2 6.4 3.8 3.8 0 0 0 7 15.5Z"/><circle cx="9" cy="19.5" r="1" fill="currentColor"/><circle cx="13" cy="19.5" r="1" fill="currentColor"/><circle cx="17" cy="19.5" r="1" fill="currentColor"/></svg>';
    }
    return '<svg class="snazzy-w-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 17h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.2 7.9 3.8 3.8 0 0 0 7 17Z"/></svg>';
  }
  function saveWeather(tempF, kind) {
    weatherData = { temp: Math.round(tempF), kind: kind || 'cloud', ts: Date.now() };
    try { localStorage.setItem(WEATHER_KEY, JSON.stringify(weatherData)); } catch (e) { /* ignore */ }
    if (top().id === 'home' && S.c.layout === 'cards') renderSnazzyCards(homeState(top()));
    weatherTimer = setTimeout(fetchWeather, 30 * 60000);
  }
  function wwoKind(code) {
    var c = parseInt(code, 10) || 0;
    if (c === 113) return 'clear';
    if (c === 179 || c === 182 || c === 227 || c === 230 || (c >= 317 && c <= 338) || (c >= 362 && c <= 377) || c === 392 || c === 395) return 'snow';
    if (c === 176 || (c >= 263 && c <= 314) || (c >= 353 && c <= 359) || c === 386 || c === 389) return 'rain';
    return 'cloud';
  }
  function loadCachedWeather() {
    try {
      var raw = localStorage.getItem(WEATHER_KEY), d = raw ? JSON.parse(raw) : null;
      if (d && typeof d.temp === 'number' && d.kind && Date.now() - d.ts < 30 * 60000) weatherData = d;
    } catch (e) { /* ignore */ }
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
  function fetchWeatherFallback() {
    fetchJson('https://get.geojs.io/v1/ip/geo.json', function (err, geo) {
      var lat = geo ? parseFloat(geo.latitude) : NaN, lon = geo ? parseFloat(geo.longitude) : NaN;
      if (err || !isFinite(lat) || !isFinite(lon)) { weatherTimer = setTimeout(fetchWeather, 15 * 60000); return; }
      var url = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + lat.toFixed(3) + '&lon=' + lon.toFixed(3);
      fetchJson(url, function (mErr, m) {
        var ts = m && m.properties && m.properties.timeseries && m.properties.timeseries[0];
        var inst = ts && ts.data && ts.data.instant && ts.data.instant.details;
        var sym = ts && ts.data && ts.data.next_1_hours && ts.data.next_1_hours.summary ? ts.data.next_1_hours.summary.symbol_code : '';
        if (!mErr && inst && typeof inst.air_temperature === 'number') {
          var kind = /clear|fair/.test(sym) ? 'clear' : /snow|sleet/.test(sym) ? 'snow' : /rain|drizzle|shower/.test(sym) ? 'rain' : 'cloud';
          saveWeather(inst.air_temperature * 9 / 5 + 32, kind);
        } else {
          weatherTimer = setTimeout(fetchWeather, 15 * 60000);
        }
      });
    });
  }
  function fetchWeather() {
    clearTimeout(weatherTimer);
    loadCachedWeather();
    if (weatherData && Date.now() - weatherData.ts < 25 * 60000) {
      weatherTimer = setTimeout(fetchWeather, 30 * 60000);
      return;
    }
    fetchJson('https://wttr.in/?format=j1', function (err, data) {
      var cur = !err && data && data.current_condition && data.current_condition[0];
      var tempF = cur ? parseFloat(cur.temp_F) : NaN;
      if (isFinite(tempF)) {
        saveWeather(tempF, wwoKind(cur.weatherCode));
      } else {
        fetchWeatherFallback();
      }
    });
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
  function enterOledSleep() {
    if (oledBlack) return;
    oledBlack = true;
    ambientActive = true;
    render();
    if (FrameDevice && typeof FrameDevice.turnOffScreen === 'function') {
      FrameDevice.turnOffScreen(function () {});
    }
  }
  function enterAmbient() {
    if (ambientActive || S.c.layout !== 'cards' || top().id !== 'home' || S.switching) return;
    ambientActive = true;
    oledBlack = false;
    ambientEnteredAt = Date.now();
    ambientShiftAt = ambientEnteredAt;
    ambientSpotIdx = (ambientSpotIdx + 1) % AMBIENT_SPOTS.length;
    ambientPos = AMBIENT_SPOTS[ambientSpotIdx];
    render();
  }
  function startAmbientLoop() {
    clearInterval(ambientTickTimer);
    ambientTickTimer = setInterval(function () {
      if (document.hidden || S.c.layout !== 'cards' || S.c.ambient === false || top().id !== 'home' || S.switching) {
        if (ambientActive || oledBlack) { ambientActive = false; oledBlack = false; render(); }
        return;
      }
      var now = Date.now();
      if (!ambientActive && now - lastActivity >= AMBIENT_IDLE_MS) {
        enterAmbient();
      } else if (ambientActive && !oledBlack) {
        var sleepMins = S.c.ambientSleep === 'off' ? 0 : (parseInt(S.c.ambientSleep, 10) || 30);
        if (sleepMins > 0 && ambientEnteredAt && now - ambientEnteredAt >= sleepMins * 60000) {
          enterOledSleep();
          return;
        }
        if (now - ambientShiftAt >= 45000) {
          ambientShiftAt = now;
          ambientSpotIdx = (ambientSpotIdx + 1) % AMBIENT_SPOTS.length;
          ambientPos = AMBIENT_SPOTS[ambientSpotIdx];
          var ambEl = $('snazzyAmbient');
          if (ambEl) ambEl.style.transform = 'translate3d(' + ambientPos.x + 'px,' + ambientPos.y + 'px,0)';
        }
      }
    }, 10000);
  }

  var aerialSlot = 0, aerialCurrentSrc = '', aerialPreloadSrc = '', aerialTransitioning = false, aerialTransTimer = 0;
  var aerialIdx = Math.floor(Math.random() * AERIAL_MOUNTAINS.length);
  var locTimer = 0, locShownSrc = '';
  function activeAerialList() { return AERIAL_MOUNTAINS; }
  function currentAerialItem() {
    return AERIAL_MOUNTAINS[aerialIdx % AERIAL_MOUNTAINS.length];
  }
  function nextAerialItem() {
    return AERIAL_MOUNTAINS[(aerialIdx + 1) % AERIAL_MOUNTAINS.length];
  }
  function showAerialLocation(item, force) {
    var el = $('snazzyLoc');
    if (!el || !item) return;
    if (!force && locShownSrc === item.src) return;
    locShownSrc = item.src;
    clearTimeout(locTimer);
    setHTML(el, '<span class="snazzy-loc-title">' + esc(item.title) + '</span><span class="snazzy-loc-sub">' + esc(item.sub) + '</span>');
    el.className = 'snazzy-loc is-on';
    locTimer = setTimeout(function () {
      var locEl = $('snazzyLoc');
      if (locEl) locEl.className = 'snazzy-loc';
    }, 8000);
  }
  function aerialVid(slot) { return $('snazzyAerial' + slot); }
  function preloadNextAerial() {
    var next = nextAerialItem(), standby = aerialVid(1 - aerialSlot);
    if (!standby || !next || aerialPreloadSrc === next.src || aerialCurrentSrc === next.src) return;
    aerialPreloadSrc = next.src;
    standby.muted = true;
    standby.defaultMuted = true;
    standby.src = next.src;
    try { standby.load(); } catch (e) { /* ignore */ }
  }
  function nextAerialVideo() {
    clearTimeout(aerialTransTimer);
    aerialTransitioning = false;
    aerialIdx = (aerialIdx + 1) % AERIAL_MOUNTAINS.length;
    syncAerialVideo();
  }
  function prevAerialVideo() {
    clearTimeout(aerialTransTimer);
    aerialTransitioning = false;
    aerialIdx = (aerialIdx - 1 + AERIAL_MOUNTAINS.length) % AERIAL_MOUNTAINS.length;
    syncAerialVideo();
  }
  function syncAerialVideo() {
    var v0 = aerialVid(0), v1 = aerialVid(1);
    var useAerial = !document.hidden && !oledBlack && S.c.layout === 'cards' && (S.c.bgMotion || 'aerial') === 'aerial';
    if (!v0 || !v1) return;
    if (!useAerial) {
      aerialCurrentSrc = ''; aerialPreloadSrc = ''; aerialTransitioning = false;
      [v0, v1].forEach(function (v) {
        v.className = 'snazzy-aerial';
        try { v.pause(); } catch (e) { /* ignore */ }
        if (v.getAttribute('src')) { v.removeAttribute('src'); try { v.load(); } catch (e) { /* ignore */ } }
      });
      var locEl = $('snazzyLoc');
      if (locEl) locEl.className = 'snazzy-loc';
      return;
    }
    var item = currentAerialItem(), curVid = aerialVid(aerialSlot);
    if (item.src === aerialCurrentSrc) {
      if (curVid.paused && curVid.readyState >= 2) { try { var p = curVid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* ignore */ } }
      return;
    }
    var nextSlot = aerialCurrentSrc ? (1 - aerialSlot) : aerialSlot;
    var nextVid = aerialVid(nextSlot), oldVid = aerialCurrentSrc ? curVid : null;
    aerialTransitioning = true;
    clearTimeout(aerialTransTimer);
    aerialTransTimer = setTimeout(function () { aerialTransitioning = false; }, 6000);
    aerialCurrentSrc = item.src;
    nextVid.muted = true;
    nextVid.defaultMuted = true;
    if (aerialPreloadSrc !== item.src) {
      nextVid.src = item.src;
      try { nextVid.load(); } catch (e) { /* ignore */ }
    }
    aerialPreloadSrc = '';
    var revealed = false;
    function reveal() {
      if (revealed || aerialCurrentSrc !== item.src || (S.c.bgMotion || 'aerial') !== 'aerial') return;
      revealed = true;
      aerialSlot = nextSlot;
      aerialTransitioning = false;
      nextVid.className = 'snazzy-aerial is-playing is-top';
      showAerialLocation(item, true);
      if (oldVid && oldVid !== nextVid) {
        oldVid.className = 'snazzy-aerial';
        setTimeout(function () {
          if (aerialSlot === nextSlot) {
            try { oldVid.pause(); } catch (e) { /* ignore */ }
            oldVid.removeAttribute('src');
            try { oldVid.load(); } catch (e) { /* ignore */ }
          }
        }, 1500);
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
      if (left <= 6 && left > 1.5) preloadNextAerial();
      else if (left <= 1.2 && !aerialTransitioning) nextAerialVideo();
    };
    nextVid.onended = function () { if (aerialSlot === nextSlot && (S.c.bgMotion || 'aerial') === 'aerial') nextAerialVideo(); };
    nextVid.onerror = function () { aerialTransitioning = false; nextVid.className = 'snazzy-aerial'; };
    try {
      var playPromise = nextVid.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
    } catch (e) { /* ignore */ }
  }
  function ensureSnazzyDOM() {
    if (snazzyHome._built) return;
    snazzyHome._built = true;
    snazzyHome.innerHTML = '<div class="snazzy-backdrop" id="snazzyBackdrop">'
      + '<div class="snazzy-photos" id="snazzyPhotos"></div>'
      + '<video class="snazzy-aerial" id="snazzyAerial0" autoplay muted playsinline preload="auto"></video>'
      + '<video class="snazzy-aerial" id="snazzyAerial1" autoplay muted playsinline preload="auto"></video>'
      + '<div class="snazzy-vignette"></div>'
      + '<div class="snazzy-night-veil"></div>'
      + '</div>'
      + '<div class="snazzy-clock" id="snazzyClock"></div>'
      + '<div class="snazzy-stage-body" id="snazzyStageBody"></div>'
      + '<div class="snazzy-ambient" id="snazzyAmbient" aria-hidden="true"></div>'
      + '<div class="snazzy-loc" id="snazzyLoc" aria-hidden="true"></div>'
      + '<div class="snazzy-toast" id="snazzyToast" aria-live="polite"></div>'
      + '<div class="snazzy-oled-black" aria-hidden="true"></div>';
    [aerialVid(0), aerialVid(1)].forEach(function (vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
    });
  }
  function renderSnazzyCards(hs) {
    ensureSnazzyDOM();
    var idx = clamp(typeof S.cardIdx === 'number' ? S.cardIdx : 0, 0, SNAZZY_CARDS.length - 1);
    var active = SNAZZY_CARDS[idx], t = top(), d = new Date(), h = d.getHours(), m = d.getMinutes(), ampm = h >= 12 ? 'PM' : 'AM', h12 = h % 12 || 12;
    var timeStr = h12 + ':' + (m < 10 ? '0' : '') + m;
    var sw = S.switching, cardFocus = hs.zone === 'apps';
    var activeWall = snazzyWallForCard(active, idx, t);
    var wallList = (S.c.todWall !== false ? timeOfDayWalls().slice() : ['misty', 'forest', 'alpine', 'peaks']);
    if (wallList.indexOf(activeWall) < 0) wallList.push(activeWall);
    var photosEl = $('snazzyPhotos'), clockEl = $('snazzyClock'), bodyEl = $('snazzyStageBody'), ambEl = $('snazzyAmbient');
    var motionMode = S.c.bgMotion || 'aerial';
    snazzyHome.className = 'snazzy-home' + (ambientActive ? ' is-ambient' : '') + (oledBlack ? ' is-oled-black' : '') + (isNightDim() ? ' is-night-dim' : '') + (motionMode === 'kenburns' ? ' is-kenburns' : '') + (motionMode === 'aerial' ? ' is-aerial-only' : '');
    syncAerialVideo();
    keyed(photosEl, motionMode === 'aerial' ? [] : wallList.map(function (w) { return { key: w, id: w }; }), function (img, it) {
      var src = WP + it.id + '.jpg';
      if (img._src !== src) { img._src = src; img.src = src; img.alt = ''; }
      img.className = 'snazzy-bg-photo' + (it.id === activeWall ? ' is-active' : '');
    }, 'img');
    var weatherHtml = weatherData ? '<span class="snazzy-weather">' + weatherSvg(weatherData.kind) + '<span>' + weatherData.temp + '&deg;</span></span>' : '';
    setHTML(clockEl, weatherHtml + '<span class="snazzy-time">' + timeStr + '</span><span class="snazzy-ampm">' + ampm + '</span>');
    if (ambientActive) {
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var dateStr = days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
      ambEl.style.transform = 'translate3d(' + ambientPos.x + 'px,' + ambientPos.y + 'px,0)';
      setHTML(ambEl, '<div class="snazzy-amb-time">' + timeStr + '<span class="snazzy-amb-ampm">' + ampm + '</span></div>'
        + '<div class="snazzy-amb-meta"><span>' + esc(dateStr) + '</span>' + (weatherData ? '<span class="snazzy-amb-sep">&middot;</span>' + weatherHtml : '') + '</div>');
    }
    if (sw) {
      var swVerb = sw.kind === 'settings' ? 'Opening' : 'Switching to';
      var portNote = sw.kind === 'hdmi' ? (sw.port === 0 ? 'Apple TV App' : 'HDMI ' + sw.port) : '';
      setHTML(bodyEl, '<div class="snazzy-transition">'
        + '<div class="snazzy-trans-icon">' + snazzyIllus(sw.id) + '</div>'
        + '<div class="snazzy-trans-head">'
        + '<span class="snazzy-trans-sub">' + esc(swVerb) + (portNote ? ' · ' + esc(portNote) : '') + '</span>'
        + (sw.status === 'switching' ? '<span class="snazzy-spinner" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : '')
        + '</div>'
        + '<h1 class="snazzy-trans-title">' + esc(sw.name) + '</h1>'
        + (sw.error ? '<p class="snazzy-trans-err">' + esc(sw.error) + '</p>' : '')
        + '<button type="button" tabindex="-1" class="snazzy-back-hint" data-z="snazzy-back" data-i="0" data-action="snazzy.back">'
        + '<span class="snazzy-key-pill">Back</span><span>Return to Home</span>'
        + '</button>'
        + '</div>');
    } else {
      var subPort = active.kind === 'hdmi' ? (S.c.ports[active.id] === 0 ? 'App' : 'HDMI ' + S.c.ports[active.id]) : '';
      var activePortNum = active.kind === 'hdmi' ? S.c.ports[active.id] : 0;
      var activePortSt = activePortNum ? hdmiStatus[activePortNum] : null;
      var activePowered = !!(activePortSt && (activePortSt.active || activePortSt.connected));
      if (!bodyEl.querySelector('.snazzy-row')) {
        setHTML(bodyEl, '<div class="snazzy-hero">'
          + '<h1 class="snazzy-title" id="snazzyTitle"></h1>'
          + '<p class="snazzy-prompt" id="snazzyPrompt"></p>'
          + '</div>'
          + '<div class="snazzy-row" id="snazzyRow" role="list"></div>');
      }
      setHTML($('snazzyTitle'), esc(active.name));
      setHTML($('snazzyPrompt'), '<span>Press</span><span class="snazzy-ok-badge">OK</span><span>to ' + esc(active.verb) + '</span>'
        + (subPort ? '<span class="snazzy-prompt-sep">&middot;</span><span>' + esc(subPort) + '</span>' : '')
        + (activePowered ? '<span class="snazzy-prompt-sep">&middot;</span><span class="snazzy-power-tag">Powered on</span>' : ''));
      keyed($('snazzyRow'), SNAZZY_CARDS.map(function (c) { return { key: c.id, card: c }; }), function (btn, it, i) {
        var c = it.card, isSel = i === idx && cardFocus, isDim = i === idx && !cardFocus;
        var portNum = c.kind === 'hdmi' ? S.c.ports[c.id] : 0;
        var st = portNum ? hdmiStatus[portNum] : null;
        var dotCls = st && st.active ? ' is-active' : (st && st.connected ? ' is-on' : '');
        setContent(btn, c.id + '|' + dotCls, function () {
          return (dotCls ? '<span class="snazzy-dot' + dotCls + '" aria-hidden="true"></span>' : '')
            + '<span class="snazzy-card-art">' + snazzyIllus(c.id) + '</span>'
            + '<span class="snazzy-card-label">' + esc(c.name) + '</span>';
        });
        btn.type = 'button';
        btn.tabIndex = -1;
        btn.className = 'snazzy-card card-' + c.id + (isSel ? ' is-focus' : '') + (isDim ? ' is-sel' : '');
        btn.setAttribute('aria-label', c.name);
        attrs(btn, 'snazzy-card', i, 'snazzy.card.' + c.id);
      }, 'button');
    }
  }

  function renderHome(t) {
    var hs = homeState(t);
    renderCaption(t, hs);
    renderUtils(hs);
    if (S.c.layout === 'cards') { photoMode = null; renderSnazzyCards(hs); }
    else if (S.c.layout === 'list') renderList(hs);
    else { photoMode = null; renderDock(hs); }
    renderAppFocusName(hs);
  }

  function clockText() {
    var d = new Date(), h = d.getHours() % 12 || 12, m = d.getMinutes();
    return h + ':' + (m < 10 ? '0' : '') + m;
  }
  function clockHtml() {
    var text = clockText(), metrics = fontMetrics[homeFont()];
    if (!metrics || !metrics.digitCell) return text;
    return text.replace(/[0-9]/g, function (digit) { return '<span class="clock-digit">' + digit + '</span>'; });
  }
  function renderCaption(t, hs) {
    var html = '<span class="clock">' + clockHtml() + '</span>';
    if (S.c.apps !== 'icons' && hs.items[hs.i] && (S.c.layout === 'list' ? photoLabel(hs.items[hs.i].id, false).size < 88 || photoLabel(hs.items[hs.i].id, false).ellipsis : hs.zone === 'apps' && reducedDockLabel(hs.items[hs.i].id))) html += '<span class="cap-line full-name">' + esc(app(hs.items[hs.i].id).name) + '</span>';
    setHTML(caption, html);
  }

  function utilBtn(z, i, action, inner, extra, name) {
    return '<button type="button" tabindex="-1" class="u' + (extra || '') + '" data-z="' + z + '" data-i="' + i + '" data-action="' + action + '" aria-label="' + esc(name) + '"><span class="u-content">' + inner + '</span></button>';
  }
  function renderUtils(hs) {
    var html = '', style = hs.mode === 'arrange' && S.c.controls !== 'text' ? 'both' : S.c.controls;
    var iconsOnly = style === 'icons', U = utils(), focused = null;
    utilsEl.className = 'utils quiet-utils is-' + style + (hs.zone === 'util' || hs.zone === 'ctl' ? ' is-awake' : '') + (ambientActive ? ' is-ambient-hide' : '');
    U.forEach(function (u, i) {
      var lbl = UTIL[u][0];
      html += utilBtn('util', i, 'util.' + u, icon(UTIL[u][1], '', true) + '<span class="u-label">' + esc(lbl) + '</span>', '', lbl);
    });
    setHTML(utilsEl, html);
    Array.prototype.forEach.call(utilsEl.querySelectorAll('.u'), function (b) {
      var z = b.getAttribute('data-z'), focus = !ambientActive && hs.zone === z && hs.u === Number(b.getAttribute('data-i'));
      b.className = b.className.replace(/\s+is-focus/g, '') + (focus ? ' is-focus' : '');
      if (focus) focused = b;
    });
    renderUtilFocusLabel(iconsOnly && !ambientActive ? focused : null);
    renderUtilityLens(ambientActive ? null : focused, iconsOnly);
  }
  function renderUtilFocusLabel(button) {
    var text, key, r, sr, scale, width, x;
    if (!button || ambientActive) { utilFocusLabel.className = 'util-focus-label'; utilFocusKey = ''; return; }
    text = S.err ? 'Not saved. OK tries again.' : button.getAttribute('aria-label');
    key = button.getAttribute('data-action') + '|' + text + '|' + homeFont();
    if (key !== utilFocusKey) {
      utilFocusLabel.className = 'util-focus-label'; utilFocusLabel.textContent = text;
      utilFocusLabel.offsetWidth;
      utilFocusKey = key;
    }
    r = button.getBoundingClientRect(); sr = sceneEl.getBoundingClientRect(); scale = sr.width / 1920 || 1;
    width = Math.ceil(textWidth(text, 28, 500, -.2) + 8); x = (r.left + r.width / 2 - sr.left) / scale - width / 2;
    if (S.c.layout === 'list') x = 1730 - width;
    utilFocusLabel.style.width = width + 'px'; utilFocusLabel.style.left = clamp(x, 112, 1808 - width) + 'px';
    utilFocusLabel.style.top = ((S.c.layout === 'list' ? (r.top + r.height / 2 - sr.top) / scale - 19 : 140) + fontShift('ui', 28)) + 'px';
    utilFocusLabel.className = 'util-focus-label is-on';
  }
  function renderUtilityLens(button, iconsOnly) {
    var r, label, sr, scale, x, y, width, key, el;
    if (!button || S.c.focus !== 'glass') {
      utPlates.forEach(function (plateEl) { plateEl.className = 'ph-plate ut-lens is-outgoing'; });
      utPlateKey = null;
      return;
    }
    r = button.getBoundingClientRect(); sr = sceneEl.getBoundingClientRect(); scale = sr.width / 1920 || 1;
    y = (r.top - sr.top) / scale + 2;
    if (S.c.layout === 'list') {
      label = iconsOnly ? utilFocusLabel : button.querySelector('.u-label');
      x = (label.getBoundingClientRect().left - sr.left) / scale - 24;
      width = 1800 - x;
    } else {
      // Dock icons keep a fixed lens; the separate caption cannot overlap its neighbours.
      x = (r.left - sr.left) / scale; width = r.width / scale;
    }
    key = button.getAttribute('data-action') + '|' + x + '|' + y + '|' + width;
    if (key !== utPlateKey) {
      utPlates[utPlateIndex].className = 'ph-plate ut-lens is-outgoing';
      utPlateIndex = 1 - utPlateIndex; el = utPlates[utPlateIndex];
      el.className = 'ph-plate ut-lens is-preparing';
      el.style.width = width + 'px'; el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      fieldTransform(utFields[utPlateIndex], x, y, width, 60);
      el.offsetWidth;
      utPlateKey = key;
    }
    fieldTransform(utFields[utPlateIndex], x, y, width, 60);
    utPlates[utPlateIndex].className = 'ph-plate ut-lens is-current on-focus';
  }
  function renderAppFocusName(hs) {
    var it = hs.items[hs.i], width, x, y, placement;
    if (S.c.apps !== 'icons' || hs.mode !== 'browse' || hs.zone !== 'apps' || !it) { appFocusName.className = 'app-focus-name'; return; }
    appFocusName.textContent = app(it.id).name;
    width = Math.min(S.c.layout === 'list' ? 1056 : 1640, Math.ceil(textWidth(app(it.id).name, S.c.layout === 'list' ? 40 : 36, 500, -.6, 'primary') + 8));
    appFocusName.style.width = width + 'px';
    if (S.c.layout === 'list') {
      x = 280; placement = phFields[photoPlateIndex]._placement;
      y = placement.y + placement.height / 2 - 24;
    } else {
      x = clamp(dockAnchorCenter - width / 2, 140, 1780 - width); y = 932;
    }
    appFocusName.style.left = x + 'px'; appFocusName.style.top = (y + fontShift('primary', S.c.layout === 'list' ? 40 : 36)) + 'px';
    appFocusName.className = 'app-focus-name is-on';
  }

  function dockGeom(n) {
    var m = DOCK_MODES[S.c.apps], vis = Math.max(1, Math.min(5, n)), shelfW = vis * m.pitch - 8, w = shelfW + 32;
    var broad = S.geom === 'broad' && n > 5;
    if (n < 0) { w = 912; shelfW = 880; }
    else if (broad) { w = 1728; shelfW = 1696; }
    return { x: Math.round((1920 - w) / 2), y: 908 - m.th - 32, h: m.th + 32, w: w, shelf: shelfW, vis: vis, broad: broad, empty: n < 0, tw: m.tw, th: m.th, pitch: m.pitch };
  }
  /* Five centred: the window moves one tile when focus passes an edge. Broad: keep a
     148px glimpse of the neighbour, as the current dock does. */
  function dockOffset(n, i, g) {
    var off, left, first, glimpse = g.tw / 2;
    if (g.broad) {
      off = scroll.off * g.pitch; left = i * g.pitch;
      if (left - off < (i > 0 ? glimpse : 0)) off = left - (i > 0 ? glimpse : 0);
      if (left + g.tw - off > g.shelf - (i < n - 1 ? glimpse : 0)) off = left + g.tw - g.shelf + (i < n - 1 ? glimpse : 0);
      off = clamp(off, 0, Math.max(0, n * g.pitch - 8 - g.shelf));
      if (!S.reflow) { scroll.off = off / g.pitch; scroll.first = Math.round(scroll.off); }
      return off;
    }
    first = clamp(scroll.first, 0, Math.max(0, n - g.vis));
    if (i < first) first = i;
    if (i > first + g.vis - 1) first = i - g.vis + 1;
    if (!S.reflow) { scroll.first = first; scroll.off = first; }
    return first * g.pitch;
  }
  function dockTileHtml(it, full) {
    var a, body;
    if (it.kind === 'add') return '<span class="add">' + icon('plus') + '</span><span class="label">' + (full ? 'Home is full' : 'Add app') + '</span>';
    a = app(it.id);
    body = S.c.apps === 'text' ? '' : appMark(a, S.c.apps === 'icons' ? 136 : 120, S.c.apps === 'icons' ? 88 : 72, S.c.apps === 'icons' ? 72 : 58);
    return body + (S.c.apps === 'icons' ? '' : '<span class="label" style="font-size:' + dockLabelSize(a.id) + 'px;top:' + ((S.c.apps === 'text' ? 28 : 128) + fontShift('primary', dockLabelSize(a.id))) + 'px"><span class="label-ink">' + esc(a.name) + '</span></span>') + '<span class="nudge nudge-l">' + icon('left') + '</span><span class="nudge nudge-r">' + icon('right') + '</span>';
  }
  /* A wide label can reach the shelf before its icon. Check the rendered icon box,
     including during the track's 180ms transition, so both disappear together. */
  function syncDockEdges() {
    var broad = S.c.layout === 'dock' && S.geom === 'broad', clip = shelf.getBoundingClientRect(), changes = [];
    Array.prototype.forEach.call(track.querySelectorAll('.tile'), function (tile) {
      var content = tile.querySelector(S.c.apps === 'text' ? '.label-ink' : '.mark'), r = content ? content.getBoundingClientRect() : null;
      var outside = broad && r && (r.right <= clip.left || r.left >= clip.right);
      var cls = tile.className.replace(/\s+is-outside-icon/g, '') + (outside ? ' is-outside-icon' : '');
      if (tile.className !== cls) changes.push({ tile: tile, cls: cls });
    });
    changes.forEach(function (change) { change.tile.className = change.cls; });
  }
  function trackDockEdges() {
    dockEdgeFrame = 0;
    if (S.c.layout !== 'dock' || S.geom !== 'broad') return;
    syncDockEdges();
    if (Date.now() < dockEdgeUntil) dockEdgeFrame = window.requestAnimationFrame(trackDockEdges);
  }

  function renderDock(hs) {
    var items = hs.items, n = items.length, empty = hs.mode !== 'arrange' && !n, g = dockGeom(empty ? -1 : n);
    var anchor = clamp(hs.i, 0, Math.max(0, n - 1)), off = empty ? 0 : dockOffset(n, anchor, g);
    var full = false, ns = n;
    var tileFocus = hs.zone === 'apps' || hs.zone === 'tiles', tileSel = hs.zone === 'util' || hs.zone === 'act' || hs.zone === 'ctl' || hs.zone === 'preview';
    var focusItem = items[anchor], s, ax, label, width;

    dock.className = 'dock' + (empty ? ' is-empty' : '');
    dock.style.left = g.x + 'px'; dock.style.top = g.y + 'px'; dock.style.width = g.w + 'px'; dock.style.height = g.h + 'px';
    dock.style.setProperty('--tile-w', g.tw + 'px'); dock.style.setProperty('--tile-h', g.th + 'px'); dock.style.setProperty('--dock-h', g.h + 'px');
    dock.style.setProperty('--nudge-top', ((g.th - 48) / 2) + 'px');
    dockAnchorCenter = g.x + 16 + anchor * g.pitch - off + g.tw / 2;
    IMG.mat.style.left = (-g.x) + 'px'; IMG.mat.style.top = (-g.y) + 'px';
    IMG.mat.style.transformOrigin = '960px ' + (g.y + g.h / 2) + 'px';
    matScrim.style.left = (-g.x) + 'px'; matScrim.style.top = (SCRIM_Y - g.y) + 'px';
    matScrim.style.transformOrigin = '960px ' + (g.y + g.h / 2 - SCRIM_Y) + 'px';
    shelf.style.width = g.shelf + 'px';
    shelf.className = 'shelf' + (g.broad && off > 0 ? ' fade-l' : '') + (g.broad && off + g.shelf < n * g.pitch - 8 ? ' fade-r' : '');

    keyed(track, empty ? [] : items, function (el, it, i) {
      var a = it.id ? app(it.id) : null, left = i * g.pitch, focus = tileFocus && i === anchor, sel = tileSel && i === anchor;
      var lifted = hs.lifted && i === anchor, partial = g.broad && (left - off < -1 || left + g.tw - off > g.shelf + 1);
      setContent(el, it.kind + '|' + (it.id || '') + '|' + (it.id ? dockLabelSize(it.id) : full) + '|' + S.c.bg + '|' + S.c.apps + '|' + homeFont(), function () { return '<span class="tile-content">' + dockTileHtml(it, full) + '</span>'; });
      el.className = 'tile k-' + it.kind + (focus ? ' is-focus' : '') + (sel ? ' is-sel' : '') + (lifted ? ' is-lifted' : '') + (partial ? ' is-partial' : '')
        + (a && !a.mark ? ' is-text' : '') + (it.kind === 'add' && full ? ' is-full' : '') + (it.kind === 'app' && S.press === it.id ? ' is-press' : '')
        + (lifted && i === 0 ? ' no-l' : '') + (lifted && i >= ns - 1 ? ' no-r' : '');
      el.style.transform = 'translate3d(' + left + 'px,0,0)';
      el.setAttribute('role', 'button');
      if (a) el.setAttribute('aria-label', a.name);
      if (hs.mode === 'arrange') attrs(el, 'tile', i, 'arrange.' + (it.kind === 'add' ? 'add' : (it.kind === 'ph' ? 'placeholder.' : 'tile.') + it.id));
      else attrs(el, 'app', i, 'home.app.' + it.id);
    });
    track.style.transform = 'translate3d(' + (-off) + 'px,0,0)';
    syncDockEdges();
    if (g.broad) {
      dockEdgeUntil = Date.now() + 220;
      if (!dockEdgeFrame) dockEdgeFrame = window.requestAnimationFrame(trackDockEdges);
    }
    plate.className = 'plate' + (!n || empty || hs.zone === null ? '' : hs.lifted ? ' on-lift' : tileFocus ? ' on-focus' : tileSel ? ' on-sel' : '');
    plate.style.transform = 'translate3d(' + (anchor * g.pitch) + 'px,0,0)';

    cueL.style.left = (g.x - 72) + 'px'; cueR.style.left = (g.x + g.w + 24) + 'px';
    cueL.style.top = cueR.style.top = (g.y + g.h / 2 - 24) + 'px';
    cueL.className = 'cue' + (!g.broad && !empty && scroll.first > 0 ? ' is-on' : '');
    cueR.className = 'cue' + (!g.broad && !empty && scroll.first + g.vis < n ? ' is-on' : '');

    ax = g.x + 16 + anchor * g.pitch - off;
    if (hs.mode === 'arrange' && !hs.lifted && (hs.zone === 'tiles' || hs.zone === 'act') && focusItem && focusItem.kind !== 'add') {
      s = hs.arr.slots[anchor];
      label = (s.removed ? 'Restore ' : 'Remove ') + app(s.id).name; width = actionWidth(label);
      ax = clamp(ax + (g.tw - width) / 2, 112, 1808 - width);
      setHTML(dockAction, '<span>' + esc(label) + '</span>');
      dockAction.className = 'dock-action is-on' + (hs.zone === 'act' ? ' is-focus' : '');
      dockAction.style.width = width + 'px';
      dockAction.style.transform = 'translate3d(' + ax + 'px,0,0)';
      attrs(dockAction, 'act', anchor, 'arrange.' + (s.removed ? 'restore.' : 'remove.') + s.id);
    } else {
      dockAction.className = 'dock-action';
      dockAction.removeAttribute('data-z'); dockAction.removeAttribute('data-action');
    }
    setHTML(dockEmpty, empty ? '<p>No apps on Home</p><button type="button" tabindex="-1" class="btn' + (hs.zone === 'empty' ? ' is-focus' : '') + '" data-z="empty" data-i="0" data-action="home.add-apps">' + icon('plus') + '<span>Add apps</span></button>' : '');
  }

  function photoModeTransition(compact) {
    if (photoMode !== null && photoMode !== compact) {
      var ghost = phScene.cloneNode(true), token = ++photoTransitionToken;
      ghost.removeAttribute('id'); ghost.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(ghost.querySelectorAll('[id],[data-action],[data-z]'), function (el) {
        el.removeAttribute('id'); el.removeAttribute('data-action'); el.removeAttribute('data-z');
      });
      ghost.className = 'ph-scene ph-ghost';
      phScene.parentNode.appendChild(ghost);
      phScene.className = 'ph-scene ph-incoming';
      setTimeout(function () {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (token === photoTransitionToken) phScene.className = 'ph-scene';
      }, 180);
    }
    photoMode = compact;
  }
  /* Each plate keeps a stationary, stage-registered field while its opacity changes.
     Reuse the hidden group for the next label; never animate plate width or position. */
  function renderPhotoPlate(id, width, height, y, state) {
    var key = id + '|' + width + '|' + height + '|' + y, plateEl, fieldEl;
    if (key !== photoPlateKey) {
      phPlates[photoPlateIndex].className = phPlates[photoPlateIndex].className.replace(' is-current', '') + ' is-outgoing';
      photoPlateIndex = 1 - photoPlateIndex;
      plateEl = phPlates[photoPlateIndex]; fieldEl = phFields[photoPlateIndex];
      plateEl.className = 'ph-plate is-preparing';
      plateEl.style.width = width + 'px'; plateEl.style.height = height + 'px';
      plateEl.style.transform = 'translate3d(0,' + y + 'px,0)';
      fieldTransform(fieldEl, 112, y, width, height);
      plateEl.offsetWidth; // Establish zero opacity before the incoming crossfade.
      photoPlateKey = key;
    }
    fieldTransform(phFields[photoPlateIndex], 112, y, width, height);
    phPlates[photoPlateIndex].className = 'ph-plate is-current' + (state ? ' ' + state : '');
  }
  function fieldTransform(el, x, y, width, height) {
    el._placement = { x: x, y: y, width: width, height: height };
    el.style.transformOrigin = (x + width / 2) + 'px ' + (y + height / 2) + 'px';
    el.style.transform = 'translate3d(' + (-x) + 'px,' + (-y) + 'px,0)' + (S.c.bg === 'photo' && S.c.material === 'tint' && !REDUCED_MOTION ? ' scale(1.04)' : '');
  }
  function renderList(hs) {
    var items = hs.items, n = items.length, compact = hs.mode === 'arrange', pitch = compact ? PH_COMPACT_PITCH : PH_PITCH;
    var anchor = clamp(hs.i, 0, Math.max(0, n - 1)), first, off, width, slot, y, s, label, aw, plateState;
    var rowFocus = hs.zone === 'apps' || hs.zone === 'tiles', remembered = hs.zone === 'util' || hs.zone === 'act' || hs.zone === 'ctl' || hs.zone === 'preview';
    photoModeTransition(compact);
    if (compact) {
      first = clamp(scroll.photoArrange, anchor - 7, anchor - 1);
      first = clamp(first, 0, Math.max(0, n - PH_COMPACT_VISIBLE));
      scroll.photoArrange = first;
    } else {
      first = clamp(scroll.photo, anchor - 3, anchor - 1);
      first = clamp(first, 0, Math.max(0, n - PH_FULL));
      scroll.photo = first;
    }
    off = first * pitch; slot = anchor - first;
    width = items[anchor] ? listPlateWidth(items[anchor].id, compact) : 360;
    phList.className = 'ph-list' + (compact ? ' is-compact' : '');
    phList.style.height = PH_HEIGHT + 'px';
    phRows.style.top = (compact ? 72 : 148) + 'px';
    keyed(phRows, items, function (row, it, i) {
      var typography = photoLabel(it.id, compact), focus = rowFocus && i === anchor, lifted = hs.lifted && i === anchor, markImage, body = '';
      setContent(row, it.id + '|' + typography.size + '|' + S.c.bg + '|' + S.c.apps + '|' + homeFont(), function () {
        if (S.c.apps !== 'text') body += appMark(app(it.id), S.c.apps === 'icons' ? compact ? 64 : 88 : compact ? 60 : 84, S.c.apps === 'icons' ? compact ? 64 : 88 : compact ? 44 : 64, S.c.apps === 'icons' ? compact ? 52 : 72 : compact ? 42 : 54);
        if (S.c.apps !== 'icons') body += '<span class="ph-name" style="font-size:' + typography.size + 'px;top:' + typography.top + 'px">' + esc(app(it.id).name) + '</span>';
        return '<span class="ph-group">' + body + '</span><span class="ph-move ph-move-up">' + icon('up') + '</span><span class="ph-move ph-move-down">' + icon('down') + '</span>';
      });
      markImage = row.querySelector('.mark img');
      if (markImage) {
        markImage.onerror = function () { this.style.visibility = 'hidden'; };
        if (markImage.complete && !markImage.naturalWidth) markImage.style.visibility = 'hidden';
      }
      row.className = 'ph-row k-' + it.kind + (focus ? ' is-focus' : '') + (remembered && i === anchor ? ' is-sel' : '') + (lifted ? ' is-lifted' : '')
        + (lifted && i === 0 ? ' no-up' : '') + (lifted && i === n - 1 ? ' no-down' : '')
        + (it.kind === 'app' && S.press === it.id ? ' is-press' : '');
      row.style.width = (compact ? listPlateWidth(it.id, compact) : 1200) + 'px'; row.style.height = pitch + 'px';
      row.style.transform = 'translate3d(0,' + (i * pitch) + 'px,0)';
      row.setAttribute('role', 'button'); row.setAttribute('aria-label', app(it.id).name);
      attrs(row, compact ? 'tile' : 'app', i, compact ? 'arrange.' + (it.kind === 'ph' ? 'placeholder.' : 'tile.') + it.id : 'home.app.' + it.id);
    });
    phRows.style.transform = 'translate3d(0,' + (-off) + 'px,0)';
    y = (compact ? PH_COMPACT_TOP + 2 : PH_TOP + 1) + slot * pitch;
    plateState = !n || hs.zone === null ? '' : hs.lifted ? 'on-lift' : S.c.focus === 'glass' && rowFocus ? 'on-focus' : S.c.focus === 'glass' && remembered ? 'on-sel' : '';
    renderPhotoPlate(items[anchor] ? items[anchor].id : '', width, compact ? 88 : 134, y, plateState);
    if (compact && !hs.lifted && (hs.zone === 'tiles' || hs.zone === 'act') && items[anchor]) {
      s = hs.arr.slots[anchor]; label = (s.removed ? 'Restore ' : 'Remove ') + app(s.id).name; aw = actionWidth(label);
      setHTML(phAction, '<span>' + esc(label) + '</span>');
      phAction.className = 'ph-action is-on' + (hs.zone === 'act' ? ' is-focus' : '');
      phAction.style.width = aw + 'px';
      phAction.style.transform = 'translate3d(' + (112 + width + 24) + 'px,' + (PH_COMPACT_TOP + slot * pitch + 12) + 'px,0)';
      attrs(phAction, 'act', anchor, 'arrange.' + (s.removed ? 'restore.' : 'remove.') + s.id);
    } else { phAction.className = 'ph-action'; phAction.removeAttribute('data-z'); phAction.removeAttribute('data-action'); }
    phEmpty.className = 'ph-empty' + (!compact && !n ? ' is-on' : '');
    setHTML(phEmpty, !compact && !n ? '<p>No apps on Home</p><button type="button" tabindex="-1" class="btn' + (hs.zone === 'empty' ? ' is-focus' : '') + '" data-z="empty" data-i="0" data-action="home.add-apps">' + icon('plus') + '<span>Add apps</span></button>' : '');
  }

  /* Sheets: a frame is built once per view/mode; fill() updates its slots. Persistent
     scrollers let transforms animate. */
  function renderSheet(t, sheet) {
    var key;
    sheetEl.hidden = !(sheet || isSettingsDetail(t));
    sheetView.hidden = !sheet;
    if (sheet) sheetView.setAttribute('aria-modal', 'true');
    else sheetView.removeAttribute('aria-modal');
    sceneEl.setAttribute('aria-hidden', sheet || isSettingsDetail(t) ? 'true' : 'false');
    if (!sheet) { sheetView.innerHTML = ''; sheetKey = ''; return; }
    key = t.id + '|' + (t.mode || '') + '|' + (t.msg || '') + '|' + S.variant + '|' + S.c.bg;
    if (key !== sheetKey) {
      sheetView.innerHTML = FRAMES[t.id](t);
      sheetKey = key; slotEls = {};
      Array.prototype.forEach.call(sheetView.querySelectorAll('[data-slot]'), function (el) { slotEls[el.getAttribute('data-slot')] = el; });
    }
    FILLS[t.id](t, slotEls);
  }
  function renderAppearance(t) {
    appearanceEl.hidden = !isSettingsDetail(t);
    if (appearanceEl.hidden) { appearanceEl.removeAttribute('aria-modal'); return; }
    appearanceEl.setAttribute('aria-modal', 'true');
    if (t.id === 'wallpaper') { renderWallpaper(t); return; }
    V.appearance.norm(t);
    appearanceEl.className = 'appearance detail-' + t.group;
    appearanceRows.className = 'appearance-rows';
    appearanceTitle.textContent = DETAIL_NAMES[t.group];
    var at = detailLocation(t), selected = at.item, error = S.lookError, status = '', hint;
    function command(item, inner, cls) {
      var applied = (item.axis && S.c[item.axis] === item.value) || (item.portDev && S.c.ports[item.portDev] === item.portVal);
      var isRadio = !!(item.axis || item.portDev);
      var loading = !!(item.axis && S.pending && S.pending.target[item.axis] === item.value && S.pending.row === item.axis);
      return '<button type="button" tabindex="-1" class="setting-choice' + (cls ? ' ' + cls : '') + (t.f.action === item.action ? ' is-focus' : '') + (item.disabled ? ' is-disabled' : '') + (applied ? ' is-applied' : '') + (loading ? ' is-loading' : '') + '"'
        + (isRadio ? ' role="radio" aria-checked="' + !!applied + '"' : '') + ' aria-label="' + esc(item.axis && item.value === 'both' ? 'Icons and text' : item.label) + '" aria-disabled="' + !!item.disabled + '" aria-busy="' + loading + '"'
        + ' data-z="detail" data-i="0" data-id="' + item.action + '" data-action="' + item.action + '">' + inner
        + (isRadio ? '<span class="setting-tick" aria-hidden="true">' + (applied ? icon('check') : '') + '</span>' : '') + '</button>';
    }
    var backLabel = t.group === 'rotation' ? 'Background' : t.group === 'inputs' ? 'LG TV' : 'Settings';
    setHTML(appearanceBack, command({ action: 'settings.back', label: backLabel }, icon('left') + '<span>' + backLabel + '</span>', 'setting-back'));
    setHTML(appearanceRows, detailSections(t).map(function (section) {
      return '<section class="setting-section' + (section.horizontal ? ' is-horizontal' : '') + ' section-' + section.id + '">'
        + (section.title ? '<h3 class="setting-label" id="setting-' + section.id + '">' + section.title + '</h3>' : '')
        + '<div class="setting-options"' + ((section.items[0].axis || section.items[0].portDev) ? ' role="radiogroup" aria-label="' + esc(section.title || LOOK_NAMES[section.id] || DETAIL_NAMES[t.group]) + '"' : '') + '>'
        + section.items.map(function (item) {
          var swatch = item.axis === 'bg', body = '';
          if (swatch || item.thumbnail) body += item.value === 'light' || item.value === 'dark'
            ? '<span class="setting-swatch swatch-' + item.value + '" aria-hidden="true"></span>'
            : '<img class="setting-swatch" src="' + WP + S.c.wall + '-thumb.jpg" alt="">';
          body += '<span class="setting-copy"><span class="setting-name">' + esc(item.label) + '</span>'
            + (item.description ? '<span class="setting-description">' + esc(item.description) + '</span>' : '') + '</span>';
          if (!item.axis && !item.portDev) body += icon('right', 'setting-forward');
          return command(item, body, item.description ? 'has-description' : '');
        }).join('') + '</div>'
        + (section.reason ? '<p class="setting-reason">' + esc(section.reason) + '</p>' : '') + '</section>';
    }).join(''));
    if (S.pending) status = '<p>Loading ' + esc(S.pending.row === 'font' ? FONTS[S.pending.target.font].name : 'your choice') + '…</p><p>Back cancels this change.</p>';
    else if (error) {
      status = '<p class="setting-error">' + (error.type === 'save' ? 'Couldn’t save this change.' : error.type === 'font' ? 'Couldn’t load ' + esc(FONTS[error.font].name) + '.' : 'Couldn’t load this appearance.') + ' Your current choice is kept.</p>'
        + command({ action: 'settings.retry', label: 'Try again' }, '<span>Try again</span>', 'setting-retry');
    }
    setHTML(appearanceStatus, status);
    hint = selected.disabled ? '' : selected.action === 'settings.back' ? 'Return to ' + backLabel : selected.action === 'settings.retry' ? 'Retry this change' : (selected.axis || selected.portDev) ? 'Apply selected setting' : selected.action === 'background.wallpaper' ? 'Choose a wallpaper' : selected.action === 'background.rotation' ? 'Choose a rotation interval' : /^samsung\.(ambient|ambientSleep|autoNight|sounds|bgMotion|todWall)$/.test(selected.action) ? 'Change setting' : 'Open on the TV';
    setHTML(appearanceDesc, hint ? '<span class="remote-key">OK</span><span>' + esc(hint) + '</span>' : '');
  }
  function renderWallpaper(t) {
    V.wallpaper.norm(t);
    appearanceEl.className = 'appearance detail-wallpaper';
    appearanceTitle.textContent = 'Wallpaper';
    appearanceRows.className = 'appearance-rows wallpaper-picker';
    setHTML(appearanceBack, '<button type="button" tabindex="-1" class="setting-choice setting-back' + (t.f.zone === 'back' ? ' is-focus' : '') + '" data-z="wall-back" data-action="wallpaper.back">' + icon('left') + '<span>Background</span></button>');
    setHTML(appearanceRows, '<div class="wallpaper-edge wallpaper-before" aria-hidden="true">' + icon('up') + '</div><div class="wallpaper-list" role="radiogroup" aria-label="Wallpaper"><div class="wallpaper-rows"></div></div><div class="wallpaper-edge wallpaper-after" aria-hidden="true">' + icon('down') + '</div>');
    var rows = appearanceRows.querySelector('.wallpaper-rows'), shown = wall(S.wallShown) || wall(S.c.wall), candidate = WALLS[t.i], status, note, hint;
    keyed(rows, WALLS.map(function (w) { return { key: w.id, wall: w }; }), function (row, item, i) {
      var visible = i >= t.top && i < t.top + WALL_VISIBLE, w = item.wall, image;
      setContent(row, w.id + '|' + visible, function () { return '<span class="wallpaper-thumb">' + (visible ? '<img src="' + WP + w.id + '-thumb.jpg" alt="">' : '') + '</span><span class="setting-copy"><span class="setting-name">' + esc(w.name) + '</span></span><span class="setting-tick" aria-hidden="true"></span>'; });
      row.className = 'setting-choice wallpaper-choice' + (t.f.zone === 'photo' && t.i === i ? ' is-focus' : '') + (w.id === S.c.wall ? ' is-applied' : '');
      row.style.transform = 'translate3d(0,' + (i * WALL_ROW) + 'px,0)'; row.style.visibility = visible ? 'visible' : 'hidden';
      row.setAttribute('role', 'radio'); row.setAttribute('tabindex', '-1'); row.setAttribute('aria-label', w.name);
      row.setAttribute('aria-checked', String(w.id === S.c.wall)); row.setAttribute('aria-posinset', String(i + 1)); row.setAttribute('aria-setsize', String(WALLS.length));
      row.setAttribute('aria-busy', String(t.previewDue === w.id || S.wallPending === w.id));
      attrs(row, 'wall-choice', i, 'wallpaper.choose.' + w.id);
      setHTML(row.querySelector('.setting-tick'), w.id === S.c.wall ? icon('check') : '');
      image = row.querySelector('img');
      if (image && !image._wallBound) {
        image._wallBound = true;
        image.onerror = function () { this.parentNode.className = 'wallpaper-thumb is-missing'; };
        if (image.complete && !image.naturalWidth) image.onerror();
      }
    });
    rows.style.transform = 'translate3d(0,' + (-t.top * WALL_ROW) + 'px,0)';
    appearanceRows.querySelector('.wallpaper-before').className = 'wallpaper-edge wallpaper-before' + (t.top > 0 ? ' is-on' : '');
    appearanceRows.querySelector('.wallpaper-after').className = 'wallpaper-edge wallpaper-after' + (t.top + WALL_VISIBLE < WALLS.length ? ' is-on' : '');
    note = t.previewDue ? 'Preparing ' + candidate.name + '…' : S.wallPending ? (t.applyPending ? 'Applying ' : 'Loading ') + candidate.name + '…' : shown.id === S.c.wall ? 'Applied' : 'Preview';
    if (t.failedId) note = S.err ? 'Couldn’t save ' + wall(t.failedId).name + '.' : 'Couldn’t load ' + wall(t.failedId).name + '.';
    status = '<p class="wallpaper-preview-name"><span>' + esc(shown.name) + '</span><span class="wallpaper-count">' + (wallIndex(shown.id) + 1) + ' of ' + WALLS.length + '</span></p><p class="wallpaper-preview-state' + (t.failedId ? ' setting-error' : '') + '">' + esc(note) + '</p>';
    if (t.failedId) status += '<button type="button" tabindex="-1" class="setting-choice setting-retry' + (t.f.zone === 'retry' ? ' is-focus' : '') + '" data-z="wall-retry" data-action="wallpaper.retry">Try again</button>';
    setHTML(appearanceStatus, status);
    hint = t.f.zone === 'back' ? 'Return to Background' : t.f.zone === 'retry' ? 'Retry this photo' : 'Apply selected photo';
    if (t.f.zone === 'photo' && candidate.id === S.c.wall && !S.pending && !t.failedId) hint = '';
    setHTML(appearanceDesc, hint ? '<span class="remote-key">OK</span><span>' + hint + '</span>' : '');
  }
  /* Keep the retry or membership state on the focused control. The stage-level line
     shares its position without changing the control's identity or key behaviour. */
  function renderFocusStatus(t) {
    if (isSettingsDetail(t)) { focusStatus.className = 'focus-status'; return; }
    var root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl, active = root.querySelectorAll('.is-focus[data-action]'), target = null, text = S.err ? 'Not saved. OK tries again.' : '', i, r, sr, scale, x, y, w, action, solid, photoRow = false, photoFree = false;
    Array.prototype.forEach.call(stage.querySelectorAll('.has-local-status'), function (el) { el.className = el.className.replace(/\s+has-local-status/g, ''); });
    for (i = 0; i < active.length; i++) if (renderedAction(active[i])) { target = active[i]; break; }
    if (!text && t.id === 'arrange' && (t.f.zone === 'act' || t.f.zone === 'tiles')) {
      var slot = t.slots[t.f.i];
      if (slot && !slot.removed && t.f.zone === 'act' && S.c.home.length === 1) text = LAST;
    }
    if (!text && S.note === LAST && t.id === 'arrange') text = LAST;
    if (!target || !text) { focusStatus.className = 'focus-status'; return; }
    if (target.parentNode === utilsEl && utilsEl.className.indexOf('is-icons') >= 0) { renderUtilFocusLabel(target); focusStatus.className = 'focus-status'; return; }
    // Photo action pills stay on one line; the header already carries this status.
    if (S.c.layout === 'list' && t.id === 'arrange' && !t.lifted && (t.f.zone === 'act' || t.f.zone === 'tiles')) { focusStatus.className = 'focus-status'; return; }
    photoRow = S.c.layout === 'list' && target.className.indexOf('ph-row') >= 0;
    if (photoRow && phAction.className.indexOf('is-on') >= 0) target = phAction;
    else if (photoRow) photoFree = true;
    target.className += ' has-local-status';
    action = target.getAttribute('data-action');
    r = target.getBoundingClientRect(); sr = stage.getBoundingClientRect(); scale = sr.width / 1920 || 1;
    x = (r.left - sr.left) / scale; y = (r.top - sr.top) / scale; w = r.width / scale;
    if (photoFree) { x = 112 + parseFloat(phPlates[photoPlateIndex].style.width) + 24; y += (r.height / scale - 28) / 2; w = 400; }
    else if (action.indexOf('home.app.') === 0 || action.indexOf('arrange.tile.') === 0 || action.indexOf('arrange.placeholder.') === 0) y += 171;
    else if (action.indexOf('apps.order.') === 0) y += 86;
    else if (action.indexOf('apps.toggle.') === 0 || action.indexOf('apps.add.') === 0) y += 164;
    else if (action.indexOf('layout.') === 0) y += 54;
    else y += action.indexOf('arrange.remove.') === 0 || action.indexOf('arrange.restore.') === 0 ? 43 : 40;
    solid = /(?:^|\s)(?:u|btn|er-rm|dock-action|set-row|ph-action)(?:\s|$)/.test(target.className) && target.parentNode !== utilsEl && target.parentNode.className.indexOf('s-head') < 0;
    if (target === phAction && target.className.indexOf('is-focus') < 0) solid = false;
    focusStatus.className = 'focus-status is-on' + (solid ? ' dark-ink' : '') + (photoFree ? ' photo-status' : '');
    focusStatus.textContent = text;
    focusStatus.style.left = clamp(x + 8, 112, 1808 - Math.min(w - 16, 800)) + 'px';
    focusStatus.style.top = clamp(y, 72, 988) + 'px';
    focusStatus.style.width = Math.min(w - 16, 800) + 'px';
  }
  function headButtons(list, fi, prefix) {
    return list.map(function (b, i) {
      return '<button type="button" tabindex="-1" class="btn' + (i === fi ? ' is-focus' : '') + (b[2] ? ' ' + b[2] : '') + '" data-z="head" data-i="' + i + '" data-action="' + prefix + '.' + b[0] + '" aria-label="' + esc(b[0] === 'undo' ? undoCaption() : b[1]) + '">' + (b[3] ? icon(b[3]) : '') + '<span>' + b[1] + '</span></button>';
    }).join('');
  }
  var FRAMES = {
    apps: function () {
      return '<h2 class="s-title" data-slot="title"></h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div>'
        + '<div class="grid-view" data-slot="view"><div class="grid-in" data-slot="grid"></div></div>'
        + '<div class="row-cue grid-before" data-slot="before" aria-hidden="true">' + icon('up') + '</div><div class="row-cue grid-after" data-slot="after" aria-hidden="true">' + icon('down') + '</div>';
    },
    editor: function () {
      return '<h2 class="s-title">Apps on Home</h2><p class="s-sub" data-slot="sub"></p><div class="s-head" data-slot="head"></div>'
        + '<p class="s-label z-home" data-slot="lh"></p><p class="s-label z-other">Not on Home</p>'
        + '<div class="ed-home" data-slot="home"></div><div class="ed-order-break" data-slot="break">Then scroll</div><div class="ed-other-view" data-slot="ov"><div class="ed-other" data-slot="other"></div></div><div class="ed-origin" data-slot="origin"></div>'
        + '<div class="row-cue editor-before" data-slot="otherBefore" aria-hidden="true">' + icon('up') + '</div><div class="row-cue editor-after" data-slot="otherAfter" aria-hidden="true">' + icon('down') + '</div>';
    },
    settings: function () { return '<h2 class="s-title">Settings</h2><div class="settings-overview" data-slot="list"></div><p class="settings-overview-hint"><span class="remote-key">OK</span><span>Open selected group</span></p>'; },
    message: function (t) {
      var m = messageContent(t);
      return '<h2 class="msg-title">' + esc(m.title) + '</h2><p class="msg-line">' + esc(m.line) + '</p><p class="msg-note">' + esc(m.note) + '</p><div class="msg-acts" data-slot="acts"></div>';
    }
  };
  function gridTileHtml(id) {
    var a = app(id), state = onHome(id) ? badge(true) + '<span>On Home</span>' : '';
    return '<span class="panel-content">' + appMark(a, 120, 72, 58) + '<span class="label">' + esc(a.name) + '</span></span><span class="state">' + state + '</span>';
  }
  var FILLS = {
    apps: function (t, el) {
      var f = t.f, items = appsItems(), n = items.length, rows = Math.ceil(n / COLS), vis = 3, row = Math.floor(f.i / COLS);
      setHTML(el.title, 'All apps');
      setHTML(el.sub, esc(catalog.loading ? 'Loading installed apps…' : catalog.error || (!n ? 'No installed apps found.' : '')));
      setHTML(el.head, headButtons(appsHead(), f.zone === 'head' ? 0 : -1, 'apps'));
      el.head.className = 's-head' + (f.zone === 'head' ? ' is-awake' : '');
      if (f.zone === 'grid') { if (row < t.top) t.top = row; if (row > t.top + vis - 1) t.top = row - vis + 1; }
      t.top = clamp(t.top, 0, Math.max(0, rows - vis));
      keyed(el.grid, items.map(function (id) { return { key: id, id: id }; }), function (tile, it, i) {
        var focus = f.zone === 'grid' && i === f.i;
        setContent(tile, [it.id, app(it.id).name, onHome(it.id)].join('|'), function () { return gridTileHtml(it.id); });
        tile.className = 'gt' + (focus ? ' is-focus' : '');
        tile.style.transform = 'translate3d(' + ((i % COLS) * GRID_COL) + 'px,' + (Math.floor(i / COLS) * GRID_ROW) + 'px,0)';
        tile.setAttribute('role', 'button'); tile.setAttribute('aria-label', app(it.id).name);
        attrs(tile, 'grid', i, 'apps.open.' + it.id);
      });
      el.grid.style.transform = 'translate3d(0,' + (-t.top * GRID_ROW) + 'px,0)';
      el.view.className = 'grid-view' + (t.top > 0 ? ' more-before' : '') + (rows - t.top > vis ? ' more-after' : '');
      el.before.className = 'row-cue grid-before' + (t.top > 0 ? ' is-on' : '');
      el.after.className = 'row-cue grid-after' + (rows - t.top > vis ? ' is-on' : '');
    },
    editor: function (t, el) {
      var f = t.f, H = t.lifted ? t.lifted.order : S.c.home, O = otherGroups(), list = O.recent.concat(O.rest), full = S.c.home.length >= CAP;
      var entries = [], ys = [], y = 0, yf, minTop, maxTop = 0, rowEnd, before = false, afterRows = false;
      var hint = catalog.error ? catalog.error : catalog.loading ? 'Loading installed apps…' : f.zone === 'head' && f.h === 0 ? undoCaption() : f.zone === 'home' && f.part === 'remove' ? (H.length <= 1 ? LAST : app(H[f.i]).name + ' stays installed.') : '';
      setHTML(el.sub, editStatus(hint, t.lifted ? 'Moving ' + app(t.lifted.id).name + '. OK places it, Back puts it back.' : ''));
      setHTML(el.head, headButtons([['undo', 'Undo', S.undo.length ? '' : 'is-idle', 'undo'], ['done', 'Done', '', 'check']], f.zone === 'head' ? f.h : -1, 'editor'));
      el.head.className = 's-head' + (f.zone === 'head' ? ' is-awake' : '');
      setHTML(el.lh, 'On Home <span class="s-count">' + S.c.home.length + ' of ' + CAP + '</span>');
      el['break'].className = 'ed-order-break' + (H.length > editorCut() ? ' is-on' : '');
      el['break'].style.top = (264 + editorCut() * ED_ROW) + 'px';

      keyed(el.home, H.map(function (id) { return { key: id, id: id }; }), function (row, it, i) {
        var a = app(it.id), here = f.zone === 'home' && i === f.i, lifted = !!t.lifted && i === f.i;
        setContent(row, it.id, function () { return '<div class="er-name" role="button"><span class="panel-content"><span class="er-num"></span>' + smallMark(a) + '<span class="er-text">' + esc(a.name) + '</span><span class="er-move">' + icon('updown') + '</span></span></div><div class="er-rm" role="button"><span></span></div>'; });
        row.className = 'er' + (here ? ' is-active' : '') + (lifted ? ' is-lifted' : '');
        row.style.transform = 'translate3d(' + (lifted ? 16 : 0) + 'px,' + editorHomeY(i) + 'px,0)';
        row.querySelector('.er-num').textContent = String(i + 1);
        row.firstChild.className = 'er-name' + (here && (f.part === 'name' || lifted) ? ' is-focus' : '');
        row.lastChild.className = 'er-rm' + (here && f.part === 'remove' && !lifted ? ' is-focus' : '') + (H.length <= 1 ? ' is-limit' : '');
        row.lastChild.firstChild.textContent = H.length <= 1 ? LAST : 'Remove from Home';
        attrs(row.firstChild, 'name', i, 'editor.move.' + it.id);
        attrs(row.lastChild, 'remove', i, 'editor.remove.' + it.id);
      });
      el.origin.className = 'ed-origin' + (t.lifted && t.lifted.from !== f.i ? ' is-on' : '');
      if (t.lifted) el.origin.style.transform = 'translate3d(0,' + (264 + editorHomeY(t.lifted.from) + 16) + 'px,0)';

      if (O.recent.length) { entries.push({ key: 'sep-recent', sep: 'Recently removed', y: y }); y += ED_SEP; }
      O.recent.forEach(function (id) { entries.push({ key: id, id: id, y: y }); ys.push(y); y += ED_ROW; });
      if (O.recent.length && O.rest.length) { entries.push({ key: 'sep-rest', sep: 'Other installed apps', y: y }); y += ED_SEP; }
      O.rest.forEach(function (id) { entries.push({ key: id, id: id, y: y }); ys.push(y); y += ED_ROW; });
      if (f.zone === 'other' && ys.length) {
        yf = ys[f.j] - (O.recent.length && (f.j === 0 || f.j === O.recent.length) ? ED_SEP : 0);
        if (yf < t.top) t.top = yf;
        if (ys[f.j] + 72 > t.top + ED_VIEW) {
          minTop = ys[f.j] + 72 - ED_VIEW;
          entries.some(function (it) { if (it.y < minTop) return false; t.top = it.y; return true; });
        }
      }
      entries.some(function (it) { if (it.y < Math.max(0, y - ED_VIEW)) return false; maxTop = it.y; return true; });
      t.top = clamp(t.top, 0, maxTop);
      keyed(el.other, entries, function (row, it) {
        var j, focus, a;
        row.style.transform = 'translate3d(0,' + it.y + 'px,0)';
        rowEnd = it.y + (it.sep ? ED_SEP : 72);
        row.style.visibility = it.y >= t.top && rowEnd <= t.top + ED_VIEW ? 'visible' : 'hidden';
        before = before || it.y < t.top; afterRows = afterRows || rowEnd > t.top + ED_VIEW;
        if (it.sep) { setContent(row, 'sep|' + it.sep, function () { return esc(it.sep); }); row.className = 'eo-sep'; return; }
        j = list.indexOf(it.id); focus = f.zone === 'other' && j === f.j; a = app(it.id);
        setContent(row, it.id, function () { return '<span class="panel-content">' + smallMark(a) + '<span class="eo-text">' + esc(a.name) + '</span><span class="eo-verb"></span></span>'; });
        setHTML(row.querySelector('.eo-verb'), focus ? '<span class="verb' + (full ? ' is-off' : '') + '">' + (full ? 'Home is full' : 'Add to Home') + '</span>' : '');
        row.className = 'eo' + (focus ? ' is-focus' : '');
        row.setAttribute('role', 'button');
        attrs(row, 'other', j, 'editor.add.' + it.id);
      });
      el.other.style.transform = 'translate3d(0,' + (-t.top) + 'px,0)';
      el.ov.className = 'ed-other-view';
      el.otherBefore.className = 'row-cue editor-before' + (before ? ' is-on' : '');
      el.otherAfter.className = 'row-cue editor-after' + (afterRows ? ' is-on' : '');
    },
    settings: function (t, el) {
      var html = '';
      settingsRows().forEach(function (r) {
        html += '<button type="button" tabindex="-1" class="settings-group' + (r.id === t.f.id ? ' is-focus' : '') + '" data-z="row" data-i="0" data-id="' + r.id + '" data-action="settings.' + (r.id === 'editor' ? 'editor' : 'group.' + r.id) + '"><span class="settings-group-copy"><span class="settings-group-name">' + esc(r.label) + '</span><span class="settings-group-value">' + esc(r.value) + '</span></span>' + icon('right') + '</button>';
      });
      setHTML(el.list, html);
    },
    message: function (t, el) {
      setHTML(el.acts, messageContent(t).actions.map(function (a, i) {
        return '<button type="button" tabindex="-1" class="btn' + (i === t.f.b ? ' is-focus' : '') + '" data-z="act" data-i="' + i + '" data-action="message.' + a[0] + '"><span>' + a[1] + '</span></button>';
      }).join(''));
    }
  };

  /* ---------- Atomic appearance bundles ---------- */
  var wallToken = 0, committedBundle = null, reflowToken = 0, fontSwitchToken = 0;
  function registeredMaterial(id) { return S.c.bg === 'photo' && S.c.material === 'soft' && !!wall(id); }
  function matSrc(id, material) { return 'assets/materials/' + id + (material === 'soft' ? '-study-soft.jpg' : material === 'tint' ? '-field-clear.jpg' : '-field-frost.jpg'); }
  function fieldSrc(id, material) { return 'assets/materials/' + id + (material === 'soft' ? '-field-blur.jpg' : material === 'tint' ? '-field-clear.jpg' : '-field-frost.jpg'); }
  function makeImg(cls, src) { var im = document.createElement('img'); im.className = cls; im.alt = ''; im._src = src; im.src = src; return im; }
  function whenReady(im, done) {
    var fin = false, timer = setTimeout(function () { finish(!!(im.complete && im.naturalWidth)); }, document.hidden ? 20000 : 8000);
    function finish(ok) { if (fin) return; fin = true; clearTimeout(timer); done(ok); }
    function ready() {
      // Hidden TV prelaunch may suspend decode even after a valid image loads.
      if (document.hidden || !im.decode) { finish(true); return; }
      im.decode().then(function () { finish(true); }, function () { finish(!!(im.complete && im.naturalWidth)); });
    }
    if (im.complete) { if (im.naturalWidth) ready(); else finish(false); }
    else { im.onload = ready; im.onerror = function () { finish(false); }; }
  }
  function swapImg(k, im) { var old = IMG[k]; if (old === im) return; im.style.cssText = old.style.cssText; if (old.id) im.id = old.id; old.parentNode.replaceChild(im, old); IMG[k] = im; }
  function bundleKey(look) { return look.wall + '|' + look.material; }
  function loadBundle(look, token, done) {
    var panelSrc = WP + look.wall + '-panel.jpg';
    var imgs = { photo: makeImg('photo', WP + look.wall + '.jpg'), bg: makeImg('sheet-bg', panelSrc) }, keys, left, allOk = true;
    if (S.c.layout !== 'cards') {
      imgs.mat = makeImg('mat-img', panelSrc);
      imgs.field = makeImg('ph-field-img', panelSrc);
      imgs.fieldAlt = makeImg('ph-field-img', panelSrc);
      imgs.utility = makeImg('ph-field-img', panelSrc);
      imgs.utilityAlt = makeImg('ph-field-img', panelSrc);
    }
    keys = Object.keys(imgs); left = keys.length;
    keys.forEach(function (k) { whenReady(imgs[k], function (ok) {
      allOk = allOk && ok;
      if (--left || token !== wallToken) return;
      done(allOk ? { key: bundleKey(look), imgs: imgs } : null);
    }); });
  }
  function installBundle(bundle, look, previewOnly) {
    if (bundle) {
      Object.keys(bundle.imgs).forEach(function (k) { if (!previewOnly || k !== 'bg') swapImg(k, bundle.imgs[k]); });
      S.bundleKey = bundle.key;
    }
    S.shown = { bg: look.bg, wall: look.wall, material: look.material, font: look.font };
    phFields.concat(utFields).forEach(function (el) { var p = el._placement; if (p) fieldTransform(el, p.x, p.y, p.width, p.height); });
    S.wallShown = look.wall; S.wallPending = null; S.wallError = null;
  }
  function cleanPatch(patch) {
    var out = {}, k;
    if (!patch || typeof patch !== 'object') throw new Error('look needs an appearance patch');
    for (k in patch) if (patch.hasOwnProperty(k)) {
      if (k === 'wall') { if (!wall(patch[k])) throw new Error('Unknown wallpaper: ' + patch[k]); }
      else if (k === 'font') { if (!FONTS[patch[k]] || patch[k] !== 'inter' && patch[k] !== 'manrope' && PRIVATE_FONTS.indexOf(patch[k]) < 0) throw new Error('Unavailable font: ' + patch[k]); }
      else if (!LOOK_VALUES[k] || LOOK_VALUES[k].indexOf(patch[k]) < 0) throw new Error('Invalid appearance value: ' + k);
      out[k] = patch[k];
    }
    return out;
  }
  function cancelLook() { wallToken++; S.pending = null; S.wallPending = null; S.lookError = null; }
  function setLook(patch, options) {
    var opts = options || {}, changes = cleanPatch(patch), target = lookOf(S.c), k, token, needs, needsFont, changed, loadedBundle = null, imageDone, fontDone, failed = false;
    for (k in changes) if (changes.hasOwnProperty(k)) target[k] = changes[k];
    changed = Object.keys(target).some(function (key) { return target[key] !== S.c[key]; });
    cancelLook(); S.err = null; token = wallToken;
    function finish(bundle) {
      var c = next(S.c.home.slice(), S.c.recent.slice()), fontChanged = target.font !== S.c.font, reflow = target.apps !== S.c.apps || target.controls !== S.c.controls || fontChanged, frame, fontFrame;
      Object.keys(target).forEach(function (key) { c[key] = target[key]; });
      S.pending = null; S.wallPending = null;
      if (!opts.transient && changed && !write(c, 'Appearance')) { S.lookError = { type: 'save', patch: changes, row: opts.row || S.appearanceFocus, transient: false }; render(); syncRotation(); return; }
      if (opts.transient) S.c = c;
      if (reflow) { S.reflow = true; frame = ++reflowToken; }
      if (fontChanged) { S.fontSwitch = true; fontFrame = ++fontSwitchToken; }
      installBundle(bundle, target);
      if (bundle) committedBundle = bundle;
      S.lookError = null; S.previewBundle = null;
      render(); syncRotation();
      if (reflow) window.requestAnimationFrame(function () { window.requestAnimationFrame(function () {
        if (frame !== reflowToken) return;
        S.reflow = false; stage.className = stage.className.replace(/\s+is-reflow/g, '');
      }); });
      if (fontChanged) setTimeout(function () {
        if (fontFrame !== fontSwitchToken) return;
        S.fontSwitch = false; stage.className = stage.className.replace(/\s+is-font-switch/g, '');
      }, REDUCED_MOTION ? 130 : 170);
    }
    function fail(type, reason) {
      if (token !== wallToken || failed) return;
      failed = true; S.pending = null; S.wallPending = null;
      if (type === 'load') S.wallError = target.wall;
      S.lookError = { type: type, reason: reason || null, patch: changes, row: opts.row || (type === 'font' ? 'font' : S.appearanceFocus), transient: !!opts.transient, wall: target.wall, font: target.font };
      if (type === 'font') log((opts.startup ? 'font fallback: ' : 'Font kept: ') + (opts.startup ? target.font : FONTS[S.c.font].name) + (opts.startup ? '' : ' (' + reason + ')'));
      if (type === 'font' && opts.startup && target.font !== 'manrope') { setLook({ font: 'manrope' }, { transient: true }); return; }
      render(); syncRotation();
    }
    function complete() {
      if (!imageDone || !fontDone || failed || token !== wallToken) return;
      if (document.hidden) { finish(loadedBundle); return; }
      window.requestAnimationFrame(function () { if (!failed && token === wallToken) finish(loadedBundle); });
    }
    needs = target.bg === 'photo' && S.bundleKey !== bundleKey(target) && (!S.shown || S.shown.bg !== 'photo' || target.wall !== S.c.wall || materialApplies(target));
    needsFont = !fontMetrics[target.font]; imageDone = !needs; fontDone = !needsFont;
    if (!needs && !needsFont) { finish(null); return; }
    S.pending = { patch: changes, target: target, row: opts.row || (needsFont ? 'font' : S.appearanceFocus), transient: !!opts.transient, preview: false };
    if (needs) {
      S.wallPending = target.wall;
      loadBundle(target, token, function (bundle) {
        if (!bundle) { fail('load'); return; }
        loadedBundle = bundle; imageDone = true; complete();
      });
    }
    if (needsFont) ensureFont(target.font, function (ok, reason) {
      if (!ok) { fail('font', reason); return; }
      fontDone = true; complete();
    });
    render();
  }
  function showWall(id, done) {
    var target = lookOf(S.c), token;
    target.bg = 'photo'; target.wall = id;
    cancelLook(); token = wallToken; S.wallError = null;
    S.pending = { patch: { wall: id }, target: target, row: 'bg', preview: true, transient: false }; S.wallPending = id;
    loadBundle(target, token, function (bundle) {
      S.pending = null; S.wallPending = null;
      if (!bundle) { S.wallError = id; done(false); return; }
      S.previewBundle = bundle; installBundle(bundle, target, true); done(true);
    });
    render();
  }
  function restoreLook() {
    cancelLook(); S.previewBundle = null;
    if (S.c.bg === 'photo' && committedBundle && committedBundle.key === bundleKey(S.c)) installBundle(committedBundle, S.c);
    else if (S.c.bg !== 'photo' || S.bundleKey === bundleKey(S.c)) installBundle(null, S.c);
    else setLook({}, { transient: true });
  }

  /* ---------- Lifecycle and remote input ---------- */
  var clockTimer = 0, rotationTimer = 0, activeSince = 0, activeMs = 0, rotationKey = '';
  function rotationActive() { return !document.hidden && top().id === 'home' && S.c.bg === 'photo' && !S.pending && mode().min > 0; }
  function pauseRotation() {
    if (activeSince) { activeMs += Date.now() - activeSince; activeSince = 0; }
    clearTimeout(rotationTimer); rotationTimer = 0;
  }
  function resetRotation() { pauseRotation(); activeMs = 0; rotationKey = ''; }
  function syncRotation() {
    var key = S.c.wall + '|' + S.c.mode;
    pauseRotation();
    if (key !== rotationKey) { activeMs = 0; rotationKey = key; }
    if (!rotationActive()) return;
    activeSince = Date.now();
    rotationTimer = setTimeout(function () {
      pauseRotation(); activeMs = 0;
      if (rotationActive()) setLook({ wall: WALLS[(wallIndex(S.c.wall) + 1) % WALLS.length].id }, { row: 'bg' });
    }, Math.max(10, mode().min * QA.minuteMs - activeMs));
  }
  function updateClock() {
    clearTimeout(clockTimer);
    if (document.hidden) return;
    if (top().id === 'home' || isSettingsDetail(top())) {
      renderCaption(top(), homeState(top()));
      if (S.c.layout === 'cards') renderSnazzyCards(homeState(top()));
    }
    clockTimer = setTimeout(updateClock, 60000 - (Date.now() % 60000) + 30);
  }
  function focusStage() { try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); } }
  function after() {
    norm(); var t = top();
    if (t.group === 'inputs' && t.refreshInputs && !t.loading && !document.hidden) { t.refreshInputs = false; loadInputs(t); }
    render(); syncRotation();
  }
  function refreshInputsOnReturn() { var t = top(); if (t.group === 'inputs' && !t.loading) t.refreshInputs = true; }
  function goScene(name) {
    FrameDevice.cancelSource();
    if (top().id === 'wallpaper') cancelWallpaperTimer(top());
    S.stack = [S.stack[0]]; S.stack[0].f.zone = 'apps'; clearSession(); restoreLook();
    if (name === 'apps') openApps();
    else if (name === 'settings') openSettings();
    else if (name === 'appearance') { openSettings(); top().f.id = 'background'; S.settingsFocus = 'background'; openAppearance('background'); }
    else if (name === 'editor') { openSettings(); openEditor('settings'); }
    after();
  }
  function fit() {
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'scale(' + scale + ')';
    stage.style.left = ((window.innerWidth - 1920 * scale) / 2) + 'px';
    stage.style.top = ((window.innerHeight - 1080 * scale) / 2) + 'px';
  }
  function renderedAction(el) {
    return el.getClientRects().length > 0 && window.getComputedStyle(el).visibility !== 'hidden';
  }
  function focusedAction() {
    var root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl, els = root.querySelectorAll('.is-focus[data-action]'), i;
    for (i = 0; i < els.length; i++) if (renderedAction(els[i])) return els[i].getAttribute('data-action');
    return null;
  }
  function activate(action) {
    var root = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl, els = root.querySelectorAll('[data-action]'), i;
    if (action === 'appearance.bg' && top().id === 'appearance' && top().group === 'background') action = 'background.wallpaper';
    if (action === 'settings.appearance' && top().id === 'settings') action = 'settings.group.background';
    for (i = 0; i < els.length; i++) if (renderedAction(els[i]) && els[i].getAttribute('data-action') === action) { pointAt(els[i]); return true; }
    return false;
  }
  function pointAt(el) {
    var t = top(), v = V[t.id];
    norm();
    if (v.point) v.point(t, el.getAttribute('data-z'), +el.getAttribute('data-i'), el.getAttribute('data-id'));
    norm();
    render();
    syncRotation();
  }

  utilsEl.addEventListener('mouseover', function (ev) {
    var b = ev.target, t = top(), z, i;
    if (ambientActive || utilsEl.className.indexOf('quiet-utils') < 0 || t.lifted) return;
    while (b && b !== utilsEl && !(b.getAttribute && b.getAttribute('data-z'))) b = b.parentNode;
    if (!b || b === utilsEl || (ev.relatedTarget && b.contains(ev.relatedTarget))) return;
    z = b.getAttribute('data-z'); i = Number(b.getAttribute('data-i'));
    if ((t.id !== 'home' || z !== 'util') && (t.id !== 'arrange' || z !== 'ctl')) return;
    if (t.f.zone === z && t.f.u === i) return;
    t.f.zone = z; t.f.u = i;
    if (z === 'util') S.lastUtil = i;
    render();
  });
  stage.addEventListener('click', function (ev) {
    if (touchActivity()) return;
    var el = ev.target;
    while (el && el !== stage && !(el.getAttribute && el.getAttribute('data-z'))) el = el.parentNode;
    focusStage();
    if (!el || el === stage) return;
    pointAt(el);
  });
  var heldKeys = {};
  document.addEventListener('keydown', function (ev) {
    var code = ev.keyCode, k = KEYS[code];
    if (code === 9) { ev.preventDefault(); return; }
    if (!k || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    ev.preventDefault();
    if (k === 'red') {
      if (ev.repeat) return;
      if (oledBlack) { touchActivity(); return; }
      playUiSound('back');
      enterOledSleep();
      return;
    }
    if (k === 'green') {
      if (ev.repeat) return;
      lastActivity = Date.now();
      nightOverride = !isNightDim();
      playUiSound('select');
      render();
      showSnazzyToast(nightOverride ? 'Night dim on' : 'Night dim off');
      return;
    }
    if (k === 'yellow') {
      if (ev.repeat) return;
      if (ambientActive || oledBlack) { touchActivity(); playUiSound('back'); }
      else { playUiSound('move'); enterAmbient(); }
      return;
    }
    if (k === 'blue') {
      if (ev.repeat) return;
      lastActivity = Date.now();
      if (oledBlack) { touchActivity(); return; }
      playUiSound('move');
      nextAerialVideo();
      return;
    }
    if (ambientActive && !oledBlack && (k === 'left' || k === 'right')) {
      lastActivity = Date.now();
      playUiSound('move');
      if (k === 'right') nextAerialVideo();
      else prevAerialVideo();
      return;
    }
    if (touchActivity()) return;
    if (k === 'ok' || k === 'back') { if (ev.repeat || heldKeys[code]) return; heldKeys[code] = true; }
    press(k);
  });
  document.addEventListener('keyup', function (ev) { delete heldKeys[ev.keyCode]; });
  window.addEventListener('blur', function () { heldKeys = {}; });
  window.addEventListener('focus', function () { touchActivity(); cancelSwitching(); release(); refreshInputsOnReturn(); pollCardInputs(); if (FrameDevice.inhibitScreenSaver) FrameDevice.inhibitScreenSaver(); focusStage(); after(); updateClock(); });
  document.addEventListener('webOSRelaunch', function (ev) {
    if (window.PalmSystem && typeof window.PalmSystem.activate === 'function') window.PalmSystem.activate();
    if (window.webOSSystem && typeof window.webOSSystem.activate === 'function') window.webOSSystem.activate();
    var params = (ev && ev.detail) || null;
    if (!params && window.PalmSystem && window.PalmSystem.launchParams) {
      try { params = JSON.parse(window.PalmSystem.launchParams); } catch (e) { /* ignore */ }
    }
    touchActivity(); cancelSwitching(); release(); refreshInputsOnReturn(); pollCardInputs(); if (FrameDevice.inhibitScreenSaver) FrameDevice.inhibitScreenSaver();
    if (params && params.confirmHome && top().id === 'home') openMessage('leave');
    focusStage(); after(); updateClock();
  });
  document.addEventListener('visibilitychange', function () {
    heldKeys = {};
    if (document.hidden) { cancelSwitching(); pauseRotation(); clearTimeout(clockTimer); clearTimeout(hdmiPollTimer); syncAerialVideo(); if (FrameDevice.allowScreenSaver) FrameDevice.allowScreenSaver(); }
    else {
      touchActivity();
      cancelSwitching();
      release();
      if (S.c.bg === 'photo' && !S.pending && !S.previewBundle && (!committedBundle || S.bundleKey !== bundleKey(S.c))) setLook({}, { transient: true, startup: true });
      refreshInputsOnReturn(); pollCardInputs(); fetchWeather(); if (FrameDevice.inhibitScreenSaver) FrameDevice.inhibitScreenSaver(); after(); updateClock(); focusStage();
    }
  });
  window.addEventListener('resize', fit);

  /* Readable browser checks use the real state and actions, without fake outcomes. */
  var NAV = { left: 'left', right: 'right', up: 'up', down: 'down', ok: 'ok', enter: 'ok', back: 'back', escape: 'back' };
  QA.state = function () {
    var out = serialise(S.c), t = top(), item = t.id === 'appearance' ? detailLocation(t).item : null;
    out.committed = S.c; out.shown = S.shown; out.pending = S.pending; out.view = t.id; out.selected = S.sel;
    out.focusAction = focusedAction(); out.writes = S.writes; out.failedWrites = S.failed; out.error = S.err;
    out.catalog = { loading: catalog.loading, loaded: catalog.loaded, error: catalog.error, ids: ALPHA.slice() };
    out.fonts = { available: LOOK_VALUES.font.slice(), loaded: Object.keys(fontMetrics).filter(function (id) { return !fontMetrics[id].fallback; }), baselineFallback: !!(fontMetrics.manrope && fontMetrics.manrope.fallback), error: S.lookError && S.lookError.type === 'font' ? S.lookError : null };
    out.rotation = { activeMs: activeMs + (activeSince ? Date.now() - activeSince : 0), active: !!activeSince };
    out.draft = t.lifted ? { id: t.lifted.id, order: t.lifted.order.slice() } : null;
    out.settingsGroup = t.id === 'wallpaper' ? 'wallpaper' : t.id === 'appearance' ? t.group : null;
    out.focusedChoice = item && item.axis ? { axis: item.axis, value: item.value, action: item.action, disabled: item.disabled } : null;
    out.candidate = out.focusedChoice ? { axis: item.axis, value: item.value, action: item.action, pending: !!S.pending, pendingTarget: S.pending ? S.pending.target : null } : null;
    out.wallpaperPicker = t.id === 'wallpaper' ? { candidate: WALLS[t.i].id, applied: S.c.wall, shown: S.wallShown, pending: t.previewDue || S.wallPending,
      queuedApplying: !!t.applyPending, applyPending: t.applyPending, failed: t.failedId, zone: t.f.zone, top: t.top, visible: WALL_VISIBLE, backdrop: IMG.bg.src } : null;
    out.undo = S.undo.map(function (u) { return u.label; }); out.storageOk = storageOk;
    return JSON.parse(JSON.stringify(out));
  };
  QA.where = function () {
    var action = focusedAction(), active = stage.querySelectorAll('.is-focus[data-action]'), count = 0, name = '';
    Array.prototype.forEach.call(active, function (el) { if (renderedAction(el)) { count++; if (el.getAttribute('data-action') === action) name = el.getAttribute('aria-label') || el.textContent.replace(/\s+/g, ' ').trim(); } });
    return { view: top().id, settingsGroup: top().id === 'wallpaper' ? 'wallpaper' : top().id === 'appearance' ? top().group : null, focus: name, focusAction: action, focusCount: count, wallpaper: S.wallShown, zone: top().f.zone || null };
  };
  QA.ready = function () { return fontsReady && !S.pending && !!S.shown && S.shown.bg === S.c.bg && S.shown.wall === S.c.wall && S.shown.font === S.c.font; };
  QA.nav = function () { var keys = arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments); keys.forEach(function (key) { if (!NAV[key]) throw new Error('Unknown key'); press(NAV[key]); }); return QA.state(); };
  QA.look = function (patch) { setLook(patch, {}); return QA.state(); };
  QA.scene = function (name) { if (['home', 'apps', 'settings', 'appearance', 'editor'].indexOf(name) < 0) throw new Error('Unknown view'); goScene(name); return QA.state(); };
  QA.activate = function (action) { return activate(action) ? QA.state() : null; };
  QA.actions = function () { var view = isSettingsDetail(top()) ? appearanceEl : sheetEl.hidden ? homeEl : sheetEl; return Array.prototype.filter.call(view.querySelectorAll('[data-action]'), renderedAction).map(function (el) { return el.getAttribute('data-action'); }); };

  /* ---------- Start ---------- */
  cueL.innerHTML = icon('left'); cueR.innerHTML = icon('right');
  initialise();
  setLook({}, { transient: true, startup: true });
  norm(); render(); fit(); focusStage(); updateClock(); syncRotation(); pollCardInputs(); fetchWeather(); startAmbientLoop(); if (FrameDevice.inhibitScreenSaver) FrameDevice.inhibitScreenSaver();
})();
