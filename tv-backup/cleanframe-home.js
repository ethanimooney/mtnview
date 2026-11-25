const fs = require("fs");
const { execFile } = require("child_process");

const LAUNCHER = "com.cleanframe.launcher";
const HOTKEYS = {
  1037: { target: "com.webos.app.hdmi1", cancel: "netflix" },
  1038: { target: "com.webos.app.hdmi3", cancel: "amazon" },
  1042: { target: "com.webos.app.hdmi4", cancel: "com.disney.disneyplus-prod" }
};
const BLOCK_KEYS = { 1043: true, 1133: true, 1137: true };
const sz = process.arch === "arm64" ? 24 : 16;
let lastPress = 0;

function log(msg) {
  try { fs.appendFileSync("/tmp/cleanframe-home.log", new Date().toISOString() + " " + msg + "\n"); } catch (e) {}
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
        launchTarget(hk.target);
        for (const ms of [450, 1200, 2200]) {
          setTimeout(() => {
            luna("luna://com.webos.applicationManager/closeByAppId", { id: hk.cancel }, () => {
              getForegroundApp((cur) => { if (cur !== hk.target) launchTarget(hk.target); });
            });
          }, ms);
        }
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

// Auto-return to CleanFrame when active HDMI 1/3/4 device powers off (6s grace period)
let watchedPort = null, wasConnected = false, lostCount = 0;
setInterval(() => {
  getForegroundApp((app) => {
    const m = /^com\.webos\.app\.hdmi([134])$/.exec(app);
    if (!m) { watchedPort = null; wasConnected = false; lostCount = 0; return; }
    const port = m[1];
    if (watchedPort !== port) { watchedPort = port; wasConnected = false; lostCount = 0; }
    luna("luna://com.webos.service.eim/getAllInputStatus", {}, (err, out) => {
      if (err || !out) return;
      try {
        const data = JSON.parse(out);
        const dev = (data.devices || []).find((d) => d.id === "HDMI_" + port);
        if (!dev) return;
        if (dev.connected) {
          wasConnected = true;
          lostCount = 0;
        } else if (wasConnected) {
          lostCount++;
          if (lostCount >= 2) {
            wasConnected = false;
            lostCount = 0;
            launchTarget(LAUNCHER);
          }
        }
      } catch (e) {}
    });
  });
}, 3000);

log("daemon started (pid=" + process.pid + ")");
for (const dev of ["event3", "event0"]) watchDevice(dev);
