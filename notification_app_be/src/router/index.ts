import { Router } from "express";
import healthRouter from "./health.router";
import notificationsRouter from "./notifications.router";

const router = Router();

router.use(healthRouter);
router.use("/api/v1", notificationsRouter);

export default router;
