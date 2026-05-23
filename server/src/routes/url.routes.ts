import { Router } from "express";
import { shortenUrl, redirectToOriginalUrl } from "../controllers/url.controller.js";

const router = Router();

/**
 * POST /api/url/shorten
 * Body: { "url": "https://example.com" }
 */
router.post("/shorten", shortenUrl);

/**
 * GET /:shortCode
 * Redirects to the original URL and increments the click counter.
 */
router.get("/:shortCode", redirectToOriginalUrl);

export default router;
