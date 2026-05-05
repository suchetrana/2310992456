import { Router } from "express";
import {
  listNotifications,
  markAllRead,
  markNotificationRead,
  streamNotifications,
  unreadCount
} from "../controller/notifications.controller";

const router = Router();

router.get("/notifications", listNotifications);
router.get("/notifications/unread-count", unreadCount);
router.patch("/notifications/:id/read", markNotificationRead);
router.post("/notifications/read-all", markAllRead);
router.get("/notifications/stream", streamNotifications);

export default router;
