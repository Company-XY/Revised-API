import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createProduct,
  updateProduct,
  viewProduct,
  deleteProduct,
  uploadProductFiles,
  downloadProductFile,
} from "../controllers/Product.js";

import { approveJob, disputeJob } from "../controllers/productFunctions.js";

import { updateJobFiles } from "../controllers/jobFiles.js";
import { updateBidFiles } from "../controllers/bidFiles.js";

import { downloadJobFile } from "../controllers/jobFiles.js";

import {
  getAllJobs,
  createJob,
  getSingleJob,
  updateJob,
  deleteJob,
} from "../controllers/Jobs.js";

const router = express.Router();

router.get("/jobs", protect, getAllJobs);
router.get("/jobs/:id", protect, getSingleJob);
router.get("/jobs/:jobId/download/:fileId", protect, downloadJobFile);

router.post("/jobs/post", protect, createJob);
router.patch("/jobs/:jobId/files", protect, updateJobFiles);

router.patch("/job/:jobId/bids/:bidId/files", protect, updateBidFiles);

router.patch("/jobs/update/:id", protect, updateJob);

router.delete("/jobs/delete/:id", protect, deleteJob);

//---------------------

router.post("/jobs/:jobId/submit", protect, createProduct);
router.patch("/jobs/:jobId/files/product", protect, uploadProductFiles);
router.patch("/jobs/:jobId/update", protect, updateProduct);
router.get("/jobs/:jobId/product", protect, viewProduct);
router.delete("/jobs/:jobId/delete", protect, deleteProduct);
router.get("/jobs/:jobId/files/:fileId", protect, downloadProductFile);

//---------------------------------------

router.patch("/jobs/:jobId/approve", protect, approveJob);
router.patch("/jobs/:jobId/dispute", protect, disputeJob);

export default router;
