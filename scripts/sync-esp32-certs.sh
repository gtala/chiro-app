#!/usr/bin/env sh
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cp "$ROOT/mosquitto/certs/ca.crt" "$ROOT/sistema_embebido/main/broker_CA.crt"
echo "Copiado ca.crt -> sistema_embebido/main/broker_CA.crt"
