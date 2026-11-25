#!/bin/sh
# One-time upload of full-length Apple Aerial MP4s to persistent TV storage (bypassing /tmp).
# Pass the TV IP as $1, set LG_TV_IP in env, or create gitignored .local/tv.env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$ROOT/.local/tv.env" ] && . "$ROOT/.local/tv.env"
TV_IP="${1:-$LG_TV_IP}"
if [ -z "$TV_IP" ]; then
  echo "Usage: $0 <TV_IP>  (or set LG_TV_IP in .local/tv.env)" >&2
  exit 1
fi
SRC="$ROOT/app/assets/aerials"
DEST="/media/developer/cleanframe-aerials"
APP_AERIALS="/media/developer/apps/usr/palm/applications/com.cleanframe.launcher/assets/aerials"

echo "Preparing $DEST on root@$TV_IP..."
ssh "root@$TV_IP" "mkdir -p '$DEST'"

echo "Uploading full-length Aerial MP4s to $TV_IP..."
scp -O "$SRC"/*.mp4 "root@$TV_IP:$DEST/"

echo "Linking $APP_AERIALS -> $DEST..."
ssh "root@$TV_IP" "rm -rf '$APP_AERIALS' && ln -s '$DEST' '$APP_AERIALS'"

echo "Done! Full-length Aerials are synced and linked on $TV_IP."
