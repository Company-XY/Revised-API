import User from "../models/User.js";
import asyncHandler from "express-async-handler";

export const createMessage = asyncHandler(async (req, res) => {
  try {
    const { from, to, message } = req.body;

    const sender = await User.findById(from);
    const recipient = await User.findById(to);

    if (!sender || !recipient) {
      return res.status(404).json({ error: "Sender or recipient not found" });
    }

    const newMessage = {
      from: sender._id,
      to: recipient._id,
      message,
    };

    let conversation = sender.conversations.find(
      (conv) =>
        conv.participant.includes(sender._id) &&
        conv.participant.includes(recipient._id)
    );

    if (!conversation) {
      conversation = {
        participants: [sender._id, recipient._id],
        messages: [],
      };
      sender.conversations.push(conversation);
      recipient.conversations.push(conversation);
    }

    conversation.messages.push(newMessage);

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const fetchMessages = asyncHandler(async (req, res) => {
  try {
    const userId = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const conversations = user.conversations;

    res.status(200).json({ conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
