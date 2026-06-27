var mqtt = require("mqtt");
const config = require("./../config");
const fs = require("fs");

const MQTT_ENV = config.services.MQTT;

function readIfExists(path) {
  try {
    return fs.readFileSync(path);
  } catch {
    return null;
  }
}

const caPath = process.env.MQTT_CA_PATH || "./ca.crt";
const certPath = process.env.MQTT_CERT_PATH || "./client.crt";
const keyPath = process.env.MQTT_KEY_PATH || "./client.key";

var options = {
  clientId: "mqttjs_" + Math.random().toString(16).slice(2, 8),
  rejectUnauthorized: process.env.MQTT_TLS_INSECURE !== "false",
  username: MQTT_ENV.USERNAME || undefined,
  password: MQTT_ENV.PASSWORD || undefined,
  qos: 2,
  port: Number(MQTT_ENV.PORT),
  clean: true,
};

const ca = readIfExists(caPath);
const cert = readIfExists(certPath);
const key = readIfExists(keyPath);

if (ca) options.ca = [ca];
if (cert) options.cert = cert;
if (key) options.key = key;

if (process.env.MQTT_TLS_INSECURE === "true") {
  options.rejectUnauthorized = false;
}

const URI = `mqtts://${MQTT_ENV.HOST}`;
console.log("MQTT:" + URI);

const client = mqtt.connect(URI, options);

client.on("connect", function () {
  console.log("[MQTT] Init: Connected");
});

client.on("error", function (error) {
  console.log("[MQTT] Error: OCURRIÓ UN PROBLEMA: " + error);
});

client.MQTTOptions = options;
module.exports = client;
