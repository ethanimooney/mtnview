# Agent Guidelines for mtnview

`mtnview` is a fork of [CleanFrame](https://github.com/nthnclrk/CleanFrame) rebuilt specifically for rooted **LG webOS** TVs (tested on LG OLED C6, webOS 11.2.0 / Rockhopper).

## Runtime Constraints (LG webOS Chromium)
- **Strict ES5 in `app/`:** Keep `app/main.js` and `app/device.js` ES5-compatible (`var`, `function`, no `const`/`let`, arrow functions, or template literals).
- **CSS compatibility in `app/style.css`:** Do **not** use CSS `inset:` or flex/grid `gap:`. Use explicit `top`/`right`/`bottom`/`left` and child margin rules (`> * + *`).
- **`app/appinfo.json`:**
  - Keep `"appCategory": ["home"]` as an **array** (webOS 11 `sam` rejects string values or `requiredPermissions` on fresh install).
  - Do **not** set `"handlesRelaunch": true` unless explicitly handling activation.
  - Bump `"version"` and reboot the TV whenever changing `app/icon*.png` so LG Home refreshes its icon cache.

## TV Daemon Constraints (`tv-backup/`)
- `mtnview-home.js` runs on the TV's Node runtime via `init.d/99-mtnview-home` with `UV_THREADPOOL_SIZE=8` and watches only `["event3", "event0"]` (opening 5+ blocking `/dev/input/event*` streams starves libuv's default threadpool).
- Use `setsid` in `init.d/99-mtnview-home` so the daemon stays alive after SSH disconnects.
- Use `luna-send -n 1` for single queries (`luna-send -i` is 4KB stdio-buffered in non-TTY pipes).

## Verification
Before committing or deploying:
```sh
node --check app/main.js
node --check app/device.js
node --check tv-backup/mtnview-home.js
sh -n scripts/*.sh tv-backup/init.d/*
! grep -nE '(^|[{; ])(inset|gap):' app/style.css
node --test scripts/test-webos-device.mjs
node scripts/package-webos.mjs
```

## Privacy
Never commit `.local/tv.env`, local TV IPs, SSH keys, `dist/*.ipk`, or `app/assets/aerials/*.mp4`.
