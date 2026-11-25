/* LG webOS TV Luna Service bridge (PalmServiceBridge / webOS.service). */
(function () {
  'use strict';
  var IDS = {
    stremio: 'com.stremio.app',
    netflix: 'netflix',
    disneyplus: 'com.disney.disneyplus-prod',
    youtube: 'youtube.leanback.v4',
    appletv: 'com.apple.appletv',
    primevideo: 'amazon',
    abciview: 'au.net.abc.iview',
    sbs: 'au.com.sbs.ondemand',
    applemusic: 'com.apple.applemusic'
  };
  var STREAMING = [
    'netflix', 'youtube.leanback.v4', 'com.apple.appletv', 'com.disney.disneyplus-prod',
    'amazon', 'spotify-beehive', 'com.stremio.app', 'com.apple.applemusic',
    'hulu', 'com.hbo.hbomax', 'com.wbd.stream', 'com.peacocktv.peacock',
    'com.cbs.app', 'com.espn.score_center', 'tv.twitch.tv.starshot.lg',
    'com.tubitv.webos', 'plex', 'com.plexapp.webos', 'com.jellyfin.webos',
    'org.webosbrew.hbchannel', 'youtube.leanback.kids.v4'
  ];
  var EXTRA_BRANDS = {
    'spotify-beehive': 'spotify',
    'com.hbo.hbomax': 'hbomax',
    'com.wbd.stream': 'hbomax',
    'com.tubitv.webos': 'tubi'
  };
  var INTERNAL = [
    'com.webos.app.home', 'com.webos.app.livetv', 'com.webos.app.hdmi1',
    'com.webos.app.hdmi2', 'com.webos.app.hdmi3', 'com.webos.app.hdmi4',
    'com.palm.app.settings', 'com.webos.app.setting', 'com.webos.app.connectionwizard',
    'com.webos.app.notificationcenter', 'com.webos.app.voice', 'com.webos.app.screensaver',
    'com.webos.app.factorywin', 'com.webos.app.softwareupdate', 'com.webos.app.self-diagnosis',
    'com.webos.app.quicksettings', 'com.webos.app.inputcommon'
  ];
  var SELF = 'com.cleanframe.launcher';

  function hasLuna() {
    return !!(
      (window.webOS && window.webOS.service && typeof window.webOS.service.request === 'function') ||
      typeof window.PalmServiceBridge === 'function'
    );
  }
  function selfId() {
    try {
      if (window.webOSSystem && window.webOSSystem.identifier) return window.webOSSystem.identifier;
    } catch (err) { /* ignore */ }
    return SELF;
  }
  function unavailable(done) {
    done({
      message: 'Open mtnview on your LG TV to use this control.',
      detail: 'The web preview cannot control the TV.'
    });
  }
  function failure(err, fallbackMsg) {
    var detail = '';
    if (err) detail = err.errorText || err.message || err.name || (err.errorCode ? 'Error ' + err.errorCode : '');
    return {
      message: fallbackMsg || 'The TV could not open this screen.',
      detail: detail || 'Try again, or press the Home button on your LG remote.'
    };
  }
  function luna(service, method, params, done, timeout) {
    var finished = false, bridge = null, req = null;
    var timer = setTimeout(function () {
      finish({ message: 'The TV did not respond. Please try again.' });
    }, timeout || 8000);

    function finish(err, res) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (bridge && typeof bridge.cancel === 'function') {
        try { bridge.cancel(); } catch (e) { /* ignore */ }
      }
      if (req && typeof req.cancel === 'function') {
        try { req.cancel(); } catch (e) { /* ignore */ }
      }
      done(err, res);
    }

    if (window.webOS && window.webOS.service && typeof window.webOS.service.request === 'function') {
      try {
        req = window.webOS.service.request(service, {
          method: method,
          parameters: params || {},
          onSuccess: function (res) { finish(null, res); },
          onFailure: function (err) { finish(failure(err)); }
        });
      } catch (err) {
        finish(failure(err));
      }
      return function () { finish({ message: 'Request cancelled.', cancelled: true }); };
    }

    if (typeof window.PalmServiceBridge === 'function') {
      try {
        bridge = new window.PalmServiceBridge();
        bridge.onservicecallback = function (msg) {
          var res;
          try { res = JSON.parse(msg); } catch (e) { finish(failure(e)); return; }
          if (res && res.returnValue === false) finish(failure(res));
          else finish(null, res || {});
        };
        var uri = service.replace(/\/$/, '') + '/' + method;
        bridge.call(uri, JSON.stringify(params || {}));
      } catch (err) {
        finish(failure(err));
      }
      return function () { finish({ message: 'Request cancelled.', cancelled: true }); };
    }

    clearTimeout(timer);
    unavailable(done);
    return function () {};
  }

  var sourceCancel = null;
  function cancelSource() { if (sourceCancel) sourceCancel(); }

  function defaultHdmiList() {
    var names = { 1: 'HDMI 1 · Apple TV', 2: 'HDMI 2 · Sonos Sound Bar', 3: 'HDMI 3 · PS5', 4: 'HDMI 4 · Nintendo Switch' };
    return [1, 2, 3, 4].map(function (n) {
      return { number: n, name: names[n] || ('HDMI ' + n), connected: false, active: false, appId: 'com.webos.app.hdmi' + n };
    });
  }

  function sources(done) {
    if (!hasLuna()) { unavailable(done); return; }
    luna('luna://com.webos.service.eim', 'getAllInputStatus', {}, function (err, res) {
      if (err || !res || !Array.isArray(res.devices)) {
        /* Fallback to standard LG OLED 4-port HDMI list if EIM query is restricted in Dev Mode. */
        done(null, defaultHdmiList());
        return;
      }
      var list = [], seen = {};
      res.devices.forEach(function (dev) {
        var match = dev && typeof dev.id === 'string' && /^HDMI[_ ]?(\d+)$/i.exec(dev.id);
        var num = match ? parseInt(match[1], 10) : 0;
        if (!num || seen[num]) return;
        seen[num] = true;
        list.push({
          number: num,
          name: dev.label || ('HDMI ' + num),
          connected: !!dev.connected,
          active: !!dev.active,
          appId: dev.appId || ('com.webos.app.hdmi' + num),
          inputId: dev.id
        });
      });
      if (!list.length) { done(null, defaultHdmiList()); return; }
      list.sort(function (a, b) { return a.number - b.number; });
      done(null, list);
    }, 6000);
  }

  function setSource(port, done) {
    cancelSource();
    if (typeof port !== 'number' || !isFinite(port) || port < 1 || Math.floor(port) !== port) {
      done({ message: 'This HDMI input is not available.' });
      return;
    }
    if (!hasLuna()) { unavailable(done); return; }

    var finished = false, cancelInner = null;
    function finish(err, value) {
      if (finished) return;
      finished = true;
      if (sourceCancel === cancel) sourceCancel = null;
      done(err, value);
    }
    function cancel() {
      if (cancelInner) cancelInner();
      finish({ message: 'Input change cancelled.', cancelled: true });
    }
    sourceCancel = cancel;

    var hdmiAppId = 'com.webos.app.hdmi' + port;
    cancelInner = luna('luna://com.webos.applicationManager', 'launch', { id: hdmiAppId }, function (err) {
      if (finished) return;
      if (!err) { finish(null, { number: port, name: 'HDMI ' + port, appId: hdmiAppId }); return; }
      /* Fallback to EIM switchInput if launching com.webos.app.hdmiN is rejected. */
      cancelInner = luna('luna://com.webos.service.eim', 'switchInput', { inputId: 'HDMI_' + port }, function (eimErr) {
        if (finished) return;
        if (!eimErr) finish(null, { number: port, name: 'HDMI ' + port, appId: hdmiAppId });
        else finish(failure(err, 'Could not switch to HDMI ' + port + '.'));
      });
    });
  }

  function launchApp(id, done) {
    if (!hasLuna()) { unavailable(done); return; }
    luna('luna://com.webos.applicationManager', 'launch', { id: id }, function (err) {
      done(err ? failure(err) : null);
    });
  }

  function launch(brand, done) {
    if (!IDS[brand]) { done({ message: 'This app has no launch target.' }); return; }
    launchApp(IDS[brand], done);
  }

  function home(done) {
    launchApp('com.webos.app.home', done);
  }

  function settings(done) {
    if (!hasLuna()) { unavailable(done); return; }
    luna('luna://com.webos.applicationManager', 'launch', { id: 'com.palm.app.settings' }, function (err) {
      if (!err) { done(null); return; }
      luna('luna://com.webos.applicationManager', 'launch', { id: 'com.webos.app.setting' }, function (err2) {
        done(err2 ? failure(err2, 'Could not open LG TV settings.') : null);
      });
    });
  }

  function apps(done) {
    if (!hasLuna()) { unavailable(done); return; }
    luna('luna://com.webos.applicationManager', 'listLaunchPoints', {}, function (err, res) {
      if (err) { done(err); return; }
      var list = (res && Array.isArray(res.launchPoints)) ? res.launchPoints : [];
      var known = {}, seen = {}, result = [], self = selfId();
      Object.keys(IDS).forEach(function (brand) { known[IDS[brand]] = brand; });
      list.forEach(function (a) {
        if (!a || !a.id) return;
        var id = a.id, name = a.title || a.name || '';
        var primary = !!known[id], stream = STREAMING.indexOf(id) >= 0;
        if (id === self || INTERNAL.indexOf(id) >= 0 || seen[id] || !name) return;
        if (!primary && !stream && a.visible === false) return;
        if (!primary && /^com\.webos\.app\.hdmi\d+$/i.test(id)) return;
        if (!primary && /(?:service|worker|preview|plugin|test|sdk|factory|daemon|overlay)/i.test(name + ' ' + id)) return;
        seen[id] = true;
        result.push({
          appId: id,
          name: name,
          brand: known[id] || EXTRA_BRANDS[id] || '',
          icon: a.largeIcon || a.icon || '',
          rank: primary ? Object.keys(IDS).indexOf(known[id]) : (stream ? 20 : 30)
        });
      });
      result.sort(function (a, b) { return a.rank - b.rank || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
      done(null, result);
    }, 20000);
  }

  var screenSaverBridge = null;
  function inhibitScreenSaver() {
    var Bridge = window.WebOSServiceBridge || window.PalmServiceBridge;
    if (typeof Bridge !== 'function' || screenSaverBridge) return;
    try {
      var id = selfId();
      screenSaverBridge = new Bridge();
      screenSaverBridge.onservicecallback = function (msg) {
        var data;
        try { data = JSON.parse(msg); } catch (e) { return; }
        if (data && data.state === 'Active' && data.timestamp) {
          try {
            var reply = new Bridge();
            reply.call('luna://com.webos.service.tvpower/power/responseScreenSaverRequest', JSON.stringify({
              clientName: id,
              ack: false,
              timestamp: data.timestamp
            }));
          } catch (e) { /* ignore */ }
        }
      };
      screenSaverBridge.call('luna://com.webos.service.tvpower/power/registerScreenSaverRequest', JSON.stringify({
        subscribe: true,
        clientName: id
      }));
    } catch (e) { screenSaverBridge = null; }
  }
  function allowScreenSaver() {
    if (!screenSaverBridge) return;
    try { if (typeof screenSaverBridge.cancel === 'function') screenSaverBridge.cancel(); } catch (e) { /* ignore */ }
    screenSaverBridge = null;
  }

  window.FrameDevice = {
    platform: 'webos',
    launch: launch,
    launchApp: launchApp,
    home: home,
    settings: settings,
    apps: apps,
    sources: sources,
    setSource: setSource,
    cancelSource: cancelSource,
    inhibitScreenSaver: inhibitScreenSaver,
    allowScreenSaver: allowScreenSaver
  };
}());
