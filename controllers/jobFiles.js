import multer from "multer";
import fs from "fs";
import path from "path";
import util from "util";
import Job from "../models/Job.js";

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
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const multerUpload = util.promisify(upload.array("files", 10));

    try {
      await multerUpload(req, res);

      const newFiles = [];

      for (const file of req.files) {
        const filePath = path.join("public/files", file.originalname);

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

export const downloadJobFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const file = job.files.id(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = file.fileUrl;

    res.download(filePath, file.title);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};
