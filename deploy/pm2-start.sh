#!/bin/bash
set -euo pipefail
cd /var/www/avilla

# Use free port 3010 (3000 taken by vps-dashboard)
PORT=3010

# Update package start script
python3 - <<'PY'
from pathlib import Path
p = Path("/var/www/avilla/package.json")
text = p.read_text()
text = text.replace("next start -p 3000", "next start -p 3010")
p.write_text(text)
print("package.json start -> 3010")
PY

# Update .env PORT
grep -q '^PORT=' .env && sed -i 's/^PORT=.*/PORT=3010/' .env || echo 'PORT=3010' >> .env

# Nginx proxy to 3010
cat > /etc/nginx/sites-available/avilla <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name 86.48.28.141 avilla.local;

    client_max_body_size 8m;

    location /uploads/ {
        alias /var/www/avilla/uploads/;
        access_log off;
        expires 30d;
    }

    location / {
        proxy_pass http://127.0.0.1:3010;
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

# Prefer path-based if default_server conflict: use dedicated port 8088 as well
cat > /etc/nginx/sites-available/avilla-port <<'NGINX'
server {
    listen 8088;
    listen [::]:8088;
    server_name _;
    client_max_body_size 8m;

    location /uploads/ {
        alias /var/www/avilla/uploads/;
        access_log off;
        expires 30d;
    }

    location / {
        proxy_pass http://127.0.0.1:3010;
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
ln -sf /etc/nginx/sites-available/avilla-port /etc/nginx/sites-enabled/avilla-port
# Remove default_server claim if our previous config had it
nginx -t && systemctl reload nginx

# Update NEXTAUTH_URL to port 8088 for reliable access without host conflict
sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL="http://86.48.28.141:8088"|' .env

pm2 delete avilla 2>/dev/null || true
pm2 start npm --name avilla --cwd /var/www/avilla -- start
pm2 save
sleep 3
pm2 status avilla
curl -s -o /dev/null -w "APP %{http_code}\n" http://127.0.0.1:3010/ || true
curl -s -o /dev/null -w "NGINX8088 %{http_code}\n" http://127.0.0.1:8088/ || true
ss -lntp | grep -E '3010|8088' || true
echo DONE
