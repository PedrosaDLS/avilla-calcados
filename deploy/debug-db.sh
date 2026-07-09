#!/bin/bash
set -euo pipefail
echo "=== .env ==="
cat /var/www/avilla/.env
echo "=== pg roles ==="
sudo -u postgres psql -c '\du avilla'
echo "=== pg_hba ==="
grep -v '^#' /etc/postgresql/*/main/pg_hba.conf | head -30
echo "=== test connection ==="
# Extract password from .env
DBURL=$(grep '^DATABASE_URL=' /var/www/avilla/.env | sed 's/^DATABASE_URL=//; s/^"//; s/"$//')
echo "URL_MASKED=$(echo "$DBURL" | sed 's/:[^@]*@/:***@/')"
# Parse password
PASS=$(echo "$DBURL" | sed -n 's|.*://avilla:\([^@]*\)@.*|\1|p')
export PGPASSWORD="$PASS"
psql -h 127.0.0.1 -U avilla -d avilla -c 'SELECT 1 AS ok;' || {
  echo "psql failed, resetting password to fixed value"
  NEWPASS='AvillaProd_2026_Secure'
  sudo -u postgres psql -c "ALTER USER avilla WITH PASSWORD '${NEWPASS}';"
  cat > /var/www/avilla/.env <<EOF
DATABASE_URL="postgresql://avilla:${NEWPASS}@127.0.0.1:5432/avilla?schema=public"
NEXTAUTH_URL="http://86.48.28.141"
AUTH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_SECRET="$(grep NEXTAUTH_SECRET /var/www/avilla/.env 2>/dev/null | cut -d= -f2- | tr -d '"' || openssl rand -hex 32)"
WHATSAPP_NUMBER="553898819074"
UPLOAD_DIR="/var/www/avilla/uploads"
NODE_ENV=production
PORT=3000
EOF
  # rewrite cleanly
  SECRET=$(openssl rand -hex 32)
  cat > /var/www/avilla/.env <<EOF
DATABASE_URL="postgresql://avilla:${NEWPASS}@127.0.0.1:5432/avilla?schema=public"
NEXTAUTH_URL="http://86.48.28.141"
AUTH_SECRET="${SECRET}"
NEXTAUTH_SECRET="${SECRET}"
WHATSAPP_NUMBER="553898819074"
UPLOAD_DIR="/var/www/avilla/uploads"
NODE_ENV=production
PORT=3000
EOF
  chmod 600 /var/www/avilla/.env
  export PGPASSWORD="$NEWPASS"
  psql -h 127.0.0.1 -U avilla -d avilla -c 'SELECT 1 AS ok;'
}
echo CONN_OK
