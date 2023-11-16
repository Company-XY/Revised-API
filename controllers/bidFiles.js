import multer from "multer";
import fs from "fs";
import path from "path";
import util from "util";
import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/bids");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export const updateBidFiles = async (req, res) => {
  try {
    const { bidId, jobId } = req.params;

    if (!jobId) {
      return res.status(404).json({ message: "JOB ID not provided" });
    }

    if (!bidId) {
      return res.status(404).json({ message: "BID ID not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.id(bidId);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const multerUpload = util.promisify(upload.array("files", 10));

    try {
      await multerUpload(req, res);

      const newFiles = [];

      for (const file of req.files) {
        const timestamp = new Date().getTime();
        const fileExtension = file.originalname.split(".").pop();
        const newFileName = `file_${timestamp}.${fileExtension}`;
        const filePath = path.join("public/bidFiles", newFileName);

        fs.renameSync(file.path, filePath);

        newFiles.push({
          title: file.originalname,
          fileUrl: filePath,
        });
      }

      bid.files = bid.files.concat(newFiles);
      await job.save();

      res.status(200).json({ message: "Bid files updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "File upload or save operation failed" });
      console.error(error);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

export const downloadBidFile = asyncHandler(async (req, res) => {
  try {
    const { jobId, bidId, fileId } = req.params;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID not provided" });
    }

    if (!bidId) {
      return res.status(400).json({ message: "Bid ID not provided" });
    }

    if (!fileId) {
      return res.status(400).json({ message: "File ID not provided" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const bid = job.bids.id(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const file = bid.files.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = file.fileUrl;

    res.download(filePath, file.title);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
