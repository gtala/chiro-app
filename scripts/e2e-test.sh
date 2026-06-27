#!/usr/bin/env sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Certificados MQTTS..."
chmod +x scripts/generate-certs.sh
./scripts/generate-certs.sh ./mosquitto/certs

echo "==> Docker Compose up..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

echo "==> Esperando backend TP..."
for i in $(seq 1 40); do
  if curl -sf http://localhost:3000/status >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> Publicando temperatura simulada (ESP32)..."
docker compose exec -T backend node scripts/publish-tp-test.js

sleep 3

echo "==> Dispositivos:"
curl -sf http://localhost:3000/dispositivos | python3 -m json.tool | head -30

echo ""
echo "==> Frontend proxy OK?"
curl -sf http://localhost:3005/dispositivos >/dev/null && echo "Frontend: http://localhost:3005" || echo "Frontend aún no responde"
