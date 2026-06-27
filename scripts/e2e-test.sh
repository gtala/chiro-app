#!/usr/bin/env sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Generando certificados MQTTS..."
chmod +x scripts/generate-certs.sh
./scripts/generate-certs.sh ./mosquitto/certs

echo "==> Levantando stack Docker..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

echo "==> Esperando backend..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:4000/health >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> Publicando mensaje MQTTS de prueba..."
docker compose exec -T backend node scripts/publish-test.js

sleep 2

echo "==> Verificando API..."
curl -sf http://localhost:4000/health
echo ""
curl -sf http://localhost:4000/api/readings/stats
echo ""
COUNT=$(curl -sf "http://localhost:4000/api/readings?limit=1" | python3 -c "import sys,json; print(json.load(sys.stdin)['count'])")
echo "Lecturas en MongoDB: $COUNT"

if [ "$COUNT" -gt 0 ]; then
  echo ""
  echo "Prueba punta a punta OK"
  echo "Frontend: http://localhost:3005"
  echo "MQTTS:    mqtts://localhost:8883"
  echo "WSS:      wss://localhost:8084"
else
  echo "ERROR: no se guardaron lecturas"
  exit 1
fi
