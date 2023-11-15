import express from "express";
import {
  createNotification,
  getNotificationById,
  getAllUserNotifications,
  deleteOldNotificationsForAllUsers,
} from "../controllers/notificationsCrud.js";

const router = express.Router();

//NOTIFICATIONS
router.post("/user/notification/create/:id", createNotification);

router.get("/user/notifications/all/:id", getAllUserNotifications);
router.get("/user/notifications/one/:id", getNotificationById);

router.delete("/user/notifications/delete", deleteOldNotificationsForAllUsers);

export default router;
