import multer from "multer";
import fs from "fs";
import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage }).array("files", 10);

export const updateJobFiles = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(404).json({ message: "ID not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    upload(req, res, async (err) => {
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

        job.files = job.files.concat(uploadedFiles);
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
});

export const downloadJobFile = asyncHandler(async (req, res) => {
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

    const file = job.files.id(fileId);

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
