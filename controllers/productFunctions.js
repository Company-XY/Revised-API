import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import User from "../models/User.js";

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

    res.status(200).json({ message: "Job disputed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const leaveProductReview = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const review = req.body.review;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.product.review = review;

    await job.save();

    res.status(200).json({ message: "Product review added." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const addFreelancerRating = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const bidId = req.params.bidId;
    const rating = req.body.rating;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.id(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    bid.rating = rating;

    await job.save();

    res.status(200).json({ message: "Freelancer rating added." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
