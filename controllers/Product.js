import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import Job from "../models/Job.js";
import User from "../models/User.js";

// Multer configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/products");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export const createProduct = asyncHandler(async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const { name } = req.body;
    const review = "Completed";

    upload.array("files")(req, res, async function (err) {
      if (err) {
        res.status(500).json({ message: "File upload failed" });
      }

      // Files have been successfully uploaded
      const files = req.files.map((file) => ({
        title: file.originalname,
        fileUrl: file.path,
      }));

      const product = {
        name,
        review,
        files,
      };

      job.product = product;
      job.stage = "UnderReview";

      await job.save();

      res.status(201).json(job.product);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const downloadProductFile = asyncHandler(async (req, res) => {
  try {
    const { jobId, fileId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const file = job.product.files.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const timestamp = new Date().getTime();
    const fileExtension = file.title.split(".").pop();
    const newFileName = `file_${timestamp}.${fileExtension}`;
    const newFilePath = path.join("public/productFiles", newFileName);

    fs.renameSync(file.fileUrl, newFilePath);

    res.download(newFilePath, file.title);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
