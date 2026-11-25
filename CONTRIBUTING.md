# Contributing to mtnview

Thanks for your interest in **mtnview**! This project is an open-source LG webOS TV launcher originally forked from [CleanFrame](https://github.com/nthnclrk/CleanFrame) by Nathan Clark and rebuilt for rooted LG webOS OLED TVs.

## Getting Started

1. **Fork & clone** the repository:
   ```sh
   git clone https://github.com/<your-username>/mtnview.git
   cd mtnview
   ```
2. **Create a feature branch:**
   ```sh
   git checkout -b my-improvement
   ```
3. **Preview locally in any browser** (optional — works without a TV):
   ```sh
   npx http-server app -p 4795 -c-1
   ```
   Then open `http://localhost:4795` and use your keyboard arrow keys, `Enter`, and `Escape`.

## Coding & webOS Compatibility Rules

LG webOS runs an older embedded Chromium engine, so please follow these rules for all files under `app/`:

- **Strict ES5 JavaScript** in `app/main.js` and `app/device.js` (`var`, `function`, no `const`/`let`, arrow functions, or template literals).
- **No CSS `inset:` or `gap:`** in `app/style.css` — use explicit `top`/`right`/`bottom`/`left` and child margin rules (`> * + *`).
- **Keep `app/appinfo.json` valid:** `"appCategory"` must remain an array (`["home"]`).
- **Keep TV daemons lightweight:** In `tv-backup/mtnview-home.js`, avoid high-frequency `luna-send` polling and keep `UV_THREADPOOL_SIZE=8` when watching `/dev/input/event*`.
- **Never commit private data:** Do not commit `.local/tv.env`, TV IPs, SSH keys, `dist/*.ipk`, or `app/assets/aerials/*.mp4`.

## Running Checks & Tests

Before opening a pull request, run the same checks as CI:

```sh
node --check app/main.js
node --check app/device.js
node --check tv-backup/mtnview-home.js
sh -n scripts/*.sh tv-backup/init.d/*
! grep -nE '(^|[{; ])(inset|gap):' app/style.css
npm test
npm run package
```

If you have a rooted LG webOS TV, test on hardware with `./scripts/deploy-lg.sh <TV_IP>`.

## Submitting a Pull Request

- Keep PRs focused and describe what you changed and which LG webOS model/version you tested on (if applicable).
- Include screenshots if your change affects the UI layout.

## License

By contributing, you agree that your contributions will be licensed under the **MIT License** (see [LICENSE](LICENSE)). Please preserve all original CleanFrame copyright notices.
