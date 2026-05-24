import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import prisma from "./lib/prisma.js";
import { requestLogger } from "./middleware/logger.js";
import { shortenUrl } from "./controllers/url.controller.js";
import { redirectToOriginalUrl } from "./controllers/url.controller.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ── Scalar API Documentation ───────────────────────────────────────────────────
// `@scalar/api-reference` exports a Vue component (not an Express middleware).
// For an Express server, serve a small HTML page that boots Scalar in the browser.
app.get("/openapi.yaml", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../openapi.yaml"));
});

app.get("/docs", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html>
  <head>
    <title>API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { height: 100%; margin: 0; }
      #app { height: 100%; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', { url: '/openapi.yaml' })
    </script>
  </body>
</html>`);
});

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
