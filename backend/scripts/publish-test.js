#!/usr/bin/env node
/**
 * Publica un mensaje de prueba por MQTTS.
 * Uso: npm run publish-test
 */
import fs from "fs";
import mqtt from "mqtt";

const broker = process.env.MQTT_BROKER_URL || "mqtts://localhost:8883";
const topic = process.env.MQTT_TEST_TOPIC || "chiro/sensores/temperatura";
const caPath = process.env.MQTT_CA_CERT;
const tlsInsecure = process.env.MQTT_TLS_INSECURE === "true";

const tls = caPath && fs.existsSync(caPath)
  ? { ca: fs.readFileSync(caPath), rejectUnauthorized: !tlsInsecure }
  : tlsInsecure
    ? { rejectUnauthorized: false }
    : {};

const client = mqtt.connect(broker, tls);

client.on("connect", () => {
  const payload = {
    deviceId: "sensor-001",
    temperatura: 23.5,
    humedad: 58,
    timestamp: new Date().toISOString(),
  };

  client.publish(topic, JSON.stringify(payload), () => {
    console.log(`Publicado por MQTTS en ${topic}:`, payload);
    client.end();
  });
});

client.on("error", (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
