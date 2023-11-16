import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const createNotification = asyncHandler(async (userId, message) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newNotification = {
      message: message,
      timestamp: new Date(),
      read: false,
    };

    user.notifications.push(newNotification);
    await user.save();
  } catch (error) {
    throw new Error(error.message);
  }
});

export const getAllUserNotifications = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exist, or invalid user ID" });
    }

    const notifications = user.notifications;

    if (notifications.length === 0) {
      return res
        .status(200)
        .json({ message: "No user notifications at the moment" });
    }

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getNotificationById = asyncHandler(async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exist, or invalid user ID" });
    }

    const notification = user.notifications.id(notificationId);

    if (!notification) {
      return res
        .status(404)
        .json({ message: "Notification not found for the user" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const deleteOldNotificationsForAllUsers = asyncHandler(
  async (req, res) => {
    try {
      const thirtyTwoDaysAgo = new Date();
      thirtyTwoDaysAgo.setDate(thirtyTwoDaysAgo.getDate() - 32);

      const result = await User.updateMany(
        { "notifications.timestamp": { $lt: thirtyTwoDaysAgo } },
        { $pull: { notifications: { timestamp: { $lt: thirtyTwoDaysAgo } } } }
      );

      res.status(200).json({
        message: `Deleted ${result.n} old notifications for all users.`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
