import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Job from "../models/Job.js";
import User from "../models/User.js";

//Multer configuration---------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

//The end------------------------------------------------------------------------------------

export const getAllJobs = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//-----------------------------------------------------------------------------//
export const createJob = asyncHandler(async (req, res) => {
  try {
    const {
      role,
      title,
      services,
      description,
      user_email,
      name,
      skills,
      budget,
      duration,
    } = req.body;

    const user = await User.findOne({ email: user_email });

    if (!user) {
      return res.status(400).json({
        message: "User not found..",
      });
    }

    if (role !== "Client") {
      return res.status(400).json({
        message: "Only users with the role 'Client' can create a job.",
      });
    }

    const newJob = await Job.create({
      user: user._id,
      name,
      user_email,
      title,
      services,
      description,
      skills,
      budget,
      duration,
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const createJob2 = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      services,
      description,
      user_email,
      name,
      skills,
      budget,
      duration,
    } = req.body;

    const user = await User.findOne({ email: user_email });

    if (!user) {
      return res.status(400).json({
        message: "User not found..",
      });
    }

    if (user.role !== "Client") {
      return res.status(400).json({
        message: "Only users with the role 'Client' can create a job.",
      });
    }

    const multerUpload = upload.array("files", 10);

    multerUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed" });
      }

      const files = req.files.map((file) => ({
        title: file.originalname,
        fileUrl: file.path,
      }));

      const newJob = await Job.create({
        user: user._id,
        name,
        user_email,
        title,
        services,
        description,
        skills,
        budget,
        duration,
        files,
      });

      res.status(201).json(newJob);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//----------------------------------------------------------------------------
export const getSingleJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//=--------------------------------------------------------------------------
export const updateJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJob = await Job.findById(id);

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user && req.user._id.toString() !== updatedJob.user.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this job" });
    }

    const multerUpload = upload.array("files", 5);

    multerUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed" });
      }

      updatedJob.title = req.body.title || updatedJob.title;
      updatedJob.services = req.body.services || updatedJob.services;
      updatedJob.description = req.body.description || updatedJob.description;
      updatedJob.skills = req.body.skills || updatedJob.skills;
      updatedJob.budget = req.body.budget || updatedJob.budget;
      updatedJob.duration = req.body.duration || updatedJob.duration;

      if (req.files) {
        const newFiles = req.files.map((file) => ({
          title: file.originalname,
          fileUrl: file.path,
        }));
        updatedJob.files = updatedJob.files.concat(newFiles);
      }

      await updatedJob.save();

      res.status(200).json(updatedJob);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const deleteJob = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await Job.findById(id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user && req.user._id.toString() !== deletedJob.user.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this job" });
    }

    await deletedJob.remove();

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Download job files....

//router.get("/jobs/:id/download/:fileId", downloadJobFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    const filePath = path.join(__dirname, file.fileUrl);

    res.download(filePath, file.title);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


