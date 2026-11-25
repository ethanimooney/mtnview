#!/bin/sh
# Download & convert the 6 Yosemite, Hawaii, and San Francisco Apple Aerials into fast-start MP4s (macOS).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/app/assets/aerials"
mkdir -p "$OUT_DIR"

dl_full() {
  name="$1"
  url="$2"
  tmp="/tmp/aerial_full_${name}.mov"
  out="$OUT_DIR/${name}.mp4"
  echo "Downloading $name..."
  curl -sL --max-time 180 -o "$tmp" "$url"
  echo "Converting $name to fast-start MP4..."
  /usr/bin/avconvert --source "$tmp" --output "$out" --preset Preset1280x720 --replace >/dev/null
  rm -f "$tmp"
  ls -lh "$out"
}

dl_full "yosemite-valley" "https://sylvan.apple.com/Videos/Y004_C015_SDR_2K_AVC.mov"
dl_full "hawaii-coast" "https://sylvan.apple.com/Videos/comp_H005_C012_PS_v01_SDR_PS_20180925_SDR_2K_AVC.mov"
dl_full "sf-headlands" "https://sylvan.apple.com/Videos/comp_A013_C012_0122D6_CC_v01_SDR_PS_FINAL_20180709_SDR_2K_AVC.mov"
dl_full "yosemite-forest" "https://sylvan.apple.com/Videos/Y005_C003_SDR_2K_AVC.mov"
dl_full "hawaii-peaks" "https://sylvan.apple.com/Videos/comp_H004_C009_PS_v01_SDR_PS_20180925_SDR_2K_AVC.mov"
dl_full "sf-bay" "https://sylvan.apple.com/Videos/comp_A006_C003_1219EE_CC_v01_SDR_PS_FINAL_20180709_SDR_2K_AVC.mov"
echo "All 6 Aerial MP4s ready in $OUT_DIR!"
