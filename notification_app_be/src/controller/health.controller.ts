import type { Request, Response } from "express";
import { getHealthStatus } from "../service/health.service";
import { safeLog } from "../utils/safe-log";

export async function healthHandler(
  _req: Request,
  res: Response
): Promise<void> {
  void safeLog("backend", "info", "route", "health check");
  res.status(200).json(getHealthStatus());
}
