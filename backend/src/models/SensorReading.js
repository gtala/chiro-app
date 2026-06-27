import mongoose from "mongoose";

const sensorReadingSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    rawPayload: { type: String },
    receivedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const SensorReading = mongoose.model("SensorReading", sensorReadingSchema);
