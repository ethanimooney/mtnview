<p align="center">
  <img src="app/icon.png" width="112" height="112" alt="mtnview icon" style="border-radius: 24px;" />
</p>

<h1 align="center">mtnview</h1>

<p align="center">
  A minimalist, ad-free home launcher (<code>com.mtnview.launcher</code>) for rooted <strong>LG webOS</strong> TVs.<br/>
  <em>Originally forked from <a href="https://github.com/nthnclrk/CleanFrame">CleanFrame</a> and rebuilt for LG webOS OLED TVs.</em>
</p>

<p align="center">
  <a href="https://github.com/ethanimooney/mtnview/actions/workflows/check.yml"><img src="https://github.com/ethanimooney/mtnview/actions/workflows/check.yml/badge.svg" alt="Check" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

---

## Features
- **Live Dynamic HDMI Cards:** Reads plugged-in HDMI inputs, CEC names, and live power state directly from `luna://com.webos.service.eim/getAllInputStatus`, automatically hides eARC soundbars, matches device icons (Apple TV, PlayStation, Nintendo Switch, Xbox, streaming boxes, generic HDMI), and caches sleeping device names per port.
- **Full-Length Mountain Aerials:** 6 uncut (4–7 min) Yosemite & Scottish Highlands Apple Aerials stored persistently on the TV (`/media/developer/mtnview-aerials`) with seamless dual-`<video>` crossfades, single active hardware decoder, and bottom-right location captions.
- **OLED Ambient Mode & Protection:** Activates after 2.5 min idle (or pressing **Down**), drifts an Inter clock/date/weather overlay, automatically turns off the OLED screen after 30/60 min (`turnOffScreen`), and auto-dims from 9 PM–6 AM.
- **Frosted-Glass Settings:** Matching dark translucent cards for **HDMI Inputs**, **Mountain Aerials** scene picker, **Ambient & Audio**, and **LG TV**.
- **Optional Rooted TV Daemons (`tv-backup/`):**
  - `mtnview-home.js` + `init.d/99-mtnview-home`: Dynamic remote hotkeys (auto-resolved to your HDMI ports), global Screen Off shortcut, and auto-return to `mtnview` when non-Apple-TV HDMI consoles power off (6s grace period).
  - `init.d/99-mtnview`: Auto-launches `mtnview` on boot & Quick Start+ wake (automatically skipping when Apple TV or another active HDMI device wakes the TV via CEC).
  - `init.d/10-adblock-hosts`: Blocks LG ads, telemetry, and firmware update servers via bind-mounted `/etc/hosts`.

---

## Installation

### Prerequisites
- A rooted LG webOS TV (tested on **LG OLED C6 / webOS 11.2.0**) with **Homebrew Channel** (`org.webosbrew.hbchannel`) and **SSH** enabled (port `22`, `root`).
- **Home Chooser** (`org.webosbrew.homechooser`) installed from Homebrew Channel (for zero-flash native Home button replacement).
- **Node.js 20+** and passwordless SSH access to your TV (`ssh-copy-id root@<TV_IP>`).

### 1. Clone & configure TV IP
```sh
git clone https://github.com/ethanimooney/mtnview.git
cd mtnview
mkdir -p .local
cat << 'EOF' > .local/tv.env
LG_TV_IP=192.168.1.XX
NODE_BIN=$(which node)
EOF
```
*(You can also pass `<TV_IP>` directly as the first argument to any script instead of creating `.local/tv.env`.)*

### 2. Download & convert the 6 mountain Aerials (macOS, Linux, or WSL)
```sh
./scripts/download-aerials.sh
```
Downloads the 6 full-length Yosemite & Scottish Highlands Apple Aerials and converts them into fast-start 720p MP4s in `app/assets/aerials/` (uses `avconvert` on macOS or `ffmpeg` on Linux/WSL).

### 3. Build & install `mtnview` on the TV
```sh
./scripts/deploy-lg.sh
```
Runs unit tests, builds the ~109 KB `.ipk` package in `dist/`, installs it via `appInstallService`, links persistent Aerials, and launches `mtnview`.

### 4. Sync the Aerial videos to persistent TV storage
```sh
./scripts/sync-aerials-lg.sh
```
Uploads the 6 MP4s to `/media/developer/mtnview-aerials` on the TV (bypassing `/tmp`) and symlinks them into the installed app so future app updates stay ~109 KB and install in ~1 second.

### 5. Install TV daemons, ad-blocker & elevate Home Chooser (optional)
```sh
./scripts/restore-tv.sh
```
Copies `mtnview-home.js` and `init.d/*` scripts to `/var/lib/webosbrew/`, applies `/etc/hosts` ad & update blocking, elevates `org.webosbrew.homechooser.service`, and starts the remote & wake daemons.

### 6. Set `mtnview` as your default Home screen
1. Open **Home Chooser** on your LG TV.
2. Select **mtnview**.
3. Press the **Home** button on your Magic Remote — `mtnview` now opens natively with zero LG Home flash.

### Updating later
```sh
./scripts/deploy-lg.sh
```
*(If you change `app/icon*.png`, bump `"version"` in `app/appinfo.json` and reboot the TV so webOS refreshes its icon cache.)*

---

## Magic Remote Shortcuts
| Button | Where | Action |
| :--- | :--- | :--- |
| **Home** | Anywhere | Opens `mtnview` natively via elevated Home Chooser |
| **Netflix** | Anywhere | Switches to Apple TV (auto-resolved HDMI port) |
| **Prime Video** | Anywhere | Switches to PlayStation (auto-resolved HDMI port) |
| **Disney+** | Anywhere | Switches to Nintendo Switch (auto-resolved HDMI port) |
| **LG Channels** | Anywhere | Turns OLED screen off (keeps eARC / soundbar audio playing) |
| **Red** | In `mtnview` | Turns OLED screen off |
| **Green** | In `mtnview` | Toggles Night Dim |
| **Yellow** | In `mtnview` | Toggles Ambient Mode |
| **Blue** | In `mtnview` | Skips to next mountain Aerial |
| **Down** | On cards | Enters Ambient Mode (**Left/Right** skips Aerials) |

---

## Contributing
Contributions, bug reports, and webOS version compatibility fixes are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for local preview, coding rules, and PR guidelines.

## Credits & License
Originally forked and adapted from [CleanFrame](https://github.com/nthnclrk/CleanFrame) by [@nthnclrk](https://github.com/nthnclrk), then rebuilt for LG webOS with live HDMI detection, full-length mountain Aerials, and OLED panel protection.

Licensed under the **MIT License** — see [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
