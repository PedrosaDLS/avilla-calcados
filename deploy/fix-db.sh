#!/bin/bash
set -euo pipefail
DB_PASS=$(openssl rand -hex 12)
sudo -u postgres psql -c "ALTER USER avilla WITH PASSWORD '${DB_PASS}';"
# Escape for sed
ESCAPED=$(printf '%s\n' "$DB_PASS" | sed 's/[&/\]/\\&/g')
sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://avilla:${ESCAPED}@127.0.0.1:5432/avilla?schema=public\"|" /var/www/avilla/.env
echo "Updated DATABASE_URL"
cd /var/www/avilla
npx prisma migrate deploy
npx tsx prisma/seed.ts
echo MIGRATE_SEED_OK
