import User from "../models/User.js";
import asyncHandler from "express-async-handler";

export const createMessage = asyncHandler(async (req, res) => {
  try {
    const { from, to, message } = req.body;
    if (!from || !to || !message) {
      return res
        .status(400)
        .json({ message: "Provide all the details required" });
    }

    const sender = await User.findOne({ email: from });
    const receiver = await User.findOne({ email: to });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    const newMessage = {
      from: sender._id,
      to: receiver._id,
      message,
    };

    sender.messages.push(newMessage);
    receiver.messages.push(newMessage);

    await sender.save();
    await receiver.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Provide user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = user.messages;

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
