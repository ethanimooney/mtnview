# Contributing to mtnview

`mtnview` is a personal LG webOS TV launcher originally forked from [CleanFrame](https://github.com/nthnclrk/CleanFrame) by Nathan Clark and rebuilt for rooted LG webOS OLED TVs.

## Local Development
1. Keep runtime files in `app/` strictly ES5 (`app/main.js`, `app/device.js`) and avoid CSS `inset:` / `gap:` in `app/style.css`.
2. Run unit tests and build the `.ipk` package:
   ```sh
   npm test
   npm run package
   ```
3. Deploy to your rooted LG webOS TV (requires `.local/tv.env` or passing `<TV_IP>`):
   ```sh
   ./scripts/deploy-lg.sh
   ```

## License
Contributions are licensed under the MIT License (see [LICENSE](LICENSE)). Preserve original CleanFrame copyright notices.
