import asyncHandler from "express-async-handler";
import Call from "../models/callConsultation.js";
import User from "../models/User.js";

export const asignCall = asyncHandler(async (req, res) => {
  try {
    //Function to asing a call
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
