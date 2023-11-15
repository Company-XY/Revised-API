import AWS from "aws-sdk";
import multer from "multer";
import fs from "fs";
import util from "util";
import dotenv from "dotenv";
import Job from "../models/Job.js";

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

export const updateBidFiles = async (req, res) => {
  try {
    const { bidId, jobId } = req.params;
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
        const fileContent = fs.readFileSync(file.path);

        const params = {
          Bucket: "trialassist",
          Key: file.originalname,
          Body: fileContent,
        };

        const data = await s3.upload(params).promise();

        newFiles.push({
          title: file.originalname,
          fileUrl: data.Location,
        });

        fs.unlinkSync(file.path);
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
