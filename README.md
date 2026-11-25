# mtnview

A minimalist, ad-free custom home launcher for **LG webOS TVs** (built for an LG OLED C6 with Apple TV, PS5, Nintendo Switch, and Sonos eARC).

## Highlights
- **Inter Typography & Frosted Glass UI**: Clean 4-card device layout (*Apple TV*, *PS5*, *Nintendo Switch*, *TV Settings*) with live HDMI connected/active indicator dots and frosted-glass top bar pills.
- **Full-Length Apple Aerial Flyovers**: Seamless dual-`<video>` crossfades across curated **Yosemite**, **Hawaii**, and **San Francisco** nature Aerials, with separate collections for Home and OLED Ambient Mode and subtle Apple-TV-style location captions.
- **OLED Ambient Mode / Burn-In Protection**: Automatically dims after 2.5 minutes idle (or press **Down** anytime to enter immediately), drifting a high-contrast **Inter** clock, date, and local weather across safe zones. Press **Left / Right** inside Ambient Mode to skip Aerials.
- **Native LG webOS Integration**: Uses LG Luna Services (`PalmServiceBridge` / `WebOSServiceBridge`) for HDMI 1–4 switching, TV settings, LG screensaver suppression (`registerScreenSaverRequest`), and **Home Chooser** (`appCategory: "home"`).
- **Tactile Web Audio UI Sounds**: Subtle zero-dependency synthesized navigation sounds across Home and Settings.

## Quick Start

### 1. Download Full-Length Aerial Videos (macOS)
```bash
./scripts/download-aerials.sh
```

### 2. Deploy to a Rooted LG webOS TV
Create a gitignored `.local/tv.env` with `LG_TV_IP=<your-tv-ip>` (or pass the IP as an argument):
```bash
./scripts/deploy-lg.sh <TV_IP>
./scripts/sync-aerials-lg.sh <TV_IP>   # one-time upload of full Aerial MP4s
```

### 3. Rooted TV Companion Scripts (`tv-backup/`)
- `tv-backup/mtnview-home.js` & `tv-backup/init.d/99-mtnview-home`: Remaps unused remote buttons to HDMI 1/3/4, blocks unwanted streaming hotkeys, and auto-returns to **mtnview** when a console powers off instead of showing LG's "No Signal" screen.
- `tv-backup/init.d/99-mtnview`: Auto-launches **mtnview** on wake/boot (while respecting Apple TV HDMI-CEC wake-up).
- `tv-backup/init.d/10-adblock-hosts`: Bind-mounted `/etc/hosts` blocking LG ad, telemetry, and firmware-update nag endpoints.

## Credits
Originally built starting from [nthnclrk/CleanFrame](https://github.com/nthnclrk/CleanFrame) (MIT License) and adapted for LG webOS.
