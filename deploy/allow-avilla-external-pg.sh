#!/bin/bash
set -euo pipefail
PGHBA=$(ls /etc/postgresql/*/main/pg_hba.conf | head -1)
if ! grep -q 'hostssl all             avilla' "$PGHBA"; then
  cat >> "$PGHBA" <<'HBA'

# avilla external access for Vercel/serverless
hostssl all             avilla          0.0.0.0/0               scram-sha-256
hostssl all             avilla          ::/0                    scram-sha-256
HBA
  systemctl reload postgresql
  echo pg_hba_updated
else
  echo pg_hba_exists
fi
sudo -u postgres psql -p 5433 -d avilla -tAc 'SELECT count(*) FROM "Product";'
