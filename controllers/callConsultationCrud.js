import asyncHandler from "express-async-handler";
import Call from "../models/callConsultation.js";
import User from "../models/User.js";

//Create Call
export const createCall = asyncHandler(async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      businessName,
      prGoals,
      budget,
      time,
      date,
      time2,
      date2,
    } = req.body;

    if (role === "Client") {
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist." });
      }

      const newCall = await Call.create({
        name,
        email,
        phone,
        businessName,
        prGoals,
        budget,
        time,
        date,
        time2,
        date2,
      });

      return res.status(201).json(newCall);
    } else {
      return res.status(403).json({
        message: "You do not have permission to create a call posting.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get all call postings
export const getAllCalls = asyncHandler(async (req, res) => {
  try {
    const calls = await Call.find();
    return res.status(200).json(calls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get one call posting by ID
export const getOneCall = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findById(id);
    if (!call) {
      return res.status(404).json({ message: "Call not found." });
    }
    return res.status(200).json(call);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update a call posting by ID
export const updateCall = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findById(id);

    if (!call) {
      return res.status(404).json({ message: "Call not found." });
    }

    call.phone = req.body.phone || call.phone;
    call.businessName = req.body.businessName || call.businessName;
    call.prGoals = req.body.prGoals || call.prGoals;
    call.budget = req.body.budget || call.budget;
    call.stage = req.body.stage || call.stage;
    call.time = req.body.time || call.time;
    call.time2 = req.body.time2 || call.time2;
    call.date = req.body.date || call.date;
    call.date2 = req.body.date2 || call.date2;

    const updatedCall = await call.save();
    return res.status(200).json(updatedCall);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Delete a call posting by ID
export const deleteCall = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const call = await Call.findByIdAndDelete(id);
    if (!call) {
      return res.status(404).json({ message: "Call not found." });
    }
    return res.status(200).json({ message: "Call deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//=============USER CALLS====================

export const getUserCalls = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const userCalls = await Call.find({ email });

    res.status(200).json(userCalls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
