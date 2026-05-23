import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import prisma from "./lib/prisma.js";
import { requestLogger } from "./middleware/logger.js";
import { shortenUrl } from "./controllers/url.controller.js";
import { redirectToOriginalUrl } from "./controllers/url.controller.js";

dotenv.config();

const app = express();

// ── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// ── URL shortener routes ─────────────────────────────────────────────────────
// POST /api/url/shorten  — create a short URL
app.post("/api/url/shorten", shortenUrl);

// GET /:shortCode  — redirect to the original URL
app.get("/:shortCode", redirectToOriginalUrl);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
