import { Request, Response } from "express";
import { createLink, findLinkByShortCode, LinkResponse } from "../services/url.service.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

function success(res: Response, data: unknown, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

function error(res: Response, message: string, status = 400): Response {
  return res.status(status).json({ success: false, error: message });
}

/**
 * shortenUrl
 *
 * POST /api/url/shorten
 *
 * Validates the incoming URL, delegates creation to the service layer,
 * and returns the short URL.
 */
export async function shortenUrl(req: Request, res: Response): Promise<Response> {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || url.trim() === "") {
      return error(res, "URL is required", 400);
    }

    // Basic URL validation
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return error(res, "Invalid URL format", 400);
    }

    // Only allow http and https schemes
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return error(res, "URL must start with http:// or https://", 400);
    }

    const link: LinkResponse = await createLink({
      originalUrl: parsed.toString(),
    });

    return success(res, {
      shortCode: link.shortCode,
      shortUrl: `${BASE_URL}/${link.shortCode}`,
      originalUrl: link.originalUrl,
    }, 201);
  } catch (err) {
    console.error("[/api/url/shorten] error:", err);
    return error(res, "Internal server error", 500);
  }
}

/**
 * redirectToOriginalUrl
 *
 * GET /:shortCode
 *
 * Looks up the link by shortcode, increments the click counter,
 * and issues a 302 redirect to the original URL.
 */
export async function redirectToOriginalUrl(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Express 5: req.params values can be string | string[]
    const rawShortCode = req.params.shortCode;
    const shortCode = Array.isArray(rawShortCode)
      ? rawShortCode[0]
      : rawShortCode;

    const link = await findLinkByShortCode(shortCode);

    if (!link) {
      // res.redirect returns void in Express 5 types; use status + json for 404
      res.status(404).json({ success: false, error: "Short URL not found" });
      return;
    }

    res.redirect(302, link.originalUrl);
  } catch (err) {
    console.error("[/:shortCode] error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
