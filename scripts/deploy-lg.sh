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
IPK="$ROOT/dist/com.mtnview.launcher_${VERSION}_all.ipk"

echo "3/4 Uploading $(basename "$IPK") to root@$TV_IP..."
scp -O "$IPK" "root@$TV_IP:/tmp/mtnview.ipk"

echo "4/4 Installing, re-linking persistent Aerials, and launching mtnview v$VERSION..."
ssh "root@$TV_IP" '
luna-send-pub -i "luna://com.webos.appInstallService/dev/install" "{\"id\":\"com.mtnview.launcher\",\"ipkUrl\":\"/tmp/mtnview.ipk\",\"subscribe\":true}" | while IFS= read -r line; do
  echo "$line"
  case "$line" in
    *"\"installed\""*|*"\"install failed\""*|*"\"errorCode\""*) break ;;
  esac
done
if [ -d /media/developer/mtnview-aerials ] && [ -d /media/developer/apps/usr/palm/applications/com.mtnview.launcher/assets ]; then
  rm -rf /media/developer/apps/usr/palm/applications/com.mtnview.launcher/assets/aerials
  ln -s /media/developer/mtnview-aerials /media/developer/apps/usr/palm/applications/com.mtnview.launcher/assets/aerials
fi
sleep 1
luna-send -n 1 "luna://com.webos.applicationManager/launch" "{\"id\":\"com.mtnview.launcher\"}"
'

echo "Done! mtnview v$VERSION deployed to $TV_IP."
