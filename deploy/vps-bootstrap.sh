#!/bin/bash
set -euo pipefail

rm -f /etc/apt/sources.list.d/*ngrok* 2>/dev/null || true
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq postgresql postgresql-contrib nginx rsync
systemctl enable --now postgresql

DB_USER=avilla
DB_NAME=avilla
DB_PASS=$(openssl rand -hex 12)
NEXTAUTH_SECRET=$(openssl rand -hex 32)

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

mkdir -p /var/www/avilla/uploads
chmod 755 /var/www/avilla/uploads

if [ ! -f /var/www/avilla/.env ]; then
  cat > /var/www/avilla/.env <<EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public"
NEXTAUTH_URL="http://86.48.28.141"
AUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
WHATSAPP_NUMBER="553898819074"
UPLOAD_DIR="/var/www/avilla/uploads"
NODE_ENV=production
PORT=3000
EOF
  chmod 600 /var/www/avilla/.env
  echo "CREATED_ENV"
  echo "DB_PASS=${DB_PASS}"
else
  echo "KEEP_ENV"
fi

cat > /etc/nginx/sites-available/avilla <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 86.48.28.141 _;
    client_max_body_size 8m;
    location /uploads/ {
        alias /var/www/avilla/uploads/;
        access_log off;
        expires 30d;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/avilla /etc/nginx/sites-enabled/avilla
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo BOOTSTRAP_OK
