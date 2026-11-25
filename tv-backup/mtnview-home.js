/* Rooted LG webOS daemon: dynamic remote hotkeys, global OLED screen-off, and non-Apple-TV HDMI auto-return. */
const fs = require("fs");
const { execFile } = require("child_process");

const CONFIG = {
  launcherId: "com.mtnview.launcher",
  logPath: "/tmp/mtnview-home.log",
  logMaxBytes: 65536,
  logKeepBytes: 16384,
  inputDevices: ["event3", "event0"],
  reopenDelayMs: 2000,
  hotkeyDebounceMs: 500,
  screenOffDebounceMs: 800,
  idlePollMs: 5000,
  activeHdmiPollMs: 3000,
  signalLostTicks: 2, // 2 x 3s = 6s grace period before returning to mtnview
  roleRefreshMs: 60000,
  // Linux evdev keycodes -> target role (auto-resolved from EIM) and stock app to cancel
  hotkeys: {
    1037: { role: "appletv", fallback: "com.webos.app.hdmi1", cancel: "netflix" },
    1038: { role: "ps5", fallback: "com.webos.app.hdmi3", cancel: "amazon" },
    1042: { role: "switch", fallback: "com.webos.app.hdmi4", cancel: "com.disney.disneyplus-prod" }
  },
  screenOffKey: 1043, // LG Channels button -> OLED Screen Off (works globally for eARC/soundbar audio)
  blockKeys: { 1133: true, 1137: true } // News, YouTube
};

const EV_SIZE = process.arch === "arm64" ? 24 : 16;
const rolePorts = { appletv: "com.webos.app.hdmi1", ps5: "com.webos.app.hdmi3", switch: "com.webos.app.hdmi4" };
let lastPress = 0;

function log(msg) {
  try {
    try {
      if (fs.statSync(CONFIG.logPath).size > CONFIG.logMaxBytes) {
        fs.writeFileSync(CONFIG.logPath, fs.readFileSync(CONFIG.logPath, "utf8").slice(-CONFIG.logKeepBytes));
      }
    } catch (e) {}
    fs.appendFileSync(CONFIG.logPath, new Date().toISOString() + " " + msg + "\n");
  } catch (e) {}
}

process.on("uncaughtException", (err) => log("ERR: " + ((err && err.stack) || err)));
setInterval(() => {}, 30000);

function luna(uri, params, cb) {
  execFile("/usr/bin/luna-send", ["-n", "1", uri, JSON.stringify(params || {})], (err, out) => {
    if (cb) cb(err, (out || "").toString().trim());
  });
}

function launchTarget(id) {
  luna("luna://com.webos.applicationManager/launch", { id, params: { t: Date.now() } });
}

function getForegroundApp(cb) {
  luna("luna://com.webos.applicationManager/getForegroundAppInfo", {}, (err, out) => {
    const m = !err && out && /"appId"\s*:\s*"([^"]+)"/.exec(out);
    cb(m ? m[1] : "");
  });
}

function deviceDesc(dev) {
  const subs = Array.isArray(dev.subList) ? dev.subList : [];
  const simplink = subs.find((s) => s && s.id === "SIMPLINK");
  const urcu = subs.find((s) => s && s.id === "URCU");
  return {
    simplink,
    urcu,
    text: [dev.label, simplink && simplink.osdName, urcu && urcu.brandName].filter(Boolean).join(" ")
  };
}

function updateRolePorts(devices) {
  if (!Array.isArray(devices)) return;
  for (const dev of devices) {
    const m = dev && typeof dev.id === "string" && /^HDMI[_ ]?(\d+)$/i.exec(dev.id);
    if (!m) continue;
    const appId = dev.appId || ("com.webos.app.hdmi" + m[1]);
    const info = deviceDesc(dev);
    if (/apple\s*tv/i.test(info.text)) rolePorts.appletv = appId;
    else if (/ps[345]|playstation/i.test(info.text)) rolePorts.ps5 = appId;
    else if (/switch|nintendo/i.test(info.text)) rolePorts.switch = appId;
  }
}

function refreshRolePorts() {
  luna("luna://com.webos.service.eim/getAllInputStatus", {}, (err, out) => {
    if (err || !out) return;
    try { updateRolePorts(JSON.parse(out).devices); } catch (e) {}
  });
}

