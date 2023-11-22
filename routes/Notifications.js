import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createNotification,
  getNotificationById,
  getAllUserNotifications,
  deleteOldNotificationsForAllUsers,
  markNotificationAsRead,
} from "../controllers/notificationsCrud.js";

const router = express.Router();

//NOTIFICATIONS
router.post("/user/notification/create/:id", protect, createNotification);

router.get("/user/notifications/all/:id", protect, getAllUserNotifications);
router.get("/user/notifications/one/:id", protect, getNotificationById);

router.patch(
  "/user/:userId/notifications/:notificationId/read",
  protect,
  markNotificationAsRead
);

router.delete(
  "/user/notifications/delete",
  protect,
  deleteOldNotificationsForAllUsers
);

export default router;
