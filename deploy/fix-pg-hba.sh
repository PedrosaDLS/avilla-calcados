#!/bin/bash
set -euo pipefail

# System Postgres listens on 5433; 5432 is a Docker postgres
PGPORT=5433
NEWPASS='AvillaProd2026Secure'
export PGPORT

sudo -u postgres psql -p "$PGPORT" <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'avilla') THEN
    CREATE ROLE avilla LOGIN PASSWORD '${NEWPASS}';
  ELSE
    ALTER ROLE avilla WITH LOGIN PASSWORD '${NEWPASS}';
  END IF;
END
\$\$;
SELECT '1' FROM pg_database WHERE datname='avilla' \gexec
SQL

sudo -u postgres psql -p "$PGPORT" -tc "SELECT 1 FROM pg_database WHERE datname='avilla'" | grep -q 1 \
  || sudo -u postgres psql -p "$PGPORT" -c "CREATE DATABASE avilla OWNER avilla;"

sudo -u postgres psql -p "$PGPORT" -c "ALTER DATABASE avilla OWNER TO avilla;"
sudo -u postgres psql -p "$PGPORT" -d avilla -c "GRANT ALL ON SCHEMA public TO avilla;"

export PGPASSWORD="$NEWPASS"
psql -h 127.0.0.1 -p "$PGPORT" -U avilla -d avilla -c "SELECT 'tcp_ok_5433' AS status;"

SECRET=$(openssl rand -hex 32)
cat > /var/www/avilla/.env <<EOF
DATABASE_URL="postgresql://avilla:${NEWPASS}@127.0.0.1:${PGPORT}/avilla?schema=public"
NEXTAUTH_URL="http://86.48.28.141"
AUTH_SECRET="${SECRET}"
NEXTAUTH_SECRET="${SECRET}"
WHATSAPP_NUMBER="553898819074"
UPLOAD_DIR="/var/www/avilla/uploads"
NODE_ENV=production
PORT=3000
EOF
chmod 600 /var/www/avilla/.env

# kill hung password prompt processes if any
pkill -f 'psql.*avilla' 2>/dev/null || true

cd /var/www/avilla
export DATABASE_URL="postgresql://avilla:${NEWPASS}@127.0.0.1:${PGPORT}/avilla?schema=public"
npx prisma migrate deploy
npx tsx prisma/seed.ts
echo ALL_OK
