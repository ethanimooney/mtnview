#!/bin/sh
# Download & convert the 6 full-length mountain Apple Aerials into fast-start MP4s (macOS).
# Skips files that already exist locally unless --force is passed.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/app/assets/aerials"
FORCE="${1:-}"
mkdir -p "$OUT_DIR"

# Remove any legacy non-mountain Aerials
rm -f "$OUT_DIR/hawaii-coast.mp4" "$OUT_DIR/hawaii-peaks.mp4" "$OUT_DIR/sf-headlands.mp4" "$OUT_DIR/sf-bay.mp4"

dl_full() {
  name="$1"
  url="$2"
  tmp="/tmp/aerial_full_${name}.mov"
  out="$OUT_DIR/${name}.mp4"
  if [ -f "$out" ] && [ "$FORCE" != "--force" ]; then
    echo "Keeping existing $name.mp4 ($(du -h "$out" | awk '{print $1}'))"
    return
  fi
  echo "Downloading $name..."
  curl -sL --max-time 300 -o "$tmp" "$url"
  echo "Converting $name to fast-start MP4..."
  /usr/bin/avconvert --source "$tmp" --output "$out" --preset Preset1280x720 --replace >/dev/null
  rm -f "$tmp"
  ls -lh "$out"
}

dl_full "yosemite-valley" "https://sylvan.apple.com/Videos/Y004_C015_SDR_2K_AVC.mov"
dl_full "yosemite-forest" "https://sylvan.apple.com/Videos/Y005_C003_SDR_2K_AVC.mov"
dl_full "yosemite-peaks" "https://sylvan.apple.com/Videos/Y003_C009_SDR_2K_AVC.mov"
dl_full "yosemite-ridge" "https://sylvan.apple.com/Videos/Y002_C013_SDR_2K_AVC.mov"
dl_full "scotland-highlands" "https://sylvan.apple.com/Videos/S006_C007_SDR_2K_AVC.mov"
dl_full "scotland-loch" "https://sylvan.apple.com/Videos/S003_C020_SDR_2K_AVC.mov"
echo "All 6 mountain Aerial MP4s ready in $OUT_DIR!"
