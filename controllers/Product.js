import asyncHandler from "express-async-handler";
import multer from "multer";
import fs from "fs";
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

const uploadProductMiddleware = multer({ storage: storage });

export const uploadProductFiles = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(404).json({ message: "ID not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    uploadProductMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      try {
        const files = req.files;
        const uploadedFiles = [];
        for (const file of files) {
          const { filename, path } = file;
          uploadedFiles.push({ filename, fileUrl: path });
        }

        job.product.files = job.product.files.concat(uploadedFiles);
        await job.save();

        res.status(200).json({
          message: "Files uploaded successfully",
          files: uploadedFiles,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
});

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

    const product = {
      name,
      email,
      review,
    };

    job.product = product;
    job.stage = "UnderReview";

    await job.save();

    res.status(201).json(job.product);

    const userId = job.user;
    const notificationMessage = `Hello ${job.name}, ${freelancer.name} has submitted the project. Check your under reviews tab to verify and approve the project`;

    createNotification(userId, notificationMessage);
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

//=============================

const storageNew = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/products/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storageNew }).array("files", 20);

export const updateProductFiles = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(404).json({ message: "ID not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    upload(req, res, async (error) => {
      if (err) {
        return res.status(500).json({ error: error.message });
      }

      try {
        const files = req.files;
        const uploadedFiles = files.map((file) => ({
          filename: file.filename,
          fileUrl: file.path,
        }));

        job.product.files.push(...uploadedFiles);
        await job.save();

        res.status(200).json({
          message: "Files uploaded successfully",
          files: uploadedFiles,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