/* Cancel any unwanted app launched by a blocked/remapped remote button and stay on the current app. */
function enforceStayOn(delays, matchRe) {
  getForegroundApp((stayOn) => {
    for (const ms of delays) {
      setTimeout(() => {
        getForegroundApp((cur) => {
          if (cur && stayOn && cur !== stayOn && (!matchRe || matchRe.test(cur))) {
            luna("luna://com.webos.applicationManager/closeByAppId", { id: cur }, () => launchTarget(stayOn));
          }
        });
      }, ms);
    }
  });
}

function watchDevice(dev) {
  const stream = fs.createReadStream("/dev/input/" + dev);
  let reopened = false;
  function reopen() {
    if (reopened) return;
    reopened = true;
    setTimeout(() => watchDevice(dev), CONFIG.reopenDelayMs);
  }
  stream.on("error", reopen);
  stream.on("close", reopen);
  stream.on("data", (buf) => {
    for (let i = 0; i + EV_SIZE <= buf.length; i += EV_SIZE) {
      const type = buf.readUInt16LE(i + EV_SIZE - 8);
      const code = buf.readUInt16LE(i + EV_SIZE - 6);
      const val = buf.readInt32LE(i + EV_SIZE - 4);
      if (type !== 1 || val !== 1) continue;

      const now = Date.now();
      if (CONFIG.hotkeys[code]) {
        if (now - lastPress < CONFIG.hotkeyDebounceMs) continue;
        lastPress = now;
        const hk = CONFIG.hotkeys[code];
        const target = rolePorts[hk.role] || hk.fallback;
        launchTarget(target);
        for (const ms of [450, 1200, 2200]) {
          setTimeout(() => {
            luna("luna://com.webos.applicationManager/closeByAppId", { id: hk.cancel }, () => {
              getForegroundApp((cur) => { if (cur !== target) launchTarget(target); });
            });
          }, ms);
        }
      } else if (code === CONFIG.screenOffKey) {
        if (now - lastPress < CONFIG.screenOffDebounceMs) continue;
        lastPress = now;
        log("screen-off shortcut pressed");
        luna("luna://com.webos.service.tvpower/power/turnOffScreen", { standbyMode: "active" });
        enforceStayOn([400, 1200], /livetv|channel/i);
      } else if (CONFIG.blockKeys[code]) {
        if (now - lastPress < CONFIG.hotkeyDebounceMs) continue;
        lastPress = now;
        enforceStayOn([350, 1000, 2000], null);
      }
    }
  });
}

/* Auto-return to mtnview when any non-Apple-TV HDMI console powers off. */
let watchedPort = null, wasLive = false, lostCount = 0;
function checkHdmiSignal() {
  getForegroundApp((app) => {
    const m = /^com\.webos\.app\.hdmi([1-4])$/.exec(app);
    if (!m || app === rolePorts.appletv) {
      watchedPort = null; wasLive = false; lostCount = 0;
      setTimeout(checkHdmiSignal, CONFIG.idlePollMs);
      return;
    }
    const port = m[1];
    if (watchedPort !== port) { watchedPort = port; wasLive = false; lostCount = 0; }
    luna("luna://com.webos.service.eim/getAllInputStatus", {}, (err, out) => {
      if (!err && out) {
        try {
          const data = JSON.parse(out);
          updateRolePorts(data.devices);
          const dev = (data.devices || []).find((d) => d.id === "HDMI_" + port);
          if (dev) {
            const info = deviceDesc(dev);
            if (!/apple\s*tv/i.test(info.text)) {
              const live = !!(dev.hdmiSignalExist || dev.activate || (info.simplink && info.simplink.cecPower === "On"));
              if (live) {
                wasLive = true;
                lostCount = 0;
              } else if (wasLive && ++lostCount >= CONFIG.signalLostTicks) {
                log("HDMI_" + port + " (" + (dev.label || "device") + ") signal lost -> returning to mtnview");
                wasLive = false;
                lostCount = 0;
                launchTarget(CONFIG.launcherId);
              }
            }
          }
        } catch (e) {}
      }
      setTimeout(checkHdmiSignal, CONFIG.activeHdmiPollMs);
    });
  });
}

log("daemon started (pid=" + process.pid + ")");
refreshRolePorts();
setInterval(refreshRolePorts, CONFIG.roleRefreshMs);
setTimeout(checkHdmiSignal, CONFIG.idlePollMs);
for (const dev of CONFIG.inputDevices) watchDevice(dev);
