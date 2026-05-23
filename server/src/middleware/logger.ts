import { Request, Response, NextFunction } from "express";

/**
 * requestLogger
 *
 * Logs every incoming HTTP request with:
 *  - HTTP method
 *  - Route / path
 *  - Response status code
 *  - Response time in milliseconds
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  // Capture the original `res.json` so we can measure after the response is sent
  const originalJson = res.json.bind(res);

  res.json = (body: unknown) => {
    const duration = Date.now() - start;
    const method = req.method;
    const path = req.originalUrl;
    const status = res.statusCode;

    console.log(
      `[${new Date().toISOString()}] ${method} ${path} → ${status} (${duration}ms)`,
    );

    return originalJson(body);
  };

  next();
}
