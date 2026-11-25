#!/bin/sh
# Sync full-length mountain Apple Aerial MP4s to persistent TV storage (bypassing /tmp).
# Removes stale/non-mountain MP4s from the TV and skips files already present with matching size.
# Pass the TV IP as $1, set LG_TV_IP in env, or create gitignored .local/tv.env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$ROOT/.local/tv.env" ] && . "$ROOT/.local/tv.env"
TV_IP="${1:-$LG_TV_IP}"
TV_USER="${TV_USER:-root}"
if [ -z "$TV_IP" ]; then
  echo "Usage: $0 <TV_IP>  (or set LG_TV_IP in .local/tv.env)" >&2
  exit 1
fi
SRC="$ROOT/app/assets/aerials"
DEST="/media/developer/mtnview-aerials"
APP_AERIALS="/media/developer/apps/usr/palm/applications/com.mtnview.launcher/assets/aerials"

echo "1/3 Cleaning stale Aerials in $DEST on $TV_USER@$TV_IP..."
ssh "$TV_USER@$TV_IP" "mkdir -p '$DEST' && rm -f '$DEST/hawaii-coast.mp4' '$DEST/hawaii-peaks.mp4' '$DEST/sf-headlands.mp4' '$DEST/sf-bay.mp4'"

echo "2/3 Uploading missing/updated mountain Aerial MP4s to $TV_IP..."
for f in "$SRC"/*.mp4; do
  base="$(basename "$f")"
  local_sz="$(stat -f%z "$f")"
  remote_sz="$(ssh "$TV_USER@$TV_IP" "stat -c%s '$DEST/$base' 2>/dev/null || echo 0")"
  if [ "$local_sz" = "$remote_sz" ]; then
    echo "  Skipping $base (already synced)"
  else
    echo "  Uploading $base..."
    scp -O "$f" "$TV_USER@$TV_IP:$DEST/$base"
  fi
done

echo "3/3 Linking $APP_AERIALS -> $DEST..."
ssh "$TV_USER@$TV_IP" "rm -rf '$APP_AERIALS' && ln -s '$DEST' '$APP_AERIALS' && ls -lh '$DEST/'"

echo "Done! Mountain Aerials are synced and linked on $TV_IP."
