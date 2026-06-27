import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { startMqttSubscriber } from "./mqtt/subscriber.js";
import readingsRouter from "./routes/readings.js";

async function main() {
  if (!env.mongodbUri) {
    throw new Error("Falta MONGODB_URI en las variables de entorno");
  }

  await mongoose.connect(env.mongodbUri);
  console.log("Conectado a MongoDB");

  startMqttSubscriber();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  app.use("/api/readings", readingsRouter);

  app.listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("Error al iniciar el backend:", err.message);
  process.exit(1);
});
