#!/bin/bash
set -e

UPDATE_FRONTEND=${1:-"true"}
UPDATE_BACKEND=${2:-"true"}

APP_DIR=/DATA/Apps/Magaza_Ziyaret_Formu

if [ "$UPDATE_FRONTEND" = "true" ]; then
  echo "=== Magaza Frontend build ediliyor ==="
  cd "$APP_DIR/hrbp-app"
  rm -rf node_modules package-lock.json
  npm install
  npm run build
fi

if [ "$UPDATE_BACKEND" = "true" ]; then
  echo "=== Magaza Backend güncelleniyor ==="

  # pm2 yoksa kur
  if ! command -v pm2 &> /dev/null; then
    echo "pm2 bulunamadı, kuruluyor..."
    npm install -g pm2
  fi

  cd "$APP_DIR/backend"
  rm -rf node_modules package-lock.json
  npm install --omit=dev

  # Veritabanı yoksa seed çalıştır
  if [ ! -f "$APP_DIR/backend/hrbp.sqlite" ]; then
    echo "=== Veritabanı seed ediliyor ==="
    node seed.js
  fi

  if pm2 list | grep -q "magaza-backend"; then
    pm2 reload magaza-backend
  else
    pm2 start server.js \
      --name magaza-backend \
      --env production
  fi
  pm2 save
fi

echo "=== Magaza Nginx yeniden başlatılıyor ==="
sudo docker stop magaza-nginx && sudo docker rm magaza-nginx || true
sudo docker run -d \
  --name magaza-nginx \
  --restart unless-stopped \
  --add-host=host-gateway:host-gateway \
  -p 3003:80 \
  -v "$APP_DIR/hrbp-app/dist:/usr/share/nginx/html" \
  -v "$APP_DIR/nginx/default.conf:/etc/nginx/conf.d/default.conf" \
  nginx:alpine

echo "=== Magaza hazır ==="
