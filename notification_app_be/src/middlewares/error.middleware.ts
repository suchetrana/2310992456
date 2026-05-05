import type { NextFunction, Request, Response } from "express";
import { safeLog } from "../utils/safe-log";

export async function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const message = err instanceof Error ? err.message : "Unknown error";
  void safeLog("backend", "error", "middleware", message);

  res.status(500).json({ message: "Internal server error" });
}
