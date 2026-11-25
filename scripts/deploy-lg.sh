#!/bin/sh
# One-command build & deploy for a rooted LG webOS TV.
# Pass the TV IP as $1, set LG_TV_IP in env, or create gitignored .local/tv.env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$ROOT/.local/tv.env" ] && . "$ROOT/.local/tv.env"
TV_IP="${1:-$LG_TV_IP}"
if [ -z "$TV_IP" ]; then
  echo "Usage: $0 <TV_IP>  (or set LG_TV_IP in .local/tv.env)" >&2
  exit 1
fi
NODE_BIN="${NODE_BIN:-$(command -v node)}"

echo "1/4 Running unit tests..."
"$NODE_BIN" --test "$ROOT/scripts/test-webos-device.mjs"

echo "2/4 Building LG webOS .ipk..."
"$NODE_BIN" "$ROOT/scripts/package-webos.mjs"

VERSION="$("$NODE_BIN" -e "console.log(require('$ROOT/app/appinfo.json').version)")"
IPK="$ROOT/dist/com.cleanframe.launcher_${VERSION}_all.ipk"

echo "3/4 Uploading $(basename "$IPK") to root@$TV_IP..."
scp -O "$IPK" "root@$TV_IP:/tmp/cleanframe.ipk"

echo "4/4 Installing, re-linking persistent Aerials, and launching CleanFrame v$VERSION..."
ssh "root@$TV_IP" "luna-send-pub -n 6 'luna://com.webos.appInstallService/dev/install' '{\"id\":\"com.cleanframe.launcher\",\"ipkUrl\":\"/tmp/cleanframe.ipk\",\"subscribe\":true}' && if [ -d /media/developer/cleanframe-aerials ]; then rm -rf /media/developer/apps/usr/palm/applications/com.cleanframe.launcher/assets/aerials && ln -s /media/developer/cleanframe-aerials /media/developer/apps/usr/palm/applications/com.cleanframe.launcher/assets/aerials; fi && sleep 1 && luna-send -n 1 'luna://com.webos.applicationManager/launch' '{\"id\":\"com.cleanframe.launcher\"}'"

echo "Done! CleanFrame v$VERSION deployed to $TV_IP."
