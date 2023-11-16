import multer from "multer";
import fs from "fs";
import path from "path";
import util from "util";
import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export const updateJobFiles = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const multerUpload = util.promisify(upload.array("files", 10));

    try {
      await multerUpload(req, res);

      const newFiles = [];

      for (const file of req.files) {
        const timestamp = new Date().getTime();
        const fileExtension = file.originalname.split(".").pop();
        const newFileName = `file_${timestamp}.${fileExtension}`;
        const filePath = path.join("public/files", newFileName);

        fs.renameSync(file.path, filePath);

        newFiles.push({
          title: file.originalname,
          fileUrl: filePath,
        });
      }

      job.files = job.files.concat(newFiles);
      await job.save();

      res.status(200).json({ message: "Job files updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "File upload or save operation failed" });
      console.error(error);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

export const downloadJobFile = asyncHandler(async (req, res) => {
  try {
    const { jobId, fileId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const file = job.files.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const timestamp = new Date().getTime();
    const fileExtension = file.title.split(".").pop();
    const newFileName = `file_${timestamp}.${fileExtension}`;
    const newFilePath = path.join("public/files", newFileName);

    fs.renameSync(file.fileUrl, newFilePath);

    res.download(newFilePath, file.title);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
});
