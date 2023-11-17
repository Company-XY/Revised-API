import asyncHandler from "express-async-handler";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { createNotification } from "./notificationsCrud.js";

export const awardBid = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const bidId = req.params.bidId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.id(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found on this job" });
    }

    if (bid.status !== "Pending") {
      return res.status(400).json({ message: "Bid cannot be awarded" });
    }

    const client = await User.findOne({ email: job.user_email });
    const freelancer = await User.findOne({ email: bid.email });

    if (!client || !freelancer) {
      return res
        .status(404)
        .json({ message: "Client or Freelancer not found" });
    }

    const finalPrice = bid.price;

    if (client.currentBalance < finalPrice) {
      return res.status(400).json({
        message: "Insufficient funds. Ensure account balance is enough",
      });
    }

    // Update the bid and job details
    job.bids.forEach((otherBid) => {
      if (otherBid.status === "Pending") {
        otherBid.status = "Cancelled";
      }
    });

    job.assignedTo = bid.email;
    job.finalPrice = finalPrice;
    job.stage = "Ongoing";
    bid.status = "Ongoing";

    const escrowAmount = 0.9 * finalPrice; // 90% for the freelancer
    const platformFee = 0.1 * finalPrice; // 10% platform fee

    client.currentBalance -= finalPrice;
    freelancer.escrowBalance += escrowAmount;

    const userId = freelancer._id;
    const notificationMessage = `Hello ${freelancer.name}, You've been assigned a job: ${job.title}. Ksh. ${escrowAmount} has been added to your escrow balance`;

    createNotification(userId, notificationMessage);

    await job.save();
    await client.save();
    await freelancer.save();

    res.status(200).json({
      message:
        "Bid awarded, status changed to ongoing, funds put to escrow, job assigned to freelancer and notification sent",
      awardedBid: bid,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error);
  }
});

export const cancelBid = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const bidId = req.params.bidId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.id(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found on this job" });
    }

    if (bid.status !== "Ongoing") {
      return res.status(400).json({ message: "Bid cannot be canceled" });
    }

    const clientEmail = job.user_email;
    const client = await User.findOne({ email: clientEmail });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const freelancer = await User.findOne({ email: bid.email });

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    const jobBudget = bid.price;
    const platformFee = 0.1 * jobBudget;

    // Refund the client the full amount (jobBudget + platformFee)
    //Up for discussion whether the platform fee should be refunded
    client.currentBalance += jobBudget + platformFee;
    freelancer.escrowBalance -= jobBudget;

    bid.status = "Canceled";
    job.status = "Pending";

    await job.save();
    await client.save();
    await freelancer.save();

    res.status(200).json({
      message: "Bid canceled and status changed to pending",
      canceledBid: bid,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
