const fs = require("fs");
const { execFile } = require("child_process");

const LAUNCHER = "com.mtnview.launcher";
const LOG_PATH = "/tmp/mtnview-home.log";
const LOG_MAX_BYTES = 65536;

// Remote hotkeys: resolve target HDMI port dynamically from live EIM metadata (with sensible defaults)
const HOTKEYS = {
  1037: { role: "appletv", fallback: "com.webos.app.hdmi1", cancel: "netflix" },
  1038: { role: "ps5", fallback: "com.webos.app.hdmi3", cancel: "amazon" },
  1042: { role: "switch", fallback: "com.webos.app.hdmi4", cancel: "com.disney.disneyplus-prod" }
};
const SCREEN_OFF_KEY = 1043; // LG Channels button -> OLED Screen Off (works globally, great for Sonos audio)
const BLOCK_KEYS = { 1133: true, 1137: true };
const sz = process.arch === "arm64" ? 24 : 16;
let lastPress = 0;
const rolePorts = { appletv: "com.webos.app.hdmi1", ps5: "com.webos.app.hdmi3", switch: "com.webos.app.hdmi4" };

function log(msg) {
  try {
    try {
      const st = fs.statSync(LOG_PATH);
      if (st.size > LOG_MAX_BYTES) {
        const tail = fs.readFileSync(LOG_PATH, "utf8").slice(-16384);
        fs.writeFileSync(LOG_PATH, tail);
      }
    } catch (e) {}
    fs.appendFileSync(LOG_PATH, new Date().toISOString() + " " + msg + "\n");
  } catch (e) {}
}

process.on("uncaughtException", (err) => log("ERR: " + (err && err.stack || err)));
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

function watchDevice(dev) {
  const s = fs.createReadStream("/dev/input/" + dev);
  let reopened = false;
  function reopen() {
    if (reopened) return;
    reopened = true;
    setTimeout(() => watchDevice(dev), 2000);
  }
  s.on("error", reopen);
  s.on("close", reopen);
  s.on("data", (b) => {
    for (let i = 0; i + sz <= b.length; i += sz) {
      const type = b.readUInt16LE(i + sz - 8);
      const code = b.readUInt16LE(i + sz - 6);
      const val = b.readInt32LE(i + sz - 4);
      if (type !== 1 || val !== 1) continue;

      if (HOTKEYS[code]) {
        const now = Date.now();
        if (now - lastPress < 500) continue;
        lastPress = now;
        const hk = HOTKEYS[code];
        const target = rolePorts[hk.role] || hk.fallback;
        launchTarget(target);
        for (const ms of [450, 1200, 2200]) {
          setTimeout(() => {
            luna("luna://com.webos.applicationManager/closeByAppId", { id: hk.cancel }, () => {
              getForegroundApp((cur) => { if (cur !== target) launchTarget(target); });
            });
          }, ms);
        }
      } else if (code === SCREEN_OFF_KEY) {
        const now = Date.now();
        if (now - lastPress < 800) continue;
        lastPress = now;
        log("screen-off shortcut pressed");
        luna("luna://com.webos.service.tvpower/power/turnOffScreen", { standbyMode: "active" });
        getForegroundApp((stayOn) => {
          for (const ms of [400, 1200]) {
            setTimeout(() => {
              getForegroundApp((cur) => {
                if (cur && stayOn && cur !== stayOn && /livetv|channel/i.test(cur)) {
                  luna("luna://com.webos.applicationManager/closeByAppId", { id: cur }, () => {
                    launchTarget(stayOn);
                  });
                }
              });
            }, ms);
          }
        });
      } else if (BLOCK_KEYS[code]) {
        const now = Date.now();
        if (now - lastPress < 500) continue;
        lastPress = now;
        getForegroundApp((stayOn) => {
          for (const ms of [350, 1000, 2000]) {
            setTimeout(() => {
              getForegroundApp((cur) => {
                if (cur && stayOn && cur !== stayOn) {
                  luna("luna://com.webos.applicationManager/closeByAppId", { id: cur }, () => {
                    launchTarget(stayOn);
                  });
                }
              });
            }, ms);
          }
        });
      }
    }
  });
}

// Auto-return to mtnview when any non-Apple-TV HDMI device powers off (6s grace period)
let watchedPort = null, wasLive = false, lostCount = 0;
setInterval(() => {
  getForegroundApp((app) => {
    const m = /^com\.webos\.app\.hdmi([1-4])$/.exec(app);
    if (!m) { watchedPort = null; wasLive = false; lostCount = 0; return; }
    const port = m[1];
    if (watchedPort !== port) { watchedPort = port; wasLive = false; lostCount = 0; }
    luna("luna://com.webos.service.eim/getAllInputStatus", {}, (err, out) => {
      if (err || !out) return;
      try {
        const data = JSON.parse(out);
        updateRolePorts(data.devices);
        const dev = (data.devices || []).find((d) => d.id === "HDMI_" + port);
        if (!dev) return;
        const info = deviceDesc(dev);
        // Never auto-leave Apple TV (Apple TV CEC manages TV power directly)
        if (/apple\s*tv/i.test(info.text)) return;
        const live = !!(dev.hdmiSignalExist || dev.activate || (info.simplink && info.simplink.cecPower === "On"));
        if (live) {
          wasLive = true;
          lostCount = 0;
        } else if (wasLive) {
          lostCount++;
          if (lostCount >= 2) {
            log("HDMI_" + port + " (" + (dev.label || "device") + ") signal lost -> returning to mtnview");
            wasLive = false;
            lostCount = 0;
            launchTarget(LAUNCHER);
          }
        }
      } catch (e) {}
    });
  });
}, 3000);

log("daemon started (pid=" + process.pid + ")");
refreshRolePorts();
setInterval(refreshRolePorts, 60000);
for (const dev of ["event3", "event0"]) watchDevice(dev);
