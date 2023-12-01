import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { createNotification } from "./notificationsCrud.js";

export const approveJob = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const freelancerEmail = job.assignedTo;
    const freelancer = await User.findOne({ email: freelancerEmail });

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    const name = freelancer.name;
    const escrow = 0.9 * job.finalPrice;

    if (freelancer.escrowBalance < escrow) {
      return res.status(400).json({ message: "Insufficient escrow balance" });
    }

    freelancer.escrowBalance -= escrow;
    freelancer.currentBalance += escrow;

    job.stage = "Complete";

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await freelancer.save({ session });
      await job.save({ session });

      await session.commitTransaction();
      session.endSession();

      const userId = freelancer._id;
      const notificationMessage = `Hello ${name}, The job "${job.title}" has been approved by the client. Ksh. ${escrow} has been added to your account balance`;

      createNotification(userId, notificationMessage);

      res.status(200).json({ message: "Job approved and marked as complete." });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const disputeJob = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.stage = "Disputed";

    await job.save();

    const freelancerEmail = job.assignedTo;
    const freelancer = await User.findOne({ email: freelancerEmail });
    if (!freelancer) {
      return res
        .status(400)
        .json({ message: "Freelancer not found, try again" });
    }

    const id = freelancer._id;

    res.status(200).json({ message: "Job disputed." });
    const userId = id;
    const notificationMessage = `Hello ${freelancer.name}, The project: ${job.title} has been disputed, Check the project to verify!`;

    await createNotification(userId, notificationMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const leaveReview = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { review } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.review = review;
    await job.save();

    res.status(200).json({ message: "Review submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const updateFreelancerRating = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { freelancerRating } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (freelancerRating && freelancerRating >= 1 && freelancerRating <= 5) {
      job.freelancerRating = freelancerRating;
      await job.save();

      res
        .status(200)
        .json({ message: "Freelancer rating updated successfully." });
    } else {
      return res.status(400).json({ message: "Invalid rating value" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
