import multer from "multer";
import Job from "../models/Job.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/products/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage }).array("files", 20);

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

    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const uploadedFiles = req.files.map((file) => ({
        filename: file.filename,
        fileUrl: file.path,
      }));

      job.product.files.push(...uploadedFiles);
      await job.save();

      res.status(200).json({
        message: "Files uploaded successfully to product",
        files: uploadedFiles,
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
