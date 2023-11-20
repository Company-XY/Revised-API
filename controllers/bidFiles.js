import multer from "multer";
import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/bids");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage }).array("files", 10);

export const updateBidFiles = asyncHandler(async (req, res) => {
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

    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      try {
        const bid = job.bids.id(bidId);
        if (!bid) {
          return res.status(404).json({ message: "Bid not found" });
        }

        const uploadedFiles = [];
        for (const file of req.files) {
          const { filename, path } = file;
          uploadedFiles.push({ filename, fileUrl: path });
        }

        bid.files = bid.files.concat(uploadedFiles);
        await job.save();

        res.status(200).json({
          message: "Bid files updated successfully",
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

    res.download(filePath, file.filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
