import express from "express";
import {
  createNotification,
  getNotificationById,
  getAllUserNotifications,
  deleteOldNotificationsForAllUsers,
  markNotificationAsRead,
} from "../controllers/notificationsCrud.js";

const router = express.Router();

//NOTIFICATIONS
router.post("/user/notification/create/:id", createNotification);

router.get("/user/notifications/all/:id", getAllUserNotifications);
router.get("/user/notifications/one/:id", getNotificationById);

router.patch(
  "/user/:userId/notifications/:notificationId/read",
  markNotificationAsRead
);

router.delete("/user/notifications/delete", deleteOldNotificationsForAllUsers);

export default router;
