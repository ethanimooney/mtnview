# mtnview

A minimalist, ad-free LG webOS TV launcher (`com.mtnview.launcher`) built for a rooted **LG OLED C6** (webOS 11.2.0 / Rockhopper).

## Features
- **Live Dynamic HDMI Cards:** Reads plugged-in HDMI inputs, CEC names, and live power state from `luna://com.webos.service.eim/getAllInputStatus`, automatically hides eARC soundbars, matches device icons (Apple TV, PS5, Nintendo Switch, Xbox, streaming boxes, generic HDMI), and caches sleeping device names per port.
- **Full-Length Mountain Aerials:** 6 uncut (4–7 min) Yosemite & Scottish Highlands Apple Aerials stored persistently on the TV (`/media/developer/mtnview-aerials`) with seamless dual-`<video>` crossfades and bottom-right location captions.
- **OLED Ambient Mode & Protection:** Activates after 2.5 min idle (or pressing **Down**), drifts an Inter clock/date/weather overlay, automatically turns off the OLED screen after 30/60 min (`turnOffScreen`), and auto-dims from 9 PM–6 AM.
- **Frosted-Glass Settings:** Matching dark translucent cards for **HDMI Inputs**, **Mountain Aerials** scene picker, **Ambient & Audio**, and **LG TV**.
- **Rooted TV Daemons (`tv-backup/`):**
  - `mtnview-home.js` + `init.d/99-mtnview-home`: Dynamic remote hotkeys, global Screen Off shortcut, and auto-return to `mtnview` when non-Apple-TV HDMI consoles power off (6s grace period).
  - `init.d/99-mtnview`: Auto-launches `mtnview` on boot & Quick Start+ wake (skipping if Apple TV is active).
  - `init.d/10-adblock-hosts`: Blocks LG ads, telemetry, and firmware update servers via bind-mounted `/etc/hosts`.

## Magic Remote Shortcuts
| Button | Where | Action |
| :--- | :--- | :--- |
| **Home** | Anywhere | Opens `mtnview` natively via elevated Home Chooser |
| **Netflix** | Anywhere | Switches to Apple TV (auto-resolved HDMI port) |
| **Prime Video** | Anywhere | Switches to PS5 (auto-resolved HDMI port) |
| **Disney+** | Anywhere | Switches to Nintendo Switch (auto-resolved HDMI port) |
| **LG Channels** | Anywhere | Turns OLED screen off (keeps Sonos audio playing) |
| **Red** | In `mtnview` | Turns OLED screen off |
| **Green** | In `mtnview` | Toggles Night Dim |
| **Yellow** | In `mtnview` | Toggles Ambient Mode |
| **Blue** | In `mtnview` | Skips to next mountain Aerial |
| **Down** | On cards | Enters Ambient Mode (**Left/Right** skips Aerials) |

## Scripts
Create a gitignored `.local/tv.env` with `LG_TV_IP=<your-tv-ip>` (or pass the IP as `$1`):

- `./scripts/deploy-lg.sh` — Runs unit tests, builds the `.ipk` (~200 KB), installs via `appInstallService`, re-links persistent Aerials, and launches `mtnview`.
- `./scripts/download-aerials.sh` — Downloads & converts the 6 full-length mountain Apple Aerials into fast-start MP4s on macOS.
- `./scripts/sync-aerials-lg.sh` — Syncs mountain Aerial MP4s to `/media/developer/mtnview-aerials` on the TV and removes stale clips.
- `./scripts/restore-tv.sh` — Restores `mtnview-home.js`, all `init.d` scripts, hosts block, and Home Chooser service elevation on a rooted TV.
