#!/usr/bin/env node
/**
 * Publica lectura BMP280 simulada al topic del TP por MQTTS.
 */
const fs = require("fs");
const mqtt = require("mqtt");

const broker = process.env.MQTT_HOST || "localhost";
const port = process.env.MQTT_PORT || 8883;
const topic = process.env.MQTT_TOPIC || "/PLANTA_BAJA/TEMPERATURA";

const options = {
  rejectUnauthorized: false,
  port,
  ca: fs.existsSync("./ca.crt") ? [fs.readFileSync("./ca.crt")] : undefined,
  cert: fs.existsSync("./client.crt") ? fs.readFileSync("./client.crt") : undefined,
  key: fs.existsSync("./client.key") ? fs.readFileSync("./client.key") : undefined,
};

const payload = {
  dispositivoId: 1,
  nombre: "ESP32_BMP280_TEMPERATURA",
  ubicacion: "Planta Baja",
  temperatura: 22.5 + Math.random() * 2,
  nodoId: 0,
};

const client = mqtt.connect(`mqtts://${broker}`, options);

client.on("connect", () => {
  client.publish(topic, JSON.stringify(payload), () => {
    console.log(`Publicado en ${topic}:`, payload);
    client.end();
  });
});

client.on("error", (err) => {
  console.error(err.message);
  process.exit(1);
});
