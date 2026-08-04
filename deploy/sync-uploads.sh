#!/usr/bin/env bash
# Sync local product images to the VPS uploads dir served by nginx.
# Usage:
#   ./deploy/sync-uploads.sh
#   UPLOADS_HOST=86.48.28.141 ./deploy/sync-uploads.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${UPLOADS_HOST:-86.48.28.141}"
REMOTE_DIR="${UPLOADS_REMOTE_DIR:-/var/www/avilla/uploads}"
LOCAL_DIR="${ROOT}/public/uploads"

if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "Missing local uploads: $LOCAL_DIR" >&2
  exit 1
fi

echo "Sync $LOCAL_DIR/ → root@${HOST}:${REMOTE_DIR}/"
rsync -avz --progress \
  --exclude '.gitkeep' \
  "$LOCAL_DIR/" \
  "root@${HOST}:${REMOTE_DIR}/"

echo "Check sample:"
curl -sI "http://${HOST}/uploads/gopage/scarpin-salto-fino-preto-r23600-1/1-c3251f9d-6e1a-4cd4-bde6-008a6c409c62.webp" | head -5
echo DONE
