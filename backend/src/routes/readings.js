import { Router } from "express";
import { SensorReading } from "../models/SensorReading.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const topic = req.query.topic;

    const filter = topic ? { topic: { $regex: topic, $options: "i" } } : {};

    const readings = await SensorReading.find(filter)
      .sort({ receivedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      count: readings.length,
      data: readings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [total, latest] = await Promise.all([
      SensorReading.countDocuments(),
      SensorReading.findOne().sort({ receivedAt: -1 }).lean(),
    ]);

    res.json({
      total,
      latestReceivedAt: latest?.receivedAt ?? null,
      latestTopic: latest?.topic ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
