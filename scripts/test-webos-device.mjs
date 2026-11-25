import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../app/device.js', import.meta.url), 'utf8');

function loadDevice(globals = {}) {
  const windowObj = { ...globals };
  const ctx = vm.createContext({
    window: windowObj,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(src, ctx);
  return windowObj.FrameDevice;
}

test('returns unavailable error in desktop preview without webOS bridge', (_, done) => {
  const dev = loadDevice();
  assert.equal(dev.platform, 'webos');
  dev.setSource(1, (err) => {
    assert.ok(err && /LG TV/i.test(err.message));
    done();
  });
});

test('switches HDMI 1-4 via PalmServiceBridge applicationManager launch', (_, done) => {
  const calls = [];
  class MockBridge {
    call(uri, payload) {
      calls.push({ uri, payload: JSON.parse(payload) });
      setTimeout(() => this.onservicecallback(JSON.stringify({ returnValue: true })), 0);
    }
  }
  const dev = loadDevice({ PalmServiceBridge: MockBridge });
  dev.setSource(4, (err, input) => {
    assert.equal(err, null);
    assert.equal(input.number, 4);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].uri, 'luna://com.webos.applicationManager/launch');
    assert.equal(calls[0].payload.id, 'com.webos.app.hdmi4');
    done();
  });
});

test('falls back to EIM switchInput if hdmi app launch fails', (_, done) => {
  const calls = [];
  class MockBridge {
    call(uri, payload) {
      calls.push({ uri, payload: JSON.parse(payload) });
      const ok = uri.includes('switchInput');
      setTimeout(() => this.onservicecallback(JSON.stringify(ok ? { returnValue: true } : { returnValue: false, errorCode: -103, errorText: 'denied' })), 0);
    }
  }
  const dev = loadDevice({ PalmServiceBridge: MockBridge });
  dev.setSource(2, (err, input) => {
    assert.equal(err, null);
    assert.equal(input.number, 2);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].uri, 'luna://com.webos.service.eim/switchInput');
    assert.equal(calls[1].payload.inputId, 'HDMI_2');
    done();
  });
});

test('sources parses EIM devices and falls back to 4 HDMI ports on permission error', async () => {
  class EimOkBridge {
    call(uri) {
      assert.equal(uri, 'luna://com.webos.service.eim/getAllInputStatus');
      setTimeout(() => this.onservicecallback(JSON.stringify({
        returnValue: true,
        devices: [
          { id: 'HDMI_2', label: 'Switch', connected: true, active: false, appId: 'com.webos.app.hdmi2' },
          { id: 'HDMI_1', label: 'Apple TV', connected: true, active: true, appId: 'com.webos.app.hdmi1' }
        ]
      })), 0);
    }
  }
  const dev1 = loadDevice({ PalmServiceBridge: EimOkBridge });
  const list1 = await new Promise((resolve, reject) => dev1.sources((err, res) => (err ? reject(err) : resolve(res))));
  assert.deepEqual(Array.from(list1, (x) => [x.number, x.name, x.active]), [
    [1, 'Apple TV', true],
    [2, 'Switch', false]
  ]);

  class EimDeniedBridge {
    call() {
      setTimeout(() => this.onservicecallback(JSON.stringify({ returnValue: false, errorText: 'permission denied' })), 0);
    }
  }
  const dev2 = loadDevice({ PalmServiceBridge: EimDeniedBridge });
  const list2 = await new Promise((resolve, reject) => dev2.sources((err, res) => (err ? reject(err) : resolve(res))));
  assert.deepEqual(Array.from(list2, (x) => x.number), [1, 2, 3, 4]);
});

test('settings falls back from com.palm.app.settings to com.webos.app.setting', (_, done) => {
  const launched = [];
  class MockBridge {
    call(uri, payload) {
      const id = JSON.parse(payload).id;
      launched.push(id);
      setTimeout(() => this.onservicecallback(JSON.stringify({ returnValue: id === 'com.webos.app.setting' })), 0);
    }
  }
  const dev = loadDevice({ PalmServiceBridge: MockBridge });
  dev.settings((err) => {
    assert.equal(err, null);
    assert.deepEqual(launched, ['com.palm.app.settings', 'com.webos.app.setting']);
    done();
  });
});

test('apps filters out internal webOS apps, HDMI inputs, and self', (_, done) => {
  class MockBridge {
    call() {
      setTimeout(() => this.onservicecallback(JSON.stringify({
        returnValue: true,
        launchPoints: [
          { id: 'com.mtnview.launcher', title: 'mtnview' },
          { id: 'com.webos.app.hdmi1', title: 'HDMI 1' },
          { id: 'com.webos.app.home', title: 'Home' },
          { id: 'netflix', title: 'Netflix' },
          { id: 'com.apple.appletv', title: 'Apple TV' },
          { id: 'org.webosbrew.hbchannel', title: 'Homebrew Channel' }
        ]
      })), 0);
    }
  }
  const dev = loadDevice({ PalmServiceBridge: MockBridge });
  dev.apps((err, list) => {
    assert.equal(err, null);
    assert.deepEqual(Array.from(list, (a) => a.appId), ['netflix', 'com.apple.appletv', 'org.webosbrew.hbchannel']);
    done();
  });
});

test('inhibitScreenSaver registers and replies ack:false on Active', () => {
  const calls = [];
  class MockBridge {
    call(uri, payload) {
      calls.push({ uri, payload: JSON.parse(payload), bridge: this });
    }
  }
  const dev = loadDevice({ WebOSServiceBridge: MockBridge });
  dev.inhibitScreenSaver();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].uri, 'luna://com.webos.service.tvpower/power/registerScreenSaverRequest');
  assert.equal(calls[0].payload.subscribe, true);
  calls[0].bridge.onservicecallback(JSON.stringify({ state: 'Active', timestamp: '987654' }));
  assert.equal(calls.length, 2);
  assert.equal(calls[1].uri, 'luna://com.webos.service.tvpower/power/responseScreenSaverRequest');
  assert.equal(calls[1].payload.ack, false);
  assert.equal(calls[1].payload.timestamp, '987654');
  dev.allowScreenSaver();
});

test('turnOffScreen calls tvpower power/turnOffScreen with standbyMode active', (_, done) => {
  const calls = [];
  class MockBridge {
    call(uri, payload) {
      calls.push({ uri, payload: JSON.parse(payload) });
      setTimeout(() => this.onservicecallback(JSON.stringify({ returnValue: true })), 0);
    }
  }
  const dev = loadDevice({ PalmServiceBridge: MockBridge });
  dev.turnOffScreen((err) => {
    assert.equal(err, null);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].uri, 'luna://com.webos.service.tvpower/power/turnOffScreen');
    assert.equal(calls[0].payload.standbyMode, 'active');
    done();
  });
});
