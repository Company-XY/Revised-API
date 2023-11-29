import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { createNotification } from "./notificationsCrud.js";

//multer..................start.........................

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/bids");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//--------------------------end-------------------------------

// CREATE BID
export const createBid = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { proposal, price, email, name } = req.body;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existingBid = job.bids.find((bid) => bid.email === email);

    if (existingBid) {
      existingBid.proposal = proposal;
      existingBid.price = price;
    } else {
      const newBid = {
        name,
        email,
        proposal,
        price,
      };
      job.bids.push(newBid);
      await job.save();

      const latestBid = job.bids[job.bids.length - 1]; // Accessing the last bid added
      const newBidId = latestBid._id; // Accessing the _id of the latest bid

      res.status(201).json({ _id: newBidId }); // Sending the _id of the latest bid in the response

      const userId = job.user;
      const notificationMessage = `Hello ${job.name}, ${name} has submitted a bid on your project: ${job.title}. Proceed to the job page to check it out!`;

      await createNotification(userId, notificationMessage);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET ALL BIDS FOR A JOB
export const getAllBids = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job.bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET SINGLE BID
export const getSingleBid = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const bidId = req.params.bidId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.find((b) => b._id.toString() === bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    res.status(200).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//UPDATE SINGLE BID

export const updateBid = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const bidId = req.params.bidId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.find((bid) => bid._id.toString() === bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Update bid fields here
    if (req.body.proposal) {
      bid.proposal = req.body.proposal;
    }
    if (req.body.price) {
      bid.price = req.body.price;
    }

    await job.save();

    res.status(200).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//DELETE BID...
export const deleteBid = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const bidId = req.params.bidId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bidIndex = job.bids.findIndex((bid) => bid._id.toString() === bidId);

    if (bidIndex === -1) {
      return res.status(404).json({ message: "Bid not found" });
    }

    job.bids.splice(bidIndex, 1);
    await job.save();

    res.status(200).json({ message: "Bid deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
