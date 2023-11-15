import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Job from "../models/Job.js";

export const getPortfolio = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Invalid user id" });
    }

    const portfolio = user.sampleWork;

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getJobsDone = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobsCompleted = await Job.find({
      assignedTo: email,
      stage: "Complete",
      "bids.status": "Completed",
    });

    if (jobsCompleted.length === 0) {
      return res.status(404).json({ message: "No completed jobs by the user" });
    }

    res.status(200).json(jobsCompleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
