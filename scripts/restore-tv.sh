#!/bin/sh
# One-command restore for rooted LG webOS system scripts & daemons from tv-backup/.
# Pass the TV IP as $1, set LG_TV_IP in env, or create gitignored .local/tv.env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$ROOT/.local/tv.env" ] && . "$ROOT/.local/tv.env"
TV_IP="${1:-$LG_TV_IP}"
if [ -z "$TV_IP" ]; then
  echo "Usage: $0 <TV_IP>  (or set LG_TV_IP in .local/tv.env)" >&2
  exit 1
fi

echo "1/4 Uploading mtnview-home.js and init.d scripts to root@$TV_IP..."
ssh "root@$TV_IP" 'mkdir -p /var/lib/webosbrew/init.d'
scp -O "$ROOT/tv-backup/mtnview-home.js" "root@$TV_IP:/var/lib/webosbrew/mtnview-home.js"
scp -O "$ROOT/tv-backup/init.d/10-adblock-hosts" \
       "$ROOT/tv-backup/init.d/99-mtnview" \
       "$ROOT/tv-backup/init.d/99-mtnview-home" \
       "root@$TV_IP:/var/lib/webosbrew/init.d/"

echo "2/4 Setting permissions & applying ad/update hosts block..."
ssh "root@$TV_IP" '
chmod +x /var/lib/webosbrew/init.d/10-adblock-hosts \
         /var/lib/webosbrew/init.d/99-mtnview \
         /var/lib/webosbrew/init.d/99-mtnview-home
if ! grep -q "ad.lgappstv.com" /etc/hosts 2>/dev/null; then
  /var/lib/webosbrew/init.d/10-adblock-hosts
fi
'

echo "3/4 Elevating Home Chooser service (if installed)..."
ssh "root@$TV_IP" '
if [ -d /media/developer/apps/usr/palm/applications/org.webosbrew.homechooser ]; then
  luna-send -n 1 "luna://org.webosbrew.hbchannel.service/elevateService" "{\"service\":\"org.webosbrew.homechooser.service\"}" || true
fi
'

echo "4/4 Restarting mtnview-home remote daemon..."
ssh "root@$TV_IP" '/var/lib/webosbrew/init.d/99-mtnview-home && sleep 1 && ps | grep "[m]tnview-home.js"'

echo "Done! TV system scripts restored on $TV_IP."
echo "Next (if rebuilding from scratch): ./scripts/deploy-lg.sh && ./scripts/sync-aerials-lg.sh"
