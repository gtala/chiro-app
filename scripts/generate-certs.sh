#!/usr/bin/env sh
set -eu

CERT_DIR="${1:-./mosquitto/certs}"
DAYS=825

mkdir -p "$CERT_DIR"

if [ "${FORCE_REGEN:-0}" != "1" ] && [ -f "$CERT_DIR/server.crt" ] && [ -f "$CERT_DIR/server.key" ] && [ -f "$CERT_DIR/ca.crt" ]; then
  echo "Certificados ya existen en $CERT_DIR (FORCE_REGEN=1 para regenerar)"
  exit 0
fi

echo "Generando certificados autofirmados para MQTTS en $CERT_DIR..."

# CA
openssl req -new -x509 -days "$DAYS" -extensions v3_ca \
  -keyout "$CERT_DIR/ca.key" -out "$CERT_DIR/ca.crt" \
  -subj "/CN=Chiro Local CA/O=Chiro/C=AR" \
  -nodes

# Server key + CSR
openssl req -new -nodes \
  -keyout "$CERT_DIR/server.key" -out "$CERT_DIR/server.csr" \
  -subj "/CN=localhost/O=Chiro/C=AR"

# SAN: localhost, Docker, VM local y IP pública Oracle (ESP32 por MQTTS)
PUBLIC_IP="${BROKER_PUBLIC_IP:-129.151.116.139}"
cat > "$CERT_DIR/server.ext" <<EOF
subjectAltName=DNS:localhost,DNS:mosquitto,IP:127.0.0.1,IP:${PUBLIC_IP}
extendedKeyUsage=serverAuth,clientAuth
EOF

openssl x509 -req -in "$CERT_DIR/server.csr" \
  -CA "$CERT_DIR/ca.crt" -CAkey "$CERT_DIR/ca.key" -CAcreateserial \
  -out "$CERT_DIR/server.crt" -days "$DAYS" \
  -extfile "$CERT_DIR/server.ext"

chmod 644 "$CERT_DIR"/*.crt
chmod 600 "$CERT_DIR"/*.key

rm -f "$CERT_DIR/server.csr" "$CERT_DIR/server.ext" "$CERT_DIR/ca.srl"

echo "Listo: ca.crt, server.crt, server.key"
