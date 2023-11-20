import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { createNotification } from "./notificationsCrud.js";

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/products");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export const createProduct = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(404).json({ message: "JOB ID not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const { name, email } = req.body;
    const review = "Completed";

    const freelancer = await User.findOne({ name: name });
    if (!freelancer) {
      return res
        .status(400)
        .json({ message: "Freelancer name not provided from body" });
    }

    upload.array("files")(req, res, async function (err) {
      if (err) {
        return res.status(500).json({ message: "File upload failed" });
      }

      const files = req.files.map((file) => ({
        filename: file.originalname,
        fileUrl: file.path,
      }));

      const product = {
        name,
        email,
        review,
        files,
      };

      job.product = product;
      job.stage = "UnderReview";

      await job.save();

      res.status(201).json(job.product);

      const userId = job.user;
      const notificationMessage = `Hello ${job.name}, ${freelancer} has submitted the project. Check your under reviews tab to verify and approve the project`;

      createNotification(userId, notificationMessage);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
});

export const downloadProductFile = asyncHandler(async (req, res) => {
  try {
    const { jobId, fileId } = req.params;

    if (!jobId) {
      return res.status(400).json({ message: "Job Id not provided" });
    }

    if (!fileId) {
      return res.status(400).json({ message: "File Id not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const file = job.product.files.id(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = file.fileUrl;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on the server" });
    }

    res.download(filePath, file.filename, async (error) => {
      if (error) {
        return res.status(500).json({ message: "File download failed" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404).json({ message: "Job not found" });
    }

    const { name, review } = req.body;

    if (req.files && req.files.length > 0) {
      if (job.product.files && job.product.files.length > 0) {
        for (const file of job.product.files) {
          await fs.unlink(file.fileUrl);
        }
      }

      // Upload new files
      const files = req.files.map((file) => ({
        title: file.originalname,
        fileUrl: file.path,
      }));

      job.product.files = files;
    }

    job.product.name = name;
    job.product.review = review;
    job.stage = "UnderReview";

    await job.save();

    res.status(200).json(job.product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Remove attached files
    if (job.product.files && job.product.files.length > 0) {
      for (const file of job.product.files) {
        await fs.unlink(file.fileUrl);
      }
    }

    // Clear the product information
    job.product = {};
    job.stage = "Ongoing";

    await job.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const viewProduct = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job.product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
