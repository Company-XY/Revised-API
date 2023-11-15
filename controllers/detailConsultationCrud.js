import asyncHandler from "express-async-handler";
import Detail from "../models/detailConsultation.js";
import User from "../models/User.js";

// Create a new details posting
export const createDetails = asyncHandler(async (req, res) => {
  try {
    const { role, name, email, businessName, prGoals, budget } = req.body;

    if (role === "Client") {
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email does not exist." });
      }

      const newDetail = await Detail.create({
        name,
        email,
        businessName,
        prGoals,
        budget,
      });

      return res.status(201).json(newDetail);
    } else {
      return res.status(403).json({
        message: "You do not have permission to create a details posting.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get all details postings
export const getAllDetails = asyncHandler(async (req, res) => {
  try {
    const details = await Detail.find();
    return res.status(200).json(details);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get one detail posting by ID
export const getOneDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await Detail.findById(id);
    if (!detail) {
      return res.status(404).json({ message: "Detail not found." });
    }
    return res.status(200).json(detail);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update a details posting by ID
export const updateDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await Detail.findById(id);

    if (!detail) {
      return res.status(404).json({ message: "Detail not found." });
    }

    detail.businessName = req.body.businessName || detail.businessName;
    detail.prGoals = req.body.prGoals || detail.prGoals;
    detail.budget = req.body.budget || detail.budget;
    detail.stage = req.body.stage || detail.stage;

    const updatedDetail = await detail.save();
    return res.status(200).json(updatedDetail);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Delete a details posting by ID
export const deleteDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await Detail.findByIdAndDelete(id);
    if (!detail) {
      return res.status(404).json({ message: "Detail not found." });
    }
    return res.status(200).json({ message: "Detail deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//=============USER DETAILS====================

export const getUserDetails = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const userDetails = await Detail.find({ email });

    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
